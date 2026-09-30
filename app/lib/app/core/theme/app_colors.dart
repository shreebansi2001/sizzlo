import 'package:flutter/material.dart';

class AppColors {
  // Brand Primary & Royal Blues
  static const Color primary = Color(0xFF001D4A);        // Deep Royal Blue
  static const Color primaryDark = Color(0xFF00122E);    // Midnight Navy
  static const Color primaryGlow = Color(0xFF0A3175);    // Vibrant Royal Accent
  
  // Luxury Gold Palettes
  static const Color gold = Color(0xFFE8B84A);           // Iconic Yanki Gold
  static const Color goldLight = Color(0xFFF7E7BE);      // Soft Gold Tint
  static const Color goldDark = Color(0xFFBF8E22);       // Metallic Antique Gold
  static const Color goldBg = Color(0xFFFBF7EE);         // Cream Gold Background

  // Neutral & Surfaces
  static const Color background = Color(0xFFF8FAFC);     // Light Clean Slate
  static const Color surface = Colors.white;             // Card Surface
  static const Color surfaceVariant = Color(0xFFF1F5F9); // Muted Surface
  static const Color textPrimary = Color(0xFF0F172A);    // Charcoal Ink
  static const Color textSecondary = Color(0xFF64748B);  // Slate Gray
  static const Color textMuted = Color(0xFF94A3B8);      // Muted Hint
  
  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);

  // Luxury Gradients
  static const LinearGradient royalCardGradient = LinearGradient(
    colors: [Color(0xFF001D4A), Color(0xFF052B6A), Color(0xFF093988)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFF3C762), Color(0xFFE8B84A), Color(0xFFC79526)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkCardGradient = LinearGradient(
    colors: [Color(0xFF1E293B), Color(0xFF0F172A)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
