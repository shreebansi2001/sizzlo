import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../data/models/member_model.dart';
import '../../../../routes/app_routes.dart';
import '../../../home/controllers/home_controller.dart';
import '../../controllers/profile_controller.dart';

class SubscriptionDetailsView extends StatelessWidget {
  const SubscriptionDetailsView({Key? key}) : super(key: key);

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
          'Subscription Details',
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
      body: Obx(() {
        final m = _getMember();
        final isSub = m.isSubscriber;

        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // VIP Membership Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2B1D12), Color(0xFF16120D)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFFDF9E5B).withOpacity(0.3), width: 1.2),
                  boxShadow: [
                    BoxShadow(
                      color: const Color(0xFFDF9E5B).withOpacity(0.12),
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
                      children: [
                        Text(
                          'YANKI SIZZL\'O VIP',
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 2.0,
                            color: const Color(0xFFDF9E5B),
                          ),
                        ),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(
                            color: isSub ? const Color(0xFF10B981).withOpacity(0.15) : Colors.white.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSub ? const Color(0xFF10B981) : Colors.white30,
                              width: 1,
                            ),
                          ),
                          child: Text(
                            isSub ? 'ACTIVE' : 'NO PLAN',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                              color: isSub ? const Color(0xFF10B981) : Colors.white70,
                              letterSpacing: 0.8,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    Text(
                      isSub ? (m.membershipType.isNotEmpty ? m.membershipType : 'SIGNATURE VIP PASS') : 'Standard Dining Guest',
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      isSub && m.membershipId.isNotEmpty ? 'ID: ${m.membershipId}' : 'ID: Not Assigned (VIP Only)',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.6),
                        letterSpacing: 1.0,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'VALID FROM',
                              style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.4), letterSpacing: 1.0),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              m.issuedDate.isNotEmpty ? m.issuedDate : 'Today',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                            ),
                          ],
                        ),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              'EXPIRES ON',
                              style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.4), letterSpacing: 1.0),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              isSub && m.expiryDate.isNotEmpty && m.expiryDate != '—' ? m.expiryDate : '—',
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFFDF9E5B)),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              // Membership Perks Section
              _sectionHeader(isSub ? 'ACTIVE VIP PRIVILEGES' : 'VIP PRIVILEGES (SUBSCRIBE TO UNLOCK)'),
              const SizedBox(height: 10),
              _perkTile(
                Icons.restaurant_menu_rounded,
                '12 Complimentary Sizzler & Platter Vouchers',
                'Pre-loaded in your account · Redeemable anytime at all outlets',
              ),
              _perkTile(
                Icons.celebration_outlined,
                'Complimentary Birthday Sizzler',
                'Free signature sizzler for you and your companion on your birthday month',
              ),
              _perkTile(
                Icons.stars_rounded,
                '2X Loyalty Points Earning',
                'Earn 100 points per ₹100 spent across dining, delivery, and banquet bookings',
              ),
              _perkTile(
                Icons.table_restaurant_outlined,
                'Priority Table Reservation',
                'Guaranteed VIP table allocation with zero waiting time on busy weekends',
              ),
              _perkTile(
                Icons.local_shipping_outlined,
                'Free Home Delivery & Zero Packaging Charges',
                'Valid on all direct kitchen orders through Yanki direct delivery',
              ),

              const SizedBox(height: 24),

              // CTA button
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () => Get.toNamed(AppRoutes.PLANS),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDF9E5B),
                    foregroundColor: const Color(0xFF070A09),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: Text(
                    isSub ? 'Renew or Upgrade Plan' : 'Explore VIP Subscription Plans',
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                  ),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        );
      }),
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

  Widget _perkTile(IconData icon, String title, String subtitle) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF131715),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
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
                  style: const TextStyle(
                    fontSize: 13.5,
                    fontWeight: FontWeight.w600,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 3),
                Text(
                  subtitle,
                  style: TextStyle(
                    fontSize: 11,
                    color: Colors.white.withOpacity(0.5),
                    height: 1.35,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
