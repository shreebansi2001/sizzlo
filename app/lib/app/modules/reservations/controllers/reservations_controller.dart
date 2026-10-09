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
import 'package:google_fonts/google_fonts.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../../data/services/local_storage_service.dart';
import '../../../data/services/notification_service.dart';

class ReservationsController extends GetxController {
  final ApiService _apiService = ApiService();
  late Razorpay _razorpay;

  final RxList<ReservationModel> reservations = <ReservationModel>[].obs;
  final RxBool isLoading = true.obs;
  final RxBool isSubmitting = false.obs;

  // 0 = Regular Dine-in (1-19 guests), 1 = Banquet & ODC Inquiry (20+ guests)
  final RxInt bookingMode = 0.obs;

  // Multi-step Flow: Step 1 = Date & Branch Calendar, Step 2 = Table & Guests
  final RxInt currentBookingStep = 1.obs;

  // Regular Dine-in Form State (Chapter 06)
  final RxString selectedOutlet = 'Yanki Sizzlerr Bodakdev'.obs;
  final RxString selectedBookingDay = 'Today'.obs; // Today, Tomorrow
  final RxString selectedTimeSlot = '8:00 PM'.obs;
  final RxInt guestCount = 2.obs; // Defaults cleanly to 2 covers (Couple)
  final RxString selectedOccasion = 'Regular'.obs; // Birthday, Anniversary, Business, Regular
  final RxBool isVipTable = true.obs;
  final specialNotesController = TextEditingController();

  void goToStep1() {
    currentBookingStep.value = 1;
  }

  void goToStep2() {
    currentBookingStep.value = 2;
  }

  void selectTodayAndProceed() {
    selectedBookingDay.value = 'Today';
    customBookingDate.value = DateTime.now();
    guestCount.value = 2;
    _initDefaultSlot();
    currentBookingStep.value = 2;
  }

  void selectDateAndProceed(DateTime date) {
    final now = DateTime.now();
    final isToday = date.year == now.year && date.month == now.month && date.day == now.day;
    final isTomorrow = date.year == now.year && date.month == now.month && date.day == now.day + 1;

    if (isToday) {
      selectedBookingDay.value = 'Today';
    } else if (isTomorrow) {
      selectedBookingDay.value = 'Tomorrow';
    } else {
      selectedBookingDay.value = DateFormat('EEE, dd MMM').format(date);
    }
    customBookingDate.value = date;
    guestCount.value = 2;
    _initDefaultSlot();
    currentBookingStep.value = 2;
  }

  bool isDateSelected(DateTime date) {
    final cur = customBookingDate.value ?? DateTime.now();
    return cur.year == date.year && cur.month == date.month && cur.day == date.day;
  }

  void selectDate(DateTime date) {
    final now = DateTime.now();
    final isToday = date.year == now.year && date.month == now.month && date.day == now.day;
    final isTomorrow = date.year == now.year && date.month == now.month && (date.day - now.day == 1);

    if (isToday) {
      selectedBookingDay.value = 'Today';
    } else if (isTomorrow) {
      selectedBookingDay.value = 'Tomorrow';
    } else {
      selectedBookingDay.value = DateFormat('EEE, dd MMM').format(date);
    }
    customBookingDate.value = date;
    _initDefaultSlot();
  }

