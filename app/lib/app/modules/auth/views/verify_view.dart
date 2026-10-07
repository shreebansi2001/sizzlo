import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/auth_controller.dart';
import '../../../core/theme/app_colors.dart';

class VerifyView extends StatefulWidget {
  const VerifyView({Key? key}) : super(key: key);

  @override
  State<VerifyView> createState() => _VerifyViewState();
}

class _VerifyViewState extends State<VerifyView> {
  late final AuthController controller;

  @override
  void initState() {
    super.initState();
    controller = Get.find<AuthController>();

    // Post-frame callback ensures Rx mutations only execute after the initial frame finishes building
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        controller.otpController.clear();
        controller.errorMessage.value = '';
        
        // Start fresh 60s countdown
        controller.startResendTimer(force: true);

        // Display welcome banner if freshly registered
        if (Get.arguments is Map && Get.arguments['registered'] == true) {
          final String phone = Get.arguments['phone']?.toString().replaceAll(RegExp(r'\D'), '') ?? '';
          Get.snackbar(
            'VIP Account Created!',
            'Verification code dispatched to +91 $phone on WhatsApp',
            backgroundColor: const Color(0xFF0F261E),
            colorText: const Color(0xFF4EE3B8),
            icon: const Icon(Icons.mark_chat_read_rounded, color: Color(0xFF4EE3B8)),
            duration: const Duration(seconds: 3),
            snackPosition: SnackPosition.TOP,
          );
        }
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    // Get phone number from arguments or controller
    final String phone = (Get.arguments is Map && Get.arguments['phone'] != null)
        ? Get.arguments['phone'].toString().replaceAll(RegExp(r'\D'), '')
        : (controller.currentPhone.value.isNotEmpty
            ? controller.currentPhone.value
            : '9825012345');

    final String maskedPhone = phone.length >= 4
        ? '••••••${phone.substring(phone.length - 4)}'
        : '••••••9999';

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
                // Shield Icon in Flame Circle
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
                          'WhatsApp OTP dispatched to registered mobile',
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

                      // Resend Timer / Action Button
                      Obx(() {
                        final timer = controller.resendTimer.value;
                        final isResending = controller.isResending.value;

                        if (timer > 0) {
                          final minutes = timer ~/ 60;
                          final seconds = timer % 60;
                          final formattedTime = '$minutes:${seconds.toString().padLeft(2, '0')}';

                          return Container(
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                            decoration: BoxDecoration(
                              color: const Color(0xFF0F1412),
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(color: Colors.white.withOpacity(0.06)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const Icon(Icons.timer_outlined, size: 14, color: AppColors.textSecondary),
                                const SizedBox(width: 8),
                                Text(
                                  "Didn't receive the OTP? ",
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 12,
                                    color: AppColors.textSecondary,
                                    fontWeight: FontWeight.w400,
                                  ),
                                ),
                                Text(
                                  'Resend in $formattedTime',
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.flame,
                                  ),
                                ),
                              ],
                            ),
                          );
                        }

                        // Timer ended (0s) -> Display prominent Resend OTP via WhatsApp button
                        return Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            color: const Color(0xFF0F261E),
                            border: Border.all(
                              color: const Color(0xFF25D366).withOpacity(0.5),
                              width: 1.2,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF25D366).withOpacity(0.15),
                                blurRadius: 14,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Material(
                            color: Colors.transparent,
                            child: InkWell(
                              onTap: isResending ? null : controller.resendOtp,
                              borderRadius: BorderRadius.circular(16),
                              child: Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                                child: Row(
                                  mainAxisAlignment: MainAxisAlignment.center,
                                  children: [
                                    if (isResending)
                                      const SizedBox(
                                        width: 18,
                                        height: 18,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF25D366)),
                                        ),
                                      )
                                    else
                                      const Icon(
                                        Icons.chat_bubble_outline_rounded,
                                        size: 18,
                                        color: Color(0xFF25D366),
                                      ),
                                    const SizedBox(width: 10),
                                    Text(
                                      isResending ? 'Dispatching WhatsApp OTP...' : 'Resend OTP via WhatsApp',
                                      style: GoogleFonts.plusJakartaSans(
                                        fontSize: 13,
                                        fontWeight: FontWeight.bold,
                                        color: const Color(0xFF25D366),
                                        letterSpacing: 0.2,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ),
                        );
                      }),

