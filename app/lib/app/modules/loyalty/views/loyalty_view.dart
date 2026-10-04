import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/loyalty_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../widgets/sizzlo_mascot_animated.dart';

class LoyaltyView extends GetView<LoyaltyController> {
  final bool isTab;

  const LoyaltyView({Key? key, this.isTab = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<LoyaltyController>()) {
      Get.put(LoyaltyController());
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Loyalty Rewards',
          style: TextStyle(
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Loyalty Hero Card matching Image 2
            _buildBalanceHeroCard(),

            const SizedBox(height: 16),

            // 3 Stat Tiles in a row matching Image 2
            _buildThreeStatsRow(),

            const SizedBox(height: 24),

            // Recent Activity Section Header with +22% vs last month
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Recent activity',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: AppColors.gold,
                  ),
                ),
                Row(
                  children: const [
                    Icon(Icons.trending_up, size: 16, color: Color(0xFF4EE3B8)),
                    SizedBox(width: 4),
                    Text(
                      '+22% vs last month',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF4EE3B8),
                      ),
                    ),
                  ],
                ),
              ],
            ),

            const SizedBox(height: 12),

            // Activity List matching Image 2
            _buildActivityList(),

            SizedBox(height: isTab ? 135 : 30),
          ],
        ),
      ),
    );
  }

  Widget _buildBalanceHeroCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF382312),
            Color(0xFF221509),
            Color(0xFF160E06),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFF7F4420).withOpacity(0.6),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
            blurRadius: 20,
            offset: const Offset(0, 8),
          ),
        ],
      ),
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
                      'YANKI REWARDS BALANCE',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2.2,
                        color: AppColors.gold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      '1,25,000',
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 34,
                        fontWeight: FontWeight.bold,
                        color: AppColors.goldChampagne,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'points · earning 5x on weekends',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.65),
                      ),
                    ),
                  ],
                ),
              ),
              // Mascot with sparkle aura
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.gold.withOpacity(0.25),
                          blurRadius: 18,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                  const SizzloMascotAnimated(height: 48),
                ],
              ),
            ],
          ),

          const SizedBox(height: 18),

          // 50% Circular Progress Box matching Image 2
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.25),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: Colors.white.withOpacity(0.08),
              ),
            ),
            child: Row(
              children: [
                // 50% circular indicator
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    border: Border.all(color: AppColors.gold, width: 2.5),
                  ),
                  child: const Center(
                    child: Text(
                      '50%',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'NEXT REWARD AT 2,50,000 PTS',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 10,
                          fontWeight: FontWeight.w700,
                          letterSpacing: 1.0,
                          color: Colors.white.withOpacity(0.7),
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: const [
                          Icon(Icons.card_giftcard, size: 13, color: AppColors.gold),
                          SizedBox(width: 4),
                          Text(
                            'Free Subscription Renewal',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: AppColors.gold,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildThreeStatsRow() {
    return Row(
      children: [
        _statTile('THIS MONTH', '+4,840'),
        const SizedBox(width: 10),
        _statTile('LIFETIME', '3,12,840'),
        const SizedBox(width: 10),
        _statTile('REDEEMED', '48,200'),
      ],
    );
  }

  Widget _statTile(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: const Color(0xFF131715),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              value,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 15,
                fontWeight: FontWeight.bold,
                color: const Color(0xFFDF9E5B),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityList() {
    final activities = [
      {
        'title': 'Yanki Signature · Dinner',
        'date': '12 Jun 2026',
        'points': '+2,840',
        'icon': Icons.restaurant,
      },
      {
        'title': 'Delivery Order #28741',
        'date': '08 Jun 2026',
        'points': '+420',
        'icon': Icons.lunch_dining_rounded,
      },
      {
        'title': 'Banquet Booking — Anniversary',
        'date': '01 Jun 2026',
        'points': '+12,000',
        'icon': Icons.celebration,
      },
      {
        'title': 'ODC Order — Family Function',
        'date': '20 May 2026',
        'points': '+6,800',
        'icon': Icons.local_shipping_outlined,
      },
      {
        'title': 'Dough by Yanki · Lunch',
        'date': '14 May 2026',
        'points': '+940',
        'icon': Icons.local_pizza_outlined,
      },
    ];

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: activities.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final a = activities[index];
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: const Color(0xFF131715),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  a['icon'] as IconData,
                  color: const Color(0xFFDF9E5B),
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      a['title'] as String,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      a['date'] as String,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white.withOpacity(0.4),
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                a['points'] as String,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFFDF9E5B),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
