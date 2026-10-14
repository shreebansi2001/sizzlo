import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class AppConstants {
  static const String appName = 'Sizzlo';
  static const String appTagline = 'Exclusive Dining & Privileges';
  
  static const String _envApiUrl = String.fromEnvironment('API_URL');

  // Set to true only if you explicitly want to run against local Mac backend (127.0.0.1:8085)
  static const bool useLocalBackend = false;

  // Backend API URL (Connected to live cheeragskitchen.in production)
  static String get baseUrl {
    if (_envApiUrl.isNotEmpty) {
      return _envApiUrl;
    }
    if (kIsWeb) {
      return '/api';
    }
    if (useLocalBackend && kDebugMode) {
      try {
        if (Platform.isAndroid) {
          return 'http://127.0.0.1:8085/api';
        }
      } catch (_) {}
      return 'http://127.0.0.1:8085/api';
    }
    return 'https://cheeragskitchen.in/Sizzlo/api';
  }

  /// True when running locally against 127.0.0.1 or localhost
  static bool get isDevMode => baseUrl.contains('127.0.0.1') || baseUrl.contains('localhost');

  static const String defaultMembershipId = 'YSM-2024-9153';
  static const String defaultUserMobile = '+91 9099137653';
  static const String defaultUserName = 'bansi';

  // Dynamic session state updated upon live registration / authentication
  static String currentMembershipId = defaultMembershipId;
  static String currentUserMobile = defaultUserMobile;
  static String currentUserName = defaultUserName;
  static String currentUserEmail = '';
  static String currentUserProfilePic = '';
  static String? currentAuthToken;
}
