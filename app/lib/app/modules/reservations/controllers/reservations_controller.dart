import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/reservation_model.dart';
import '../../../data/models/banquet_inquiry_model.dart';
import '../../../data/services/api_service.dart';
import '../../../core/values/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../widgets/sizzlo_dialogs.dart';
import '../../../routes/app_routes.dart';
import 'package:intl/intl.dart';

class ReservationsController extends GetxController {
  final ApiService _apiService = ApiService();

  final RxList<ReservationModel> reservations = <ReservationModel>[].obs;
  final RxBool isLoading = true.obs;
  final RxBool isSubmitting = false.obs;

  // 0 = Regular Dine-in (1-19 guests), 1 = Banquet & ODC Inquiry (20+ guests)
  final RxInt bookingMode = 0.obs;

  // Regular Dine-in Form State (Chapter 06)
  final RxString selectedOutlet = 'Yanki Sizzlerr Bodakdev'.obs;
  final RxString selectedBookingDay = 'Today'.obs; // Today, Tomorrow
  final RxString selectedTimeSlot = '8:00 PM'.obs;
  final RxInt guestCount = 4.obs;
  final RxString selectedOccasion = 'Regular'.obs; // Birthday, Anniversary, Business, Regular
  final RxBool isVipTable = true.obs;
  final specialNotesController = TextEditingController();

  // Banquet & ODC Form State (Chapter 07 - Zero Points Engine)
  final RxString banquetCategory = 'Wedding'.obs;
  final RxString banquetShift = 'Dinner'.obs;
  final RxInt banquetPax = 100.obs;
  final banquetDateController = TextEditingController(text: '2026-11-20');
  final banquetNotesController = TextEditingController();

  final RxList<String> outlets = <String>[
    'Yanki Sizzlerr Bodakdev',
    'Yanki Sizzlerr SG Highway',
    'Dough by Yanki CG Road',
    'House of Yanki Banquets Bopal',
  ].obs;

  final RxList<String> timeSlots = <String>[
    '12:00 PM', '12:30 PM', '1:00 PM', '1:30 PM', '7:00 PM', '7:30 PM', '8:00 PM', '8:30 PM', '9:00 PM', '9:30 PM', '10:00 PM'
  ].obs;

  final RxString selectedSeatingArea = 'Indoor AC Lounge'.obs;
  final List<String> seatingAreas = [
    'Indoor AC Lounge',
    'Romantic Corner',
    'Window View',
    'Family Booth',
    'Terrace Lounge',
  ];

  final Rx<DateTime?> customBookingDate = Rx<DateTime?>(null);

  final List<String> occasionTags = [
    'Regular', 'Birthday', 'Anniversary', 'Business', 'Date Night'
  ];

  final List<String> banquetCategories = [
    'Wedding', 'Sangeet', 'Corporate Seminar', 'Anniversary', 'Birthday Party', 'Lawn Outdoor Catering'
  ];

  final RxBool isSubscribedMember = false.obs;
  final RxDouble advanceRequired = 0.0.obs;

  @override
  void onInit() {
    super.onInit();
    _checkMembership();
    loadOutlets();
    loadTimeSlots();
    loadReservations();
  }

  void _checkMembership() async {
    try {
      final profile = await _apiService.getMemberProfile();
      isSubscribedMember.value = profile.isSubscriber;
      isVipTable.value = profile.isSubscriber;
      advanceRequired.value = profile.isSubscriber ? 0.0 : 100.0;
    } catch (_) {
      isSubscribedMember.value = false;
      isVipTable.value = false;
      advanceRequired.value = 100.0;
    }
  }

  void loadTimeSlots() async {
    try {
      final slots = await _apiService.getActiveTimeSlots(outlet: selectedOutlet.value);
      if (slots.isNotEmpty) {
        timeSlots.assignAll(slots);
        _initDefaultSlot();
      }
    } catch (_) {}
  }

