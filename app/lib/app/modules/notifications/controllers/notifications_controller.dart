import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/notification_item_model.dart';
import '../../../data/services/api_service.dart';

class NotificationsController extends GetxController {
  final ApiService _apiService = ApiService();
  final RxList<NotificationItemModel> notifications = <NotificationItemModel>[].obs;
  final RxBool isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    loadNotifications();
  }

  Future<void> loadNotifications() async {
    isLoading.value = true;
    try {
      final list = await _apiService.getNotifications();
      notifications.assignAll(list);
    } finally {
      isLoading.value = false;
    }
  }

  void clearAll() {
    notifications.clear();
    Get.snackbar(
      'Notifications Cleared',
      'All notifications marked as read',
      backgroundColor: const Color(0xFF141917),
      colorText: const Color(0xFFE8B84A),
      duration: const Duration(seconds: 2),
    );
  }
}
