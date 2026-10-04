import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/coupon_model.dart';
import '../../../data/services/api_service.dart';
import '../../home/controllers/home_controller.dart';

import '../../../widgets/sizzlo_dialogs.dart';

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

  void redeemCoupon(CouponModel coupon) {
    SizzloDialogs.showRedeemCouponConfirm(
      coupon: coupon,
      onConfirm: () => _executeRedeem(coupon),
    );
  }

  void _executeRedeem(CouponModel coupon) {
    Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        child: Container(
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: const Color(0xFF131715),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFC9A24D).withOpacity(0.35)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.6),
                blurRadius: 30,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: const Color(0xFFC9A24D).withOpacity(0.15),
                ),
                child: const Icon(
                  Icons.qr_code_2_rounded,
                  color: Color(0xFFC9A24D),
                  size: 36,
                ),
              ),
              const SizedBox(height: 16),
              const Text(
                'Present Server PIN',
                style: TextStyle(
                  fontFamily: 'Playfair Display',
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Show this OTP/PIN to your server at ${coupon.outlet}:',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Colors.white.withOpacity(0.7)),
              ),
              const SizedBox(height: 18),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFF1B221E),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFC9A24D).withOpacity(0.4)),
                ),
                child: Text(
                  'SZL-${coupon.code}-89',
                  style: const TextStyle(
                    color: Color(0xFFC9A24D),
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 2.5,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Valid for 15 minutes · Single Use Only',
                style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.45)),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () async {
                    Get.back();
                    await _apiService.redeemCoupon(coupon.code);
                    loadCoupons();
                    if (Get.isRegistered<HomeController>()) {
                      Get.find<HomeController>().loadDashboardData();
                    }
                    Get.snackbar(
                      'Voucher Redeemed',
                      '${coupon.name} verified & applied to your bill!',
                      backgroundColor: const Color(0xFF0E3B32),
                      colorText: const Color(0xFFE8B84A),
                      snackPosition: SnackPosition.TOP,
                      margin: const EdgeInsets.all(16),
                      borderRadius: 14,
                    );
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFC9A24D),
                    foregroundColor: const Color(0xFF070A09),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: const Text(
                    'Done & Applied',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      barrierColor: Colors.black.withOpacity(0.75),
    );
  }
}
