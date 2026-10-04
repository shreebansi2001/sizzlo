import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../core/theme/app_colors.dart';

/// Interactive Sizzler Platter & Smoke Hero Animation for the Home Page
class SizzlerHeroAnimation extends StatefulWidget {
  final VoidCallback? onTap;

  const SizzlerHeroAnimation({Key? key, this.onTap}) : super(key: key);

  @override
  State<SizzlerHeroAnimation> createState() => _SizzlerHeroAnimationState();
}

class _SizzlerHeroAnimationState extends State<SizzlerHeroAnimation>
    with TickerProviderStateMixin {
  // Continuous controllers
  late AnimationController _smokeController;
  late AnimationController _sizzleVibeController;
  late AnimationController _glowController;
  late AnimationController _entranceController;

  final List<_SteamPuff> _steamPuffs = [];
  final Random _rnd = Random();

  @override
  void initState() {
    super.initState();

    // 1. Smoke cycle controller (looping continuously)
    _smokeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3200),
    )..repeat();

    // 2. Cast iron hot sizzle vibration controller
    _sizzleVibeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 140),
    )..repeat(reverse: true);

    // 3. Flame / amber glow breathing
    _glowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1800),
    )..repeat(reverse: true);

    // 4. Smooth entrance animation on page open
    _entranceController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..forward();

    // Initialize realistic billowy steam puffs
    for (int i = 0; i < 32; i++) {
      _steamPuffs.add(_createPuff(initial: true));
    }
  }

  _SteamPuff _createPuff({bool initial = false}) {
    return _SteamPuff(
      x: 0.28 + _rnd.nextDouble() * 0.44, // localized right above sizzler platter
      y: initial ? _rnd.nextDouble() : 1.0,
      size: 16.0 + _rnd.nextDouble() * 30.0,
      speed: 0.14 + _rnd.nextDouble() * 0.22,
      drift: (_rnd.nextDouble() - 0.5) * 0.12,
      opacity: 0.15 + _rnd.nextDouble() * 0.35,
      isEmber: _rnd.nextDouble() < 0.2, // 20% bright golden sparks
    );
  }

  void _triggerExtraSizzleBurst() {
    setState(() {
      for (int i = 0; i < 18; i++) {
        _steamPuffs.add(
          _SteamPuff(
            x: 0.32 + _rnd.nextDouble() * 0.36,
            y: 0.85 + _rnd.nextDouble() * 0.15,
            size: 24.0 + _rnd.nextDouble() * 32.0,
            speed: 0.35 + _rnd.nextDouble() * 0.3,
            drift: (_rnd.nextDouble() - 0.5) * 0.25,
            opacity: 0.4 + _rnd.nextDouble() * 0.4,
            isEmber: _rnd.nextDouble() < 0.4,
          ),
        );
      }
    });
    if (widget.onTap != null) widget.onTap!();
  }

  @override
  void dispose() {
    _smokeController.dispose();
    _sizzleVibeController.dispose();
    _glowController.dispose();
    _entranceController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SlideTransition(
      position: Tween<Offset>(
        begin: const Offset(0, 0.12),
        end: Offset.zero,
      ).animate(
        CurvedAnimation(
          parent: _entranceController,
          curve: Curves.easeOutCubic,
        ),
      ),
      child: FadeTransition(
        opacity: CurvedAnimation(
          parent: _entranceController,
          curve: Curves.easeIn,
        ),
        child: GestureDetector(
          onTap: _triggerExtraSizzleBurst,
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
            height: 185,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [
                  Color(0xFF1B140E), // Warm roasted charcoal
                  Color(0xFF121915), // Deep obsidian forest
                  Color(0xFF0C110F),
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(
                color: AppColors.flame.withOpacity(0.28),
                width: 1.2,
              ),
              boxShadow: [
                BoxShadow(
                  color: AppColors.flame.withOpacity(0.12),
                  blurRadius: 24,
                  offset: const Offset(0, 8),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Stack(
                children: [
                  // Warm ambient heat glow in background
                  AnimatedBuilder(
                    animation: _glowController,
                    builder: (context, _) {
                      return Positioned(
                        right: 20,
                        bottom: -20,
                        width: 160,
                        height: 160,
                        child: Container(
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: RadialGradient(
                              colors: [
                                AppColors.flame.withOpacity(0.25 * _glowController.value),
                                AppColors.gold.withOpacity(0.12 * _glowController.value),
                                Colors.transparent,
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),

                  // Left Side: Brand Name & Sizzling Messaging
                  Positioned(
                    left: 20,
                    top: 20,
                    bottom: 20,
                    right: 140,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Live Sizzle Pill Badge
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.flame.withOpacity(0.16),
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(color: AppColors.flame.withOpacity(0.4)),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Text('🔥', style: TextStyle(fontSize: 11)),
                              const SizedBox(width: 5),
                              Text(
                                'HOT & SIZZLING',
                                style: GoogleFonts.plusJakartaSans(
                                  color: AppColors.flame,
                                  fontSize: 9.5,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1.5,
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 8),

                        // SIZZLO Luxury Title
                        Row(
                          children: [
                            Text(
                              'SIZZLO',
                              style: GoogleFonts.playfairDisplay(
                                fontSize: 30,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 2.0,
                                color: Colors.white,
                                shadows: [
                                  Shadow(
                                    color: AppColors.flame.withOpacity(0.5),
                                    blurRadius: 16,
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppColors.gold,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),

                        // Subtitle
                        Text(
                          'Sizzling culinary marvels served piping hot with exclusive dining benefits.',
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11.5,
                            color: Colors.white.withOpacity(0.68),
                            height: 1.35,
                          ),
                        ),
                        const SizedBox(height: 10),

                        // Interactive Hint
                        Row(
                          children: [
                            Text(
                              'Tap platter to sizzle',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 10.5,
                                fontWeight: FontWeight.w600,
                                color: AppColors.gold,
                              ),
                            ),
                            const SizedBox(width: 4),
                            const Icon(
                              Icons.touch_app_outlined,
                              size: 13,
                              color: AppColors.gold,
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Right Side: Sizzler Character / Platter with Hands
                  Positioned(
                    right: 8,
                    bottom: 10,
                    top: 10,
                    width: 140,
                    child: Stack(
                      alignment: Alignment.center,
                      children: [
                        // Hot steam & white smoke rising from platter
                        Positioned.fill(
                          child: IgnorePointer(
                            child: AnimatedBuilder(
                              animation: _smokeController,
                              builder: (context, _) {
                                // Update steam puffs position
                                for (var p in _steamPuffs) {
                                  p.y -= p.speed * 0.016;
                                  p.x += p.drift * 0.016;
                                  if (p.y < -0.15) {
                                    p.y = 1.0;
                                    p.x = 0.28 + _rnd.nextDouble() * 0.44;
                                  }
                                }
                                return CustomPaint(
                                  painter: _BillowySmokePainter(puffs: _steamPuffs),
                                );
                              },
                            ),
                          ),
                        ),

                        // Sizzler Platter / Mascot Image with subtle micro-tremor
                        AnimatedBuilder(
                          animation: _sizzleVibeController,
                          builder: (context, child) {
                            final vibeX = (_sizzleVibeController.value - 0.5) * 1.5;
                            final vibeY = (_sizzleVibeController.value - 0.5) * 1.0;
                            return Transform.translate(
                              offset: Offset(vibeX, vibeY),
                              child: child,
                            );
                          },
                          child: Hero(
                            tag: 'sizzlo_mascot_hero',
                            child: Image.asset(
                              'assets/images/sizzlo-mascot.png',
                              fit: BoxFit.contain,
                              height: 130,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _SteamPuff {
  double x;
  double y;
  double size;
  double speed;
  double drift;
  double opacity;
  bool isEmber;

  _SteamPuff({
    required this.x,
    required this.y,
    required this.size,
    required this.speed,
    required this.drift,
    required this.opacity,
    required this.isEmber,
  });
}

class _BillowySmokePainter extends CustomPainter {
  final List<_SteamPuff> puffs;

  _BillowySmokePainter({required this.puffs});

  @override
  void paint(Canvas canvas, Size size) {
    for (final p in puffs) {
      final cx = p.x * size.width;
      final cy = p.y * size.height;

      // Realistic puff fade out as it reaches the top
      final fadeFactor = (p.y).clamp(0.0, 1.0);
      final currentOpacity = (p.opacity * fadeFactor).clamp(0.0, 0.85);

      if (p.isEmber) {
        // Golden sizzling fire ember
        final emberPaint = Paint()
          ..color = const Color(0xFFFF9E2C).withOpacity(currentOpacity)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 2.5);
        canvas.drawCircle(Offset(cx, cy), 2.2, emberPaint);

        final corePaint = Paint()
          ..color = Colors.white.withOpacity(currentOpacity * 0.9);
        canvas.drawCircle(Offset(cx, cy), 1.0, corePaint);
      } else {
        // Soft white steam cloud / smoke puff
        final currentRadius = p.size * (1.6 - (p.y * 0.6)); // expands as it rises
        final Rect rect = Rect.fromCircle(center: Offset(cx, cy), radius: currentRadius);

        final Gradient gradient = RadialGradient(
          colors: [
            Colors.white.withOpacity(currentOpacity * 0.6),
            Colors.white.withOpacity(currentOpacity * 0.25),
            Colors.white.withOpacity(0.0),
          ],
          stops: const [0.0, 0.45, 1.0],
        );

        final Paint smokePaint = Paint()
          ..shader = gradient.createShader(rect)
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 8);

        canvas.drawCircle(Offset(cx, cy), currentRadius, smokePaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _BillowySmokePainter oldDelegate) => true;
}
