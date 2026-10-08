import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import '../../../data/models/banquet_inquiry_model.dart';
import '../../../data/services/api_service.dart';
import '../../../core/values/app_constants.dart';
import '../../../core/theme/app_colors.dart';

class BanquetController extends GetxController {
  final ApiService _apiService = ApiService();

  // Tab: 0 = Banquet Hall, 1 = Outdoor Catering (ODC)
  final RxInt activeTab = 0.obs;

  final RxBool isSubmitting = false.obs;
  final RxBool isLoadingInquiries = false.obs;
  final RxList<BanquetInquiryModel> myInquiries = <BanquetInquiryModel>[].obs;

  // --- TAB 1: BANQUET HALL FORM STATE ---
  final TextEditingController banquetNameController = TextEditingController();
  final TextEditingController banquetPhoneController = TextEditingController();
  final TextEditingController banquetNotesController = TextEditingController();

  final RxString selectedBanquetVenue = 'House of Yanki Banquets - Bodakdev'.obs;
  final List<String> banquetVenues = [
    'House of Yanki Banquets - Bodakdev',
    'House of Yanki Banquets - Bopal Sky Deck',
    'Yanki Sizzlerr Navrangpura Banquet Lounge',
    'Dough by Yanki CG Road Private Hall',
  ];

  final RxString selectedOccasion = 'Birthday Bash'.obs;
  final List<String> occasionOptions = [
    'Birthday Bash',
    'Wedding Reception',
    'Sangeet / Engagement',
    'Corporate Seminar',
    'Anniversary Gala',
    'Social Gathering',
  ];

  final Rx<DateTime> banquetDate = DateTime.now().add(const Duration(days: 14)).obs;
  final RxString banquetShift = 'Dinner'.obs;
  final List<String> shiftOptions = ['Dinner', 'Lunch', 'Full Day'];

  final RxInt banquetPax = 75.obs;
  final List<int> banquetPaxPresets = [25, 50, 75, 100, 150, 200, 300, 500];

  final RxString banquetPackage = 'Signature Sizzler & Multi-Cuisine Buffet'.obs;
  final List<String> packageOptions = [
    'Signature Sizzler & Multi-Cuisine Buffet',
    'Royal 3-Course Gourmet Feast',
    'Executive Corporate Hi-Tea & Plated Lunch',
  ];

  // --- TAB 2: OUTDOOR CATERING (ODC) FORM STATE ---
  final TextEditingController odcNameController = TextEditingController();
  final TextEditingController odcPhoneController = TextEditingController();
  final TextEditingController odcVenueLocationController = TextEditingController();
  final TextEditingController odcNotesController = TextEditingController();

  final RxString odcCity = 'Ahmedabad'.obs;
  final List<String> cityOptions = ['Ahmedabad', 'Gandhinagar', 'Vadodara', 'Rajkot', 'Other Location'];

  final Rx<DateTime> odcDate = DateTime.now().add(const Duration(days: 21)).obs;
  final RxString odcShift = 'Dinner'.obs;
  final List<String> odcShiftOptions = ['Lunch', 'High-Tea', 'Dinner', 'Late-Night Grills'];

  final RxInt odcPax = 150.obs;
  final List<int> odcPaxPresets = [50, 100, 150, 250, 500, 1000];

  final RxList<String> selectedLiveStations = <String>[
    'Live Sizzler Grills',
    'Sizzling Brownie Station',
  ].obs;

  final List<String> availableLiveStations = [
    'Live Sizzler Grills',
    'Sizzling Brownie Station',
    'Artisan Mocktail & Beverage Bar',
    'Wood-Fired Sourdough Pizza',
    'Oriental Wok & Dim Sum Bar',
    'Live Chaat & Street Tapas',
  ];

  @override
  void onInit() {
    super.onInit();
    _initPrefilledContact();
    loadMyInquiries();
  }

  void _initPrefilledContact() {
    final name = AppConstants.currentUserName.isNotEmpty && AppConstants.currentUserName != 'Guest'
        ? AppConstants.currentUserName
        : '';
    final phone = AppConstants.currentUserMobile.isNotEmpty ? AppConstants.currentUserMobile : '';

    banquetNameController.text = name;
    banquetPhoneController.text = phone;
    odcNameController.text = name;
    odcPhoneController.text = phone;
  }

  Future<void> loadMyInquiries() async {
    final phone = AppConstants.currentUserMobile;
    if (phone.isEmpty) return;

    isLoadingInquiries.value = true;
    try {
      final list = await _apiService.getMyBanquetInquiries(phone);
      myInquiries.assignAll(list);
    } catch (_) {} finally {
      isLoadingInquiries.value = false;
    }
  }

