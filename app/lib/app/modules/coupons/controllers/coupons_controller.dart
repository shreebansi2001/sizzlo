import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../data/models/coupon_model.dart';
import '../../../data/services/api_service.dart';
import '../../home/controllers/home_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../routes/app_routes.dart';

class CouponsController extends GetxController {
  final ApiService _apiService = ApiService();

  final RxList<CouponModel> coupons = <CouponModel>[].obs;
  final RxInt selectedTab = 0.obs; // 0: Available, 1: Used
  final RxBool isLoading = true.obs;
  final RxInt burnCountdown = 300.obs;
  Timer? _countdownTimer;

  @override
  void onInit() {
    super.onInit();
    loadCoupons();
  }

  @override
  void onClose() {
    _countdownTimer?.cancel();
    super.onClose();
  }

  void startBurnTimer() {
    _countdownTimer?.cancel();
    burnCountdown.value = 300; // 5 minutes SRS Chapter 09.2
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (burnCountdown.value > 0) {
        burnCountdown.value--;
      } else {
        timer.cancel();
      }
    });
  }

  void loadCoupons() async {
    isLoading.value = true;
    try {
      final isSub = Get.isRegistered<HomeController>()
          ? Get.find<HomeController>().member.value.isSubscriber
          : false;

      if (!isSub) {
        // Non-subscribed flow: Fetch full coupon catalog for preview mode
        final catalog = await _apiService.getCouponsCatalog();
        coupons.assignAll(catalog);
        return;
      }

      final member = Get.find<HomeController>().member.value;
      coupons.value = await _apiService.getCoupons(member.membershipId, member.mobile);
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
    final isSub = Get.isRegistered<HomeController>()
        ? Get.find<HomeController>().member.value.isSubscriber
        : false;

    if (!isSub) {
      _showUpgradePrompt(coupon);
      return;
    }

    // Subscribed user clicks coupon -> navigate directly to Settle Table Bill screen
    Get.toNamed(AppRoutes.BILLING, arguments: coupon);
  }

  void _showUpgradePrompt(CouponModel coupon) {
    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.all(24),
        decoration: const BoxDecoration(
          color: Color(0xFF141312),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: Color(0xFF6B4E22))),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: const BoxDecoration(
                shape: BoxShape.circle,
                color: Color(0xFF2C241B),
              ),
              child: const Icon(Icons.lock_outline_rounded, color: AppColors.goldAccent, size: 28),
            ),
            const SizedBox(height: 14),
            Text(
              'VIP Member Exclusive',
              style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w800, color: Colors.white),
            ),
            const SizedBox(height: 6),
            Text(
              'Voucher "${coupon.name}" is reserved for Sizzlo VIP Subscribers (${coupon.targetAudience ?? "VIP Plans"}). Upgrade your membership to unlock instant dining discounts, priority bookings & exclusive benefits!',
              textAlign: TextAlign.center,
              style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[400], height: 1.4),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () {
                Get.back();
                Get.toNamed(AppRoutes.PLANS);
              },
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.goldAccent,
                foregroundColor: Colors.black,
                minimumSize: const Size.fromHeight(48),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              child: Text(
                'Explore Membership Plans',
                style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800),
              ),
            ),
            const SizedBox(height: 10),
            TextButton(
              onPressed: () => Get.back(),
              child: Text('Maybe Later', style: GoogleFonts.inter(fontSize: 13, color: Colors.grey)),
            ),
          ],
        ),
      ),
    );
  }
}
