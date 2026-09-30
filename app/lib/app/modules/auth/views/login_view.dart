import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/auth_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../widgets/sizzlo_button.dart';

class LoginView extends GetView<AuthController> {
  const LoginView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 20),
              Center(
                child: Container(
                  width: 72,
                  height: 72,
                  decoration: BoxDecoration(
                    color: AppColors.primary,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.primary.withOpacity(0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: const Icon(Icons.restaurant_rounded, color: AppColors.gold, size: 36),
                ),
              ),
              const SizedBox(height: 32),
              Center(
                child: Text('Welcome to Sizzlo', style: AppTextStyles.displayMedium),
              ),
              const SizedBox(height: 8),
              Center(
                child: Text(
                  'Enter your registered mobile number to access your exclusive privileges',
                  textAlign: TextAlign.center,
                  style: AppTextStyles.bodyMedium,
                ),
              ),
              const SizedBox(height: 40),

              // Mobile Input
              Text('Mobile Number', style: AppTextStyles.titleMedium.copyWith(fontSize: 14)),
              const SizedBox(height: 8),
              TextField(
                controller: controller.mobileController,
                keyboardType: TextInputType.phone,
                decoration: InputDecoration(
                  prefixIcon: const Icon(Icons.phone_iphone_rounded, color: AppColors.primary),
                  hintText: '+91 98765 43210',
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: Colors.black.withOpacity(0.1)),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: BorderSide(color: Colors.black.withOpacity(0.1)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(16),
                    borderSide: const BorderSide(color: AppColors.primary, width: 1.5),
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // Obx Reactive OTP Input Area
              Obx(() {
                if (!controller.isOtpSent.value) {
                  return SizzloButton(
                    text: 'Send Verification OTP',
                    isLoading: controller.isLoading.value,
                    onPressed: controller.sendOtp,
                  );
                }

                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Enter 4-digit OTP', style: AppTextStyles.titleMedium.copyWith(fontSize: 14)),
                    const SizedBox(height: 8),
                    TextField(
                      controller: controller.otpController,
                      keyboardType: TextInputType.number,
                      maxLength: 4,
                      textAlign: TextAlign.center,
                      style: const TextStyle(fontSize: 22, letterSpacing: 10, fontWeight: FontWeight.bold),
                      decoration: InputDecoration(
                        hintText: '••••',
                        counterText: '',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(16),
                          borderSide: BorderSide(color: Colors.black.withOpacity(0.1)),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    SizzloButton(
                      text: 'Verify & Enter',
                      isGold: true,
                      isLoading: controller.isLoading.value,
                      onPressed: controller.verifyOtp,
                    ),
                    const SizedBox(height: 12),
                    Center(
                      child: TextButton(
                        onPressed: controller.sendOtp,
                        child: const Text('Resend Code', style: TextStyle(color: AppColors.primary)),
                      ),
                    ),
                  ],
                );
              }),

              const SizedBox(height: 30),
              Center(
                child: Text(
                  'Powered by Yanki Hospitality Group · VIP Access Only',
                  style: TextStyle(fontSize: 11, color: AppColors.textMuted),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
