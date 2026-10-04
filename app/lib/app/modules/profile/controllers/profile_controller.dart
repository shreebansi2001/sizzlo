import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/member_model.dart';
import '../../../data/services/api_service.dart';
import '../../../routes/app_routes.dart';

import '../../../widgets/sizzlo_dialogs.dart';

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
    SizzloDialogs.showRenewMembershipConfirm(
      member: member.value,
      onConfirm: () {
        Get.snackbar(
          'Renewal Initiated',
          'VIP extension confirmed. Payment link sent to ${member.value.mobile}',
          backgroundColor: const Color(0xFF0E3B32),
          colorText: const Color(0xFFE8B84A),
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 14,
        );
      },
    );
  }

  void logout() {
    SizzloDialogs.showLogoutConfirm(
      onConfirm: () {
        Get.offAllNamed(AppRoutes.LOGIN);
      },
    );
  }
}
