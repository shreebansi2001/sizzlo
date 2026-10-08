import 'package:get/get.dart';
import '../../../data/models/member_model.dart';
import '../../../data/models/coupon_model.dart';
import '../../../data/services/api_service.dart';

import '../../../data/models/dining_event_model.dart';
import '../../../core/values/app_constants.dart';

class HomeController extends GetxController {
  final ApiService _apiService = ApiService();

  final RxString activePlan = 'none'.obs;
  final Rx<MemberModel> member = MemberModel.defaultProfile().obs;
  final RxList<CouponModel> featuredCoupons = <CouponModel>[].obs;
  final RxInt outletsCount = 0.obs;
  final RxList<Map<String, dynamic>> customerReviews = <Map<String, dynamic>>[].obs;
  final RxList<DiningEventModel> diningEvents = <DiningEventModel>[].obs;
  final RxList<DiningEventBookingModel> myEventBookings = <DiningEventBookingModel>[].obs;
  final RxBool isLoading = true.obs;
  final RxBool isBookingEvent = false.obs;

  @override
  void onInit() {
    super.onInit();
    activePlan.value = member.value.planId;
    loadDashboardData();
  }

  void switchPlan(String planId) {
    activePlan.value = planId;
    final isSub = planId != 'none' && planId.isNotEmpty;
    member.value = member.value.copyWith(
      planId: planId,
      membershipType: planId == 'classic'
          ? 'CLASSIC SUBSCRIBER'
          : planId == 'elite'
              ? 'ELITE SUBSCRIBER'
              : planId == 'signature'
                  ? 'SIGNATURE SUBSCRIBER'
                  : 'REGISTERED USER',
      couponsTotal: isSub ? (planId == 'classic' ? 6 : planId == 'signature' ? 12 : 18) : 0,
      daysRemaining: isSub ? 365 : 0,
    );
  }

  Future<void> loadDashboardData() async {
    isLoading.value = true;
    try {
      final fetchedMember = await _apiService.getMemberProfile();
      if (fetchedMember.fullName.isNotEmpty && fetchedMember.fullName != 'Guest') {
        member.value = fetchedMember;
        activePlan.value = fetchedMember.planId;
      } else if (member.value.fullName != 'Guest' && member.value.fullName.isNotEmpty) {
        // Keep current populated member if API returned fallback
      } else if (fetchedMember.fullName.isNotEmpty) {
        member.value = fetchedMember;
        activePlan.value = fetchedMember.planId;
      }

      // STRICT REQUIREMENT: Coupons ONLY show after a plan has been purchased!
      if (member.value.isSubscriber) {
        final allCoupons = await _apiService.getCoupons(member.value.membershipId, member.value.mobile);
        featuredCoupons.value = allCoupons.where((c) => c.isAvailable).take(4).toList();
      } else {
        featuredCoupons.clear();
      }

      final outlets = await _apiService.getActiveOutlets();
      if (outlets.isNotEmpty) {
        outletsCount.value = outlets.length;
      }

      // Fetch active dining events and user's event bookings
      diningEvents.value = await _apiService.getDiningEvents();
      final userMobile = member.value.mobile.isNotEmpty
          ? member.value.mobile
          : AppConstants.currentUserMobile;
      if (userMobile.isNotEmpty) {
        myEventBookings.value = await _apiService.getMyEventBookings(userMobile);
      }

      // Clear any static reviews - only show when live reviews exist
      customerReviews.clear();
    } finally {
      isLoading.value = false;
    }
  }

  DiningEventBookingModel? getBookingForEvent(int eventId) {
    try {
      return myEventBookings.firstWhere((b) => b.eventId == eventId);
    } catch (_) {
      return null;
    }
  }

  Future<DiningEventBookingModel?> bookEvent({
    required DiningEventModel event,
    required int guestCount,
    String? paymentId,
  }) async {
    isBookingEvent.value = true;
    try {
      final userMobile = member.value.mobile.isNotEmpty
          ? member.value.mobile
          : AppConstants.currentUserMobile;
      final userName = member.value.fullName.isNotEmpty && member.value.fullName != 'Guest'
          ? member.value.fullName
          : AppConstants.currentUserName;

      final booking = await _apiService.bookDiningEvent(
        eventId: event.id,
        customerName: userName,
        customerMobile: userMobile,
        customerEmail: member.value.email,
        guestCount: guestCount,
        paymentId: paymentId,
      );

      if (booking != null) {
        // Add to user's bookings
        myEventBookings.insert(0, booking);

        // Update local event booked count
        final index = diningEvents.indexWhere((e) => e.id == event.id);
        if (index != -1) {
          final cur = diningEvents[index];
          diningEvents[index] = DiningEventModel(
            id: cur.id,
            title: cur.title,
            description: cur.description,
            bannerUrl: cur.bannerUrl,
            outletName: cur.outletName,
            eventDay: cur.eventDay,
            eventDate: cur.eventDate,
            timings: cur.timings,
            totalSeats: cur.totalSeats,
            bookedSeats: cur.bookedSeats + guestCount,
            pricePerGuest: cur.pricePerGuest,
            inclusions: cur.inclusions,
            status: (cur.bookedSeats + guestCount >= cur.totalSeats) ? 'HOUSEFULL' : cur.status,
          );
        }
      }
      return booking;
    } finally {
      isBookingEvent.value = false;
    }
  }

  void refreshData() async {
    await loadDashboardData();
  }
}
