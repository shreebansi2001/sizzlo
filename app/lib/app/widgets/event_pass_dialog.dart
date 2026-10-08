import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:qr_flutter/qr_flutter.dart';
import '../core/theme/app_colors.dart';
import '../data/models/dining_event_model.dart';

class EventPassDialog extends StatelessWidget {
  final DiningEventBookingModel booking;
  final DiningEventModel? event;

  const EventPassDialog({
    Key? key,
    required this.booking,
    this.event,
  }) : super(key: key);

  static void show(BuildContext context, {
    required DiningEventBookingModel booking,
    DiningEventModel? event,
  }) {
    showGeneralDialog(
      context: context,
      barrierDismissible: true,
      barrierLabel: 'EventPass',
      barrierColor: Colors.black.withOpacity(0.85),
      transitionDuration: const Duration(milliseconds: 300),
      pageBuilder: (_, __, ___) => Center(
        child: EventPassDialog(booking: booking, event: event),
      ),
      transitionBuilder: (_, anim, __, child) => Transform.scale(
        scale: 0.9 + (0.1 * anim.value),
        child: Opacity(opacity: anim.value, child: child),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final title = event?.title.isNotEmpty == true ? event!.title : booking.eventTitle;
    final outlet = event?.outletName ?? 'Yanki Sizzlers';
    final timings = event?.timings ?? '12:00 PM – 04:00 PM';
    final day = event?.eventDay ?? 'Event Date';

    return Material(
      color: Colors.transparent,
      child: Container(
        width: MediaQuery.of(context).size.width * 0.88,
        constraints: const BoxConstraints(maxWidth: 390),
        margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
        decoration: BoxDecoration(
          color: const Color(0xFF141716),
          borderRadius: BorderRadius.circular(24),
          border: Border.all(color: AppColors.gold.withOpacity(0.4), width: 1.5),
          boxShadow: [
            BoxShadow(
              color: AppColors.gold.withOpacity(0.18),
              blurRadius: 30,
              spreadRadius: 2,
            ),
          ],
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Ticket Header Banner
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF281C10), Color(0xFF1B140B)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: const BorderRadius.vertical(top: Radius.circular(22)),
                  border: Border(bottom: BorderSide(color: AppColors.gold.withOpacity(0.2))),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(7),
                      decoration: BoxDecoration(
                        color: AppColors.gold.withOpacity(0.15),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.confirmation_num_rounded, color: AppColors.gold, size: 20),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'OFFICIAL EVENT PASS',
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 1.2,
                              color: AppColors.gold,
                            ),
                          ),
                          Text(
                            'House of Yanki Privileges',
                            style: GoogleFonts.inter(fontSize: 10, color: Colors.white54),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      icon: const Icon(Icons.close_rounded, color: Colors.white60, size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onPressed: () => Get.back(),
                    ),
                  ],
                ),
              ),

              Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Event Title
                    Text(
                      title,
                      textAlign: TextAlign.center,
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 19,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                        letterSpacing: 0.3,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0F2E25),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF249673).withOpacity(0.4)),
                      ),
                      child: Text(
                        'ADMIT ${booking.guestCount} GUEST${booking.guestCount > 1 ? 'S' : ''} • RESERVED',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: const Color(0xFF4EE3B8),
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),

                    // QR Code Box
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.3),
                            blurRadius: 10,
                          ),
                        ],
                      ),
                      child: QrImageView(
                        data: 'SIZZLO:${booking.bookingReference}:${booking.customerMobile}',
                        version: QrVersions.auto,
                        size: 130.0,
                        backgroundColor: Colors.white,
                      ),
                    ),

                    const SizedBox(height: 10),

                    // Booking Ref with copy button
                    GestureDetector(
                      onTap: () {
                        Clipboard.setData(ClipboardData(text: booking.bookingReference));
                        Get.snackbar(
                          'Copied',
                          'Booking ID #${booking.bookingReference} copied to clipboard',
                          backgroundColor: const Color(0xFF1C221F),
                          colorText: Colors.white,
                          duration: const Duration(seconds: 2),
                          snackPosition: SnackPosition.BOTTOM,
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.06),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Text(
                              'Pass ID: #${booking.bookingReference}',
                              style: GoogleFonts.jetBrainsMono(
                                fontSize: 13,
                                fontWeight: FontWeight.bold,
                                color: AppColors.gold,
                              ),
                            ),
                            const SizedBox(width: 6),
                            const Icon(Icons.copy_rounded, color: AppColors.gold, size: 13),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 16),
                    const Divider(color: Colors.white12, height: 1),
                    const SizedBox(height: 14),

                    // Details Grid
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: _buildInfoItem(
                            icon: Icons.calendar_today_rounded,
                            label: 'Date & Day',
                            value: day,
                          ),
                        ),
                        Expanded(
                          child: _buildInfoItem(
                            icon: Icons.access_time_rounded,
                            label: 'Timings',
                            value: timings,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Expanded(
                          child: _buildInfoItem(
                            icon: Icons.storefront_rounded,
                            label: 'Venue Outlet',
                            value: outlet,
                          ),
                        ),
                        Expanded(
                          child: _buildInfoItem(
                            icon: Icons.person_rounded,
                            label: 'Guest Name',
                            value: booking.customerName.isNotEmpty ? booking.customerName : 'Guest',
                          ),
                        ),
                      ],
                    ),

                    const SizedBox(height: 16),

                    // WhatsApp Sent Badge Notice
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(
                        color: const Color(0xFF0C2417),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: const Color(0xFF25D366).withOpacity(0.3)),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.chat_bubble_outline_rounded, color: Color(0xFF25D366), size: 18),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Text(
                              'WhatsApp confirmation ticket dispatched to registered mobile.',
                              style: GoogleFonts.inter(
                                fontSize: 11,
                                color: const Color(0xFFB5EAD7),
                                height: 1.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 12),

                    Text(
                      '• Present this pass at restaurant front desk upon arrival\n• Booking amount will be adjusted against your dining bill',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.inter(
                        fontSize: 10.5,
                        color: Colors.white.withOpacity(0.4),
                        height: 1.4,
                      ),
                    ),

                    const SizedBox(height: 16),

                    SizedBox(
                      width: double.infinity,
                      height: 44,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.gold,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () => Get.back(),
                        child: Text(
                          'Done',
                          style: GoogleFonts.outfit(
                            fontSize: 14,
                            fontWeight: FontWeight.bold,
                            color: Colors.black,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 15, color: AppColors.gold.withOpacity(0.8)),
        const SizedBox(width: 8),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: GoogleFonts.inter(fontSize: 10, color: Colors.white38),
              ),
              const SizedBox(height: 2),
              Text(
                value,
                style: GoogleFonts.inter(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
