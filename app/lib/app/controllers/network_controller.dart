import 'dart:async';
import 'dart:io';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../modules/home/controllers/home_controller.dart';
import '../modules/plans/controllers/plans_controller.dart';
import '../modules/reservations/controllers/reservations_controller.dart';

class NetworkController extends GetxController {
  static NetworkController get to => Get.find<NetworkController>();

  final Connectivity _connectivity = Connectivity();
  StreamSubscription<List<ConnectivityResult>>? _subscription;

  final RxBool isConnected = true.obs;
  final RxBool isChecking = false.obs;
  final RxBool showRestoredBanner = false.obs;
  final Rx<ConnectivityResult> currentConnectionType = ConnectivityResult.none.obs;

  bool _hasHadInitialCheck = false;
  Timer? _restoredTimer;

  @override
  void onInit() {
    super.onInit();
    _initConnectivity();
    _subscription = _connectivity.onConnectivityChanged.listen(_handleConnectivityChanged);
  }

  @override
  void onClose() {
    _subscription?.cancel();
    _restoredTimer?.cancel();
    super.onClose();
  }

  Future<void> _initConnectivity() async {
    try {
      final results = await _connectivity.checkConnectivity();
      await _evaluateConnection(results);
    } catch (_) {
      // Default to true to prevent initial flicker
      isConnected.value = true;
    } finally {
      _hasHadInitialCheck = true;
    }
  }

  void _handleConnectivityChanged(List<ConnectivityResult> results) {
    _evaluateConnection(results);
  }

  Future<void> _evaluateConnection(List<ConnectivityResult> results) async {
    final hasInterface = results.isNotEmpty &&
        results.any((r) => r != ConnectivityResult.none);

    if (!hasInterface) {
      _setOffline();
      return;
    }

    // Update connection type
    if (results.contains(ConnectivityResult.wifi)) {
      currentConnectionType.value = ConnectivityResult.wifi;
    } else if (results.contains(ConnectivityResult.mobile)) {
      currentConnectionType.value = ConnectivityResult.mobile;
    } else if (results.contains(ConnectivityResult.ethernet)) {
      currentConnectionType.value = ConnectivityResult.ethernet;
    } else {
      currentConnectionType.value = results.first;
    }

    // Verify true internet reachability via lightweight DNS lookup
    final hasInternet = await _checkRealInternetAccess();

    if (hasInternet) {
      _setOnline();
    } else {
      _setOffline();
    }
  }

  Future<bool> _checkRealInternetAccess() async {
    try {
      final lookup = await InternetAddress.lookup('google.com')
          .timeout(const Duration(seconds: 4));
      return lookup.isNotEmpty && lookup[0].rawAddress.isNotEmpty;
    } catch (_) {
      // Fallback check against backend host
      try {
        final backendLookup = await InternetAddress.lookup('cheeragskitchen.in')
            .timeout(const Duration(seconds: 4));
        return backendLookup.isNotEmpty && backendLookup[0].rawAddress.isNotEmpty;
      } catch (_) {
        return false;
      }
    }
  }

  void _setOffline() {
    _restoredTimer?.cancel();
    showRestoredBanner.value = false;
    isConnected.value = false;
  }

  void _setOnline() {
    final wasOffline = !isConnected.value && _hasHadInitialCheck;
    isConnected.value = true;

    if (wasOffline) {
      showRestoredBanner.value = true;
      _restoredTimer?.cancel();
      _restoredTimer = Timer(const Duration(seconds: 3), () {
        showRestoredBanner.value = false;
      });

      // Auto-refresh active screens upon reconnection
      _triggerAutoRefresh();
    }
  }

  Future<bool> retryConnection() async {
    if (isChecking.value) return isConnected.value;

    isChecking.value = true;
    try {
      final results = await _connectivity.checkConnectivity();
      await _evaluateConnection(results);
      return isConnected.value;
    } finally {
      isChecking.value = false;
    }
  }

  void _triggerAutoRefresh() {
    try {
      if (Get.isRegistered<HomeController>()) {
        Get.find<HomeController>().loadDashboardData();
      }
      if (Get.isRegistered<PlansController>()) {
        Get.find<PlansController>().loadPlans();
      }
      if (Get.isRegistered<ReservationsController>()) {
        Get.find<ReservationsController>().loadReservations();
      }
    } catch (_) {}
  }
}

/// Global Network Status Banner Overlay
class NetworkStatusOverlay extends StatelessWidget {
  const NetworkStatusOverlay({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    if (!Get.isRegistered<NetworkController>()) {
      return const SizedBox.shrink();
    }

    final controller = NetworkController.to;

    return Obx(() {
      final isOffline = !controller.isConnected.value;
      final showRestored = controller.showRestoredBanner.value;

      if (!isOffline && !showRestored) {
        return const SizedBox.shrink();
      }

      return Positioned(
        top: 0,
        left: 0,
        right: 0,
        child: Material(
          color: Colors.transparent,
          child: SafeArea(
            bottom: false,
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              curve: Curves.easeInOut,
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isOffline ? const Color(0xFF2C130D) : const Color(0xFF0D281E),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isOffline ? const Color(0xFFEF4444).withOpacity(0.5) : const Color(0xFF10B981).withOpacity(0.5),
                  width: 1.2,
                ),
                boxShadow: [
                  BoxShadow(
                    color: isOffline
                        ? const Color(0xFFEF4444).withOpacity(0.2)
                        : const Color(0xFF10B981).withOpacity(0.2),
                    blurRadius: 16,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: isOffline ? const Color(0xFFEF4444).withOpacity(0.2) : const Color(0xFF10B981).withOpacity(0.2),
                    ),
                    child: Icon(
                      isOffline ? Icons.wifi_off_rounded : Icons.wifi_rounded,
                      color: isOffline ? const Color(0xFFEF4444) : const Color(0xFF10B981),
                      size: 18,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          isOffline ? 'No Internet Connection' : 'Back Online',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                          ),
                        ),
                        Text(
                          isOffline
                              ? 'Please check your Wi-Fi or mobile data.'
                              : 'Connection restored successfully.',
                          style: GoogleFonts.inter(
                            fontSize: 11,
                            color: isOffline ? Colors.grey[400] : const Color(0xFF4EE3B8),
                          ),
                        ),
                      ],
                    ),
                  ),
                  if (isOffline)
                    GestureDetector(
                      onTap: controller.isChecking.value ? null : controller.retryConnection,
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: const Color(0xFFEF4444).withOpacity(0.18),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: const Color(0xFFEF4444).withOpacity(0.4)),
                        ),
                        child: controller.isChecking.value
                            ? const SizedBox(
                                width: 14,
                                height: 14,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2,
                                  color: Color(0xFFEF4444),
                                ),
                              )
                            : Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.refresh_rounded, size: 14, color: Colors.white),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Retry',
                                    style: GoogleFonts.outfit(
                                      fontSize: 12,
                                      fontWeight: FontWeight.w700,
                                      color: Colors.white,
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      );
    });
  }
}
