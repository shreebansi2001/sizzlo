import 'dart:async';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../../data/models/outlet_model.dart';
import '../../../data/models/coupon_model.dart';
import '../../../data/models/bill_settlement_model.dart';
import '../../../data/services/api_service.dart';
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

  final RxString selectedPaymentMode = 'STORE_QR'.obs; // CASH, CARD, ONLINE, STORE_QR
  final RxDouble grossAmount = 0.0.obs;
  final RxDouble discountAmount = 0.0.obs;
  final RxDouble netPayable = 0.0.obs;

  final RxBool isLoading = false.obs;
  final RxBool isSubmitting = false.obs;
  final Rx<BillSettlementModel?> currentSettlement = Rx<BillSettlementModel?>(null);

  Timer? _statusPoller;

  @override
  void onInit() {
    super.onInit();
    loadInitialData();
  }

  @override
  void onClose() {
    _statusPoller?.cancel();
    invoiceController.dispose();
    grossAmountController.dispose();
    utrController.dispose();
    super.onClose();
  }

  Future<void> loadInitialData() async {
    isLoading.value = true;
    try {
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

      calculateAmounts();
    } finally {
      isLoading.value = false;
    }
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
      if (c.code.contains('50') || c.subtitle.contains('50%')) {
        discount = gross * 0.50;
      } else if (c.code.contains('15') || c.subtitle.contains('15%')) {
        discount = gross * 0.15;
      } else {
        discount = gross * 0.10; // Standard 10%
      }
      if (discount > gross) discount = gross;
    }

    discountAmount.value = discount;
    double net = gross - discount;
    netPayable.value = net > 0 ? net : 0.0;
  }

  Future<void> submitSettlement() async {
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

    isSubmitting.value = true;
    try {
      String? razorpayPaymentId;
      if (selectedPaymentMode.value == 'ONLINE') {
        // Trigger Razorpay order & verification simulation
        await _apiService.createRazorpayOrder(
          type: 'BILL_PAYMENT',
          planId: 'dining',
          amount: netPayable.value,
        );
        razorpayPaymentId = 'pay_rzp_bill_${DateTime.now().millisecondsSinceEpoch}';
      }

      final settlement = await _apiService.settleBill(
        outletName: selectedOutlet.value!.name,
        posInvoiceNumber: invoiceController.text.trim(),
        grossAmount: grossAmount.value,
        couponCode: selectedCoupon.value?.code,
        paymentMode: selectedPaymentMode.value,
        upiUtr: selectedPaymentMode.value == 'STORE_QR' ? utrController.text.trim() : null,
        razorpayPaymentId: razorpayPaymentId,
      );

      if (settlement != null) {
        currentSettlement.value = settlement;
        if (!settlement.isApproved) {
          startPolling(settlement.id);
        }
      } else {
        Get.snackbar('Notice', 'Settlement submitted. Awaiting cashier approval.', backgroundColor: const Color(0xFFD4AF37), colorText: Colors.black);
      }
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
