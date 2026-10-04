import 'package:get/get.dart';
import '../../../data/models/member_model.dart';
import '../../../data/models/coupon_model.dart';
import '../../../data/services/api_service.dart';

class HomeController extends GetxController {
  final ApiService _apiService = ApiService();

  final RxString activePlan = 'signature'.obs; // Subscribed with Signature plan for client demo!
  final Rx<MemberModel> member = MemberModel.defaultProfile().obs;
  final RxList<CouponModel> featuredCoupons = <CouponModel>[].obs;
  final RxInt outletsCount = 5.obs;
  final RxList<Map<String, dynamic>> customerReviews = <Map<String, dynamic>>[].obs;
  final RxBool isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    member.value = member.value.copyWith(
      planId: activePlan.value,
      membershipType: 'SIGNATURE SUBSCRIBER',
    );
    loadDashboardData();
  }

  void switchPlan(String planId) {
    activePlan.value = planId;
    member.value = member.value.copyWith(
      planId: planId,
      membershipType: planId == 'classic'
          ? 'CLASSIC SUBSCRIBER'
          : planId == 'elite'
              ? 'ELITE SUBSCRIBER'
              : planId == 'signature'
                  ? 'SIGNATURE SUBSCRIBER'
                  : 'VIP MEMBER',
    );
  }

  Future<void> loadDashboardData() async {
    isLoading.value = true;
    try {
      final fetchedMember = await _apiService.getMemberProfile();
      member.value = fetchedMember.copyWith(
        planId: activePlan.value,
        membershipType: activePlan.value == 'classic'
            ? 'CLASSIC SUBSCRIBER'
            : activePlan.value == 'elite'
                ? 'ELITE SUBSCRIBER'
                : activePlan.value == 'signature'
                    ? 'SIGNATURE SUBSCRIBER'
                    : 'VIP MEMBER',
      );

      final allCoupons = await _apiService.getCoupons();
      featuredCoupons.value = allCoupons.where((c) => c.isAvailable).take(4).toList();

      final outlets = await _apiService.getOutlets();
      if (outlets.isNotEmpty) {
        outletsCount.value = outlets.length;
      }

      customerReviews.value = [
        {
          'name': 'Verified VIP Diner',
          'rating': 5.0,
          'review': 'Redeemed signature platter coupon smoothly at Bodakdev. Exceptional hospitality and zero wait time.',
          'date': 'Recent visit'
        },
        {
          'name': 'Gold Subscriber',
          'rating': 4.9,
          'review': 'Birthday sizzler perk and 2X loyalty points credited immediately to digital card pass.',
          'date': 'This week'
        },
        {
          'name': 'Patron #${member.value.membershipId}',
          'rating': 5.0,
          'review': 'Flawless table reservation and priority seating at Yanki Signature on weekend dinner.',
          'date': 'Yesterday'
        },
      ];
    } finally {
      isLoading.value = false;
    }
  }

  void refreshData() async {
    await loadDashboardData();
  }
}
