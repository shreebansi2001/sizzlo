import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../routes/app_routes.dart';
import '../../../data/services/api_service.dart';
import '../../../core/values/app_constants.dart';
import '../../home/controllers/home_controller.dart';

class AuthController extends GetxController {
  final ApiService _apiService = ApiService();

  final phoneController = TextEditingController();
  final otpController = TextEditingController();

  final RxString errorMessage = ''.obs;
  final RxString registeredSuccessMessage = ''.obs;
  final RxBool isLoading = false.obs;
  final RxInt resendTimer = 23.obs;
  final RxString currentPhone = ''.obs;
  Timer? _countdownTimer;

  @override
  void onInit() {
    super.onInit();
    // Check if coming from registration with registered flag
    if (Get.arguments != null && Get.arguments is Map) {
      final args = Get.arguments as Map;
      if (args['registered'] == true) {
        registeredSuccessMessage.value =
            'Details saved. Verify your phone number to complete registration.';
      }
      if (args['phone'] != null) {
        phoneController.text = args['phone'].toString();
      }
    }
  }

  void onContinueLogin() async {
    var phone = phoneController.text.trim().replaceAll(RegExp(r'\D'), '');
    if (phone.isEmpty) {
      phone = '9825012345';
      phoneController.text = phone;
    }
    if (phone.length != 10) {
      errorMessage.value = 'Enter a valid 10-digit Indian mobile number.';
      return;
    }
    errorMessage.value = '';
    currentPhone.value = phone;
    AppConstants.currentUserMobile = phone;

    isLoading.value = true;
    try {
      final res = await _apiService.requestOtp(phone);
      startResendTimer();
      Get.snackbar(
        'OTP Sent Successfully',
        res['message']?.toString() ?? 'Please enter demo OTP: 1234',
        backgroundColor: const Color(0xFF001D4A),
        colorText: const Color(0xFFE8B84A),
        duration: const Duration(seconds: 4),
      );
      Get.toNamed(AppRoutes.VERIFY, arguments: {'phone': phone});
    } finally {
      isLoading.value = false;
    }
  }

  void quickDemoLogin() {
    Get.offAllNamed(AppRoutes.HOME);
  }

  void startResendTimer({bool force = false}) {
    if (!force && _countdownTimer != null && _countdownTimer!.isActive) {
      return;
    }
    _countdownTimer?.cancel();
    resendTimer.value = 23;
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (resendTimer.value > 0) {
        resendTimer.value--;
      } else {
        timer.cancel();
      }
    });
  }

  void resendOtp() async {
    if (resendTimer.value == 0) {
      startResendTimer(force: true);
      final res = await _apiService.requestOtp(currentPhone.value);
      Get.snackbar(
        'OTP Resent',
        res['message']?.toString() ?? 'A new OTP has been sent to +91 ${currentPhone.value}',
        backgroundColor: const Color(0xFF141917),
        colorText: const Color(0xFFE8B84A),
      );
    }
  }

  void verifyOtp() async {
    final enteredOtp = otpController.text.trim().isEmpty ? '1234' : otpController.text.trim();
    isLoading.value = true;
    try {
      final authResult = await _apiService.verifyOtp(currentPhone.value, enteredOtp);
      if (authResult != null && authResult['member'] != null) {
        final member = authResult['member'];
        if (Get.isRegistered<HomeController>()) {
          Get.find<HomeController>().member.value = member;
          Get.find<HomeController>().loadDashboardData();
        }
        Get.snackbar(
          'Welcome to Sizzlo',
          'Logged in as ${member.fullName} (${member.membershipId})',
          backgroundColor: const Color(0xFF001D4A),
          colorText: const Color(0xFFE8B84A),
          duration: const Duration(seconds: 3),
        );
      }
      // After OTP, navigate to Subscription Plans screen
      Get.offAllNamed(AppRoutes.PLANS);
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    _countdownTimer?.cancel();
    phoneController.dispose();
    otpController.dispose();
    super.onClose();
  }
}
