import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/reservations_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../widgets/sizzlo_button.dart';
import '../../../data/models/reservation_model.dart';
import '../../../routes/app_routes.dart';

class ReservationsView extends GetView<ReservationsController> {
  final bool isTab;

  const ReservationsView({Key? key, this.isTab = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0908),
      appBar: AppBar(
        title: Text(
          'Book a Table',
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
            // Hero VIP Dining Header Card
            _buildHeroHeader(),
            const SizedBox(height: 18),

            // Main Dine-In Reservation Form
            _buildTableBookingForm(context),
            const SizedBox(height: 20),

            // Large Gathering Banquet & ODC Shortcut Banner
            _buildBanquetShortcutBanner(),
            const SizedBox(height: 30),

            // My Active Reservations Section
            _buildMyReservationsSection(),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  // --- HERO HEADER ---
  Widget _buildHeroHeader() {
    return Obx(() {
      final isSub = controller.isSubscribedMember.value;
      return Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: isSub
                ? [const Color(0xFF2E2214), const Color(0xFF141312)]
                : [const Color(0xFF1E1A16), const Color(0xFF121110)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
          borderRadius: BorderRadius.circular(18),
          border: Border.all(
            color: isSub ? AppColors.goldAccent.withOpacity(0.5) : const Color(0xFF332B22),
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSub ? AppColors.goldAccent.withOpacity(0.15) : const Color(0xFF26201A),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSub ? AppColors.goldAccent.withOpacity(0.3) : const Color(0xFF3B3228),
                ),
              ),
              child: Icon(
                isSub ? Icons.workspace_premium_rounded : Icons.table_restaurant_rounded,
                color: isSub ? AppColors.goldAccent : Colors.grey[300],
                size: 26,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Expanded(
                        child: Text(
                          isSub ? 'VIP Priority Table' : 'Table Reservation',
                          style: GoogleFonts.outfit(
                            fontSize: 15,
                            fontWeight: FontWeight.w800,
                            color: isSub ? AppColors.goldAccent : Colors.white,
                          ),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: isSub ? const Color(0xFF0F2E25) : const Color(0xFF2E2214),
                          borderRadius: BorderRadius.circular(6),
                          border: isSub ? null : Border.all(color: AppColors.goldAccent.withOpacity(0.5)),
                        ),
                        child: Text(
                          isSub ? 'VIP PRIORITY' : 'VIP ONLY',
                          style: GoogleFonts.outfit(
                            fontSize: 9,
                            fontWeight: FontWeight.w800,
                            color: isSub ? const Color(0xFF4EE3B8) : AppColors.goldAccent,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    isSub
                        ? 'Active subscriber perk: Complimentary priority seating & VIP booth greeting.'
                        : 'Non-subscribed members can browse venues and slots. Subscribe to unlock instant table reservations.',
                    style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[400], height: 1.3),
                  ),
                ],
              ),
            ),
          ],
        ),
      );
    });
  }

  // --- MAIN DINE-IN FORM ---
  Widget _buildTableBookingForm(BuildContext context) {
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
          // Step 1: Outlet Selection
          Text('SELECT OUTLET LOCATION', style: _sectionHeaderStyle()),
          const SizedBox(height: 8),
          Obx(() => Container(
            padding: const EdgeInsets.symmetric(horizontal: 14),
            decoration: _boxStyle(),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: controller.outlets.contains(controller.selectedOutlet.value)
                    ? controller.selectedOutlet.value
                    : (controller.outlets.isNotEmpty ? controller.outlets.first : null),
                dropdownColor: const Color(0xFF1E1A16),
                isExpanded: true,
                icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.goldAccent),
                items: controller.outlets
                    .map((o) => DropdownMenuItem(
                          value: o,
                          child: Text(o, style: GoogleFonts.outfit(fontSize: 13, color: Colors.white)),
                        ))
                    .toList(),
                onChanged: (val) {
                  if (val != null) {
                    controller.selectedOutlet.value = val;
                    controller.loadTimeSlots();
                  }
                },
              ),
            ),
          )),
          const SizedBox(height: 18),

          // Step 2: Guest Count (Covers)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('GUESTS (1 TO 19 COVERS)', style: _sectionHeaderStyle()),
              Obx(() => Text(
                '${controller.guestCount.value} Guests',
                style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.goldAccent),
              )),
            ],
          ),
          const SizedBox(height: 8),
          // Quick Chips
          Obx(() => SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [1, 2, 4, 6, 8, 10, 12].map((cnt) {
                final isSelected = controller.guestCount.value == cnt;
                return GestureDetector(
                  onTap: () => controller.setGuestCount(cnt),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF2C241B) : const Color(0xFF1E1A16),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected ? AppColors.goldAccent : const Color(0xFF332B22),
                      ),
                    ),
                    child: Text(
                      cnt == 2 ? '2 (Couple)' : cnt == 4 ? '4 (Family)' : '$cnt Pax',
                      style: GoogleFonts.outfit(
                        fontSize: 11,
                        fontWeight: FontWeight.w700,
                        color: isSelected ? AppColors.goldAccent : Colors.grey[400],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          )),
          const SizedBox(height: 10),
          // Slider for fine-tuning
          Obx(() => SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.goldAccent,
              inactiveTrackColor: const Color(0xFF2C251D),
              thumbColor: AppColors.goldAccent,
              overlayColor: AppColors.goldAccent.withOpacity(0.2),
              trackHeight: 3,
            ),
            child: Slider(
              value: controller.guestCount.value.toDouble().clamp(1.0, 19.0),
              min: 1.0,
              max: 19.0,
              divisions: 18,
              onChanged: (val) => controller.setGuestCount(val.toInt()),
            ),
          )),
          const SizedBox(height: 12),

          // Step 3: Booking Day / Date
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('RESERVATION DAY', style: _sectionHeaderStyle()),
              GestureDetector(
                onTap: () => controller.pickCustomDate(context),
                child: Row(
                  children: [
                    const Icon(Icons.edit_calendar_rounded, size: 13, color: AppColors.goldAccent),
                    const SizedBox(width: 4),
                    Text(
                      'Custom Date',
                      style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldAccent),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Obx(() {
            final currentDay = controller.selectedBookingDay.value;
            final isToday = currentDay == 'Today';
            final isTomorrow = currentDay == 'Tomorrow';
            final isCustom = !isToday && !isTomorrow;

            return Row(
              children: [
                Expanded(
                  child: _buildDayChip('Today', isToday, () => controller.selectedBookingDay.value = 'Today'),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildDayChip('Tomorrow', isTomorrow, () => controller.selectedBookingDay.value = 'Tomorrow'),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _buildDayChip(
                    isCustom ? currentDay : 'Pick Date',
                    isCustom,
                    () => controller.pickCustomDate(context),
                  ),
                ),
              ],
            );
          }),
          const SizedBox(height: 18),

          // Step 4: Seating Area Preference
          Text('SEATING AREA PREFERENCE', style: _sectionHeaderStyle()),
          const SizedBox(height: 8),
          Obx(() => Wrap(
            spacing: 8,
            runSpacing: 8,
            children: controller.seatingAreas.map((area) {
              final isSelected = controller.selectedSeatingArea.value == area;
              return GestureDetector(
                onTap: () => controller.selectedSeatingArea.value = area,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF2C241B) : const Color(0xFF1E1A16),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? AppColors.goldAccent : const Color(0xFF332B22),
                      width: isSelected ? 1.5 : 1.0,
                    ),
                  ),
                  child: Text(
                    area,
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? AppColors.goldAccent : Colors.grey[400],
                    ),
                  ),
                ),
              );
            }).toList(),
          )),
          const SizedBox(height: 18),

          // Step 5: Time Slots (Categorized by Lunch & Dinner)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('TIME SLOT', style: _sectionHeaderStyle()),
              Text(
                'Min 1-hr advance for today',
                style: GoogleFonts.inter(fontSize: 10, color: Colors.grey[500]),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Obx(() {
            final lunchSlots = controller.timeSlots.where((s) => s.contains('AM') || s.startsWith('12:') || s.startsWith('1:') || s.startsWith('2:') || s.startsWith('3:')).toList();
            final dinnerSlots = controller.timeSlots.where((s) => !lunchSlots.contains(s)).toList();

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (lunchSlots.isNotEmpty) ...[
                  Text('LUNCH (12:00 PM – 3:30 PM)', style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.grey[500])),
                  const SizedBox(height: 6),
                  _buildSlotGrid(lunchSlots),
                  const SizedBox(height: 10),
                ],
                if (dinnerSlots.isNotEmpty) ...[
                  Text('DINNER (7:00 PM – 10:30 PM)', style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.grey[500])),
                  const SizedBox(height: 6),
                  _buildSlotGrid(dinnerSlots),
                ],
              ],
            );
          }),
          const SizedBox(height: 18),

          // Step 6: Dining Occasion
          Text('DINING OCCASION', style: _sectionHeaderStyle()),
          const SizedBox(height: 8),
          Obx(() => Wrap(
            spacing: 8,
            runSpacing: 8,
            children: controller.occasionTags.map((tag) {
              final isSelected = controller.selectedOccasion.value == tag;
              return GestureDetector(
                onTap: () => controller.selectedOccasion.value = tag,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF0E382B) : const Color(0xFF1E1A16),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(
                      color: isSelected ? const Color(0xFF4EE3B8) : const Color(0xFF332B22),
                      width: isSelected ? 1.5 : 1.0,
                    ),
                  ),
                  child: Text(
                    tag,
                    style: GoogleFonts.outfit(
                      fontSize: 11,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? const Color(0xFF4EE3B8) : Colors.grey[400],
                    ),
                  ),
                ),
              );
            }).toList(),
          )),
          const SizedBox(height: 18),

          // Step 7: Special Table Requests
          Text('SPECIAL TABLE REQUESTS', style: _sectionHeaderStyle()),
          const SizedBox(height: 8),
          TextField(
            controller: controller.specialNotesController,
            style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
            decoration: InputDecoration(
              hintText: 'e.g., Anniversary candles, quiet corner booth, high chair needed...',
              hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey[700]),
              filled: true,
              fillColor: const Color(0xFF1E1A16),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.goldAccent)),
            ),
          ),
          const SizedBox(height: 16),

          // Policy and Deposit Breakdown Card
          Obx(() {
            final isSub = controller.isSubscribedMember.value;
            return Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSub ? const Color(0xFF2C241B) : const Color(0xFF1A1714),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isSub ? const Color(0xFF6B4E22) : const Color(0xFF2E2720)),
              ),
              child: Row(
                children: [
                  Icon(
                    isSub ? Icons.verified_rounded : Icons.info_outline_rounded,
                    color: isSub ? AppColors.goldAccent : Colors.grey[400],
                    size: 18,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          isSub ? 'VIP Priority Table · Included in Plan' : 'VIP Member Privilege · Table Reservation',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: AppColors.goldAccent,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          isSub
                              ? 'Your table is guaranteed with priority host seating. Nominal ₹99 cover charge is 100% deducted from your dining bill.'
                              : 'Instant table reservations are reserved for Yanki VIP subscribers. Subscribe to reserve tables instantly.',
                          style: GoogleFonts.inter(fontSize: 10, color: Colors.grey[400]),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 20),

          // CTA Reserve Button
          Obx(() => SizzloButton(
            text: controller.isSubmitting.value
                ? 'Reserving Table...'
                : controller.isSubscribedMember.value
                    ? 'Book VIP Table • ₹99 Advance Cover'
                    : 'Subscribe to Reserve Table 🔒',
            isLoading: controller.isSubmitting.value,
            onPressed: controller.confirmAndBookTable,
          )),
        ],
      ),
    );
  }

  // --- SHORTCUT TO BANQUET & ODC DESK ---
  Widget _buildBanquetShortcutBanner() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161412),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF2C251D)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: AppColors.goldAccent.withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.celebration_rounded, color: AppColors.goldAccent, size: 22),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Planning an event of 20+ guests?',
                  style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                ),
                Text(
                  'Use our dedicated Banquet Halls & Outdoor Catering (ODC) Desk.',
                  style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[400]),
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),
          TextButton(
            style: TextButton.styleFrom(
              backgroundColor: const Color(0xFF2C241B),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
                side: const BorderSide(color: AppColors.goldAccent, width: 0.8),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
            ),
            onPressed: () => Get.toNamed(AppRoutes.BANQUET_ODC),
            child: Text(
              'Banquet & ODC',
              style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldAccent),
            ),
          ),
        ],
      ),
    );
  }

  // --- MY ACTIVE RESERVATIONS SECTION ---
  Widget _buildMyReservationsSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'MY TABLE RESERVATIONS',
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.goldAccent,
                letterSpacing: 1.2,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 16, color: Colors.grey),
              onPressed: controller.loadReservations,
            ),
          ],
        ),
        const SizedBox(height: 8),
        Obx(() {
          if (controller.isLoading.value) {
            return const Center(child: Padding(
              padding: EdgeInsets.all(20.0),
              child: CircularProgressIndicator(color: AppColors.goldAccent),
            ));
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
                  'No active table reservations.\nYour upcoming restaurant bookings will appear here.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 12, height: 1.4),
                ),
              ),
            );
          }
          return Column(
            children: controller.reservations.map((r) => _buildReservationCard(r)).toList(),
          );
        }),
      ],
    );
  }

  Widget _buildReservationCard(ReservationModel r) {
    final isCancelled = r.status.toUpperCase() == 'CANCELLED';
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
              Expanded(
                child: Text(
                  r.outlet,
                  style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.w700, color: Colors.white),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: isCancelled ? const Color(0xFF2D1616) : const Color(0xFF0F2E25),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  r.status.toUpperCase(),
                  style: GoogleFonts.outfit(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: isCancelled ? const Color(0xFFFF8A80) : const Color(0xFF4EE3B8),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.access_time_rounded, size: 13, color: Colors.grey),
              const SizedBox(width: 5),
              Text(r.reservationTime, style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400])),
              const Spacer(),
              const Icon(Icons.people_alt_outlined, size: 14, color: AppColors.goldAccent),
              const SizedBox(width: 4),
              Text(
                '${r.guests} Guests',
                style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.goldAccent),
              ),
            ],
          ),
          if (r.specialRequests != null && r.specialRequests!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Text(
              'Requests: ${r.specialRequests}',
              style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[500]),
            ),
          ],
          if (!isCancelled) ...[
            const SizedBox(height: 10),
            Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                GestureDetector(
                  onTap: () => controller.confirmCancelReservation(r),
                  child: Text(
                    'Cancel Table',
                    style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w600, color: const Color(0xFFFF6B6B)),
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // --- TIME SLOT GRID ---
  Widget _buildSlotGrid(List<String> slots) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: slots.map((slot) {
          final isSelected = controller.selectedTimeSlot.value == slot;
          final isAvailable = controller.isSlotBookable(slot);

          return GestureDetector(
            onTap: () {
              if (isAvailable) {
                controller.selectedTimeSlot.value = slot;
              } else {
                Get.snackbar(
                  'Slot Locked',
                  'Reservations require at least 1 hour advance notice for today.',
                  backgroundColor: const Color(0xFF261914),
                  colorText: const Color(0xFFE27C38),
                  duration: const Duration(seconds: 3),
                );
              }
            },
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
      ),
    );
  }

  Widget _buildDayChip(String label, bool isSelected, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF2C241B) : const Color(0xFF1E1A16),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppColors.goldAccent : const Color(0xFF332B22),
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        child: Center(
          child: Text(
            label,
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: isSelected ? AppColors.goldAccent : Colors.grey[400],
            ),
          ),
        ),
      ),
    );
  }

  TextStyle _sectionHeaderStyle() {
    return GoogleFonts.outfit(
      fontSize: 11,
      fontWeight: FontWeight.w700,
      color: Colors.grey[400],
      letterSpacing: 0.8,
    );
  }

  BoxDecoration _boxStyle() {
    return BoxDecoration(
      color: const Color(0xFF1E1A16),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: const Color(0xFF332B22)),
    );
  }
}
