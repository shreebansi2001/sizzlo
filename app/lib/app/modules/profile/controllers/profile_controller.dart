import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../data/models/member_model.dart';
import '../../../data/services/api_service.dart';
import '../../../routes/app_routes.dart';
import '../../../core/theme/app_colors.dart';
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

  /// 1-Tap 250,000 Points Free Renewal (Chapter 04.2 & 12 SRS)
  void renewWithPoints() async {
    if (member.value.loyaltyPoints < 250000) {
      Get.snackbar(
        'Points Milestone Pending',
        'You need 250,000 points for free renewal. Current: ${member.value.loyaltyPoints} pts.',
        backgroundColor: const Color(0xFF2C241B),
        colorText: const Color(0xFFD4AF37),
      );
      return;
    }

    final updated = await _apiService.renewWithPoints(member.value.membershipId);
    if (updated != null) {
      member.value = updated;
      Get.snackbar(
        'Annual Plan Renewed!',
        '250,000 points redeemed. 365 days added to your subscription.',
        backgroundColor: const Color(0xFF0E382B),
        colorText: const Color(0xFF4EE3B8),
      );
    }
  }

  /// Post-Dining Review Dialog (Chapter 11 SRS: 4-5 stars Google, 1-3 stars Urgent Recovery Ticket)
  void showReviewDialog() {
    int currentRating = 5;
    final commentsController = TextEditingController();

    Get.dialog(
      StatefulBuilder(
        builder: (ctx, setState) {
          return Dialog(
            backgroundColor: const Color(0xFF141312),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24), side: const BorderSide(color: Color(0xFF33291E))),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: const BoxDecoration(color: Color(0xFF2C241B), shape: BoxShape.circle),
                    child: const Icon(Icons.star_rounded, color: AppColors.goldAccent, size: 28),
                  ),
                  const SizedBox(height: 14),
                  Text(
                    'How was your meal today?',
                    style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 6),
                  Text(
                    'Rate your experience at Yanki Sizzlerr',
                    style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400]),
                  ),
                  const SizedBox(height: 16),

                  // Star row
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      final starNum = index + 1;
                      return IconButton(
                        icon: Icon(
                          starNum <= currentRating ? Icons.star_rounded : Icons.star_border_rounded,
                          color: AppColors.goldAccent,
                          size: 32,
                        ),
                        onPressed: () => setState(() => currentRating = starNum),
                      );
                    }),
                  ),
                  const SizedBox(height: 12),

                  if (currentRating <= 3) ...[
                    // Negative experience private form (suppresses Google, sends Urgent Recovery Ticket)
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(color: const Color(0xFF2E1914), borderRadius: BorderRadius.circular(10)),
                      child: Text(
                        'We are sorry your experience wasn\'t perfect. Please tell us how we can make it right. Store Manager will be notified privately.',
                        style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFFFAB91)),
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: commentsController,
                      maxLines: 2,
                      style: GoogleFonts.inter(color: Colors.white, fontSize: 13),
                      decoration: InputDecoration(
                        hintText: 'Food quality, service speed, cleanliness...',
                        hintStyle: GoogleFonts.inter(color: Colors.grey[600], fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF1E1A16),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                      ),
                    ),
                  ] else ...[
                    Text(
                      '⭐ 4 & 5-Star reviews help our kitchen masters shine! You will be invited to share your words on Google.',
                      style: GoogleFonts.inter(fontSize: 12, color: const Color(0xFF4EE3B8)),
                      textAlign: TextAlign.center,
                    ),
                  ],

                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: () async {
                        Get.back();
                        final res = await _apiService.submitFeedback(
                          rating: currentRating,
                          comments: commentsController.text,
                        );
                        if (res != null) {
                          if (res['isPositive'] == true) {
                            Get.snackbar(
                              'Thank you!',
                              res['message']?.toString() ?? 'Glad you enjoyed it! Please share your review on Google.',
                              backgroundColor: const Color(0xFF0E382B),
                              colorText: const Color(0xFF4EE3B8),
                              duration: const Duration(seconds: 5),
                            );
                          } else {
                            Get.snackbar(
                              'Urgent Ticket Created',
                              res['message']?.toString() ?? 'Thank you. Our Store Manager will reach out to recover your experience.',
                              backgroundColor: const Color(0xFF2C241B),
                              colorText: const Color(0xFFD4AF37),
                              duration: const Duration(seconds: 5),
                            );
                          }
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.goldAccent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        padding: const EdgeInsets.symmetric(vertical: 12),
                      ),
                      child: Text(
                        'Submit Review',
                        style: GoogleFonts.outfit(color: Colors.black, fontWeight: FontWeight.w700, fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  /// Apple / Google Store Compliance Account Deletion (Chapter 01.2 & 03.2 SRS)
  void deleteAccountConfirm() {
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF141312),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20), side: const BorderSide(color: Color(0xFF5A2A1A))),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: const BoxDecoration(color: Color(0xFF331610), shape: BoxShape.circle),
                child: const Icon(Icons.delete_forever_rounded, color: Colors.redAccent, size: 28),
              ),
              const SizedBox(height: 14),
              Text(
                'Delete Sizzlo Account?',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white),
              ),
              const SizedBox(height: 8),
              Text(
                'This will irrevocably delete your profile, unredeemed coupon vouchers, and accumulated loyalty points in compliance with privacy regulations. This action cannot be undone.',
                style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400], height: 1.4),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => Get.back(),
                      style: OutlinedButton.styleFrom(
                        side: const BorderSide(color: Colors.grey),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text('Cancel', style: GoogleFonts.outfit(color: Colors.white, fontSize: 13)),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () async {
                        Get.back();
                        final ok = await _apiService.deleteAccount(member.value.mobile);
                        if (ok) {
                          Get.offAllNamed(AppRoutes.LOGIN);
                          Get.snackbar('Account Purged', 'Your data has been completely erased from Sizzlo servers.', backgroundColor: Colors.red[900], colorText: Colors.white);
                        }
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.redAccent,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: Text('Delete Data', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 13)),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void renewMembership() {
    Get.toNamed(AppRoutes.PLANS);
  }

  void logout() {
    SizzloDialogs.showLogoutConfirm(
      onConfirm: () {
        Get.offAllNamed(AppRoutes.LOGIN);
      },
    );
  }
}
