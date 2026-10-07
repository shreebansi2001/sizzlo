import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/profile_controller.dart';
import '../../home/controllers/home_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../routes/app_routes.dart';
import '../../../controllers/navigation_controller.dart';
import '../../../data/models/member_model.dart';

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
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            children: [
              // User Header
              _buildUserHeader(m, isSub),

              const SizedBox(height: 8),

              // 3 Stats in a Row
              _buildThreeStatsRow(m, isSub),

              const SizedBox(height: 8),

              // Subscription Banner
              _buildSubscriptionBanner(m, isSub),

              const SizedBox(height: 8),

              // List of Options
              _buildMenuList(m, isSub),

              const SizedBox(height: 20),

              // Action Buttons: Logout & Delete Account
              Wrap(
                alignment: WrapAlignment.center,
                spacing: 12,
                runSpacing: 10,
                children: [
                  GestureDetector(
                    onTap: controller.logout,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 20),
                      decoration: BoxDecoration(
                        color: const Color(0xFFEF4444).withOpacity(0.08),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.25)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.logout_rounded, color: Color(0xFFEF4444), size: 16),
                          SizedBox(width: 8),
                          Text(
                            'Logout',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFFEF4444),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: controller.deleteAccountConfirm,
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 18),
                      decoration: BoxDecoration(
                        color: Colors.red.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(color: Colors.red.withOpacity(0.25)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: const [
                          Icon(Icons.delete_outline_rounded, color: Colors.redAccent, size: 16),
                          SizedBox(width: 6),
                          Text(
                            'Delete Account',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.w600,
                              color: Colors.redAccent,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),

              // Generous bottom spacing for floating bottom navigation bar
              SizedBox(height: isTab ? 140 : 40),
            ],
          ),
        ),
      );
    });
  }

  Widget _buildUserHeader(MemberModel m, bool isSub) {
    final avatarLetter = (m.fullName.trim().isNotEmpty)
        ? m.fullName.trim()[0].toUpperCase()
        : 'V';
    final displayName = (m.fullName.trim().isNotEmpty)
        ? m.fullName
        : 'VIP Guest';
    final displayContact = (m.email.isNotEmpty)
        ? '${m.mobile} · ${m.email}'
        : m.mobile;

    return GestureDetector(
      onTap: () => Get.toNamed(AppRoutes.PERSONAL_INFO),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF131715),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Row(
          children: [
            // Circular Avatar with initial
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: const Color(0xFF4A301D),
                shape: BoxShape.circle,
                border: Border.all(
                  color: const Color(0xFF8F582E),
                  width: 1.5,
                ),
              ),
              child: Center(
                child: Text(
                  avatarLetter,
                  style: const TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Color(0xFFDF9E5B),
                  ),
                ),
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    displayName,
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    displayContact,
                    style: TextStyle(
                      fontSize: 11.5,
                      color: Colors.white.withOpacity(0.45),
                    ),
                  ),
                  const SizedBox(height: 6),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                    decoration: BoxDecoration(
                      color: const Color(0xFF281C10),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFF6B4520)),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.star, size: 10, color: Color(0xFFDF9E5B)),
                        const SizedBox(width: 4),
                        Text(
                          isSub ? (m.membershipType.isNotEmpty ? m.membershipType : 'VIP SUBSCRIBER') : 'STANDARD GUEST',
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
            Icon(Icons.chevron_right_rounded, color: Colors.white.withOpacity(0.3), size: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildThreeStatsRow(MemberModel m, bool isSub) {
    return Row(
      children: [
        _statBox('SAVED', '₹${m.totalSavings}', () => Get.toNamed(AppRoutes.SAVINGS_SUMMARY)),
        const SizedBox(width: 8),
        _statBox('COUPONS', '${m.couponsUsed}/${m.couponsTotal}', () => Get.toNamed(AppRoutes.COUPON_SUMMARY)),
        const SizedBox(width: 8),
        _statBox('POINTS', '${m.loyaltyPoints}', () {
          if (Get.isRegistered<NavigationController>()) {
            Get.find<NavigationController>().changeTab(2);
          }
        }),
      ],
    );
  }

  Widget _statBox(String label, String value, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 8),
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
                  color: Colors.white.withOpacity(0.5),
                ),
              ),
              const SizedBox(height: 4),
              FittedBox(
                fit: BoxFit.scaleDown,
                child: Text(
                  value,
                  style: GoogleFonts.plusJakartaSans(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: const Color(0xFFDF9E5B),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSubscriptionBanner(MemberModel m, bool isSub) {
    return GestureDetector(
      onTap: () => Get.toNamed(AppRoutes.SUBSCRIPTION_DETAILS),
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 11),
        decoration: BoxDecoration(
          color: const Color(0xFF131715),
          borderRadius: BorderRadius.circular(16),
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
                      fontSize: 9.5,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.5,
                      color: AppColors.gold,
                    ),
                  ),
                  const SizedBox(height: 3),
                  Text(
                    isSub ? 'Valid till ${m.expiryDate}' : 'Choose a plan · No active benefits',
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: isSub ? Colors.white : const Color(0xFFDF9E5B),
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    isSub
                        ? '${m.daysRemaining} days remaining · renew anytime to extend'
                        : 'Tap to view exclusive plans & unlock VIP perks',
                    style: TextStyle(
                      fontSize: 11,
                      color: Colors.white.withOpacity(0.45),
                    ),
                  ),
                ],
              ),
            ),
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.05),
                shape: BoxShape.circle,
              ),
              child: Icon(
                isSub ? Icons.sync_rounded : Icons.arrow_forward_ios_rounded,
                size: 15,
                color: const Color(0xFFDF9E5B),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuList(MemberModel m, bool isSub) {
    final items = [
      {
        'title': 'Personal Information',
        'subtitle': 'Name, mobile, email, address',
        'icon': Icons.person_outline_rounded,
        'action': () => Get.toNamed(AppRoutes.PERSONAL_INFO),
      },
      {
        'title': 'Subscription Details',
        'subtitle': isSub ? '${m.membershipType} · ${m.membershipId}' : 'No active subscription · Tap to join',
        'icon': Icons.workspace_premium_outlined,
        'action': () => Get.toNamed(AppRoutes.SUBSCRIPTION_DETAILS),
      },
      {
        'title': 'Coupon Summary',
        'subtitle': isSub ? '${m.couponsLeft} active · ${m.couponsUsed} used' : '0 active vouchers',
        'icon': Icons.confirmation_number_outlined,
        'action': () => Get.toNamed(AppRoutes.COUPON_SUMMARY),
      },
      {
        'title': 'Savings Summary',
        'subtitle': isSub ? '₹${m.totalSavings} saved lifetime' : '₹0 saved',
        'icon': Icons.savings_outlined,
        'action': () => Get.toNamed(AppRoutes.SAVINGS_SUMMARY),
      },
      {
        'title': 'Points Summary',
        'subtitle': '${m.loyaltyPoints} pts available',
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
        'action': () => Get.toNamed(AppRoutes.TRANSACTION_HISTORY),
      },
      {
        'title': 'Support & Concierge',
        'subtitle': '24/7 concierge · WhatsApp',
        'icon': Icons.headset_mic_outlined,
        'action': () => Get.toNamed(AppRoutes.SUPPORT),
      },
      {
        'title': 'Rate Dining Experience',
        'subtitle': '45-min post-meal smart review & feedback',
        'icon': Icons.star_rate_rounded,
        'action': controller.showReviewDialog,
      },
      if (m.loyaltyPoints >= 250000)
        {
          'title': 'Free Annual Renewal',
          'subtitle': 'Unlock 365 days via 250,000 points milestone',
          'icon': Icons.card_giftcard_rounded,
          'action': controller.renewWithPoints,
        },
      {
        'title': 'Terms & Conditions',
        'subtitle': 'Subscription agreement',
        'icon': Icons.description_outlined,
        'action': () => Get.toNamed(AppRoutes.TERMS),
      },
    ];

    return Material(
      color: const Color(0xFF131715),
      borderRadius: BorderRadius.circular(16),
      clipBehavior: Clip.antiAlias,
      child: Container(
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
          children: List.generate(items.length, (index) {
            final it = items[index];
            final isLast = index == items.length - 1;
            return Column(
              children: [
                ListTile(
                  dense: true,
                  visualDensity: const VisualDensity(horizontal: 0, vertical: -2),
                  contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 0),
                  minLeadingWidth: 0,
                  horizontalTitleGap: 12,
                  minVerticalPadding: 4,
                  leading: Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.06),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      it['icon'] as IconData,
                      size: 16,
                      color: const Color(0xFFDF9E5B),
                    ),
                  ),
                  title: Text(
                    it['title'] as String,
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 13.5,
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
                    size: 18,
                    color: Colors.white.withOpacity(0.3),
                  ),
                  onTap: it['action'] as VoidCallback,
                ),
                if (!isLast)
                  Divider(
                    height: 1,
                    thickness: 1,
                    indent: 58,
                    endIndent: 14,
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
