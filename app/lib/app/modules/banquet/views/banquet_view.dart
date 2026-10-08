import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../controllers/banquet_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../widgets/sizzlo_button.dart';
import '../../../data/models/banquet_inquiry_model.dart';

class BanquetView extends GetView<BanquetController> {
  const BanquetView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0908),
      appBar: AppBar(
        title: Text(
          'Banquet & ODC Desk',
          style: GoogleFonts.outfit(fontSize: 20, fontWeight: FontWeight.w700, color: Colors.white),
        ),
        centerTitle: true,
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
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
            // Top Tab Selector: Banquet vs ODC
            _buildTabSelector(),
            const SizedBox(height: 20),

            // Tab Content
            Obx(() {
              if (controller.activeTab.value == 0) {
                return _buildBanquetTabContent(context);
              } else {
                return _buildOdcTabContent(context);
              }
            }),

            const SizedBox(height: 30),

            // My Submitted Inquiries Section
            _buildMyInquiriesSection(),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  // --- TOP TAB SELECTOR ---
  Widget _buildTabSelector() {
    return Container(
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
              final isSelected = controller.activeTab.value == 0;
              return GestureDetector(
                onTap: () => controller.activeTab.value = 0,
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
                      Icon(
                        Icons.apartment_rounded,
                        size: 16,
                        color: isSelected ? AppColors.goldAccent : Colors.grey,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Banquet Halls',
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? AppColors.goldAccent : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
          Expanded(
            child: Obx(() {
              final isSelected = controller.activeTab.value == 1;
              return GestureDetector(
                onTap: () => controller.activeTab.value = 1,
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
                      Icon(
                        Icons.deck_rounded,
                        size: 16,
                        color: isSelected ? AppColors.goldAccent : Colors.grey,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Outdoor Catering (ODC)',
                        style: GoogleFonts.outfit(
                          fontSize: 13,
                          fontWeight: FontWeight.w700,
                          color: isSelected ? AppColors.goldAccent : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }

  // --- TAB 1: BANQUET HALLS CONTENT ---
  Widget _buildBanquetTabContent(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Hero Header Card
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF24190E), Color(0xFF141312)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFF4A341A)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.goldAccent.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: AppColors.goldAccent.withOpacity(0.3)),
                ),
                child: const Icon(Icons.celebration_rounded, color: AppColors.goldAccent, size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'House of Yanki Banquets',
                      style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'Parties & events for 20 to 500+ guests. Full AC, audio-visual stage, and signature sizzler buffets.',
                      style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[400], height: 1.3),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Strict Compliance Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF1F1810),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF423018)),
          ),
          child: Row(
            children: [
              const Icon(Icons.verified_user_rounded, color: AppColors.goldAccent, size: 16),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  'Banquet bookings qualify for tier dining card rate discounts (up to 20% for Elite) with zero points liability.',
                  style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFDCCDB7), height: 1.3),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Main Banquet Form Container
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF141312),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF262320)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Contact Details
              Text('CONTACT DETAILS', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: controller.banquetNameController,
                      hint: 'Your Name',
                      icon: Icons.person_outline_rounded,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildTextField(
                      controller: controller.banquetPhoneController,
                      hint: 'Mobile Number',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Preferred Banquet Venue
              Text('PREFERRED BANQUET VENUE', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              Obx(() => Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: _fieldBoxDecoration(),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: controller.banquetVenues.contains(controller.selectedBanquetVenue.value)
                        ? controller.selectedBanquetVenue.value
                        : controller.banquetVenues.first,
                    dropdownColor: const Color(0xFF1E1A16),
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.goldAccent),
                    items: controller.banquetVenues.map((v) => DropdownMenuItem(
                      value: v,
                      child: Text(v, style: GoogleFonts.outfit(fontSize: 13, color: Colors.white)),
                    )).toList(),
                    onChanged: (val) {
                      if (val != null) controller.selectedBanquetVenue.value = val;
                    },
                  ),
                ),
              )),
              const SizedBox(height: 16),

              // Occasion Type
              Text('OCCASION TYPE', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              Obx(() => Wrap(
                spacing: 8,
                runSpacing: 8,
                children: controller.occasionOptions.map((occ) {
                  final isSelected = controller.selectedOccasion.value == occ;
                  return GestureDetector(
                    onTap: () => controller.selectedOccasion.value = occ,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF2C241B) : const Color(0xFF1E1A16),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? AppColors.goldAccent : const Color(0xFF332B22),
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Text(
                        occ,
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isSelected ? AppColors.goldAccent : Colors.grey[400],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              )),
              const SizedBox(height: 16),

              // Event Date & Session / Shift
              Row(
                children: [
                  // Date Picker
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('TARGET DATE', style: _fieldSectionStyle()),
                        const SizedBox(height: 8),
                        Obx(() => GestureDetector(
                          onTap: () => controller.pickDate(context, false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            decoration: _fieldBoxDecoration(),
                            child: Row(
                              children: [
                                const Icon(Icons.calendar_today_rounded, size: 14, color: AppColors.goldAccent),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    DateFormat('dd MMM yyyy').format(controller.banquetDate.value),
                                    style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Shift
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('SESSION / SHIFT', style: _fieldSectionStyle()),
                        const SizedBox(height: 8),
                        Obx(() => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: _fieldBoxDecoration(),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: controller.shiftOptions.contains(controller.banquetShift.value)
                                  ? controller.banquetShift.value
                                  : controller.shiftOptions.first,
                              dropdownColor: const Color(0xFF1E1A16),
                              isExpanded: true,
                              icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.goldAccent, size: 18),
                              items: controller.shiftOptions.map((s) => DropdownMenuItem(
                                value: s,
                                child: Text(s, style: GoogleFonts.outfit(fontSize: 12, color: Colors.white)),
                              )).toList(),
                              onChanged: (val) {
                                if (val != null) controller.banquetShift.value = val;
                              },
                            ),
                          ),
                        )),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Estimated Guests (Pax)
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('ESTIMATED GUESTS (PAX)', style: _fieldSectionStyle()),
                  Obx(() => Text(
                    '${controller.banquetPax.value} Guests',
                    style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800, color: AppColors.goldAccent),
                  )),
                ],
              ),
              const SizedBox(height: 8),
              Obx(() => SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: controller.banquetPaxPresets.map((pax) {
                    final isSelected = controller.banquetPax.value == pax;
                    return GestureDetector(
                      onTap: () => controller.banquetPax.value = pax,
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF2C241B) : const Color(0xFF1E1A16),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? AppColors.goldAccent : const Color(0xFF332B22),
                          ),
                        ),
                        child: Text(
                          '$pax Pax',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isSelected ? AppColors.goldAccent : Colors.grey[400],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              )),
              Obx(() {
                if (controller.banquetPax.value >= 300) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      '★ 300+ Guests: Qualifies for Elite Tier 20% Banquet Catering Privilege',
                      style: GoogleFonts.inter(fontSize: 11, fontWeight: FontWeight.w600, color: const Color(0xFF4EE3B8)),
                    ),
                  );
                }
                return const SizedBox.shrink();
              }),
              const SizedBox(height: 16),

              // Catering / Buffet Package
              Text('CATERING & BUFFET PACKAGE', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              Obx(() => Container(
                padding: const EdgeInsets.symmetric(horizontal: 14),
                decoration: _fieldBoxDecoration(),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: controller.packageOptions.contains(controller.banquetPackage.value)
                        ? controller.banquetPackage.value
                        : controller.packageOptions.first,
                    dropdownColor: const Color(0xFF1E1A16),
                    isExpanded: true,
                    icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.goldAccent),
                    items: controller.packageOptions.map((pkg) => DropdownMenuItem(
                      value: pkg,
                      child: Text(pkg, style: GoogleFonts.outfit(fontSize: 12, color: Colors.white)),
                    )).toList(),
                    onChanged: (val) {
                      if (val != null) controller.banquetPackage.value = val;
                    },
                  ),
                ),
              )),
              const SizedBox(height: 16),

              // Special Requirements / AV Notes
              Text('SPECIAL SETUP / AV REQUIREMENTS', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              TextField(
                controller: controller.banquetNotesController,
                maxLines: 2,
                style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'e.g., Live sizzler counters, projector stage, floral decoration, DJ...',
                  hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey[700]),
                  filled: true,
                  fillColor: const Color(0xFF1E1A16),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.goldAccent)),
                ),
              ),
              const SizedBox(height: 22),

              // Submit Button
              Obx(() => SizzloButton(
                text: controller.isSubmitting.value ? 'Dispatching Inquiry...' : 'Submit Banquet Hall Inquiry',
                isLoading: controller.isSubmitting.value,
                onPressed: controller.submitBanquetInquiry,
              )),
            ],
          ),
        ),
      ],
    );
  }

  // --- TAB 2: OUTDOOR CATERING (ODC) CONTENT ---
  Widget _buildOdcTabContent(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Hero Header Card for ODC
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF1A2B23), Color(0xFF141312)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(18),
            border: Border.all(color: const Color(0xFF285442)),
          ),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: const Color(0xFF4EE3B8).withOpacity(0.15),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF4EE3B8).withOpacity(0.3)),
                ),
                child: const Icon(Icons.deck_rounded, color: Color(0xFF4EE3B8), size: 28),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Outdoor Catering (ODC)',
                      style: GoogleFonts.outfit(fontSize: 16, fontWeight: FontWeight.w800, color: Colors.white),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      'We bring the live sizzle to your lawn, farmhouse, private terrace, or corporate venue across Gujarat.',
                      style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[400], height: 1.3),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 18),

        // Main ODC Form Container
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: const Color(0xFF141312),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF262320)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Contact Details
              Text('ORGANIZER CONTACT', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: _buildTextField(
                      controller: controller.odcNameController,
                      hint: 'Contact Name',
                      icon: Icons.person_outline_rounded,
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: _buildTextField(
                      controller: controller.odcPhoneController,
                      hint: 'Phone Number',
                      icon: Icons.phone_outlined,
                      keyboardType: TextInputType.phone,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // City & Lawn / Farm Venue
              Row(
                children: [
                  // City
                  Expanded(
                    flex: 4,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('CITY / REGION', style: _fieldSectionStyle()),
                        const SizedBox(height: 8),
                        Obx(() => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10),
                          decoration: _fieldBoxDecoration(),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: controller.cityOptions.contains(controller.odcCity.value)
                                  ? controller.odcCity.value
                                  : controller.cityOptions.first,
                              dropdownColor: const Color(0xFF1E1A16),
                              isExpanded: true,
                              icon: const Icon(Icons.keyboard_arrow_down, color: AppColors.goldAccent, size: 18),
                              items: controller.cityOptions.map((c) => DropdownMenuItem(
                                value: c,
                                child: Text(c, style: GoogleFonts.outfit(fontSize: 12, color: Colors.white)),
                              )).toList(),
                              onChanged: (val) {
                                if (val != null) controller.odcCity.value = val;
                              },
                            ),
                          ),
                        )),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Venue Name / Lawn Address
                  Expanded(
                    flex: 6,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('VENUE / LAWN ADDRESS', style: _fieldSectionStyle()),
                        const SizedBox(height: 8),
                        _buildTextField(
                          controller: controller.odcVenueLocationController,
                          hint: 'e.g. Rancharda Farm, SG Hwy',
                          icon: Icons.location_on_outlined,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Event Date & Shift
              Row(
                children: [
                  // Date
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('EVENT DATE', style: _fieldSectionStyle()),
                        const SizedBox(height: 8),
                        Obx(() => GestureDetector(
                          onTap: () => controller.pickDate(context, true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                            decoration: _fieldBoxDecoration(),
                            child: Row(
                              children: [
                                const Icon(Icons.calendar_today_rounded, size: 14, color: Color(0xFF4EE3B8)),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(
                                    DateFormat('dd MMM yyyy').format(controller.odcDate.value),
                                    style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.white),
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )),
                      ],
                    ),
                  ),
                  const SizedBox(width: 10),

                  // Shift
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('TIMING / SHIFT', style: _fieldSectionStyle()),
                        const SizedBox(height: 8),
                        Obx(() => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12),
                          decoration: _fieldBoxDecoration(),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              value: controller.odcShiftOptions.contains(controller.odcShift.value)
                                  ? controller.odcShift.value
                                  : controller.odcShiftOptions.first,
                              dropdownColor: const Color(0xFF1E1A16),
                              isExpanded: true,
                              icon: const Icon(Icons.keyboard_arrow_down, color: Color(0xFF4EE3B8), size: 18),
                              items: controller.odcShiftOptions.map((s) => DropdownMenuItem(
                                value: s,
                                child: Text(s, style: GoogleFonts.outfit(fontSize: 12, color: Colors.white)),
                              )).toList(),
                              onChanged: (val) {
                                if (val != null) controller.odcShift.value = val;
                              },
                            ),
                          ),
                        )),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Estimated Guests
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('ESTIMATED GUESTS', style: _fieldSectionStyle()),
                  Obx(() => Text(
                    '${controller.odcPax.value} Guests',
                    style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w800, color: const Color(0xFF4EE3B8)),
                  )),
                ],
              ),
              const SizedBox(height: 8),
              Obx(() => SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: controller.odcPaxPresets.map((pax) {
                    final isSelected = controller.odcPax.value == pax;
                    return GestureDetector(
                      onTap: () => controller.odcPax.value = pax,
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF143328) : const Color(0xFF1E1A16),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: isSelected ? const Color(0xFF4EE3B8) : const Color(0xFF332B22),
                          ),
                        ),
                        child: Text(
                          '$pax Guests',
                          style: GoogleFonts.outfit(
                            fontSize: 12,
                            fontWeight: FontWeight.w700,
                            color: isSelected ? const Color(0xFF4EE3B8) : Colors.grey[400],
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              )),
              const SizedBox(height: 16),

              // Live Counter Stations
              Text('LIVE STATIONS & ATTRACTIONS', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              Obx(() => Wrap(
                spacing: 8,
                runSpacing: 8,
                children: controller.availableLiveStations.map((station) {
                  final isSelected = controller.selectedLiveStations.contains(station);
                  return GestureDetector(
                    onTap: () => controller.toggleLiveStation(station),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF143328) : const Color(0xFF1E1A16),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF4EE3B8) : const Color(0xFF332B22),
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            isSelected ? Icons.check_circle_rounded : Icons.add_circle_outline_rounded,
                            size: 14,
                            color: isSelected ? const Color(0xFF4EE3B8) : Colors.grey[600],
                          ),
                          const SizedBox(width: 6),
                          Text(
                            station,
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w600,
                              color: isSelected ? const Color(0xFF4EE3B8) : Colors.grey[400],
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              )),
              const SizedBox(height: 16),

              // Catering Requirements Notes
              Text('CUSTOM MENU / LOGISTICS NOTES', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              TextField(
                controller: controller.odcNotesController,
                maxLines: 2,
                style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'e.g., Jain sizzler section, live chef team size, crockery & service setup...',
                  hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey[700]),
                  filled: true,
                  fillColor: const Color(0xFF1E1A16),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF4EE3B8))),
                ),
              ),
              const SizedBox(height: 22),

              // Submit Button
              Obx(() => SizzloButton(
                text: controller.isSubmitting.value ? 'Dispatching Inquiry...' : 'Submit ODC Catering Inquiry',
                isLoading: controller.isSubmitting.value,
                onPressed: controller.submitOdcInquiry,
              )),
            ],
          ),
        ),
      ],
    );
  }

  // --- MY SUBMITTED INQUIRIES SECTION ---
  Widget _buildMyInquiriesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              'MY EVENT INQUIRIES',
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: AppColors.goldAccent,
                letterSpacing: 1.2,
              ),
            ),
            IconButton(
              icon: const Icon(Icons.refresh_rounded, size: 16, color: Colors.grey),
              onPressed: controller.loadMyInquiries,
            ),
          ],
        ),
        const SizedBox(height: 8),
        Obx(() {
          if (controller.isLoadingInquiries.value) {
            return const Center(child: Padding(
              padding: EdgeInsets.all(20.0),
              child: CircularProgressIndicator(color: AppColors.goldAccent),
            ));
          }
          if (controller.myInquiries.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF141312),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF262320)),
              ),
              child: Center(
                child: Text(
                  'No banquet or ODC inquiries submitted yet.\nYour submitted inquiries will appear here.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 12, height: 1.4),
                ),
              ),
            );
          }
          return Column(
            children: controller.myInquiries.map((inq) => _buildInquiryCard(inq)).toList(),
          );
        }),
      ],
    );
  }

  Widget _buildInquiryCard(BanquetInquiryModel inq) {
    Color statusColor;
    switch (inq.status.toUpperCase()) {
      case 'CONFIRMED':
        statusColor = const Color(0xFF10B981);
        break;
      case 'ASSIGNED':
      case 'IN_PROGRESS':
        statusColor = const Color(0xFF3B82F6);
        break;
      case 'CLOSED':
        statusColor = Colors.grey;
        break;
      default:
        statusColor = const Color(0xFFFF9800);
    }

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
                  inq.eventCategory,
                  style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.15),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: statusColor.withOpacity(0.4)),
                ),
                child: Text(
                  inq.status.toUpperCase(),
                  style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w800, color: statusColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.calendar_today_rounded, size: 12, color: Colors.grey),
              const SizedBox(width: 5),
              Text(
                '${inq.eventDate} · ${inq.eventShift}',
                style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400]),
              ),
              const Spacer(),
              const Icon(Icons.people_outline_rounded, size: 13, color: AppColors.goldAccent),
              const SizedBox(width: 4),
              Text(
                '${inq.estimatedPax} Guests',
                style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: AppColors.goldAccent),
              ),
            ],
          ),
          if (inq.assignedTo != null && inq.assignedTo!.isNotEmpty) ...[
            const SizedBox(height: 6),
            Row(
              children: [
                const Icon(Icons.support_agent_rounded, size: 13, color: Color(0xFF3B82F6)),
                const SizedBox(width: 5),
                Text(
                  'Assigned to: ${inq.assignedTo}',
                  style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF3B82F6), fontWeight: FontWeight.w600),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }

  // --- STYLING HELPERS ---
  TextStyle _fieldSectionStyle() {
    return GoogleFonts.outfit(fontSize: 11, fontWeight: FontWeight.w700, color: Colors.grey[400], letterSpacing: 0.8);
  }

  BoxDecoration _fieldBoxDecoration() {
    return BoxDecoration(
      color: const Color(0xFF1E1A16),
      borderRadius: BorderRadius.circular(12),
      border: Border.all(color: const Color(0xFF332B22)),
    );
  }

  Widget _buildTextField({
    required TextEditingController controller,
    required String hint,
    required IconData icon,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      keyboardType: keyboardType,
      style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600]),
        prefixIcon: Icon(icon, size: 16, color: Colors.grey[500]),
        filled: true,
        fillColor: const Color(0xFF1E1A16),
        contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
        enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppColors.goldAccent)),
      ),
    );
  }
}
