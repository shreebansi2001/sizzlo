import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../controllers/loyalty_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../widgets/sizzlo_mascot_animated.dart';

class LoyaltyView extends GetView<LoyaltyController> {
  final bool isTab;

  const LoyaltyView({Key? key, this.isTab = false}) : super(key: key);

  String _formatNumber(int number) {
    final isNegative = number < 0;
    final abs = number.abs();
    final str = abs.toString();
    if (str.length <= 3) return (isNegative ? '-' : '') + str;
    
    final last3 = str.substring(str.length - 3);
    String remaining = str.substring(0, str.length - 3);
    String result = '';
    while (remaining.length > 2) {
      result = ',${remaining.substring(remaining.length - 2)}$result';
      remaining = remaining.substring(0, remaining.length - 2);
    }
    result = '$remaining$result,$last3';
    return (isNegative ? '-' : '') + result;
  }

  String _formatTxDate(String raw) {
    if (raw.isEmpty) return 'Recent';
    try {
      DateTime? dt;
      if (raw.contains('T')) {
        dt = DateTime.tryParse(raw);
      } else if (raw.contains('-')) {
        dt = DateTime.tryParse(raw.replaceFirst(' ', 'T'));
      }
      if (dt != null) {
        return DateFormat('dd MMM yyyy, hh:mm a').format(dt.toLocal());
      }
    } catch (_) {}
    return raw.contains('T') ? raw.split('T')[0] : raw;
  }

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<LoyaltyController>()) {
      Get.put(LoyaltyController());
    }

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text(
          'Loyalty Rewards',
          style: TextStyle(
            fontFamily: 'Playfair Display',
            fontSize: 20,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        automaticallyImplyLeading: !isTab,
        leading: isTab
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 18),
                onPressed: () => Get.back(),
              ),
      ),
      body: SafeArea(
        top: false,
        child: Obx(() {
        if (controller.isLoading.value && controller.transactions.isEmpty) {
          return const Center(
            child: CircularProgressIndicator(color: AppColors.gold),
          );
        }

        return RefreshIndicator(
          color: AppColors.gold,
          backgroundColor: const Color(0xFF131715),
          onRefresh: () async {
            controller.loadLoyaltyData();
          },
          child: SingleChildScrollView(
            physics: const AlwaysScrollableScrollPhysics(),
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Loyalty Hero Card
                _buildBalanceHeroCard(),

                const SizedBox(height: 16),

                // 3 Stat Tiles in a row
                _buildThreeStatsRow(),

                const SizedBox(height: 24),

                // Recent Activity Section Header
                Wrap(
                  alignment: WrapAlignment.spaceBetween,
                  crossAxisAlignment: WrapCrossAlignment.center,
                  spacing: 8,
                  runSpacing: 4,
                  children: [
                    Text(
                      'Recent activity',
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: AppColors.gold,
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: const [
                        Icon(Icons.trending_up, size: 16, color: Color(0xFF4EE3B8)),
                        SizedBox(width: 4),
                        Text(
                          'Live Wallet Sync',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                            color: Color(0xFF4EE3B8),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Activity List
                _buildActivityList(),

                SizedBox(height: isTab ? 135 : 30),
              ],
            ),
          ),
        );
      }),
    ),
  );
}

  Widget _buildBalanceHeroCard() {
    final m = controller.member.value;
    final currentPoints = m.loyaltyPoints;
    final goalPoints = m.loyaltyGoal > 0 ? m.loyaltyGoal : 250000;
    final progressPercent = ((currentPoints / goalPoints) * 100).toInt().clamp(0, 100);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(22),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [
            Color(0xFF382312),
            Color(0xFF221509),
            Color(0xFF160E06),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: const Color(0xFF7F4420).withOpacity(0.6),
          width: 1.2,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.4),
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'YANKI REWARDS BALANCE',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 11,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 2.2,
                        color: AppColors.gold,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _formatNumber(currentPoints),
                      style: GoogleFonts.playfairDisplay(
                        fontSize: 34,
                        fontWeight: FontWeight.bold,
                        color: AppColors.goldChampagne,
                        letterSpacing: -0.5,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'points · earning 5x on weekends',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 12,
                        color: Colors.white.withOpacity(0.65),
                      ),
                    ),
                  ],
                ),
              ),
              // Mascot with sparkle aura
              Stack(
                alignment: Alignment.center,
                children: [
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.gold.withOpacity(0.25),
                          blurRadius: 18,
                          spreadRadius: 2,
                        ),
                      ],
                    ),
                  ),
                  const SizzloMascotAnimated(height: 48),
                ],
              ),
            ],
          ),

          const SizedBox(height: 18),

          // Dynamic Target, Progress Bar & Points Left to Free Subscription Box
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.35),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(
                color: const Color(0xFFD4AF37).withOpacity(0.28),
                width: 1.1,
              ),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Top Row: Reward Title & Target Points + Percentage Badge
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: AppColors.gold.withOpacity(0.15),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                                child: const Icon(
                                  Icons.card_giftcard_rounded,
                                  size: 13,
                                  color: AppColors.gold,
                                ),
                              ),
                              const SizedBox(width: 7),
                              Text(
                                'FREE VIP SUBSCRIPTION REWARD',
                                style: GoogleFonts.plusJakartaSans(
                                  fontSize: 10,
                                  fontWeight: FontWeight.w800,
                                  letterSpacing: 1.1,
                                  color: AppColors.gold,
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 6),
                          RichText(
                            text: TextSpan(
                              children: [
                                TextSpan(
                                  text: 'Target: ',
                                  style: GoogleFonts.inter(
                                    fontSize: 13,
                                    color: Colors.white70,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                TextSpan(
                                  text: '${_formatNumber(goalPoints)} Points',
                                  style: GoogleFonts.outfit(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                    // Progress percentage badge
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                      decoration: BoxDecoration(
                        color: AppColors.gold.withOpacity(0.15),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.gold.withOpacity(0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.bolt_rounded, size: 13, color: AppColors.gold),
                          const SizedBox(width: 2),
                          Text(
                            '$progressPercent%',
                            style: GoogleFonts.outfit(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: AppColors.goldChampagne,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                // Linear Gradient Progress Bar
                Stack(
                  children: [
                    Container(
                      height: 8,
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(10),
                      ),
                    ),
                    FractionallySizedBox(
                      widthFactor: ((currentPoints / goalPoints).clamp(0.0, 1.0)),
                      child: Container(
                        height: 8,
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.flame, AppColors.gold, Color(0xFFFFF275)],
                          ),
                          borderRadius: BorderRadius.circular(10),
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.gold.withOpacity(0.4),
                              blurRadius: 6,
                              offset: const Offset(0, 1),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 10),

                // Bottom Row: Current Points vs Points Left
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${_formatNumber(currentPoints)} pts collected',
                      style: GoogleFonts.inter(
                        fontSize: 11,
                        color: Colors.white60,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: const Color(0xFF4A2515).withOpacity(0.6),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: AppColors.flame.withOpacity(0.4)),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.hourglass_top_rounded, size: 11, color: AppColors.flame),
                          const SizedBox(width: 4),
                          Text(
                            (goalPoints - currentPoints) > 0
                                ? '${_formatNumber(goalPoints - currentPoints)} pts left to reach target'
                                : 'Target Reached! Ready for Renewal',
                            style: GoogleFonts.outfit(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: (goalPoints - currentPoints) > 0
                                  ? const Color(0xFFFFB74D)
                                  : const Color(0xFF00E676),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildThreeStatsRow() {
    final m = controller.member.value;
    final txs = controller.transactions;

    // Calculate dynamic stats
    int redeemedTotal = 0;
    int earnedTotal = 0;
    for (final t in txs) {
      if (t.points < 0 || t.type == 'REDEEM') {
        redeemedTotal += t.points.abs();
      } else {
        earnedTotal += t.points;
      }
    }

    final lifetimePoints = m.loyaltyPoints + redeemedTotal;
    final thisMonthEarned = earnedTotal;

    return Row(
      children: [
        _statTile('THIS MONTH', '+${_formatNumber(thisMonthEarned)}'),
        const SizedBox(width: 10),
        _statTile('LIFETIME', _formatNumber(lifetimePoints > 0 ? lifetimePoints : m.loyaltyPoints)),
        const SizedBox(width: 10),
        _statTile('REDEEMED', _formatNumber(redeemedTotal)),
      ],
    );
  }

  Widget _statTile(String label, String value) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
        decoration: BoxDecoration(
          color: const Color(0xFF131715),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
          children: [
            Text(
              label,
              style: GoogleFonts.plusJakartaSans(
                fontSize: 9,
                fontWeight: FontWeight.w700,
                letterSpacing: 1.2,
                color: Colors.white.withOpacity(0.5),
              ),
            ),
            const SizedBox(height: 6),
            FittedBox(
              fit: BoxFit.scaleDown,
              child: Text(
                value,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: const Color(0xFFDF9E5B),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildActivityList() {
    final transactions = controller.transactions;

    if (transactions.isEmpty) {
      return Container(
        width: double.infinity,
        padding: const EdgeInsets.all(32),
        decoration: BoxDecoration(
          color: const Color(0xFF131715),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Colors.white.withOpacity(0.06)),
        ),
        child: Column(
          children: [
            const Icon(Icons.stars_rounded, size: 40, color: Color(0xFFDF9E5B)),
            const SizedBox(height: 12),
            Text(
              'No Loyalty Transactions Yet',
              style: GoogleFonts.plusJakartaSans(
                fontSize: 15,
                fontWeight: FontWeight.w600,
                color: Colors.white.withOpacity(0.8),
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Earn loyalty points automatically when dining at any Yanki venue.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.4)),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      itemCount: transactions.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (context, index) {
        final t = transactions[index];
        final isRedeem = t.points < 0 || t.type == 'REDEEM';
        
        IconData icon = Icons.restaurant;
        final lower = t.title.toLowerCase();
        if (lower.contains('banquet') || lower.contains('anniversary')) {
          icon = Icons.celebration;
        } else if (lower.contains('delivery') || lower.contains('order')) {
          icon = Icons.lunch_dining_rounded;
        } else if (lower.contains('bonus') || lower.contains('vip')) {
          icon = Icons.stars_rounded;
        }

        final pointsText = '${t.points > 0 ? '+' : ''}${_formatNumber(t.points)}';

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: const Color(0xFF131715),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withOpacity(0.05)),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: isRedeem 
                      ? Colors.red.withOpacity(0.12)
                      : Colors.white.withOpacity(0.06),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  icon,
                  color: isRedeem ? const Color(0xFFEF4444) : const Color(0xFFDF9E5B),
                  size: 20,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      t.title,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white.withOpacity(0.9),
                      ),
                    ),
                    const SizedBox(height: 3),
                    Text(
                      '${_formatTxDate(t.time)} · ${t.outletName}',
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white.withOpacity(0.4),
                      ),
                    ),
                  ],
                ),
              ),
              Text(
                pointsText,
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.bold,
                  color: isRedeem ? const Color(0xFFEF4444) : const Color(0xFFDF9E5B),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
