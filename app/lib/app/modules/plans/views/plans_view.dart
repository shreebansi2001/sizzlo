import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/plans_controller.dart';
import '../../../core/theme/app_colors.dart';

class PlansView extends GetView<PlansController> {
  const PlansView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: Column(
          children: [
            // Top App Bar
            Container(
              height: 64,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: const BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: Color(0x22C9A24D),
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                children: [
                  GestureDetector(
                    onTap: () => Get.back(),
                    child: Container(
                      width: 42,
                      height: 42,
                      decoration: const BoxDecoration(
                        color: Color(0xFF163E33),
                        shape: BoxShape.circle,
                      ),
                      child: const Center(
                        child: Icon(
                          Icons.chevron_left_rounded,
                          color: Color(0xFF4EE3B8),
                          size: 24,
                        ),
                      ),
                    ),
                  ),
                  Expanded(
                    child: Text(
                      'Subscription Plans',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                        color: AppColors.goldChampagne,
                      ),
                    ),
                  ),
                  const SizedBox(width: 42), // Balance width
                ],
              ),
            ),

            // Scrollable Content
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Tag
                    Text(
                      'YOUR NEXT CHAPTER',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        letterSpacing: 3.0,
                        color: AppColors.gold,
                      ),
                    ),
                    const SizedBox(height: 8),

                    // Title
                    Text(
                      'Choose Your Yanki\nSubscription',
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 30,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        height: 1.15,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 6),

                    // Subtitle
                    Text(
                      'Select the subscription that fits your lifestyle.',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        color: AppColors.textSecondary,
                      ),
                    ),
                    const SizedBox(height: 20),

                    // Plan 1: Classic Subscription
                    Obx(
                      () => _buildPlanCard(
                        planId: 'classic',
                        isSelected: controller.selectedPlan.value == 'classic',
                        title: 'Classic Subscription',
                        subtitle: 'Yanki Sizzlerr only',
                        price: '₹5,000',
                        offersLabel: '6 OFFERS',
                        highlights: [
                          '10% off across 6 visits',
                          'Birthday week benefit',
                          'Complimentary couple meal',
                        ],
                        gradientColors: const [
                          Color(0xFF522815),
                          Color(0xFF33160B),
                        ],
                        borderColor: const Color(0xFF7F4420),
                        accentColor: const Color(0xFFDF9E5B),
                        onSelect: () => controller.selectPlan('classic'),
                        onDetails: () => _showBenefitsModal(
                          context,
                          'Classic Subscription',
                          '₹5,000',
                          [
                            '10% off bill amount, 6 times a year',
                            'Complimentary birthday dessert and gift voucher',
                            'Complimentary couple meal on special anniversary',
                            'Priority table reservations on weekends',
                            'Valid across all Yanki Sizzlerr locations',
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Plan 2: Signature Subscription
                    Obx(
                      () => _buildPlanCard(
                        planId: 'signature',
                        isSelected: controller.selectedPlan.value == 'signature',
                        title: 'Signature Subscription',
                        subtitle: 'Restaurant, Dough, banquet and catering',
                        price: '₹10,000',
                        offersLabel: '12 OFFERS',
                        highlights: [
                          '12 dining visits annually',
                          'Dough by Yanki rewards',
                          'Banquet and catering benefits',
                        ],
                        gradientColors: const [
                          Color(0xFF0D4335),
                          Color(0xFF07241C),
                        ],
                        borderColor: const Color(0xFF155C48),
                        accentColor: const Color(0xFF4EE3B8),
                        onSelect: () => controller.selectPlan('signature'),
                        onDetails: () => _showBenefitsModal(
                          context,
                          'Signature Subscription',
                          '₹10,000',
                          [
                            '12 dining visits annually with 10% privilege discount',
                            'Couple dinner at 50% off twice per year',
                            'Dough by Yanki Buy 1 Get 1 complimentary',
                            'Banquet & catering privileges at House of Yanki',
                            'Free renewal subscription upon earning 25,000 points',
                            'VIP private table reservation with dedicated manager',
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 18),

                    // Plan 3: Elite Subscription matching Image 2
                    Obx(
                      () => _buildPlanCard(
                        planId: 'elite',
                        isSelected: controller.selectedPlan.value == 'elite',
                        title: 'Elite Subscription',
                        subtitle: 'All Yanki outlets',
                        price: '₹15,000',
                        offersLabel: '10 OFFERS + GIFT VOUCHERS',
                        highlights: [
                          '18 dining visits annually',
                          'Premium banquet benefits',
                          'Exclusive gift vouchers',
                        ],
                        gradientColors: const [
                          Color(0xFF282015),
                          Color(0xFF16120C),
                        ],
                        borderColor: const Color(0xFF4A3820),
                        accentColor: const Color(0xFFDF9E5B),
                        onSelect: () => controller.selectPlan('elite'),
                        onDetails: () => _showBenefitsModal(
                          context,
                          'Elite Subscription',
                          '₹15,000',
                          [
                            '18 dining visits annually across all Yanki outlets',
                            'Premium banquet reservations with dedicated catering manager',
                            'Exclusive gift vouchers worth ₹5,000 for family & friends',
                            'All access pass to Yanki Signature, Dough & Banquets',
                            'Complimentary VIP birthday dinner for up to 4 guests',
                            'Highest priority reservation window even on rush days',
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),

            // Bottom Sticky Bar: Skip For Now
            Container(
              padding: const EdgeInsets.fromLTRB(18, 14, 18, 20),
              decoration: const BoxDecoration(
                color: Color(0xFF070A09),
                border: Border(
                  top: BorderSide(
                    color: Color(0x22C9A24D),
                    width: 1,
                  ),
                ),
              ),
              child: SizedBox(
                width: double.infinity,
                height: 54,
                child: DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: AppColors.champagneGradient,
                    borderRadius: BorderRadius.circular(27),
                    boxShadow: [
                      BoxShadow(
                        color: AppColors.gold.withOpacity(0.35),
                        blurRadius: 16,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: ElevatedButton(
                    onPressed: controller.proceedToHome,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.transparent,
                      shadowColor: Colors.transparent,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(27),
                      ),
                    ),
                    child: Text(
                      'Skip For Now',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: const Color(0xFF070A09),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlanCard({
    required String planId,
    required bool isSelected,
    required String title,
    required String subtitle,
    required String price,
    required String offersLabel,
    required List<String> highlights,
    required List<Color> gradientColors,
    required Color borderColor,
    required Color accentColor,
    required VoidCallback onSelect,
    required VoidCallback onDetails,
  }) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: isSelected ? AppColors.gold : borderColor,
          width: isSelected ? 1.8 : 1.0,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.35),
            blurRadius: 16,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header row with Crown icon
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'YANKI SUBSCRIPTION',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 2.2,
                        color: accentColor,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      title,
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 26,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.7),
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: accentColor.withOpacity(0.6)),
                  color: Colors.black.withOpacity(0.2),
                ),
                child: Center(
                  child: Icon(
                    Icons.workspace_premium_outlined,
                    color: accentColor,
                    size: 22,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Price Row
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                price,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                  color: AppColors.goldChampagne,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                'annually',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                  color: Colors.white.withOpacity(0.7),
                ),
              ),
            ],
          ),

          const SizedBox(height: 8),

          // Offers badge label
          Text(
            offersLabel,
            style: GoogleFonts.plusJakartaSans(
              fontSize: 11,
              fontWeight: FontWeight.w800,
              letterSpacing: 2.0,
              color: AppColors.goldChampagne,
            ),
          ),

          const SizedBox(height: 14),

          // Highlights list
          ...highlights.map(
            (item) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                children: [
                  Container(
                    width: 20,
                    height: 20,
                    decoration: const BoxDecoration(
                      color: AppColors.goldChampagne,
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Icon(
                        Icons.check,
                        color: Color(0xFF070A09),
                        size: 14,
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      item,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 13,
                        fontWeight: FontWeight.w500,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: 14),

          // Action Buttons: View Benefits & Select
          Row(
            children: [
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: OutlinedButton(
                    onPressed: onDetails,
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.white,
                      side: BorderSide(
                        color: accentColor.withOpacity(0.7),
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(24),
                      ),
                    ),
                    child: Text(
                      'View Benefits',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: SizedBox(
                  height: 48,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: AppColors.champagneGradient,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.gold.withOpacity(0.35),
                          blurRadius: 10,
                          offset: const Offset(0, 3),
                        ),
                      ],
                    ),
                    child: ElevatedButton(
                      onPressed: onSelect,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.transparent,
                        shadowColor: Colors.transparent,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(24),
                        ),
                      ),
                      child: Text(
                        isSelected ? 'Selected' : 'Select',
                        style: GoogleFonts.plusJakartaSans(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF070A09),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _showBenefitsModal(
    BuildContext context,
    String planTitle,
    String price,
    List<String> benefits,
  ) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF141917),
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(28)),
      ),
      builder: (context) {
        return Padding(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 36),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 44,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'YANKI PRIVILEGES',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 11,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 2.5,
                  color: AppColors.gold,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                planTitle,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              Text(
                '$price / year subscription',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 13,
                  color: AppColors.goldChampagne,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 20),
              ...benefits.map(
                (b) => Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Icon(
                        Icons.check_circle_rounded,
                        color: AppColors.gold,
                        size: 18,
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(
                          b,
                          style: GoogleFonts.plusJakartaSans(
                            fontSize: 13,
                            color: Colors.white.withOpacity(0.9),
                            height: 1.3,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: () => Navigator.pop(context),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.flame,
                    foregroundColor: const Color(0xFF070A09),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                  child: Text(
                    'Got It',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