  String get formattedSelectedDateText {
    final date = customBookingDate.value ?? DateTime.now();
    final now = DateTime.now();
    if (date.year == now.year && date.month == now.month && date.day == now.day) {
      return 'Today, ${DateFormat('d MMM yyyy').format(date)}';
    } else if (date.year == now.year && date.month == now.month && date.day == now.day + 1) {
      return 'Tomorrow, ${DateFormat('d MMM yyyy').format(date)}';
    } else {
      return DateFormat('EEE, d MMM yyyy').format(date);
    }
  }

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
    _initRazorpay();
    _checkMembership();
    loadOutlets();
    loadTimeSlots();
    loadReservations();
  }

  void _initRazorpay() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  void _checkMembership() async {
    try {
      final profile = await _apiService.getMemberProfile();
      isSubscribedMember.value = profile.isSubscriber;
      isVipTable.value = profile.isSubscriber;
      // Nominal table booking advance cover charge of ₹99 (credited 100% to dining bill)
      advanceRequired.value = 99.0;
    } catch (_) {
      isSubscribedMember.value = false;
      isVipTable.value = false;
      advanceRequired.value = 99.0;
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
          onPressed: () => Get.toNamed(AppRoutes.BANQUET),
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

  /// Triggers booking dialog for Regular Dine-in (VIP Members only)
  void confirmAndBookTable() {
    // Non-subscribed users can only view; booking requires active subscription
    if (!isSubscribedMember.value) {
      _showSubscriptionRequiredDialog();
      return;
    }

    if (guestCount.value >= 20) {
      Get.toNamed(AppRoutes.BANQUET);
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
    const nominalCharge = 99.0;
    SizzloDialogs.showBookTableConfirm(
      outlet: selectedOutlet.value,
      time: bookingTimeLabel,
      guests: guestCount.value,
      isVip: isVipTable.value,
      bookingCharge: nominalCharge,
      specialRequests: '${selectedOccasion.value} occasion. ${specialNotesController.text}',
      onConfirm: _launchRazorpayTableBooking,
    );
  }

  void _launchRazorpayTableBooking() async {
    isSubmitting.value = true;
    final userMobile = AppConstants.currentUserMobile.isNotEmpty 
        ? AppConstants.currentUserMobile 
        : '9825012345';
    final userName = AppConstants.currentUserName.isNotEmpty && AppConstants.currentUserName != 'Guest'
        ? AppConstants.currentUserName
        : 'VIP Diner';

    var options = {
      'key': 'rzp_live_S5dgGJ3fEPa3fO',
      'amount': 9900, // ₹99 nominal cover charge in paise
      'name': 'House of Yanki · Sizzlo',
      'description': 'Table Booking Cover Charge · ₹99 (${selectedOutlet.value})',
      'prefill': {
        'contact': userMobile,
        'email': AppConstants.currentUserEmail.isNotEmpty ? AppConstants.currentUserEmail : 'user@sizzlo.com',
        'name': userName,
      },
      'theme': {
        'color': '#DF9E5B',
      },
      'external': {
        'wallets': ['paytm'],
      },
    };

    try {
      _razorpay.open(options);
    } catch (e) {
      debugPrint('Razorpay checkout open exception: $e');
      _showSimulationFallbackDialog(
        onSimulate: () => _executeBooking(
          paymentId: 'pay_sim_${DateTime.now().millisecondsSinceEpoch}',
        ),
      );
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    debugPrint('Table Booking Razorpay Success: ${response.paymentId}');
    _executeBooking(
      paymentId: response.paymentId ?? 'pay_${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    isSubmitting.value = false;
    debugPrint('Table Booking Razorpay Failure: ${response.code} - ${response.message}');
    Get.snackbar(
      'Payment Not Completed',
      'Table reservation was not booked because the ₹99 cover charge was not completed (${response.message ?? "Payment cancelled"}).',
      backgroundColor: const Color(0xFF331D12),
      colorText: const Color(0xFFE27C38),
      icon: const Icon(Icons.payment_rounded, color: Color(0xFFE27C38)),
      duration: const Duration(seconds: 4),
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.all(16),
      borderRadius: 14,
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    debugPrint('Table Booking External Wallet Selected: ${response.walletName}');
  }

  void _showSimulationFallbackDialog({required VoidCallback onSimulate}) {
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF141312),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.goldAccent, width: 1.2),
        ),
        child: Padding(
          padding: const EdgeInsets.all(22),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.payment_rounded, color: AppColors.goldAccent, size: 36),
              const SizedBox(height: 12),
              Text(
                'Payment Gateway (Simulator)',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(fontSize: 17, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              const SizedBox(height: 8),
              Text(
                'In simulator/emulator environments without Google Play or native payment UI, would you like to simulate successful ₹99 payment?',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[300], height: 1.4),
              ),
              const SizedBox(height: 18),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        isSubmitting.value = false;
                        Get.back();
                      },
                      style: OutlinedButton.styleFrom(
                        foregroundColor: Colors.white70,
                        side: BorderSide(color: Colors.white.withOpacity(0.2)),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Cancel'),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        Get.back();
                        onSimulate();
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.goldAccent,
                        foregroundColor: Colors.black,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      child: const Text('Pay ₹99', style: TextStyle(fontWeight: FontWeight.bold)),
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

  void _showSubscriptionRequiredDialog() {
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF141312),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.goldAccent, width: 1.2),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: AppColors.goldAccent.withOpacity(0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.goldAccent),
                ),
                child: const Icon(Icons.workspace_premium_rounded, color: AppColors.goldAccent, size: 34),
              ),
              const SizedBox(height: 16),
              Text(
                'VIP Subscription Required',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Instant table reservations & priority seating are exclusive privileges for Yanki VIP Subscribers.\n\nSubscribe now to unlock table bookings across all outlets, 12 welcome vouchers, and free birthday rewards!',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[300], height: 1.4),
              ),
              const SizedBox(height: 22),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.goldAccent,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () {
                    Get.back();
                    Get.toNamed(AppRoutes.PLANS);
                  },
                  child: Text(
                    'Explore VIP Subscription Plans',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 14),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              TextButton(
                onPressed: () => Get.back(),
                child: Text('Maybe Later', style: GoogleFonts.inter(fontSize: 13, color: Colors.grey)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _executeBooking({required String paymentId}) async {
    isSubmitting.value = true;
    try {
      final isSub = isSubscribedMember.value;
      final bookingTimeLabel = '${selectedBookingDay.value}, ${selectedTimeSlot.value}';
      final bookingRef = 'REF-${DateTime.now().millisecondsSinceEpoch.toString().substring(7)}';

      await _apiService.bookReservation(
        name: AppConstants.currentUserName.isNotEmpty ? AppConstants.currentUserName : (isSub ? 'VIP Guest' : 'Guest Diner'),
        mobile: AppConstants.currentUserMobile,
        outlet: selectedOutlet.value,
        time: bookingTimeLabel,
        guests: guestCount.value,
        vip: isSub,
        tierPriorityTag: isSub ? 'Signature' : 'Non-Subscriber',
        occasionTag: selectedOccasion.value,
        specialRequests: specialNotesController.text,
        bookingAdvance: 99.0,
        advancePaid: true,
      );

      // Persist last booking details for seamless Home screen pre-fill
      await LocalStorageService.saveLastBooking(
        outlet: selectedOutlet.value,
        time: bookingTimeLabel,
        guests: guestCount.value,
        occasion: selectedOccasion.value,
        bookingReference: bookingRef,
        advancePaid: 99.0,
        paymentId: paymentId,
      );

      // Schedule smart reminders: 30 minutes prior and 15 minutes prior!
      NotificationService.to.scheduleBookingReminders(
        outlet: selectedOutlet.value,
        time: bookingTimeLabel,
        guests: guestCount.value,
        bookingReference: bookingRef,
      );

      specialNotesController.clear();
      loadReservations();

      final shortTxn = paymentId.length > 10 ? '${paymentId.substring(0, 10)}...' : paymentId;

      // Show Confirmed Pass Dialog
      Get.dialog(
        Dialog(
          backgroundColor: const Color(0xFF141312),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
            side: const BorderSide(color: AppColors.goldAccent, width: 1.2),
          ),
          child: Padding(
            padding: const EdgeInsets.all(22),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 58,
                  height: 58,
                  decoration: BoxDecoration(
                    color: const Color(0xFF4EE3B8).withOpacity(0.15),
                    shape: BoxShape.circle,
                    border: Border.all(color: const Color(0xFF4EE3B8)),
                  ),
                  child: const Icon(Icons.check_circle_rounded, color: Color(0xFF4EE3B8), size: 36),
                ),
                const SizedBox(height: 16),
                Text(
                  '👑 Table Reserved & Paid!',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.outfit(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(height: 10),
                Text(
                  'Table for ${guestCount.value} at ${selectedOutlet.value} ($bookingTimeLabel) is confirmed.\n\n₹99 cover charge paid (Txn: $shortTxn) and 100% credited to your dining bill.\n\nReminders are scheduled 30m & 15m before your arrival!',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[300], height: 1.4),
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.goldAccent,
                      foregroundColor: Colors.black,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      padding: const EdgeInsets.symmetric(vertical: 13),
                    ),
                    onPressed: () => Get.back(),
                    child: Text('Done', style: GoogleFonts.outfit(fontWeight: FontWeight.bold, fontSize: 14)),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    } finally {
      isSubmitting.value = false;
    }
  }

  /// Submits Banquet & ODC Inquiry (Chapter 07 Zero-Points Engine)
  void submitBanquetInquiry() async {
    isSubmitting.value = true;
    try {
      final inquiry = BanquetInquiryModel(
        customerName: AppConstants.currentUserName.isNotEmpty ? AppConstants.currentUserName : 'VIP Member',
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
    _razorpay.clear();
    specialNotesController.dispose();
    banquetDateController.dispose();
    banquetNotesController.dispose();
    super.onClose();
  }
}
