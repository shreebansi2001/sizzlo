import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/reservations_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../widgets/sizzlo_button.dart';
import '../../../widgets/section_header.dart';

class ReservationsView extends GetView<ReservationsController> {
  final bool isTab;

  const ReservationsView({Key? key, this.isTab = false}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Table Reservations'),
        automaticallyImplyLeading: !isTab,
        leading: isTab
            ? null
            : IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 18),
                onPressed: () => Get.back(),
              ),
      ),
      body: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Quick Booking Card
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.border),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text(
                            'Reserve a Table',
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                              fontFamily: 'Playfair Display',
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: AppColors.gold.withOpacity(0.15),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.gold.withOpacity(0.4)),
                            ),
                            child: Row(
                              children: const [
                                Icon(Icons.stars, size: 13, color: AppColors.gold),
                                SizedBox(width: 5),
                                Text(
                                  'VIP Priority',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: AppColors.gold,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Select Outlet
                      const Text(
                        'SELECT VENUE',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                          color: Colors.white60,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Obx(
                        () => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 2),
                          decoration: BoxDecoration(
                            color: const Color(0xFF1B221E),
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(color: Colors.white.withOpacity(0.08)),
                          ),
                          child: DropdownButtonHideUnderline(
                            child: DropdownButton<String>(
                              isExpanded: true,
                              dropdownColor: const Color(0xFF1B221E),
                              iconEnabledColor: AppColors.gold,
                              value: controller.selectedOutlet.value,
                              style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
                              items: controller.outlets.map((o) {
                                return DropdownMenuItem(
                                  value: o,
                                  child: Text(o, style: const TextStyle(fontSize: 14, color: Colors.white)),
                                );
                              }).toList(),
                              onChanged: (val) {
                                if (val != null) controller.selectedOutlet.value = val;
                              },
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 16),

                      // Guests & VIP
                      Row(
                        children: [
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'GUESTS',
                                  style: TextStyle(
                                    fontSize: 11,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 1.2,
                                    color: Colors.white60,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Obx(
                                  () => Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFF1B221E),
                                      borderRadius: BorderRadius.circular(14),
                                      border: Border.all(color: Colors.white.withOpacity(0.08)),
                                    ),
                                    child: Row(
                                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                      children: [
                                        IconButton(
                                          icon: const Icon(Icons.remove_circle_outline_rounded, size: 22, color: AppColors.flame),
                                          onPressed: () {
                                            if (controller.guestCount.value > 1) {
                                              controller.guestCount.value--;
                                            }
                                          },
                                        ),
                                        Text(
                                          '${controller.guestCount.value} Guests',
                                          style: const TextStyle(
                                            fontSize: 15,
                                            fontWeight: FontWeight.bold,
                                            color: Colors.white,
                                          ),
                                        ),
                                        IconButton(
                                          icon: const Icon(Icons.add_circle_outline_rounded, size: 22, color: AppColors.flame),
                                          onPressed: () {
                                            if (controller.guestCount.value < 20) {
                                              controller.guestCount.value++;
                                            }
                                          },
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 16),

                      // Time Slot Selector
                      const Text(
                        'TIME SLOT',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                          color: Colors.white60,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Obx(
                        () => Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: controller.timeSlots.map((slot) {
                            final isSel = controller.selectedTimeSlot.value == slot;
                            return GestureDetector(
                              onTap: () => controller.selectedTimeSlot.value = slot,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
                                decoration: BoxDecoration(
                                  color: isSel ? const Color(0xFF163E33) : const Color(0xFF1B221E),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: isSel ? const Color(0xFF4EE3B8) : Colors.white.withOpacity(0.08),
                                    width: 1.2,
                                  ),
                                ),
                                child: Text(
                                  slot,
                                  style: TextStyle(
                                    fontSize: 12,
                                    fontWeight: isSel ? FontWeight.bold : FontWeight.w500,
                                    color: isSel ? const Color(0xFF4EE3B8) : Colors.white70,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),

                      const SizedBox(height: 22),

                      // Submit Button
                      Obx(
                        () => SizzloButton(
                          text: 'Reserve VIP Table',
                          isLoading: controller.isSubmitting.value,
                          isGold: true,
                          onPressed: controller.confirmAndBookTable,
                        ),
                      ),
                    ],
                  ),
                ),

                const SizedBox(height: 28),

                // My Reservations Section
                SectionHeader(title: 'Your Bookings'),
                Obx(() {
                  if (controller.reservations.isEmpty) {
                    return Center(
                      child: Padding(
                        padding: const EdgeInsets.all(24.0),
                        child: Text(
                          'No active reservations',
                          style: TextStyle(color: Colors.white.withOpacity(0.5)),
                        ),
                      ),
                    );
                  }

                  return ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: controller.reservations.length,
                    itemBuilder: (context, index) {
                      final r = controller.reservations[index];
                      final isCancelled = r.status.toLowerCase() == 'cancelled';
                      return Container(
                        margin: const EdgeInsets.only(bottom: 12),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFF141816),
                          borderRadius: BorderRadius.circular(18),
                          border: Border.all(
                            color: isCancelled
                                ? Colors.redAccent.withOpacity(0.15)
                                : Colors.white.withOpacity(0.08),
                          ),
                        ),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  width: 48,
                                  height: 48,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF1B221E),
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  child: Icon(
                                    Icons.table_restaurant_outlined,
                                    color: isCancelled ? Colors.white38 : AppColors.gold,
                                  ),
                                ),
                                const SizedBox(width: 14),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                        children: [
                                          Text(
                                            r.outlet,
                                            style: TextStyle(
                                              fontWeight: FontWeight.bold,
                                              fontSize: 15,
                                              color: isCancelled ? Colors.white54 : Colors.white,
                                            ),
                                          ),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                            decoration: BoxDecoration(
                                              color: isCancelled
                                                  ? Colors.redAccent.withOpacity(0.15)
                                                  : AppColors.success.withOpacity(0.15),
                                              borderRadius: BorderRadius.circular(8),
                                            ),
                                            child: Text(
                                              r.status,
                                              style: TextStyle(
                                                color: isCancelled ? Colors.redAccent : AppColors.success,
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        '${r.reservationTime} · ${r.guests} Guests (Ref: ${r.bookingReference})',
                                        style: TextStyle(
                                          fontSize: 12,
                                          color: Colors.white.withOpacity(0.6),
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            if (!isCancelled) ...[
                              const SizedBox(height: 12),
                              Divider(color: Colors.white.withOpacity(0.06), height: 1),
                              const SizedBox(height: 8),
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  if (r.specialRequests != null && r.specialRequests!.isNotEmpty)
                                    Expanded(
                                      child: Text(
                                        'Note: ${r.specialRequests}',
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                        style: TextStyle(
                                          color: Colors.white.withOpacity(0.4),
                                          fontSize: 11,
                                          fontStyle: FontStyle.italic,
                                        ),
                                      ),
                                    )
                                  else
                                    const Spacer(),
                                  TextButton.icon(
                                    onPressed: () => controller.confirmCancelReservation(r),
                                    icon: const Icon(Icons.cancel_outlined, size: 14, color: Colors.redAccent),
                                    label: const Text(
                                      'Cancel Table',
                                      style: TextStyle(
                                        color: Colors.redAccent,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    style: TextButton.styleFrom(
                                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                      visualDensity: VisualDensity.compact,
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ],
                        ),
                      );
                    },
                  );
                }),

                SizedBox(height: isTab ? 110 : 24),
              ],
            ),
          ),
    );
  }
}
