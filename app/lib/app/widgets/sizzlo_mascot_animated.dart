import 'dart:math';
import 'package:flutter/material.dart';

class SizzloMascotAnimated extends StatefulWidget {
  final double height;
  final VoidCallback? onTap;

  const SizzloMascotAnimated({
    Key? key,
    this.height = 44,
    this.onTap,
  }) : super(key: key);

  @override
  State<SizzloMascotAnimated> createState() => _SizzloMascotAnimatedState();
}

class _SizzloMascotAnimatedState extends State<SizzloMascotAnimated>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2400),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return RepaintBoundary(
      child: GestureDetector(
        onTap: widget.onTap,
        child: AnimatedBuilder(
          animation: _controller,
          builder: (context, child) {
            final t = _controller.value;
            // Smooth sine curve for floating motion
            final floatOffset = sin(t * pi) * 5.0; // moves up and down by 5px
            final tiltAngle = sin(t * pi) * 0.05; // gentle tilt ±3 degrees
            final scale = 1.0 + sin(t * pi) * 0.035; // gentle breathing scale

            return Transform.translate(
              offset: Offset(0, -floatOffset),
              child: Transform.rotate(
                angle: tiltAngle,
                child: Transform.scale(
                  scale: scale,
                  child: child,
                ),
              ),
            );
          },
          child: Image.asset(
            'assets/images/sizzlo-mascot.png',
            height: widget.height,
            fit: BoxFit.contain,
          ),
        ),
      ),
    );
  }
}
