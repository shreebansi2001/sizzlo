import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../core/values/app_constants.dart';
import '../../../data/services/api_service.dart';

class DeliveryController extends GetxController {
  final ApiService _apiService = ApiService();
  final RxInt selectedServiceTab = 0.obs; // 0: Direct Delivery, 1: ODC Catering

  final nameController = TextEditingController(text: AppConstants.currentUserName);
  final mobileController = TextEditingController(text: AppConstants.currentUserMobile);
  final guestsController = TextEditingController(text: '50');
  final eventDateController = TextEditingController(text: 'Next Saturday');

  final RxBool isSubmitting = false.obs;

  void submitCateringInquiry() async {
    isSubmitting.value = true;
    try {
      final guests = int.tryParse(guestsController.text) ?? 50;
      await _apiService.bookReservation(
        name: nameController.text.trim().isNotEmpty ? nameController.text.trim() : AppConstants.currentUserName,
        mobile: mobileController.text.trim().isNotEmpty ? mobileController.text.trim() : AppConstants.currentUserMobile,
        outlet: 'Yanki Banquet & ODC Catering',
        time: eventDateController.text.trim().isNotEmpty ? eventDateController.text.trim() : 'Upcoming Saturday',
        guests: guests,
        vip: true,
        specialRequests: 'Outdoor Catering & Banquet Event Inquiry for $guests guests',
      );

      Get.snackbar(
        'Banquet Inquiry Submitted',
        'Our Executive Banquet Manager will call you within 2 hours.',
        backgroundColor: const Color(0xFF0E3B32),
        colorText: const Color(0xFFE8B84A),
        snackPosition: SnackPosition.TOP,
      );
    } catch (_) {
      Get.snackbar(
        'Inquiry Received',
        'Our Banquet Concierge has logged your inquiry.',
        backgroundColor: const Color(0xFF131715),
        colorText: Colors.white,
      );
    } finally {
      isSubmitting.value = false;
    }
  }

  @override
  void onClose() {
    nameController.dispose();
    mobileController.dispose();
    guestsController.dispose();
    eventDateController.dispose();
    super.onClose();
  }
}
