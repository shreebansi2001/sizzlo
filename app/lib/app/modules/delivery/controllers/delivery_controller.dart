import 'package:flutter/material.dart';
import 'package:get/get.dart';

class DeliveryController extends GetxController {
  final RxInt selectedServiceTab = 0.obs; // 0: Direct Delivery, 1: ODC Catering

  final nameController = TextEditingController(text: 'Rahul Mehta');
  final mobileController = TextEditingController(text: '+91 98250 12345');
  final guestsController = TextEditingController(text: '150');
  final eventDateController = TextEditingController(text: '28 Oct 2026');

  final RxBool isSubmitting = false.obs;

  void submitCateringInquiry() async {
    isSubmitting.value = true;
    await Future.delayed(const Duration(milliseconds: 800));
    isSubmitting.value = false;

    Get.snackbar(
      'Inquiry Submitted',
      'Our Executive Banquet Manager will call you within 2 hours.',
      backgroundColor: const Color(0xFF001D4A),
      colorText: const Color(0xFFE8B84A),
    );
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
