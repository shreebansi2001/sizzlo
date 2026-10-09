import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';

class SupportView extends StatefulWidget {
  const SupportView({Key? key}) : super(key: key);

  @override
  State<SupportView> createState() => _SupportViewState();
}

class _SupportViewState extends State<SupportView> {
  final TextEditingController _queryController = TextEditingController();
  bool _isSending = false;

  final List<Map<String, String>> _faqs = [
    {
      'q': 'How do I redeem my complimentary sizzler coupon?',
      'a': 'Simply visit any Yanki Sizzl\'o outlet, open the Coupons tab in your app, select the voucher, and present the 4-digit verification code to your server before the bill is generated.'
    },
    {
      'q': 'Can I transfer my membership or vouchers to friends?',
      'a': 'Memberships are linked to your verified mobile number. However, you can bring up to 6 guests with you per visit to enjoy all VIP dining discounts and benefits!'
    },
    {
      'q': 'What is the priority reservation policy on weekends?',
      'a': 'VIP members enjoy guaranteed table allocations when booking at least 2 hours in advance via the Table Reservations section.'
    },
    {
      'q': 'How does Outdoor Catering (ODC) banquet booking work?',
      'a': 'Submit your event date and expected guest count in the Delivery & Catering tab. Our master banquet coordinator will call you within 30 minutes with customized menus.'
    },
  ];

  int? _expandedFaq;

  void _sendQuery() {
    if (_queryController.text.trim().isEmpty) return;
    setState(() => _isSending = true);
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        setState(() {
          _isSending = false;
          _queryController.clear();
        });
        Get.snackbar(
          'Message Received',
          'Your VIP concierge will respond via WhatsApp / Phone shortly.',
          snackPosition: SnackPosition.BOTTOM,
          backgroundColor: const Color(0xFF131715),
          colorText: Colors.white,
          borderColor: const Color(0xFFDF9E5B).withOpacity(0.5),
          borderWidth: 1,
          margin: const EdgeInsets.all(16),
        );
      }
    });
  }

  @override
  void dispose() {
    _queryController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Help & Concierge',
          style: GoogleFonts.playfairDisplay(
            fontSize: 19,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Get.back(),
        ),
      ),
      body: SafeArea(
        top: false,
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Concierge Hero Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF281C10), Color(0xFF131715)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFFDF9E5B).withOpacity(0.3), width: 1.2),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDF9E5B).withOpacity(0.15),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.headset_mic_rounded, color: Color(0xFFDF9E5B), size: 22),
                      ),
                      const SizedBox(width: 12),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            '24/7 VIP Concierge Desk',
                            style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            'Dedicated assistance for Yanki Sizzl\'o VIPs',
                            style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.5)),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      _contactButton(
                        'Call Hotline',
                        Icons.phone_rounded,
                        const Color(0xFF10B981),
                        () => Get.snackbar('VIP Hotline', 'Calling concierge at +91 98250 12345...', snackPosition: SnackPosition.BOTTOM, backgroundColor: const Color(0xFF131715), colorText: Colors.white),
                      ),
                      const SizedBox(width: 10),
                      _contactButton(
                        'WhatsApp',
                        Icons.chat_bubble_outline_rounded,
                        const Color(0xFF25D366),
                        () => Get.snackbar('WhatsApp Concierge', 'Opening WhatsApp concierge chat...', snackPosition: SnackPosition.BOTTOM, backgroundColor: const Color(0xFF131715), colorText: Colors.white),
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 22),

            _sectionHeader('FREQUENTLY ASKED QUESTIONS'),
            const SizedBox(height: 10),

            ...List.generate(_faqs.length, (index) {
              final faq = _faqs[index];
              final isExpanded = _expandedFaq == index;

              return Container(
                margin: const EdgeInsets.only(bottom: 8),
                decoration: BoxDecoration(
                  color: const Color(0xFF131715),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Column(
                  children: [
                    ListTile(
                      dense: true,
                      onTap: () {
                        setState(() {
                          _expandedFaq = isExpanded ? null : index;
                        });
                      },
                      title: Text(
                        faq['q']!,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                      ),
                      trailing: Icon(
                        isExpanded ? Icons.keyboard_arrow_up_rounded : Icons.keyboard_arrow_down_rounded,
                        color: const Color(0xFFDF9E5B),
                      ),
                    ),
                    if (isExpanded)
                      Padding(
                        padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
                        child: Text(
                          faq['a']!,
                          style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.65), height: 1.45),
                        ),
                      ),
                  ],
                ),
              );
            }),

            const SizedBox(height: 22),

            _sectionHeader('SEND US A MESSAGE'),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF131715),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white.withOpacity(0.06)),
              ),
              child: Column(
                children: [
                  TextField(
                    controller: _queryController,
                    maxLines: 3,
                    style: const TextStyle(fontSize: 13, color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'How can our dining concierge assist you today?',
                      hintStyle: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.35)),
                      border: InputBorder.none,
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    width: double.infinity,
                    height: 44,
                    child: ElevatedButton(
                      onPressed: _isSending ? null : _sendQuery,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFDF9E5B),
                        foregroundColor: const Color(0xFF070A09),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                      child: _isSending
                          ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                          : const Text('Submit Message', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 28),
          ],
        ),
      ),
      ),
    );
  }

  Widget _sectionHeader(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        title,
        style: GoogleFonts.plusJakartaSans(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.5,
          color: AppColors.gold,
        ),
      ),
    );
  }

  Widget _contactButton(String label, IconData icon, Color color, VoidCallback onTap) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: color.withOpacity(0.12),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, size: 16, color: color),
              const SizedBox(width: 6),
              Text(
                label,
                style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
