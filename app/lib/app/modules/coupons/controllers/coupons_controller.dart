import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../data/models/coupon_model.dart';
import '../../../data/services/api_service.dart';
import '../../home/controllers/home_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../routes/app_routes.dart';
import '../../../widgets/sizzlo_dialogs.dart';

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
        coupons.clear();
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
    SizzloDialogs.showRedeemCouponConfirm(
      coupon: coupon,
      onConfirm: () => _executeRedeem(coupon),
    );
  }

  void _executeRedeem(CouponModel coupon) {
    startBurnTimer();
    final burnToken = 'BURN-${100000 + Random().nextInt(900000)}';

    Get.dialog(
      Dialog(
        backgroundColor: Colors.transparent,
        insetPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
        child: Container(
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            color: const Color(0xFF141312),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: const Color(0xFFE27C38).withOpacity(0.4)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.7),
                blurRadius: 30,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Header Flame Badge
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppColors.flame.withOpacity(0.15),
                ),
                child: const Icon(
                  Icons.local_fire_department_rounded,
                  color: AppColors.flame,
                  size: 36,
                ),
              ),
              const SizedBox(height: 14),

              Text(
                'DYNAMIC COUPON BURN TOKEN',
                style: GoogleFonts.outfit(
                  fontSize: 11,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2.0,
                  color: AppColors.flame,
                ),
              ),
              const SizedBox(height: 4),

              Text(
                coupon.name,
                textAlign: TextAlign.center,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 4),

              Text(
                'Applicable at ${coupon.outlet}',
                textAlign: TextAlign.center,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 12,
                  color: Colors.white.withOpacity(0.6),
                ),
              ),
              const SizedBox(height: 16),

              // 5-Minute Visible Countdown Timer (SRS Chapter 09.2)
              Obx(() {
                final min = (burnCountdown.value ~/ 60).toString().padLeft(2, '0');
                final sec = (burnCountdown.value % 60).toString().padLeft(2, '0');
                return Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF261912),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: const Color(0xFF5E2E16)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.timer_outlined, size: 14, color: Color(0xFFE27C38)),
                      const SizedBox(width: 6),
                      Text(
                        'Token expires in $min:$sec',
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFE27C38),
                        ),
                      ),
                    ],
                  ),
                );
              }),
              const SizedBox(height: 16),

              // Burn Token Display Box
              Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E1A16),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.goldAccent.withOpacity(0.5)),
                ),
                child: Column(
                  children: [
                    Text(
                      burnToken,
                      style: GoogleFonts.outfit(
                        fontSize: 24,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 3.0,
                        color: AppColors.goldAccent,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Present to cashier before timer runs out',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 10,
                        color: Colors.white.withOpacity(0.4),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),

              // Integrity notice
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.shield_outlined, size: 13, color: Colors.grey),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Strict 1-Coupon Limit: Stacking multiple coupons on a single bill is programmatically blocked. Zero annual rollover.',
                      style: GoogleFonts.plusJakartaSans(fontSize: 10, color: Colors.grey[400]),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),

              // Action 1: Apply to POS Bill Settlement
              SizedBox(
                width: double.infinity,
                height: 46,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Get.back();
                    Get.toNamed(AppRoutes.BILLING);
                  },
                  icon: const Icon(Icons.receipt_long_rounded, size: 16),
                  label: Text(
                    'Apply to POS Bill Settlement',
                    style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w700, fontSize: 13),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.flame,
                    foregroundColor: const Color(0xFF070A09),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 8),

              // Action 2: Direct In-Store Burn Confirmation
              SizedBox(
                width: double.infinity,
                height: 42,
                child: OutlinedButton(
                  onPressed: () async {
                    Get.back();
                    _countdownTimer?.cancel();
                    await _apiService.redeemCoupon(coupon.code);
                    loadCoupons();
                    if (Get.isRegistered<HomeController>()) {
                      Get.find<HomeController>().loadDashboardData();
                    }
                    Get.snackbar(
                      'Coupon Burn Complete',
                      '${coupon.name} burned permanently for single use.',
                      backgroundColor: const Color(0xFF0E3B32),
                      colorText: const Color(0xFFE8B84A),
                      snackPosition: SnackPosition.TOP,
                      margin: const EdgeInsets.all(16),
                      borderRadius: 14,
                    );
                  },
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Colors.white,
                    side: BorderSide(color: Colors.white.withOpacity(0.2)),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: Text(
                    'Cashier Verified · Done',
                    style: GoogleFonts.plusJakartaSans(fontWeight: FontWeight.w600, fontSize: 12),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
      barrierColor: Colors.black.withOpacity(0.8),
    );
  }
}
