import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/reservation_model.dart';
import '../../../data/services/api_service.dart';
import '../../../core/values/app_constants.dart';

import '../../../widgets/sizzlo_dialogs.dart';

class ReservationsController extends GetxController {
  final ApiService _apiService = ApiService();

  final RxList<ReservationModel> reservations = <ReservationModel>[].obs;
  final RxBool isLoading = true.obs;
  final RxBool isSubmitting = false.obs;

  // Form State
  final RxString selectedOutlet = 'Yanki Signature'.obs;
  final RxString selectedTimeSlot = '8:00 PM'.obs;
  final RxInt guestCount = 4.obs;
  final RxBool isVipTable = true.obs;
  final specialNotesController = TextEditingController();

  final RxList<String> outlets = <String>[
    'Yanki Signature',
    'Yanki Lounge SG',
    'Dough by Yanki',
    'Yanki Banquet',
    'Yanki Café CG',
  ].obs;

  final List<String> timeSlots = [
    '12:30 PM', '1:30 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:15 PM', '10:00 PM'
  ];

  @override
  void onInit() {
    super.onInit();
    loadOutlets();
    loadReservations();
  }

  void loadOutlets() async {
    try {
      final list = await _apiService.getOutlets();
      if (list.isNotEmpty) {
        outlets.assignAll(list);
        if (!outlets.contains(selectedOutlet.value)) {
          selectedOutlet.value = outlets.first;
        }
      }
    } catch (_) {}
  }

  void loadReservations() async {
    isLoading.value = true;
    try {
      reservations.value = await _apiService.getReservations();
    } finally {
      isLoading.value = false;
    }
  }

  /// Triggers luxury confirmation dialog before reserving
  void confirmAndBookTable() {
    SizzloDialogs.showBookTableConfirm(
      outlet: selectedOutlet.value,
      time: 'Today, ${selectedTimeSlot.value}',
      guests: guestCount.value,
      isVip: isVipTable.value,
      specialRequests: specialNotesController.text,
      onConfirm: _executeBooking,
    );
  }

  void _executeBooking() async {
    isSubmitting.value = true;
    try {
      final success = await _apiService.bookReservation(
        name: 'Rahul Mehta',
        mobile: AppConstants.currentUserMobile,
        outlet: selectedOutlet.value,
        time: 'Today, ${selectedTimeSlot.value}',
        guests: guestCount.value,
        vip: isVipTable.value,
        specialRequests: specialNotesController.text,
      );

      if (success) {
        // Reset special requests
        specialNotesController.clear();

        // Reload directly from live API
        loadReservations();

        Get.snackbar(
          'Reservation Confirmed!',
          'VIP Table for ${guestCount.value} at ${selectedOutlet.value} is reserved.',
          backgroundColor: const Color(0xFF0E3B32),
          colorText: const Color(0xFFE8B84A),
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 14,
        );
      }
    } finally {
      isSubmitting.value = false;
    }
  }

  /// Triggers luxury confirmation dialog before cancelling a booking
  void confirmCancelReservation(ReservationModel reservation) {
    SizzloDialogs.showCancelReservationConfirm(
      reservation: reservation,
      onConfirm: () => _executeCancel(reservation),
    );
  }

  void _executeCancel(ReservationModel reservation) async {
    isLoading.value = true;
    try {
      final ok = await _apiService.cancelReservation(reservation.id);
      if (ok) {
        loadReservations();
        Get.snackbar(
          'Reservation Cancelled',
          'Table at ${reservation.outlet} has been released.',
          backgroundColor: const Color(0xFF1E1410),
          colorText: Colors.white,
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 14,
        );
      } else {
        // Fallback local update if network glitch
        loadReservations();
      }
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    specialNotesController.dispose();
    super.onClose();
  }
}
