import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

enum StatTone { gold, royal }

class StatCard extends StatelessWidget {
  final String label;
  final String value;
  final String delta;
  final IconData icon;
  final StatTone tone;

  const StatCard({
    Key? key,
    required this.label,
    required this.value,
    required this.delta,
    required this.icon,
    this.tone = StatTone.royal,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final isGold = tone == StatTone.gold;
    final deltaColor = isGold ? AppColors.gold : AppColors.flame;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: const Color(0xFF131715),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: Colors.white.withOpacity(0.08),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            label.toUpperCase(),
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.w600,
              letterSpacing: 1.2,
              color: Colors.white.withOpacity(0.55),
            ),
          ),
          const SizedBox(height: 6),
          Text(
            value,
            style: const TextStyle(
              fontSize: 22,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              fontFamily: 'Playfair Display',
            ),
          ),
          const SizedBox(height: 4),
          Text(
            delta,
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w500,
              color: deltaColor,
            ),
          ),
        ],
      ),
    );
  }
}
