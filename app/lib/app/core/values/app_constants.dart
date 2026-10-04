class AppConstants {
  static const String appName = 'Sizzlo';
  static const String appTagline = 'Exclusive Dining & Privileges';
  
  // Backend API URL (Default local backend port 8080)
  static const String baseUrl = 'http://localhost:8080/api';
  static const String defaultMembershipId = 'YSM-2024-04821';
  static const String defaultUserMobile = '+91 98250 12345';

  // Dynamic session state updated upon live OTP authentication
  static String currentMembershipId = defaultMembershipId;
  static String currentUserMobile = defaultUserMobile;
  static String? currentAuthToken;
}

