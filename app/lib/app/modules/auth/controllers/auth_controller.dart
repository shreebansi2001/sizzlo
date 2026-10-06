import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../routes/app_routes.dart';
import '../../../data/models/member_model.dart';
import '../../../data/services/api_service.dart';
import '../../../core/values/app_constants.dart';
import '../../home/controllers/home_controller.dart';
import '../../../data/services/local_storage_service.dart';

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
    if (isLoading.value) return;
    final phone = phoneController.text.trim().replaceAll(RegExp(r'\D'), '');
    if (phone.isEmpty || phone.length != 10) {
      errorMessage.value = 'Please enter a valid 10-digit Indian mobile number.';
      return;
    }
    errorMessage.value = '';
    currentPhone.value = phone;
    AppConstants.currentUserMobile = phone;

    isLoading.value = true;
    try {
      final res = await _apiService.requestOtp(phone);
      startResendTimer(force: true);
      Get.snackbar(
        'OTP Sent Successfully',
        res['message']?.toString() ?? 'Please enter the OTP sent to your WhatsApp',
        backgroundColor: const Color(0xFF001D4A),
        colorText: const Color(0xFFE8B84A),
        duration: const Duration(seconds: 4),
      );
      Get.toNamed(AppRoutes.VERIFY, arguments: {'phone': phone});
    } catch (e) {
      errorMessage.value = 'Failed to send OTP. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  void quickDemoLogin() async {
    await LocalStorageService.saveUserSession(
      mobile: '9825012345',
      membershipId: 'YSM-2024-04821',
      name: 'Rahul Mehta',
      tier: 'SIGNATURE',
    );
    AppConstants.currentUserMobile = '9825012345';
    AppConstants.currentMembershipId = 'YSM-2024-04821';
    AppConstants.currentUserName = 'Rahul Mehta';
    Get.offAllNamed(AppRoutes.HOME);
  }

  void startResendTimer({bool force = false}) {
    if (!force && _countdownTimer != null && _countdownTimer!.isActive) {
      return;
    }
    _countdownTimer?.cancel();
    resendTimer.value = 30;
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (resendTimer.value > 0) {
        resendTimer.value--;
      } else {
        timer.cancel();
      }
    });
  }

  void resendOtp() async {
    if (isLoading.value) return;
    if (resendTimer.value == 0) {
      isLoading.value = true;
      try {
        startResendTimer(force: true);
        final res = await _apiService.requestOtp(currentPhone.value);
        Get.snackbar(
          'OTP Resent',
          res['message']?.toString() ?? 'A new OTP has been sent to +91 ${currentPhone.value}',
          backgroundColor: const Color(0xFF141917),
          colorText: const Color(0xFFE8B84A),
        );
      } finally {
        isLoading.value = false;
      }
    }
  }

  void verifyOtp() async {
    if (isLoading.value) return;
    final enteredOtp = otpController.text.trim();
    if (enteredOtp.isEmpty) {
      Get.snackbar('OTP Required', 'Please enter the 6-digit OTP sent to WhatsApp',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }
    isLoading.value = true;
    try {
      final authResult = await _apiService.verifyOtp(currentPhone.value, enteredOtp);
      if (authResult != null && authResult['member'] != null) {
        final MemberModel member = authResult['member'] is MemberModel
            ? authResult['member']
            : MemberModel.defaultProfile();
        await LocalStorageService.saveUserSession(
          mobile: member.mobile.isNotEmpty ? member.mobile : currentPhone.value,
          membershipId: member.membershipId,
          name: member.fullName,
          tier: member.subscriptionTier,
        );
        AppConstants.currentUserMobile = member.mobile.isNotEmpty ? member.mobile : currentPhone.value;
        AppConstants.currentMembershipId = member.membershipId;
        AppConstants.currentUserName = member.fullName.isNotEmpty ? member.fullName : 'Guest';

        if (Get.isRegistered<HomeController>()) {
          Get.find<HomeController>().member.value = member;
          Get.find<HomeController>().activePlan.value = member.planId;
          Get.find<HomeController>().loadDashboardData();
        }
        Get.snackbar(
          'Welcome to Sizzlo',
          'Logged in as ${member.fullName} (${member.membershipId})',
          backgroundColor: const Color(0xFF0E3B32),
          colorText: const Color(0xFFE8B84A),
          duration: const Duration(seconds: 3),
        );

        // Directly route to HOME upon successful authentication
        Get.offAllNamed(AppRoutes.HOME);
      } else {
        Get.snackbar('Verification Failed', 'Invalid or expired OTP. Please try again.',
            backgroundColor: Colors.redAccent, colorText: Colors.white);
      }
    } catch (e) {
      Get.snackbar('Error', 'Verification could not be completed. Please try again.',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
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
