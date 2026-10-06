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

    return PopScope(
      canPop: true,
      onPopInvokedWithResult: (didPop, result) {
        if (didPop) return;
        Get.back();
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        body: SafeArea(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 30),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Back Button
                GestureDetector(
                  onTap: () => Get.back(),
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: const Color(0xFF141917),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: AppColors.border),
                          ),
                          child: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 16),
                        ),
                        const SizedBox(width: 10),
                        Text(
                          'Change Phone Number',
                          style: GoogleFonts.plusJakartaSans(
                            color: AppColors.textSecondary,
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 8),
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
                      final isBusy = controller.isLoading.value;
                      final hasSixDigits =
                          controller.otpController.text.length == 6;
                      return SizedBox(
                        width: double.infinity,
                        height: 56,
                        child: ElevatedButton(
                          onPressed: isBusy
                              ? null
                              : () {
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
                            disabledBackgroundColor: const Color(0xFF553310),
                            foregroundColor: hasSixDigits
                                ? const Color(0xFF070A09)
                                : const Color(0xFFDFC27D),
                            elevation: 0,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                          child: isBusy
                              ? const SizedBox(
                                  height: 22,
                                  width: 22,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2.5,
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
                                            : const Color(0xFFDFC27D),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Icon(
                                      Icons.arrow_forward_rounded,
                                      size: 18,
                                      color: hasSixDigits
                                          ? const Color(0xFF070A09)
                                          : const Color(0xFFDFC27D),
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
      if (mounted) {
        _focusNode.requestFocus();
      }
    });
  }

  @override
  void dispose() {
    _focusNode.dispose();
    super.dispose();
  }

  void _onTapRow() {
    if (!_focusNode.hasFocus) {
      _focusNode.requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: _onTapRow,
      child: SizedBox(
        height: 60,
        child: Stack(
          alignment: Alignment.center,
          children: [
            // Visual 6 Custom Rounded Boxes
            IgnorePointer(
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(6, (index) {
                  final text = widget.controller.otpController.text;
                  final hasChar = index < text.length;
                  final char = hasChar ? text[index] : '';
                  final isCurrent = index == text.length && _focusNode.hasFocus;

                  return Container(
                    width: 46,
                    height: 56,
                    decoration: BoxDecoration(
                      color: AppColors.inputBackground,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isCurrent
                            ? AppColors.flame
                            : (hasChar
                                ? AppColors.gold.withOpacity(0.7)
                                : AppColors.inputBorder),
                        width: isCurrent ? 2.0 : 1.0,
                      ),
                    ),
                    child: Center(
                      child: Text(
                        char,
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                        ),
                      ),
                    ),
                  );
                }),
              ),
            ),

            // Real invisible full-width TextField that captures all tap events & keypresses
            Positioned.fill(
              child: TextField(
                focusNode: _focusNode,
                controller: widget.controller.otpController,
                keyboardType: TextInputType.number,
                autofocus: true,
                showCursor: false,
                enableInteractiveSelection: false,
                style: const TextStyle(color: Colors.transparent),
                cursorColor: Colors.transparent,
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  enabledBorder: InputBorder.none,
                  focusedBorder: InputBorder.none,
                  contentPadding: EdgeInsets.zero,
                  counterText: '',
                ),
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(6),
                ],
                onChanged: (val) {
                  setState(() {});
                  if (val.length == 6) {
                    widget.controller.verifyOtp();
                  }
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
