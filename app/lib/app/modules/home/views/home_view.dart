import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/home_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/utils/currency_formatter.dart';
import '../../../routes/app_routes.dart';
import '../../../widgets/sizzlo_vip_card.dart';
import '../../../widgets/stat_card.dart';
import '../../../widgets/section_header.dart';
import '../../../widgets/custom_bottom_nav.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          RefreshIndicator(
            onRefresh: () async => controller.refreshData(),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Column(
                children: [
                  _buildHeader(),
                  _buildBody(context),
                  const SizedBox(height: 100), // padding for bottom nav
                ],
              ),
            ),
          ),
          const Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: CustomBottomNav(currentIndex: 0),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      decoration: const BoxDecoration(
        gradient: AppColors.royalCardGradient,
        borderRadius: BorderRadius.vertical(bottom: Radius.circular(32)),
      ),
      padding: const EdgeInsets.fromLTRB(20, 56, 20, 24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'WELCOME BACK',
                    style: TextStyle(
                      fontSize: 11,
                      letterSpacing: 2.2,
                      fontWeight: FontWeight.bold,
                      color: AppColors.gold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Obx(
                    () => Text(
                      'Hello, ${controller.member.value.firstName}',
                      style: AppTextStyles.displayMedium.copyWith(color: Colors.white),
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () => Get.toNamed(AppRoutes.NOTIFICATIONS),
                child: Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.12),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white.withOpacity(0.2)),
                  ),
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      const Icon(Icons.notifications_outlined, color: Colors.white, size: 22),
                      Positioned(
                        top: 10,
                        right: 12,
                        child: Container(
                          width: 8,
                          height: 8,
                          decoration: const BoxDecoration(
                            color: AppColors.gold,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Obx(
            () => Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
              decoration: BoxDecoration(
                color: AppColors.gold.withOpacity(0.15),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.gold.withOpacity(0.3)),
              ),
              child: Text(
                '${controller.member.value.membershipType} · VALID TILL ${controller.member.value.expiryDate.toUpperCase()}',
                style: const TextStyle(
                  color: AppColors.gold,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 18),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 18),

          // VIP Member Card Preview
          Obx(
            () => GestureDetector(
              onTap: () => Get.toNamed(AppRoutes.CARD),
              child: SizzloVipCard(
                member: controller.member.value,
                compact: true,
                enableFlip: false,
              ),
            ),
          ),

          const SizedBox(height: 24),

          // Key Stats Grid
          Obx(
            () => GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
              childAspectRatio: 1.35,
              children: [
                StatCard(
                  label: 'Total Savings',
                  value: CurrencyFormatter.formatInr(controller.member.value.totalSavings),
                  delta: '+₹4,200 this month',
                  icon: Icons.savings_outlined,
                  tone: StatTone.gold,
                ),
                StatCard(
                  label: 'Coupons Used',
                  value: '${controller.member.value.couponsUsed} / ${controller.member.value.couponsTotal}',
                  delta: '${controller.member.value.couponsLeft} remaining',
                  icon: Icons.confirmation_number_outlined,
                  tone: StatTone.royal,
                ),
                StatCard(
                  label: 'Loyalty Points',
                  value: '${(controller.member.value.loyaltyPoints / 1000).toStringAsFixed(0)}K pts',
                  delta: '50% to diamond tier',
                  icon: Icons.stars_outlined,
                  tone: StatTone.royal,
                ),
                StatCard(
                  label: 'Coupons Left',
                  value: '${controller.member.value.couponsLeft}',
                  delta: 'Valid across venues',
                  icon: Icons.local_offer_outlined,
                  tone: StatTone.gold,
                ),
              ],
            ),
          ),

          const SizedBox(height: 24),

          // Quick Actions Grid
          SectionHeader(title: 'Quick Actions'),
          _buildQuickActions(),

          const SizedBox(height: 24),

          // Featured Coupons Carousel
          SectionHeader(
            title: 'Featured Coupons',
            actionLabel: 'View all',
            onAction: () => Get.toNamed(AppRoutes.COUPONS),
          ),
          _buildFeaturedCoupons(),

          const SizedBox(height: 24),

          // Latest Privileges / Promo
          SectionHeader(title: 'Latest Privileges'),
          _buildPromoBanner(),
        ],
      ),
    );
  }

  Widget _buildQuickActions() {
    final actions = [
      {'label': 'Membership', 'icon': Icons.badge_outlined, 'route': AppRoutes.CARD},
      {'label': 'Coupons', 'icon': Icons.confirmation_number_outlined, 'route': AppRoutes.COUPONS},
      {'label': 'Reservations', 'icon': Icons.table_restaurant_outlined, 'route': AppRoutes.RESERVATIONS},
      {'label': 'Loyalty', 'icon': Icons.stars_rounded, 'route': AppRoutes.LOYALTY},
      {'label': 'Dough Pizza', 'icon': Icons.local_pizza_outlined, 'route': AppRoutes.COUPONS},
      {'label': 'Banquets', 'icon': Icons.celebration_outlined, 'route': AppRoutes.COUPONS},
      {'label': 'ODC Catering', 'icon': Icons.local_shipping_outlined, 'route': AppRoutes.DELIVERY},
      {'label': 'Delivery', 'icon': Icons.delivery_dining_outlined, 'route': AppRoutes.DELIVERY},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        mainAxisSpacing: 12,
        crossAxisSpacing: 10,
        childAspectRatio: 0.88,
      ),
      itemCount: actions.length,
      itemBuilder: (context, index) {
        final a = actions[index];
        return GestureDetector(
          onTap: () => Get.toNamed(a['route'] as String),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: Colors.black.withOpacity(0.04)),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.02),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 4),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(a['icon'] as IconData, color: AppColors.primary, size: 20),
                ),
                const SizedBox(height: 8),
                Text(
                  a['label'] as String,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildFeaturedCoupons() {
    return Obx(() {
      if (controller.featuredCoupons.isEmpty) {
        return const SizedBox();
      }
      return SizedBox(
        height: 140,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: controller.featuredCoupons.length,
          separatorBuilder: (_, __) => const SizedBox(width: 14),
          itemBuilder: (context, index) {
            final c = controller.featuredCoupons[index];
            final isGold = c.color == 'gold';
            return GestureDetector(
              onTap: () => Get.toNamed(AppRoutes.COUPONS),
              child: Container(
                width: 250,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: isGold ? AppColors.goldGradient : AppColors.royalCardGradient,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      color: (isGold ? AppColors.gold : AppColors.primary).withOpacity(0.25),
                      blurRadius: 10,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          c.code,
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: isGold ? AppColors.primaryDark : AppColors.gold,
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            '${c.leftCount} Left',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: isGold ? AppColors.primaryDark : Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                    Text(
                      c.name,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: isGold ? AppColors.primaryDark : Colors.white,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      c.subtitle,
                      style: TextStyle(
                        fontSize: 12,
                        color: (isGold ? AppColors.primaryDark : Colors.white).withOpacity(0.8),
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    Row(
                      children: [
                        Icon(
                          Icons.location_on_outlined,
                          size: 11,
                          color: isGold ? AppColors.primaryDark : Colors.white.withOpacity(0.7),
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            c.outlet,
                            style: TextStyle(
                              fontSize: 10,
                              color: isGold ? AppColors.primaryDark : Colors.white.withOpacity(0.7),
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            );
          },
        ),
      );
    });
  }

  Widget _buildPromoBanner() {
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.gold.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.goldBg,
              borderRadius: BorderRadius.circular(16),
            ),
            child: const Icon(Icons.wine_bar_rounded, color: AppColors.goldDark, size: 28),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: AppColors.gold.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: const Text(
                        'THIS WEEKEND',
                        style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: AppColors.goldDark),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                const Text(
                  "Weekend Chef's Tasting",
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 2),
                const Text(
                  '9-course pairing menu with sommelier — 30% off for VIP members',
                  style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
