import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:url_launcher/url_launcher.dart';
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

  Future<void> openDirections(OutletModel outlet) async {
    // Universal Google Maps navigation URL
    final query = Uri.encodeComponent('${outlet.name}, ${outlet.address}, ${outlet.city}');
    final mapsUrl = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${outlet.latitude},${outlet.longitude}&destination_place_id=&query=$query',
    );
    final fallbackUrl = Uri.parse('https://maps.google.com/?q=${outlet.latitude},${outlet.longitude}');

    try {
      if (await canLaunchUrl(mapsUrl)) {
        await launchUrl(mapsUrl, mode: LaunchMode.externalApplication);
      } else if (await canLaunchUrl(fallbackUrl)) {
        await launchUrl(fallbackUrl, mode: LaunchMode.externalApplication);
      } else {
        Get.snackbar(
          'Google Maps',
          'Could not open navigation for ${outlet.name}',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    } catch (e) {
      try {
        await launchUrl(fallbackUrl, mode: LaunchMode.externalApplication);
      } catch (_) {
        Get.snackbar(
          'Navigation',
          'Failed to open Google Maps: $e',
          backgroundColor: Colors.redAccent,
          colorText: Colors.white,
        );
      }
    }
  }

  Future<void> callOutlet(String phone) async {
    if (phone.trim().isEmpty) {
      Get.snackbar(
        'Call Desk',
        'No contact number available for this outlet.',
        backgroundColor: Colors.orangeAccent,
        colorText: Colors.white,
      );
      return;
    }

    final cleanDigits = phone.replaceAll(RegExp(r'[^\d+]'), '');
    final telUri = Uri.parse('tel:$cleanDigits');

    try {
      if (await canLaunchUrl(telUri)) {
        await launchUrl(telUri);
      } else {
        Get.snackbar(
          'Call Desk',
          'Phone dialer is unavailable on this simulator/device for $phone',
          backgroundColor: const Color(0xFF1E1A16),
          colorText: Colors.white,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Call Desk',
        'Could not initiate call: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
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
