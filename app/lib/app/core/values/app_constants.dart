import 'dart:io' show Platform;
import 'package:flutter/foundation.dart';

class AppConstants {
  static const String appName = 'Sizzlo';
  static const String appTagline = 'Exclusive Dining & Privileges';
  
  // Platform-adaptive local backend API URL (Port 8080)
  static String get baseUrl {
    if (kIsWeb) {
      return '/api';
    }
    try {
      if (Platform.isAndroid) {
        return 'http://10.0.2.2:8080/api';
      }
    } catch (_) {}
    return 'http://localhost:8080/api';
  }

  static const String defaultMembershipId = 'YSM-2024-04821';
  static const String defaultUserMobile = '+91 98250 12345';
  static const String defaultUserName = 'VIP Guest';

  // Dynamic session state updated upon live registration / authentication
  static String currentMembershipId = defaultMembershipId;
  static String currentUserMobile = defaultUserMobile;
  static String currentUserName = defaultUserName;
  static String currentUserEmail = '';
  static String? currentAuthToken;
}
