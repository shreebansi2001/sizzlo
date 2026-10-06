import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/outlet_model.dart';
import '../../../data/services/api_service.dart';
import '../../../core/values/app_constants.dart';

class OutletsController extends GetxController {
  final ApiService _apiService = ApiService();

  final RxInt currentTabIndex = 0.obs; // 0 = Active Outlets, 1 = Upcoming Outlets
  final RxString selectedBrandFilter = 'All'.obs;

  final RxList<OutletModel> activeOutlets = <OutletModel>[].obs;
  final RxList<OutletModel> upcomingOutlets = <OutletModel>[].obs;
  final RxBool isLoading = true.obs;

  final List<String> brandTabs = [
    'All',
    'Yanki Sizzlerr',
    'Dough by Yanki',
    'House of Yanki',
  ];

  @override
  void onInit() {
    super.onInit();
    loadOutlets();
  }

  Future<void> loadOutlets() async {
    isLoading.value = true;
    try {
      final active = await _apiService.getActiveOutlets(selectedBrandFilter.value);
      final upcoming = await _apiService.getUpcomingOutlets();
      activeOutlets.value = active;
      upcomingOutlets.value = upcoming;
    } finally {
      isLoading.value = false;
    }
  }

  void switchTab(int index) {
    currentTabIndex.value = index;
  }

  void filterBrand(String brand) {
    selectedBrandFilter.value = brand;
    loadOutlets();
  }

  Future<void> notifyMeOnLaunch(String outletName) async {
    final success = await _apiService.notifyLaunch(outletName, AppConstants.currentUserMobile);
    if (success) {
      Get.snackbar(
        'Subscribed to Launch Alerts!',
        'You will receive push notification & exclusive opening-week voucher when $outletName opens.',
        backgroundColor: const Color(0xFFD4AF37),
        colorText: Colors.black,
        duration: const Duration(seconds: 4),
      );
    } else {
      Get.snackbar(
        'Subscribed!',
        'We will alert you on opening week with a celebration voucher.',
        backgroundColor: const Color(0xFFD4AF37),
        colorText: Colors.black,
      );
    }
  }
}
