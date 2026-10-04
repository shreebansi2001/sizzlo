import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/onboarding_controller.dart';
import '../../../core/theme/app_colors.dart';

class OnboardingView extends GetView<OnboardingController> {
  const OnboardingView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF070A09),
      body: Stack(
        children: [
          // Ambient Radial Background Glows
          Positioned(
            top: -60,
            right: -60,
            child: Container(
              width: 260,
              height: 260,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.gold.withOpacity(0.18),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),
          Positioned(
            top: 140,
            left: MediaQuery.of(context).size.width / 2 - 120,
            child: Container(
              width: 240,
              height: 240,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: RadialGradient(
                  colors: [
                    AppColors.flame.withOpacity(0.15),
                    Colors.transparent,
                  ],
                ),
              ),
            ),
          ),

          // Main Layout
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              child: Column(
                children: [
                  // Top Navigation Bar
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            margin: const EdgeInsets.only(right: 8),
                            decoration: const BoxDecoration(
                              color: AppColors.flame,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const Text(
                            'YANKI · WELCOME',
                            style: TextStyle(
                              color: AppColors.flame,
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              letterSpacing: 3.2,
                            ),
                          ),
                        ],
                      ),
                      TextButton(
                        onPressed: controller.skip,
                        style: TextButton.styleFrom(
                          foregroundColor: const Color(0xFF8BA19A),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        ),
                        child: const Text(
                          'Skip',
                          style: TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 16),

                  // Carousel Content Area
                  Expanded(
                    child: PageView.builder(
                      controller: controller.pageController,
                      onPageChanged: controller.onPageChanged,
                      itemCount: controller.slides.length,
                      itemBuilder: (context, index) {
                        final slide = controller.slides[index];
                        return SingleChildScrollView(
                          physics: const BouncingScrollPhysics(),
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const SizedBox(height: 12),
                              // Mascot Artwork Card with Floating Badges
                              _buildMascotCard(context, slide.badgeIcon),

                              const SizedBox(height: 32),

                              // VIP Badge Pill
                              Text(
                                slide.badge,
                                style: const TextStyle(
                                  color: Color(0xFFC9A24D),
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 3.2,
                                ),
                              ),

                              const SizedBox(height: 12),

                              // Luxury Serif Title
                              Text(
                                slide.title,
                                textAlign: TextAlign.center,
                                style: GoogleFonts.playfairDisplay(
                                  fontSize: 27,
                                  fontWeight: FontWeight.w700,
                                  color: const Color(0xFFE5A93C),
                                  height: 1.25,
                                ),
                              ),

                              const SizedBox(height: 12),

                              // Subtitle Description
                              Padding(
                                padding: const EdgeInsets.symmetric(horizontal: 16),
                                child: Text(
                                  slide.desc,
                                  textAlign: TextAlign.center,
                                  style: const TextStyle(
                                    fontSize: 13,
                                    color: Color(0xFF94A3B8),
                                    height: 1.5,
                                  ),
                                ),
                              ),

                              if (index == 1) ...[
                                const SizedBox(height: 20),
                                _buildSlide1Perks(),
                              ],

                              if (index == 2) ...[
                                const SizedBox(height: 20),
                                _buildSlide2Metrics(),
                              ],
                            ],
                          ),
                        );
                      },
                    ),
                  ),

                  // Page Indicator Dots
                  Obx(
                    () => Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        controller.slides.length,
                        (idx) {
                          final isActive = controller.currentSlide.value == idx;
                          return AnimatedContainer(
                            duration: const Duration(milliseconds: 250),
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            width: isActive ? 28 : 6,
                            height: 5,
                            decoration: BoxDecoration(
                              color: isActive
                                  ? AppColors.flame
                                  : Colors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(3),
                            ),
                          );
                        },
                      ),
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Action Buttons
                  Obx(
                    () {
                      final curr = controller.currentSlide.value;
                      final isLast = curr == controller.slides.length - 1;

                      return Row(
                        children: [
                          if (curr > 0) ...[
                            Expanded(
                              flex: 1,
                              child: OutlinedButton(
                                onPressed: controller.prev,
                                style: OutlinedButton.styleFrom(
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  side: BorderSide(color: Colors.white.withOpacity(0.12)),
                                  backgroundColor: const Color(0xFF131715),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                ),
                                child: const Text(
                                  'Back',
                                  style: TextStyle(
                                    color: Colors.white,
                                    fontSize: 14,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                          ],
                          Expanded(
                            flex: 2,
                            child: ElevatedButton(
                              onPressed: controller.next,
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.flame,
                                foregroundColor: Colors.black,
                                elevation: 6,
                                shadowColor: AppColors.flame.withOpacity(0.4),
                                padding: const EdgeInsets.symmetric(vertical: 16),
                                shape: RoundedRectangleBorder(
                                  borderRadius: BorderRadius.circular(20),
                                ),
                              ),
                              child: Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    isLast ? 'Get Started' : 'Continue',
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Icon(
                                    isLast ? Icons.auto_awesome : Icons.chevron_right_rounded,
                                    size: 18,
                                    color: Colors.black,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      );
                    },
                  ),

                  const SizedBox(height: 14),

                  // Footer Tagline
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: const [
                      Icon(
                        Icons.calendar_month_outlined,
                        size: 13,
                        color: Color(0xFF64748B),
                      ),
                      SizedBox(width: 6),
                      Text(
                        '365 DAYS · 12 COUPONS · 1 UNFORGETTABLE YEAR',
                        style: TextStyle(
                          color: Color(0xFF64748B),
                          fontSize: 10,
                          fontWeight: FontWeight.w600,
                          letterSpacing: 1.6,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMascotCard(BuildContext context, IconData topIcon) {
    return Center(
      child: Stack(
        clipBehavior: Clip.none,
        alignment: Alignment.center,
        children: [
          // Radial Glow Behind Mascot Card
          Container(
            width: 195,
            height: 195,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(36),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFFFF8A00).withOpacity(0.28),
                  blurRadius: 40,
                  spreadRadius: 2,
                ),
              ],
            ),
          ),

          // Main Chocolate/Obsidian Mascot Card
          Container(
            width: 185,
            height: 185,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF261D17), Color(0xFF14100D)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(32),
              border: Border.all(
                color: const Color(0xFFFF8A00).withOpacity(0.25),
                width: 1.2,
              ),
            ),
            child: Center(
              child: Image.asset(
                'assets/images/sizzlo-mascot.png',
                height: 135,
                fit: BoxFit.contain,
              ),
            ),
          ),

          // Floating Top-Left Badge (Dark with Gold Crown)
          Positioned(
            top: -10,
            left: -10,
            child: Container(
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: const Color(0xFF141A17),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: AppColors.gold.withOpacity(0.35),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: const Icon(
                Icons.workspace_premium_outlined,
                color: AppColors.gold,
                size: 22,
              ),
            ),
          ),

          // Floating Bottom-Right Badge (Flame Amber with Gift)
          Positioned(
            bottom: -10,
            right: -10,
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.flame,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.flame.withOpacity(0.5),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: const Icon(
                Icons.card_giftcard_rounded,
                color: Color(0xFF14100D),
                size: 20,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSlide1Perks() {
    final perks = [
      '50% Dining Discount',
      'Subscriber Birthday Perks',
      'Anniversary Tables',
      'Banquet Discounts',
      'Dough by Yanki BOGO',
      'Priority Host Seating',
    ];

    return Wrap(
      spacing: 8,
      runSpacing: 8,
      alignment: WrapAlignment.center,
      children: perks.map((p) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: const Color(0xFF121715),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.white.withOpacity(0.08)),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('✦ ', style: TextStyle(color: AppColors.flame, fontSize: 10)),
              Text(
                p,
                style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildSlide2Metrics() {
    final metrics = [
      {'val': '365', 'label': 'Days Access'},
      {'val': '12', 'label': 'Exclusive Coupons'},
      {'val': '5×', 'label': 'Loyalty Rewards'},
      {'val': 'VIP', 'label': 'Table Access'},
    ];

    return Row(
      children: metrics.map((m) {
        return Expanded(
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 4),
            padding: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: const Color(0xFF121715),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.white.withOpacity(0.08)),
            ),
            child: Column(
              children: [
                Text(
                  m['val']!,
                  style: GoogleFonts.playfairDisplay(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: AppColors.flame,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  m['label']!,
                  textAlign: TextAlign.center,
                  style: const TextStyle(
                    color: Color(0xFF8BA19A),
                    fontSize: 9,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          ),
        );
      }).toList(),
    );
  }
}
