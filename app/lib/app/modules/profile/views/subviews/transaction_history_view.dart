import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';

import '../../../../data/services/api_service.dart';

class TransactionHistoryView extends StatefulWidget {
  const TransactionHistoryView({Key? key}) : super(key: key);

  @override
  State<TransactionHistoryView> createState() => _TransactionHistoryViewState();
}

class _TransactionHistoryViewState extends State<TransactionHistoryView> {
  final ApiService _apiService = ApiService();
  int _selectedFilter = 0; // 0: All, 1: Dining, 2: Delivery, 3: Vouchers
  bool _isLoading = true;
  List<Map<String, dynamic>> _transactions = [];

  @override
  void initState() {
    super.initState();
    _fetchTransactions();
  }

  Future<void> _fetchTransactions() async {
    setState(() => _isLoading = true);
    try {
      final loyaltyTxs = await _apiService.getLoyaltyHistory();
      final reservations = await _apiService.getReservations();

      final List<Map<String, dynamic>> list = [];

      for (final r in reservations) {
        list.add({
          'title': 'Table Reservation (${r.guests} Guests)',
          'location': r.outlet,
          'date': r.reservationTime,
          'amount': r.status,
          'saved': r.vip ? 'VIP Seated' : 'Reserved',
          'points': '+100 pts',
          'type': 'dining',
          'status': r.status,
        });
      }

      for (final l in loyaltyTxs) {
        final isRedeem = l.points < 0 || l.type == 'REDEEM';
        list.add({
          'title': l.title,
          'location': l.outletName,
          'date': l.time.contains('T') ? l.time.split('T')[0] : l.time,
          'amount': isRedeem ? 'Redeemed' : 'Earned',
          'saved': l.description,
          'points': '${l.points >= 0 ? '+' : ''}${l.points} pts',
          'type': isRedeem ? 'voucher' : 'dining',
          'status': isRedeem ? 'Redeemed' : 'Completed',
        });
      }

      setState(() {
        _transactions = list;
        _isLoading = false;
      });
    } catch (_) {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _transactions.where((t) {
      if (_selectedFilter == 1) return t['type'] == 'dining';
      if (_selectedFilter == 2) return t['type'] == 'delivery';
      if (_selectedFilter == 3) return t['type'] == 'voucher';
      return true;
    }).toList();

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Transaction History',
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
      body: Column(
        children: [
          // Filter Tabs
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            child: SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: [
                  _filterChip(0, 'All Activity'),
                  _filterChip(1, 'Dine-In'),
                  _filterChip(2, 'Delivery'),
                  _filterChip(3, 'Vouchers'),
                ],
              ),
            ),
          ),

          // List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: AppColors.gold))
                : filtered.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.history_toggle_off_rounded, size: 48, color: Colors.white24),
                            const SizedBox(height: 12),
                            Text('No activity records found', style: TextStyle(color: Colors.white.withOpacity(0.6))),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        color: AppColors.gold,
                        backgroundColor: const Color(0xFF131715),
                        onRefresh: _fetchTransactions,
                        child: ListView.builder(
                          physics: const AlwaysScrollableScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                          itemCount: filtered.length,
                          itemBuilder: (context, index) {
                            final t = filtered[index];
                            final isVoucher = t['type'] == 'voucher';
                            final isDelivery = t['type'] == 'delivery';

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
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFDF9E5B).withOpacity(0.12),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Icon(
                          isVoucher
                              ? Icons.confirmation_number_outlined
                              : (isDelivery ? Icons.moped_outlined : Icons.restaurant_outlined),
                          size: 20,
                          color: const Color(0xFFDF9E5B),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              t['title'] as String,
                              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: Colors.white),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              t['location'] as String,
                              style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.45)),
                            ),
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                Text(
                                  t['date'] as String,
                                  style: TextStyle(fontSize: 10.5, color: Colors.white.withOpacity(0.35)),
                                ),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1.5),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF10B981).withOpacity(0.12),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    t['saved'] as String,
                                    style: const TextStyle(fontSize: 9.5, fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            t['amount'] as String,
                            style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            t['points'] as String,
                            style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Color(0xFFDF9E5B)),
                          ),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ),
      ],
    ),
  );
  }

  Widget _filterChip(int index, String label) {
    final isSelected = _selectedFilter == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedFilter = index),
      child: Container(
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFFDF9E5B) : const Color(0xFF131715),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? const Color(0xFFDF9E5B) : Colors.white.withOpacity(0.08),
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.bold,
            color: isSelected ? const Color(0xFF070A09) : Colors.white.withOpacity(0.7),
          ),
        ),
      ),
    );
  }
}
