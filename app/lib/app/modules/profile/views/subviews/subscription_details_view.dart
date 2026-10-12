import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../data/models/member_model.dart';
import '../../../../data/services/api_service.dart';
import '../../../../routes/app_routes.dart';
import '../../../home/controllers/home_controller.dart';
import '../../controllers/profile_controller.dart';

class SubscriptionDetailsView extends StatefulWidget {
  const SubscriptionDetailsView({Key? key}) : super(key: key);

  @override
  State<SubscriptionDetailsView> createState() => _SubscriptionDetailsViewState();
}

class _SubscriptionDetailsViewState extends State<SubscriptionDetailsView> {
  final ApiService _apiService = ApiService();
  List<Map<String, dynamic>> _plans = [];
  bool _isLoadingPlans = true;

  @override
  void initState() {
    super.initState();
    _loadLivePlans();
  }

  Future<void> _loadLivePlans() async {
    try {
      final list = await _apiService.getPlans();
      if (mounted) {
        setState(() {
          _plans = list;
          _isLoadingPlans = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _isLoadingPlans = false;
        });
      }
    }
  }

  MemberModel _getMember() {
    if (Get.isRegistered<HomeController>()) {
      return Get.find<HomeController>().member.value;
    }
    if (Get.isRegistered<ProfileController>()) {
      return Get.find<ProfileController>().member.value;
    }
    return MemberModel.defaultProfile();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Subscription Details',
          style: GoogleFonts.playfairDisplay(
            fontSize: 19,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
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
        child: Obx(() {
          final m = _getMember();
          final isSub = m.isSubscriber;

          return RefreshIndicator(
            onRefresh: _loadLivePlans,
            color: AppColors.gold,
            backgroundColor: const Color(0xFF141917),
            child: SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
              child: isSub ? _buildSubscribedView(m) : _buildNonSubscribedView(),
            ),
          );
        }),
      ),
    );
  }

  // =========================================================================
  // VIEW FOR ACTIVE SUBSCRIBERS
  // =========================================================================
  Widget _buildSubscribedView(MemberModel m) {
    // Find matching plan from live API
    final matchedPlan = _plans.firstWhereOrNull(
      (p) => p['id']?.toString().toLowerCase() == m.planId.toLowerCase(),
    );

    final planName = m.membershipType.isNotEmpty
        ? m.membershipType
        : (matchedPlan != null ? (matchedPlan['name']?.toString() ?? 'VIP Pass') : 'VIP Pass');

    final liveBenefits = matchedPlan != null && matchedPlan['benefits'] is List
        ? List<String>.from(matchedPlan['benefits'])
        : <String>[];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // VIP Active Membership Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF2B1D12), Color(0xFF16120D)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFDF9E5B).withOpacity(0.4), width: 1.2),
            boxShadow: [
              BoxShadow(
                color: const Color(0xFFDF9E5B).withOpacity(0.14),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'YANKI SIZZL\'O VIP',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 2.0,
                      color: const Color(0xFFDF9E5B),
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFF10B981).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFF10B981), width: 1),
                    ),
                    child: const Text(
                      'ACTIVE',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF10B981),
                        letterSpacing: 0.8,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),
              Text(
                planName,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              if (m.membershipId.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(
                  'ID: ${m.membershipId}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.white.withOpacity(0.7),
                    letterSpacing: 1.0,
                    fontFamily: 'monospace',
                  ),
                ),
              ],
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  if (m.issuedDate.isNotEmpty)
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'VALID FROM',
                          style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.4), letterSpacing: 1.0),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          m.issuedDate,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Colors.white),
                        ),
                      ],
                    ),
                  if (m.expiryDate.isNotEmpty && m.expiryDate != '—')
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          'EXPIRES ON',
                          style: TextStyle(fontSize: 10, color: Colors.white.withOpacity(0.4), letterSpacing: 1.0),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          m.expiryDate,
                          style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: Color(0xFFDF9E5B)),
                        ),
                      ],
                    ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: 24),

        // Live Privileges Section
        _sectionHeader('ACTIVE VIP PRIVILEGES'),
        const SizedBox(height: 12),

        if (_isLoadingPlans)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 30),
            child: Center(child: CircularProgressIndicator(color: AppColors.goldAccent)),
          )
        else if (liveBenefits.isNotEmpty)
          ...liveBenefits.map((benefit) => _buildLiveBenefitTile(benefit))
        else
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF141715),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: Colors.white.withOpacity(0.06)),
            ),
            child: Row(
              children: [
                const Icon(Icons.check_circle_outline_rounded, color: AppColors.goldAccent, size: 20),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Full VIP privileges active across all dining, voucher redemptions, and table reservations.',
                    style: GoogleFonts.inter(fontSize: 12.5, color: Colors.white70),
                  ),
                ),
              ],
            ),
          ),

        const SizedBox(height: 28),

        // Upgrade / Renew CTA
        SizedBox(
          width: double.infinity,
          height: 50,
          child: ElevatedButton(
            onPressed: () => Get.toNamed(AppRoutes.PLANS),
            style: ElevatedButton.styleFrom(
              backgroundColor: const Color(0xFFDF9E5B),
              foregroundColor: const Color(0xFF070A09),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: Text(
              'Renew or Upgrade Plan →',
              style: GoogleFonts.outfit(fontSize: 15, fontWeight: FontWeight.bold),
            ),
          ),
        ),
        const SizedBox(height: 30),
      ],
    );
  }

  // =========================================================================
  // VIEW FOR NON-SUBSCRIBERS (NO FAKE / STATIC DATA)
  // =========================================================================
  Widget _buildNonSubscribedView() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Clean Status Card
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(22),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [Color(0xFF241A12), Color(0xFF14120F)],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFFDF9E5B).withOpacity(0.35), width: 1.2),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDF9E5B).withOpacity(0.15),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(color: const Color(0xFFDF9E5B).withOpacity(0.4)),
                    ),
                    child: Text(
                      'GUEST ACCOUNT',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 10,
                        fontWeight: FontWeight.w800,
                        color: const Color(0xFFDF9E5B),
                        letterSpacing: 1.0,
                      ),
                    ),
                  ),
                  const Icon(Icons.workspace_premium_outlined, color: Color(0xFFDF9E5B), size: 24),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                'No Active Subscription',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 22,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'You currently do not have an active VIP membership plan. Subscribe to unlock dining discounts, vouchers, birthday rewards, and guaranteed priority table bookings.',
                style: GoogleFonts.inter(
                  fontSize: 12.5,
                  color: Colors.grey[400],
                  height: 1.45,
                ),
              ),
              const SizedBox(height: 18),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () => Get.toNamed(AppRoutes.PLANS),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFDF9E5B),
                    foregroundColor: const Color(0xFF070A09),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    elevation: 0,
                  ),
                  child: Text(
                    'Explore VIP Subscription Plans →',
                    style: GoogleFonts.outfit(fontSize: 14, fontWeight: FontWeight.w800),
                  ),
                ),
              ),
            ],
          ),
        ),

        const SizedBox(height: 26),

        // Live Plans List synced from Backend API
        _sectionHeader('AVAILABLE VIP PLANS (LIVE BENEFITS)'),
        const SizedBox(height: 12),

        if (_isLoadingPlans)
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 40),
            child: Center(child: CircularProgressIndicator(color: AppColors.goldAccent)),
          )
        else if (_plans.isEmpty)
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF141715),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(
              child: Text(
                'No subscription plans available right now.',
                style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[500]),
              ),
            ),
          )
        else
          ..._plans.map((p) => _buildLivePlanCard(p)),

        const SizedBox(height: 20),
      ],
    );
  }

  // --- Dynamic Live Plan Card for Non-Subscribers ---
  Widget _buildLivePlanCard(Map<String, dynamic> p) {
    final name = p['name']?.toString() ?? 'Plan';
    final desc = p['description']?.toString() ?? '';
    final price = p['price']?.toString() ?? '0';
    final offerLabel = p['offerLabel']?.toString() ?? '';
    final benefits = p['benefits'] is List ? List<String>.from(p['benefits']) : <String>[];

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF141615),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                name,
                style: GoogleFonts.playfairDisplay(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              if (offerLabel.isNotEmpty)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: const Color(0xFFDF9E5B).withOpacity(0.15),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFDF9E5B).withOpacity(0.35)),
                  ),
                  child: Text(
                    offerLabel,
                    style: GoogleFonts.outfit(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: const Color(0xFFDF9E5B),
                    ),
                  ),
                ),
            ],
          ),
          if (desc.isNotEmpty) ...[
            const SizedBox(height: 4),
            Text(
              desc,
              style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[400]),
            ),
          ],
          const SizedBox(height: 10),
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Text(
                '₹$price',
                style: GoogleFonts.outfit(
                  fontSize: 22,
                  fontWeight: FontWeight.w900,
                  color: AppColors.goldAccent,
                ),
              ),
              const SizedBox(width: 6),
              Text(
                '/ year',
                style: GoogleFonts.inter(fontSize: 11, color: Colors.grey[500]),
              ),
            ],
          ),
          if (benefits.isNotEmpty) ...[
            const SizedBox(height: 12),
            ...benefits.take(3).map((b) => Padding(
              padding: const EdgeInsets.only(bottom: 5),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.check_rounded, size: 14, color: Color(0xFF4EE3B8)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      b,
                      style: GoogleFonts.inter(fontSize: 11.5, color: Colors.grey[300]),
                    ),
                  ),
                ],
              ),
            )),
          ],
          const SizedBox(height: 14),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => Get.toNamed(AppRoutes.PLANS),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.goldAccent,
                side: BorderSide(color: AppColors.goldAccent.withOpacity(0.5)),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(vertical: 10),
              ),
              child: Text(
                'View & Choose $name →',
                style: GoogleFonts.outfit(fontSize: 12.5, fontWeight: FontWeight.w700),
              ),
            ),
          ),
        ],
      ),
    );
  }

  // --- Live Benefit Tile ---
  Widget _buildLiveBenefitTile(String benefitText) {
    IconData icon = Icons.star_rounded;
    final lower = benefitText.toLowerCase();
    if (lower.contains('discount') || lower.contains('% off') || lower.contains('bill')) {
      icon = Icons.percent_rounded;
    } else if (lower.contains('birthday') || lower.contains('dessert') || lower.contains('anniversary')) {
      icon = Icons.cake_rounded;
    } else if (lower.contains('table') || lower.contains('reservation')) {
      icon = Icons.table_restaurant_outlined;
    } else if (lower.contains('voucher') || lower.contains('reward') || lower.contains('points')) {
      icon = Icons.card_giftcard_rounded;
    } else if (lower.contains('banquet') || lower.contains('catering')) {
      icon = Icons.room_service_rounded;
    } else if (lower.contains('dough') || lower.contains('meal')) {
      icon = Icons.restaurant_menu_rounded;
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF131715),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(9),
            decoration: BoxDecoration(
              color: const Color(0xFFDF9E5B).withOpacity(0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 18, color: const Color(0xFFDF9E5B)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              benefitText,
              style: GoogleFonts.inter(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: Colors.white,
                height: 1.35,
              ),
            ),
          ),
        ],
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
}
