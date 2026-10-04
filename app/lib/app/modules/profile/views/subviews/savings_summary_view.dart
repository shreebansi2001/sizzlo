import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../data/models/member_model.dart';
import '../../../home/controllers/home_controller.dart';
import '../../controllers/profile_controller.dart';

class SavingsSummaryView extends StatelessWidget {
  const SavingsSummaryView({Key? key}) : super(key: key);

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
          'Savings Summary',
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
        final savings = m.totalSavings;

        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Hero Savings Banner
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(22),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF1E2822), Color(0xFF131915)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: const Color(0xFF10B981).withOpacity(0.3), width: 1.2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Text(
                      'TOTAL LIFETIME SAVINGS',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2.0,
                        color: const Color(0xFF10B981),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      '₹$savings',
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 36,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Earned through VIP Dining Discounts & Vouchers',
                      textAlign: TextAlign.center,
                      style: TextStyle(
                        fontSize: 11.5,
                        color: Colors.white.withOpacity(0.5),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 20),

              _sectionHeader('SAVINGS BREAKDOWN'),
              const SizedBox(height: 10),

              _savingsCard('Dine-In Food Vouchers', '₹${(savings * 0.45).toInt()}', 'Complimentary sizzlers & platters redeemed', Icons.local_dining_outlined),
              _savingsCard('Special Occasion Perks', '₹${(savings * 0.25).toInt()}', 'Birthday & anniversary dining bonuses', Icons.celebration_outlined),
              _savingsCard('Direct Kitchen Delivery', '₹${(savings * 0.15).toInt()}', 'Free home delivery & zero packaging charges', Icons.moped_outlined),
              _savingsCard('Loyalty Points Value', '₹${(m.loyaltyPoints * 0.1).toInt()}', '${m.loyaltyPoints} redeemable reward points', Icons.stars_rounded),

              const SizedBox(height: 20),

              // Value Return Note
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF131715),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.verified_outlined, color: Color(0xFFDF9E5B), size: 24),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Text(
                        'Your VIP status continues to save you an average of ₹1,200 per dining visit across Yanki Sizzl\'o locations.',
                        style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.7), height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 28),
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

  Widget _savingsCard(String title, String amount, String subtitle, IconData icon) {
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
              color: const Color(0xFF10B981).withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 20, color: const Color(0xFF10B981)),
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
                const SizedBox(height: 2),
                Text(
                  subtitle,
                  style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.45)),
                ),
              ],
            ),
          ),
          Text(
            amount,
            style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
          ),
        ],
      ),
    );
  }
}
