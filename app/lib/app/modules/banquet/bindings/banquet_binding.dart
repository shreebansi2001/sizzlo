import 'package:get/get.dart';
import '../controllers/banquet_controller.dart';

class BanquetBinding extends Bindings {
  @override
  void dependencies() {
    Get.lazyPut<BanquetController>(() => BanquetController());
  }
}
