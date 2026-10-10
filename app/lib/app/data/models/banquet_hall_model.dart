class BanquetHallModel {
  final dynamic id;
  final String name;
  final String outletName;
  final int minCapacity;
  final int maxCapacity;
  final double ratePerPlate;
  final double slotRentalPrice;
  final String supportedSessions;
  final String amenities;
  final String status;
  final String imageUrl;

  BanquetHallModel({
    this.id,
    required this.name,
    required this.outletName,
    this.minCapacity = 50,
    this.maxCapacity = 250,
    this.ratePerPlate = 950.0,
    this.slotRentalPrice = 35000.0,
    this.supportedSessions = 'Morning,Evening',
    this.amenities = '',
    this.status = 'Active',
    this.imageUrl = '',
  });

  factory BanquetHallModel.fromJson(Map<String, dynamic> json) {
    return BanquetHallModel(
      id: json['id'],
      name: json['name'] as String? ?? 'Banquet Hall',
      outletName: json['outletName'] as String? ?? 'House of Yanki Banquets',
      minCapacity: (json['minCapacity'] as num?)?.toInt() ?? 50,
      maxCapacity: (json['maxCapacity'] as num?)?.toInt() ?? 250,
      ratePerPlate: (json['ratePerPlate'] as num?)?.toDouble() ?? 950.0,
      slotRentalPrice: (json['slotRentalPrice'] as num?)?.toDouble() ?? 35000.0,
      supportedSessions: json['supportedSessions'] as String? ?? 'Morning,Evening',
      amenities: json['amenities'] as String? ?? '',
      status: json['status'] as String? ?? 'Active',
      imageUrl: json['imageUrl'] as String? ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'outletName': outletName,
      'minCapacity': minCapacity,
      'maxCapacity': maxCapacity,
      'ratePerPlate': ratePerPlate,
      'slotRentalPrice': slotRentalPrice,
      'supportedSessions': supportedSessions,
      'amenities': amenities,
      'status': status,
      'imageUrl': imageUrl,
    };
  }

  List<String> get amenitiesList {
    if (amenities.isEmpty) return [];
    return amenities.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
  }

  List<String> get sessionsList {
    if (supportedSessions.isEmpty) return [];
    return supportedSessions.split(',').map((e) => e.trim()).where((e) => e.isNotEmpty).toList();
  }
}
