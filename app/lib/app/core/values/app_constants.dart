import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class AppConstants {
  static const String appName = 'Sizzlo';
  static const String appTagline = 'Exclusive Dining & Privileges';
  
  static const String _envApiUrl = String.fromEnvironment('API_URL');

  // Backend API URL
  static String get baseUrl {
    if (_envApiUrl.isNotEmpty) {
      return _envApiUrl;
    }
    if (kIsWeb) {
      return '/api';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:8080/api';
      }
    } catch (_) {}
    return 'http://127.0.0.1:8080/api';
  }

  static const String defaultMembershipId = '';
  static const String defaultUserMobile = '';
  static const String defaultUserName = 'Guest';

  // Dynamic session state updated upon live registration / authentication
  static String currentMembershipId = '';
  static String currentUserMobile = '';
  static String currentUserName = defaultUserName;
  static String currentUserEmail = '';
  static String currentUserProfilePic = '';
  static String? currentAuthToken;
}
