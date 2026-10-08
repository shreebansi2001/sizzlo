import 'dart:convert';
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import '../core/theme/app_colors.dart';
import '../core/values/app_constants.dart';
import '../data/models/member_model.dart';
import '../data/services/api_service.dart';
import '../data/services/local_storage_service.dart';
import '../modules/home/controllers/home_controller.dart';
import '../modules/profile/controllers/profile_controller.dart';

class ProfileAvatarWidget extends StatelessWidget {
  final double radius;
  final String? imageUrl;
  final String name;
  final bool showEditBadge;
  final VoidCallback? onAvatarChanged;
  final double borderWidth;
  final Color? borderColor;

  const ProfileAvatarWidget({
    Key? key,
    this.radius = 28,
    this.imageUrl,
    required this.name,
    this.showEditBadge = false,
    this.onAvatarChanged,
    this.borderWidth = 1.5,
    this.borderColor,
  }) : super(key: key);

  static const List<Color> _googleAvatarColors = [
    Color(0xFF1A73E8), // Google Blue
    Color(0xFFD93025), // Google Red
    Color(0xFF1E8E3E), // Google Green
    Color(0xFFE8710A), // Google Orange
    Color(0xFF9334E6), // Google Purple
    Color(0xFF007B83), // Google Teal
    Color(0xFFC2185B), // Google Pink
    Color(0xFF3949AB), // Google Indigo
    Color(0xFF00897B), // Google Sea Green
    Color(0xFFE64A19), // Google Deep Orange
  ];

  Color _getGoogleColor(String letter) {
    if (letter.isEmpty) return const Color(0xFF1A73E8);
    final code = letter.codeUnitAt(0);
    return _googleAvatarColors[code % _googleAvatarColors.length];
  }

  String get _avatarLetter {
    final clean = name.trim();
    if (clean.isNotEmpty && clean.toLowerCase() != 'guest') {
      return clean.characters.first.toUpperCase();
    }
    final sessionName = AppConstants.currentUserName.trim();
    if (sessionName.isNotEmpty && sessionName.toLowerCase() != 'guest') {
      return sessionName.characters.first.toUpperCase();
    }
    return 'U';
  }

