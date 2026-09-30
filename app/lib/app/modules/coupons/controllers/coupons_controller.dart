import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/coupon_model.dart';
import '../../../data/services/api_service.dart';

class CouponsController extends GetxController {
  final ApiService _apiService = ApiService();

  final RxList<CouponModel> coupons = <CouponModel>[].obs;
  final RxInt selectedTab = 0.obs; // 0: Available, 1: Used
  final RxBool isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    loadCoupons();
  }

  void loadCoupons() async {
    isLoading.value = true;
    try {
      coupons.value = await _apiService.getCoupons();
    } finally {
      isLoading.value = false;
    }
  }

  List<CouponModel> get filteredCoupons {
    if (selectedTab.value == 0) {
      return coupons.where((c) => c.isAvailable).toList();
    } else {
      return coupons.where((c) => !c.isAvailable).toList();
    }
  }

  void redeemCoupon(CouponModel coupon) async {
    Get.defaultDialog(
      title: 'Redeem Voucher',
      titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          children: [
            Text('Show this OTP/PIN to your server at ${coupon.outlet}:',
                textAlign: TextAlign.center, style: const TextStyle(fontSize: 13)),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFF001D4A),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Text(
                'SZL-${coupon.code}-89',
                style: const TextStyle(
                  color: Color(0xFFE8B84A),
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2.0,
                ),
              ),
            ),
            const SizedBox(height: 12),
            const Text('Valid for 15 minutes', style: TextStyle(fontSize: 11, color: Colors.grey)),
          ],
        ),
      ),
      textConfirm: 'Confirm Redemption',
      confirmTextColor: Colors.white,
      buttonColor: const Color(0xFF001D4A),
      onConfirm: () async {
        Get.back();
        await _apiService.redeemCoupon(coupon.code);
        loadCoupons();
        Get.snackbar(
          'Voucher Redeemed',
          '${coupon.name} redeemed successfully!',
          backgroundColor: const Color(0xFF001D4A),
          colorText: const Color(0xFFE8B84A),
        );
      },
    );
  }
}