  /// Rule: Reservations must be made at least 1 hour in advance (not anytime)
  bool isSlotBookable(String slotStr, [String? day]) {
    final chosenDay = day ?? selectedBookingDay.value;
    if (chosenDay != 'Today') {
      return true; // Tomorrow/future dates are always >= 1 hr in advance
    }

    try {
      final now = DateTime.now();
      final parts = slotStr.trim().split(' ');
      if (parts.length != 2) return true;
      final timeParts = parts[0].split(':');
      int hour = int.parse(timeParts[0]);
      int minute = int.parse(timeParts[1]);
      final isPm = parts[1].toUpperCase() == 'PM';
      if (isPm && hour < 12) hour += 12;
      if (!isPm && hour == 12) hour = 0;

      final slotDateTime = DateTime(now.year, now.month, now.day, hour, minute);
      final minAllowedTime = now.add(const Duration(hours: 1));

      return slotDateTime.isAfter(minAllowedTime);
    } catch (_) {
      return true;
    }
  }

  void _initDefaultSlot() {
    for (final s in timeSlots) {
      if (isSlotBookable(s)) {
        selectedTimeSlot.value = s;
        return;
      }
    }
    // If all today's slots are within 1 hr or past, default to Tomorrow
    selectedBookingDay.value = 'Tomorrow';
    if (timeSlots.isNotEmpty) {
      selectedTimeSlot.value = timeSlots.first;
    }
  }

  void selectSlot(String slot) {
    if (!isSlotBookable(slot)) {
      Get.snackbar(
        '1-Hour Advance Required',
        'In accordance with dining policy, tables must be reserved at least 1 hour in advance. Please select a slot at least 60 minutes from now, or choose Tomorrow.',
        backgroundColor: const Color(0xFF331D12),
        colorText: const Color(0xFFE27C38),
        icon: const Icon(Icons.timer_off_outlined, color: Color(0xFFE27C38)),
        duration: const Duration(seconds: 4),
        snackPosition: SnackPosition.TOP,
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
      );
      return;
    }
    selectedTimeSlot.value = slot;
  }

  void setBookingDay(String day) {
    selectedBookingDay.value = day;
    if (!isSlotBookable(selectedTimeSlot.value)) {
      // Pick first valid slot
      for (final s in timeSlots) {
        if (isSlotBookable(s)) {
          selectedTimeSlot.value = s;
          break;
        }
      }
    }
  }

  void loadOutlets() async {
    try {
      final list = await _apiService.getActiveOutlets();
      if (list.isNotEmpty) {
        outlets.assignAll(list.map((o) => o.name).toList());
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

  void setGuestCount(int count) {
    if (count >= 20) {
      Get.snackbar(
        'Group Size 20+ Covers',
        'Parties of 20 or more are handled by House of Yanki Banquets & ODC Event Desk.',
        backgroundColor: const Color(0xFF2C241B),
        colorText: const Color(0xFFD4AF37),
        duration: const Duration(seconds: 4),
        mainButton: TextButton(
          onPressed: () => Get.toNamed(AppRoutes.BANQUET_ODC),
          child: const Text('Go to Banquet', style: TextStyle(color: Color(0xFF4EE3B8), fontWeight: FontWeight.bold)),
        ),
      );
    } else {
      guestCount.value = count;
    }
  }

  Future<void> pickCustomDate(BuildContext context) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: customBookingDate.value ?? DateTime.now().add(const Duration(days: 2)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 90)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.goldAccent,
              onPrimary: Colors.black,
              surface: Color(0xFF1E1A16),
              onSurface: Colors.white,
            ),
            dialogBackgroundColor: const Color(0xFF141210),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      customBookingDate.value = picked;
      selectedBookingDay.value = DateFormat('EEE, dd MMM').format(picked);
    }
  }

