import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import 'api_service.dart';
import '../../modules/notifications/controllers/notifications_controller.dart';
import '../../core/theme/app_colors.dart';

class NotificationService extends GetxService {
  static NotificationService get to => Get.find<NotificationService>();

  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  final ApiService _apiService = ApiService();
  Timer? _syncTimer;
  final Set<int> _knownNotificationIds = <int>{};
  bool _initialized = false;

  Future<NotificationService> init() async {
    const AndroidInitializationSettings androidSettings =
        AndroidInitializationSettings('@mipmap/ic_launcher');

    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );

    try {
      await _localNotifications.initialize(
        settings: initSettings,
        onDidReceiveNotificationResponse: (NotificationResponse response) {
          // Open notifications page on notification tap
          if (Get.currentRoute != '/notifications') {
            Get.toNamed('/notifications');
          }
        },
      );

      // Create Android Notification Channel
      final AndroidNotificationChannel channel = const AndroidNotificationChannel(
        'sizzlo_channel',
        'Sizzlo Privilege Alerts',
        description: 'VIP dining privileges, bill receipts, and instant voucher alerts',
        importance: Importance.max,
        playSound: true,
        enableVibration: true,
      );

      await _localNotifications
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
          ?.createNotificationChannel(channel);

      // Request Android 13+ Notification Permission
      await _localNotifications
          .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
          ?.requestNotificationsPermission();

      _initialized = true;
    } catch (e) {
      debugPrint('Notification service initialization error: $e');
    }

    _startPeriodicSync();
    return this;
  }

  void _startPeriodicSync() {
    _syncTimer?.cancel();
    // Initial fetch to seed known IDs so user doesn't get flooded by old history
    _seedExistingIds();

    // Check for new notifications every 20 seconds
    _syncTimer = Timer.periodic(const Duration(seconds: 20), (timer) {
      checkForNewNotifications();
    });
  }

  Future<void> _seedExistingIds() async {
    try {
      final list = await _apiService.getNotifications();
      for (final n in list) {
        _knownNotificationIds.add(n.id);
      }
    } catch (_) {}
  }

  Future<void> checkForNewNotifications() async {
    try {
      final list = await _apiService.getNotifications();
      bool hasNew = false;

      for (final n in list) {
        if (!_knownNotificationIds.contains(n.id)) {
          _knownNotificationIds.add(n.id);
          hasNew = true;
          // Trigger System Notification & In-App Heads-up
          await showNotification(
            id: n.id,
            title: n.title,
            body: n.desc,
          );
        }
      }

      if (hasNew && Get.isRegistered<NotificationsController>()) {
        Get.find<NotificationsController>().loadNotifications();
      }
    } catch (_) {}
  }

  Future<void> showNotification({
    required int id,
    required String title,
    required String body,
    String? payload,
  }) async {
    // 1. Native System Notification (shows in status bar, lock screen, and dropdown)
    if (_initialized) {
      try {
        const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
          'sizzlo_channel',
          'Sizzlo Privilege Alerts',
          channelDescription: 'VIP dining privileges, bill receipts, and instant voucher alerts',
          importance: Importance.max,
          priority: Priority.high,
          ticker: 'ticker',
          color: Color(0xFFE8B84A),
          playSound: true,
          enableVibration: true,
        );

        const NotificationDetails details = NotificationDetails(
          android: androidDetails,
          iOS: DarwinNotificationDetails(
            presentAlert: true,
            presentBadge: true,
            presentSound: true,
          ),
        );

        await _localNotifications.show(
          id: id,
          title: title,
          body: body,
          notificationDetails: details,
          payload: payload ?? '/notifications',
        );
      } catch (e) {
        debugPrint('Could not trigger local native notification: $e');
      }
    }

    // 2. Foreground In-App Animated Toast
    try {
      Get.snackbar(
        title,
        body,
        icon: const Icon(Icons.notifications_active_rounded, color: AppColors.gold, size: 24),
        backgroundColor: const Color(0xFF131715),
        colorText: Colors.white,
        borderColor: AppColors.gold.withOpacity(0.4),
        borderWidth: 1.2,
        borderRadius: 16,
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        duration: const Duration(seconds: 4),
        onTap: (snack) {
          if (Get.currentRoute != '/notifications') {
            Get.toNamed('/notifications');
          }
        },
      );
    } catch (_) {}
  }

  @override
  void onClose() {
    _syncTimer?.cancel();
    super.onClose();
  }
}
