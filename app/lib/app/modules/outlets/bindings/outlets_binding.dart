import 'package:get/get.dart';
import '../controllers/outlets_controller.dart';

class OutletsBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<OutletsController>(() => OutletsController());
  }
}
