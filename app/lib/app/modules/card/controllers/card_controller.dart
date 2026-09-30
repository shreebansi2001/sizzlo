import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import '../../../data/models/member_model.dart';
import '../../../data/services/api_service.dart';

class CardController extends GetxController {
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

  void copyMembershipId() {
    Clipboard.setData(ClipboardData(text: member.value.membershipId));
    Get.snackbar(
      'Copied',
      'Membership ID copied to clipboard',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF001D4A),
      colorText: const Color(0xFFE8B84A),
    );
  }

  void addToWallet() {
    Get.snackbar(
      'Digital Wallet',
      'VIP Pass synchronized with Apple/Google Wallet',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF001D4A),
      colorText: Colors.white,
    );
  }
}
