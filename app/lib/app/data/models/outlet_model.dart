class OutletModel {
  final int id;
  final String name;
  final String brand;
  final String address;
  final String city;
  final String contactNumber;
  final double rating;
  final bool isUpcoming;
  final String conceptTag;
  final String targetLaunchDate;
  final String openingHours;
  final double latitude;
  final double longitude;
  final String imageUrl;

  OutletModel({
    required this.id,
    required this.name,
    required this.brand,
    required this.address,
    required this.city,
    required this.contactNumber,
    required this.rating,
    required this.isUpcoming,
    required this.conceptTag,
    required this.targetLaunchDate,
    required this.openingHours,
    required this.latitude,
    required this.longitude,
    required this.imageUrl,
  });

  factory OutletModel.fromJson(Map<String, dynamic> json) {
    return OutletModel(
      id: json['id'] is int ? json['id'] : int.tryParse(json['id']?.toString() ?? '0') ?? 0,
      name: json['name']?.toString() ?? '',
      brand: json['brand']?.toString() ?? 'Yanki Sizzlerr',
      address: json['address']?.toString() ?? '',
      city: json['city']?.toString() ?? 'Ahmedabad',
      contactNumber: json['contactNumber']?.toString() ?? '',
      rating: (json['rating'] as num?)?.toDouble() ?? 4.8,
      isUpcoming: json['isUpcoming'] == true,
      conceptTag: json['conceptTag']?.toString() ?? '',
      targetLaunchDate: json['targetLaunchDate']?.toString() ?? '',
      openingHours: json['openingHours']?.toString() ?? '12:00 PM - 11:30 PM',
      latitude: (json['latitude'] as num?)?.toDouble() ?? 23.0373,
      longitude: (json['longitude'] as num?)?.toDouble() ?? 72.5120,
      imageUrl: json['imageUrl']?.toString() ?? 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'brand': brand,
      'address': address,
      'city': city,
      'contactNumber': contactNumber,
      'rating': rating,
      'isUpcoming': isUpcoming,
      'conceptTag': conceptTag,
      'targetLaunchDate': targetLaunchDate,
      'openingHours': openingHours,
      'latitude': latitude,
      'longitude': longitude,
      'imageUrl': imageUrl,
    };
  }

  /// Calculates whether the outlet is currently open based on current device time
  bool get isOpenNow {
    if (isUpcoming) return false;
    final text = openingHours.trim().toLowerCase();
    if (text.contains('soon') || text.contains('closed')) return false;
    if (!text.contains('-')) return true;

    try {
      final parts = openingHours.split('-');
      if (parts.length < 2) return true;

      int? parseTimeToMinutes(String timeStr) {
        final clean = timeStr.trim().toUpperCase();
        final isPm = clean.contains('PM');
        final isAm = clean.contains('AM');
        final digitsPart = clean.replaceAll('AM', '').replaceAll('PM', '').trim();
        final timeComponents = digitsPart.split(':');
        if (timeComponents.isEmpty) return null;

        int hour = int.tryParse(timeComponents[0].trim()) ?? 0;
        int minute = timeComponents.length > 1 ? (int.tryParse(timeComponents[1].trim()) ?? 0) : 0;

        if (isPm) {
          if (hour < 12) hour += 12;
        } else if (isAm) {
          if (hour == 12) hour = 0; // 12:00 AM midnight
        }
        return hour * 60 + minute;
      }

      final startMinutes = parseTimeToMinutes(parts[0]);
      var endMinutes = parseTimeToMinutes(parts[1]);

      if (startMinutes == null || endMinutes == null) return true;

      // When closing is "12:00 AM", treat as midnight (end of business day = 1440 mins)
      if (parts[1].toUpperCase().contains('12') && parts[1].toUpperCase().contains('AM')) {
        endMinutes = 24 * 60; // 1440 mins
      }

      final now = DateTime.now();
      final currentMinutes = now.hour * 60 + now.minute;

      if (endMinutes > startMinutes) {
        // Standard same-day window (e.g. 11:30 AM to 11:30 PM, or 12:00 PM to 12:00 AM)
        return currentMinutes >= startMinutes && currentMinutes < endMinutes;
      } else {
        // Late-night window past midnight (e.g. 12:00 PM to 01:00 AM)
        return currentMinutes >= startMinutes || currentMinutes < endMinutes;
      }
    } catch (_) {
      return true;
    }
  }

  String get statusBadgeText {
    if (isUpcoming) return 'OPENING SOON';
    return isOpenNow ? 'OPEN NOW' : 'CLOSED';
  }
}
