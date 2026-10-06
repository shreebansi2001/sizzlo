class BillSettlementModel {
  final int id;
  final String customerMobile;
  final String customerName;
  final String membershipId;
  final String outletName;
  final String posInvoiceNumber;
  final double grossAmount;
  final double discountAmount;
  final double netPayable;
  final String? couponCode;
  final String paymentMode; // CASH, CARD, ONLINE, STORE_QR
  final String? upiUtr;
  final String status; // PENDING_VERIFICATION, APPROVED, REJECTED
  final int pointsCredited;
  final String createdAt;
  final String? approvedAt;

  BillSettlementModel({
    required this.id,
    required this.customerMobile,
    required this.customerName,
    required this.membershipId,
    required this.outletName,
    required this.posInvoiceNumber,
    required this.grossAmount,
    required this.discountAmount,
    required this.netPayable,
    this.couponCode,
    required this.paymentMode,
    this.upiUtr,
    required this.status,
    required this.pointsCredited,
    required this.createdAt,
    this.approvedAt,
  });

  bool get isApproved => status == 'APPROVED';
  bool get isPending => status == 'PENDING_VERIFICATION';

  factory BillSettlementModel.fromJson(Map<String, dynamic> json) {
    return BillSettlementModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      customerMobile: json['customerMobile']?.toString() ?? '',
      customerName: json['customerName']?.toString() ?? '',
      membershipId: json['membershipId']?.toString() ?? '',
      outletName: json['outletName']?.toString() ?? '',
      posInvoiceNumber: json['posInvoiceNumber']?.toString() ?? '',
      grossAmount: (json['grossAmount'] as num?)?.toDouble() ?? 0.0,
      discountAmount: (json['discountAmount'] as num?)?.toDouble() ?? 0.0,
      netPayable: (json['netPayable'] as num?)?.toDouble() ?? 0.0,
      couponCode: json['couponCode']?.toString(),
      paymentMode: json['paymentMode']?.toString() ?? 'CASH',
      upiUtr: json['upiUtr']?.toString(),
      status: json['status']?.toString() ?? 'PENDING_VERIFICATION',
      pointsCredited: (json['pointsCredited'] as num?)?.toInt() ?? 0,
      createdAt: json['createdAt']?.toString() ?? '',
      approvedAt: json['approvedAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'customerMobile': customerMobile,
      'customerName': customerName,
      'membershipId': membershipId,
      'outletName': outletName,
      'posInvoiceNumber': posInvoiceNumber,
      'grossAmount': grossAmount,
      'discountAmount': discountAmount,
      'netPayable': netPayable,
      'couponCode': couponCode,
      'paymentMode': paymentMode,
      'upiUtr': upiUtr,
      'status': status,
      'pointsCredited': pointsCredited,
      'createdAt': createdAt,
      'approvedAt': approvedAt,
    };
  }
}
