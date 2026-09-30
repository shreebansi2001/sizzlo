import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/member_model.dart';
import '../models/coupon_model.dart';
import '../models/reservation_model.dart';
import '../models/loyalty_model.dart';
import '../../core/values/app_constants.dart';

class ApiService {
  final http.Client _client = http.Client();

  Future<MemberModel> getMemberProfile([String? membershipId]) async {
    final id = membershipId ?? AppConstants.defaultMembershipId;
    try {
      final res = await _client.get(Uri.parse('${AppConstants.baseUrl}/members/$id'))
          .timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          return MemberModel.fromJson(body['data']);
        }
      }
    } catch (_) {
      // Offline fallback
    }
    return MemberModel.defaultProfile();
  }

  Future<List<CouponModel>> getCoupons() async {
    try {
      final res = await _client.get(Uri.parse('${AppConstants.baseUrl}/coupons'))
          .timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => CouponModel.fromJson(e)).toList();
        }
      }
    } catch (_) {
      // Offline fallback
    }
    return _mockCoupons();
  }

  Future<CouponModel?> redeemCoupon(String code, [String? memberId]) async {
    final id = memberId ?? AppConstants.defaultMembershipId;
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/coupons/$code/redeem?membershipId=$id'),
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
    final mob = mobile ?? AppConstants.defaultUserMobile;
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/reservations/my?mobile=${Uri.encodeComponent(mob)}'),
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => ReservationModel.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return _mockReservations();
  }

  Future<bool> bookReservation({
    required String name,
    required String mobile,
    required String outlet,
    required String time,
    required int guests,
    bool vip = false,
    String? specialRequests,
  }) async {
    try {
      final res = await _client.post(
        Uri.parse('${AppConstants.baseUrl}/reservations'),
        headers: {'Content-Type': 'application/json'},
        body: json.encode({
          'customerName': name,
          'customerMobile': mobile,
          'outlet': outlet,
          'reservationTime': time,
          'guests': guests,
          'vip': vip,
          'specialRequests': specialRequests,
        }),
      ).timeout(const Duration(seconds: 4));
      return res.statusCode == 200;
    } catch (_) {
      return true; // Optimistic success in demo mode
    }
  }

  Future<List<LoyaltyTransactionModel>> getLoyaltyHistory([String? memberId]) async {
    final id = memberId ?? AppConstants.defaultMembershipId;
    try {
      final res = await _client.get(
        Uri.parse('${AppConstants.baseUrl}/members/$id/loyalty'),
      ).timeout(const Duration(seconds: 4));
      if (res.statusCode == 200) {
        final body = json.decode(res.body);
        if (body['success'] == true && body['data'] != null) {
          final List list = body['data'];
          return list.map((e) => LoyaltyTransactionModel.fromJson(e)).toList();
        }
      }
    } catch (_) {}
    return _mockLoyaltyTransactions();
  }

  List<CouponModel> _mockCoupons() {
    return [
      CouponModel(id: "1", code: "C-01", name: "50% Dining Discount", subtitle: "Up to ₹2,000 off", description: "50% off on food and soft beverages", leftCount: 2, totalCount: 3, expiryDate: "30 Jun 2027", status: "available", outlet: "All Yanki Outlets", color: "royal"),
      CouponModel(id: "2", code: "C-02", name: "Birthday Special", subtitle: "Complimentary cake + 30% off", description: "Chef special chocolate celebration cake", leftCount: 1, totalCount: 1, expiryDate: "20 Jun 2027", status: "available", outlet: "Yanki Signature", color: "gold"),
      CouponModel(id: "3", code: "C-03", name: "Anniversary Special", subtitle: "Free 3-course meal for 2", description: "Romantic candlelit 3-course dining experience", leftCount: 1, totalCount: 1, expiryDate: "20 Jun 2027", status: "available", outlet: "Yanki Banquet", color: "royal"),
      CouponModel(id: "4", code: "C-04", name: "Corporate Discount", subtitle: "25% off on bills above ₹5,000", description: "Valid Monday through Friday", leftCount: 2, totalCount: 2, expiryDate: "31 Dec 2026", status: "available", outlet: "All Outlets", color: "royal"),
      CouponModel(id: "5", code: "C-05", name: "Dough by Yanki", subtitle: "Buy 1 Get 1 Pizza", description: "Woodfired gourmet pizzas", leftCount: 2, totalCount: 3, expiryDate: "30 Sep 2026", status: "available", outlet: "Dough by Yanki", color: "gold"),
      CouponModel(id: "6", code: "C-06", name: "Banquet Discount", subtitle: "15% off on banquet hall bookings", description: "Valid for corporate & family gatherings", leftCount: 1, totalCount: 1, expiryDate: "20 Jun 2027", status: "available", outlet: "Yanki Banquet", color: "royal"),
      CouponModel(id: "7", code: "C-07", name: "ODC Benefits", subtitle: "10% off outdoor catering", description: "Outdoor catering master chefs & live counters", leftCount: 0, totalCount: 1, expiryDate: "15 May 2026", status: "used", outlet: "Yanki ODC", color: "royal"),
      CouponModel(id: "8", code: "C-08", name: "Festive Brunch", subtitle: "Complimentary mocktail", description: "Sunday royal brunch experience", leftCount: 0, totalCount: 1, expiryDate: "01 Mar 2026", status: "used", outlet: "Yanki Signature", color: "royal"),
    ];
  }

  List<ReservationModel> _mockReservations() {
    return [
      ReservationModel(id: "1", bookingReference: "R-2841", customerName: "Rahul Mehta", customerMobile: "+91 98250 12345", outlet: "Yanki Signature", reservationTime: "20 Jun, 8:30 PM", guests: 4, status: "Confirmed", vip: true, specialRequests: "Quiet corner table near garden"),
      ReservationModel(id: "2", bookingReference: "R-2840", customerName: "Priya Shah", customerMobile: "+91 98250 20000", outlet: "Dough by Yanki", reservationTime: "21 Jun, 7:00 PM", guests: 2, status: "Confirmed", vip: false),
    ];
  }

  List<LoyaltyTransactionModel> _mockLoyaltyTransactions() {
    return [
      LoyaltyTransactionModel(id: "1", title: "Dine-in at Yanki Signature", description: "Earned 10 points per ₹100 spent", points: 1200, type: "EARN", outletName: "Yanki Signature", time: "2 days ago"),
      LoyaltyTransactionModel(id: "2", title: "Redeemed for Chef's Tasting Vouchers", description: "Redeemed at Yanki Banquet", points: -5000, type: "REDEEM", outletName: "Yanki Banquet", time: "1 week ago"),
      LoyaltyTransactionModel(id: "3", title: "VIP Membership Anniversary Bonus", description: "Annual loyalty milestone credit", points: 10000, type: "BONUS", outletName: "All Yanki Outlets", time: "2 weeks ago"),
    ];
  }
}
