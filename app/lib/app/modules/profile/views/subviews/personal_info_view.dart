import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/values/app_constants.dart';
import '../../../../data/models/member_model.dart';
import '../../../../data/services/api_service.dart';
import '../../controllers/profile_controller.dart';
import '../../../home/controllers/home_controller.dart';

class PersonalInfoView extends StatefulWidget {
  const PersonalInfoView({Key? key}) : super(key: key);

  @override
  State<PersonalInfoView> createState() => _PersonalInfoViewState();
}

class _PersonalInfoViewState extends State<PersonalInfoView> {
  bool _isEditing = false;
  bool _isSaving = false;

  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _addressController;
  late TextEditingController _birthdayController;
  late TextEditingController _spouseNameController;
  late TextEditingController _anniversaryController;

  String _gender = 'Male';
  String _isMarried = 'No';

  @override
  void initState() {
    super.initState();
    final m = _getMember();
    _nameController = TextEditingController(text: m.fullName.isNotEmpty ? m.fullName : AppConstants.currentUserName);
    _emailController = TextEditingController(text: m.email.isNotEmpty ? m.email : AppConstants.currentUserEmail);
    _addressController = TextEditingController(text: m.address);
    _birthdayController = TextEditingController(text: m.birthday);
    _spouseNameController = TextEditingController(text: m.spouseName);
    _anniversaryController = TextEditingController(text: m.anniversaryDate);
    _gender = m.gender.isNotEmpty ? m.gender : 'Male';
    _isMarried = m.isMarried.isNotEmpty ? m.isMarried : 'No';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _addressController.dispose();
    _birthdayController.dispose();
    _spouseNameController.dispose();
    _anniversaryController.dispose();
    super.dispose();
  }

  MemberModel _getMember() {
    if (Get.isRegistered<HomeController>()) {
      return Get.find<HomeController>().member.value;
    }
    if (Get.isRegistered<ProfileController>()) {
      return Get.find<ProfileController>().member.value;
    }
    return MemberModel.defaultProfile();
  }

