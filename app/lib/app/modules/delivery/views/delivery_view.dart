import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../controllers/delivery_controller.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../widgets/sizzlo_button.dart';
import '../../../widgets/custom_bottom_nav.dart';

class DeliveryView extends GetView<DeliveryController> {
  const DeliveryView({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Delivery & Catering'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 18),
          onPressed: () => Get.back(),
        ),
      ),
      body: SafeArea(
        top: false,
        child: Stack(
        children: [
          SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Delivery / ODC Tab Switcher
                Obx(
                  () => Container(
                    decoration: BoxDecoration(
                      color: AppColors.surfaceVariant,
                      borderRadius: BorderRadius.circular(16),
                    ),
                    padding: const EdgeInsets.all(4),
                    child: Row(
                      children: [
                        _tabButton(0, 'Direct Delivery'),
                        _tabButton(1, 'ODC & Banquets'),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                Obx(() {
                  if (controller.selectedServiceTab.value == 0) {
                    return _buildDirectDeliveryContent();
                  } else {
                    return _buildCateringContent();
                  }
                }),

                const SizedBox(height: 100),
              ],
            ),
          ),
          const Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: CustomBottomNav(currentIndex: 0),
          ),
        ],
      ),
    ),
  );
}

  Widget _tabButton(int index, String label) {
    final isSelected = controller.selectedServiceTab.value == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => controller.selectedServiceTab.value = index,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: isSelected ? Colors.white : Colors.transparent,
            borderRadius: BorderRadius.circular(12),
            boxShadow: isSelected
                ? [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.06),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ]
                : [],
          ),
          child: Text(
            label,
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 13,
              fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              color: isSelected ? AppColors.primary : AppColors.textSecondary,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildDirectDeliveryContent() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            gradient: AppColors.royalCardGradient,
            borderRadius: BorderRadius.circular(20),
          ),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('VIP Delivery Privileges', style: TextStyle(color: AppColors.gold, fontWeight: FontWeight.bold, fontSize: 16)),
                    SizedBox(height: 6),
                    Text('Zero packaging charge & complimentary signature breadstick basket on every home order.',
                        style: TextStyle(color: Colors.white, fontSize: 12, height: 1.4)),
                  ],
                ),
              ),
              const Icon(Icons.delivery_dining, color: AppColors.gold, size: 48),
            ],
          ),
        ),
        const SizedBox(height: 24),
        Text('Available Kitchens', style: AppTextStyles.titleMedium),
        const SizedBox(height: 12),
        _brandTile('Dough by Yanki', 'Artisanal Neapolitan Pizzas & Pastas', '30-40 min', Icons.local_pizza),
        _brandTile('Yanki Signature Gourmet', 'North Indian, Awadhi & Royal Kebabs', '40-50 min', Icons.dinner_dining),
        _brandTile('Yanki Patisserie & Café', 'Speciality Brews & French Pastries', '20-30 min', Icons.coffee),
      ],
    );
  }

  Widget _brandTile(String name, String desc, String eta, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF131715),
        borderRadius: BorderRadius.circular(18),
        border: Border.all(color: Colors.white.withOpacity(0.06)),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: AppColors.gold.withOpacity(0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(icon, color: AppColors.gold, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: Colors.white)),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 11, color: AppColors.textSecondary)),
                const SizedBox(height: 4),
                Text('Delivery ETA: $eta', style: const TextStyle(fontSize: 10, color: AppColors.success, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
          const Icon(Icons.arrow_forward_ios, size: 14, color: AppColors.textMuted),
        ],
      ),
    );
  }

  Widget _buildCateringContent() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF131715),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: AppColors.gold.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Plan Outdoor Catering or Banquet Event', style: AppTextStyles.titleMedium),
          const SizedBox(height: 6),
          const Text('Custom menus, live chef counters & 5-star hospitality at your venue.',
              style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          const SizedBox(height: 18),

          Text('Event Date', style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          TextField(
            controller: controller.eventDateController,
            decoration: InputDecoration(
              filled: true,
              fillColor: AppColors.surfaceVariant,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),

          const SizedBox(height: 14),
          Text('Expected Guests', style: AppTextStyles.bodySmall.copyWith(fontWeight: FontWeight.bold)),
          const SizedBox(height: 6),
          TextField(
            controller: controller.guestsController,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              filled: true,
              fillColor: AppColors.surfaceVariant,
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
            ),
          ),

          const SizedBox(height: 20),
          Obx(
            () => SizzloButton(
              text: 'Request Banquet Callback',
              isGold: true,
              isLoading: controller.isSubmitting.value,
              onPressed: controller.submitCateringInquiry,
            ),
          ),
        ],
      ),
    );
  }
}
