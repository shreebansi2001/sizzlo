import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../routes/app_routes.dart';
import '../../../data/models/member_model.dart';
import '../../../data/services/api_service.dart';
import '../../../core/values/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../home/controllers/home_controller.dart';
import '../../../data/services/local_storage_service.dart';

class AuthController extends GetxController {
  final ApiService _apiService = ApiService();

  final phoneController = TextEditingController();
  final otpController = TextEditingController();

  final RxString errorMessage = ''.obs;
  final RxString registeredSuccessMessage = ''.obs;
  final RxBool isLoading = false.obs;
  final RxBool isResending = false.obs;
  final RxInt resendTimer = 60.obs;
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
        final ph = args['phone'].toString().replaceAll(RegExp(r'\D'), '');
        phoneController.text = ph;
        currentPhone.value = ph;
        AppConstants.currentUserMobile = ph;
        startResendTimer(force: true);
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
      // 1. Check if user is registered in MySQL first
      final exists = await _apiService.checkMemberExists(phone);
      if (!exists) {
        isLoading.value = false;
        _showNotRegisteredPrompt(phone);
        return;
      }

      // 2. User exists -> request OTP and navigate to VerifyView
      final res = await _apiService.requestOtp(phone);
      if (res['success'] == true) {
        startResendTimer(force: true);
        Get.snackbar(
          'OTP Sent',
          'A verification code has been dispatched to +91 $phone on WhatsApp',
          backgroundColor: const Color(0xFF0F261E),
          colorText: const Color(0xFF4EE3B8),
          icon: const Icon(Icons.mark_chat_read_rounded, color: Color(0xFF4EE3B8)),
          duration: const Duration(seconds: 3),
          snackPosition: SnackPosition.TOP,
        );
        Get.toNamed(AppRoutes.VERIFY, arguments: {'phone': phone});
      } else if (res['userNotFound'] == true) {
        _showNotRegisteredPrompt(phone);
      } else {
        errorMessage.value = res['message']?.toString() ?? 'Failed to send OTP. Please try again.';
      }
    } catch (e) {
      errorMessage.value = 'Failed to send OTP. Please try again.';
    } finally {
      isLoading.value = false;
    }
  }

  void _showNotRegisteredPrompt(String phone) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.fromLTRB(24, 14, 24, 28),
        decoration: BoxDecoration(
          color: const Color(0xFF111614),
          borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
          border: Border(
            top: BorderSide(color: AppColors.flame.withOpacity(0.55), width: 1.5),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.8),
              blurRadius: 32,
              offset: const Offset(0, -10),
            ),
          ],
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Center drag handle
            Center(
              child: Container(
                width: 44,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),

            // Header: Flame Avatar Badge + Title
            Row(
              children: [
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    gradient: AppColors.flameGradient,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.flame.withOpacity(0.35),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: const Center(
                    child: Icon(Icons.person_add_rounded, color: Color(0xFF070A09), size: 24),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Account Not Found',
                        style: GoogleFonts.playfairDisplay(
                          color: Colors.white,
                          fontSize: 21,
                          fontWeight: FontWeight.bold,
                          letterSpacing: -0.3,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Row(
                        children: [
                          Icon(Icons.phone_iphone_rounded, size: 13, color: AppColors.flame),
                          const SizedBox(width: 4),
                          Text(
                            '+91 $phone',
                            style: GoogleFonts.plusJakartaSans(
                              color: AppColors.flame,
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.08),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              'Unregistered',
                              style: GoogleFonts.plusJakartaSans(
                                color: Colors.white70,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 18),
            Text(
              'No Yanki VIP dining account was found for this number. Complete your quick profile to unlock dining privileges, free birthday rewards, and exclusive coupons.',
              style: GoogleFonts.plusJakartaSans(
                color: AppColors.textSecondary,
                fontSize: 13,
                height: 1.45,
              ),
            ),

            const SizedBox(height: 16),
            // Privilege highlight pill
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 11),
              decoration: BoxDecoration(
                color: const Color(0xFF171E1A),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.white.withOpacity(0.06)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.stars_rounded, color: AppColors.flame, size: 18),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Includes 12 Welcome Vault Coupons & Birthday Privileges',
                      style: GoogleFonts.plusJakartaSans(
                        color: Colors.white,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            // Actions: Cancel & Flame Gradient Sign Up Button
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      side: BorderSide(color: Colors.white.withOpacity(0.18)),
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    ),
                    onPressed: () => Get.back(),
                    child: Text(
                      'Cancel',
                      style: GoogleFonts.plusJakartaSans(
                        color: AppColors.textSecondary,
                        fontWeight: FontWeight.w600,
                        fontSize: 13,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: AppColors.flameGradient,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.flame.withOpacity(0.35),
                          blurRadius: 16,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        Get.back();
                        Get.toNamed(AppRoutes.REGISTER, arguments: {'phone': phone});
                      },
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Sign Up Now',
                            style: GoogleFonts.plusJakartaSans(
                              color: const Color(0xFF070A09),
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          const SizedBox(width: 6),
                          const Icon(Icons.arrow_forward_rounded, color: Color(0xFF070A09), size: 16),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
      isScrollControlled: true,
    );
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
    resendTimer.value = 60;
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (resendTimer.value > 0) {
        resendTimer.value--;
      } else {
        timer.cancel();
      }
    });
  }

  void resendOtp() async {
    if (isResending.value || isLoading.value) return;
    final phone = (Get.arguments is Map && Get.arguments['phone'] != null)
        ? Get.arguments['phone'].toString().replaceAll(RegExp(r'\D'), '')
        : (currentPhone.value.isNotEmpty ? currentPhone.value : AppConstants.currentUserMobile);

    if (phone.isEmpty) {
      Get.snackbar(
        'Phone Missing',
        'Mobile number not found. Please go back and retry.',
        backgroundColor: const Color(0xFF141917),
        colorText: AppColors.error,
      );
      return;
    }

    isResending.value = true;
    try {
      final res = await _apiService.resendOtp(phone);
      if (res['success'] == true) {
        startResendTimer(force: true); // Reset back to 60s
        Get.snackbar(
          'WhatsApp OTP Resent',
          res['message']?.toString() ?? 'A new verification code has been dispatched to +91 $phone on WhatsApp.',
          backgroundColor: const Color(0xFF0F261E),
          colorText: const Color(0xFF4EE3B8),
          icon: const Icon(Icons.mark_chat_read_rounded, color: Color(0xFF4EE3B8)),
          duration: const Duration(seconds: 4),
          snackPosition: SnackPosition.TOP,
        );
      } else {
        Get.snackbar(
          'Failed to Resend',
          res['message']?.toString() ?? 'Could not send OTP. Please try again.',
          backgroundColor: const Color(0xFF141917),
          colorText: AppColors.error,
          duration: const Duration(seconds: 3),
        );
      }
    } catch (_) {
      Get.snackbar(
        'Error',
        'Unable to resend OTP. Please check server connection.',
        backgroundColor: const Color(0xFF141917),
        colorText: AppColors.error,
      );
    } finally {
      isResending.value = false;
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

    final phoneToVerify = (Get.arguments is Map && Get.arguments['phone'] != null)
        ? Get.arguments['phone'].toString().replaceAll(RegExp(r'\D'), '')
        : (currentPhone.value.isNotEmpty ? currentPhone.value : AppConstants.currentUserMobile);

    if (phoneToVerify.isEmpty) {
      Get.snackbar('Error', 'Mobile number missing. Please go back and retry.',
          backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    isLoading.value = true;
    try {
      final authResult = await _apiService.verifyOtp(phoneToVerify, enteredOtp);
      if (authResult != null && authResult['member'] != null) {
        final MemberModel member = authResult['member'] is MemberModel
            ? authResult['member']
            : MemberModel.defaultProfile();
        await LocalStorageService.saveUserSession(
          mobile: member.mobile.isNotEmpty ? member.mobile : currentPhone.value,
          membershipId: member.membershipId,
          name: member.fullName,
          tier: member.subscriptionTier,
          profilePic: member.profilePictureUrl,
        );
        AppConstants.currentUserMobile = member.mobile.isNotEmpty ? member.mobile : currentPhone.value;
        AppConstants.currentMembershipId = member.membershipId;
        if (member.fullName.isNotEmpty && member.fullName != 'Guest') {
          AppConstants.currentUserName = member.fullName;
        }
        if (member.profilePictureUrl.isNotEmpty) {
          AppConstants.currentUserProfilePic = member.profilePictureUrl;
        }

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

        // If already subscribed, navigate directly to Home; otherwise show Subscription Plans
        if (member.isSubscriber) {
          Get.offAllNamed(AppRoutes.HOME);
        } else {
          Get.offAllNamed(AppRoutes.PLANS, arguments: {'fromLogin': true});
        }
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