  @override
  Widget build(BuildContext context) {
    final size = radius * 2;
    final url = (imageUrl != null && imageUrl!.trim().isNotEmpty)
        ? imageUrl!.trim()
        : (AppConstants.currentUserProfilePic.trim().isNotEmpty
            ? AppConstants.currentUserProfilePic.trim()
            : '');

    final bool hasCustomImage = url.isNotEmpty;
    final letter = _avatarLetter;
    final googleColor = _getGoogleColor(letter);

    final avatarBody = Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: hasCustomImage ? Colors.transparent : googleColor,
        border: Border.all(
          color: borderColor ?? (hasCustomImage ? const Color(0xFFDF9E5B) : Colors.white.withOpacity(0.18)),
          width: borderWidth,
        ),
        boxShadow: [
          BoxShadow(
            color: hasCustomImage
                ? const Color(0xFFDF9E5B).withOpacity(0.18)
                : googleColor.withOpacity(0.25),
            blurRadius: 8,
            spreadRadius: 1,
          ),
        ],
      ),
      child: ClipOval(
        child: _buildImageContent(url, size),
      ),
    );

    if (!showEditBadge) {
      return avatarBody;
    }

    return GestureDetector(
      onTap: () => showAvatarPickerBottomSheet(context, onAvatarChanged),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          avatarBody,
          Positioned(
            bottom: 0,
            right: 0,
            child: Container(
              width: (radius * 0.65).clamp(24.0, 36.0),
              height: (radius * 0.65).clamp(24.0, 36.0),
              decoration: BoxDecoration(
                gradient: AppColors.flameGradient,
                shape: BoxShape.circle,
                border: Border.all(color: const Color(0xFF131715), width: 2),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.5),
                    blurRadius: 6,
                  ),
                ],
              ),
              child: Icon(
                Icons.camera_alt_rounded,
                size: (radius * 0.35).clamp(13.0, 18.0),
                color: Colors.white,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildImageContent(String url, double size) {
    if (url.isEmpty) {
      return _buildInitialsPlaceholder(size);
    }

    // Base64 Data URL or raw base64
    if (url.startsWith('data:image') || (!url.startsWith('http') && url.length > 100)) {
      try {
        final pureBase64 = url.contains(',') ? url.split(',').last : url;
        final bytes = base64Decode(pureBase64);
        return Image.memory(
          bytes,
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _buildInitialsPlaceholder(size),
        );
      } catch (_) {
        return _buildInitialsPlaceholder(size);
      }
    }

    // Local file path
    if (url.startsWith('/') || url.startsWith('file://')) {
      try {
        final filePath = url.replaceFirst('file://', '');
        return Image.file(
          File(filePath),
          width: size,
          height: size,
          fit: BoxFit.cover,
          errorBuilder: (_, __, ___) => _buildInitialsPlaceholder(size),
        );
      } catch (_) {
        return _buildInitialsPlaceholder(size);
      }
    }

    // Remote HTTP / HTTPS URL
    return Image.network(
      url,
      width: size,
      height: size,
      fit: BoxFit.cover,
      loadingBuilder: (context, child, loadingProgress) {
        if (loadingProgress == null) return child;
        return Container(
          width: size,
          height: size,
          decoration: const BoxDecoration(
            color: Color(0xFF281C10),
            shape: BoxShape.circle,
          ),
          child: Center(
            child: SizedBox(
              width: size * 0.35,
              height: size * 0.35,
              child: const CircularProgressIndicator(
                strokeWidth: 2,
                color: Color(0xFFDF9E5B),
              ),
            ),
          ),
        );
      },
      errorBuilder: (_, __, ___) => _buildInitialsPlaceholder(size),
    );
  }

  Widget _buildInitialsPlaceholder(double size) {
    final letter = _avatarLetter;
    final googleColor = _getGoogleColor(letter);

    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: googleColor,
        shape: BoxShape.circle,
      ),
      child: Center(
        child: Text(
          letter,
          style: GoogleFonts.plusJakartaSans(
            fontSize: size * 0.48,
            fontWeight: FontWeight.w700,
            color: Colors.white,
            height: 1.0,
          ),
        ),
      ),
    );
  }

  /// Opens the luxury Avatar Selection Modal
  static void showAvatarPickerBottomSheet(BuildContext context, [VoidCallback? onDone]) {
    final picker = ImagePicker();

    Get.bottomSheet(
      Container(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 22),
        decoration: const BoxDecoration(
          color: Color(0xFF141917),
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: Color(0x33DF9E5B))),
        ),
        child: SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Profile Photo',
                    style: GoogleFonts.playfairDisplay(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  Text(
                    'VIP IDENTITY',
                    style: GoogleFonts.plusJakartaSans(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: AppColors.gold,
                      letterSpacing: 1.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 18),

              // Option 1: Take Photo with Camera
              _buildPickerOption(
                icon: Icons.photo_camera_rounded,
                title: 'Take a Photo',
                subtitle: 'Capture portrait using your camera',
                onTap: () async {
                  Get.back();
                  try {
                    final XFile? photo = await picker.pickImage(
                      source: ImageSource.camera,
                      imageQuality: 85,
                      maxWidth: 800,
                      maxHeight: 800,
                    );
                    if (photo != null) {
                      final bytes = await photo.readAsBytes();
                      final base64String = 'data:image/jpeg;base64,${base64Encode(bytes)}';
                      await _applyAndSaveAvatar(base64String, onDone);
                    }
                  } catch (e) {
                    Get.snackbar(
                      'Camera Notice',
                      'Unable to capture photo. You can select from gallery or choose an avatar preset.',
                      backgroundColor: const Color(0xFF131715),
                      colorText: Colors.white,
                    );
                  }
                },
              ),
              const SizedBox(height: 8),

              // Option 2: Choose from Gallery
              _buildPickerOption(
                icon: Icons.photo_library_rounded,
                title: 'Choose from Gallery',
                subtitle: 'Select from your device photos',
                onTap: () async {
                  Get.back();
                  try {
                    final XFile? image = await picker.pickImage(
                      source: ImageSource.gallery,
                      imageQuality: 85,
                      maxWidth: 800,
                      maxHeight: 800,
                    );
                    if (image != null) {
                      final bytes = await image.readAsBytes();
                      final base64String = 'data:image/jpeg;base64,${base64Encode(bytes)}';
                      await _applyAndSaveAvatar(base64String, onDone);
                    }
                  } catch (e) {
                    Get.snackbar(
                      'Gallery Notice',
                      'Unable to access gallery. You can select an avatar preset.',
                      backgroundColor: const Color(0xFF131715),
                      colorText: Colors.white,
                    );
                  }
                },
              ),
              const SizedBox(height: 8),

              // Option 3: Curated Luxury VIP Avatars
              _buildPickerOption(
                icon: Icons.auto_awesome_rounded,
                title: 'Luxury Avatar Presets',
                subtitle: 'Choose from 6 curated executive avatars',
                onTap: () {
                  Get.back();
                  _showPresetAvatarsDialog(context, onDone);
                },
              ),
              const SizedBox(height: 12),
            ],
          ),
        ),
      ),
      isScrollControlled: true,
    );
  }

  static Widget _buildPickerOption({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: const Color(0xFF1E2421),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withOpacity(0.06)),
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: const Color(0xFF281C10),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: const Color(0xFF6B4520).withOpacity(0.5)),
                ),
                child: Icon(icon, color: const Color(0xFFDF9E5B), size: 20),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: GoogleFonts.plusJakartaSans(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Colors.white,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 11,
                        color: Colors.white.withOpacity(0.45),
                      ),
                    ),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: Colors.white.withOpacity(0.3), size: 20),
            ],
          ),
        ),
      ),
    );
  }

  static void _showPresetAvatarsDialog(BuildContext context, [VoidCallback? onDone]) {
    final presets = [
      {
        'title': 'Executive Gold',
        'url': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      },
      {
        'title': 'Chic Epicurean',
        'url': 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      },
      {
        'title': 'Dining Connoisseur',
        'url': 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      },
      {
        'title': 'Gourmet VIP',
        'url': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      },
      {
        'title': 'Modern Minimalist',
        'url': 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
      },
      {
        'title': 'Aristocrat Flame',
        'url': 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      },
    ];

    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF141917),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        insetPadding: const EdgeInsets.all(20),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Choose Luxury Avatar',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                'Select a curated high-definition avatar preset',
                style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5)),
              ),
              const SizedBox(height: 20),
              Wrap(
                spacing: 16,
                runSpacing: 16,
                alignment: WrapAlignment.center,
                children: presets.map((p) {
                  return GestureDetector(
                    onTap: () async {
                      Get.back();
                      await _applyAndSaveAvatar(p['url']!, onDone);
                    },
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Container(
                          width: 72,
                          height: 72,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            border: Border.all(color: const Color(0xFFDF9E5B), width: 2),
                          ),
                          child: ClipOval(
                            child: Image.network(
                              p['url']!,
                              fit: BoxFit.cover,
                              errorBuilder: (_, __, ___) => const Icon(Icons.person, color: Color(0xFFDF9E5B)),
                            ),
                          ),
                        ),
                        const SizedBox(height: 6),
                        Text(
                          p['title']!,
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w600,
                            color: Colors.white.withOpacity(0.8),
                          ),
                        ),
                      ],
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => Get.back(),
                child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
              ),
            ],
          ),
        ),
      ),
    );
  }

  static void _showUrlInputDialog(BuildContext context, [VoidCallback? onDone]) {
    final controller = TextEditingController();
    Get.dialog(
      Dialog(
        backgroundColor: const Color(0xFF141917),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        insetPadding: const EdgeInsets.all(20),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Enter Image URL',
                style: GoogleFonts.playfairDisplay(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Paste direct link to your photo (JPEG, PNG, WebP)',
                style: TextStyle(fontSize: 12, color: Colors.white.withOpacity(0.5)),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                style: const TextStyle(color: Colors.white, fontSize: 13),
                decoration: InputDecoration(
                  hintText: 'https://example.com/avatar.jpg',
                  hintStyle: TextStyle(color: Colors.white.withOpacity(0.25), fontSize: 12),
                  filled: true,
                  fillColor: const Color(0xFF1E2421),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.white.withOpacity(0.1)),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  TextButton(
                    onPressed: () => Get.back(),
                    child: const Text('Cancel', style: TextStyle(color: Colors.grey)),
                  ),
                  const SizedBox(width: 8),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.flame,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: () async {
                      final url = controller.text.trim();
                      if (url.isNotEmpty) {
                        Get.back();
                        await _applyAndSaveAvatar(url, onDone);
                      }
                    },
                    child: const Text('Apply Photo', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  static Future<void> _applyAndSaveAvatar(String avatarUrl, [VoidCallback? onDone]) async {
    // 1. Update In-Memory Constants
    AppConstants.currentUserProfilePic = avatarUrl;

    // 2. Persist to Local Storage immediately
    await LocalStorageService.saveProfilePic(avatarUrl);

    // 3. Update HomeController and ProfileController state
    MemberModel? currentMember;
    if (Get.isRegistered<HomeController>()) {
      final homeCtrl = Get.find<HomeController>();
      currentMember = homeCtrl.member.value.copyWith(profilePictureUrl: avatarUrl);
      homeCtrl.member.value = currentMember;
    }
    if (Get.isRegistered<ProfileController>()) {
      final profileCtrl = Get.find<ProfileController>();
      currentMember = profileCtrl.member.value.copyWith(profilePictureUrl: avatarUrl);
      profileCtrl.member.value = currentMember;
    }

    // 4. Save to Backend via PUT /api/members/{id}
    try {
      final membershipId = currentMember?.membershipId.isNotEmpty == true
          ? currentMember!.membershipId
          : AppConstants.currentMembershipId;
      final apiService = ApiService();
      await apiService.updateMemberProfile({
        'profilePictureUrl': avatarUrl,
      }, membershipId);
    } catch (_) {}

    if (onDone != null) {
      onDone();
    }

    Get.snackbar(
      'Profile Photo Updated',
      'Your VIP profile picture has been saved successfully.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: const Color(0xFF0E382B),
      colorText: const Color(0xFF4EE3B8),
      margin: const EdgeInsets.all(16),
      borderRadius: 14,
      duration: const Duration(seconds: 3),
    );
  }
}
