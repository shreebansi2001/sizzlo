import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../data/services/api_service.dart';
import '../../../../data/services/local_storage_service.dart';
import '../../../../data/models/member_model.dart';
import '../../../../core/values/app_constants.dart';

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

  DateTime? _parseDateTime(dynamic raw) {
    if (raw == null) return null;
    final str = raw.toString().trim();
    if (str.isEmpty || str == '—' || str == 'Today' || str == 'Recent') return null;
    try {
      if (str.contains('T')) {
        return DateTime.tryParse(str);
      }
      if (str.contains('-')) {
        return DateTime.tryParse(str.replaceFirst(' ', 'T'));
      }
    } catch (_) {}
    return null;
  }

  String _formatDynamicDate(String? raw, {String fallback = 'Recent'}) {
    if (raw == null || raw.trim().isEmpty) return fallback;
    final str = raw.trim();
    final dt = _parseDateTime(str);
    if (dt != null) {
      final now = DateTime.now();
      final local = dt.toLocal();
      final isToday = local.year == now.year && local.month == now.month && local.day == now.day;
      final isYesterday = local.year == now.year && local.month == now.month && local.day == (now.day - 1);
      final timeStr = DateFormat('hh:mm a').format(local);

      if (isToday) {
        return 'Today, $timeStr';
      } else if (isYesterday) {
        return 'Yesterday, $timeStr';
      } else {
        return DateFormat('dd MMM yyyy, hh:mm a').format(local);
      }
    }
    return str;
  }

  Future<void> _fetchTransactions() async {
    setState(() => _isLoading = true);
    try {
      final List<Map<String, dynamic>> list = [];
      var phone = AppConstants.currentUserMobile;
      var memId = AppConstants.currentMembershipId;

      if (phone.isEmpty || memId.isEmpty) {
        try {
          final session = await LocalStorageService.getUserSession();
          if (phone.isEmpty && (session['mobile']?.isNotEmpty ?? false)) {
            phone = session['mobile']!;
            AppConstants.currentUserMobile = phone;
          }
          if (memId.isEmpty && (session['membershipId']?.isNotEmpty ?? false)) {
            memId = session['membershipId']!;
            AppConstants.currentMembershipId = memId;
          }
        } catch (_) {}
      }

      MemberModel? member;
      try {
        member = await _apiService.getMemberProfile(
          memId.isNotEmpty ? memId : null,
          phone.isNotEmpty ? phone : null,
        );
        if (phone.isEmpty && member.mobile.isNotEmpty) {
          phone = member.mobile;
          AppConstants.currentUserMobile = phone;
        }
        if (memId.isEmpty && member.membershipId.isNotEmpty) {
          memId = member.membershipId;
          AppConstants.currentMembershipId = memId;
        }
      } catch (_) {}

      // 1. Fetch Settled Dine-in Bills
      try {
        final bills = await _apiService.getMyBills(phone, memId);
        for (final b in bills) {
          final rawDate = b.createdAt;
          list.add({
            'title': b.posInvoiceNumber.isNotEmpty
                ? 'Dine-In Bill #${b.posInvoiceNumber}'
                : 'Dine-In Bill #${b.id}',
            'location': b.outletName.isNotEmpty ? b.outletName : 'House of Yanki',
            'date': _formatDynamicDate(rawDate),
            'rawDate': _parseDateTime(rawDate),
            'amount': '₹${b.netPayable.toStringAsFixed(0)}',
            'saved': b.discountAmount > 0
                ? 'Saved ₹${b.discountAmount.toStringAsFixed(0)}'
                : 'Paid via ${b.paymentMode}',
            'points': '+${b.pointsCredited > 0 ? b.pointsCredited : b.netPayable.round()} pts',
            'type': 'dining',
            'status': b.status,
          });
        }
      } catch (_) {}

      // 2. Fetch Table Reservations (including nominal booking covers)
      try {
        final reservations = await _apiService.getReservations(phone);
        for (final r in reservations) {
          final rawDate = r.createdAt.isNotEmpty ? r.createdAt : r.reservationTime;
          list.add({
            'title': 'Table Reservation (${r.guests} Guests)',
            'location': r.reservationTime.isNotEmpty
                ? '${r.outlet} • Slot: ${r.reservationTime}'
                : r.outlet,
            'date': _formatDynamicDate(rawDate),
            'rawDate': _parseDateTime(rawDate),
            'amount': r.bookingAdvance > 0
                ? '₹${r.bookingAdvance.toStringAsFixed(0)} Paid'
                : (r.status.isNotEmpty ? r.status : 'Confirmed'),
            'saved': r.vip ? '👑 VIP Priority' : 'Table Booking',
            'points': r.bookingAdvance > 0 ? '₹${r.bookingAdvance.toInt()} Deductible' : r.status,
            'type': 'dining',
            'status': r.status,
          });
        }
      } catch (_) {}

      // 3. Fetch Event & Sunday Brunch Bookings
      if (phone.isNotEmpty) {
        try {
          final eventBookings = await _apiService.getMyEventBookings(phone);
          for (final eb in eventBookings) {
            final rawDate = eb.createdAt;
            list.add({
              'title': '${eb.eventTitle} (${eb.guestCount} Guests)',
              'location': 'Exclusive Event Pass',
              'date': _formatDynamicDate(rawDate),
              'rawDate': _parseDateTime(rawDate),
              'amount': '₹${eb.totalAmount.toStringAsFixed(0)}',
              'saved': 'Pass #${eb.bookingReference}',
              'points': eb.paymentStatus.isNotEmpty ? eb.paymentStatus : 'CONFIRMED',
              'type': 'event',
              'status': eb.status,
            });
          }
        } catch (_) {}
      }

      // 4. Fetch Banquet & Outdoor Catering Inquiries
      if (phone.isNotEmpty) {
        try {
          final banquets = await _apiService.getMyBanquetInquiries(phone);
          for (final bi in banquets) {
            final rawDate = (bi.createdAt != null && bi.createdAt!.isNotEmpty)
                ? bi.createdAt
                : bi.eventDate;
            list.add({
              'title': '${bi.eventCategory} Inquiry (${bi.estimatedPax} Pax)',
              'location': 'House of Yanki Banquets • Shift: ${bi.eventShift}',
              'date': _formatDynamicDate(rawDate),
              'rawDate': _parseDateTime(rawDate),
              'amount': bi.status,
              'saved': 'Date: ${bi.eventDate}',
              'points': 'ODC Inquiry',
              'type': 'dining',
              'status': bi.status,
            });
          }
        } catch (_) {}
      }

      // 5. Fetch Loyalty Points Activity
      try {
        final loyaltyTxs = await _apiService.getLoyaltyHistory(memId.isNotEmpty ? memId : null);
        for (final l in loyaltyTxs) {
          final isRedeem = l.points < 0 || l.type == 'REDEEM';
          final rawDate = l.time;
          list.add({
            'title': l.title,
            'location': l.outletName,
            'date': _formatDynamicDate(rawDate),
            'rawDate': _parseDateTime(rawDate),
            'amount': isRedeem ? 'Redeemed' : 'Earned',
            'saved': l.description,
            'points': '${l.points >= 0 ? '+' : ''}${l.points} pts',
            'type': 'loyalty',
            'status': isRedeem ? 'Redeemed' : 'Completed',
          });
        }
      } catch (_) {}

      // Sort dynamically: newest activities first
      list.sort((a, b) {
        final DateTime? dtA = a['rawDate'] as DateTime?;
        final DateTime? dtB = b['rawDate'] as DateTime?;
        if (dtA != null && dtB != null) {
          return dtB.compareTo(dtA);
        }
        if (dtA != null) return -1;
        if (dtB != null) return 1;
        return 0;
      });

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
      if (_selectedFilter == 2) return t['type'] == 'event';
      if (_selectedFilter == 3) return t['type'] == 'loyalty';
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
                  _filterChip(2, 'Exclusive Events'),
                  _filterChip(3, 'Loyalty Points'),
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
                            const Icon(Icons.history_toggle_off_rounded, size: 52, color: Colors.white24),
                            const SizedBox(height: 14),
                            Text(
                              'No transactions found yet',
                              style: GoogleFonts.outfit(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(height: 6),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 40),
                              child: Text(
                                'Your table bookings, bill settlements, dining event passes, and loyalty point rewards will appear here.',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Colors.white.withOpacity(0.55),
                                  fontSize: 12,
                                  height: 1.4,
                                 ),
                              ),
                            ),
                            const SizedBox(height: 18),
                            ElevatedButton.icon(
                              onPressed: _fetchTransactions,
                              icon: const Icon(Icons.refresh_rounded, size: 16),
                              label: const Text('Refresh Activity'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: AppColors.gold,
                                foregroundColor: Colors.black,
                                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
                              ),
                            ),
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
                            final isEvent = t['type'] == 'event';
                            final isLoyalty = t['type'] == 'loyalty';

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
                          isEvent
                              ? Icons.celebration_rounded
                              : (isLoyalty ? Icons.stars_rounded : Icons.restaurant_outlined),
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
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13.5, fontWeight: FontWeight.w600, color: Colors.white),
                            ),
                            const SizedBox(height: 2),
                            Text(
                              t['location'] as String,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(fontSize: 11, color: Colors.white.withOpacity(0.45)),
                            ),
                            const SizedBox(height: 6),
                            Wrap(
                              spacing: 8,
                              runSpacing: 4,
                              crossAxisAlignment: WrapCrossAlignment.center,
                              children: [
                                Text(
                                  t['date'] as String,
                                  style: TextStyle(fontSize: 10.5, color: Colors.white.withOpacity(0.4)),
                                ),
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
