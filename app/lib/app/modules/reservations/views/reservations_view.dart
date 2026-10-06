import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/reservations_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../widgets/sizzlo_button.dart';
import '../../../data/models/reservation_model.dart';

class ReservationsView extends GetView<ReservationsController> {
  final bool isTab;

  const ReservationsView({Key? key, this.isTab = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0908),
      appBar: AppBar(
        title: Text(
          'Table & Banquet Bookings',
          style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        automaticallyImplyLeading: !isTab,
        leading: isTab
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: Colors.white),
                onPressed: () => Get.back(),
              ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        physics: const BouncingScrollPhysics(),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Chapter 03 Top Toggle: Regular Dine-In vs Banquet & ODC
            Container(
              padding: const EdgeInsets.all(4),
              decoration: BoxDecoration(
                color: const Color(0xFF141312),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF262320)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Obx(() {
                      final isSelected = controller.bookingMode.value == 0;
                      return GestureDetector(
                        onTap: () => controller.bookingMode.value = 0,
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF2C241B) : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            border: isSelected ? Border.all(color: AppColors.goldAccent, width: 1) : null,
                          ),
                          child: Center(
                            child: Text(
                              'Dine-In (1-19)',
                              style: GoogleFonts.outfit(
                                fontSize: 13,
                                fontWeight: FontWeight.w700,
                                color: isSelected ? AppColors.goldAccent : Colors.grey,
                              ),
                            ),
                          ),
                        ),
                      );
                    }),
                  ),
                  Expanded(
                    child: Obx(() {
                      final isSelected = controller.bookingMode.value == 1;
                      return GestureDetector(
                        onTap: () => controller.bookingMode.value = 1,
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF2C241B) : Colors.transparent,
                            borderRadius: BorderRadius.circular(12),
                            border: isSelected ? Border.all(color: AppColors.goldAccent, width: 1) : null,
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Banquet & ODC (20+)',
                                style: GoogleFonts.outfit(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w700,
                                  color: isSelected ? AppColors.goldAccent : Colors.grey,
                                ),
                              ),
                              const SizedBox(width: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF4EE3B8),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: Text('EVENTS', style: GoogleFonts.outfit(fontSize: 8, fontWeight: FontWeight.w900, color: Colors.black)),
                              ),
                            ],
                          ),
                        ),
                      );
                    }),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Form Body based on Toggle
            Obx(() {
              if (controller.bookingMode.value == 0) {
                return _buildRegularBookingCard();
              } else {
                return _buildBanquetInquiryCard();
              }
            }),

            const SizedBox(height: 30),

            // My Bookings Section
            Text(
              'MY RESERVATIONS',
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.goldAccent,
                letterSpacing: 1.2,
              ),
            ),
            const SizedBox(height: 12),
            Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator(color: AppColors.goldAccent));
              }
              if (controller.reservations.isEmpty) {
                return Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: const Color(0xFF141312),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF262320)),
                  ),
                  child: Center(
                    child: Text(
                      'No active reservations found.',
                      style: GoogleFonts.inter(color: Colors.grey, fontSize: 13),
                    ),
                  ),
                );
              }
              return Column(
                children: controller.reservations.map((r) => _buildReservationItem(r)).toList(),
              );
            }),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildRegularBookingCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF141312),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF262320)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Regular Table Reservation',
                style: GoogleFonts.outfit(fontSize: 18, fontWeight: FontWeight.w700, color: Colors.white),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F2E25),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: const Color(0xFF1E4D3C)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.star, size: 12, color: Color(0xFF4EE3B8)),
                    const SizedBox(width: 4),
                    Text('VIP PRIORITY', style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF4EE3B8))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Outlet Dropdown
          Text('OUTLET LOCATION', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey, letterSpacing: 1.0)),
          const SizedBox(height: 6),
          Obx(() => Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1A16),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF332B22)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: controller.outlets.contains(controller.selectedOutlet.value) ? controller.selectedOutlet.value : (controller.outlets.isNotEmpty ? controller.outlets.first : null),
                dropdownColor: const Color(0xFF1E1A16),
                isExpanded: true,
                icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.goldAccent),
                items: controller.outlets.map((o) => DropdownMenuItem(value: o, child: Text(o, style: GoogleFonts.outfit(fontSize: 13, color: Colors.white)))).toList(),
                onChanged: (val) {
                  if (val != null) controller.selectedOutlet.value = val;
                },
              ),
            ),
          )),
          const SizedBox(height: 14),

          // Guest Count Selector (1 to 19 covers)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('GUESTS (1 TO 19)', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey, letterSpacing: 1.0)),
              Obx(() => Text('${controller.guestCount.value} Guests', style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.goldAccent))),
            ],
          ),
          const SizedBox(height: 6),
          Obx(() => SliderTheme(
            data: SliderTheme.of(Get.context!).copyWith(
              activeTrackColor: AppColors.goldAccent,
              inactiveTrackColor: const Color(0xFF262320),
              thumbColor: AppColors.goldAccent,
              overlayColor: AppColors.goldAccent.withOpacity(0.2),
            ),
            child: Slider(
              value: controller.guestCount.value.toDouble(),
              min: 1,
              max: 20,
              divisions: 19,
              onChanged: (val) => controller.setGuestCount(val.toInt()),
            ),
          )),
          const SizedBox(height: 10),

          // Day & Advance Booking Rules
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('BOOKING DAY', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey, letterSpacing: 1.0)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: const Color(0xFF2D1808),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: const Color(0xFF6B3E18)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.timer_outlined, size: 10, color: Color(0xFFFFA726)),
                    const SizedBox(width: 4),
                    Text('1-HR ADVANCE REQUIRED', style: GoogleFonts.outfit(fontSize: 9, fontWeight: FontWeight.w800, color: const Color(0xFFFFA726))),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Obx(() => Row(
            children: ['Today', 'Tomorrow'].map((day) {
              final isSelected = controller.selectedBookingDay.value == day;
              return Expanded(
                child: GestureDetector(
                  onTap: () => controller.setBookingDay(day),
                  child: Container(
                    margin: EdgeInsets.only(right: day == 'Today' ? 8 : 0),
                    padding: const EdgeInsets.symmetric(vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF2C241B) : const Color(0xFF1E1A16),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isSelected ? AppColors.goldAccent : const Color(0xFF332B22), width: isSelected ? 1.5 : 1.0),
                    ),
                    child: Center(
                      child: Text(
                        day,
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? AppColors.goldAccent : Colors.grey,
                        ),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          )),
          const SizedBox(height: 14),

          // Time Slot Selector (Discrete 30-min intervals)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('TIME SLOT', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey, letterSpacing: 1.0)),
              Text('Earliest bookable: >60 mins', style: GoogleFonts.inter(fontSize: 10, color: Colors.grey[600])),
            ],
          ),
          const SizedBox(height: 6),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            physics: const BouncingScrollPhysics(),
            child: Obx(() => Row(
              children: controller.timeSlots.map((slot) {
                final isAvailable = controller.isSlotBookable(slot);
                final isSelected = controller.selectedTimeSlot.value == slot;
                return GestureDetector(
                  onTap: () => controller.selectSlot(slot),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFF2C241B)
                          : isAvailable
                              ? const Color(0xFF1E1A16)
                              : const Color(0xFF141210),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.goldAccent
                            : isAvailable
                                ? const Color(0xFF332B22)
                                : const Color(0xFF201B17),
                        width: isSelected ? 1.5 : 1.0,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (!isAvailable) ...[
                          const Icon(Icons.lock_clock_outlined, size: 12, color: Color(0xFF6B584E)),
                          const SizedBox(width: 4),
                        ],
                        Text(
                          slot,
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: isSelected
                                ? AppColors.goldAccent
                                : isAvailable
                                    ? Colors.grey[300]
                                    : const Color(0xFF5A4D45),
                            decoration: isAvailable ? null : TextDecoration.lineThrough,
                            decorationColor: const Color(0xFF8D6E63),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            )),
          ),
          const SizedBox(height: 14),

          // Occasion Tag (Chapter 06.1)
          Text('DINING OCCASION', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey, letterSpacing: 1.0)),
          const SizedBox(height: 6),
          Obx(() => Row(
            children: controller.occasionTags.map((tag) {
              final isSelected = controller.selectedOccasion.value == tag;
              return Expanded(
                child: GestureDetector(
                  onTap: () => controller.selectedOccasion.value = tag,
                  child: Container(
                    margin: const EdgeInsets.only(right: 6),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF0E382B) : const Color(0xFF1E1A16),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: isSelected ? const Color(0xFF4EE3B8) : const Color(0xFF332B22)),
                    ),
                    child: Center(
                      child: Text(
                        tag,
                        style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: isSelected ? const Color(0xFF4EE3B8) : Colors.grey[400]),
                      ),
                    ),
                  ),
                ),
              );
            }).toList(),
          )),
          const SizedBox(height: 14),

          // Special Requests Note
          TextField(
            controller: controller.specialNotesController,
            style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Special table preferences, anniversary request...',
              hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey[700]),
              filled: true,
              fillColor: const Color(0xFF1E1A16),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.goldAccent)),
            ),
          ),
          const SizedBox(height: 12),

          // Table Holding Policy Notice (Chapter 06.1)
          Row(
            children: [
              const Icon(Icons.info_outline_rounded, color: Colors.grey, size: 14),
              const SizedBox(width: 6),
              Expanded(
                child: Text(
                  'Tables held for 15 minutes past slot time before marking as No-Show. Earns loyalty points on bill.',
                  style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[500]),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Book Button
          Obx(() => SizzloButton(
            text: controller.isSubmitting.value ? 'Reserving...' : 'Confirm Table Booking',
            isLoading: controller.isSubmitting.value,
            onPressed: controller.confirmAndBookTable,
          )),
        ],
      ),
    );
  }

  Widget _buildBanquetInquiryCard() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF141312),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF3B2E1E)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(color: const Color(0xFF2C241B), borderRadius: BorderRadius.circular(10)),
                child: const Icon(Icons.celebration_rounded, color: AppColors.goldAccent, size: 22),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('House of Yanki Banquets & ODC', style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white)),
                    Text('Parties of 20+ covers & outdoor lawn catering', style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400])),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // MANDATORY ZERO-POINTS NOTICE (Chapter 07.2 SRS)
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFF231713),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF5A2A1A)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Icon(Icons.warning_amber_rounded, color: Color(0xFFFF8A65), size: 18),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Banquet space bookings and Outdoor Catering (ODC) packages are eligible for tier card-rate discounts but are strictly excluded from earning Sizzlo loyalty points.',
                    style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFFFCCBC), height: 1.3),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Event Category
          Text('EVENT CATEGORY', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey, letterSpacing: 1.0)),
          const SizedBox(height: 6),
          Obx(() => Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: BoxDecoration(
              color: const Color(0xFF1E1A16),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: const Color(0xFF332B22)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: controller.banquetCategory.value,
                dropdownColor: const Color(0xFF1E1A16),
                isExpanded: true,
                items: controller.banquetCategories.map((c) => DropdownMenuItem(value: c, child: Text(c, style: GoogleFonts.outfit(fontSize: 13, color: Colors.white)))).toList(),
                onChanged: (val) {
                  if (val != null) controller.banquetCategory.value = val;
                },
              ),
            ),
          )),
          const SizedBox(height: 14),

          // Shift (Lunch / Dinner) & Pax
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('SESSION / SHIFT', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey, letterSpacing: 1.0)),
                    const SizedBox(height: 6),
                    Obx(() => Row(
                      children: ['Lunch', 'Dinner'].map((s) {
                        final isSelected = controller.banquetShift.value == s;
                        return Expanded(
                          child: GestureDetector(
                            onTap: () => controller.banquetShift.value = s,
                            child: Container(
                              margin: const EdgeInsets.only(right: 6),
                              padding: const EdgeInsets.symmetric(vertical: 10),
                              decoration: BoxDecoration(
                                color: isSelected ? const Color(0xFF2C241B) : const Color(0xFF1E1A16),
                                borderRadius: BorderRadius.circular(10),
                                border: Border.all(color: isSelected ? AppColors.goldAccent : const Color(0xFF332B22)),
                              ),
                              child: Center(
                                child: Text(s, style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: isSelected ? AppColors.goldAccent : Colors.grey)),
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    )),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ESTIMATED GUESTS', style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey, letterSpacing: 1.0)),
                    const SizedBox(height: 6),
                    TextField(
                      keyboardType: TextInputType.number,
                      onChanged: (v) => controller.banquetPax.value = int.tryParse(v) ?? 100,
                      controller: TextEditingController(text: controller.banquetPax.value.toString()),
                      style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14),
                      decoration: InputDecoration(
                        filled: true,
                        fillColor: const Color(0xFF1E1A16),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: const BorderSide(color: Color(0xFF332B22))),
                        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            'Tip: Minimum 300 guests qualifies for the Elite Tier 20% catering discount.',
            style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF4EE3B8)),
          ),
          const SizedBox(height: 14),

          // Custom Requirements
          TextField(
            controller: controller.banquetNotesController,
            maxLines: 2,
            style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Live sizzler counter, dietary preferences, AV setup...',
              hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey[700]),
              filled: true,
              fillColor: const Color(0xFF1E1A16),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
            ),
          ),
          const SizedBox(height: 16),

          // Submit Enquiry
          Obx(() => SizzloButton(
            text: controller.isSubmitting.value ? 'Dispatching Lead...' : 'Submit Banquet & ODC Enquiry',
            isLoading: controller.isSubmitting.value,
            onPressed: controller.submitBanquetInquiry,
          )),
        ],
      ),
    );
  }

  Widget _buildReservationItem(ReservationModel r) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF141312),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF262320)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                r.outlet,
                style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F2E25),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  r.status.toUpperCase(),
                  style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w800, color: const Color(0xFF4EE3B8)),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              Icon(Icons.calendar_today_rounded, size: 13, color: Colors.grey[500]),
              const SizedBox(width: 6),
              Text(r.reservationTime, style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400])),
              const SizedBox(width: 14),
              Icon(Icons.people_outline_rounded, size: 14, color: Colors.grey[500]),
              const SizedBox(width: 6),
              Text('${r.guests} Covers', style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400])),
            ],
          ),
          if (r.specialRequests != null && r.specialRequests!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(r.specialRequests!, style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[600])),
          ],
          const SizedBox(height: 10),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => controller.confirmCancelReservation(r),
                style: TextButton.styleFrom(padding: EdgeInsets.zero, minimumSize: const Size(60, 24)),
                child: Text('Cancel', style: GoogleFonts.outfit(fontSize: 12, color: Colors.redAccent)),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
