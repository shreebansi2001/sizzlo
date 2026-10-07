import 'package:get/get.dart';
import '../../../data/models/member_model.dart';
import '../../../data/models/coupon_model.dart';
import '../../../data/services/api_service.dart';

class HomeController extends GetxController {
  final ApiService _apiService = ApiService();

  final RxString activePlan = 'none'.obs;
  final Rx<MemberModel> member = MemberModel.defaultProfile().obs;
  final RxList<CouponModel> featuredCoupons = <CouponModel>[].obs;
  final RxInt outletsCount = 0.obs;
  final RxList<Map<String, dynamic>> customerReviews = <Map<String, dynamic>>[].obs;
  final RxBool isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    activePlan.value = member.value.planId;
    loadDashboardData();
  }

  void switchPlan(String planId) {
    activePlan.value = planId;
    final isSub = planId != 'none' && planId.isNotEmpty;
    member.value = member.value.copyWith(
      planId: planId,
      membershipType: planId == 'classic'
          ? 'CLASSIC SUBSCRIBER'
          : planId == 'elite'
              ? 'ELITE SUBSCRIBER'
              : planId == 'signature'
                  ? 'SIGNATURE SUBSCRIBER'
                  : 'REGISTERED USER',
      couponsTotal: isSub ? (planId == 'classic' ? 6 : planId == 'signature' ? 12 : 18) : 0,
      daysRemaining: isSub ? 365 : 0,
    );
  }

  Future<void> loadDashboardData() async {
    isLoading.value = true;
    try {
      final fetchedMember = await _apiService.getMemberProfile();
      if (fetchedMember.fullName.isNotEmpty && fetchedMember.fullName != 'Guest') {
        member.value = fetchedMember;
        activePlan.value = fetchedMember.planId;
      } else if (member.value.fullName != 'Guest' && member.value.fullName.isNotEmpty) {
        // Keep current populated member if API returned fallback
      } else if (fetchedMember.fullName.isNotEmpty) {
        member.value = fetchedMember;
        activePlan.value = fetchedMember.planId;
      }

      // STRICT REQUIREMENT: Coupons ONLY show after a plan has been purchased!
      if (member.value.isSubscriber) {
        final allCoupons = await _apiService.getCoupons(member.value.membershipId, member.value.mobile);
        featuredCoupons.value = allCoupons.where((c) => c.isAvailable).take(4).toList();
      } else {
        featuredCoupons.clear();
      }

      final outlets = await _apiService.getActiveOutlets();
      if (outlets.isNotEmpty) {
        outletsCount.value = outlets.length;
      }

      // Clear any static reviews - only show when live reviews exist
      customerReviews.clear();
    } finally {
      isLoading.value = false;
    }
  }

  void refreshData() async {
    await loadDashboardData();
  }
}
