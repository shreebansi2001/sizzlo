class DiningEventModel {
  final int id;
  final String title;
  final String description;
  final String bannerUrl;
  final String outletName;
  final String eventDay;
  final String eventDate;
  final String timings;
  final int totalSeats;
  final int bookedSeats;
  final double pricePerGuest;
  final String inclusions;
  final String status;

  DiningEventModel({
    required this.id,
    required this.title,
    required this.description,
    required this.bannerUrl,
    required this.outletName,
    required this.eventDay,
    required this.eventDate,
    required this.timings,
    required this.totalSeats,
    required this.bookedSeats,
    required this.pricePerGuest,
    required this.inclusions,
    required this.status,
  });

  int get remainingSeats {
    final rem = totalSeats - bookedSeats;
    return rem > 0 ? rem : 0;
  }

  double get occupancyRate {
    if (totalSeats <= 0) return 0.0;
    return (bookedSeats / totalSeats).clamp(0.0, 1.0);
  }

  bool get isHousefull => remainingSeats <= 0 || status == 'HOUSEFULL';

  factory DiningEventModel.fromJson(Map<String, dynamic> json) {
    return DiningEventModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      title: json['title']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      bannerUrl: json['bannerUrl']?.toString() ?? '',
      outletName: json['outletName']?.toString() ?? 'Yanki Sizzlers',
      eventDay: json['eventDay']?.toString() ?? 'Every Sunday',
      eventDate: json['eventDate']?.toString() ?? '',
      timings: json['timings']?.toString() ?? '12:00 PM – 04:00 PM',
      totalSeats: json['totalSeats'] is int ? json['totalSeats'] : int.tryParse(json['totalSeats']?.toString() ?? '50') ?? 50,
      bookedSeats: json['bookedSeats'] is int ? json['bookedSeats'] : int.tryParse(json['bookedSeats']?.toString() ?? '0') ?? 0,
      pricePerGuest: json['pricePerGuest'] != null ? (json['pricePerGuest'] as num).toDouble() : 99.0,
      inclusions: json['inclusions']?.toString() ?? '',
      status: json['status']?.toString() ?? 'ACTIVE',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'bannerUrl': bannerUrl,
      'outletName': outletName,
      'eventDay': eventDay,
      'eventDate': eventDate,
      'timings': timings,
      'totalSeats': totalSeats,
      'bookedSeats': bookedSeats,
      'pricePerGuest': pricePerGuest,
      'inclusions': inclusions,
      'status': status,
    };
  }
}

class DiningEventBookingModel {
  final int id;
  final String bookingReference;
  final int eventId;
  final String eventTitle;
  final String customerName;
  final String customerMobile;
  final String customerEmail;
  final int guestCount;
  final double totalAmount;
  final String paymentStatus;
  final String status;
  final bool whatsappSent;
  final String createdAt;

  DiningEventBookingModel({
    required this.id,
    required this.bookingReference,
    required this.eventId,
    required this.eventTitle,
    required this.customerName,
    required this.customerMobile,
    required this.customerEmail,
    required this.guestCount,
    required this.totalAmount,
    required this.paymentStatus,
    required this.status,
    required this.whatsappSent,
    required this.createdAt,
  });

  factory DiningEventBookingModel.fromJson(Map<String, dynamic> json) {
    return DiningEventBookingModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      bookingReference: json['bookingReference']?.toString() ?? '',
      eventId: json['eventId'] is int ? json['eventId'] : int.tryParse(json['eventId']?.toString() ?? '0') ?? 0,
      eventTitle: json['eventTitle']?.toString() ?? '',
      customerName: json['customerName']?.toString() ?? '',
      customerMobile: json['customerMobile']?.toString() ?? '',
      customerEmail: json['customerEmail']?.toString() ?? '',
      guestCount: json['guestCount'] is int ? json['guestCount'] : int.tryParse(json['guestCount']?.toString() ?? '1') ?? 1,
      totalAmount: json['totalAmount'] != null ? (json['totalAmount'] as num).toDouble() : 0.0,
      paymentStatus: json['paymentStatus']?.toString() ?? 'PAID',
      status: json['status']?.toString() ?? 'CONFIRMED',
      whatsappSent: json['whatsappSent'] == true,
      createdAt: json['createdAt']?.toString() ?? '',
    );
  }
}
