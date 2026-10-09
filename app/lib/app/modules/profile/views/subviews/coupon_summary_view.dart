import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../data/models/member_model.dart';
import '../../../../controllers/navigation_controller.dart';
import '../../../home/controllers/home_controller.dart';
import '../../controllers/profile_controller.dart';

import '../../../../data/models/coupon_model.dart';
import '../../../../data/services/api_service.dart';

class CouponSummaryView extends StatefulWidget {
  const CouponSummaryView({Key? key}) : super(key: key);

  @override
  State<CouponSummaryView> createState() => _CouponSummaryViewState();
}

class _CouponSummaryViewState extends State<CouponSummaryView> {
  final ApiService _apiService = ApiService();
  List<CouponModel> _coupons = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadCoupons();
  }

  Future<void> _loadCoupons() async {
    try {
      final list = await _apiService.getCoupons();
      if (mounted) {
        setState(() {
          _coupons = list;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  MemberModel _getMember() {
    if (Get.isRegistered<HomeController>()) {
      return Get.find<HomeController>().member.value;
    }
    if (Get.isRegistered<ProfileController>()) {
      return Get.find<ProfileController>().member.value;
    }
    return MemberModel.defaultProfile();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Coupon Summary',
          style: GoogleFonts.playfairDisplay(
            fontSize: 19,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Get.back(),
        ),
      ),
      body: SafeArea(
        top: false,
        child: Obx(() {
        final m = _getMember();
        final used = m.couponsUsed;
        final total = m.couponsTotal > 0 ? m.couponsTotal : 12;
        final left = (total - used).clamp(0, 999);

        return RefreshIndicator(
          color: AppColors.gold,
          backgroundColor: const Color(0xFF131715),
          onRefresh: _loadCoupons,
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // 3 Stats Counters
                Row(
                  children: [
                    _statCounter('TOTAL', '$total', Colors.white),
                    const SizedBox(width: 8),
                    _statCounter('ACTIVE', '$left', const Color(0xFF10B981)),
                    const SizedBox(width: 8),
                    _statCounter('REDEEMED', '$used', const Color(0xFFDF9E5B)),
                  ],
                ),

                const SizedBox(height: 18),

                // Progress Card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFF131715),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withOpacity(0.06)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Voucher Utilization',
                            style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          Text(
                            '${((used / (total > 0 ? total : 1)) * 100).toInt()}% used',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Color(0xFFDF9E5B)),
                          ),
                        ],
                      ),
                      const SizedBox(height: 10),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(6),
                        child: LinearProgressIndicator(
                          value: total > 0 ? (used / total) : 0,
                          backgroundColor: Colors.white.withOpacity(0.08),
                          valueColor: const AlwaysStoppedAnimation<Color>(Color(0xFFDF9E5B)),
                          minHeight: 8,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 20),

                _sectionHeader('ACTIVE VOUCHERS IN WALLET'),
                const SizedBox(height: 10),

                if (_isLoading)
                  const Center(child: Padding(
                    padding: EdgeInsets.all(24),
                    child: CircularProgressIndicator(color: AppColors.gold),
                  ))
                else if (_coupons.isEmpty)
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: const Color(0xFF131715),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Center(
                      child: Text('No vouchers available in your wallet.', style: TextStyle(color: Colors.white.withOpacity(0.5))),
                    ),
                  )
                else
                  ..._coupons.map((c) => _voucherCategoryTile(
                    c.name,
                    '${c.subtitle} · ${c.outlet}',
                    c.isAvailable ? '${c.leftCount} Active' : 'Used',
                    c.isAvailable ? Icons.confirmation_number_outlined : Icons.check_circle_outline,
                  )),

                const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Get.back();
                    if (Get.isRegistered<NavigationController>()) {
                      Get.find<NavigationController>().changeTab(1);
                    }
                  },
                  icon: const Icon(Icons.confirmation_number_outlined, size: 18),
                  label: const Text('Browse & Redeem Coupons', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDF9E5B),
                    foregroundColor: const Color(0xFF070A09),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                  ),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      );
    }),
  ),
);
}

  Widget _statCounter(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 8),
        decoration: BoxDecoration(
          color: const Color(0xFF131715),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.0,
                color: Colors.white.withOpacity(0.45),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: GoogleFonts.plusJakartaSans(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.5,
          color: AppColors.gold,
        ),
      ),
    );
  }

  Widget _voucherCategoryTile(String title, String subtitle, String status, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF131715),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: const Color(0xFFDF9E5B).withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 20, color: const Color(0xFFDF9E5B)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: Colors.white),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.45)),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
            decoration: BoxDecoration(
              color: const Color(0xFF10B981).withOpacity(0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              status,
              style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
            ),
          ),
        ],
      ),
    );
  }
}
