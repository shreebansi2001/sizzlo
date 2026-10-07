import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../controllers/outlets_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../data/models/outlet_model.dart';
import '../../../routes/app_routes.dart';

class OutletsView extends GetView<OutletsController> {
  const OutletsView({Key? key}) : super(key: key);

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
          'Store Locator & Outlets',
          style: GoogleFonts.outfit(
            fontSize: 20,
            fontWeight: FontWeight.w700,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Top Navigation Bar: Active vs Upcoming
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: const Color(0xFF141312),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xFF262320)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Obx(() {
                    final isSelected = controller.currentTabIndex.value == 0;
                    return GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => controller.switchTab(0),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF2C241B) : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          border: isSelected ? Border.all(color: AppColors.goldAccent, width: 1) : null,
                        ),
                        child: Center(
                          child: Text(
                            'Active Outlets',
                            style: GoogleFonts.outfit(
                              fontSize: 14,
                              fontWeight: FontWeight.w700,
                              color: isSelected ? AppColors.goldAccent : Colors.grey,
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                ),
                Expanded(
                  child: Obx(() {
                    final isSelected = controller.currentTabIndex.value == 1;
                    return GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => controller.switchTab(1),
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF2C241B) : Colors.transparent,
                          borderRadius: BorderRadius.circular(12),
                          border: isSelected ? Border.all(color: AppColors.goldAccent, width: 1) : null,
                        ),
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                'Coming Soon',
                                style: GoogleFonts.outfit(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w700,
                                  color: isSelected ? AppColors.goldAccent : Colors.grey,
                                ),
                              ),
                              const SizedBox(width: 6),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFD4AF37),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(
                                  'NEW',
                                  style: GoogleFonts.outfit(
                                    fontSize: 9,
                                    fontWeight: FontWeight.w900,
                                    color: Colors.black,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),

          // Brand Filter Bar (Only for Active Outlets)
          Obx(() {
            if (controller.currentTabIndex.value != 0) return const SizedBox.shrink();
            return SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
              physics: const BouncingScrollPhysics(),
              child: Row(
                children: controller.brandTabs.map((brand) {
                  final isSelected = controller.selectedBrandFilter.value == brand;
                  return GestureDetector(
                    onTap: () => controller.filterBrand(brand),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF0E382B) : const Color(0xFF141312),
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? const Color(0xFF4EE3B8) : const Color(0xFF262320),
                        ),
                      ),
                      child: Text(
                        brand,
                        style: GoogleFonts.outfit(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isSelected ? const Color(0xFF4EE3B8) : Colors.grey[400],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            );
          }),

          // Content List
          Expanded(
            child: Obx(() {
              if (controller.isLoading.value) {
                return const Center(child: CircularProgressIndicator(color: AppColors.goldAccent));
              }

              if (controller.currentTabIndex.value == 0) {
                return _buildActiveOutletsList();
              } else {
                return _buildUpcomingOutletsList();
              }
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildActiveOutletsList() {
    if (controller.activeOutlets.isEmpty) {
      return Center(
        child: Text(
          'No outlets found for selected brand.',
          style: GoogleFonts.inter(color: Colors.grey),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      physics: const BouncingScrollPhysics(),
      itemCount: controller.activeOutlets.length,
      itemBuilder: (ctx, i) {
        final outlet = controller.activeOutlets[i];
        return _buildActiveOutletCard(outlet, i);
      },
    );
  }

  Widget _buildActiveOutletCard(OutletModel outlet, int index) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: const Color(0xFF141312),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF262320)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Banner Image & Badges
          Stack(
            children: [
              ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                child: Image.network(
                  outlet.imageUrl,
                  height: 160,
                  width: double.infinity,
                  fit: BoxFit.cover,
                  errorBuilder: (ctx, _, __) => Container(
                    height: 160,
                    color: const Color(0xFF262320),
                    child: const Center(child: Icon(Icons.restaurant, color: Colors.grey, size: 40)),
                  ),
                ),
              ),
              Positioned(
                top: 12,
                left: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF00E676).withOpacity(0.9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.circle, color: Colors.black, size: 8),
                      const SizedBox(width: 4),
                      Text(
                        'OPEN NOW',
                        style: GoogleFonts.outfit(
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          color: Colors.black,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.7),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: AppColors.goldAccent.withOpacity(0.5)),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.star_rounded, color: AppColors.goldAccent, size: 14),
                      const SizedBox(width: 4),
                      Text(
                        outlet.rating.toString(),
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

          // Details
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        outlet.name,
                        style: GoogleFonts.outfit(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    Text(
                      '${(1.2 + (index * 0.8)).toStringAsFixed(1)} km away',
                      style: GoogleFonts.inter(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF4EE3B8),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  outlet.address,
                  style: GoogleFonts.inter(fontSize: 13, color: Colors.grey[400]),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Icon(Icons.access_time_rounded, color: Colors.grey[600], size: 14),
                    const SizedBox(width: 6),
                    Text(
                      outlet.openingHours,
                      style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[500]),
                    ),
                  ],
                ),
                const SizedBox(height: 14),

                // Direct Action Buttons
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          Get.snackbar('Google Maps', 'Deep-linking to driving route for ${outlet.name}', backgroundColor: const Color(0xFF1E1A16), colorText: Colors.white);
                        },
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFF3B2E1E)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                        ),
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.navigation_rounded, size: 14, color: AppColors.goldAccent),
                              const SizedBox(width: 4),
                              Text('Directions', style: GoogleFonts.outfit(fontSize: 12, color: Colors.white)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: OutlinedButton(
                        onPressed: () {
                          Get.snackbar('Calling Outlet', 'Dialing hostess desk at ${outlet.contactNumber}', backgroundColor: const Color(0xFF0F261E), colorText: Colors.white);
                        },
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Color(0xFF1E4D3C)),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                        ),
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.call_rounded, size: 14, color: Color(0xFF4EE3B8)),
                              const SizedBox(width: 4),
                              Text('Call Desk', style: GoogleFonts.outfit(fontSize: 12, color: Colors.white)),
                            ],
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton(
                        onPressed: () => Get.toNamed(AppRoutes.RESERVATIONS),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.goldAccent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                          padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 4),
                        ),
                        child: FittedBox(
                          fit: BoxFit.scaleDown,
                          child: Text('Book Table', style: GoogleFonts.outfit(fontSize: 12, fontWeight: FontWeight.w700, color: Colors.black)),
                        ),
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

  Widget _buildUpcomingOutletsList() {
    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      physics: const BouncingScrollPhysics(),
      itemCount: controller.upcomingOutlets.length,
      itemBuilder: (ctx, i) {
        final outlet = controller.upcomingOutlets[i];
        return Container(
          margin: const EdgeInsets.only(bottom: 20),
          decoration: BoxDecoration(
            color: const Color(0xFF141312),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: const Color(0xFF332612)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Stack(
                children: [
                  ClipRRect(
                    borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
                    child: Image.network(
                      outlet.imageUrl,
                      height: 150,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, _, __) => Container(
                        height: 150,
                        color: const Color(0xFF262320),
                        child: const Center(child: Icon(Icons.storefront, color: Colors.grey, size: 40)),
                      ),
                    ),
                  ),
                  Positioned(
                    top: 12,
                    left: 12,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: AppColors.goldAccent,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        'COMING SOON',
                        style: GoogleFonts.outfit(
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          color: Colors.black,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
              Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      outlet.name,
                      style: GoogleFonts.outfit(
                        fontSize: 18,
                        fontWeight: FontWeight.w700,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      outlet.conceptTag,
                      style: GoogleFonts.inter(
                        fontSize: 13,
                        fontWeight: FontWeight.w600,
                        color: const Color(0xFF4EE3B8),
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      outlet.targetLaunchDate,
                      style: GoogleFonts.inter(fontSize: 12, color: Colors.grey[400]),
                    ),
                    const SizedBox(height: 16),
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton.icon(
                        icon: const Icon(Icons.notifications_active_rounded, size: 18, color: Colors.black),
                        label: Text(
                          'Notify Me on Launch + Get Opening Voucher',
                          style: GoogleFonts.outfit(
                            fontSize: 13,
                            fontWeight: FontWeight.w800,
                            color: Colors.black,
                          ),
                        ),
                        onPressed: () => controller.notifyMeOnLaunch(outlet.name),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.goldAccent,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          padding: const EdgeInsets.symmetric(vertical: 12),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
