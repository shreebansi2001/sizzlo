import 'package:flutter/material.dart';

class MemberModel {
  final String id;
  final String fullName;
  final String firstName;
  final String membershipId;
  final String membershipType;
  final String mobile;
  final String email;
  final String issuedDate;
  final String expiryDate;
  final int totalSavings;
  final int couponsUsed;
  final int couponsTotal;
  final int loyaltyPoints;
  final int loyaltyGoal;
  final int daysRemaining;
  final String status;
  final String planId; // 'none', 'classic', 'signature', 'elite'

  MemberModel({
    required this.id,
    required this.fullName,
    required this.firstName,
    required this.membershipId,
    required this.membershipType,
    required this.mobile,
    required this.email,
    required this.issuedDate,
    required this.expiryDate,
    required this.totalSavings,
    required this.couponsUsed,
    required this.couponsTotal,
    required this.loyaltyPoints,
    required this.loyaltyGoal,
    required this.daysRemaining,
    required this.status,
    this.planId = 'none',
  });

  bool get isSubscriber => planId.isNotEmpty && planId != 'none';
  int get couponsLeft => couponsTotal - couponsUsed;
  double get loyaltyProgress => (loyaltyGoal > 0) ? (loyaltyPoints / loyaltyGoal).clamp(0.0, 1.0) : 0.0;

  LinearGradient get headerGradient {
    switch (planId) {
      case 'classic':
        return const LinearGradient(
          colors: [Color(0xFF472312), Color(0xFF2D160B), Color(0xFF1D0E07)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case 'elite':
        return const LinearGradient(
          colors: [Color(0xFF2A2218), Color(0xFF17130F), Color(0xFF0E0B08)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case 'signature':
        return const LinearGradient(
          colors: [Color(0xFF0E3B32), Color(0xFF063429), Color(0xFF092E25)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      default:
        // Warm dark obsidian/charcoal banner for non-subscribers (Image 3)
        return const LinearGradient(
          colors: [Color(0xFF1E1915), Color(0xFF120F0D), Color(0xFF0A0908)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
    }
  }

  LinearGradient get cardGradient {
    switch (planId) {
      case 'classic':
        return const LinearGradient(
          colors: [Color(0xFF522815), Color(0xFF33160B)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case 'elite':
        return const LinearGradient(
          colors: [Color(0xFF33291C), Color(0xFF1D1710)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
      case 'signature':
      default:
        return const LinearGradient(
          colors: [Color(0xFF0B4438), Color(0xFF063429), Color(0xFF0B5544)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        );
    }
  }

  Color get planAccentColor {
    switch (planId) {
      case 'classic':
        return const Color(0xFFDF9E5B);
      case 'elite':
        return const Color(0xFFF5D07A);
      case 'signature':
      default:
        return const Color(0xFF4EE3B8);
    }
  }

  String get planTitle {
    switch (planId) {
      case 'classic':
        return 'CLASSIC SUBSCRIPTION';
      case 'elite':
        return 'ELITE SUBSCRIPTION';
      case 'signature':
      default:
        return 'SIGNATURE SUBSCRIPTION';
    }
  }

  String get planMemberLabel {
    switch (planId) {
      case 'classic':
        return 'CLASSIC SUBSCRIBER';
      case 'elite':
        return 'ELITE SUBSCRIBER';
      case 'signature':
      default:
        return 'SIGNATURE SUBSCRIBER';
    }
  }

  String get planPriceFormatted {
    switch (planId) {
      case 'classic':
        return '₹5,000';
      case 'elite':
        return '₹15,000';
      case 'signature':
      default:
        return '₹10,000';
    }
  }

  factory MemberModel.fromJson(Map<String, dynamic> json) {
    return MemberModel(
      id: json['id']?.toString() ?? '1',
      fullName: json['fullName'] ?? 'Rahul Mehta',
      firstName: json['firstName'] ?? 'Rahul',
      membershipId: json['membershipId'] ?? 'YSM-2024-04821',
      membershipType: json['membershipType'] ?? 'VIP MEMBER',
      mobile: json['mobile'] ?? '+91 98250 12345',
      email: json['email'] ?? 'rahul.mehta@yanki.in',
      issuedDate: json['issuedDate']?.toString() ?? '20 Jun 2024',
      expiryDate: json['expiryDate']?.toString() ?? '20 Jun 2027',
      totalSavings: (json['totalSavings'] as num?)?.toInt() ?? 24500,
      couponsUsed: (json['couponsUsed'] as num?)?.toInt() ?? 5,
      couponsTotal: (json['couponsTotal'] as num?)?.toInt() ?? 12,
      loyaltyPoints: (json['loyaltyPoints'] as num?)?.toInt() ?? 125000,
      loyaltyGoal: (json['loyaltyGoal'] as num?)?.toInt() ?? 250000,
      daysRemaining: (json['daysRemaining'] as num?)?.toInt() ?? 365,
      status: json['status'] ?? 'Active',
      planId: json['planId'] ?? 'signature',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'fullName': fullName,
      'firstName': firstName,
      'membershipId': membershipId,
      'membershipType': membershipType,
      'mobile': mobile,
      'email': email,
      'issuedDate': issuedDate,
      'expiryDate': expiryDate,
      'totalSavings': totalSavings,
      'couponsUsed': couponsUsed,
      'couponsTotal': couponsTotal,
      'loyaltyPoints': loyaltyPoints,
      'loyaltyGoal': loyaltyGoal,
      'status': status,
      'planId': planId,
    };
  }

  MemberModel copyWith({
    String? id,
    String? fullName,
    String? firstName,
    String? membershipId,
    String? membershipType,
    String? mobile,
    String? email,
    String? issuedDate,
    String? expiryDate,
    int? totalSavings,
    int? couponsUsed,
    int? couponsTotal,
    int? loyaltyPoints,
    int? loyaltyGoal,
    int? daysRemaining,
    String? status,
    String? planId,
  }) {
    return MemberModel(
      id: id ?? this.id,
      fullName: fullName ?? this.fullName,
      firstName: firstName ?? this.firstName,
      membershipId: membershipId ?? this.membershipId,
      membershipType: membershipType ?? this.membershipType,
      mobile: mobile ?? this.mobile,
      email: email ?? this.email,
      issuedDate: issuedDate ?? this.issuedDate,
      expiryDate: expiryDate ?? this.expiryDate,
      totalSavings: totalSavings ?? this.totalSavings,
      couponsUsed: couponsUsed ?? this.couponsUsed,
      couponsTotal: couponsTotal ?? this.couponsTotal,
      loyaltyPoints: loyaltyPoints ?? this.loyaltyPoints,
      loyaltyGoal: loyaltyGoal ?? this.loyaltyGoal,
      daysRemaining: daysRemaining ?? this.daysRemaining,
      status: status ?? this.status,
      planId: planId ?? this.planId,
    );
  }

  static MemberModel defaultProfile() {
    return MemberModel(
      id: '1',
      fullName: 'Rahul Mehta',
      firstName: 'Rahul',
      membershipId: 'YSM-2024-04821',
      membershipType: 'VIP MEMBER',
      mobile: '+91 98250 12345',
      email: 'rahul.mehta@yanki.in',
      issuedDate: '20 Jun 2024',
      expiryDate: '20 Jun 2027',
      totalSavings: 24500,
      couponsUsed: 5,
      couponsTotal: 12,
      loyaltyPoints: 125000,
      loyaltyGoal: 250000,
      daysRemaining: 365,
      status: 'Active',
      planId: 'signature', // Preview subscribed state
    );
  }
}
