import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/card_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../widgets/sizzlo_vip_card.dart';
import '../../../widgets/custom_bottom_nav.dart';

class CardView extends GetView<CardController> {
  const CardView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Digital VIP Card'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Get.back(),
        ),
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Column(
              children: [
                // Interactive Flip Card
                Obx(
                  () => SizzloVipCard(
                    member: controller.member.value,
                    compact: false,
                    enableFlip: true,
                  ),
                ),

                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.touch_app_outlined, size: 16, color: AppColors.textMuted),
                    const SizedBox(width: 6),
                    Text(
                      'Tap card to flip between front and barcode pass',
                      style: TextStyle(fontSize: 12, color: AppColors.textSecondary.withOpacity(0.8)),
                    ),
                  ],
                ),

                const SizedBox(height: 28),

                // Card Actions (Copy ID, Add to Wallet)
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: controller.copyMembershipId,
                        icon: const Icon(Icons.copy_rounded, size: 16, color: AppColors.primary),
                        label: const Text('Copy ID', style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: AppColors.primary.withOpacity(0.2)),
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: controller.addToWallet,
                        icon: const Icon(Icons.wallet_rounded, size: 16, color: AppColors.gold),
                        label: const Text('Add to Wallet', style: TextStyle(fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          padding: const EdgeInsets.symmetric(vertical: 14),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 28),

                // Privileges list
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.black.withOpacity(0.05)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('VIP Member Privileges', style: AppTextStyles.titleMedium),
                      const SizedBox(height: 14),
                      _benefitItem(Icons.restaurant, '50% Dining Privilege', 'Across all Yanki restaurants and dining concepts'),
                      _benefitItem(Icons.event_seat, 'Guaranteed Table Reservations', 'Priority seating even during peak festive hours'),
                      _benefitItem(Icons.celebration, 'Complimentary Celebration Cakes', 'Special dessert curated for birthdays & anniversaries'),
                      _benefitItem(Icons.stars, '10x Loyalty Accrual', 'Earn 10 points for every ₹100 spent'),
                    ],
                  ),
                ),
                const SizedBox(height: 100),
              ],
            ),
          ),
          const Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: CustomBottomNav(currentIndex: 1),
          ),
        ],
      ),
    );
  }

  Widget _benefitItem(IconData icon, String title, String desc) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: AppColors.goldBg,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: AppColors.goldDark, size: 18),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary)),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
