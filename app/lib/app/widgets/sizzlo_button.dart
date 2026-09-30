import 'package:flutter/material.dart';
import '../core/theme/app_colors.dart';

class SizzloButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;
  final bool isGold;
  final IconData? icon;

  const SizzloButton({
    Key? key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.isGold = false,
    this.icon,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bgGradient = isGold ? AppColors.goldGradient : AppColors.royalCardGradient;
    final textColor = isGold ? AppColors.primaryDark : Colors.white;

    return Container(
      width: double.infinity,
      height: 54,
      decoration: BoxDecoration(
        gradient: bgGradient,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: (isGold ? AppColors.gold : AppColors.primary).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          borderRadius: BorderRadius.circular(16),
          onTap: isLoading ? null : onPressed,
          child: Center(
            child: isLoading
                ? SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.2,
                      color: textColor,
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      if (icon != null) ...[
                        Icon(icon, color: textColor, size: 18),
                        const SizedBox(width: 8),
                      ],
                      Text(
                        text,
                        style: TextStyle(
                          color: textColor,
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 0.3,
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
