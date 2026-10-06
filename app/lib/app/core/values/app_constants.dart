import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class AppConstants {
  static const String appName = 'Sizzlo';
  static const String appTagline = 'Exclusive Dining & Privileges';
  
  static const String _envApiUrl = String.fromEnvironment('API_URL');

  // Platform-adaptive local backend API URL (Port 8080)
  static String get baseUrl {
    if (_envApiUrl.isNotEmpty) {
      return _envApiUrl;
    }
    if (kIsWeb) {
      return '/api';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://192.168.0.33:8080/api';
      }
    } catch (_) {}
    return 'http://localhost:8080/api';
  }

  static const String defaultMembershipId = '';
  static const String defaultUserMobile = '';
  static const String defaultUserName = 'Guest';

  // Dynamic session state updated upon live registration / authentication
  static String currentMembershipId = '';
  static String currentUserMobile = '';
  static String currentUserName = defaultUserName;
  static String currentUserEmail = '';
  static String? currentAuthToken;
}
