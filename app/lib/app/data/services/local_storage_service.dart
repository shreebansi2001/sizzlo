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
}
