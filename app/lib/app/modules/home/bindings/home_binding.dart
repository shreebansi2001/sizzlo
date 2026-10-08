import 'package:get/get.dart';
import '../../../controllers/navigation_controller.dart';
import '../controllers/home_controller.dart';
import '../../card/controllers/card_controller.dart';
import '../../coupons/controllers/coupons_controller.dart';
import '../../reservations/controllers/reservations_controller.dart';
import '../../banquet/controllers/banquet_controller.dart';
import '../../profile/controllers/profile_controller.dart';

class HomeBinding extends Bindings {
  @override
  void dependencies() {
    Get.put<NavigationController>(NavigationController(), permanent: true);
    Get.lazyPut<HomeController>(() => HomeController());
    Get.lazyPut<CardController>(() => CardController());
    Get.lazyPut<CouponsController>(() => CouponsController());
    Get.lazyPut<ReservationsController>(() => ReservationsController());
    Get.lazyPut<BanquetController>(() => BanquetController());
    Get.lazyPut<ProfileController>(() => ProfileController());
  }
}
