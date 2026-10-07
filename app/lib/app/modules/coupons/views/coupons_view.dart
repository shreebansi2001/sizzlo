import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/coupons_controller.dart';
import '../../home/controllers/home_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../routes/app_routes.dart';
import '../../../widgets/coupon_ticket.dart';

class CouponsView extends GetView<CouponsController> {
  final bool isTab;

  const CouponsView({Key? key, this.isTab = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<CouponsController>()) {
      Get.put(CouponsController());
    }

    return Obx(() {
      final isSub = Get.isRegistered<HomeController>()
          ? Get.find<HomeController>().member.value.isSubscriber
          : false;

      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: Text(
            isSub ? 'Exclusive Coupons' : 'VIP Coupon Vault',
            style: const TextStyle(
              fontFamily: 'Playfair Display',
              fontSize: 20,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          automaticallyImplyLeading: !isTab,
          leading: isTab
              ? null
              : IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new, size: 18),
                  onPressed: () => Get.back(),
                ),
        ),
        body: isSub ? _buildSubscribedView() : _buildNonSubscribedView(),
      );
    });
  }

  Widget _buildNonSubscribedView() {
    return Column(
      children: [
        // Active Subscription Banner matching Image 3
        GestureDetector(
          onTap: () => Get.toNamed(AppRoutes.PLANS),
          child: Container(
            width: double.infinity,
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: const Color(0xFF131715),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'ACTIVE SUBSCRIPTION',
                  style: TextStyle(
                    fontSize: 10,
                    letterSpacing: 2.0,
                    fontWeight: FontWeight.w700,
                    color: Colors.white.withOpacity(0.45),
                  ),
                ),
                const SizedBox(height: 6),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Expanded(
                      child: Text(
                        'Choose a plan · No active benefits',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFFDF9E5B),
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const SizedBox(width: 8),
                    Icon(
                      Icons.arrow_forward_ios_rounded,
                      size: 14,
                      color: Colors.white.withOpacity(0.4),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),

        // Empty state matching Image 3
        Expanded(
          child: Center(
            child: Container(
              width: double.infinity,
              margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              padding: const EdgeInsets.symmetric(vertical: 50, horizontal: 24),
              decoration: BoxDecoration(
                color: const Color(0xFF131715),
                borderRadius: BorderRadius.circular(24),
                border: Border.all(color: Colors.white.withOpacity(0.06)),
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.confirmation_number_outlined,
                    size: 54,
                    color: Colors.white.withOpacity(0.25),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'Nothing here yet',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white.withOpacity(0.65),
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Subscribe to Yanki to unlock up to 18 dining discounts, birthday benefits, and complimentary meals.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 12,
                      color: Colors.white.withOpacity(0.4),
                      height: 1.5,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton(
                    onPressed: () => Get.toNamed(AppRoutes.PLANS),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.gold,
                      foregroundColor: const Color(0xFF070A09),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
                      ),
                    ),
                    child: const Text(
                      'Explore Subscription Plans',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        SizedBox(height: isTab ? 135 : 40),
      ],
    );
  }

  Widget _buildSubscribedView() {
    return Column(
      children: [
        // Segmented Tabs: Available vs Used
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          child: Obx(
            () => Container(
              decoration: BoxDecoration(
                color: const Color(0xFF131715),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.08)),
              ),
              padding: const EdgeInsets.all(4),
              child: Row(
                children: [
                  _tabButton(0, 'Available Vouchers'),
                  _tabButton(1, 'Used & Expired'),
                ],
              ),
            ),
          ),
        ),

        // Coupon List
        Expanded(
          child: Obx(() {
            if (controller.isLoading.value) {
              return const Center(
                child: CircularProgressIndicator(color: AppColors.flame),
              );
            }

            final list = controller.filteredCoupons;
            if (list.isEmpty) {
              return RefreshIndicator(
                color: AppColors.flame,
                backgroundColor: AppColors.surface,
                onRefresh: () async => controller.loadCoupons(),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  child: Container(
                    height: 400,
                    alignment: Alignment.center,
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.confirmation_number_outlined,
                          size: 56,
                          color: Colors.white.withOpacity(0.3),
                        ),
                        const SizedBox(height: 12),
                        const Text(
                          'No coupons found in this category',
                          style: TextStyle(color: Colors.white70, fontSize: 14),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            }

            return RefreshIndicator(
              color: AppColors.flame,
              backgroundColor: AppColors.surface,
              onRefresh: () async => controller.loadCoupons(),
              child: ListView.separated(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: EdgeInsets.fromLTRB(20, 8, 20, isTab ? 135 : 20),
                itemCount: list.length,
                separatorBuilder: (_, __) => const SizedBox(height: 14),
                itemBuilder: (context, index) {
                  final coupon = list[index];
                  return CouponTicket(
                    coupon: coupon,
                    onRedeem: () => controller.redeemCoupon(coupon),
                  );
                },
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _tabButton(int index, String label) {
    final isSelected = controller.selectedTab.value == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => controller.selectedTab.value = index,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.white.withOpacity(0.1),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : [],
          ),
          child: FittedBox(
            fit: BoxFit.scaleDown,
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 4),
              child: Text(
                label,
                textAlign: TextAlign.center,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 13,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  color: isSelected ? const Color(0xFF070A09) : Colors.white60,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