  Future<void> pickDate(BuildContext context, bool isOdc) async {
    final initial = isOdc ? odcDate.value : banquetDate.value;
    final picked = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime.now().add(const Duration(days: 1)),
      lastDate: DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: ThemeData.dark().copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.goldAccent,
              onPrimary: Colors.black,
              surface: Color(0xFF1E1A16),
              onSurface: Colors.white,
            ),
            dialogBackgroundColor: const Color(0xFF141210),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      if (isOdc) {
        odcDate.value = picked;
      } else {
        banquetDate.value = picked;
      }
    }
  }

  void toggleLiveStation(String station) {
    if (selectedLiveStations.contains(station)) {
      if (selectedLiveStations.length > 1) {
        selectedLiveStations.remove(station);
      }
    } else {
      selectedLiveStations.add(station);
    }
  }

  // --- SUBMIT BANQUET HALL INQUIRY ---
  Future<void> submitBanquetInquiry() async {
    final name = banquetNameController.text.trim();
    final phone = banquetPhoneController.text.trim();

    if (name.isEmpty) {
      _showError('Please enter the contact person name.');
      return;
    }
    if (phone.isEmpty || phone.length < 10) {
      _showError('Please enter a valid 10-digit mobile number.');
      return;
    }

    isSubmitting.value = true;
    try {
      final formattedDate = DateFormat('yyyy-MM-dd').format(banquetDate.value);
      final shiftClean = banquetShift.value.split(' ').first;

      final requirements = StringBuffer();
      requirements.write('Venue: ${selectedBanquetVenue.value}. ');
      requirements.write('Package: ${banquetPackage.value}. ');
      if (banquetNotesController.text.trim().isNotEmpty) {
        requirements.write('Special Notes: ${banquetNotesController.text.trim()}');
      }

      final inquiry = BanquetInquiryModel(
        customerName: name,
        customerMobile: phone.startsWith('+91') ? phone : '+91 $phone',
        email: AppConstants.currentUserEmail.isNotEmpty ? AppConstants.currentUserEmail : null,
        eventCategory: 'Banquet: ${selectedOccasion.value}',
        eventDate: formattedDate,
        eventShift: shiftClean,
        estimatedPax: banquetPax.value,
        customRequirements: requirements.toString(),
      );

      final success = await _apiService.submitBanquetInquiry(inquiry);
      if (success) {
        banquetNotesController.clear();
        await loadMyInquiries();
        _showSuccessDialog(
          title: 'Banquet Inquiry Received!',
          message:
              'Your inquiry for ${banquetPax.value} guests at ${selectedBanquetVenue.value} on ${DateFormat('dd MMM yyyy').format(banquetDate.value)} has been recorded.\n\nOur House of Yanki Event Desk team will reach out to you within 24 hours at $phone to confirm hall availability and discuss custom menu options.',
        );
      } else {
        _showError('Failed to dispatch inquiry. Please check your network and try again.');
      }
    } catch (e) {
      _showError('An unexpected error occurred. Please try again.');
    } finally {
      isSubmitting.value = false;
    }
  }

  // --- SUBMIT OUTDOOR CATERING (ODC) INQUIRY ---
  Future<void> submitOdcInquiry() async {
    final name = odcNameController.text.trim();
    final phone = odcPhoneController.text.trim();
    final location = odcVenueLocationController.text.trim();

    if (name.isEmpty) {
      _showError('Please enter the contact person name.');
      return;
    }
    if (phone.isEmpty || phone.length < 10) {
      _showError('Please enter a valid 10-digit mobile number.');
      return;
    }

    isSubmitting.value = true;
    try {
      final formattedDate = DateFormat('yyyy-MM-dd').format(odcDate.value);

      final requirements = StringBuffer();
      requirements.write('City: ${odcCity.value}. ');
      if (location.isNotEmpty) {
        requirements.write('Lawn/Venue: $location. ');
      }
      requirements.write('Live Counters: ${selectedLiveStations.join(', ')}. ');
      if (odcNotesController.text.trim().isNotEmpty) {
        requirements.write('Notes: ${odcNotesController.text.trim()}');
      }

      final inquiry = BanquetInquiryModel(
        customerName: name,
        customerMobile: phone.startsWith('+91') ? phone : '+91 $phone',
        email: AppConstants.currentUserEmail.isNotEmpty ? AppConstants.currentUserEmail : null,
        eventCategory: 'ODC - Outdoor Catering (${odcCity.value})',
        eventDate: formattedDate,
        eventShift: odcShift.value,
        estimatedPax: odcPax.value,
        customRequirements: requirements.toString(),
      );

      final success = await _apiService.submitBanquetInquiry(inquiry);
      if (success) {
        odcVenueLocationController.clear();
        odcNotesController.clear();
        await loadMyInquiries();
        _showSuccessDialog(
          title: 'ODC Catering Inquiry Received!',
          message:
              'Your outdoor catering inquiry for ${odcPax.value} guests in ${odcCity.value} on ${DateFormat('dd MMM yyyy').format(odcDate.value)} has been recorded.\n\nOur Executive Chef & ODC event planner will reach out to you within 24 hours at $phone with live counter setups, menu packages, and tasting details.',
        );
      } else {
        _showError('Failed to dispatch inquiry. Please check your network and try again.');
      }
    } catch (e) {
      _showError('An unexpected error occurred. Please try again.');
    } finally {
      isSubmitting.value = false;
    }
  }

  void _showError(String msg) {
    Get.snackbar(
      'Required Info Missing',
      msg,
      backgroundColor: const Color(0xFF3A1212),
      colorText: const Color(0xFFFF8A80),
      snackPosition: SnackPosition.TOP,
      margin: const EdgeInsets.all(16),
      borderRadius: 12,
      duration: const Duration(seconds: 4),
    );
  }

  void _showSuccessDialog({required String title, required String message}) {
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF141312),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.goldAccent, width: 1.2),
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
                child: const Icon(Icons.check_circle_rounded, color: AppColors.goldAccent, size: 36),
              ),
              const SizedBox(height: 16),
              Text(
                title,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                message,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 13, color: Colors.grey[300], height: 1.4),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.goldAccent,
                    foregroundColor: Colors.black,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    padding: const EdgeInsets.symmetric(vertical: 14),
                  ),
                  onPressed: () => Get.back(),
                  child: const Text('Done', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void onClose() {
    banquetNameController.dispose();
    banquetPhoneController.dispose();
    banquetNotesController.dispose();
    odcNameController.dispose();
    odcPhoneController.dispose();
    odcVenueLocationController.dispose();
    odcNotesController.dispose();
    super.onClose();
  }
}
