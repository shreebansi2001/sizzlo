import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
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
    return WillPopScope(
      onWillPop: () async {
        if (controller.currentBookingStep.value == 2) {
          controller.goToStep1();
          return false;
        }
        return true;
      },
      child: Scaffold(
        backgroundColor: const Color(0xFF0A0908),
        appBar: AppBar(
          title: Obx(() => Text(
            controller.currentBookingStep.value == 1 ? 'Book a Table' : 'Guests & Table Details',
            style: GoogleFonts.outfit(fontSize: 19, fontWeight: FontWeight.w700, color: Colors.white),
          )),
          centerTitle: true,
          backgroundColor: Colors.transparent,
          elevation: 0,
          automaticallyImplyLeading: false,
          leading: Obx(() {
            final isStep2 = controller.currentBookingStep.value == 2;
            if (isStep2) {
              return IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: Colors.white),
                onPressed: () => controller.goToStep1(),
              );
            }
            if (isTab) return const SizedBox.shrink();
            return IconButton(
              icon: const Icon(Icons.arrow_back_ios_new, size: 18, color: Colors.white),
              onPressed: () => Get.back(),
            );
          }),
          actions: [
            Container(
              alignment: Alignment.center,
              padding: const EdgeInsets.only(right: 16),
              child: Obx(() => Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: const Color(0xFF241D15),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.goldAccent.withOpacity(0.4)),
                ),
                child: Text(
                  'Step ${controller.currentBookingStep.value} of 2',
                  style: GoogleFonts.outfit(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    color: AppColors.goldAccent,
                  ),
                ),
              )),
            ),
          ],
        ),
        body: SafeArea(
          top: false,
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
            physics: const BouncingScrollPhysics(),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Step Progress Tracker
                _buildStepProgressIndicator(),
                const SizedBox(height: 14),

                // Step 1: Calendar & Branch Selection ("shows what is today and which branch")
                // Step 2: Table & Guests Selection ("on todays tap, open screen defaulting to 2")
                Obx(() => controller.currentBookingStep.value == 1
                    ? _buildStep1CalendarAndBranch(context)
                    : _buildStep2TableAndGuests(context)),

                const SizedBox(height: 40),
              ],
            ),
          ),
        ),
      ),
    );
  }

  // --- STEP PROGRESS TRACKER ---
  Widget _buildStepProgressIndicator() {
    return Obx(() {
      final currentStep = controller.currentBookingStep.value;

      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: const Color(0xFF141210),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: const Color(0xFF262320)),
        ),
        child: Row(
          children: [
            // Step 1
            Expanded(
              child: GestureDetector(
                onTap: () => controller.goToStep1(),
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: currentStep >= 1 ? AppColors.goldAccent : const Color(0xFF2A241C),
                      ),
                      child: Center(
                        child: Text(
                          '1',
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: currentStep >= 1 ? Colors.black : Colors.grey[500],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'STEP 1',
                            style: GoogleFonts.inter(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: currentStep == 1 ? AppColors.goldAccent : Colors.grey[500],
                              letterSpacing: 0.8,
                            ),
                          ),
                          Text(
                            'Date & Branch',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: currentStep == 1 ? FontWeight.w700 : FontWeight.w500,
                              color: currentStep == 1 ? Colors.white : Colors.grey[400],
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            // Connector line
            Container(
              width: 22,
              height: 2,
              color: currentStep == 2 ? AppColors.goldAccent : const Color(0xFF332B22),
              margin: const EdgeInsets.symmetric(horizontal: 6),
            ),
            // Step 2
            Expanded(
              child: GestureDetector(
                onTap: () => controller.goToStep2(),
                child: Row(
                  children: [
                    Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: currentStep == 2 ? AppColors.goldAccent : const Color(0xFF2A241C),
                      ),
                      child: Center(
                        child: Text(
                          '2',
                          style: GoogleFonts.outfit(
                            fontSize: 11,
                            fontWeight: FontWeight.w800,
                            color: currentStep == 2 ? Colors.black : Colors.grey[500],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'STEP 2',
                            style: GoogleFonts.inter(
                              fontSize: 9,
                              fontWeight: FontWeight.w700,
                              color: currentStep == 2 ? AppColors.goldAccent : Colors.grey[500],
                              letterSpacing: 0.8,
                            ),
                          ),
                          Text(
                            'Table & Guests (2)',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: currentStep == 2 ? FontWeight.w700 : FontWeight.w500,
                              color: currentStep == 2 ? Colors.white : Colors.grey[400],
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  // =========================================================================
  // STEP 1: CALENDAR & BRANCH SELECTION ("shows what is today and which branch")
  // =========================================================================
  Widget _buildStep1CalendarAndBranch(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // VIP Dining Header Card
        _buildHeroHeader(),
        const SizedBox(height: 18),

        // Hero "TODAY" Highlight Card (Tap opens Step 2 defaulting to 2 guests)
        _buildTodayHeroCard(),
        const SizedBox(height: 22),

        // Interactive 30-Day Calendar Date Strip
        _buildCalendarDateStrip(context),
        const SizedBox(height: 22),

        // Branch / Outlet Selection ("Which branch")
        _buildBranchSelectionSection(),
        const SizedBox(height: 20),

        // Proceed to Step 2 CTA Button
        SizzloButton(
          text: 'Continue to Table & Guests (2 Covers) →',
          onPressed: controller.goToStep2,
        ),
        const SizedBox(height: 26),

        // Shortcut to Banquet Desk for 20+ Guests
        _buildBanquetShortcutBanner(),
        const SizedBox(height: 28),

        // My Active Reservations Section
        _buildMyReservationsSection(),
      ],
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
                      Text(
                        isSub ? 'VIP PRIORITY DINING' : 'TABLE RESERVATIONS',
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w800,
                          color: isSub ? AppColors.goldAccent : Colors.white,
                          letterSpacing: 0.8,
                        ),
                      ),
                      if (isSub) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: AppColors.goldAccent.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text(
                            'UNLOCKED',
                            style: GoogleFonts.outfit(
                              fontSize: 9,
                              fontWeight: FontWeight.w800,
                              color: AppColors.goldAccent,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 3),
                  Text(
                    isSub
                        ? 'Active subscriber perk: Complimentary priority seating & VIP booth greeting.'
                        : 'Select date & branch to check live table availability across House of Yanki.',
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

  // --- HERO "TODAY" CARD (WHAT IS TODAY & TAP TO BOOK TODAY FOR 2 GUESTS) ---
  Widget _buildTodayHeroCard() {
    final now = DateTime.now();
    final todayDayName = DateFormat('EEEE').format(now);
    final todayFullDate = DateFormat('d MMMM yyyy').format(now);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF2E2214), Color(0xFF161311)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: AppColors.goldAccent.withOpacity(0.6), width: 1.5),
        boxShadow: [
          BoxShadow(
            color: AppColors.goldAccent.withOpacity(0.12),
            blurRadius: 16,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: AppColors.goldAccent.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.goldAccent, width: 0.8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: Color(0xFF4EE3B8),
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'TODAY\'S DINING',
                      style: GoogleFonts.outfit(
                        fontSize: 10.5,
                        fontWeight: FontWeight.w800,
                        color: AppColors.goldAccent,
                        letterSpacing: 1.0,
                      ),
                    ),
                  ],
                ),
              ),
              Obx(() => Text(
                controller.selectedOutlet.value.split(' ').take(2).join(' '),
                style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[400]),
              )),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            'Today: $todayDayName',
            style: GoogleFonts.outfit(
              fontSize: 22,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: -0.3,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            todayFullDate,
            style: GoogleFonts.inter(
              fontSize: 13,
              fontWeight: FontWeight.w600,
              color: AppColors.goldAccent,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Live dining tables open today for Lunch and Dinner. Tap below to reserve instantly for 2 guests.',
            style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[300], height: 1.4),
          ),
          const SizedBox(height: 16),
          // Interactive Action: Tapping opens Step 2 defaulting to 2 guests
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: controller.selectTodayAndProceed,
              borderRadius: BorderRadius.circular(14),
              child: Ink(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFFE5A65E), Color(0xFFDF9E5B)],
                  ),
                  borderRadius: BorderRadius.circular(14),
                  boxShadow: [
                    BoxShadow(
                      color: AppColors.goldAccent.withOpacity(0.35),
                      blurRadius: 10,
                      offset: const Offset(0, 3),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.touch_app_rounded, color: Colors.black, size: 19),
                    const SizedBox(width: 8),
                    Text(
                      'Book Today (2 Guests / Couple) →',
                      style: GoogleFonts.outfit(
                        fontSize: 13.5,
                        fontWeight: FontWeight.w800,
                        color: Colors.black,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- CALENDAR DATE STRIP (30 DAYS) ---
  Widget _buildCalendarDateStrip(BuildContext context) {
    final dates = List.generate(30, (index) => DateTime.now().add(Duration(days: index)));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('OR SELECT UPCOMING DATE', style: _sectionHeaderStyle()),
            GestureDetector(
              onTap: () => controller.pickCustomDate(context),
              child: Row(
                children: [
                  const Icon(Icons.calendar_month_rounded, size: 13, color: AppColors.goldAccent),
                  const SizedBox(width: 4),
                  Text(
                    'Calendar Picker',
                    style: GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: AppColors.goldAccent),
                  ),
                ],
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        SizedBox(
          height: 88,
          child: Obx(() {
            controller.selectedBookingDay.value;
            controller.customBookingDate.value;

            return ListView(
              scrollDirection: Axis.horizontal,
              physics: const BouncingScrollPhysics(),
              children: dates.asMap().entries.map((entry) {
                final index = entry.key;
                final date = entry.value;
                final isSelected = controller.isDateSelected(date);
                final isToday = index == 0;
                final isTomorrow = index == 1;

                final dayLabel = isToday
                    ? 'TODAY'
                    : isTomorrow
                        ? 'TOM'
                        : DateFormat('EEE').format(date).toUpperCase();
                final dateNum = DateFormat('d').format(date);
                final monthStr = DateFormat('MMM').format(date).toUpperCase();

                return GestureDetector(
                  onTap: () {
                    if (isToday) {
                      controller.selectTodayAndProceed();
                    } else {
                      controller.selectDateAndProceed(date);
                    }
                  },
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 180),
                    width: 68,
                    margin: const EdgeInsets.only(right: 10),
                    padding: const EdgeInsets.symmetric(vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFF2C241B)
                          : const Color(0xFF161412),
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.goldAccent
                            : isToday
                                ? AppColors.goldAccent.withOpacity(0.5)
                                : const Color(0xFF2B251E),
                        width: isSelected ? 1.8 : 1.0,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: AppColors.goldAccent.withOpacity(0.2),
                                blurRadius: 8,
                                offset: const Offset(0, 2),
                              ),
                            ]
                          : null,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          dayLabel,
                          style: GoogleFonts.inter(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: isSelected
                                ? AppColors.goldAccent
                                : isToday
                                    ? const Color(0xFF4EE3B8)
                                    : Colors.grey[500],
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          dateNum,
                          style: GoogleFonts.outfit(
                            fontSize: 18,
                            fontWeight: FontWeight.w800,
                            color: isSelected ? Colors.white : Colors.grey[200],
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          monthStr,
                          style: GoogleFonts.inter(
                            fontSize: 9.5,
                            fontWeight: FontWeight.w600,
                            color: isSelected ? AppColors.goldAccent : Colors.grey[500],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              }).toList(),
            );
          }),
        ),
      ],
    );
  }

  // --- BRANCH / OUTLET SELECTION SECTION ("WHICH BRANCH") ---
  Widget _buildBranchSelectionSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('SELECT BRANCH / OUTLET', style: _sectionHeaderStyle()),
            Obx(() => Text(
              '${controller.outlets.length} Branches',
              style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[500]),
            )),
          ],
        ),
        const SizedBox(height: 10),
        Obx(() {
          return Column(
            children: controller.outlets.map((outlet) {
              final isSelected = controller.selectedOutlet.value == outlet;
              final meta = _getOutletMeta(outlet);

              return GestureDetector(
                onTap: () {
                  controller.selectedOutlet.value = outlet;
                  controller.loadTimeSlots();
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: isSelected ? const Color(0xFF261E14) : const Color(0xFF141312),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected ? AppColors.goldAccent : const Color(0xFF28231E),
                      width: isSelected ? 1.6 : 1.0,
                    ),
                    boxShadow: isSelected
                        ? [
                            BoxShadow(
                              color: AppColors.goldAccent.withOpacity(0.12),
                              blurRadius: 10,
                              offset: const Offset(0, 2),
                            ),
                          ]
                        : null,
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.goldAccent.withOpacity(0.2)
                              : const Color(0xFF1F1A14),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.goldAccent.withOpacity(0.4)
                                : const Color(0xFF2E271F),
                          ),
                        ),
                        child: Icon(
                          meta['icon'] as IconData,
                          color: isSelected ? AppColors.goldAccent : Colors.grey[400],
                          size: 22,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    outlet,
                                    style: GoogleFonts.outfit(
                                      fontSize: 14,
                                      fontWeight: FontWeight.w700,
                                      color: isSelected ? Colors.white : Colors.grey[200],
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: isSelected
                                        ? AppColors.goldAccent.withOpacity(0.15)
                                        : const Color(0xFF1F1C18),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    meta['tag'] as String,
                                    style: GoogleFonts.inter(
                                      fontSize: 9.5,
                                      fontWeight: FontWeight.w700,
                                      color: isSelected ? AppColors.goldAccent : Colors.grey[400],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 3),
                            Text(
                              meta['subtitle'] as String,
                              style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[400]),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        width: 22,
                        height: 22,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: isSelected ? AppColors.goldAccent : Colors.transparent,
                          border: Border.all(
                            color: isSelected ? AppColors.goldAccent : const Color(0xFF4A3E31),
                            width: 1.5,
                          ),
                        ),
                        child: isSelected
                            ? const Icon(Icons.check, size: 14, color: Colors.black)
                            : null,
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          );
        }),
      ],
    );
  }

  // =========================================================================
  // STEP 2: TABLE & GUESTS SELECTION (DEFAULTING TO 2 GUESTS / COUPLE)
  // =========================================================================
  Widget _buildStep2TableAndGuests(BuildContext context) {
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
          // Selected Summary Pill with "Change Date / Branch" button
          _buildSelectionSummaryPill(),
          const SizedBox(height: 20),

          // Guest Covers (Defaulting to 2 Covers / Couple)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('GUESTS (1 TO 19 COVERS)', style: _sectionHeaderStyle()),
              Obx(() => Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                decoration: BoxDecoration(
                  color: AppColors.goldAccent.withOpacity(0.18),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.goldAccent, width: 0.8),
                ),
                child: Text(
                  controller.guestCount.value == 2
                      ? '2 Guests (Couple)'
                      : '${controller.guestCount.value} Guests',
                  style: GoogleFonts.outfit(
                    fontSize: 12,
                    fontWeight: FontWeight.w800,
                    color: AppColors.goldAccent,
                  ),
                ),
              )),
            ],
          ),
          const SizedBox(height: 10),

          // Quick Guest Chips (with 2 Couple highlighted)
          Obx(() => SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [1, 2, 4, 6, 8, 10, 12].map((cnt) {
                final isSelected = controller.guestCount.value == cnt;
                final isCouple = cnt == 2;
                return GestureDetector(
                  onTap: () => controller.setGuestCount(cnt),
                  child: Container(
                    margin: const EdgeInsets.only(right: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 8),
                    decoration: BoxDecoration(
                      color: isSelected
                          ? const Color(0xFF2C241B)
                          : const Color(0xFF1E1A16),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: isSelected
                            ? AppColors.goldAccent
                            : isCouple
                                ? AppColors.goldAccent.withOpacity(0.4)
                                : const Color(0xFF332B22),
                        width: isSelected ? 1.6 : 1.0,
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (isCouple) ...[
                          Icon(Icons.favorite_rounded, size: 12, color: isSelected ? AppColors.goldAccent : Colors.grey[400]),
                          const SizedBox(width: 4),
                        ],
                        Text(
                          cnt == 2 ? '2 (Couple)' : cnt == 4 ? '4 (Family)' : '$cnt Pax',
                          style: GoogleFonts.outfit(
                            fontSize: 11.5,
                            fontWeight: FontWeight.w700,
                            color: isSelected ? AppColors.goldAccent : Colors.grey[300],
                          ),
                        ),
                      ],
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
          const SizedBox(height: 14),

          // Seating Area Preference
          Text('PREFERRED SEATING AREA', style: _sectionHeaderStyle()),
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

          // Time Slots (Categorized by Lunch & Dinner)
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('TIME SLOT', style: _sectionHeaderStyle()),
              Obx(() => Text(
                'Date: ${controller.selectedBookingDay.value}',
                style: GoogleFonts.inter(fontSize: 10, color: AppColors.goldAccent, fontWeight: FontWeight.w600),
              )),
            ],
          ),
          const SizedBox(height: 8),
          Obx(() {
            final allAvailableSlots = controller.timeSlots.where((s) => controller.isSlotBookable(s)).toList();
            final lunchSlots = allAvailableSlots.where((s) {
              return s.contains('AM') ||
                  s.startsWith('12:') ||
                  s.startsWith('1:') || s.startsWith('01:') ||
                  s.startsWith('2:') || s.startsWith('02:') ||
                  s.startsWith('3:') || s.startsWith('03:') ||
                  s.startsWith('4:') || s.startsWith('04:');
            }).toList();
            final dinnerSlots = allAvailableSlots.where((s) => !lunchSlots.contains(s)).toList();

            // Auto-select valid slot if current selected slot is not available
            if (!controller.isSlotBookable(controller.selectedTimeSlot.value) && allAvailableSlots.isNotEmpty) {
              WidgetsBinding.instance.addPostFrameCallback((_) {
                controller.selectedTimeSlot.value = allAvailableSlots.first;
              });
            }

            if (allAvailableSlots.isEmpty) {
              return Container(
                width: double.infinity,
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: const Color(0xFF1B1612),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF33251A)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline_rounded, color: AppColors.goldAccent, size: 20),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'All table slots for today have closed. Please select Tomorrow or another date.',
                        style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[300], height: 1.4),
                      ),
                    ),
                  ],
                ),
              );
            }

            return Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (lunchSlots.isNotEmpty) ...[
                  Text(
                    'LUNCH (12:00 PM – 3:30 PM)',
                    style: GoogleFonts.outfit(fontSize: 10.5, fontWeight: FontWeight.w700, color: Colors.grey[400], letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 8),
                  _buildSlotGrid(lunchSlots),
                  const SizedBox(height: 14),
                ],
                if (dinnerSlots.isNotEmpty) ...[
                  Text(
                    'DINNER (7:00 PM – 10:30 PM)',
                    style: GoogleFonts.outfit(fontSize: 10.5, fontWeight: FontWeight.w700, color: Colors.grey[400], letterSpacing: 0.5),
                  ),
                  const SizedBox(height: 8),
                  _buildSlotGrid(dinnerSlots),
                ],
              ],
            );
          }),
          const SizedBox(height: 18),

          // Dining Occasion
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

          // Special Table Requests
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
          const SizedBox(height: 12),

          // Secondary Back Button
          Center(
            child: TextButton.icon(
              onPressed: () => controller.goToStep1(),
              icon: const Icon(Icons.arrow_back_rounded, size: 14, color: Colors.grey),
              label: Text(
                'Change Date or Branch',
                style: GoogleFonts.outfit(fontSize: 12, color: Colors.grey[400], fontWeight: FontWeight.w600),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- SELECTION SUMMARY PILL (STEP 2 HEADER) ---
  Widget _buildSelectionSummaryPill() {
    return Obx(() {
      final dateText = controller.formattedSelectedDateText;
      final outletName = controller.selectedOutlet.value;

      return Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: const Color(0xFF1E1A16),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: AppColors.goldAccent.withOpacity(0.4)),
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.goldAccent.withOpacity(0.15),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.event_available_rounded, color: AppColors.goldAccent, size: 20),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    dateText,
                    style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w700, color: Colors.white),
                  ),
                  const SizedBox(height: 1),
                  Text(
                    outletName,
                    style: GoogleFonts.inter(fontSize: 11, color: AppColors.goldAccent),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            TextButton(
              onPressed: () => controller.goToStep1(),
              style: TextButton.styleFrom(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                minimumSize: Size.zero,
                tapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              child: Text(
                'Change',
                style: GoogleFonts.outfit(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: AppColors.goldAccent,
                ),
              ),
            ),
          ],
        ),
      );
    });
  }

  // --- TIME SLOT GRID ---
  Widget _buildSlotGrid(List<String> slots) {
    if (slots.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Text(
          'No available slots for this session today',
          style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[500], fontStyle: FontStyle.italic),
        ),
      );
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        final itemWidth = ((constraints.maxWidth - 16) / 3).floorToDouble();

        return Wrap(
          spacing: 8,
          runSpacing: 8,
          children: slots.map((slot) {
            final isSelected = controller.selectedTimeSlot.value == slot;

            return GestureDetector(
              onTap: () => controller.selectedTimeSlot.value = slot,
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                width: itemWidth,
                padding: const EdgeInsets.symmetric(vertical: 11),
                decoration: BoxDecoration(
                  color: isSelected
                      ? const Color(0xFF2C241B)
                      : const Color(0xFF1E1A16),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isSelected
                        ? AppColors.goldAccent
                        : const Color(0xFF332B22),
                    width: isSelected ? 1.6 : 1.0,
                  ),
                  boxShadow: isSelected
                      ? [
                          BoxShadow(
                            color: AppColors.goldAccent.withOpacity(0.2),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ]
                      : null,
                ),
                child: Center(
                  child: Text(
                    slot,
                    style: GoogleFonts.outfit(
                      fontSize: 12.5,
                      fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                      color: isSelected ? AppColors.goldAccent : Colors.grey[200],
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        );
      },
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
            onPressed: () => Get.toNamed(AppRoutes.BANQUET),
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

  // --- OUTLET METADATA HELPER ---
  Map<String, dynamic> _getOutletMeta(String name) {
    if (name.contains('Bodakdev')) {
      return {
        'subtitle': 'Bodakdev, Ahmedabad • Open 12:00 PM – 11:00 PM',
        'tag': 'Flagship Sizzlers',
        'icon': Icons.restaurant_rounded,
      };
    } else if (name.contains('SG Highway')) {
      return {
        'subtitle': 'SG Highway, Ahmedabad • Open 12:00 PM – 11:00 PM',
        'tag': 'Fine Dine & Sizzlers',
        'icon': Icons.outdoor_grill_rounded,
      };
    } else if (name.contains('Dough')) {
      return {
        'subtitle': 'CG Road, Ahmedabad • Open 10:00 AM – 11:30 PM',
        'tag': 'Bakery, Cafe & Bistro',
        'icon': Icons.bakery_dining_rounded,
      };
    } else if (name.contains('Banquet')) {
      return {
        'subtitle': 'Bopal, Ahmedabad • Open 11:00 AM – 11:00 PM',
        'tag': 'Grand Banquets & Lawns',
        'icon': Icons.celebration_rounded,
      };
    }
    return {
      'subtitle': 'Ahmedabad • Open 12:00 PM – 11:00 PM',
      'tag': 'Dining Outlet',
      'icon': Icons.storefront_rounded,
    };
  }

  TextStyle _sectionHeaderStyle() {
    return GoogleFonts.outfit(
      fontSize: 11,
      fontWeight: FontWeight.w700,
      color: Colors.grey[400],
      letterSpacing: 0.8,
    );
  }
}
