import 'package:flutter/material.dart';
import '../../core/values/app_constants.dart';

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
  final String address;
  final String gender;
  final String birthday;
  final String spouseName;
  final String spouseBirthday;
  final String anniversaryDate;
  final String isMarried;

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
    this.address = '',
    this.gender = '',
    this.birthday = '',
    this.spouseName = '',
    this.spouseBirthday = '',
    this.anniversaryDate = '',
    this.isMarried = 'No',
  });

  bool get isSubscriber => planId.isNotEmpty && planId != 'none';
  int get couponsLeft => (couponsTotal - couponsUsed).clamp(0, 999);
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
    final rawName = (json['fullName'] ?? json['name'] ?? '').toString().trim();
    final name = rawName.isNotEmpty ? rawName : (AppConstants.currentUserName.isNotEmpty ? AppConstants.currentUserName : 'Guest');
    final parts = name.split(RegExp(r'\s+'));
    final derivedFirst = parts.isNotEmpty ? parts.first : name;

    final rawTier = (json['subscriptionTier'] ?? json['planId'] ?? '').toString().toLowerCase();
    final plan = (rawTier == 'registered' || rawTier == 'none' || rawTier.isEmpty) ? 'none' : rawTier;
    final bool isSub = plan != 'none';

    return MemberModel(
      id: json['id']?.toString() ?? '1',
      fullName: name,
      firstName: (json['firstName'] != null && json['firstName'].toString().trim().isNotEmpty)
          ? json['firstName'].toString().trim()
          : derivedFirst,
      membershipId: json['membershipId']?.toString() ?? AppConstants.currentMembershipId,
      membershipType: json['membershipType']?.toString() ?? (isSub ? '${plan.toUpperCase()} SUBSCRIBER' : 'REGISTERED USER'),
      mobile: json['mobile']?.toString() ?? AppConstants.currentUserMobile,
      email: json['email']?.toString() ?? '',
      issuedDate: json['issuedDate']?.toString() ?? 'Today',
      expiryDate: json['expiryDate']?.toString() ?? '1 Year',
      totalSavings: (json['totalSavings'] as num?)?.toInt() ?? 0,
      couponsUsed: (json['couponsUsed'] as num?)?.toInt() ?? 0,
      couponsTotal: (json['couponsTotal'] as num?)?.toInt() ?? (isSub ? 12 : 0),
      loyaltyPoints: (json['loyaltyPoints'] as num?)?.toInt() ?? 0,
      loyaltyGoal: (json['loyaltyGoal'] as num?)?.toInt() ?? 250000,
      daysRemaining: (json['daysRemaining'] as num?)?.toInt() ?? (isSub ? 365 : 0),
      status: json['status']?.toString() ?? 'Active',
      planId: plan,
      address: json['address']?.toString() ?? '',
      gender: json['gender']?.toString() ?? '',
      birthday: json['birthday']?.toString() ?? '',
      spouseName: json['spouseName']?.toString() ?? '',
      spouseBirthday: json['spouseBirthday']?.toString() ?? '',
      anniversaryDate: json['anniversaryDate']?.toString() ?? '',
      isMarried: json['isMarried']?.toString() ?? 'No',
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
      'address': address,
      'gender': gender,
      'birthday': birthday,
      'spouseName': spouseName,
      'spouseBirthday': spouseBirthday,
      'anniversaryDate': anniversaryDate,
      'isMarried': isMarried,
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
    String? address,
    String? gender,
    String? birthday,
    String? spouseName,
    String? spouseBirthday,
    String? anniversaryDate,
    String? isMarried,
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
      address: address ?? this.address,
      gender: gender ?? this.gender,
      birthday: birthday ?? this.birthday,
      spouseName: spouseName ?? this.spouseName,
      spouseBirthday: spouseBirthday ?? this.spouseBirthday,
      anniversaryDate: anniversaryDate ?? this.anniversaryDate,
      isMarried: isMarried ?? this.isMarried,
    );
  }

  static MemberModel defaultProfile() {
    return MemberModel(
      id: '0',
      fullName: AppConstants.currentUserName.isNotEmpty ? AppConstants.currentUserName : 'Guest',
      firstName: AppConstants.currentUserName.isNotEmpty ? AppConstants.currentUserName.split(' ').first : 'Guest',
      membershipId: AppConstants.currentMembershipId,
      membershipType: 'REGISTERED USER',
      mobile: AppConstants.currentUserMobile,
      email: AppConstants.currentUserEmail,
      issuedDate: 'Today',
      expiryDate: '1 Year',
      totalSavings: 0,
      couponsUsed: 0,
      couponsTotal: 0,
      loyaltyPoints: 0,
      loyaltyGoal: 250000,
      daysRemaining: 0,
      status: 'Active',
      planId: 'none',
    );
  }
}
