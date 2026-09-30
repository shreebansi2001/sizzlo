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
  });

  int get couponsLeft => couponsTotal - couponsUsed;
  double get loyaltyProgress => (loyaltyGoal > 0) ? (loyaltyPoints / loyaltyGoal).clamp(0.0, 1.0) : 0.0;

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
      totalSavings: json['totalSavings'] ?? 24500,
      couponsUsed: json['couponsUsed'] ?? 5,
      couponsTotal: json['couponsTotal'] ?? 12,
      loyaltyPoints: json['loyaltyPoints'] ?? 125000,
      loyaltyGoal: json['loyaltyGoal'] ?? 250000,
      daysRemaining: json['daysRemaining'] ?? 365,
      status: json['status'] ?? 'Active',
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
    };
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
    );
  }
}
