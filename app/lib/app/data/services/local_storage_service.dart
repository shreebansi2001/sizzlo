import 'package:shared_preferences/shared_preferences.dart';

class LocalStorageService {
  static const String keyHasSeenOnboarding = 'has_seen_onboarding';
  static const String keyIsLoggedIn = 'is_logged_in';
  static const String keyUserMobile = 'user_mobile';
  static const String keyMembershipId = 'membership_id';
  static const String keyUserName = 'user_name';
  static const String keyUserTier = 'user_tier';
  static const String keyUserProfilePic = 'user_profile_pic';

  static Future<bool> hasSeenOnboarding() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(keyHasSeenOnboarding) ?? false;
  }

  static Future<void> setHasSeenOnboarding(bool value) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(keyHasSeenOnboarding, value);
  }

  static Future<bool> isLoggedIn() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getBool(keyIsLoggedIn) ?? false;
  }

  static Future<void> saveUserSession({
    required String mobile,
    required String membershipId,
    required String name,
    String? tier,
    String? profilePic,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(keyHasSeenOnboarding, true);
    await prefs.setBool(keyIsLoggedIn, true);
    await prefs.setString(keyUserMobile, mobile);
    await prefs.setString(keyMembershipId, membershipId);
    await prefs.setString(keyUserName, name);
    if (tier != null) {
      await prefs.setString(keyUserTier, tier);
    }
    if (profilePic != null && profilePic.isNotEmpty) {
      await prefs.setString(keyUserProfilePic, profilePic);
    }
  }

  static Future<void> saveProfilePic(String profilePic) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyUserProfilePic, profilePic);
  }

  static Future<Map<String, String?>> getUserSession() async {
    final prefs = await SharedPreferences.getInstance();
    return {
      'mobile': prefs.getString(keyUserMobile),
      'membershipId': prefs.getString(keyMembershipId),
      'name': prefs.getString(keyUserName),
      'tier': prefs.getString(keyUserTier),
      'profilePic': prefs.getString(keyUserProfilePic),
    };
  }

  static Future<void> clearUserSession() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(keyIsLoggedIn, false);
    await prefs.remove(keyUserMobile);
    await prefs.remove(keyMembershipId);
    await prefs.remove(keyUserName);
    await prefs.remove(keyUserTier);
    await prefs.remove(keyUserProfilePic);
    // Note: Do NOT clear has_seen_onboarding so logged out users don't see onboarding again!
  }

  // --- LAST TABLE BOOKING PERSISTENCE ---
  static const String keyLastBookingOutlet = 'last_booking_outlet';
  static const String keyLastBookingTime = 'last_booking_time';
  static const String keyLastBookingGuests = 'last_booking_guests';
  static const String keyLastBookingOccasion = 'last_booking_occasion';
  static const String keyLastBookingRef = 'last_booking_ref';
  static const String keyLastBookingAdvance = 'last_booking_advance';
  static const String keyLastBookingPaid = 'last_booking_paid';
  static const String keyLastBookingTimestamp = 'last_booking_timestamp';

  static Future<void> saveLastBooking({
    required String outlet,
    required String time,
    required int guests,
    String? occasion,
    required String bookingReference,
    double advancePaid = 99.0,
    String? paymentId,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(keyLastBookingOutlet, outlet);
    await prefs.setString(keyLastBookingTime, time);
    await prefs.setInt(keyLastBookingGuests, guests);
    if (occasion != null) await prefs.setString(keyLastBookingOccasion, occasion);
    await prefs.setString(keyLastBookingRef, bookingReference);
    await prefs.setDouble(keyLastBookingAdvance, advancePaid);
    await prefs.setBool(keyLastBookingPaid, true);
    await prefs.setString(keyLastBookingTimestamp, DateTime.now().toIso8601String());
  }

  static Future<Map<String, dynamic>?> getLastBooking() async {
    final prefs = await SharedPreferences.getInstance();
    final outlet = prefs.getString(keyLastBookingOutlet);
    if (outlet == null || outlet.isEmpty) return null;
    return {
      'outlet': outlet,
      'time': prefs.getString(keyLastBookingTime) ?? '',
      'guests': prefs.getInt(keyLastBookingGuests) ?? 2,
      'occasion': prefs.getString(keyLastBookingOccasion) ?? 'Regular',
      'bookingReference': prefs.getString(keyLastBookingRef) ?? '',
      'advancePaid': prefs.getDouble(keyLastBookingAdvance) ?? 99.0,
      'advancePaidFlag': prefs.getBool(keyLastBookingPaid) ?? true,
      'timestamp': prefs.getString(keyLastBookingTimestamp) ?? '',
    };
  }

  static Future<void> clearLastBooking() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(keyLastBookingOutlet);
    await prefs.remove(keyLastBookingTime);
    await prefs.remove(keyLastBookingGuests);
    await prefs.remove(keyLastBookingOccasion);
    await prefs.remove(keyLastBookingRef);
    await prefs.remove(keyLastBookingAdvance);
    await prefs.remove(keyLastBookingPaid);
    await prefs.remove(keyLastBookingTimestamp);
  }
}
