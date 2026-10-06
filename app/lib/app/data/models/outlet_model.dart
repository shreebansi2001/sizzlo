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
}
