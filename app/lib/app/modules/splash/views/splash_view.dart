import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/splash_controller.dart';
import '../../../widgets/sizzlo_mascot_animated.dart';

class SplashView extends GetView<SplashController> {
  const SplashView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070A09),
      body: Stack(
        children: [
          // Ambient warm golden background glow on top-left
          Positioned(
            top: -40,
            left: -40,
            child: Container(
              width: 280,
              height: 280,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFFDF9E5B).withOpacity(0.12),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Ambient warm glow on bottom-right
          Positioned(
            bottom: 40,
            right: -40,
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    const Color(0xFF8F582E).withOpacity(0.10),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Center Main Content matching Image 1
          SafeArea(
            child: SizedBox(
              width: double.infinity,
              height: double.infinity,
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Spacer(flex: 3),

                  // Top Logo Badge Card matching Image 1
                  Container(
                    width: 140,
                    height: 72,
                    padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
                    decoration: BoxDecoration(
                      color: const Color(0xFF2E1C0F),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: const Color(0xFF6B4520),
                        width: 1.2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFDF9E5B).withOpacity(0.18),
                          blurRadius: 24,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Image.asset(
                        'assets/images/yanki-logo.png',
                        fit: BoxFit.contain,
                      ),
                    ),
                  ),

                  const SizedBox(height: 22),

                  // YANKI SIZZLERR title matching Image 1
                  Text(
                    'YANKI SIZZLERR',
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2.5,
                      color: const Color(0xFFDF9E5B),
                    ),
                  ),

                  const SizedBox(height: 6),

                  // EXCLUSIVE SUBSCRIPTION CLUB
                  Text(
                    'EXCLUSIVE SUBSCRIPTION CLUB',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2.8,
                      color: const Color(0xFFDF9E5B),
                    ),
                  ),

                  const SizedBox(height: 10),

                  // Dining · Rewards · Celebrations
                  Text(
                    'Dining · Rewards · Celebrations',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 12,
                      fontWeight: FontWeight.w500,
                      color: Colors.white.withOpacity(0.65),
                    ),
                  ),

                  const SizedBox(height: 3),

                  // Ahmedabad
                  Text(
                    'Ahmedabad',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.4),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Sizzlo Mascot with Animated Platter
                  const SizzloMascotAnimated(height: 110),

                  const SizedBox(height: 20),

                  // Pulsing 3 Dots Loading Indicator matching Image 1
                  const _PulsingDots(),

                  const Spacer(flex: 3),

                  // Footer: POWERED BY YANKI HOSPITALITY GROUP matching Image 1
                  Padding(
                    padding: const EdgeInsets.only(bottom: 16),
                    child: Text.rich(
                      TextSpan(
                        children: [
                          TextSpan(
                            text: 'POWERED BY ',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 9.5,
                              letterSpacing: 1.6,
                              color: Colors.white.withOpacity(0.35),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          TextSpan(
                            text: 'YANKI HOSPITALITY GROUP',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 9.5,
                              letterSpacing: 1.6,
                              color: const Color(0xFFDF9E5B),
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PulsingDots extends StatefulWidget {
  const _PulsingDots({Key? key}) : super(key: key);

  @override
  State<_PulsingDots> createState() => _PulsingDotsState();
}

class _PulsingDotsState extends State<_PulsingDots>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..repeat();
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
      builder: (context, _) {
        final t = _controller.value;
        return Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(3, (index) {
            final delay = index * 0.25;
            final phase = ((t - delay) % 1.0).clamp(0.0, 1.0);
            final scale = 0.7 + sin(phase * pi) * 0.6;
            final opacity = (0.3 + sin(phase * pi) * 0.7).clamp(0.2, 1.0);

            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: 6 * scale,
              height: 6 * scale,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFDF9E5B).withOpacity(opacity),
              ),
            );
          }),
        );
      },
    );
  }
}
