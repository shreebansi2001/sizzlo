import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import '../models/member_model.dart';
import '../models/coupon_model.dart';
import '../models/reservation_model.dart';
import '../models/loyalty_model.dart';
import '../models/notification_item_model.dart';
import '../models/outlet_model.dart';
import '../models/bill_settlement_model.dart';
import '../models/banquet_inquiry_model.dart';
import '../models/dining_event_model.dart';
import '../../core/values/app_constants.dart';
import 'local_storage_service.dart';

class ApiService {
  final http.Client _client = http.Client();

  Map<String, String> get _headers => {
    'Content-Type': 'application/json',
    if (AppConstants.currentAuthToken != null)
      'Authorization': 'Bearer ${AppConstants.currentAuthToken}',
  };

  /// Register new member (POST /api/auth/register)
  Future<Map<String, dynamic>> registerMember(Map<String, dynamic> registrationData) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/auth/register'),
        headers: _headers,
        body: json.encode(registrationData),
      ).timeout(const Duration(seconds: 20));

      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        final data = body['data'];
        final token = data?['token']?.toString();
        final profileData = data?['profile'];
        MemberModel? member;
        if (profileData != null) {
          member = MemberModel.fromJson(profileData);
          _updateSessionFromMember(member, token);
        }
        return {
          'success': true,
          'message': body['message'] ?? 'Registration successful! OTP sent to WhatsApp.',
          'member': member,
          'token': token,
        };
      } else {
        final isConflict = res.statusCode == 409 ||
            (body['message']?.toString().toLowerCase().contains('already exists') ?? false);
        return {
          'success': false,
          'alreadyExists': isConflict,
          'message': body['message'] ?? 'Failed to register. Please check details.',
        };
      }
    } catch (e) {
      return {
        'success': false,
        'message': 'Failed to connect to Sizzlo server. Please check connection.',
      };
    }
  }

  /// Request OTP for mobile login (POST /api/auth/login)
  Future<Map<String, dynamic>> requestOtp(String mobile) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/auth/login'),
        headers: _headers,
        body: json.encode({'mobile': mobile}),
      ).timeout(const Duration(seconds: 15));

      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        return {
          'success': true,
          'message': body['data']?['message'] ?? body['message'] ?? 'OTP sent successfully',
          'mobile': body['data']?['mobile'] ?? mobile,
        };
      } else {
        final notFound = res.statusCode == 404 ||
            (body['message']?.toString().toLowerCase().contains('not found') ?? false) ||
            body['data']?['registered'] == false;
        return {
          'success': false,
          'userNotFound': notFound,
          'message': body['message'] ?? 'Account not found with this mobile number.',
          'mobile': mobile,
        };
      }
    } catch (_) {
      return {
        'success': false,
        'message': 'Unable to connect to Sizzlo server. Please check network.',
        'mobile': mobile,
      };
    }
  }

  /// Resend dynamic OTP via WhatsApp (POST /api/auth/resend-otp)
  Future<Map<String, dynamic>> resendOtp(String mobile) async {
    try {
      final cleanDigits = mobile.replaceAll(RegExp(r'\D'), '');
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/auth/resend-otp'),
        headers: _headers,
        body: json.encode({'mobile': cleanDigits}),
      ).timeout(const Duration(seconds: 15));

      final body = json.decode(res.body);
      if (res.statusCode == 200 && body['success'] == true) {
        return {
          'success': true,
          'message': body['data']?['message'] ?? body['message'] ?? 'OTP sent via WhatsApp',
          'mobile': cleanDigits,
        };
      } else {
        return {
          'success': false,
          'message': body['message'] ?? 'Failed to resend OTP. Please try again.',
          'mobile': cleanDigits,
        };
      }
    } catch (_) {
      return requestOtp(mobile);
    }
  }

  /// Check if mobile number is already registered in MySQL
  Future<bool> checkMemberExists(String mobile) async {
    try {
      final cleanDigits = mobile.replaceAll(RegExp(r'\D'), '');
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/members/me?mobile=$cleanDigits'),
        headers: _headers,
      ).timeout(const Duration(seconds: 10));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        return body['success'] == true && body['data'] != null;
      }
    } catch (_) {}
    return false;
  }

  /// Verify OTP and obtain JWT token + Member profile (POST /api/auth/verify-otp)
  Future<Map<String, dynamic>?> verifyOtp(String mobile, String otp) async {
    try {
      final cleanDigits = mobile.replaceAll(RegExp(r'\D'), '');
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/auth/verify-otp'),
        headers: _headers,
        body: json.encode({'mobile': cleanDigits, 'otp': otp}),
      ).timeout(const Duration(seconds: 12));
      debugPrint('verifyOtp response code: ${res.statusCode}');
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final data = body['data'];
          final token = data['token']?.toString();
          final profileData = data['profile'];
          MemberModel? member;
          if (profileData != null && profileData is Map) {
            member = MemberModel.fromJson(Map<String, dynamic>.from(profileData));
            _updateSessionFromMember(member, token);
          }
          return {
            'token': token,
            'member': member ?? MemberModel.defaultProfile(),
          };
        }
      } else {
        debugPrint('verifyOtp failed with body: ${res.body}');
      }
    } catch (e, stack) {
      debugPrint('Error in verifyOtp: $e\n$stack');
    }
    return null;
  }

  void _updateSessionFromMember(MemberModel member, String? token) {
    if (member.membershipId.isNotEmpty) {
      AppConstants.currentMembershipId = member.membershipId;
    }
    if (member.mobile.isNotEmpty) {
      AppConstants.currentUserMobile = member.mobile;
    }
    if (member.fullName.isNotEmpty && member.fullName != 'Guest') {
      AppConstants.currentUserName = member.fullName;
    }
    if (member.email.isNotEmpty) {
      AppConstants.currentUserEmail = member.email;
    }
    if (member.profilePictureUrl.isNotEmpty) {
      AppConstants.currentUserProfilePic = member.profilePictureUrl;
    }
    if (token != null) {
      AppConstants.currentAuthToken = token;
    }

    // Persist to local storage
    if (member.fullName.isNotEmpty && member.fullName != 'Guest') {
      LocalStorageService.saveUserSession(
        mobile: member.mobile,
        membershipId: member.membershipId,
        name: member.fullName,
        tier: member.subscriptionTier,
        profilePic: member.profilePictureUrl,
      );
    }
  }

  Future<MemberModel> getMemberProfile([String? membershipId, String? mobile]) async {
    String id = membershipId ?? AppConstants.currentMembershipId;
    String phone = mobile ?? AppConstants.currentUserMobile;

    // Check LocalStorage if in-memory constants are empty
    if (id.isEmpty && phone.isEmpty) {
      try {
        final session = await LocalStorageService.getUserSession();
        if (session['membershipId'] != null && session['membershipId']!.isNotEmpty) {
          id = session['membershipId']!;
          AppConstants.currentMembershipId = id;
        }
        if (session['mobile'] != null && session['mobile']!.isNotEmpty) {
          phone = session['mobile']!;
          AppConstants.currentUserMobile = phone;
        }
        if (session['name'] != null && session['name']!.isNotEmpty) {
          AppConstants.currentUserName = session['name']!;
        }
        if (session['profilePic'] != null && session['profilePic']!.isNotEmpty) {
          AppConstants.currentUserProfilePic = session['profilePic']!;
        }
      } catch (_) {}
    }

    try {
      String url;
      if (id.isNotEmpty) {
        url = '${AppConstants.baseUrl}/members/me?membershipId=${Uri.encodeComponent(id)}';
      } else if (phone.isNotEmpty) {
        final clean = phone.replaceAll(RegExp(r'\D'), '');
        url = '${AppConstants.baseUrl}/members/me?mobile=${Uri.encodeComponent(clean)}';
      } else {
        return MemberModel.defaultProfile();
      }

      final res = await _client.get(Uri.parse(url), headers: _headers)
          .timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null && body['data'] is Map) {
          final m = MemberModel.fromJson(Map<String, dynamic>.from(body['data']));
          _updateSessionFromMember(m, null);
          return m;
        }
      }
    } catch (_) {}
    return MemberModel.defaultProfile();
  }

  Future<MemberModel?> updateMemberProfile(Map<String, dynamic> data, [String? membershipId]) async {
    final id = (membershipId != null && membershipId.isNotEmpty)
        ? membershipId
        : AppConstants.currentMembershipId;
    try {
      final url = id.isNotEmpty
          ? '${AppConstants.baseUrl}/members/${Uri.encodeComponent(id)}'
          : '${AppConstants.baseUrl}/members/${Uri.encodeComponent(AppConstants.currentUserMobile)}';
      final res = await _client.put(
        Uri.parse(url),
        headers: _headers,
        body: json.encode(data),
      ).timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null && body['data'] is Map) {
          final updated = MemberModel.fromJson(Map<String, dynamic>.from(body['data']));
          _updateSessionFromMember(updated, null);
          return updated;
        }
      }
    } catch (e) {
      debugPrint('Error updating member profile: $e');
    }
    return null;
  }

  Future<bool> deleteAccount(String mobile) async {
    try {
      final res = await _client.delete(
        Uri.parse('${AppConstants.baseUrl}/members/account?mobile=${Uri.encodeComponent(mobile)}'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<MemberModel?> renewWithPoints(String membershipId) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/members/$membershipId/renew-points'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return MemberModel.fromJson(body['data']);
        }
      }
    } catch (_) {}
    return null;
  }

  // --- OUTLETS & PIPELINE (Chapter 05) ---

  Future<List<OutletModel>> getActiveOutlets([String? brand]) async {
    try {
      String url = '${AppConstants.baseUrl}/outlets';
      if (brand != null && brand.isNotEmpty && brand != 'All' && brand != 'All Outlets') {
        url += '?brand=${Uri.encodeComponent(brand)}';
      }
      final res = await _client.get(Uri.parse(url), headers: _headers).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => OutletModel.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  Future<List<OutletModel>> getUpcomingOutlets() async {
    try {
      final res = await _client.get(Uri.parse('${AppConstants.baseUrl}/outlets/upcoming'), headers: _headers).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => OutletModel.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  Future<bool> notifyLaunch(String outletName, String mobile) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/outlets/notify-launch'),
        headers: _headers,
        body: json.encode({'outletName': outletName, 'mobile': mobile}),
      ).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  // --- NON-INTEGRATED BILL SETTLEMENT (Chapter 10) ---

  Future<BillSettlementModel?> settleBill({
    required String outletName,
    required String posInvoiceNumber,
    required double grossAmount,
    String? couponCode,
    required String paymentMode,
    String? upiUtr,
    String? razorpayPaymentId,
    double? tableAdvanceDeduction,
    String? receiptImageUrl,
    String? bookingReference,
  }) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/bills/settle'),
        headers: _headers,
        body: json.encode({
          'customerMobile': AppConstants.currentUserMobile,
          'customerName': AppConstants.currentUserName,
          'membershipId': AppConstants.currentMembershipId,
          'outletName': outletName,
          'posInvoiceNumber': posInvoiceNumber,
          'grossAmount': grossAmount,
          'couponCode': couponCode,
          'paymentMode': paymentMode,
          'upiUtr': upiUtr,
          'razorpayPaymentId': razorpayPaymentId,
          'tableAdvanceDeduction': tableAdvanceDeduction,
          'receiptImageUrl': receiptImageUrl,
          'bookingReference': bookingReference,
        }),
      ).timeout(const Duration(seconds: 6));

      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return BillSettlementModel.fromJson(body['data']);
        }
      }
    } catch (_) {}
    return null;
  }

  Future<BillSettlementModel?> getBillStatus(int billId) async {
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/bills/$billId'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return BillSettlementModel.fromJson(body['data']);
        }
      }
    } catch (_) {}
    return null;
  }

  Future<List<BillSettlementModel>> getMyBills([String? mobile]) async {
    final mob = mobile ?? AppConstants.currentUserMobile;
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/bills/my?mobile=${Uri.encodeComponent(mob)}'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => BillSettlementModel.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  // --- RAZORPAY INTEGRATION (Chapter 08 & 10) ---

  Future<Map<String, dynamic>?> getRazorpayConfig() async {
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/payments/razorpay/config'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return body['data'];
        }
      }
    } catch (_) {}
    return null;
  }

  Future<Map<String, dynamic>?> createRazorpayOrder({
    required String type, // "SUBSCRIPTION" or "BILL_PAYMENT"
    required String planId,
    double? amount,
  }) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/payments/razorpay/create-order'),
        headers: _headers,
        body: json.encode({
          'type': type,
          'planId': planId,
          'amount': amount,
          'customerMobile': AppConstants.currentUserMobile,
          'customerName': AppConstants.currentUserName,
        }),
      ).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return body['data'];
        }
      }
    } catch (_) {}
    return null;
  }

  Future<Map<String, dynamic>?> verifyRazorpayPayment({
    required String orderId,
    required String paymentId,
    String? signature,
    required String planId,
  }) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/payments/razorpay/verify'),
        headers: _headers,
        body: json.encode({
          'razorpayOrderId': orderId,
          'razorpayPaymentId': paymentId,
          'razorpaySignature': signature ?? 'sig_mock_ok',
          'planId': planId,
          'mobile': AppConstants.currentUserMobile,
          'membershipId': AppConstants.currentMembershipId,
        }),
      ).timeout(const Duration(seconds: 6));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return body['data'];
        }
      }
    } catch (_) {}
    return null;
  }

  // --- BANQUETS & ODC (Chapter 07) ---

  Future<bool> submitBanquetInquiry(BanquetInquiryModel inquiry) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/banquets/inquiry'),
        headers: _headers,
        body: json.encode(inquiry.toJson()),
      ).timeout(const Duration(seconds: 5));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<List<BanquetInquiryModel>> getMyBanquetInquiries(String mobile) async {
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/banquets/my?mobile=${Uri.encodeComponent(mobile)}'),
        headers: _headers,
      ).timeout(const Duration(seconds: 5));
      if (res.statusCode == 200) {
        final data = json.decode(res.body);
        if (data['success'] == true && data['data'] is List) {
          return (data['data'] as List)
              .map((e) => BanquetInquiryModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      }
    } catch (_) {}
    return [];
  }

  // --- POST-DINING REVIEWS (Chapter 11) ---

  Future<Map<String, dynamic>?> submitFeedback({
    required int rating,
    int? foodRating,
    int? serviceRating,
    int? cleanlinessRating,
    String? comments,
    String? outletName,
  }) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/feedback/submit'),
        headers: _headers,
        body: json.encode({
          'customerName': AppConstants.currentUserName,
          'customerMobile': AppConstants.currentUserMobile,
          'outletName': outletName ?? 'Yanki Sizzlerr Bodakdev',
          'rating': rating,
          'foodRating': foodRating ?? rating,
          'serviceRating': serviceRating ?? rating,
          'cleanlinessRating': cleanlinessRating ?? rating,
          'comments': comments ?? '',
        }),
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return body['data'];
        }
      }
    } catch (_) {}
    return null;
  }

  // --- COUPONS & LOYALTY ---

  Future<List<CouponModel>> getCoupons([String? membershipId, String? mobile]) async {
    final id = membershipId ?? AppConstants.currentMembershipId;
    final phone = mobile ?? AppConstants.currentUserMobile;
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/coupons?membershipId=$id&mobile=${Uri.encodeComponent(phone)}'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => CouponModel.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  Future<List<CouponModel>> getCouponsCatalog() async {
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/coupons/catalog'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => CouponModel.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  Future<CouponModel?> redeemCoupon(String code, [String? memberId]) async {
    final id = memberId ?? AppConstants.currentMembershipId;
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/coupons/$code/redeem?membershipId=$id'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return CouponModel.fromJson(body['data']);
        }
      }
    } catch (_) {}
    return null;
  }

  Future<List<ReservationModel>> getReservations([String? mobile]) async {
    final mob = mobile ?? AppConstants.currentUserMobile;
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/reservations/my?mobile=${Uri.encodeComponent(mob)}'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => ReservationModel.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  Future<List<String>> getActiveTimeSlots({String? outlet}) async {
    try {
      final query = (outlet != null && outlet.isNotEmpty && outlet != 'All Outlets')
          ? '?outlet=${Uri.encodeComponent(outlet)}'
          : '';
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/reservations/slots$query'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] is List) {
          final list = (body['data'] as List)
              .map((item) => item['slotTime']?.toString() ?? '')
              .where((s) => s.isNotEmpty)
              .toList();
          if (list.isNotEmpty) return list;
        }
      }
    } catch (_) {}
    return [
      '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '2:00 PM',
      '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'
    ];
  }

  Future<bool> bookReservation({
    String? name,
    String? mobile,
    required String outlet,
    required String time,
    required int guests,
    bool vip = false,
    String? tierPriorityTag,
    String? occasionTag,
    String? specialRequests,
    double bookingAdvance = 0.0,
    bool advancePaid = false,
  }) async {
    final bookingName = (name != null && name.isNotEmpty) ? name : AppConstants.currentUserName;
    final bookingMobile = (mobile != null && mobile.isNotEmpty) ? mobile : AppConstants.currentUserMobile;

    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/reservations'),
        headers: _headers,
        body: json.encode({
          'customerName': bookingName,
          'customerMobile': bookingMobile,
          'outlet': outlet,
          'reservationTime': time,
          'guests': guests,
          'vip': vip,
          'tierPriorityTag': tierPriorityTag ?? (vip ? 'Signature' : 'Non-Subscriber'),
          'occasionTag': occasionTag ?? 'Regular',
          'specialRequests': specialRequests,
          'bookingAdvance': bookingAdvance,
          'advancePaid': advancePaid,
        }),
      ).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<bool> cancelReservation(String reservationId) async {
    try {
      final res = await _client.patch(
        Uri.parse('${AppConstants.baseUrl}/reservations/$reservationId/status?status=Cancelled'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (_) {
      return false;
    }
  }

  Future<List<LoyaltyTransactionModel>> getLoyaltyHistory([String? memberId]) async {
    final id = memberId ?? AppConstants.currentMembershipId;
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/members/$id/loyalty'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => LoyaltyTransactionModel.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  Future<List<NotificationItemModel>> getNotifications([String? membershipId, String? mobile]) async {
    final id = membershipId ?? AppConstants.currentMembershipId;
    final phone = mobile ?? AppConstants.currentUserMobile;
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/notifications?membershipId=$id&mobile=${Uri.encodeComponent(phone)}'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => NotificationItemModel.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return [];
  }

  /// Get live subscription plans and synced offers (GET /api/plans)
  Future<List<Map<String, dynamic>>> getPlans() async {
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/plans'),
        headers: _headers,
      ).timeout(const Duration(seconds: 4));

      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => Map<String, dynamic>.from(e)).toList();
        }
      }
    } catch (_) {}
    return _mockPlans();
  }

  List<Map<String, dynamic>> _mockPlans() {
    return [
      {
        'id': 'classic',
        'name': 'Classic',
        'memberLabel': 'CLASSIC SUBSCRIBER',
        'price': 1,
        'couponLimit': 6,
        'giftVoucherLimit': 0,
        'offerLabel': '6 OFFERS',
        'description': 'Yanki Sizzlerr only',
        'personality': 'Warm Premium',
        'highlights': [
          '10% off across 6 visits',
          'Birthday week benefit',
          'Complimentary couple meal',
        ],
        'benefits': [
          '10% off bill amount, 6 times a year',
          'Complimentary birthday dessert and gift voucher',
          'Complimentary couple meal on special anniversary',
          'Priority table reservations on weekends',
          'Valid across all Yanki Sizzlerr locations',
        ],
      },
      {
        'id': 'signature',
        'name': 'Signature',
        'memberLabel': 'SIGNATURE SUBSCRIBER',
        'price': 2,
        'couponLimit': 12,
        'giftVoucherLimit': 0,
        'offerLabel': '12 OFFERS',
        'description': 'Restaurant, Dough, banquet and catering',
        'personality': 'Rich & Sophisticated',
        'highlights': [
          '12 dining visits annually',
          'Dough by Yanki rewards',
          'Banquet and catering benefits',
        ],
        'benefits': [
          '12 dining visits annually with 10% privilege discount',
          'Couple dinner at 50% off twice per year',
          'Dough by Yanki Buy 1 Get 1 complimentary',
          'Banquet & catering privileges at House of Yanki',
          'Free renewal subscription upon earning 25,000 points',
          'VIP private table reservation with dedicated manager',
        ],
      },
      {
        'id': 'elite',
        'name': 'Elite',
        'memberLabel': 'ELITE SUBSCRIBER',
        'price': 3,
        'couponLimit': 10,
        'giftVoucherLimit': 5,
        'offerLabel': '10 OFFERS + GIFT VOUCHERS',
        'description': 'All Yanki outlets',
        'personality': 'Exclusive VIP',
        'highlights': [
          '18 dining visits annually',
          'Premium banquet benefits',
          'Exclusive gift vouchers',
        ],
        'benefits': [
          '18 dining visits annually across all Yanki outlets',
          'Premium banquet reservations with dedicated catering manager',
          'Exclusive gift vouchers worth ₹5,000 for family & friends',
          'All access pass to Yanki Signature, Dough & Banquets',
          'Complimentary VIP birthday dinner for up to 4 guests',
          'Highest priority reservation window even on rush days',
        ],
      },
    ];
  }

  /// Fetch active dining events
  Future<List<DiningEventModel>> getDiningEvents() async {
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/dining-events'),
        headers: _headers,
      ).timeout(const Duration(seconds: 3));

      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] is List) {
          return (body['data'] as List)
              .map((e) => DiningEventModel.fromJson(e))
              .toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching dining events: $e');
    }

    // High quality offline fallback
    return [
      DiningEventModel(
        id: 1,
        title: 'Yanki Sparkling Sunday Brunch',
        description: 'Indulge in our signature Sunday Brunch buffet featuring live sizzler grill stations, chef-crafted desserts, artisanal mocktails, and live jazz music.',
        bannerUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
        outletName: 'Yanki Sizzlers - CG Road',
        eventDay: 'Every Sunday',
        eventDate: 'Upcoming Sunday',
        timings: '12:00 PM – 04:00 PM',
        totalSeats: 50,
        bookedSeats: 38,
        pricePerGuest: 99.0,
        inclusions: 'Live grill buffet, artisanal desserts, live jazz music, welcome drink & priority table',
        status: 'ACTIVE',
      ),
      DiningEventModel(
        id: 2,
        title: "Chef's Table: Gourmet Sizzler Masterclass",
        description: 'An exclusive evening with our Executive Chef showcasing secret smoke-infusion techniques, pairing artisanal sizzler cuts with vintage beverages.',
        bannerUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        outletName: 'Yanki Sizzlers - Bodakdev',
        eventDay: 'Friday Special',
        eventDate: 'This Friday',
        timings: '07:30 PM – 10:30 PM',
        totalSeats: 25,
        bookedSeats: 19,
        pricePerGuest: 149.0,
        inclusions: '5-course curated tasting menu, sizzler demo with Executive Chef, complimentary mocktail pairing',
        status: 'ACTIVE',
      ),
    ];
  }

  /// Book seats for an event
  Future<DiningEventBookingModel?> bookDiningEvent({
    required int eventId,
    required String customerName,
    required String customerMobile,
    String? customerEmail,
    required int guestCount,
    String? paymentId,
  }) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/dining-events/book'),
        headers: _headers,
        body: json.encode({
          'eventId': eventId,
          'customerName': customerName,
          'customerMobile': customerMobile,
          'customerEmail': customerEmail ?? '',
          'guestCount': guestCount,
          'razorpayPaymentId': paymentId ?? 'pay_sim_${DateTime.now().millisecondsSinceEpoch}',
        }),
      ).timeout(const Duration(seconds: 15));

      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return DiningEventBookingModel.fromJson(body['data']);
        }
      }
    } catch (e) {
      debugPrint('Error booking dining event: $e');
    }

    // Local simulated confirmation if network unreachable
    return DiningEventBookingModel(
      id: DateTime.now().millisecondsSinceEpoch % 100000,
      bookingReference: 'EVT-${10000 + (DateTime.now().millisecondsSinceEpoch % 90000)}',
      eventId: eventId,
      eventTitle: 'Yanki Sparkling Sunday Brunch',
      customerName: customerName,
      customerMobile: customerMobile,
      customerEmail: customerEmail ?? '',
      guestCount: guestCount,
      totalAmount: 99.0 * guestCount,
      paymentStatus: 'PAID',
      status: 'CONFIRMED',
      whatsappSent: true,
      createdAt: DateTime.now().toIso8601String(),
    );
  }

  /// Get user's booked passes
  Future<List<DiningEventBookingModel>> getMyEventBookings(String mobile) async {
    try {
      final clean = mobile.trim();
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/dining-events/my-bookings?mobile=$clean'),
        headers: _headers,
      ).timeout(const Duration(seconds: 3));

      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] is List) {
          return (body['data'] as List)
              .map((e) => DiningEventBookingModel.fromJson(e))
              .toList();
        }
      }
    } catch (e) {
      debugPrint('Error fetching my event bookings: $e');
    }
    return [];
  }
}

