import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/navigation_controller.dart';

class ActiveChipWithSprinklesWidget extends StatefulWidget {
  final String label;
  final VoidCallback? onTap;

  const ActiveChipWithSprinklesWidget({
    Key? key,
    this.label = 'ACTIVE',
    this.onTap,
  }) : super(key: key);

  @override
  State<ActiveChipWithSprinklesWidget> createState() => _ActiveChipWithSprinklesWidgetState();
}

class _ActiveChipWithSprinklesWidgetState extends State<ActiveChipWithSprinklesWidget>
    with TickerProviderStateMixin {
  late AnimationController _burstController;
  late Animation<double> _scaleAnimation;
  late AnimationController _pulseController;
  final List<_SprinkleParticle> _particles = [];
  final math.Random _random = math.Random();
  Worker? _navWorker;

  @override
  void initState() {
    super.initState();

    _burstController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1400),
    );

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _burstController,
        curve: const Interval(0.0, 0.55, curve: Curves.easeOutBack),
      ),
    );

    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1600),
    )..repeat(reverse: true);

    _spawnParticles();

    // Automatically trigger cracker sprinkles whenever user lands on Profile tab
    if (Get.isRegistered<NavigationController>()) {
      final nav = Get.find<NavigationController>();
      _navWorker = ever<int>(nav.currentIndex, (int index) {
        if (index == 4) {
          Future.delayed(const Duration(milliseconds: 220), () {
            if (mounted) _retriggerBurst();
          });
        }
      });

      if (nav.currentIndex.value == 4) {
        Future.delayed(const Duration(milliseconds: 260), () {
          if (mounted) _retriggerBurst();
        });
      } else {
        // Just scale in the chip quietly if not currently on Profile tab
        _burstController.value = 1.0;
      }
    } else {
      // Standalone screen navigation
      Future.delayed(const Duration(milliseconds: 260), () {
        if (mounted) _retriggerBurst();
      });
    }
  }

  void _spawnParticles() {
    _particles.clear();
    const colors = [
      Color(0xFF4EE3B8), // Neon emerald
      Color(0xFFDF9E5B), // Sizzlo luxury gold
      Color(0xFFFF2A7A), // Festive pink
      Color(0xFF00E5FF), // Cyan sparkle
      Color(0xFFFFD600), // Sunshine yellow
      Color(0xFFFF9100), // Vibrant orange
      Color(0xFFE040FB), // Royal purple
      Colors.white,
    ];

    // Generate 32 party cracker sprinkles
    for (int i = 0; i < 32; i++) {
      // Angles spray mostly around the chip with an explosive 360 burst
      final angle = _random.nextDouble() * 2 * math.pi;
      final speed = 25.0 + _random.nextDouble() * 55.0;
      final size = 3.5 + _random.nextDouble() * 4.0;
      final color = colors[_random.nextInt(colors.length)];
      final rotation = _random.nextDouble() * 2 * math.pi;
      final spinSpeed = (_random.nextDouble() - 0.5) * 8.0;
      final shape = _random.nextInt(3); // 0 = ribbon, 1 = circle, 2 = diamond star

      _particles.add(
        _SprinkleParticle(
          angle: angle,
          speed: speed,
          size: size,
          color: color,
          rotation: rotation,
          spinSpeed: spinSpeed,
          shape: shape,
        ),
      );
    }
  }

  void _retriggerBurst() {
    _spawnParticles();
    _burstController.reset();
    _burstController.forward();
    if (widget.onTap != null) widget.onTap!();
  }

  @override
  void dispose() {
    _navWorker?.dispose();
    _burstController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _retriggerBurst,
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.center,
        children: [
          // Sprinkles particle explosion layer
          AnimatedBuilder(
            animation: _burstController,
            builder: (context, child) {
              if (_burstController.value >= 1.0) {
                return const SizedBox.shrink();
              }
              return CustomPaint(
                painter: _SprinklesPainter(
                  particles: _particles,
                  progress: _burstController.value,
                ),
              );
            },
          ),

          // The Active Chip itself with pop-in scale animation
          ScaleTransition(
            scale: _scaleAnimation,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    Color(0xFF0D2A20),
                    Color(0xFF143B2E),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: const Color(0xFF2E8564),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF4EE3B8).withOpacity(0.25),
                    blurRadius: 8,
                    spreadRadius: 1,
                    offset: const Offset(0, 1),
                  ),
                ],
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Animated breathing green dot
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      final glow = 0.3 + (_pulseController.value * 0.7);
                      return Container(
                        width: 5.5,
                        height: 5.5,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: const Color(0xFF4EE3B8),
                          boxShadow: [
                            BoxShadow(
                              color: const Color(0xFF4EE3B8).withOpacity(glow),
                              blurRadius: 4.0 + (_pulseController.value * 3.0),
                              spreadRadius: 1.0 + (_pulseController.value * 1.0),
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                  const SizedBox(width: 5),
                  Text(
                    widget.label,
                    style: GoogleFonts.outfit(
                      fontSize: 9.5,
                      fontWeight: FontWeight.w900,
                      color: const Color(0xFF4EE3B8),
                      letterSpacing: 0.8,
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

class _SprinkleParticle {
  final double angle;
  final double speed;
  final double size;
  final Color color;
  final double rotation;
  final double spinSpeed;
  final int shape;

  _SprinkleParticle({
    required this.angle,
    required this.speed,
    required this.size,
    required this.color,
    required this.rotation,
    required this.spinSpeed,
    required this.shape,
  });
}

class _SprinklesPainter extends CustomPainter {
  final List<_SprinkleParticle> particles;
  final double progress;

  _SprinklesPainter({
    required this.particles,
    required this.progress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    if (progress <= 0.0 || progress >= 1.0) return;

    // Displacement eased out quickly for party cracker burst feel
    final ease = Curves.easeOutCubic.transform(progress);
    // Fade out as it spreads
    final opacity = (1.0 - (progress * 1.15)).clamp(0.0, 1.0);
    if (opacity <= 0.0) return;

    for (final p in particles) {
      final paint = Paint()
        ..color = p.color.withOpacity(opacity)
        ..style = PaintingStyle.fill;

      // Position
      final distance = p.speed * ease;
      final dx = math.cos(p.angle) * distance;
      // Slight gravity pull
      final dy = math.sin(p.angle) * distance + (progress * progress * 22.0);

      canvas.save();
      canvas.translate(dx, dy);
      canvas.rotate(p.rotation + (progress * p.spinSpeed * math.pi));

      if (p.shape == 0) {
        // Confetti Ribbon / Sprinkle rectangle
        final rect = Rect.fromCenter(
          center: Offset.zero,
          width: p.size * 1.6,
          height: p.size * 0.7,
        );
        canvas.drawRRect(RRect.fromRectAndRadius(rect, const Radius.circular(1.5)), paint);
      } else if (p.shape == 1) {
        // Sparkle Circle dot
        canvas.drawCircle(Offset.zero, p.size * 0.5, paint);
      } else {
        // 4-point Diamond Star
        final path = Path();
        final s = p.size * 0.9;
        path.moveTo(0, -s);
        path.lineTo(s * 0.35, 0);
        path.lineTo(0, s);
        path.lineTo(-s * 0.35, 0);
        path.close();
        canvas.drawPath(path, paint);
      }

      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant _SprinklesPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}
