import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../controllers/billing_controller.dart';
import '../../home/controllers/home_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../widgets/sizzlo_button.dart';
import '../../../routes/app_routes.dart';

class BillingView extends GetView<BillingController> {
  const BillingView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0908),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 20),
          onPressed: () => Get.back(),
        ),
        title: Text(
          'Settle Dining Bill',
          style: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Colors.white,
            letterSpacing: 0.5,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded, color: AppColors.goldAccent),
            onPressed: controller.loadInitialData,
          ),
        ],
      ),
      body: SafeArea(
        top: false,
        child: Obx(() {
          if (controller.isLoading.value) {
            return const Center(
              child: CircularProgressIndicator(color: AppColors.goldAccent),
            );
          }

          final settlement = controller.currentSettlement.value;
          if (settlement != null) {
            return _buildSettlementStatusScreen(settlement);
          }

          return _buildSettlementForm();
        }),
      ),
    );
  }

  Widget _buildSettlementForm() {
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      physics: const BouncingScrollPhysics(),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Non-Integrated POS Guidance Badge
          Container(
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: const Color(0xFF141A18),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF1E3A32)),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: const Color(0xFF0F2D25),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.receipt_long_rounded, color: Color(0xFF4EE3B8), size: 22),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Direct Table Settlement',
                        style: GoogleFonts.outfit(
                          fontSize: 14,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        'Enter your printed offline POS bill details below to apply subscription discounts and receive instant loyalty points.',
                        style: GoogleFonts.inter(
                          fontSize: 12,
                          color: const Color(0xFF9EAAA6),
                          height: 1.3,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // VIP Lock Banner if user is not subscribed
          Obx(() {
            final hasActiveSub = controller.isSubscriber.value ||
                (Get.isRegistered<HomeController>() && Get.find<HomeController>().member.value.isSubscriber);
            if (!hasActiveSub) {
              return Container(
                margin: const EdgeInsets.only(bottom: 20),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  gradient: const LinearGradient(
                    colors: [Color(0xFF2C1910), Color(0xFF190F09)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: AppColors.goldAccent),
                ),
                child: Column(
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.workspace_premium_rounded, color: AppColors.goldAccent, size: 28),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'VIP Subscription Required',
                                style: GoogleFonts.outfit(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 14,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                'Only active subscribers can apply discount coupons and earn settlement rewards.',
                                style: GoogleFonts.inter(color: Colors.grey[300], fontSize: 11),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.goldAccent,
                          foregroundColor: Colors.black,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                        ),
                        onPressed: () => Get.toNamed(AppRoutes.PLANS),
                        child: Text(
                          'Subscribe to Unlock Dining Discounts',
                          style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }
            return const SizedBox.shrink();
          }),

          // Pre-filled Table Booking Card (if booked by user)
          Obx(() {
            final hasBooking = controller.bookedOutletName.value.isNotEmpty ||
                controller.linkedBookingReference.value.isNotEmpty;
            if (!hasBooking) return const SizedBox.shrink();

            return Container(
              margin: const EdgeInsets.only(bottom: 20),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1E2822), Color(0xFF111714)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(18),
                border: Border.all(color: const Color(0xFF4EE3B8).withOpacity(0.4), width: 1.2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: const Color(0xFF4EE3B8).withOpacity(0.18),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.bookmark_added_rounded, color: Color(0xFF4EE3B8), size: 18),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'BOOKING INFORMATION PRE-FILLED',
                              style: GoogleFonts.outfit(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: const Color(0xFF4EE3B8),
                                letterSpacing: 1.1,
                              ),
                            ),
                            Text(
                              'Details linked from your table reservation',
                              style: GoogleFonts.inter(fontSize: 11, color: Colors.white60),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppColors.goldAccent.withOpacity(0.18),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: AppColors.goldAccent.withOpacity(0.4)),
                        ),
                        child: Text(
                          '₹${controller.tableAdvanceDeduction.value.toStringAsFixed(0)} DEDUCTION',
                          style: GoogleFonts.outfit(fontSize: 10, fontWeight: FontWeight.w800, color: AppColors.goldAccent),
                        ),
                      ),
                    ],
                  ),
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 12),
                    child: Divider(color: Colors.white12, height: 1),
                  ),
                  Row(
                    children: [
                      const Icon(Icons.storefront_rounded, color: AppColors.goldAccent, size: 16),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          'Branch: ${controller.selectedOutlet.value?.name ?? controller.bookedOutletName.value}',
                          style: GoogleFonts.plusJakartaSans(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13),
                        ),
                      ),
                    ],
                  ),
                  if (controller.bookedTimeSlot.value.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.access_time_rounded, color: Colors.white70, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          'Reserved Slot: ${controller.bookedTimeSlot.value}',
                          style: GoogleFonts.plusJakartaSans(color: Colors.white70, fontSize: 12),
                        ),
                        if (controller.bookedGuests.value > 0) ...[
                          const SizedBox(width: 12),
                          const Icon(Icons.people_outline_rounded, color: Colors.white70, size: 16),
                          const SizedBox(width: 6),
                          Text(
                            '${controller.bookedGuests.value} Guests',
                            style: GoogleFonts.plusJakartaSans(color: Colors.white70, fontSize: 12),
                          ),
                        ],
                      ],
                    ),
                  ],
                  if (controller.linkedBookingReference.value.isNotEmpty) ...[
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Icon(Icons.qr_code_rounded, color: AppColors.goldAccent, size: 16),
                        const SizedBox(width: 8),
                        Text(
                          'Ref: ${controller.linkedBookingReference.value}',
                          style: GoogleFonts.plusJakartaSans(color: AppColors.goldAccent, fontSize: 12, fontWeight: FontWeight.w600),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            );
          }),

          const SizedBox(height: 4),

          // 1. Select Outlet
          Text(
            '1. SELECT OUTLET',
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.goldAccent,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            decoration: BoxDecoration(
              color: const Color(0xFF141312),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: const Color(0xFF262320)),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<int>(
                value: controller.selectedOutlet.value?.id,
                dropdownColor: const Color(0xFF1C1917),
                isExpanded: true,
                icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppColors.goldAccent),
                items: controller.outlets.map((o) {
                  return DropdownMenuItem<int>(
                    value: o.id,
                    child: Text(
                      o.name,
                      style: GoogleFonts.outfit(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                  );
                }).toList(),
                onChanged: (val) {
                  if (val != null) {
                    controller.selectedOutlet.value = controller.outlets.firstWhere((o) => o.id == val);
                  }
                },
              ),
            ),
          ),
          const SizedBox(height: 20),

          // 2. Select Coupon
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '2. SELECT COUPON TO APPLY',
                style: GoogleFonts.outfit(
                  fontSize: 12,
                  fontWeight: FontWeight.w700,
                  color: AppColors.goldAccent,
                  letterSpacing: 1.2,
                ),
              ),
              Obx(() {
                final selected = controller.selectedCoupon.value;
                if (selected != null) {
                  return GestureDetector(
                    onTap: () => controller.selectCoupon(null),
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: Colors.redAccent.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.redAccent.withOpacity(0.3)),
                      ),
                      child: Text(
                        'Remove Coupon',
                        style: GoogleFonts.outfit(
                          fontSize: 11,
                          fontWeight: FontWeight.w700,
                          color: const Color(0xFFFF8A80),
                        ),
                      ),
                    ),
                  );
                }
                return Text(
                  '${controller.availableCoupons.length} in Vault',
                  style: GoogleFonts.inter(fontSize: 11, color: Colors.grey),
                );
              }),
            ],
          ),
          const SizedBox(height: 10),

          // Proper Vertical Coupon Cards
          if (controller.availableCoupons.isEmpty)
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF141312),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF262320)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.confirmation_number_outlined, color: Colors.grey, size: 22),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'No unredeemed coupons available in vault. Standard dining rates apply.',
                      style: GoogleFonts.inter(fontSize: 13, color: Colors.grey),
                    ),
                  ),
                ],
              ),
            )
          else ...[
            // Option: Standard Bill without Coupon
            GestureDetector(
              onTap: () => controller.selectCoupon(null),
              child: Obx(() {
                final isNone = controller.selectedCoupon.value == null;
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                  decoration: BoxDecoration(
                    color: isNone ? const Color(0xFF231E18) : const Color(0xFF141312),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(
                      color: isNone ? AppColors.goldAccent : const Color(0xFF262320),
                      width: isNone ? 1.4 : 1.0,
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        isNone ? Icons.radio_button_checked_rounded : Icons.radio_button_off_rounded,
                        color: isNone ? AppColors.goldAccent : Colors.grey,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'No Coupon (Standard Dining Bill)',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: isNone ? Colors.white : Colors.grey,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }),
            ),

            // Vertical list of beautiful coupon cards
            ...controller.availableCoupons.map((coupon) {
              return Obx(() {
                final isSelected = controller.selectedCoupon.value?.code == coupon.code;
                return GestureDetector(
                  onTap: () {
                    if (isSelected) {
                      controller.selectCoupon(null);
                    } else {
                      controller.selectCoupon(coupon);
                    }
                  },
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      gradient: isSelected
                          ? const LinearGradient(
                              colors: [Color(0xFF0D2D23), Color(0xFF081B15)],
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                            )
                          : null,
                      color: isSelected ? null : const Color(0xFF141312),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: isSelected ? const Color(0xFF4EE3B8) : const Color(0xFF262320),
                        width: isSelected ? 1.5 : 1,
                      ),
                      boxShadow: isSelected
                          ? [
                              BoxShadow(
                                color: const Color(0xFF4EE3B8).withOpacity(0.18),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ]
                          : null,
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 44,
                          height: 44,
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF16483B) : const Color(0xFF1F1D1A),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: isSelected
                                  ? const Color(0xFF4EE3B8).withOpacity(0.4)
                                  : AppColors.goldAccent.withOpacity(0.25),
                            ),
                          ),
                          child: Icon(
                            Icons.local_offer_rounded,
                            color: isSelected ? const Color(0xFF4EE3B8) : AppColors.goldAccent,
                            size: 20,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Flexible(
                                    child: Text(
                                      coupon.name,
                                      style: GoogleFonts.outfit(
                                        fontSize: 14.5,
                                        fontWeight: FontWeight.w700,
                                        color: Colors.white,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                  if (coupon.isVipExclusive) ...[
                                    const SizedBox(width: 6),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1.5),
                                      decoration: BoxDecoration(
                                        color: AppColors.goldAccent.withOpacity(0.15),
                                        borderRadius: BorderRadius.circular(4),
                                        border: Border.all(color: AppColors.goldAccent.withOpacity(0.4)),
                                      ),
                                      child: Text(
                                        'VIP',
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
                                coupon.subtitle,
                                style: GoogleFonts.inter(
                                  fontSize: 11.5,
                                  color: isSelected ? Colors.white70 : Colors.grey[400],
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (coupon.leftCount > 1 || coupon.expiryDate.isNotEmpty) ...[
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Text(
                                      '${coupon.leftCount} Left in Vault',
                                      style: GoogleFonts.outfit(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.w600,
                                        color: isSelected ? const Color(0xFF4EE3B8) : AppColors.goldAccent,
                                      ),
                                    ),
                                    if (coupon.expiryDate.isNotEmpty) ...[
                                      Text(' · ', style: GoogleFonts.inter(color: Colors.grey)),
                                      Text(
                                        'Exp ${coupon.expiryDate}',
                                        style: GoogleFonts.inter(fontSize: 10.5, color: Colors.grey[500]),
                                      ),
                                    ],
                                  ],
                                ),
                              ],
                            ],
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected ? const Color(0xFF4EE3B8) : Colors.transparent,
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: isSelected ? const Color(0xFF4EE3B8) : const Color(0xFF4EE3B8).withOpacity(0.6),
                              width: 1.2,
                            ),
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              if (isSelected) ...[
                                const Icon(Icons.check_rounded, color: Colors.black, size: 13),
                                const SizedBox(width: 3),
                                Text(
                                  'APPLIED',
                                  style: GoogleFonts.outfit(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.black,
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ] else ...[
                                Text(
                                  'APPLY',
                                  style: GoogleFonts.outfit(
                                    fontSize: 11,
                                    fontWeight: FontWeight.w700,
                                    color: const Color(0xFF4EE3B8),
                                    letterSpacing: 0.5,
                                  ),
                                ),
                              ],
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              });
            }),
          ],
          const SizedBox(height: 20),

          // 3. Enter Bill Amount (Bill # removed as requested)
          Text(
            '3. ENTER BILL AMOUNT',
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.goldAccent,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 8),
          TextField(
            controller: controller.grossAmountController,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            onChanged: controller.onGrossAmountChanged,
            style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18),
            decoration: InputDecoration(
              labelText: 'Gross Bill Amount (₹)',
              labelStyle: GoogleFonts.inter(color: Colors.grey, fontSize: 13),
              hintText: 'e.g. 2500',
              hintStyle: GoogleFonts.inter(color: Colors.grey[700], fontSize: 14),
              prefixIcon: Container(
                width: 44,
                alignment: Alignment.center,
                child: Text(
                  '₹',
                  style: GoogleFonts.outfit(color: AppColors.goldAccent, fontWeight: FontWeight.w800, fontSize: 20),
                ),
              ),
              filled: true,
              fillColor: const Color(0xFF141312),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF262320))),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: Color(0xFF262320))),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppColors.goldAccent, width: 1.5)),
            ),
          ),
          const SizedBox(height: 16),

          // Bill Computation Card
          Obx(() {
            return Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1A1612), Color(0xFF120F0D)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF33291E)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Gross Bill Amount', style: GoogleFonts.inter(color: Colors.grey, fontSize: 13)),
                      Text(currencyFormat.format(controller.grossAmount.value), style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        controller.selectedCoupon.value != null ? 'Applied (${controller.selectedCoupon.value!.name})' : 'Coupon Discount',
                        style: GoogleFonts.inter(color: const Color(0xFF4EE3B8), fontSize: 13),
                      ),
                      Text(
                        '- ${currencyFormat.format(controller.discountAmount.value)}',
                        style: GoogleFonts.outfit(color: const Color(0xFF4EE3B8), fontWeight: FontWeight.w700, fontSize: 14),
                      ),
                    ],
                  ),
                  if (controller.tableAdvanceDeduction.value > 0) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            const Icon(Icons.check_circle_outline, color: Color(0xFF4EE3B8), size: 14),
                            const SizedBox(width: 4),
                            Text(
                              'Table Deposit Deduction ${controller.linkedBookingReference.value.isNotEmpty ? "(${controller.linkedBookingReference.value})" : ""}',
                              style: GoogleFonts.inter(color: const Color(0xFF4EE3B8), fontSize: 13, fontWeight: FontWeight.w600),
                            ),
                          ],
                        ),
                        Text(
                          '- ${currencyFormat.format(controller.tableAdvanceDeduction.value)}',
                          style: GoogleFonts.outfit(color: const Color(0xFF4EE3B8), fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                      ],
                    ),
                  ],
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 8),
                    child: Divider(color: Color(0xFF33291E)),
                  ),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Net Amount Payable', style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w800, fontSize: 15)),
                      Text(
                        currencyFormat.format(controller.netPayable.value),
                        style: GoogleFonts.outfit(color: AppColors.goldAccent, fontWeight: FontWeight.w900, fontSize: 20),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 20),

          // 4. Select Payment Mode (Chapter 10.1: Cash, Card, Online, Store Counter QR)
          Text(
            '4. SELECT PAYMENT MODE',
            style: GoogleFonts.outfit(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppColors.goldAccent,
              letterSpacing: 1.2,
            ),
          ),
          const SizedBox(height: 10),
          _buildPaymentModeGrid(),
          const SizedBox(height: 16),

          // Conditional input for Store Counter QR (UTR #)
          Obx(() {
            if (controller.selectedPaymentMode.value == 'STORE_QR') {
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF141312),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF3B2E1E)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        const Icon(Icons.qr_code_scanner_rounded, color: AppColors.goldAccent, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          'Store Counter QR Standee',
                          style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 14),
                        ),
                      ],
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'Scan the restaurant\'s UPI counter standee with GPay/PhonePe/Paytm, complete payment of net amount, then paste the 12-digit UPI UTR below:',
                      style: GoogleFonts.inter(color: Colors.grey, fontSize: 12),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: controller.utrController,
                      keyboardType: TextInputType.number,
                      style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w600),
                      decoration: InputDecoration(
                        labelText: '12-Digit UPI UTR / Ref Number',
                        labelStyle: GoogleFonts.inter(color: Colors.grey, fontSize: 12),
                        hintText: 'e.g. 428901239841',
                        hintStyle: GoogleFonts.inter(color: Colors.grey[700], fontSize: 12),
                        filled: true,
                        fillColor: const Color(0xFF1E1A16),
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
                      ),
                    ),
                  ],
                ),
              );
            } else if (controller.selectedPaymentMode.value == 'ONLINE') {
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: const Color(0xFF0F261E),
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: const Color(0xFF1E4D3C)),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.bolt_rounded, color: Color(0xFF4EE3B8)),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Direct Razorpay Gateway: Net payable will be settled immediately and auto-approved via server webhook.',
                        style: GoogleFonts.inter(color: const Color(0xFFB0DFD2), fontSize: 12),
                      ),
                    ),
                  ],
                ),
              );
            }
            return const SizedBox.shrink();
          }),

          // Submit Button
          Obx(() {
            final isOnline = controller.selectedPaymentMode.value == 'ONLINE';
            final payableText = controller.netPayable.value > 0
                ? 'Pay ₹${controller.netPayable.value.toStringAsFixed(0)} via Razorpay'
                : 'Settle Bill (₹0 Balance)';
            return SizzloButton(
              text: controller.isSubmitting.value
                  ? (isOnline ? 'Launching Razorpay...' : 'Initiating Settlement...')
                  : (isOnline ? payableText : 'Submit for Counter Settlement'),
              isLoading: controller.isSubmitting.value,
              onPressed: controller.submitSettlement,
            );
          }),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildPaymentModeGrid() {
    final modes = [
      {'id': 'STORE_QR', 'title': 'Store QR', 'desc': 'Scan counter standee & enter UTR', 'icon': Icons.qr_code_2_rounded},
      {'id': 'ONLINE', 'title': 'Online Gateway', 'desc': 'Razorpay Instant UPI / Card', 'icon': Icons.flash_on_rounded},
      {'id': 'CASH', 'title': 'Cash Payment', 'desc': 'Hand physical cash to server', 'icon': Icons.payments_outlined},
      {'id': 'CARD', 'title': 'Card (EDC)', 'desc': 'Swipe on physical machine', 'icon': Icons.credit_card_rounded},
    ];

    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        crossAxisSpacing: 10,
        mainAxisSpacing: 10,
        childAspectRatio: 1.45,
      ),
      itemCount: modes.length,
      itemBuilder: (ctx, i) {
        final m = modes[i];
        final id = m['id'] as String;
        return Obx(() {
          final isSelected = controller.selectedPaymentMode.value == id;
          return GestureDetector(
            onTap: () => controller.selectedPaymentMode.value = id,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: isSelected ? const Color(0xFF261E14) : const Color(0xFF141312),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: isSelected ? AppColors.goldAccent : const Color(0xFF262320),
                  width: isSelected ? 1.5 : 1,
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(m['icon'] as IconData, color: isSelected ? AppColors.goldAccent : Colors.grey, size: 22),
                  const SizedBox(height: 6),
                  Text(
                    m['title'] as String,
                    style: GoogleFonts.outfit(
                      fontSize: 13,
                      fontWeight: FontWeight.w700,
                      color: isSelected ? Colors.white : Colors.grey[300],
                    ),
                  ),
                  Text(
                    m['desc'] as String,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                    style: GoogleFonts.inter(fontSize: 10, color: Colors.grey[500]),
                  ),
                ],
              ),
            ),
          );
        });
      },
    );
  }

  Widget _buildSettlementStatusScreen(dynamic settlement) {
    final currencyFormat = NumberFormat.currency(locale: 'en_IN', symbol: '₹', decimalDigits: 0);

    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      physics: const BouncingScrollPhysics(),
      child: Column(
        children: [
          const SizedBox(height: 20),
          if (settlement.isApproved) ...[
            // APPROVED SUCCESS STATE
            Container(
              width: 80,
              height: 80,
              decoration: const BoxDecoration(
                color: Color(0xFF0E382B),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle_rounded, color: Color(0xFF00E676), size: 48),
            ),
            const SizedBox(height: 16),
            Text(
              'Settlement Verified & Approved!',
              style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 6),
            Text(
              'Your dining ticket is completed at ${settlement.outletName}',
              style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[400]),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            // Token summary box
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF1B2A22), Color(0xFF101C16)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF295A48)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('POS Invoice #', style: GoogleFonts.inter(color: Colors.grey, fontSize: 13)),
                      Text(settlement.posInvoiceNumber, style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Net Settled', style: GoogleFonts.inter(color: Colors.grey, fontSize: 13)),
                      Text(currencyFormat.format(settlement.netPayable), style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Loyalty Points Credited', style: GoogleFonts.inter(color: const Color(0xFF4EE3B8), fontSize: 13)),
                      Text('+${settlement.pointsCredited} pts', style: GoogleFonts.outfit(color: const Color(0xFF4EE3B8), fontWeight: FontWeight.w800, fontSize: 18)),
                    ],
                  ),
                  if (settlement.couponCode != null && settlement.couponCode.isNotEmpty) ...[
                    const Divider(color: Color(0xFF295A48), height: 24),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('Coupon Token', style: GoogleFonts.inter(color: Colors.grey, fontSize: 13)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: Colors.red[900]?.withOpacity(0.4), borderRadius: BorderRadius.circular(6)),
                          child: Text('PERMANENTLY BURNED', style: GoogleFonts.outfit(color: Colors.redAccent, fontWeight: FontWeight.w800, fontSize: 11)),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 30),
            SizzloButton(
              text: 'Done & Return Home',
              onPressed: () => controller.completeSettlement(),
            ),
          ] else ...[
            // PENDING CASHIER VERIFICATION STATE (Chapter 10.1)
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: const Color(0xFF332612),
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.goldAccent.withOpacity(0.5), width: 2),
              ),
              child: const Icon(Icons.hourglass_top_rounded, color: AppColors.goldAccent, size: 40),
            ),
            const SizedBox(height: 20),
            Text(
              'Awaiting Cashier Verification',
              style: GoogleFonts.outfit(fontSize: 22, fontWeight: FontWeight.w800, color: Colors.white),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              'Ticket for ${settlement.posInvoiceNumber} has been transmitted to the cashier desk at ${settlement.outletName}. Cashier is verifying your payment mode (${settlement.paymentMode}).',
              style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[400], height: 1.4),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),

            Container(
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: const Color(0xFF141312),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF262320)),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Net Payable', style: GoogleFonts.inter(color: Colors.grey, fontSize: 13)),
                      Text(currencyFormat.format(settlement.netPayable), style: GoogleFonts.outfit(color: AppColors.goldAccent, fontWeight: FontWeight.w800, fontSize: 18)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Payment Mode', style: GoogleFonts.inter(color: Colors.grey, fontSize: 13)),
                      Text(settlement.paymentMode, style: GoogleFonts.outfit(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
                    ],
                  ),
                  if (settlement.upiUtr != null && settlement.upiUtr.isNotEmpty) ...[
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text('UPI UTR', style: GoogleFonts.inter(color: Colors.grey, fontSize: 13)),
                        Text(settlement.upiUtr, style: GoogleFonts.outfit(color: Colors.white70, fontWeight: FontWeight.w500, fontSize: 13)),
                      ],
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 20),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.goldAccent),
                ),
                const SizedBox(width: 10),
                Text(
                  'Auto-refreshing status every 3 seconds...',
                  style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[500]),
                ),
              ],
            ),
            const SizedBox(height: 30),
            OutlinedButton(
              onPressed: () {
                controller.resetForm();
              },
              style: OutlinedButton.styleFrom(
                side: const BorderSide(color: Colors.grey),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
              ),
              child: Text(
                'Cancel & Re-enter Bill',
                style: GoogleFonts.outfit(color: Colors.white, fontSize: 14),
              ),
            ),
          ],
        ],
      ),
    );
  }
}
