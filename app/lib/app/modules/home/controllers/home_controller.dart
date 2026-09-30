import 'package:get/get.dart';
import '../../../data/models/member_model.dart';
import '../../../data/models/coupon_model.dart';
import '../../../data/services/api_service.dart';

class HomeController extends GetxController {
  final ApiService _apiService = ApiService();

  final Rx<MemberModel> member = MemberModel.defaultProfile().obs;
  final RxList<CouponModel> featuredCoupons = <CouponModel>[].obs;
  final RxBool isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    loadDashboardData();
  }

  Future<void> loadDashboardData() async {
    isLoading.value = true;
    try {
      final fetchedMember = await _apiService.getMemberProfile();
      member.value = fetchedMember;

      final allCoupons = await _apiService.getCoupons();
      featuredCoupons.value = allCoupons.where((c) => c.isAvailable).take(4).toList();
    } finally {
      isLoading.value = false;
    }
  }

  void refreshData() async {
    await loadDashboardData();
  }
}
