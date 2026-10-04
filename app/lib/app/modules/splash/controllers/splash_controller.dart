import 'package:get/get.dart';
import '../../../routes/app_routes.dart';

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
    Get.offNamed(AppRoutes.ONBOARDING);
  }
}