  /// Triggers booking dialog for Regular Dine-in
  void confirmAndBookTable() {
    if (guestCount.value >= 20) {
      bookingMode.value = 1;
      return;
    }

    if (!isSlotBookable(selectedTimeSlot.value)) {
      Get.snackbar(
        '1-Hour Advance Required',
        'Reservations must be booked at least 1 hour in advance. Please choose a slot at least 60 minutes from now.',
        backgroundColor: const Color(0xFF331D12),
        colorText: const Color(0xFFE27C38),
        duration: const Duration(seconds: 4),
        snackPosition: SnackPosition.TOP,
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
      );
      return;
    }

    final bookingTimeLabel = '${selectedBookingDay.value}, ${selectedTimeSlot.value}';
    SizzloDialogs.showBookTableConfirm(
      outlet: selectedOutlet.value,
      time: bookingTimeLabel,
      guests: guestCount.value,
      isVip: isVipTable.value,
      specialRequests: '${selectedOccasion.value} occasion. ${specialNotesController.text}',
      onConfirm: _executeBooking,
    );
  }

  void _executeBooking() async {
    isSubmitting.value = true;
    try {
      final isSub = isSubscribedMember.value;
      final bookingTimeLabel = '${selectedBookingDay.value}, ${selectedTimeSlot.value}';
      final success = await _apiService.bookReservation(
        name: AppConstants.currentUserName.isNotEmpty ? AppConstants.currentUserName : (isSub ? 'VIP Guest' : 'Guest Diner'),
        mobile: AppConstants.currentUserMobile,
        outlet: selectedOutlet.value,
        time: bookingTimeLabel,
        guests: guestCount.value,
        vip: isSub,
        tierPriorityTag: isSub ? 'Signature' : 'Non-Subscriber',
        occasionTag: selectedOccasion.value,
        specialRequests: specialNotesController.text,
        bookingAdvance: isSub ? 0.0 : 100.0,
        advancePaid: true,
      );

      if (success) {
        specialNotesController.clear();
        loadReservations();

        Get.snackbar(
          isSub ? '👑 VIP Priority Confirmed!' : 'Table Reserved & Deposit Held',
          isSub 
            ? 'Complimentary priority seating reserved for ${guestCount.value} at ${selectedOutlet.value}.'
            : 'Table reserved for ${guestCount.value} at ${selectedOutlet.value}. ₹100 deposit is recorded and will be automatically deducted from your final bill!',
          backgroundColor: isSub ? const Color(0xFF2C241B) : const Color(0xFF0E3B32),
          colorText: isSub ? const Color(0xFFD4AF37) : const Color(0xFF4EE3B8),
          snackPosition: SnackPosition.TOP,
          margin: const EdgeInsets.all(16),
          borderRadius: 14,
          duration: const Duration(seconds: 5),
        );
      }
    } finally {
      isSubmitting.value = false;
    }
  }

  /// Submits Banquet & ODC Inquiry (Chapter 07 Zero-Points Engine)
  void submitBanquetInquiry() async {
    isSubmitting.value = true;
    try {
      final inquiry = BanquetInquiryModel(
        customerName: AppConstants.currentUserName.isNotEmpty ? AppConstants.currentUserName : 'VIP Patron',
        customerMobile: AppConstants.currentUserMobile,
        email: AppConstants.currentUserEmail,
        eventCategory: banquetCategory.value,
        eventDate: banquetDateController.text,
        eventShift: banquetShift.value,
        estimatedPax: banquetPax.value,
        customRequirements: banquetNotesController.text,
      );

      final success = await _apiService.submitBanquetInquiry(inquiry);
      if (success) {
        banquetNotesController.clear();
        Get.snackbar(
          'Enquiry Dispatched!',
          'House of Yanki Event Sales Desk has received your request. Representative will call you today.',
          backgroundColor: const Color(0xFF2C241B),
          colorText: const Color(0xFFD4AF37),
          duration: const Duration(seconds: 5),
        );
      } else {
        Get.snackbar('Submitted', 'Event desk will contact you shortly.', backgroundColor: Colors.green[800], colorText: Colors.white);
      }
    } finally {
      isSubmitting.value = false;
    }
  }

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
        );
      } else {
        loadReservations();
      }
    } finally {
      isLoading.value = false;
    }
  }

  @override
  void onClose() {
    specialNotesController.dispose();
    banquetDateController.dispose();
    banquetNotesController.dispose();
    super.onClose();
  }
}
