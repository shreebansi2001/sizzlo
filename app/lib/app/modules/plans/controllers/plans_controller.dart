import 'package:get/get.dart';
import '../../../routes/app_routes.dart';
import '../../home/controllers/home_controller.dart';
import '../../../controllers/navigation_controller.dart';

class PlansController extends GetxController {
  final RxString selectedPlan = 'none'.obs;

  @override
  void onInit() {
    super.onInit();
    if (Get.isRegistered<HomeController>()) {
      selectedPlan.value = Get.find<HomeController>().member.value.planId;
    }
  }

  void selectPlan(String planId) {
    selectedPlan.value = planId;
    if (!Get.isRegistered<HomeController>()) {
      Get.put(HomeController(), permanent: true);
    }
    Get.find<HomeController>().switchPlan(planId);
    if (Get.isRegistered<NavigationController>()) {
      Get.find<NavigationController>().changeTab(0);
    }
    Get.offAllNamed(AppRoutes.HOME);
  }

  void proceedToHome() {
    // Skip for now - sets plan to none (Non-subscriber layout)
    if (!Get.isRegistered<HomeController>()) {
      Get.put(HomeController(), permanent: true);
    }
    Get.find<HomeController>().switchPlan('none');
    if (Get.isRegistered<NavigationController>()) {
      Get.find<NavigationController>().changeTab(0);
    }
    Get.offAllNamed(AppRoutes.HOME);
  }
}
