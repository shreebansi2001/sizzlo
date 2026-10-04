import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';

class TermsConditionsView extends StatelessWidget {
  const TermsConditionsView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Terms & Conditions',
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
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Intro
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
                  Text(
                    'VIP Membership Agreement',
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 17,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Last updated: October 2026 · Valid across all Yanki Sizzl\'o dining branches.',
                    style: TextStyle(fontSize: 11.5, color: Colors.white.withOpacity(0.45)),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 18),

            _termSection(
              '1. Membership Eligibility & Verification',
              'The Yanki Sizzl\'o VIP subscription is non-transferable and tied exclusively to the member\'s registered mobile phone number. Members must present their digital membership card in the app upon requesting billing.',
            ),
            _termSection(
              '2. Voucher Redemption Guidelines',
              '• Vouchers are redeemable exclusively for dine-in dining at Yanki Sizzl\'o outlets.\n• Maximum of one complimentary sizzler voucher may be redeemed per table per dining session.\n• Vouchers cannot be combined with external third-party aggregator promotions (Zomato Gold, Dineout).\n• Birthday vouchers are valid throughout the registered birthday calendar month.',
            ),
            _termSection(
              '3. Table Reservations & Priority Seating',
              'VIP priority seating guarantees accelerated table allocation. On weekends and public holidays, table holding is limited to 15 minutes past the reserved booking time.',
            ),
            _termSection(
              '4. Loyalty Points Accumulation',
              'Loyalty points accumulate on verified settlement amounts excluding taxes. Points maintain a validity period of 12 months from the date of credit and can be redeemed for dining vouchers or membership extensions.',
            ),
            _termSection(
              '5. Outdoor Catering & Banquets',
              'Catering discounts apply to food and beverage packages. Event dates are confirmed upon token advance settlement with our master banquet coordinator.',
            ),
            _termSection(
              '6. Privacy & Data Security',
              'Member contact details and dining preferences are protected under strict encryption standards and will never be disclosed to third-party commercial entities.',
            ),

            const SizedBox(height: 28),
          ],
        ),
      ),
    );
  }

  Widget _termSection(String title, String content) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF131715),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 13.5,
              fontWeight: FontWeight.bold,
              color: Color(0xFFDF9E5B),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            content,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withOpacity(0.7),
              height: 1.5,
            ),
          ),
        ],
      ),
    );
  }
}
