import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/values/app_constants.dart';
import '../../../../data/models/member_model.dart';
import '../../../../data/services/api_service.dart';
import '../../../../data/services/local_storage_service.dart';
import '../../../../widgets/profile_avatar_widget.dart';
import '../../../../routes/app_routes.dart';
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
    _populateControllers(m);
    _loadProfileFromBackend();
  }

  void _populateControllers(MemberModel m) {
    final displayName = (m.fullName.isNotEmpty && m.fullName != 'Guest')
        ? m.fullName
        : (AppConstants.currentUserName != 'Guest' ? AppConstants.currentUserName : '');
    final displayEmail = (m.email.isNotEmpty && !m.email.endsWith('@sizzlo.in'))
        ? m.email
        : (AppConstants.currentUserEmail.isNotEmpty && !AppConstants.currentUserEmail.endsWith('@sizzlo.in')
            ? AppConstants.currentUserEmail
            : '');

    _nameController = TextEditingController(text: displayName);
    _emailController = TextEditingController(text: displayEmail);
    _addressController = TextEditingController(text: m.address);
    _birthdayController = TextEditingController(text: m.birthday);
    _spouseNameController = TextEditingController(text: m.spouseName);
    _anniversaryController = TextEditingController(text: m.anniversaryDate);
    _gender = (m.gender.isNotEmpty) ? m.gender : 'Male';
    _isMarried = (m.isMarried.isNotEmpty) ? m.isMarried : 'No';
  }

  Future<void> _loadProfileFromBackend() async {
    try {
      final apiService = ApiService();
      final fresh = await apiService.getMemberProfile();
      if (fresh.fullName.isNotEmpty && fresh.fullName != 'Guest') {
        if (mounted) {
          setState(() {
            _nameController.text = fresh.fullName;
            _emailController.text = (fresh.email.isNotEmpty && !fresh.email.endsWith('@sizzlo.in')) ? fresh.email : '';
            _addressController.text = fresh.address;
            _birthdayController.text = fresh.birthday;
            _spouseNameController.text = fresh.spouseName;
            _anniversaryController.text = fresh.anniversaryDate;
            _gender = fresh.gender.isNotEmpty ? fresh.gender : _gender;
            _isMarried = fresh.isMarried.isNotEmpty ? fresh.isMarried : _isMarried;
          });
        }
        if (Get.isRegistered<HomeController>()) {
          Get.find<HomeController>().member.value = fresh;
        }
        if (Get.isRegistered<ProfileController>()) {
          Get.find<ProfileController>().member.value = fresh;
        }
      }
    } catch (_) {}
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
      final hm = Get.find<HomeController>().member.value;
      if (hm.fullName.isNotEmpty && hm.fullName != 'Guest') return hm;
    }
    if (Get.isRegistered<ProfileController>()) {
      final pm = Get.find<ProfileController>().member.value;
      if (pm.fullName.isNotEmpty && pm.fullName != 'Guest') return pm;
    }
    return MemberModel.defaultProfile();
  }

  Future<void> _saveChanges() async {
    final newName = _nameController.text.trim();
    if (newName.isEmpty) {
      Get.snackbar(
        'Name Required',
        'Please enter your full name',
        backgroundColor: const Color(0xFF281C10),
        colorText: Colors.white,
      );
      return;
    }

    setState(() => _isSaving = true);
    try {
      final m = _getMember();
      final updated = MemberModel(
        id: m.id,
        fullName: newName,
        firstName: newName.split(' ').first,
        membershipId: m.membershipId,
        membershipType: m.membershipType,
        mobile: m.mobile.isNotEmpty ? m.mobile : AppConstants.currentUserMobile,
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
        profilePictureUrl: m.profilePictureUrl,
      );

      // 1. Update in memory session constants
      AppConstants.currentUserName = updated.fullName;
      AppConstants.currentUserEmail = updated.email;

      // 2. Persist to local storage
      await LocalStorageService.saveUserSession(
        mobile: updated.mobile,
        membershipId: updated.membershipId,
        name: updated.fullName,
        tier: updated.subscriptionTier,
        profilePic: updated.profilePictureUrl,
      );

      // 3. Update controllers
      if (Get.isRegistered<HomeController>()) {
        Get.find<HomeController>().member.value = updated;
      }
      if (Get.isRegistered<ProfileController>()) {
        Get.find<ProfileController>().member.value = updated;
      }

      // 4. Persist to backend via PUT /api/members/{id}
      final apiService = ApiService();
      final savedMember = await apiService.updateMemberProfile({
        'fullName': updated.fullName,
        'mobile': updated.mobile,
        'email': updated.email,
        'address': updated.address,
        'gender': updated.gender,
        'birthday': updated.birthday,
        'isMarried': updated.isMarried,
        'spouseName': updated.spouseName,
        'anniversaryDate': updated.anniversaryDate,
        'profilePictureUrl': updated.profilePictureUrl,
      }, updated.membershipId);

      if (savedMember != null) {
        if (Get.isRegistered<HomeController>()) {
          Get.find<HomeController>().member.value = savedMember;
        }
        if (Get.isRegistered<ProfileController>()) {
          Get.find<ProfileController>().member.value = savedMember;
        }
      }

      setState(() {
        _isEditing = false;
        _isSaving = false;
      });

      Get.snackbar(
        'Profile Updated',
        'Your personal details have been saved successfully.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF0E382B),
        colorText: const Color(0xFF4EE3B8),
        borderColor: const Color(0xFF4EE3B8).withOpacity(0.5),
        borderWidth: 1,
        margin: const EdgeInsets.all(16),
        borderRadius: 14,
      );
    } catch (e) {
      setState(() {
        _isSaving = false;
        _isEditing = false;
      });
      Get.snackbar(
        'Update Notice',
        'Profile details updated locally.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: const Color(0xFF131715),
        colorText: Colors.white,
        margin: const EdgeInsets.all(16),
      );
    }
  }

  Future<void> _pickDateFor(TextEditingController controller) async {
    final picked = await showDatePicker(
      context: context,
      initialDate: DateTime(1995, 1, 1),
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
          ),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
    if (picked != null) {
      final formatted = "${picked.year}-${picked.month.toString().padLeft(2, '0')}-${picked.day.toString().padLeft(2, '0')}";
      setState(() {
        controller.text = formatted;
      });
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
        final effectiveName = m.fullName.isNotEmpty && m.fullName != 'Guest'
            ? m.fullName
            : (AppConstants.currentUserName != 'Guest' ? AppConstants.currentUserName : 'Member');

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
                    ProfileAvatarWidget(
                      radius: 30,
                      imageUrl: m.profilePictureUrl,
                      name: effectiveName,
                      showEditBadge: true,
                      onAvatarChanged: () => setState(() {}),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            effectiveName,
                            style: GoogleFonts.playfairDisplay(
                              fontSize: 19,
                              fontWeight: FontWeight.bold,
                              color: Colors.white,
                            ),
                          ),
                          const SizedBox(height: 3),
                          Text(
                            m.isSubscriber && m.membershipId.isNotEmpty ? m.membershipId : 'Free Account · Standard Guest',
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
                              color: m.isSubscriber ? const Color(0xFF281C10) : Colors.white.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: m.isSubscriber ? const Color(0xFF6B4520) : Colors.white.withOpacity(0.12)),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  m.isSubscriber ? Icons.verified : Icons.person_outline,
                                  size: 10,
                                  color: m.isSubscriber ? const Color(0xFFDF9E5B) : Colors.white.withOpacity(0.6),
                                ),
                                const SizedBox(width: 4),
                                Text(
                                  m.isSubscriber ? '${m.subscriptionTier} VIP' : 'FREE ACCOUNT',
                                  style: TextStyle(
                                    fontSize: 9,
                                    letterSpacing: 1.0,
                                    fontWeight: FontWeight.w800,
                                    color: m.isSubscriber ? const Color(0xFFDF9E5B) : Colors.white.withOpacity(0.7),
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
                        : _viewField('Full Name', effectiveName, Icons.person_outline),
                    _divider(),
                    _viewField(
                      'Mobile Number',
                      m.mobile.isNotEmpty ? m.mobile : AppConstants.currentUserMobile,
                      Icons.phone_iphone_outlined,
                      isReadOnly: true,
                    ),
                    _divider(),
                    _isEditing
                        ? _editField('Email Address', _emailController, Icons.mail_outline, hint: 'Enter email address (Optional)')
                        : _viewField('Email Address', (m.email.isNotEmpty && !m.email.endsWith('@sizzlo.in')) ? m.email : 'Not provided', Icons.mail_outline),
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
                        ? _editDateField('Birthday', _birthdayController, Icons.cake_outlined)
                        : _viewField('Birthday', m.birthday.isNotEmpty ? m.birthday : 'Not specified', Icons.cake_outlined),
                    _divider(),
                    _isEditing
                        ? _maritalStatusPicker()
                        : _viewField('Marital Status', m.isMarried.isNotEmpty ? (m.isMarried.toLowerCase() == 'yes' ? 'Married' : 'Single') : 'Single', Icons.favorite_border_rounded),
                    if (_isMarried.toLowerCase() == 'yes' || m.isMarried.toLowerCase() == 'yes') ...[
                      _divider(),
                      _isEditing
                          ? _editField('Spouse Name', _spouseNameController, Icons.person_add_alt)
                          : _viewField('Spouse Name', m.spouseName.isNotEmpty ? m.spouseName : 'Not specified', Icons.person_add_alt),
                      _divider(),
                      _isEditing
                          ? _editDateField('Anniversary Date', _anniversaryController, Icons.celebration_outlined)
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
                    _viewField(
                      'Membership Status',
                      m.isSubscriber ? 'Active VIP Subscriber' : 'Free Account (No Active Plan)',
                      m.isSubscriber ? Icons.verified_outlined : Icons.info_outline,
                      isReadOnly: true,
                      valueColor: m.isSubscriber ? const Color(0xFF4EE3B8) : Colors.white70,
                    ),
                    _divider(),
                    _viewField(
                      'Membership ID',
                      m.isSubscriber && m.membershipId.isNotEmpty ? m.membershipId : 'Available with VIP Membership',
                      Icons.badge_outlined,
                      isReadOnly: true,
                    ),
                    _divider(),
                    _viewField(
                      'Membership Tier',
                      m.isSubscriber ? m.membershipType : 'Standard Guest (Tap to Explore Plans)',
                      Icons.workspace_premium_outlined,
                      isReadOnly: true,
                      valueColor: const Color(0xFFDF9E5B),
                      onTap: !m.isSubscriber ? () => Get.toNamed(AppRoutes.PLANS) : null,
                    ),
                    _divider(),
                    _viewField(
                      'Member Since',
                      m.issuedDate.isNotEmpty ? m.issuedDate : 'Today',
                      Icons.calendar_today_outlined,
                      isReadOnly: true,
                    ),
                    _divider(),
                    _viewField(
                      'Valid Till',
                      m.isSubscriber && m.expiryDate.isNotEmpty && m.expiryDate != '—' ? m.expiryDate : '—',
                      Icons.event_available_outlined,
                      isReadOnly: true,
                    ),
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

  Widget _viewField(
    String label,
    String value,
    IconData icon, {
    bool isReadOnly = false,
    VoidCallback? onTap,
    Color? valueColor,
  }) {
    final content = Padding(
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
                color: valueColor ?? (isReadOnly ? Colors.white70 : Colors.white),
              ),
            ),
          ),
          if (onTap != null) ...[
            const SizedBox(width: 6),
            Icon(Icons.chevron_right_rounded, size: 16, color: AppColors.gold.withOpacity(0.8)),
          ],
        ],
      ),
    );

    if (onTap != null) {
      return InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: content,
      );
    }
    return content;
  }

  Widget _editField(String label, TextEditingController controller, IconData icon, {String? hint}) {
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
                hintText: hint ?? 'Enter $label',
                hintStyle: TextStyle(color: Colors.white.withOpacity(0.25), fontSize: 12),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _editDateField(String label, TextEditingController controller, IconData icon) {
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
            child: InkWell(
              onTap: () => _pickDateFor(controller),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    controller.text.isNotEmpty ? controller.text : 'Select date',
                    style: TextStyle(
                      fontSize: 13,
                      color: controller.text.isNotEmpty ? Colors.white : Colors.white.withOpacity(0.35),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(width: 6),
                  const Icon(Icons.calendar_month_rounded, size: 15, color: Color(0xFFDF9E5B)),
                ],
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
