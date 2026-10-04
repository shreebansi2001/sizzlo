import 'package:get/get.dart';
import 'app_routes.dart';
import '../modules/splash/bindings/splash_binding.dart';
import '../modules/splash/views/splash_view.dart';
import '../modules/onboarding/bindings/onboarding_binding.dart';
import '../modules/onboarding/views/onboarding_view.dart';
import '../modules/auth/bindings/auth_binding.dart';
import '../modules/auth/views/login_view.dart';
import '../modules/auth/views/verify_view.dart';
import '../modules/auth/views/register_view.dart';
import '../modules/plans/bindings/plans_binding.dart';
import '../modules/plans/views/plans_view.dart';
import '../modules/home/bindings/home_binding.dart';
import '../modules/home/views/home_view.dart';
import '../modules/card/bindings/card_binding.dart';
import '../modules/card/views/card_view.dart';
import '../modules/coupons/bindings/coupons_binding.dart';
import '../modules/coupons/views/coupons_view.dart';
import '../modules/reservations/bindings/reservations_binding.dart';
import '../modules/reservations/views/reservations_view.dart';
import '../modules/loyalty/bindings/loyalty_binding.dart';
import '../modules/loyalty/views/loyalty_view.dart';
import '../modules/delivery/bindings/delivery_binding.dart';
import '../modules/delivery/views/delivery_view.dart';
import '../modules/notifications/bindings/notifications_binding.dart';
import '../modules/notifications/views/notifications_view.dart';
import '../modules/profile/bindings/profile_binding.dart';
import '../modules/profile/views/profile_view.dart';

class AppPages {
  static const INITIAL = AppRoutes.SPLASH;

  static final routes = [
    GetPage(
      name: AppRoutes.SPLASH,
      page: () => const SplashView(),
      binding: SplashBinding(),
    ),
    GetPage(
      name: AppRoutes.ONBOARDING,
      page: () => const OnboardingView(),
      binding: OnboardingBinding(),
    ),
    GetPage(
      name: AppRoutes.LOGIN,
      page: () => const LoginView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.VERIFY,
      page: () => const VerifyView(),
      binding: AuthBinding(),
    ),
    GetPage(
      name: AppRoutes.REGISTER,
      page: () => const RegisterView(),
    ),
    GetPage(
      name: AppRoutes.PLANS,
      page: () => const PlansView(),
      binding: PlansBinding(),
    ),
    GetPage(
      name: AppRoutes.HOME,
      page: () => const HomeView(),
      binding: HomeBinding(),
    ),
    GetPage(
      name: AppRoutes.CARD,
      page: () => const CardView(),
      binding: CardBinding(),
    ),
    GetPage(
      name: AppRoutes.COUPONS,
      page: () => const CouponsView(),
      binding: CouponsBinding(),
    ),
    GetPage(
      name: AppRoutes.RESERVATIONS,
      page: () => const ReservationsView(),
      binding: ReservationsBinding(),
    ),
    GetPage(
      name: AppRoutes.LOYALTY,
      page: () => const LoyaltyView(),
      binding: LoyaltyBinding(),
    ),
    GetPage(
      name: AppRoutes.DELIVERY,
      page: () => const DeliveryView(),
      binding: DeliveryBinding(),
    ),
    GetPage(
      name: AppRoutes.NOTIFICATIONS,
      page: () => const NotificationsView(),
      binding: NotificationsBinding(),
    ),
    GetPage(
      name: AppRoutes.PROFILE,
      page: () => const ProfileView(),
      binding: ProfileBinding(),
    ),
  ];
}
