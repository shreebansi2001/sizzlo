import 'package:get/get.dart';
import '../modules/home/controllers/home_controller.dart';
import '../modules/coupons/controllers/coupons_controller.dart';
import '../modules/loyalty/controllers/loyalty_controller.dart';
import '../modules/notifications/controllers/notifications_controller.dart';
import '../modules/profile/controllers/profile_controller.dart';

class NavigationController extends GetxController {
  static NavigationController get to => Get.find();

  final RxInt currentIndex = 0.obs;

  void changeTab(int index) {
    if (index >= 0 && index <= 4) {
      currentIndex.value = index;
      _refreshTabSilently(index);
    }
  }

  void _refreshTabSilently(int index) {
    switch (index) {
      case 0:
        if (Get.isRegistered<HomeController>()) {
          Get.find<HomeController>().loadDashboardData(silent: true);
        }
        break;
      case 1:
        if (Get.isRegistered<CouponsController>()) {
          Get.find<CouponsController>().loadCoupons(silent: true);
        }
        break;
      case 2:
        if (Get.isRegistered<LoyaltyController>()) {
          Get.find<LoyaltyController>().loadLoyaltyData(silent: true);
        }
        break;
      case 3:
        if (Get.isRegistered<NotificationsController>()) {
          Get.find<NotificationsController>().loadNotifications(silent: true);
        }
        break;
      case 4:
        if (Get.isRegistered<ProfileController>()) {
          Get.find<ProfileController>().loadProfile(silent: true);
        }
        break;
    }
  }
}
