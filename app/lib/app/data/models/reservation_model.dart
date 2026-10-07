class ReservationModel {
  final String id;
  final String bookingReference;
  final String customerName;
  final String customerMobile;
  final String outlet;
  final String reservationTime;
  final int guests;
  final String status;
  final bool vip;
  final String? specialRequests;
  final String? tierPriorityTag;
  final double bookingAdvance;
  final bool advancePaid;
  final bool advanceDeducted;

  ReservationModel({
    required this.id,
    required this.bookingReference,
    required this.customerName,
    required this.customerMobile,
    required this.outlet,
    required this.reservationTime,
    required this.guests,
    required this.status,
    required this.vip,
    this.specialRequests,
    this.tierPriorityTag,
    this.bookingAdvance = 0.0,
    this.advancePaid = false,
    this.advanceDeducted = false,
  });

  factory ReservationModel.fromJson(Map<String, dynamic> json) {
    return ReservationModel(
      id: json['id']?.toString() ?? '1',
      bookingReference: json['bookingReference'] ?? json['id']?.toString() ?? 'R-001',
      customerName: json['customerName'] ?? json['customer'] ?? '',
      customerMobile: json['customerMobile'] ?? '',
      outlet: json['outlet'] ?? '',
      reservationTime: json['reservationTime'] ?? json['date'] ?? '',
      guests: json['guests'] ?? 2,
      status: json['status'] ?? 'Confirmed',
      vip: json['vip'] ?? false,
      specialRequests: json['specialRequests'],
      tierPriorityTag: json['tierPriorityTag'],
      bookingAdvance: (json['bookingAdvance'] as num?)?.toDouble() ?? 0.0,
      advancePaid: json['advancePaid'] ?? false,
      advanceDeducted: json['advanceDeducted'] ?? false,
    );
  }
}
