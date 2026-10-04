import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../routes/app_routes.dart';

class OnboardingSlide {
  final String badge;
  final String title;
  final String desc;
  final IconData badgeIcon;

  OnboardingSlide({
    required this.badge,
    required this.title,
    required this.desc,
    required this.badgeIcon,
  });
}

class OnboardingController extends GetxController {
  final RxInt currentSlide = 0.obs;
  late final PageController pageController;

  final List<OnboardingSlide> slides = [
    OnboardingSlide(
      badge: 'VIP EXPERIENCE',
      title: 'Subscription crafted\nfor connoisseurs',
      desc: 'Unlock exclusive privileges across the brand Yanki — Yanki Sizzlerr restaurants, House of Yanki Banquet & Catering, Dough by Yanki.',
      badgeIcon: Icons.workspace_premium_outlined,
    ),
    OnboardingSlide(
      badge: '12 EXCLUSIVE COUPONS',
      title: 'A year of curated\nindulgence',
      desc: '50% dining discounts, subscriber birthday benefits, anniversary tables, banquet & Dough by Yanki offers.',
      badgeIcon: Icons.confirmation_number_outlined,
    ),
    OnboardingSlide(
      badge: 'WORTH ₹15,000',
      title: '365 days.\nEndless privilege.',
      desc: 'Loyalty rewards, priority reservations, complimentary surprises — yours, all year.',
      badgeIcon: Icons.stars_rounded,
    ),
  ];

  @override
  void onInit() {
    super.onInit();
    pageController = PageController();
  }

  @override
  void onClose() {
    pageController.dispose();
    super.onClose();
  }

  void onPageChanged(int index) {
    currentSlide.value = index;
  }

  void next() {
    if (currentSlide.value < slides.length - 1) {
      pageController.nextPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    } else {
      finishOnboarding();
    }
  }

  void prev() {
    if (currentSlide.value > 0) {
      pageController.previousPage(
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeInOut,
      );
    }
  }

  void skip() {
    finishOnboarding();
  }

  void finishOnboarding() {
    Get.offNamed(AppRoutes.LOGIN);
  }
}
