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
import '../../../widgets/sizzler_smoke_effect.dart';
import '../../../widgets/sizzlo_mascot_animated.dart';
import '../../../widgets/sizzler_hero_animation.dart';
import '../../../controllers/navigation_controller.dart';
import '../../coupons/views/coupons_view.dart';
import '../../loyalty/views/loyalty_view.dart';
import '../../notifications/views/notifications_view.dart';
import '../../profile/views/profile_view.dart';
import '../../delivery/controllers/delivery_controller.dart';

class HomeView extends GetView<HomeController> {
  const HomeView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final navController = Get.find<NavigationController>();

    final List<Widget> pages = [
      _buildHomeContent(context),
      const CouponsView(isTab: true),
      const LoyaltyView(isTab: true),
      const NotificationsView(isTab: true),
      const ProfileView(isTab: true),
    ];

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          Obx(
            () => IndexedStack(
              index: navController.currentIndex.value,
              children: pages,
            ),
          ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Obx(
              () => CustomBottomNav(
                currentIndex: navController.currentIndex.value,
                onTap: navController.changeTab,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHomeContent(BuildContext context) {
    return RefreshIndicator(
      color: AppColors.flame,
      backgroundColor: AppColors.surface,
      onRefresh: () async => controller.refreshData(),
      child: SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Column(
          children: [
            SizzlerSmokeEffect(
              enableSmoke: true,
              child: _buildHeader(),
            ),
            _buildBody(context),
            const SizedBox(height: 135),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Obx(() {
      final m = controller.member.value;
      final isSub = m.isSubscriber;
      return Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: m.headerGradient,
        ),
        padding: EdgeInsets.fromLTRB(20, 56, 20, isSub ? 72 : 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'WELCOME BACK',
                        style: TextStyle(
                          fontSize: 11,
                          letterSpacing: 2.4,
                          fontWeight: FontWeight.w700,
                          color: AppColors.gold.withOpacity(0.95),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        children: [
                          Text(
                            'Hello, ${m.firstName}',
                            style: AppTextStyles.displayMedium.copyWith(
                              color: Colors.white,
                              fontSize: 28,
                              fontFamily: 'Playfair Display',
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          const SizedBox(width: 8),
                          SizzloMascotAnimated(
                            height: 44,
                            onTap: () => Get.toNamed(AppRoutes.PLANS),
                          ),
                        ],
                      ),
                      if (isSub) ...[
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: AppColors.gold.withOpacity(0.12),
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.gold.withOpacity(0.35)),
                          ),
                          child: Text(
                            '${m.planMemberLabel} · ${m.expiryDate.toUpperCase()}',
                            style: const TextStyle(
                              color: AppColors.gold,
                              fontSize: 9.5,
                              letterSpacing: 1.0,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                // Bell Notification Button matching demo_code
                GestureDetector(
                  onTap: () => Get.find<NavigationController>().changeTab(3),
                  child: Stack(
                    clipBehavior: Clip.none,
                    children: [
                      Container(
                        width: 42,
                        height: 42,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.08),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withOpacity(0.15)),
                        ),
                        child: const Icon(
                          Icons.notifications_none_rounded,
                          color: Colors.white,
                          size: 22,
                        ),
                      ),
                      Positioned(
                        top: 2,
                        right: 2,
                        child: Container(
                          width: 9,
                          height: 9,
                          decoration: const BoxDecoration(
                            color: AppColors.gold,
                            shape: BoxShape.circle,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      );
    });
  }

  Widget _buildBody(BuildContext context) {
    return Obx(() {
      final isSub = controller.member.value.isSubscriber;
      return Transform.translate(
        offset: Offset(0, isSub ? -50 : 8),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (isSub) ...[
                // VIP Member Card Preview matching demo_code overlapping banner
                GestureDetector(
                  onTap: () => Get.toNamed(AppRoutes.CARD),
                  child: SizzloVipCard(
                    member: controller.member.value,
                    compact: true,
                    enableFlip: false,
                  ),
                ),

                const SizedBox(height: 24),

                // Key Stats Grid
                GridView.count(
                  padding: EdgeInsets.zero,
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
                      delta: '₹${(controller.member.value.totalSavings * 0.18).toInt()} this month',
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
                      delta: '${((controller.member.value.loyaltyPoints / (controller.member.value.loyaltyGoal > 0 ? controller.member.value.loyaltyGoal : 250000)) * 100).toInt()}% to renewal reward',
                      icon: Icons.stars_outlined,
                      tone: StatTone.royal,
                    ),
                    StatCard(
                      label: 'Coupons Left',
                      value: '${controller.member.value.couponsLeft}',
                      delta: 'Expires ${controller.member.value.expiryDate}',
                      icon: Icons.local_offer_outlined,
                      tone: StatTone.gold,
                    ),
                  ],
                ),

                const SizedBox(height: 20),
              ],

              // Hot Sizzler Platter & Rising Smoke Hero Animation
              const SizzlerHeroAnimation(),

              const SizedBox(height: 20),

              // Quick Actions Grid
              SectionHeader(title: 'Quick Actions'),
          _buildQuickActions(),

          const SizedBox(height: 24),

          // Featured Coupons Carousel
          SectionHeader(
            title: 'Featured Coupons',
            actionLabel: 'View all',
            onAction: () => Get.find<NavigationController>().changeTab(1),
          ),
          _buildFeaturedCoupons(),

          const SizedBox(height: 24),

          // Outlets Locator Tile matching demo_code
          _buildOutletsTile(),

          const SizedBox(height: 24),

          // Latest Privileges / Brunch Promo matching demo_code
          SectionHeader(title: 'Latest Offers'),
          _buildPromoBanner(),

          const SizedBox(height: 24),

          // Customer Reviews Carousel matching demo_code
          SectionHeader(title: 'Customer Reviews'),
          _buildCustomerReviews(),

          const SizedBox(height: 28),

          // Social Media Icons matching demo_code
          _buildSocialMediaLinks(),

          const SizedBox(height: 12),
        ],
      ),
    ),
    );
    });
  }

  Widget _buildQuickActions() {
    final actions = [
      {'label': 'Subscription', 'icon': Icons.badge_outlined, 'route': AppRoutes.PLANS},
      {'label': 'Coupons', 'icon': Icons.confirmation_number_outlined, 'tabIndex': 1},
      {'label': 'Reservations', 'icon': Icons.table_restaurant_outlined, 'route': AppRoutes.RESERVATIONS},
      {'label': 'Loyalty', 'icon': Icons.stars_rounded, 'tabIndex': 2},
      {'label': 'Banquets', 'icon': Icons.celebration_outlined, 'route': AppRoutes.DELIVERY, 'deliveryTab': 1},
      {'label': 'ODC Catering', 'icon': Icons.local_shipping_outlined, 'route': AppRoutes.DELIVERY, 'deliveryTab': 1},
    ];

    return GridView.builder(
      padding: EdgeInsets.zero,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 3,
        mainAxisSpacing: 12,
        crossAxisSpacing: 12,
        childAspectRatio: 1.0,
      ),
      itemCount: actions.length,
      itemBuilder: (context, index) {
        final a = actions[index];
        return GestureDetector(
          onTap: () {
            if (a['deliveryTab'] != null) {
              if (Get.isRegistered<DeliveryController>()) {
                Get.find<DeliveryController>().selectedServiceTab.value = a['deliveryTab'] as int;
              }
              Get.toNamed(a['route'] as String);
            } else if (a['tabIndex'] != null) {
              Get.find<NavigationController>().changeTab(a['tabIndex'] as int);
            } else if (a['route'] != null) {
              Get.toNamed(a['route'] as String);
            }
          },
          child: Container(
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.3),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppColors.surfaceVariant,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Icon(a['icon'] as IconData, color: AppColors.flame, size: 22),
                ),
                const SizedBox(height: 8),
                Text(
                  a['label'] as String,
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 11,
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
        height: 145,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: controller.featuredCoupons.length,
          separatorBuilder: (_, __) => const SizedBox(width: 14),
          itemBuilder: (context, index) {
            final c = controller.featuredCoupons[index];
            final isGold = c.color == 'gold';
            return GestureDetector(
              onTap: () => Get.find<NavigationController>().changeTab(2),
              child: Container(
                width: 260,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: isGold ? AppColors.goldGradient : AppColors.royalCardGradient,
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [
                    BoxShadow(
                      color: (isGold ? AppColors.gold : AppColors.primary).withOpacity(0.3),
                      blurRadius: 12,
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
                        fontSize: 16,
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
                          size: 12,
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

  Widget _buildOutletsTile() {
    return GestureDetector(
      onTap: () => Get.find<NavigationController>().changeTab(3),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.border),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 10,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppColors.surfaceVariant,
                borderRadius: BorderRadius.circular(16),
              ),
              child: const Icon(Icons.location_on_rounded, color: AppColors.flame, size: 24),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Our Outlets',
                    style: TextStyle(
                      fontFamily: 'Playfair Display',
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Visit your nearest Yanki outlet in Ahmedabad',
                    style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                  const SizedBox(height: 4),
                  Obx(
                    () => Text(
                      '${controller.outletsCount.value} LOCATIONS AVAILABLE',
                      style: const TextStyle(
                        fontSize: 9,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                        color: AppColors.gold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const Row(
              children: [
                Text(
                  'View All',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.flame),
                ),
                Icon(Icons.chevron_right, size: 18, color: AppColors.flame),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPromoBanner() {
    return GestureDetector(
      onTap: () {
        Get.dialog(
          Dialog(
            backgroundColor: AppColors.surface,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            child: Padding(
              padding: const EdgeInsets.all(22),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.flame.withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.celebration_rounded, color: AppColors.flame, size: 22),
                      ),
                      const SizedBox(width: 12),
                      const Expanded(
                        child: Text(
                          'Yanki Sunday Brunch',
                          style: TextStyle(fontFamily: 'Playfair Display', fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Indulge in our signature Sunday Brunch buffet featuring live sizzler grill stations, chef-crafted desserts, artisanal mocktails, and live jazz music.',
                    style: TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: const Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Timings:', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                            Text('12:00 PM – 4:00 PM (Sundays)', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.white)),
                          ],
                        ),
                        SizedBox(height: 6),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text('Subscriber Benefit:', style: TextStyle(fontSize: 12, color: AppColors.textMuted)),
                            Text('Flat 20% Off + Welcome Sizzler', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.gold)),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.flame,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                      ),
                      onPressed: () {
                        Get.back();
                        Get.find<NavigationController>().changeTab(3);
                      },
                      child: const Text('Reserve Table for Brunch', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(22),
          border: Border.all(color: AppColors.gold.withOpacity(0.3)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.3),
              blurRadius: 12,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              width: 58,
              height: 58,
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                gradient: AppColors.goldGradient,
                borderRadius: BorderRadius.circular(18),
              ),
              child: const Icon(Icons.celebration_rounded, color: AppColors.primaryDark, size: 28),
            ),
            const SizedBox(width: 14),
            const Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '1. YANKI BRUNCH OFFER',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.0,
                      color: AppColors.gold,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    'Sunday Sparkling Brunch',
                    style: TextStyle(
                      fontFamily: 'Playfair Display',
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  SizedBox(height: 2),
                  Text(
                    'Live grill stations & 20% off for verified subscribers',
                    style: TextStyle(fontSize: 11, color: AppColors.textSecondary),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right, size: 20, color: AppColors.gold),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomerReviews() {
    return Obx(() {
      final reviews = controller.customerReviews;
      if (reviews.isEmpty) return const SizedBox();

      return SizedBox(
        height: 135,
        child: ListView.separated(
          scrollDirection: Axis.horizontal,
          itemCount: reviews.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (context, index) {
          final r = reviews[index];
          return Container(
            width: 280,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.border),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      r['name'] as String,
                      style: const TextStyle(
                        fontFamily: 'Playfair Display',
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    Row(
                      children: [
                        const Icon(Icons.star_rounded, size: 14, color: AppColors.gold),
                        const SizedBox(width: 3),
                        Text(
                          '${r['rating']}',
                          style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppColors.gold),
                        ),
                      ],
                    ),
                  ],
                ),
                Text(
                  r['review'] as String,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary, height: 1.4),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  r['date'] as String,
                  style: const TextStyle(fontSize: 10, color: AppColors.textMuted),
                ),
              ],
            ),
          );
        },
      ),
    );
  });
}

  Widget _buildSocialMediaLinks() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _socialButton(Icons.play_arrow_rounded, const Color(0xFFFF0000), 'YouTube'),
        const SizedBox(width: 16),
        _socialButton(Icons.camera_alt_outlined, const Color(0xFFE4405F), 'Instagram'),
        const SizedBox(width: 16),
        _socialButton(Icons.facebook, const Color(0xFF1877F2), 'Facebook'),
      ],
    );
  }

  Widget _socialButton(IconData icon, Color color, String tooltip) {
    return Container(
      width: 44,
      height: 44,
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: IconButton(
        icon: Icon(icon, color: color, size: 20),
        onPressed: () {
          Get.snackbar(
            tooltip,
            'Opening Yanki Sizzlerr $tooltip channel',
            backgroundColor: AppColors.surface,
            colorText: Colors.white,
            snackPosition: SnackPosition.BOTTOM,
          );
        },
      ),
    );
  }
}
