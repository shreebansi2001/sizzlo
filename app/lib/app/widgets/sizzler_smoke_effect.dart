import 'dart:math';
import 'package:flutter/material.dart';

/// Authentic sizzler steam & smoke particle effect optimized for 120 FPS silky scrolling
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

    // 12 lightweight particles (prevents GPU stall during scroll)
    for (int i = 0; i < 12; i++) {
      _particles.add(_generateParticle(initial: true));
    }
  }

  _SmokeParticle _generateParticle({bool initial = false}) {
    return _SmokeParticle(
      x: 0.15 + _rnd.nextDouble() * 0.70,
      y: initial ? _rnd.nextDouble() : 1.05,
      radius: 10.0 + _rnd.nextDouble() * 18.0,
      opacity: 0.08 + _rnd.nextDouble() * 0.14,
      speed: 0.10 + _rnd.nextDouble() * 0.15,
      drift: (_rnd.nextDouble() - 0.5) * 0.06,
      isEmber: _rnd.nextDouble() < 0.20,
      scaleGrowth: 1.1 + _rnd.nextDouble() * 0.6,
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
            // RepaintBoundary isolates smoke animation from surrounding scroll view
            child: RepaintBoundary(
              child: AnimatedBuilder(
                animation: _controller,
                builder: (context, _) {
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
  final Paint _smokePaint = Paint()..style = PaintingStyle.fill;
  final Paint _emberPaint = Paint()..style = PaintingStyle.fill;

  _SmokePainter({required this.particles});

  @override
  void paint(Canvas canvas, Size size) {
    for (final p in particles) {
      final dx = p.x * size.width;
      final dy = p.y * size.height;

      double fade = 1.0;
      if (p.y > 0.8) {
        fade = (1.0 - p.y) / 0.2;
      } else if (p.y < 0.3) {
        fade = p.y / 0.3;
      }
      fade = fade.clamp(0.0, 1.0);

      if (p.isEmber) {
        _emberPaint.color = const Color(0xFFFF9E3D).withOpacity((p.opacity * fade * 1.5).clamp(0.0, 0.7));
        canvas.drawCircle(Offset(dx, dy), 1.8, _emberPaint);
      } else {
        final progress = (1.0 - p.y).clamp(0.0, 1.0);
        final currentRadius = p.radius * (1.0 + progress * p.scaleGrowth);

        _smokePaint.color = Colors.white.withOpacity((p.opacity * fade * 0.4).clamp(0.0, 0.12));
        canvas.drawCircle(Offset(dx, dy), currentRadius, _smokePaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant _SmokePainter oldDelegate) => true;
}
