import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../core/theme/app_colors.dart';

/// A rich, pulsating animated badge displayed next to the profile and
/// notification icons on the home screen when the user has not subscribed.
class BlinkingUnsubscribedBadge extends StatefulWidget {
  final VoidCallback onTap;

  const BlinkingUnsubscribedBadge({
    Key? key,
    required this.onTap,
  }) : super(key: key);

  @override
  State<BlinkingUnsubscribedBadge> createState() => _BlinkingUnsubscribedBadgeState();
}

class _BlinkingUnsubscribedBadgeState extends State<BlinkingUnsubscribedBadge>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _pulseAnimation;
  late Animation<double> _glowAnimation;
  late Animation<double> _beaconAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat(reverse: true);

    _pulseAnimation = Tween<double>(begin: 0.96, end: 1.03).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _glowAnimation = Tween<double>(begin: 0.35, end: 0.95).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );

    _beaconAnimation = Tween<double>(begin: 0.2, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        final glowVal = _glowAnimation.value;
        final beaconVal = _beaconAnimation.value;
        final scaleVal = _pulseAnimation.value;

        return Transform.scale(
          scale: scaleVal,
          child: GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              widget.onTap();
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 7),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Color.lerp(
                      const Color(0xFF2C100B),
                      const Color(0xFF42150E),
                      glowVal,
                    )!,
                    Color.lerp(
                      const Color(0xFF1B0A06),
                      const Color(0xFF260D08),
                      glowVal,
                    )!,
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: Color.lerp(
                    const Color(0xFFFF5252),
                    const Color(0xFFFFB74D),
                    glowVal,
                  )!.withOpacity(0.55 + 0.4 * glowVal),
                  width: 1.3,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFF3D00).withOpacity(0.22 * glowVal),
                    blurRadius: 8 + (6 * glowVal),
                    spreadRadius: 0.5 * glowVal,
                  ),
                  BoxShadow(
                    color: AppColors.gold.withOpacity(0.18 * glowVal),
                    blurRadius: 12 * glowVal,
                    spreadRadius: 0.2,
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  // Blinking radar/beacon alert dot
                  Stack(
                    alignment: Alignment.center,
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFFFF5252).withOpacity(0.35 * beaconVal),
                        ),
                      ),
                      Container(
                        width: 7,
                        height: 7,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: Color.lerp(
                            const Color(0xFFFF3D00),
                            const Color(0xFFFF5252),
                            beaconVal,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFFFF1744).withOpacity(0.7 * beaconVal),
                              blurRadius: 4,
                              spreadRadius: 1,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 6),
                  const Text(
                    'Not Subscribed · Tap to Unlock VIP',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 10.5,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 0.3,
                    ),
                  ),
                  const SizedBox(width: 4),
                  Icon(
                    Icons.arrow_forward_ios_rounded,
                    color: Color.lerp(
                      Colors.white70,
                      AppColors.gold,
                      glowVal,
                    ),
                    size: 9,
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