                      const SizedBox(height: 22),

                      // Verify & Continue Button
                      Obx(() {
                        final isBusy = controller.isLoading.value;
                        final hasSixDigits = controller.otpController.text.length == 6;
                        return SizedBox(
                          width: double.infinity,
                          height: 56,
                          child: ElevatedButton(
                            onPressed: isBusy
                                ? null
                                : () {
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
    _focusNode.addListener(_onStateChange);
    widget.controller.otpController.addListener(_onStateChange);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _focusNode.requestFocus();
      }
    });
  }

  void _onStateChange() {
    if (mounted) {
      setState(() {});
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onStateChange);
    widget.controller.otpController.removeListener(_onStateChange);
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
    final text = widget.controller.otpController.text;
    final bool hasFocus = _focusNode.hasFocus;

    return GestureDetector(
      behavior: HitTestBehavior.opaque,
      onTap: _onTapRow,
      child: Column(
        children: [
          SizedBox(
            height: 60,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // Visual 6 Custom Rounded Boxes with Active Glowing State & Blinking Cursor
                IgnorePointer(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: List.generate(6, (index) {
                      final hasChar = index < text.length;
                      final char = hasChar ? text[index] : '';
                      final isCurrent = index == text.length && hasFocus;

                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 180),
                        width: 46,
                        height: 56,
                        decoration: BoxDecoration(
                          color: isCurrent
                              ? const Color(0xFF1B231E)
                              : (hasChar
                                  ? const Color(0xFF141917)
                                  : AppColors.inputBackground),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isCurrent
                                ? AppColors.flame
                                : (hasChar
                                    ? AppColors.flame.withOpacity(0.85)
                                    : AppColors.inputBorder),
                            width: isCurrent ? 2.0 : 1.0,
                          ),
                          boxShadow: isCurrent
                              ? [
                                  BoxShadow(
                                    color: AppColors.flame.withOpacity(0.45),
                                    blurRadius: 12,
                                    spreadRadius: 1.5,
                                    offset: const Offset(0, 2),
                                  ),
                                ]
                              : (hasChar
                                  ? [
                                      BoxShadow(
                                        color: AppColors.flame.withOpacity(0.12),
                                        blurRadius: 6,
                                      ),
                                    ]
                                  : null),
                        ),
                        child: Center(
                          child: hasChar
                              ? Text(
                                  char,
                                  style: GoogleFonts.plusJakartaSans(
                                    fontSize: 22,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                )
                              : (isCurrent
                                  ? const _BlinkingCursor()
                                  : Container(
                                      width: 6,
                                      height: 6,
                                      decoration: BoxDecoration(
                                        color: Colors.white.withOpacity(0.15),
                                        shape: BoxShape.circle,
                                      ),
                                    )),
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
          const SizedBox(height: 10),
          // Subtle focus indicator helper cue
          Text(
            hasFocus ? 'Active — Enter WhatsApp code' : 'Tap boxes to type code',
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: hasFocus ? AppColors.flame.withOpacity(0.85) : AppColors.textSecondary.withOpacity(0.6),
            ),
          ),
        ],
      ),
    );
  }
}

class _BlinkingCursor extends StatefulWidget {
  const _BlinkingCursor({Key? key}) : super(key: key);

  @override
  State<_BlinkingCursor> createState() => _BlinkingCursorState();
}

class _BlinkingCursorState extends State<_BlinkingCursor> with SingleTickerProviderStateMixin {
  late final AnimationController _animController;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return FadeTransition(
      opacity: _animController,
      child: Container(
        width: 2.2,
        height: 24,
        decoration: BoxDecoration(
          color: AppColors.flame,
          borderRadius: BorderRadius.circular(2),
          boxShadow: [
            BoxShadow(
              color: AppColors.flame.withOpacity(0.8),
              blurRadius: 4,
            ),
          ],
        ),
      ),
    );
  }
}
