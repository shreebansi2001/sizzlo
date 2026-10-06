import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/auth_controller.dart';
import '../../../core/theme/app_colors.dart';

class VerifyView extends GetView<AuthController> {
  const VerifyView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Get phone number from arguments
    final String phone = (Get.arguments is Map && Get.arguments['phone'] != null)
        ? Get.arguments['phone'].toString()
        : (controller.currentPhone.value.isNotEmpty
            ? controller.currentPhone.value
            : '9825012345');

    final String maskedPhone = phone.length >= 4
        ? '••••••${phone.substring(phone.length - 4)}'
        : '••••••9999';

    // Start countdown if not running
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (controller.resendTimer.value <= 0) {
        controller.startResendTimer();
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 36),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 12),
              // Shield Icon in Orange Circle
              Container(
                width: 52,
                height: 52,
                decoration: const BoxDecoration(
                  color: AppColors.flame,
                  shape: BoxShape.circle,
                ),
                child: const Center(
                  child: Icon(
                    Icons.verified_user_rounded,
                    color: Color(0xFF070A09),
                    size: 26,
                  ),
                ),
              ),
              const SizedBox(height: 24),

              // Title
              Text(
                'Verify Your Number',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 34,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 8),

              // Subtitle with masked phone
              Text(
                'Enter the 6-digit OTP sent to +91 $maskedPhone.',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 10),

              // WhatsApp OTP Delivery Notice Banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F261E),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: const Color(0xFF1E4D3C)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.chat_bubble_outline_rounded, size: 14, color: Color(0xFF4EE3B8)),
                    const SizedBox(width: 8),
                    Flexible(
                      child: Text(
                        'WhatsApp OTP dispatched · Demo fallback: 1234',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 11,
                          fontWeight: FontWeight.w600,
                          color: const Color(0xFF4EE3B8),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Card Container
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF141917),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    const SizedBox(height: 8),
                    // 6-digit OTP Boxes
                    _OtpInputRow(controller: controller),

                    // Error text
                    Obx(() {
                      if (controller.errorMessage.value.isEmpty) {
                        return const SizedBox.shrink();
                      }
                      return Padding(
                        padding: const EdgeInsets.only(top: 14),
                        child: Text(
                          controller.errorMessage.value,
                          style: GoogleFonts.plusJakartaSans(
                            color: AppColors.error,
                            fontSize: 12,
                          ),
                        ),
                      );
                    }),

                    const SizedBox(height: 22),

                    // Resend Timer Row
                    Obx(() {
                      final timer = controller.resendTimer.value;
                      return Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            "Didn't receive the OTP? ",
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 12,
                              color: AppColors.textSecondary,
                            ),
                          ),
                          GestureDetector(
                            onTap: timer == 0 ? controller.resendOtp : null,
                            child: Text(
                              timer > 0
                                  ? 'Resend in 0:${timer.toString().padLeft(2, '0')}'
                                  : 'Resend OTP',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 12,
                                fontWeight: FontWeight.bold,
                                color: AppColors.flame,
                              ),
                            ),
                          ),
                        ],
                      );
                    }),

                    const SizedBox(height: 22),

                    // Verify & Continue Button
                    Obx(() {
                      final hasSixDigits =
                          controller.otpController.text.length == 6;
                      return SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: () {
                            if (controller.otpController.text.isEmpty) {
                              // Demo convenience: auto-fill 123456
                              controller.otpController.text = '123456';
                            }
                            controller.verifyOtp();
                          },
                          style: ElevatedButton.styleFrom(
                            backgroundColor: hasSixDigits
                                ? AppColors.flame
                                : const Color(0xFF8B4B0A),
                            foregroundColor: hasSixDigits
                                ? const Color(0xFF070A09)
                                : const Color(0xFFDFC27D),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                          child: controller.isLoading.value
                              ? const SizedBox(
                                  height: 20,
                                  width: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    Text(
                                      'Verify & Continue',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 15,
                                        fontWeight: FontWeight.bold,
                                        color: hasSixDigits
                                            ? const Color(0xFF070A09)
                                            : const Color(0xFFE2BE6A),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Icon(
                                      Icons.arrow_forward_rounded,
                                      size: 18,
                                      color: hasSixDigits
                                          ? const Color(0xFF070A09)
                                          : const Color(0xFFE2BE6A),
                                    ),
                                  ],
                                ),
                        ),
                      );
                    }),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _OtpInputRow extends StatefulWidget {
  final AuthController controller;

  const _OtpInputRow({Key? key, required this.controller}) : super(key: key);

  @override
  State<_OtpInputRow> createState() => _OtpInputRowState();
}

class _OtpInputRowState extends State<_OtpInputRow> {
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _focusNode.requestFocus();
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => FocusScope.of(context).requestFocus(_focusNode),
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Invisible actual textfield
          Opacity(
            opacity: 0.0,
            child: SizedBox(
              width: 1,
              height: 1,
              child: TextField(
                focusNode: _focusNode,
                controller: widget.controller.otpController,
                keyboardType: TextInputType.number,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(6),
                ],
                onChanged: (_) {
                  setState(() {});
                },
              ),
            ),
          ),
          // 6 Custom Rounded Boxes
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: List.generate(6, (index) {
              final text = widget.controller.otpController.text;
              final hasChar = index < text.length;
              final char = hasChar ? text[index] : '';
              final isCurrent = index == text.length;

              return Container(
                width: 44,
                height: 52,
                decoration: BoxDecoration(
                  color: AppColors.inputBackground,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(
                    color: isCurrent
                        ? AppColors.flame
                        : (hasChar
                            ? AppColors.gold.withOpacity(0.6)
                            : AppColors.inputBorder),
                    width: isCurrent ? 1.5 : 1.0,
                  ),
                ),
                child: Center(
                  child: Text(
                    char,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
