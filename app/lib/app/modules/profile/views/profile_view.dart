import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/profile_controller.dart';
import '../../home/controllers/home_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../routes/app_routes.dart';
import '../../../controllers/navigation_controller.dart';

class ProfileView extends GetView<ProfileController> {
  final bool isTab;

  const ProfileView({Key? key, this.isTab = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<ProfileController>()) {
      Get.put(ProfileController());
    }

    return Obx(() {
      final m = Get.isRegistered<HomeController>()
          ? Get.find<HomeController>().member.value
          : controller.member.value;
      final isSub = m.isSubscriber;

      return Scaffold(
        backgroundColor: AppColors.background,
        appBar: AppBar(
          title: const Text(
            'My Profile',
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
            children: [
              // User Header matching Image 1
              _buildUserHeader(m, isSub),

              const SizedBox(height: 16),

              // 3 Stats in a Row matching Image 1
              _buildThreeStatsRow(m, isSub),

              const SizedBox(height: 16),

              // Subscription Banner matching Image 1
              _buildSubscriptionBanner(m, isSub),

              const SizedBox(height: 16),

              // List of 8 Options matching Image 1
              _buildMenuList(m, isSub),

              const SizedBox(height: 28),

              // Logout Button matching Image 1
              GestureDetector(
                onTap: controller.logout,
                child: Container(
                  padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 28),
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444).withOpacity(0.08),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.2)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: const [
                      Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 18),
                      SizedBox(width: 8),
                      Text(
                        'Logout',
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: Color(0xFFEF4444),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Generous breathing room so content never gets overlapped by floating bottom nav
              SizedBox(height: isTab ? 140 : 40),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildUserHeader(dynamic m, bool isSub) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: const Color(0xFF131715),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        children: [
          // Circular Avatar "R" with bronze tone
          Container(
            width: 58,
            height: 58,
            decoration: BoxDecoration(
              color: const Color(0xFF4A301D),
              shape: BoxShape.circle,
              border: Border.all(
                color: const Color(0xFF8F582E),
                width: 1.5,
              ),
            ),
            child: const Center(
              child: Text(
                'R',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFFDF9E5B),
                ),
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Rahul Mehta',
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  '+91 98250 12345 · rahul.mehta@yanki.in',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.45),
                  ),
                ),
                const SizedBox(height: 8),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFF281C10),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFF6B4520)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star, size: 11, color: Color(0xFFDF9E5B)),
                      const SizedBox(width: 4),
                      Text(
                        isSub ? 'VIP SUBSCRIBER' : 'STANDARD GUEST',
                        style: const TextStyle(
                          fontSize: 9,
                          letterSpacing: 1.0,
                          fontWeight: FontWeight.w800,
                          color: Color(0xFFDF9E5B),
                        ),
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

  Widget _buildThreeStatsRow(dynamic m, bool isSub) {
    return Row(
      children: [
        _statBox('SAVED', isSub ? '₹24,500' : '₹0'),
        const SizedBox(width: 10),
        _statBox('COUPONS', isSub ? '5/12' : '0/0'),
        const SizedBox(width: 10),
        _statBox('POINTS', '1,25,000'),
      ],
    );
  }

  Widget _statBox(String label, String value) {
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

  Widget _buildSubscriptionBanner(dynamic m, bool isSub) {
    return GestureDetector(
      onTap: () => Get.toNamed(AppRoutes.PLANS),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(
          color: const Color(0xFF131715),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.08)),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'SUBSCRIPTION',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.8,
                      color: AppColors.gold,
                    ),
                  ),
                  const SizedBox(height: 6),
                  Text(
                    isSub ? 'Valid till 20 Jun 2027' : 'Choose a plan · No active benefits',
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isSub ? Colors.white : const Color(0xFFDF9E5B),
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    isSub
                        ? '365 days remaining · renew anytime to extend'
                        : 'Tap to view 3 exclusive plans & unlock VIP perks',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.45),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isSub ? Icons.sync_rounded : Icons.arrow_forward_ios_rounded,
                size: 18,
                color: const Color(0xFFDF9E5B),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuList(dynamic m, bool isSub) {
    final items = [
      {
        'title': 'Personal Information',
        'subtitle': 'Name, mobile, email, address',
        'icon': Icons.person_outline_rounded,
        'action': () {},
      },
      {
        'title': 'Subscription Details',
        'subtitle': isSub ? 'VIP SUBSCRIBER · YSM-2024-04821' : 'No active subscription · Tap to join',
        'icon': Icons.workspace_premium_outlined,
        'action': () => Get.toNamed(AppRoutes.PLANS),
      },
      {
        'title': 'Coupon Summary',
        'subtitle': isSub ? '7 active · 5 used' : '0 active vouchers',
        'icon': Icons.confirmation_number_outlined,
        'action': () {
          if (Get.isRegistered<NavigationController>()) {
            Get.find<NavigationController>().changeTab(1);
          }
        },
      },
      {
        'title': 'Savings Summary',
        'subtitle': isSub ? '₹24,500 saved lifetime' : '₹0 saved',
        'icon': Icons.savings_outlined,
        'action': () {},
      },
      {
        'title': 'Points Summary',
        'subtitle': '1,25,000 pts · 5x weekend boost',
        'icon': Icons.stars_rounded,
        'action': () {
          if (Get.isRegistered<NavigationController>()) {
            Get.find<NavigationController>().changeTab(2);
          }
        },
      },
      {
        'title': 'Transaction History',
        'subtitle': 'Visits, deliveries, banquets',
        'icon': Icons.receipt_long_outlined,
        'action': () {},
      },
      {
        'title': 'Support',
        'subtitle': '24/7 concierge · WhatsApp',
        'icon': Icons.headset_mic_outlined,
        'action': () {},
      },
      {
        'title': 'Terms & Conditions',
        'subtitle': 'Subscription agreement',
        'icon': Icons.description_outlined,
        'action': () {},
      },
    ];

    return Material(
      color: const Color(0xFF131715),
      borderRadius: BorderRadius.circular(20),
      clipBehavior: Clip.antiAlias,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
        children: List.generate(items.length, (index) {
          final it = items[index];
          final isLast = index == items.length - 1;
          return Column(
            children: [
              ListTile(
                contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                leading: Container(
                  width: 36,
                  height: 36,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.06),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    it['icon'] as IconData,
                    size: 18,
                    color: const Color(0xFFDF9E5B),
                  ),
                ),
                title: Text(
                  it['title'] as String,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: Colors.white.withOpacity(0.9),
                  ),
                ),
                subtitle: Text(
                  it['subtitle'] as String,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.white.withOpacity(0.4),
                  ),
                ),
                trailing: Icon(
                  Icons.chevron_right_rounded,
                  size: 20,
                  color: Colors.white.withOpacity(0.3),
                ),
                onTap: it['action'] as VoidCallback,
              ),
              if (!isLast)
                Divider(
                  height: 1,
                  thickness: 1,
                  indent: 68,
                  endIndent: 16,
                  color: Colors.white.withOpacity(0.04),
                ),
            ],
          );
        }),
      ),
    ),
    );
  }
}
