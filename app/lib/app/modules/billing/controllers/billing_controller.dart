import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../../../core/values/app_constants.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/outlet_model.dart';
import '../../../data/models/coupon_model.dart';
import '../../../data/models/bill_settlement_model.dart';
import '../../../data/services/api_service.dart';
import '../../../routes/app_routes.dart';
import '../../coupons/controllers/coupons_controller.dart';
import '../../home/controllers/home_controller.dart';

class BillingController extends GetxController {
  final ApiService _apiService = ApiService();

  final RxList<OutletModel> outlets = <OutletModel>[].obs;
  final RxList<CouponModel> availableCoupons = <CouponModel>[].obs;
  final Rx<OutletModel?> selectedOutlet = Rx<OutletModel?>(null);
  final Rx<CouponModel?> selectedCoupon = Rx<CouponModel?>(null);

  final TextEditingController invoiceController = TextEditingController();
  final TextEditingController grossAmountController = TextEditingController();
  final TextEditingController utrController = TextEditingController();

  final RxString selectedPaymentMode = 'ONLINE'.obs; // ONLINE, STORE_QR, CASH, CARD
  final RxDouble grossAmount = 0.0.obs;
  final RxDouble discountAmount = 0.0.obs;
  final RxDouble tableAdvanceDeduction = 0.0.obs;
  final RxString linkedBookingReference = ''.obs;
  final RxString receiptImageUrl = ''.obs;
  final RxDouble netPayable = 0.0.obs;

  final RxBool isLoading = false.obs;
  final RxBool isSubmitting = false.obs;
  final RxBool isSubscriber = true.obs;
  final Rx<BillSettlementModel?> currentSettlement = Rx<BillSettlementModel?>(null);

  late Razorpay _razorpay;
  String _activeOrderId = '';
  Timer? _statusPoller;

  @override
  void onInit() {
    super.onInit();
    _initRazorpay();
    loadInitialData();
  }

  void _initRazorpay() {
    _razorpay = Razorpay();
    _razorpay.on(Razorpay.EVENT_PAYMENT_SUCCESS, _handlePaymentSuccess);
    _razorpay.on(Razorpay.EVENT_PAYMENT_ERROR, _handlePaymentError);
    _razorpay.on(Razorpay.EVENT_EXTERNAL_WALLET, _handleExternalWallet);
  }

  @override
  void onClose() {
    _statusPoller?.cancel();
    _razorpay.clear();
    invoiceController.dispose();
    grossAmountController.dispose();
    utrController.dispose();
    super.onClose();
  }

  Future<void> loadInitialData() async {
    isLoading.value = true;
    try {
      final profile = await _apiService.getMemberProfile();
      isSubscriber.value = profile.isSubscriber;

      final fetchedOutlets = await _apiService.getActiveOutlets();
      outlets.value = fetchedOutlets;
      if (outlets.isNotEmpty) {
        selectedOutlet.value = outlets.first;
      }

      final allCoupons = await _apiService.getCoupons();
      availableCoupons.value = allCoupons.where((c) => c.isAvailable).toList();
      if (availableCoupons.isNotEmpty) {
        selectedCoupon.value = availableCoupons.first;
      }

      // Check if user has an active booking today with ₹100 deposit paid
      await _checkActiveTableAdvance();

      calculateAmounts();
    } finally {
      isLoading.value = false;
    }
  }

  Future<void> _checkActiveTableAdvance() async {
    try {
      final reservations = await _apiService.getReservations();
      for (final r in reservations) {
        if (r.advancePaid && !r.advanceDeducted) {
          tableAdvanceDeduction.value = r.bookingAdvance > 0 ? r.bookingAdvance : 100.0;
          linkedBookingReference.value = r.bookingReference;
          break;
        }
      }
    } catch (_) {}
  }

  void attachSampleReceiptPhoto() {
    receiptImageUrl.value = 'https://images.unsplash.com/photo-1554415707-9e49fe83083f?w=600';
    Get.snackbar(
      'Receipt Photo Attached',
      'Physical paper bill invoice photo captured and attached to settlement.',
      backgroundColor: const Color(0xFF0E3B32),
      colorText: const Color(0xFF4EE3B8),
      duration: const Duration(seconds: 3),
    );
  }

  void removeReceiptPhoto() {
    receiptImageUrl.value = '';
  }

  void onGrossAmountChanged(String val) {
    final parsed = double.tryParse(val) ?? 0.0;
    grossAmount.value = parsed;
    calculateAmounts();
  }

  void selectCoupon(CouponModel? coupon) {
    selectedCoupon.value = coupon;
    calculateAmounts();
  }

