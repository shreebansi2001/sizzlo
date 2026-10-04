import 'dart:math';
import 'package:flutter/material.dart';

/// Authentic sizzler steam & smoke particle effect
class SizzlerSmokeEffect extends StatefulWidget {
  final Widget child;
  final bool enableSmoke;

  const SizzlerSmokeEffect({
    Key? key,
    required this.child,
    this.enableSmoke = true,
  }) : super(key: key);

  @override
  State<SizzlerSmokeEffect> createState() => _SizzlerSmokeEffectState();
}

class _SizzlerSmokeEffectState extends State<SizzlerSmokeEffect>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<_SmokeParticle> _particles = [];
  final Random _rnd = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    // Generate initial particles
    for (int i = 0; i < 28; i++) {
      _particles.add(_generateParticle(initial: true));
    }
  }

  _SmokeParticle _generateParticle({bool initial = false}) {
    return _SmokeParticle(
      x: 0.15 + _rnd.nextDouble() * 0.70, // centered across header
      y: initial ? _rnd.nextDouble() : 1.05,
      radius: 12.0 + _rnd.nextDouble() * 24.0,
      opacity: 0.08 + _rnd.nextDouble() * 0.18,
      speed: 0.12 + _rnd.nextDouble() * 0.18,
      drift: (_rnd.nextDouble() - 0.5) * 0.08,
      isEmber: _rnd.nextDouble() < 0.25, // 25% glowing ember sparks
      scaleGrowth: 1.2 + _rnd.nextDouble() * 0.8,
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (!widget.enableSmoke) return widget.child;

    return Stack(
      children: [
        widget.child,
        Positioned.fill(
          child: IgnorePointer(
            child: AnimatedBuilder(
              animation: _controller,
              builder: (context, _) {
                // Update particles
                for (var p in _particles) {
                  p.y -= p.speed * 0.016;
                  p.x += p.drift * 0.016;
                  if (p.y < -0.1) {
                    p.y = 1.05;
                    p.x = 0.15 + _rnd.nextDouble() * 0.70;
                  }
                }
                return CustomPaint(
                  painter: _SmokePainter(particles: _particles),
                );
              },
            ),
          ),
        ),
      ],
    );
  }
}

class _SmokeParticle {
  double x;
  double y;
  double radius;
  double opacity;
  double speed;
  double drift;
  bool isEmber;
  double scaleGrowth;

  _SmokeParticle({
    required this.x,
    required this.y,
    required this.radius,
    required this.opacity,
    required this.speed,
    required this.drift,
    required this.isEmber,
    required this.scaleGrowth,
  });
}

class _SmokePainter extends CustomPainter {
  final List<_SmokeParticle> particles;

  _SmokePainter({required this.particles});

  @override
  void paint(Canvas canvas, Size size) {
    for (final p in particles) {
      final dx = p.x * size.width;
      final dy = p.y * size.height;

      // Opacity fades in and fades out towards the top
      double fade = 1.0;
      if (p.y > 0.8) {
        fade = (1.0 - p.y) / 0.2;
      } else if (p.y < 0.3) {
        fade = p.y / 0.3;
      }
      fade = fade.clamp(0.0, 1.0);

      if (p.isEmber) {
        // Glowing ember spark
        final emberPaint = Paint()
          ..color = const Color(0xFFFF9E3D).withOpacity((p.opacity * fade * 1.8).clamp(0.0, 0.8))
          ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 3);
        canvas.drawCircle(Offset(dx, dy), 2.2, emberPaint);

        final corePaint = Paint()
          ..color = Colors.white.withOpacity((p.opacity * fade * 2.0).clamp(0.0, 1.0));
        canvas.drawCircle(Offset(dx, dy), 1.0, corePaint);
      } else {
        // Soft rising sizzler steam / smoke puff
        final progress = (1.0 - p.y).clamp(0.0, 1.0);
        final currentRadius = p.radius * (1.0 + progress * p.scaleGrowth);

        final smokePaint = Paint()
          ..shader = RadialGradient(
            colors: [
              Colors.white.withOpacity((p.opacity * fade * 0.85).clamp(0.0, 0.25)),
              Colors.white.withOpacity((p.opacity * fade * 0.35).clamp(0.0, 0.12)),
              Colors.white.withOpacity(0.0),
            ],
            stops: const [0.0, 0.45, 1.0],
          ).createShader(Rect.fromCircle(center: Offset(dx, dy), radius: currentRadius));

        canvas.drawCircle(Offset(dx, dy), currentRadius, smokePaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SmokePainter oldDelegate) => true;
}
