import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/reservation_model.dart';
import '../../../data/services/api_service.dart';

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

  final List<String> outlets = [
    'Yanki Signature',
    'Yanki Lounge SG',
    'Dough by Yanki',
    'Yanki Banquet',
    'Yanki Café CG',
  ];

  final List<String> timeSlots = [
    '12:30 PM', '1:30 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:15 PM', '10:00 PM'
  ];

  @override
  void onInit() {
    super.onInit();
    loadReservations();
  }

  void loadReservations() async {
    isLoading.value = true;
    try {
      reservations.value = await _apiService.getReservations();
    } finally {
      isLoading.value = false;
    }
  }

  void bookTable() async {
    isSubmitting.value = true;
    try {
      final success = await _apiService.bookReservation(
        name: 'Rahul Mehta',
        mobile: '+91 98250 12345',
        outlet: selectedOutlet.value,
        time: 'Today, ${selectedTimeSlot.value}',
        guests: guestCount.value,
        vip: isVipTable.value,
        specialRequests: specialNotesController.text,
      );

      if (success) {
        // Add locally
        reservations.insert(
          0,
          ReservationModel(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            bookingReference: 'R-${1000 + (DateTime.now().millisecond * 7 % 8999)}',
            customerName: 'Rahul Mehta',
            customerMobile: '+91 98250 12345',
            outlet: selectedOutlet.value,
            reservationTime: 'Today, ${selectedTimeSlot.value}',
            guests: guestCount.value,
            status: 'Confirmed',
            vip: isVipTable.value,
            specialRequests: specialNotesController.text,
          ),
        );

        Get.snackbar(
          'Reservation Confirmed!',
          'Table for ${guestCount.value} at ${selectedOutlet.value} reserved.',
          backgroundColor: const Color(0xFF001D4A),
          colorText: const Color(0xFFE8B84A),
        );
      }
    } finally {
      isSubmitting.value = false;
    }
  }

  @override
  void onClose() {
    specialNotesController.dispose();
    super.onClose();
  }
}