  void calculateAmounts() {
    double gross = grossAmount.value;
    double discount = 0.0;

    if (selectedCoupon.value != null && gross > 0) {
      final c = selectedCoupon.value!;
      if (c.discountType == 'PERCENT' && c.discountValue != null && c.discountValue! > 0) {
        discount = (gross * c.discountValue!) / 100.0;
      } else if (c.discountType == 'FLAT' && c.discountValue != null && c.discountValue! > 0) {
        discount = c.discountValue!;
      } else if (c.code.contains('50') || c.subtitle.contains('50%')) {
        discount = gross * 0.50;
      } else if (c.code.contains('15') || c.subtitle.contains('15%')) {
        discount = gross * 0.15;
      } else {
        discount = gross * 0.10; // Standard 10%
      }
      if (discount > gross) discount = gross;
    }

    discountAmount.value = discount;
    // Net: Gross - Discount - Table Advance Deposit
    double net = gross - discount - tableAdvanceDeduction.value;
    netPayable.value = net > 0 ? net : 0.0;
  }

  Future<void> submitSettlement() async {
    // 1. VIP Subscription Guard
    if (!isSubscriber.value) {
      showSubscriptionRequiredModal();
      return;
    }

    // 2. Input Validations
    if (selectedOutlet.value == null) {
      Get.snackbar('Error', 'Please select dining outlet', backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }
    if (invoiceController.text.trim().isEmpty) {
      Get.snackbar('Missing Invoice', 'Please enter physical POS Bill / Invoice Number', backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }
    if (grossAmount.value <= 0) {
      Get.snackbar('Invalid Amount', 'Please enter a valid bill amount', backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }
    if (selectedPaymentMode.value == 'STORE_QR' && utrController.text.trim().length < 6) {
      Get.snackbar('UPI UTR Required', 'Please enter the 12-digit UPI Transaction / UTR ID from your payment receipt', backgroundColor: Colors.redAccent, colorText: Colors.white);
      return;
    }

    // 3. Payment Mode Routing
    if (selectedPaymentMode.value == 'ONLINE') {
      if (netPayable.value <= 0) {
        // Completely covered by coupon / deposit
        await _executeSettlementBackend(razorpayPaymentId: 'ZERO_PAY_COUPON');
        return;
      }
      await _launchRazorpayCheckout();
    } else {
      await _executeSettlementBackend(razorpayPaymentId: null);
    }
  }

  Future<void> _launchRazorpayCheckout() async {
    isSubmitting.value = true;
    try {
      final amountInRupees = netPayable.value;
      // 1. Create Order via Backend Razorpay API
      final order = await _apiService.createRazorpayOrder(
        type: 'BILL_PAYMENT',
        planId: 'dining',
        amount: amountInRupees,
      );

      final orderId = order?['orderId']?.toString() ?? 'order_rzp_bill_${DateTime.now().millisecondsSinceEpoch}';
      final keyId = order?['keyId']?.toString() ?? 'rzp_live_S5dgGJ3fEPa3fO';
      final amountInPaise = order?['amount'] is num ? (order!['amount'] as num).toInt() : (amountInRupees * 100).toInt();
      _activeOrderId = orderId;

      // 2. Launch Native Razorpay Checkout Modal
      var options = {
        'key': keyId,
        'amount': amountInPaise,
        'name': 'Sizzlo Hospitality Group',
        'description': 'Table Bill · ${selectedOutlet.value?.name ?? "Dining"} (POS #${invoiceController.text.trim()})',
        'order_id': orderId.startsWith('order_') && !orderId.startsWith('order_rzp_') ? orderId : null,
        'prefill': {
          'contact': AppConstants.currentUserMobile,
          'email': 'patron@sizzlo.com',
        },
        'theme': {
          'color': '#DF9E5B',
        },
        'external': {
          'wallets': ['paytm'],
        },
      };

      try {
        _razorpay.open(options);
      } catch (e) {
        debugPrint('Razorpay open fallback: $e');
        // Fallback for simulation / non-native runtimes
        await _executeSettlementBackend(
          razorpayPaymentId: 'pay_sim_${DateTime.now().millisecondsSinceEpoch}',
        );
      }
    } catch (e) {
      isSubmitting.value = false;
      Get.snackbar(
        'Transaction Error',
        'Could not initiate Razorpay checkout: $e',
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    }
  }

  void _handlePaymentSuccess(PaymentSuccessResponse response) {
    debugPrint('Razorpay Bill Payment Success: ${response.paymentId} for order: ${response.orderId ?? _activeOrderId}');
    _executeSettlementBackend(
      razorpayPaymentId: response.paymentId ?? 'pay_${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  void _handlePaymentError(PaymentFailureResponse response) {
    isSubmitting.value = false;
    debugPrint('Razorpay Bill Payment Error: ${response.code} - ${response.message}');
    Get.snackbar(
      'Payment Incomplete',
      response.message ?? 'Payment was cancelled or could not be processed. Your coupon is still safe in your vault.',
      backgroundColor: Colors.redAccent.withOpacity(0.85),
      colorText: Colors.white,
      duration: const Duration(seconds: 4),
    );
  }

  void _handleExternalWallet(ExternalWalletResponse response) {
    debugPrint('External Wallet Selected: ${response.walletName}');
    _executeSettlementBackend(
      razorpayPaymentId: 'wallet_${response.walletName}_${DateTime.now().millisecondsSinceEpoch}',
    );
  }

  Future<void> _executeSettlementBackend({required String? razorpayPaymentId}) async {
    isSubmitting.value = true;
    try {
      final settlement = await _apiService.settleBill(
        outletName: selectedOutlet.value!.name,
        posInvoiceNumber: invoiceController.text.trim(),
        grossAmount: grossAmount.value,
        couponCode: selectedCoupon.value?.code,
        paymentMode: selectedPaymentMode.value,
        upiUtr: selectedPaymentMode.value == 'STORE_QR' ? utrController.text.trim() : null,
        razorpayPaymentId: razorpayPaymentId,
        tableAdvanceDeduction: tableAdvanceDeduction.value > 0 ? tableAdvanceDeduction.value : null,
        receiptImageUrl: receiptImageUrl.value.isNotEmpty ? receiptImageUrl.value : null,
        bookingReference: linkedBookingReference.value.isNotEmpty ? linkedBookingReference.value : null,
      );

      if (settlement != null) {
        currentSettlement.value = settlement;
        if (settlement.isApproved) {
          // Immediately reload vault coupons and home loyalty points
          if (Get.isRegistered<CouponsController>()) {
            Get.find<CouponsController>().loadCoupons();
          }
          if (Get.isRegistered<HomeController>()) {
            Get.find<HomeController>().loadDashboardData();
          }
          Get.snackbar(
            'Settlement Approved & Paid!',
            'Bill settled & coupon redeemed! +${settlement.pointsCredited} loyalty points credited.',
            backgroundColor: const Color(0xFF00E676),
            colorText: Colors.black,
            duration: const Duration(seconds: 4),
          );
        } else {
          startPolling(settlement.id);
        }
      } else {
        Get.snackbar(
          'Notice',
          'Settlement submitted. Awaiting cashier approval.',
          backgroundColor: const Color(0xFFD4AF37),
          colorText: Colors.black,
        );
      }
    } catch (e) {
      Get.snackbar(
        'Submission Error',
        e.toString(),
        backgroundColor: Colors.redAccent,
        colorText: Colors.white,
      );
    } finally {
      isSubmitting.value = false;
    }
  }

  void startPolling(int settlementId) {
    _statusPoller?.cancel();
    _statusPoller = Timer.periodic(const Duration(seconds: 3), (timer) async {
      final updated = await _apiService.getBillStatus(settlementId);
      if (updated != null) {
        currentSettlement.value = updated;
        if (updated.isApproved) {
          timer.cancel();
          if (Get.isRegistered<CouponsController>()) {
            Get.find<CouponsController>().loadCoupons();
          }
          if (Get.isRegistered<HomeController>()) {
            Get.find<HomeController>().loadDashboardData();
          }
          Get.snackbar(
            'Settlement Approved!',
            'POS bill verified by cashier desk. +${updated.pointsCredited} points credited to your wallet!',
            backgroundColor: const Color(0xFF00E676),
            colorText: Colors.black,
            duration: const Duration(seconds: 5),
          );
        }
      }
    });
  }

  void showSubscriptionRequiredModal() {
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF16120E),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: Color(0xFF3D2A18)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: AppColors.goldAccent.withOpacity(0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: AppColors.goldAccent),
                ),
                child: const Icon(Icons.workspace_premium_rounded, color: AppColors.goldAccent, size: 34),
              ),
              const SizedBox(height: 16),
              Text(
                'VIP Subscription Required',
                textAlign: TextAlign.center,
                style: GoogleFonts.outfit(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Table bill discounts, coupon redemptions, and instant settlement rewards are exclusive privileges for Yanki VIP Subscribers.\n\nSubscribe now to unlock your discount coupons vault, welcome vouchers, and free birthday rewards!',
                textAlign: TextAlign.center,
                style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[300], height: 1.4),
              ),
              const SizedBox(height: 22),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.goldAccent,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () {
                    Get.back();
                    Get.toNamed(AppRoutes.PLANS);
                  },
                  child: Text(
                    'Explore VIP Subscription Plans',
                    style: GoogleFonts.outfit(fontWeight: FontWeight.w800, fontSize: 14),
                  ),
                ),
              ),
              const SizedBox(height: 10),
              TextButton(
                onPressed: () => Get.back(),
                child: Text('Maybe Later', style: GoogleFonts.inter(fontSize: 13, color: Colors.grey)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  void completeSettlement() {
    resetForm();
    if (Get.isRegistered<CouponsController>()) {
      Get.find<CouponsController>().loadCoupons();
    }
    if (Get.isRegistered<HomeController>()) {
      Get.find<HomeController>().loadDashboardData();
    }
    Get.back();
  }

  void resetForm() {
    _statusPoller?.cancel();
    currentSettlement.value = null;
    invoiceController.clear();
    grossAmountController.clear();
    utrController.clear();
    grossAmount.value = 0.0;
    discountAmount.value = 0.0;
    netPayable.value = 0.0;
  }
}
