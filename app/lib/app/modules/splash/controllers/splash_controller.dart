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
    opacity.value = 1.0;
    await Future.delayed(const Duration(milliseconds: 1800));
    Get.offNamed(AppRoutes.HOME);
  }
}
