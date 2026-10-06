import 'package:get/get.dart';
import '../../../routes/app_routes.dart';
import '../../../data/services/local_storage_service.dart';
import '../../../core/values/app_constants.dart';

class SplashController extends GetxController {
  final RxDouble opacity = 0.0.obs;

  @override
  void onInit() {
    super.onInit();
    _startAnimation();
  }

  void _startAnimation() async {
    await Future.delayed(const Duration(milliseconds: 300));
    await Future.delayed(const Duration(milliseconds: 2200));

    try {
      final bool loggedIn = await LocalStorageService.isLoggedIn();
      final bool seenOnboarding = await LocalStorageService.hasSeenOnboarding();

      if (loggedIn) {
        final session = await LocalStorageService.getUserSession();
        if (session['mobile'] != null && session['mobile']!.isNotEmpty) {
          AppConstants.currentUserMobile = session['mobile']!;
        }
        if (session['membershipId'] != null && session['membershipId']!.isNotEmpty) {
          AppConstants.currentMembershipId = session['membershipId']!;
        }
        if (session['name'] != null && session['name']!.isNotEmpty) {
          AppConstants.currentUserName = session['name']!;
        }
        Get.offAllNamed(AppRoutes.HOME);
        return;
      }

      if (seenOnboarding) {
        Get.offAllNamed(AppRoutes.LOGIN);
        return;
      }
    } catch (_) {}

    Get.offAllNamed(AppRoutes.ONBOARDING);
  }
}
