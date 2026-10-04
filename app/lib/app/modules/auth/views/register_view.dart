import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../routes/app_routes.dart';
import '../../../data/services/api_service.dart';
import '../../home/controllers/home_controller.dart';

class RegisterView extends StatefulWidget {
  const RegisterView({Key? key}) : super(key: key);

  @override
  State<RegisterView> createState() => _RegisterViewState();
}

class _RegisterViewState extends State<RegisterView> {
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _phoneController = TextEditingController();
  final TextEditingController _addressController = TextEditingController();
  final TextEditingController _spouseNameController = TextEditingController();

  String? _selectedGender;
  DateTime? _birthday;
  DateTime? _spouseBirthday;
  DateTime? _anniversaryDate;
  String _isMarried = 'No'; // 'Yes' or 'No'
  String _errorMessage = '';
  bool _isLoading = false;

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    _addressController.dispose();
    _spouseNameController.dispose();
    super.dispose();
  }

  void _submit() async {
    final name = _nameController.text.trim();
    final phone = _phoneController.text.trim().replaceAll(RegExp(r'\D'), '');

    if (name.isEmpty) {
      setState(() {
        _errorMessage = 'Please enter your full name.';
      });
      return;
    }

    if (phone.length != 10) {
      setState(() {
        _errorMessage = 'Please enter a valid 10-digit phone number.';
      });
      return;
    }

    setState(() {
      _errorMessage = '';
      _isLoading = true;
    });

    final dateFormat = DateFormat('yyyy-MM-dd');
    final regData = {
      'fullName': name,
      'mobile': phone,
      'address': _addressController.text.trim(),
      'gender': _selectedGender ?? '',
      'birthday': _birthday != null ? dateFormat.format(_birthday!) : '',
      'isMarried': _isMarried,
      'spouseName': _spouseNameController.text.trim(),
      'spouseBirthday': _spouseBirthday != null ? dateFormat.format(_spouseBirthday!) : '',
      'anniversaryDate': _anniversaryDate != null ? dateFormat.format(_anniversaryDate!) : '',
    };

    final apiService = ApiService();
    final result = await apiService.registerMember(regData);

    setState(() {
      _isLoading = false;
    });

    if (result['member'] != null) {
      if (Get.isRegistered<HomeController>()) {
        Get.find<HomeController>().member.value = result['member'];
        Get.find<HomeController>().loadDashboardData();
      }
    }

    Get.snackbar(
      'Account Created!',
      'VIP account activated for $name',
      backgroundColor: const Color(0xFF0E3B32),
      colorText: const Color(0xFFE8B84A),
      duration: const Duration(seconds: 3),
    );

    // Proceed to OTP verification
    Get.offNamed(
      AppRoutes.VERIFY,
      arguments: {'phone': phone, 'registered': true},
    );
  }

  Future<void> _pickDate(Function(DateTime) onSelected, {DateTime? initial}) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: initial ?? DateTime(1995, 1, 1),
      firstDate: DateTime(1940),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: AppColors.flame,
              onPrimary: Color(0xFF070A09),
              surface: Color(0xFF141917),
              onSurface: Colors.white,
            ),
            dialogBackgroundColor: const Color(0xFF141917),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        onSelected(picked);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final dateFormat = DateFormat('MMMM d, yyyy');

    return Scaffold(
      backgroundColor: AppColors.background,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Back Button
              GestureDetector(
                onTap: () => Get.back(),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(
                      Icons.chevron_left_rounded,
                      color: AppColors.textSecondary,
                      size: 20,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      'Back',
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        fontWeight: FontWeight.w500,
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Tag
              Text(
                'NEW SUBSCRIPTION',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  letterSpacing: 3.0,
                  color: AppColors.gold,
                ),
              ),
              const SizedBox(height: 8),

              // Title
              Text(
                'Create Your Yanki Subscription',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 30,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                  letterSpacing: -0.5,
                ),
              ),
              const SizedBox(height: 6),

              // Subtitle
              Text(
                'Tell us a little about yourself to get started.',
                style: GoogleFonts.plusJakartaSans(
                  fontSize: 14,
                  fontWeight: FontWeight.w400,
                  color: AppColors.textSecondary,
                ),
              ),
              const SizedBox(height: 24),

              // Card Container
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: const Color(0xFF141917),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: AppColors.border),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withOpacity(0.4),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ],
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // Field 1: Full Name
                    _buildLabel('FULL NAME'),
                    const SizedBox(height: 8),
                    Container(
                      height: 52,
                      decoration: BoxDecoration(
                        color: AppColors.inputBackground,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.inputBorder),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      alignment: Alignment.centerLeft,
                      child: TextField(
                        controller: _nameController,
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                        decoration: InputDecoration(
                          hintText: 'Enter your full name',
                          hintStyle: GoogleFonts.plusJakartaSans(
                            color: AppColors.textMuted,
                            fontSize: 14,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                        ),
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Field 2: Phone Number
                    _buildLabel('PHONE NUMBER'),
                    const SizedBox(height: 8),
                    Container(
                      height: 52,
                      decoration: BoxDecoration(
                        color: AppColors.inputBackground,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.inputBorder),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Row(
                        children: [
                          Text(
                            '+91',
                            style: GoogleFonts.plusJakartaSans(
                              color: Colors.white,
                              fontWeight: FontWeight.w600,
                              fontSize: 14,
                            ),
                          ),
                          Container(
                            height: 20,
                            width: 1,
                            color: AppColors.inputBorder,
                            margin: const EdgeInsets.symmetric(horizontal: 12),
                          ),
                          Expanded(
                            child: TextField(
                              controller: _phoneController,
                              keyboardType: TextInputType.phone,
                              inputFormatters: [
                                FilteringTextInputFormatter.digitsOnly,
                                LengthLimitingTextInputFormatter(10),
                              ],
                              style: GoogleFonts.plusJakartaSans(
                                color: Colors.white,
                                fontSize: 14,
                              ),
                              decoration: InputDecoration(
                                hintText: 'Enter phone number',
                                hintStyle: GoogleFonts.plusJakartaSans(
                                  color: AppColors.textMuted,
                                  fontSize: 14,
                                ),
                                border: InputBorder.none,
                                isDense: true,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Field 3: Postal Address
                    _buildLabel('POSTAL ADDRESS'),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        const Icon(
                          Icons.info_outline_rounded,
                          size: 13,
                          color: AppColors.textSecondary,
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: Text(
                            'Used for surprise gifts and personalized communication.',
                            style: GoogleFonts.plusJakartaSans(
                              fontSize: 11,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Container(
                      height: 88,
                      decoration: BoxDecoration(
                        color: AppColors.inputBackground,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.inputBorder),
                      ),
                      padding: const EdgeInsets.all(14),
                      child: TextField(
                        controller: _addressController,
                        maxLines: 3,
                        style: GoogleFonts.plusJakartaSans(
                          color: Colors.white,
                          fontSize: 13,
                        ),
                        decoration: InputDecoration(
                          hintText:
                              'Enter your complete postal address\nHouse/Flat No., Street, Area, City, State, PIN Code',
                          hintStyle: GoogleFonts.plusJakartaSans(
                            color: AppColors.textMuted,
                            fontSize: 12,
                            height: 1.4,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                        ),
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Field 4: Gender
                    _buildLabel('GENDER'),
                    const SizedBox(height: 8),
                    Container(
                      height: 52,
                      decoration: BoxDecoration(
                        color: AppColors.inputBackground,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: AppColors.inputBorder),
                      ),
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: DropdownButtonHideUnderline(
                        child: DropdownButton<String>(
                          value: _selectedGender,
                          hint: Text(
                            'Select gender',
                            style: GoogleFonts.plusJakartaSans(
                              color: AppColors.textMuted,
                              fontSize: 14,
                            ),
                          ),
                          dropdownColor: const Color(0xFF1C221F),
                          icon: const Icon(
                            Icons.keyboard_arrow_down_rounded,
                            color: AppColors.textSecondary,
                          ),
                          isExpanded: true,
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white,
                            fontSize: 14,
                          ),
                          items: ['Male', 'Female', 'Other'].map((item) {
                            return DropdownMenuItem<String>(
                              value: item,
                              child: Text(item),
                            );
                          }).toList(),
                          onChanged: (val) {
                            setState(() {
                              _selectedGender = val;
                            });
                          },
                        ),
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Field 5: Subscriber Birthday Date
                    _buildLabel('SUBSCRIBER BIRTHDAY DATE'),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: () {
                        _pickDate((date) => _birthday = date, initial: _birthday);
                      },
                      child: Container(
                        height: 52,
                        decoration: BoxDecoration(
                          color: AppColors.inputBackground,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.inputBorder),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.calendar_today_outlined,
                              color: AppColors.textSecondary,
                              size: 16,
                            ),
                            const SizedBox(width: 12),
                            Text(
                              _birthday != null
                                  ? dateFormat.format(_birthday!)
                                  : 'Select subscriber birthday',
                              style: GoogleFonts.plusJakartaSans(
                                color: _birthday != null
                                    ? Colors.white
                                    : AppColors.textMuted,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 18),

                    // Field 6: Are You Married?
                    _buildLabel('ARE YOU MARRIED?'),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: _buildSelectPill(
                            title: 'Yes',
                            isSelected: _isMarried == 'Yes',
                            onTap: () => setState(() => _isMarried = 'Yes'),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: _buildSelectPill(
                            title: 'No',
                            isSelected: _isMarried == 'No',
                            onTap: () => setState(() => _isMarried = 'No'),
                          ),
                        ),
                      ],
                    ),

                    // Expandable Spouse Details
                    if (_isMarried == 'Yes') ...[
                      const SizedBox(height: 22),
                      Row(
                        children: [
                          const Expanded(child: Divider(color: AppColors.border)),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 12),
                            child: Text(
                              'SPOUSE DETAILS',
                              style: GoogleFonts.plusJakartaSans(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 2.0,
                                color: AppColors.gold,
                              ),
                            ),
                          ),
                          const Expanded(child: Divider(color: AppColors.border)),
                        ],
                      ),
                      const SizedBox(height: 18),

                      // Spouse Name
                      _buildLabel('SPOUSE NAME'),
                      const SizedBox(height: 8),
                      Container(
                        height: 52,
                        decoration: BoxDecoration(
                          color: AppColors.inputBackground,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.inputBorder),
                        ),
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        alignment: Alignment.centerLeft,
                        child: TextField(
                          controller: _spouseNameController,
                          style: GoogleFonts.plusJakartaSans(
                            color: Colors.white,
                            fontSize: 14,
                          ),
                          decoration: InputDecoration(
                            hintText: "Enter spouse's full name",
                            hintStyle: GoogleFonts.plusJakartaSans(
                              color: AppColors.textMuted,
                              fontSize: 14,
                            ),
                            border: InputBorder.none,
                            isDense: true,
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Spouse Birthday Date
                      _buildLabel('SPOUSE BIRTHDAY DATE'),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: () {
                          _pickDate(
                            (date) => _spouseBirthday = date,
                            initial: _spouseBirthday,
                          );
                        },
                        child: Container(
                          height: 52,
                          decoration: BoxDecoration(
                            color: AppColors.inputBackground,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.inputBorder),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.calendar_today_outlined,
                                color: AppColors.textSecondary,
                                size: 16,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                _spouseBirthday != null
                                    ? dateFormat.format(_spouseBirthday!)
                                    : 'Select spouse birthday',
                                style: GoogleFonts.plusJakartaSans(
                                  color: _spouseBirthday != null
                                      ? Colors.white
                                      : AppColors.textMuted,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 18),

                      // Anniversary Date
                      _buildLabel('ANNIVERSARY DATE'),
                      const SizedBox(height: 8),
                      GestureDetector(
                        onTap: () {
                          _pickDate(
                            (date) => _anniversaryDate = date,
                            initial: _anniversaryDate,
                          );
                        },
                        child: Container(
                          height: 52,
                          decoration: BoxDecoration(
                            color: AppColors.inputBackground,
                            borderRadius: BorderRadius.circular(16),
                            border: Border.all(color: AppColors.inputBorder),
                          ),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Row(
                            children: [
                              const Icon(
                                Icons.calendar_today_outlined,
                                color: AppColors.textSecondary,
                                size: 16,
                              ),
                              const SizedBox(width: 12),
                              Text(
                                _anniversaryDate != null
                                    ? dateFormat.format(_anniversaryDate!)
                                    : 'Select anniversary date',
                                style: GoogleFonts.plusJakartaSans(
                                  color: _anniversaryDate != null
                                      ? Colors.white
                                      : AppColors.textMuted,
                                  fontSize: 14,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],

                    // Error text
                    if (_errorMessage.isNotEmpty)
                      Padding(
                        padding: const EdgeInsets.only(top: 14),
                        child: Text(
                          _errorMessage,
                          style: GoogleFonts.plusJakartaSans(
                            color: AppColors.error,
                            fontSize: 12,
                          ),
                        ),
                      ),

                    const SizedBox(height: 24),

                    // Save & Continue Button
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.flame,
                          foregroundColor: const Color(0xFF070A09),
                          elevation: 0,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(20),
                          ),
                        ),
                        child: _isLoading
                            ? const SizedBox(
                                width: 22,
                                height: 22,
                                child: CircularProgressIndicator(
                                  strokeWidth: 2.5,
                                  color: Color(0xFF070A09),
                                ),
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(
                                    Icons.save_rounded,
                                    size: 18,
                                    color: Color(0xFF070A09),
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    'Save & Continue',
                                    style: GoogleFonts.plusJakartaSans(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: const Color(0xFF070A09),
                                    ),
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
        ),
      ),
    );
  }

  Widget _buildLabel(String label) {
    return Text(
      label,
      style: GoogleFonts.plusJakartaSans(
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 2.0,
        color: AppColors.textMuted,
      ),
    );
  }

  Widget _buildSelectPill({
    required String title,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 48,
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF0D1210) : AppColors.inputBackground,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isSelected ? AppColors.flame : AppColors.inputBorder,
            width: isSelected ? 1.5 : 1.0,
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          title,
          style: GoogleFonts.plusJakartaSans(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}
