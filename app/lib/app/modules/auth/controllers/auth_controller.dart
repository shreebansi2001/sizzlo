import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../routes/app_routes.dart';

class AuthController extends GetxController {
  final mobileController = TextEditingController(text: '+91 98250 12345');
  final otpController = TextEditingController();

  final RxBool isOtpSent = false.obs;
  final RxBool isLoading = false.obs;
  final RxInt resendTimer = 30.obs;

  void sendOtp() async {
    if (mobileController.text.trim().isEmpty) {
      Get.snackbar('Error', 'Please enter your mobile number',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    isLoading.value = true;
    await Future.delayed(const Duration(milliseconds: 900));
    isLoading.value = false;
    isOtpSent.value = true;
    otpController.text = '1234'; // Pre-fill demo OTP

    Get.snackbar('OTP Sent', 'Demo OTP: 1234 sent to ${mobileController.text}',
        backgroundColor: const Color(0xFF001D4A), colorText: const Color(0xFFE8B84A));
  }

  void verifyOtp() async {
    if (otpController.text.trim().isEmpty) {
      Get.snackbar('Error', 'Please enter the 4-digit OTP',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    isLoading.value = true;
    await Future.delayed(const Duration(milliseconds: 900));
    isLoading.value = false;

    Get.offAllNamed(AppRoutes.HOME);
  }

  @override
  void onClose() {
    mobileController.dispose();
    otpController.dispose();
    super.onClose();
  }
}
