import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/member_model.dart';
import '../../../data/services/api_service.dart';
import '../../../routes/app_routes.dart';

class ProfileController extends GetxController {
  final ApiService _apiService = ApiService();

  final Rx<MemberModel> member = MemberModel.defaultProfile().obs;
  final RxBool isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    loadProfile();
  }

  void loadProfile() async {
    isLoading.value = true;
    try {
      member.value = await _apiService.getMemberProfile();
    } finally {
      isLoading.value = false;
    }
  }

  void renewMembership() {
    Get.defaultDialog(
      title: 'Renew Membership',
      titleStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
      content: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16),
        child: Column(
          children: const [
            Text('Extend your VIP Member benefits for another 12 months for ₹15,000.',
                textAlign: TextAlign.center, style: TextStyle(fontSize: 13)),
            SizedBox(height: 12),
            Text('Includes 12 new coupon booklets + 10,000 loyalty points bonus.',
                textAlign: TextAlign.center, style: TextStyle(fontSize: 11, color: Color(0xFFBF8E22), fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      textConfirm: 'Proceed to Pay',
      confirmTextColor: Colors.white,
      buttonColor: const Color(0xFF001D4A),
      onConfirm: () {
        Get.back();
        Get.snackbar(
          'Renewal Initiated',
          'Payment gateway link sent to registered mobile number',
          backgroundColor: const Color(0xFF001D4A),
          colorText: const Color(0xFFE8B84A),
        );
      },
    );
  }

  void logout() {
    Get.defaultDialog(
      title: 'Sign Out',
      middleText: 'Are you sure you want to sign out of Sizzlo VIP?',
      textConfirm: 'Sign Out',
      confirmTextColor: Colors.white,
      buttonColor: Colors.redAccent,
      textCancel: 'Cancel',
      onConfirm: () {
        Get.back();
        Get.offAllNamed(AppRoutes.LOGIN);
      },
    );
  }
}
