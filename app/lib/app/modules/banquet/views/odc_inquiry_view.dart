import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../controllers/banquet_controller.dart';
import '../../../widgets/sizzlo_button.dart';
import '../../../data/models/banquet_inquiry_model.dart';

class OdcInquiryView extends GetView<BanquetController> {
  const OdcInquiryView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0908),
      appBar: AppBar(
        title: Text(
          'Outdoor Catering (ODC) Desk',
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
      body: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
          physics: const BouncingScrollPhysics(),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Dedicated ODC Content
              _buildOdcContent(context),
              const SizedBox(height: 30),

              // My Submitted Inquiries Section
              _buildMyInquiriesSection(),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  // --- OUTDOOR CATERING (ODC) CONTENT ---
  Widget _buildOdcContent(BuildContext context) {
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
                      'Catering at your farmhouse, lawn, residence, or venue. Live sizzler setup, premium live counters & service staff.',
                      style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[400], height: 1.3),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Value props badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF4EE3B8).withOpacity(0.08),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF4EE3B8).withOpacity(0.3)),
          ),
          child: Row(
            children: [
              const Icon(Icons.verified_rounded, color: Color(0xFF4EE3B8), size: 16),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'End-to-end event catering with our signature sizzlers, chin-ware, chafing dish counters, and expert chef teams.',
                  style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFFB4EBD8), height: 1.3),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 14),

        // Guaranteed 24-Hour Callback Badge
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
          decoration: BoxDecoration(
            color: const Color(0xFF122E22).withOpacity(0.5),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFF1E523D)),
          ),
          child: Row(
            children: [
              const Icon(Icons.access_time_filled_rounded, color: Color(0xFF4EE3B8), size: 16),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Guaranteed Callback: Our ODC catering manager will reach out to you within 24 hours of inquiry submission.',
                  style: GoogleFonts.inter(fontSize: 11, color: const Color(0xFF9AE6B4), height: 1.3),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Form Container
        Container(
          padding: const EdgeInsets.all(18),
          decoration: BoxDecoration(
            color: const Color(0xFF141312),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF262320)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Contact Details (Stacked vertically to prevent clipping)
              Text('CONTACT DETAILS', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              _buildTextField(
                controller: controller.odcNameController,
                hint: 'Full Name',
                icon: Icons.person_outline,
              ),
              const SizedBox(height: 10),
              _buildTextField(
                controller: controller.odcPhoneController,
                hint: 'Mobile Number',
                icon: Icons.phone_outlined,
                keyboardType: TextInputType.phone,
              ),
              const SizedBox(height: 16),

              // Event Name
              Text('EVENT NAME', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              _buildTextField(
                controller: controller.odcEventNameController,
                hint: 'e.g. Bansi & Rahul Sangeet, Annual Family Reunion',
                icon: Icons.celebration_outlined,
              ),
              const SizedBox(height: 16),

              // Full-Width Venue / Lawn Address
              Text('VENUE / LAWN ADDRESS', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              _buildTextField(
                controller: controller.odcVenueLocationController,
                hint: 'e.g. Rancharda Farmhouse, Sindhu Bhavan Road, Bodakdev',
                icon: Icons.location_on_outlined,
              ),
              const SizedBox(height: 16),

              // Occasion Type
              Text('CATERING OCCASION', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              Obx(() => Wrap(
                spacing: 8,
                runSpacing: 8,
                children: controller.odcOccasionOptions.map((occ) {
                  final isSelected = controller.odcOccasion.value == occ;
                  return GestureDetector(
                    onTap: () => controller.odcOccasion.value = occ,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF1E382B) : const Color(0xFF1C1917),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF4EE3B8) : const Color(0xFF332B22),
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Text(
                        occ,
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? const Color(0xFF4EE3B8) : Colors.grey[400],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              )),
              // Custom Occasion Textfield if 'Other' is picked
              Obx(() {
                if (controller.odcOccasion.value == 'Other') {
                  return Padding(
                    padding: const EdgeInsets.only(top: 10),
                    child: _buildTextField(
                      controller: controller.odcCustomOccasionController,
                      hint: 'Specify your event occasion (e.g. Farewell, Reunion)',
                      icon: Icons.edit_note_rounded,
                    ),
                  );
                }
                return const SizedBox.shrink();
              }),
              const SizedBox(height: 16),

              // Target Event Date (Full-width clean calendar picker)
              Text('TARGET EVENT DATE', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: () => controller.pickDate(context, true),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
                  decoration: _fieldBoxDecoration(),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today_rounded, size: 16, color: Color(0xFF4EE3B8)),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Obx(() => Text(
                          DateFormat('EEEE, d MMMM y').format(controller.odcDate.value),
                          style: GoogleFonts.outfit(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                        )),
                      ),
                      const Icon(Icons.edit_calendar_rounded, size: 16, color: Color(0xFF4EE3B8)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),

              // Estimated Guests PAX
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('ESTIMATED GUESTS (PAX)', style: _fieldSectionStyle()),
                  Obx(() => Text(
                    '${controller.odcPax.value} Guests',
                    style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w800, color: const Color(0xFF4EE3B8)),
                  )),
                ],
              ),
              const SizedBox(height: 8),
              // Wrapped Pax Chips
              Obx(() => Wrap(
                spacing: 8,
                runSpacing: 8,
                children: controller.odcPaxPresets.map((pax) {
                  final isSelected = controller.odcPax.value == pax;
                  return GestureDetector(
                    onTap: () {
                      controller.odcPax.value = pax;
                      controller.odcPaxTextController.text = pax.toString();
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF1E382B) : const Color(0xFF1C1917),
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF4EE3B8) : const Color(0xFF332B22),
                          width: isSelected ? 1.5 : 1,
                        ),
                      ),
                      child: Text(
                        '$pax Pax',
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                          color: isSelected ? const Color(0xFF4EE3B8) : Colors.grey[400],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              )),
              const SizedBox(height: 8),
              // Exact numeric guest input
              _buildTextField(
                controller: controller.odcPaxTextController,
                hint: 'Or enter exact guest count (e.g. 125, 350)',
                icon: Icons.people_outline_rounded,
                keyboardType: TextInputType.number,
              ),
              const SizedBox(height: 16),


              // Special Requirements / Dietary Requests
              Text('SPECIAL SETUP / LAWN REQUIREMENTS', style: _fieldSectionStyle()),
              const SizedBox(height: 8),
              TextField(
                controller: controller.odcNotesController,
                maxLines: 3,
                style: GoogleFonts.inter(fontSize: 13, color: Colors.white),
                decoration: InputDecoration(
                  hintText: 'e.g., Live sizzler stations on farmhouse lawn, sound setup, chafing warmers, customized mocktail bar...',
                  hintStyle: GoogleFonts.inter(fontSize: 12, color: Colors.grey[600]),
                  filled: true,
                  fillColor: const Color(0xFF1E1A16),
                  contentPadding: const EdgeInsets.all(12),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF332B22))),
                  focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF4EE3B8))),
                ),
              ),
              const SizedBox(height: 24),

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
              'MY ODC INQUIRIES',
              style: GoogleFonts.outfit(
                fontSize: 12,
                fontWeight: FontWeight.w700,
                color: const Color(0xFF4EE3B8),
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
            return const Center(
              child: Padding(
                padding: EdgeInsets.all(20.0),
                child: CircularProgressIndicator(color: Color(0xFF4EE3B8)),
              ),
            );
          }
          final odcInquiries = controller.myInquiries.where((i) => i.eventCategory.contains('ODC') || i.eventCategory.contains('Outdoor')).toList();
          if (odcInquiries.isEmpty) {
            return Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF141312),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF262320)),
              ),
              child: Center(
                child: Text(
                  'No ODC inquiries submitted yet.\nYour submitted outdoor catering inquiries will appear here.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.inter(color: Colors.grey[500], fontSize: 12, height: 1.4),
                ),
              ),
            );
          }
          return ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: odcInquiries.length,
            separatorBuilder: (_, __) => const SizedBox(height: 10),
            itemBuilder: (context, index) {
              final inquiry = odcInquiries[index];
              return _buildInquiryCard(inquiry);
            },
          );
        }),
      ],
    );
  }

  Widget _buildInquiryCard(BanquetInquiryModel inquiry) {
    Color statusColor = const Color(0xFF4EE3B8);
    if (inquiry.status == 'PENDING') statusColor = Colors.orangeAccent;
    if (inquiry.status == 'CONFIRMED') statusColor = Colors.greenAccent;
    if (inquiry.status == 'CANCELLED') statusColor = Colors.redAccent;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF141312),
        borderRadius: BorderRadius.circular(14),
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
                  inquiry.eventCategory,
                  style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w700, color: Colors.white),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.12),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: statusColor.withOpacity(0.3)),
                ),
                child: Text(
                  inquiry.status,
                  style: GoogleFonts.inter(fontSize: 10, fontWeight: FontWeight.w700, color: statusColor),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Row(
            children: [
              const Icon(Icons.calendar_today_rounded, size: 12, color: Colors.grey),
              const SizedBox(width: 6),
              Text(
                '${inquiry.eventDate} (${inquiry.eventShift})',
                style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[400]),
              ),
              const SizedBox(width: 14),
              const Icon(Icons.people_alt_rounded, size: 12, color: Colors.grey),
              const SizedBox(width: 6),
              Text(
                '${inquiry.estimatedPax} Guests',
                style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[400]),
              ),
            ],
          ),
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
        focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF4EE3B8))),
      ),
    );
  }
}
