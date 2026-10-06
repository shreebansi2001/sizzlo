class BanquetInquiryModel {
  final int? id;
  final String customerName;
  final String customerMobile;
  final String? email;
  final String eventCategory;
  final String eventDate;
  final String eventShift;
  final int estimatedPax;
  final String? customRequirements;
  final String status;
  final String? assignedTo;
  final String? createdAt;

  BanquetInquiryModel({
    this.id,
    required this.customerName,
    required this.customerMobile,
    this.email,
    required this.eventCategory,
    required this.eventDate,
    required this.eventShift,
    required this.estimatedPax,
    this.customRequirements,
    this.status = 'NEW',
    this.assignedTo,
    this.createdAt,
  });

  factory BanquetInquiryModel.fromJson(Map<String, dynamic> json) {
    return BanquetInquiryModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0'),
      customerName: json['customerName']?.toString() ?? '',
      customerMobile: json['customerMobile']?.toString() ?? '',
      email: json['email']?.toString(),
      eventCategory: json['eventCategory']?.toString() ?? 'Wedding',
      eventDate: json['eventDate']?.toString() ?? '',
      eventShift: json['eventShift']?.toString() ?? 'Dinner',
      estimatedPax: (json['estimatedPax'] as num?)?.toInt() ?? 50,
      customRequirements: json['customRequirements']?.toString(),
      status: json['status']?.toString() ?? 'NEW',
      assignedTo: json['assignedTo']?.toString(),
      createdAt: json['createdAt']?.toString(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      if (id != null) 'id': id,
      'customerName': customerName,
      'customerMobile': customerMobile,
      'email': email,
      'eventCategory': eventCategory,
      'eventDate': eventDate,
      'eventShift': eventShift,
      'estimatedPax': estimatedPax,
      'customRequirements': customRequirements,
      'status': status,
      'assignedTo': assignedTo,
      'zeroPointsAcknowledged': true,
    };
  }
}
