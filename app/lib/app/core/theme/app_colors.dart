import 'package:flutter/material.dart';

class AppColors {
  // Brand Flame & Emerald Palettes (Yanki Sizzlerr)
  static const Color flame = Color(0xFFFF8A00);          // Yanki Flame Orange
  static const Color flameDark = Color(0xFFD96F00);      // Deep Sizzler Amber
  static const Color primary = Color(0xFF0E3B32);        // Luxury Forest Emerald
  static const Color primaryDark = Color(0xFF063429);    // Deep Obsidian Emerald
  static const Color primaryGlow = Color(0xFFFF8A00);    // Sizzler Flame Glow
  static const Color royalNavy = Color(0xFF001D4A);      // Royal Midnight
  
  // Luxury Gold Palettes
  static const Color gold = Color(0xFFC9A24D);           // Champagne Gold
  static const Color goldLight = Color(0xFFF7E7BE);      // Soft Gold Tint
  static const Color goldDark = Color(0xFFA67D28);       // Metallic Antique Gold
  static const Color goldBg = Color(0xFF1E1A12);         // Dark Warm Gold Tint

  // Neutral & Surfaces (Luxury Obsidian VIP Theme)
  static const Color background = Color(0xFF070A09);     // Deep Obsidian Black
  static const Color surface = Color(0xFF121715);        // Dark Obsidian Card
  static const Color surfaceVariant = Color(0xFF19201C); // Elevated Dark Card
  static const Color border = Color(0x1FFFFFFF);         // Subtle Translucent Border
  static const Color textPrimary = Colors.white;         // Clean White
  static const Color textSecondary = Color(0xFF94A3B8);  // Slate Gray
  static const Color textMuted = Color(0xFF5E726A);      // Muted Emerald Slate
  
  // Input & Form Colors
  static const Color inputBackground = Color(0xFF202724); // Dark Form Field Background
  static const Color inputBorder = Color(0x33FFFFFF);     // Subtle Translucent Form Border
  static const Color goldChampagne = Color(0xFFDFC27D);   // Light Champagne Gold
  static const Color goldBronze = Color(0xFFC88A4B);      // Bronze Accent

  // Plan Card Backgrounds
  static const Color planClassicDark = Color(0xFF381B0C);
  static const Color planSignatureDark = Color(0xFF0C2B22);

  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);

  // Luxury Gradients
  static const LinearGradient royalCardGradient = LinearGradient(
    colors: [Color(0xFF0E3B32), Color(0xFF063429), Color(0xFF092E25)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient flameGradient = LinearGradient(
    colors: [Color(0xFFFF9E2C), Color(0xFFFF8A00), Color(0xFFD96F00)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFE2BE6A), Color(0xFFC9A24D), Color(0xFFA67D28)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient champagneGradient = LinearGradient(
    colors: [Color(0xFFE5CE93), Color(0xFFDFC27D), Color(0xFFC9A24D)],
    begin: Alignment.centerLeft,
    end: Alignment.centerRight,
  );

  static const LinearGradient classicPlanGradient = LinearGradient(
    colors: [Color(0xFF472312), Color(0xFF2D160B)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient signaturePlanGradient = LinearGradient(
    colors: [Color(0xFF0E3B2F), Color(0xFF071F19)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient darkCardGradient = LinearGradient(
    colors: [Color(0xFF18221D), Color(0xFF0D1411)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );
}