  Future<void> _saveChanges() async {
    setState(() => _isSaving = true);
    try {
      final m = _getMember();
      final updated = MemberModel(
        id: m.id,
        fullName: _nameController.text.trim(),
        firstName: _nameController.text.trim().split(' ').first,
        membershipId: m.membershipId,
        membershipType: m.membershipType,
        mobile: m.mobile,
        email: _emailController.text.trim(),
        issuedDate: m.issuedDate,
        expiryDate: m.expiryDate,
        totalSavings: m.totalSavings,
        couponsUsed: m.couponsUsed,
        couponsTotal: m.couponsTotal,
        loyaltyPoints: m.loyaltyPoints,
        loyaltyGoal: m.loyaltyGoal,
        daysRemaining: m.daysRemaining,
        status: m.status,
        planId: m.planId,
        address: _addressController.text.trim(),
        gender: _gender,
        birthday: _birthdayController.text.trim(),
        spouseName: _spouseNameController.text.trim(),
        spouseBirthday: m.spouseBirthday,
        anniversaryDate: _anniversaryController.text.trim(),
        isMarried: _isMarried,
      );

      // Update in memory session constants
      AppConstants.currentUserName = updated.fullName;
      AppConstants.currentUserEmail = updated.email;

      // Update controllers
      if (Get.isRegistered<HomeController>()) {
        Get.find<HomeController>().member.value = updated;
      }
      if (Get.isRegistered<ProfileController>()) {
        Get.find<ProfileController>().member.value = updated;
      }

      // Persist to backend
      final apiService = ApiService();
      await apiService.registerMember({
        'name': updated.fullName,
        'mobile': updated.mobile,
        'email': updated.email,
        'address': updated.address,
        'gender': updated.gender,
        'birthday': updated.birthday,
        'isMarried': updated.isMarried,
        'spouseName': updated.spouseName,
        'anniversaryDate': updated.anniversaryDate,
      });

      setState(() {
        _isEditing = false;
        _isSaving = false;
      });

      Get.snackbar(
        'Profile Updated',
        'Your personal details have been saved successfully.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF131715),
        colorText: Colors.white,
        borderColor: const Color(0xFFDF9E5B).withOpacity(0.5),
        borderWidth: 1,
        margin: const EdgeInsets.all(16),
      );
    } catch (e) {
      setState(() => _isSaving = false);
      Get.snackbar(
        'Update Notice',
        'Profile details updated locally.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF131715),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
      setState(() => _isEditing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          'Personal Information',
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
        actions: [
          TextButton(
            onPressed: () {
              if (_isEditing) {
                _saveChanges();
              } else {
                setState(() => _isEditing = true);
              }
            },
            child: _isSaving
                ? const SizedBox(
                    width: 16,
                    height: 16,
                    child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.gold),
                  )
                : Text(
                    _isEditing ? 'Save' : 'Edit',
                    style: const TextStyle(
                      color: AppColors.gold,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
          ),
        ],
      ),
      body: Obx(() {
        final m = _getMember();
        final avatarLetter = (m.fullName.trim().isNotEmpty) ? m.fullName.trim()[0].toUpperCase() : 'V';

        return SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Avatar & Name Card
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF131715),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 56,
                      height: 56,
                      decoration: BoxDecoration(
                        color: const Color(0xFF4A301D),
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF8F582E), width: 1.5),
                      ),
                      child: Center(
                        child: Text(
                          avatarLetter,
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.bold,
                            color: Color(0xFFDF9E5B),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            m.fullName.isNotEmpty ? m.fullName : 'VIP Guest',
                            style: GoogleFonts.playfairDisplay(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            m.membershipId,
                            style: TextStyle(
                              fontSize: 11.5,
                              color: Colors.white.withOpacity(0.45),
                              letterSpacing: 0.5,
                            ),
                          ),
                          const SizedBox(height: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2.5),
                            decoration: BoxDecoration(
                              color: const Color(0xFF281C10),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: const Color(0xFF6B4520)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.verified, size: 10, color: Color(0xFFDF9E5B)),
                                const SizedBox(width: 4),
                                Text(
                                  m.status.toUpperCase(),
                                  style: const TextStyle(
                                    fontSize: 9,
                                    letterSpacing: 1.0,
                                    fontWeight: FontWeight.w800,
                                    color: Color(0xFFDF9E5B),
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Contact Information Card
              _sectionTitle('CONTACT DETAILS'),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF131715),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Column(
                  children: [
                    _isEditing
                        ? _editField('Full Name', _nameController, Icons.person_outline)
                        : _viewField('Full Name', m.fullName.isNotEmpty ? m.fullName : 'VIP Guest', Icons.person_outline),
                    _divider(),
                    _viewField('Mobile Number', m.mobile.isNotEmpty ? m.mobile : '+91 98250 12345', Icons.phone_iphone_outlined, isReadOnly: true),
                    _divider(),
                    _isEditing
                        ? _editField('Email Address', _emailController, Icons.mail_outline)
                        : _viewField('Email Address', m.email.isNotEmpty ? m.email : 'Not linked', Icons.mail_outline),
                    _divider(),
                    _isEditing
                        ? _editField('Delivery Address', _addressController, Icons.location_on_outlined)
                        : _viewField('Delivery Address', m.address.isNotEmpty ? m.address : 'Not provided', Icons.location_on_outlined),
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Personal Demographics Card
              _sectionTitle('DEMOGRAPHICS & CELEBRATIONS'),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF131715),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Column(
                  children: [
                    _isEditing
                        ? _genderPicker()
                        : _viewField('Gender', m.gender.isNotEmpty ? m.gender : 'Not specified', Icons.wc_outlined),
                    _divider(),
                    _isEditing
                        ? _editField('Birthday (DD/MM/YYYY)', _birthdayController, Icons.cake_outlined)
                        : _viewField('Birthday', m.birthday.isNotEmpty ? m.birthday : 'Not specified', Icons.cake_outlined),
                    _divider(),
                    _isEditing
                        ? _maritalStatusPicker()
                        : _viewField('Marital Status', m.isMarried.isNotEmpty ? m.isMarried : 'Single', Icons.favorite_border_rounded),
                    if (_isMarried.toLowerCase() == 'yes' || m.isMarried.toLowerCase() == 'yes') ...[
                      _divider(),
                      _isEditing
                          ? _editField('Spouse Name', _spouseNameController, Icons.person_add_alt)
                          : _viewField('Spouse Name', m.spouseName.isNotEmpty ? m.spouseName : 'Not specified', Icons.person_add_alt),
                      _divider(),
                      _isEditing
                          ? _editField('Anniversary Date', _anniversaryController, Icons.celebration_outlined)
                          : _viewField('Anniversary Date', m.anniversaryDate.isNotEmpty ? m.anniversaryDate : 'Not specified', Icons.celebration_outlined),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 14),

              // Membership Meta Card
              _sectionTitle('MEMBERSHIP RECORD'),
              const SizedBox(height: 8),
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF131715),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.white.withOpacity(0.06)),
                ),
                child: Column(
                  children: [
                    _viewField('Membership ID', m.membershipId, Icons.badge_outlined, isReadOnly: true),
                    _divider(),
                    _viewField('Membership Tier', m.membershipType.isNotEmpty ? m.membershipType : 'STANDARD GUEST', Icons.workspace_premium_outlined, isReadOnly: true),
                    _divider(),
                    _viewField('Member Since', m.issuedDate.isNotEmpty ? m.issuedDate : '01/01/2024', Icons.calendar_today_outlined, isReadOnly: true),
                    _divider(),
                    _viewField('Valid Till', m.expiryDate.isNotEmpty ? m.expiryDate : '31/12/2025', Icons.event_available_outlined, isReadOnly: true),
                  ],
                ),
              ),

              const SizedBox(height: 28),
            ],
          ),
        );
      }),
    );
  }

  Widget _sectionTitle(String text) {
    return Padding(
      padding: const EdgeInsets.only(left: 4),
      child: Text(
        text,
        style: GoogleFonts.plusJakartaSans(
          fontSize: 10,
          fontWeight: FontWeight.w800,
          letterSpacing: 1.4,
          color: AppColors.gold,
        ),
      ),
    );
  }

  Widget _viewField(String label, String value, IconData icon, {bool isReadOnly = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 16, color: const Color(0xFFDF9E5B)),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 110,
            child: Text(
              label,
              style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5)),
            ),
          ),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isReadOnly ? Colors.white70 : Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _editField(String label, TextEditingController controller, IconData icon) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              shape: BoxShape.circle,
            ),
            child: Icon(icon, size: 16, color: const Color(0xFFDF9E5B)),
          ),
          const SizedBox(width: 12),
          SizedBox(
            width: 100,
            child: Text(
              label,
              style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5)),
            ),
          ),
          Expanded(
            child: TextField(
              controller: controller,
              style: const TextStyle(fontSize: 13, color: Colors.white, fontWeight: FontWeight.w600),
              textAlign: TextAlign.end,
              decoration: InputDecoration(
                isDense: true,
                border: InputBorder.none,
                hintText: 'Enter $label',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.25), fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _genderPicker() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.wc_outlined, size: 16, color: Color(0xFFDF9E5B)),
          ),
          const SizedBox(width: 12),
          Text(
            'Gender',
            style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5)),
          ),
          const Spacer(),
          DropdownButton<String>(
            value: _gender,
            dropdownColor: const Color(0xFF1A1F1D),
            underline: const SizedBox.shrink(),
            items: ['Male', 'Female', 'Other'].map((g) {
              return DropdownMenuItem(
                value: g,
                child: Text(g, style: const TextStyle(color: Colors.white, fontSize: 13)),
              );
            }).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _gender = val);
            },
          ),
        ],
      ),
    );
  }

  Widget _maritalStatusPicker() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.05),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.favorite_border_rounded, size: 16, color: Color(0xFFDF9E5B)),
          ),
          const SizedBox(width: 12),
          Text(
            'Married?',
            style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5)),
          ),
          const Spacer(),
          DropdownButton<String>(
            value: _isMarried,
            dropdownColor: const Color(0xFF1A1F1D),
            underline: const SizedBox.shrink(),
            items: ['No', 'Yes'].map((m) {
              return DropdownMenuItem(
                value: m,
                child: Text(m == 'Yes' ? 'Married' : 'Single', style: const TextStyle(color: Colors.white, fontSize: 13)),
              );
            }).toList(),
            onChanged: (val) {
              if (val != null) setState(() => _isMarried = val);
            },
          ),
        ],
      ),
    );
  }

  Widget _divider() {
    return Divider(
      height: 1,
      thickness: 1,
      indent: 58,
      endIndent: 14,
      color: Colors.white.withOpacity(0.04),
    );
  }
}
