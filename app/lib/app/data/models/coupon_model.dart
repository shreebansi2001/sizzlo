class CouponModel {
  final String id;
  final String code;
  final String name;
  final String subtitle;
  final String description;
  final int leftCount;
  final int totalCount;
  final String expiryDate;
  final String status; // 'available', 'used', 'redeemed', 'expired'
  final String outlet;
  final String color;  // 'royal', 'gold'
  final String? burnedInvoiceNumber;
  final String? burnedCashierId;
  final String? burnedAt;

  CouponModel({
    required this.id,
    required this.code,
    required this.name,
    required this.subtitle,
    required this.description,
    required this.leftCount,
    required this.totalCount,
    required this.expiryDate,
    required this.status,
    required this.outlet,
    required this.color,
    this.burnedInvoiceNumber,
    this.burnedCashierId,
    this.burnedAt,
  });

  bool get isAvailable => status.toLowerCase() == 'available' && leftCount > 0;

  factory CouponModel.fromJson(Map<String, dynamic> json) {
    return CouponModel(
      id: json['id']?.toString() ?? '1',
      code: json['code'] ?? json['id']?.toString() ?? 'C-01',
      name: json['name'] ?? '',
      subtitle: json['subtitle'] ?? '',
      description: json['description'] ?? '',
      leftCount: json['leftCount'] ?? json['left'] ?? 0,
      totalCount: json['totalCount'] ?? json['total'] ?? 1,
      expiryDate: json['expiryDate']?.toString() ?? json['expiry']?.toString() ?? '',
      status: json['status'] ?? 'available',
      outlet: json['outlet'] ?? 'All Outlets',
      color: json['color'] ?? 'royal',
      burnedInvoiceNumber: json['burnedInvoiceNumber']?.toString(),
      burnedCashierId: json['burnedCashierId']?.toString(),
      burnedAt: json['burnedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'code': code,
      'name': name,
      'subtitle': subtitle,
      'description': description,
      'leftCount': leftCount,
      'totalCount': totalCount,
      'expiryDate': expiryDate,
      'status': status,
      'outlet': outlet,
      'color': color,
      'burnedInvoiceNumber': burnedInvoiceNumber,
      'burnedCashierId': burnedCashierId,
      'burnedAt': burnedAt,
    };
  }
}
