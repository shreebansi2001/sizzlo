import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import '../../core/theme/app_colors.dart';

class NotificationService extends GetxService {
  static NotificationService get to => Get.find<NotificationService>();

  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
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

      // Cancel any stale/queued notifications from system tray
      await _localNotifications.cancelAll();

      _initialized = true;
    } catch (e) {
      debugPrint('Notification service initialization error: $e');
    }

    // Periodic sync disabled to prevent continuous push notification spam
    return this;
  }

  /// Cancels all active system tray notifications
  Future<void> cancelAllNotifications() async {
    try {
      await _localNotifications.cancelAll();
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

  /// Schedules VIP table booking reminders before 30 minutes and before 15 minutes
  void scheduleBookingReminders({
    required String outlet,
    required String time,
    required int guests,
    required String bookingReference,
  }) {
    // 1. Immediate confirmation notification
    showNotification(
      id: 9001,
      title: '👑 Table Reserved & Deposit Confirmed!',
      body: 'Table for $guests at $outlet ($time) is booked! Reminders set for 30m & 15m prior.',
      payload: '/billing',
    );

    final reminder30Title = '🍽️ Table Reminder · 30 Mins Left';
    final reminder30Body = 'Your reserved table at $outlet ($time) will be ready in 30 minutes! Valet & host desk are ready.';

    final reminder15Title = '✨ Almost Dining Time · 15 Mins Left';
    final reminder15Body = 'Only 15 minutes left until your booking at $outlet ($guests guests). Tap here to view booking info & settle bill!';

    // Calculate duration to target booking time
    final targetTime = _parseBookingDateTime(time);
    final now = DateTime.now();

    if (targetTime != null) {
      final diff = targetTime.difference(now);
      if (diff.inMinutes > 30) {
        // Real-time schedule: 30 minutes prior
        final delay30 = diff - const Duration(minutes: 30);
        Timer(delay30, () {
          showNotification(
            id: 9030,
            title: reminder30Title,
            body: reminder30Body,
            payload: '/billing',
          );
        });

        // Real-time schedule: 15 minutes prior
        final delay15 = diff - const Duration(minutes: 15);
        Timer(delay15, () {
          showNotification(
            id: 9015,
            title: reminder15Title,
            body: reminder15Body,
            payload: '/billing',
          );
        });
        return;
      }
    }

    // Interactive Demo / Testing Timers (fires in 12s and 25s so the user can immediately experience the reminders looking great)
    Timer(const Duration(seconds: 12), () {
      showNotification(
        id: 9030,
        title: reminder30Title,
        body: reminder30Body,
        payload: '/billing',
      );
    });

    Timer(const Duration(seconds: 25), () {
      showNotification(
        id: 9015,
        title: reminder15Title,
        body: reminder15Body,
        payload: '/billing',
      );
    });
  }

  DateTime? _parseBookingDateTime(String timeStr) {
    try {
      final now = DateTime.now();
      DateTime date = now;
      if (timeStr.toLowerCase().contains('tomorrow')) {
        date = now.add(const Duration(days: 1));
      }
      final match = RegExp(r'(\d{1,2}):(\d{2})\s*(AM|PM)', caseSensitive: false).firstMatch(timeStr);
      if (match != null) {
        int hour = int.parse(match.group(1)!);
        final int minute = int.parse(match.group(2)!);
        final isPm = match.group(3)!.toUpperCase() == 'PM';
        if (isPm && hour < 12) hour += 12;
        if (!isPm && hour == 12) hour = 0;
        return DateTime(date.year, date.month, date.day, hour, minute);
      }
    } catch (_) {}
    return null;
  }
}
