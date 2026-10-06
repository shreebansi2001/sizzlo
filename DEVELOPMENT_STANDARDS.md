# Sizzlo App & Web Standard Architecture & Engineering Guidelines

This document serves as the mandatory architecture reference for both **Mobile (Flutter App)** and **Web (Admin / Portal)**. Every screen, component, and workflow must follow these patterns to prevent recurring issues with keyboards, focus nodes, form validation, hardware/browser back buttons, local storage, and localization.

---

## 1. Directory Structure Standards

### 📱 Flutter App (`/app/lib/`)
```
lib/
├── main.dart                          # App bootstrap & initialization
├── app/
│   ├── core/
│   │   ├── constants/
│   │   │   ├── app_constants.dart     # System constants, live base URLs
│   │   │   └── storage_keys.dart      # All LocalStorage / SecureStorage keys
│   │   ├── localization/              # ARB files & locale controllers
│   │   │   ├── l10n/                  # app_en.arb, app_hi.arb, app_gu.arb
│   │   │   └── locale_provider.dart   # Reactive locale switcher
│   │   ├── storage/
│   │   │   ├── local_storage.dart     # SharedPreferences typed wrapper
│   │   │   └── secure_storage.dart    # FlutterSecureStorage for tokens/keys
│   │   ├── theme/
│   │   │   ├── app_colors.dart        # Luxury / Brand color palette
│   │   │   └── app_typography.dart
│   │   └── utils/
│   │       ├── validators.dart        # Centralized form validation rules
│   │       ├── keyboard_utils.dart    # Soft-keyboard dismiss & focus helpers
│   │       └── debouncer.dart         # Debouncer for search / fast inputs
│   ├── data/
│   │   ├── models/                    # Data models (fromJson / toJson)
│   │   └── services/
│   │       └── api_service.dart       # Network & HTTP client
│   ├── modules/                       # Feature modules (Controller + View)
│   │   ├── auth/
│   │   ├── home/
│   │   ├── profile/
│   │   └── ...
│   ├── routes/
│   │   └── app_pages.dart             # Named routes & transitions
│   └── widgets/                       # Reusable UI components
│       ├── app_text_field.dart        # Universal standardized text field
│       ├── app_scaffold.dart          # Keyboard dismiss + PopScope back wrapper
│       ├── app_button.dart            # Double-tap safe button with loading state
│       └── app_dialogs.dart           # Standard confirmation popups
```

### 💻 Web Admin (`/web/src/`)
```
src/
├── api/
│   └── client.ts                      # Axios instance with interceptors & base URLs
├── components/
│   ├── common/
│   │   ├── FormInput.tsx              # Standard input with validation & focus
│   │   ├── Button.tsx                 # Debounced & loading-safe button
│   │   └── Modal.tsx                  # Accessible overlay modal
│   └── layout/                        # Sidebar, Header, PageContainer
├── pages/                             # Route-level views
├── types/                             # TypeScript definitions
└── utils/
    ├── storage.ts                     # LocalStorage / SessionStorage wrapper
    └── validators.ts                  # Form validation logic
```

---

## 2. Universal Keyboard & Focus Node Standards (Flutter)

### The Most Common Keyboard Issues & Mandatory Solutions

| Issue | Root Cause | Mandatory Solution |
| :--- | :--- | :--- |
| **Keyboard doesn't open on tap** | Shared `FocusNode` across multiple widgets, widget wrapped in `IgnorePointer`/`AbsorbPointer`, or `readOnly: true`. | Always instantiate a unique `FocusNode` per field inside `StatefulWidget` and initialize in `initState()`. Ensure `readOnly: false`. |
| **Bottom Overflow (Yellow-Black stripes)** | Screen is not configured to resize or lacks a scroll view when keyboard occupies screen height. | Always wrap form body in `SingleChildScrollView` with `keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag`, and set `resizeToAvoidBottomInset: true` on `Scaffold`. |
| **Keyboard hides the active input field** | Insufficient scroll margin above virtual keyboard. | Set `scrollPadding: const EdgeInsets.only(bottom: 120)` on the `TextFormField`. |
| **Keyboard stays open when tapping outside** | Missing global unfocus handler. | Wrap root application or screen in a `GestureDetector` that unfocuses the `primaryFocus`. |
| **Keyboard stays open when navigating** | Route change occurred without explicit unfocus. | Call `FocusManager.instance.primaryFocus?.unfocus()` before invoking `Navigator.push` or `Get.toNamed`. |
| **Memory leaks & crash on unmount** | Controllers or FocusNodes not disposed. | **Never forget:** Call `.dispose()` on every `FocusNode` and `TextEditingController` inside `dispose()`. |

### Global Keyboard Dismissal in `MaterialApp`
Add this globally in `main.dart` or `app.dart` so tapping blank space outside an input automatically dismisses the keyboard anywhere in the application:

```dart
MaterialApp(
  builder: (context, child) {
    return GestureDetector(
      behavior: HitTestBehavior.translucent,
      onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
      child: child,
    );
  },
  // ...
);
```

---

## 3. Standardized Reusable Text Field (`AppTextField`)

Never write a bare `TextField` or `TextFormField` directly on a screen. Always use the standardized `AppTextField`:

```dart
// app/lib/app/widgets/app_text_field.dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class AppTextField extends StatefulWidget {
  final TextEditingController controller;
  final String label;
  final String? hint;
  final FocusNode? focusNode;
  final FocusNode? nextFocusNode;
  final TextInputType keyboardType;
  final TextInputAction? textInputAction;
  final String? Function(String?)? validator;
  final List<TextInputFormatter>? inputFormatters;
  final bool isPassword;
  final bool readOnly;
  final int? maxLength;
  final int maxLines;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final ValueChanged<String>? onChanged;
  final VoidCallback? onSubmitted;
  final VoidCallback? onTap;
  final AutovalidateMode autovalidateMode;

  const AppTextField({
    super.key,
    required this.controller,
    required this.label,
    this.hint,
    this.focusNode,
    this.nextFocusNode,
    this.keyboardType = TextInputType.text,
    this.textInputAction,
    this.validator,
    this.inputFormatters,
    this.isPassword = false,
    this.readOnly = false,
    this.maxLength,
    this.maxLines = 1,
    this.prefixIcon,
    this.suffixIcon,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.autovalidateMode = AutovalidateMode.onUserInteraction,
  });

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  bool _obscured = true;

  @override
  Widget build(BuildContext context) {
    final effectiveAction = widget.textInputAction ??
        (widget.nextFocusNode != null ? TextInputAction.next : TextInputAction.done);

    return TextFormField(
      controller: widget.controller,
      focusNode: widget.focusNode,
      keyboardType: widget.keyboardType,
      textInputAction: effectiveAction,
      obscureText: widget.isPassword && _obscured,
      readOnly: widget.readOnly,
      maxLength: widget.maxLength,
      maxLines: widget.isPassword ? 1 : widget.maxLines,
      inputFormatters: widget.inputFormatters,
      autovalidateMode: widget.autovalidateMode,
      validator: widget.validator,
      onChanged: widget.onChanged,
      onTap: widget.onTap,
      scrollPadding: const EdgeInsets.only(bottom: 140), // Guarantees field visibility above keyboard
      onFieldSubmitted: (_) {
        if (widget.nextFocusNode != null) {
          FocusScope.of(context).requestFocus(widget.nextFocusNode);
        } else {
          FocusScope.of(context).unfocus();
          widget.onSubmitted?.call();
        }
      },
      decoration: InputDecoration(
        labelText: widget.label,
        hintText: widget.hint,
        counterText: '',
        prefixIcon: widget.prefixIcon,
        suffixIcon: widget.isPassword
            ? IconButton(
                icon: Icon(
                  _obscured ? Icons.visibility_off_outlined : Icons.visibility_outlined,
                  color: Colors.grey,
                ),
                onPressed: () => setState(() => _obscured = !_obscured),
              )
            : widget.suffixIcon,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      ),
    );
  }
}
```

### Clean Form Screen Pattern (Proper Focus Node Lifecycle)
```dart
class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _nameController = TextEditingController();

  final _phoneFocus = FocusNode();
  final _nameFocus = FocusNode();

  @override
  void dispose() {
    // ALWAYS dispose every controller and focus node
    _phoneController.dispose();
    _nameController.dispose();
    _phoneFocus.dispose();
    _nameFocus.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) {
      // Auto-focus first invalid field
      if (_phoneController.text.trim().isEmpty) {
        _phoneFocus.requestFocus();
      } else if (_nameController.text.trim().isEmpty) {
        _nameFocus.requestFocus();
      }
      return;
    }
    // Proceed with API call
  }

  @override
  Widget build(BuildContext context) {
    return AppScaffold(
      appBar: AppBar(title: const Text('Login')),
      body: SingleChildScrollView(
        keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag,
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            children: [
              AppTextField(
                controller: _phoneController,
                focusNode: _phoneFocus,
                nextFocusNode: _nameFocus,
                label: 'Phone Number',
                keyboardType: TextInputType.phone,
                inputFormatters: [
                  FilteringTextInputFormatter.digitsOnly,
                  LengthLimitingTextInputFormatter(10),
                ],
                validator: (val) => Validators.phone(val),
              ),
              const SizedBox(height: 16),
              AppTextField(
                controller: _nameController,
                focusNode: _nameFocus,
                label: 'Full Name',
                validator: (val) => Validators.required(val, fieldName: 'Full Name'),
                onSubmitted: _submit,
              ),
              const SizedBox(height: 24),
              AppButton(
                text: 'Continue',
                onPressed: _submit,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
```

---

## 4. Centralized Form Validation Standards (`Validators`)

All validation rules must be centralized in `validators.dart` to maintain consistency across the entire app.

```dart
// app/lib/app/core/utils/validators.dart
class Validators {
  static String? required(String? value, {String fieldName = 'This field'}) {
    if (value == null || value.trim().isEmpty) {
      return '$fieldName is required';
    }
    return null;
  }

  static String? phone(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Mobile number is required';
    }
    final clean = value.trim();
    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(clean)) {
      return 'Enter a valid 10-digit mobile number';
    }
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Email address is required';
    }
    final clean = value.trim();
    if (!RegExp(r'^[\w\.\-+]+@([\w\-]+\.)+[\w\-]{2,4}$').hasMatch(clean)) {
      return 'Enter a valid email address';
    }
    return null;
  }

  static String? otp(String? value, {int length = 6}) {
    if (value == null || value.trim().isEmpty) {
      return 'OTP is required';
    }
    if (value.trim().length != length) {
      return 'Enter a valid $length-digit OTP';
    }
    return null;
  }

  static String? minLength(String? value, int min, {String fieldName = 'Password'}) {
    if (value == null || value.length < min) {
      return '$fieldName must be at least $min characters';
    }
    return null;
  }
}
```

---

## 5. Back Button & Navigation Standards (`AppScaffold`)

### Critical Navigation Rules
1. **Never return to Splash or Login after authentication**: Use route replacement (`Get.offAllNamed()` or `context.go('/home')`).
2. **Prevent accidental exit from Root screens**: Implement double-back press confirmation on home screens.
3. **Prevent data loss**: Trigger an unsaved changes confirmation dialog before popping forms.
4. **Always close keyboard before popping screen**: Avoid jerky layout shifts during screen transitions.

### Standard `AppScaffold` (Using Flutter 3+ `PopScope`)
```dart
// app/lib/app/widgets/app_scaffold.dart
import 'package:flutter/material.dart';

class AppScaffold extends StatelessWidget {
  final Widget body;
  final PreferredSizeWidget? appBar;
  final Widget? bottomNavigationBar;
  final bool canPop;
  final Future<bool> Function()? onWillPop;
  final bool isRootScreen;

  const AppScaffold({
    super.key,
    required this.body,
    this.appBar,
    this.bottomNavigationBar,
    this.canPop = true,
    this.onWillPop,
    this.isRootScreen = false,
  });

  static DateTime? _lastBackPressed;

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !isRootScreen && canPop && onWillPop == null,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;

        // 1. Unfocus keyboard first if currently open
        if (MediaQuery.of(context).viewInsets.bottom > 0) {
          FocusManager.instance.primaryFocus?.unfocus();
          return;
        }

        // 2. Custom unsaved changes callback
        if (onWillPop != null) {
          final shouldPop = await onWillPop!();
          if (shouldPop && context.mounted) {
            Navigator.of(context).pop();
          }
          return;
        }

        // 3. Root screen double back to exit
        if (isRootScreen) {
          final now = DateTime.now();
          if (_lastBackPressed == null ||
              now.difference(_lastBackPressed!) > const Duration(seconds: 2)) {
            _lastBackPressed = now;
            ScaffoldMessenger.of(context).showSnackBar(
              const SnackBar(
                content: Text('Press back again to exit'),
                duration: Duration(seconds: 2),
              ),
            );
          } else {
            Navigator.of(context).pop();
          }
        }
      },
      child: Scaffold(
        appBar: appBar,
        resizeToAvoidBottomInset: true,
        body: SafeArea(child: body),
        bottomNavigationBar: bottomNavigationBar,
      ),
    );
  }
}
```

---

## 6. Local & Secure Storage Standards

### Separation of Storage Concerns
- **`SharedPreferences`**: Theme, language, onboarding flags, user preferences, cached UI states.
- **`FlutterSecureStorage`**: Auth tokens, refresh tokens, sensitive profile keys.
- **Web App**: `localStorage` for non-sensitive UI settings; `httpOnly` secure cookies or memory session for sensitive authentication tokens.

```dart
// app/lib/app/core/constants/storage_keys.dart
class StorageKeys {
  static const String hasSeenOnboarding = 'has_seen_onboarding';
  static const String languageCode = 'app_language_code';
  static const String themeMode = 'app_theme_mode';
  static const String lastLoggedInPhone = 'last_logged_in_phone';
  static const String cachedMemberData = 'cached_member_data';
  
  // Secure Storage keys
  static const String authToken = 'secure_auth_token';
  static const String refreshToken = 'secure_refresh_token';
}
```

```dart
// app/lib/app/core/storage/local_storage.dart
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class LocalStorage {
  static late SharedPreferences _prefs;

  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
  }

  static Future<bool> setBool(String key, bool value) => _prefs.setBool(key, value);
  static bool getBool(String key, {bool defaultValue = false}) =>
      _prefs.getBool(key) ?? defaultValue;

  static Future<bool> setString(String key, String value) => _prefs.setString(key, value);
  static String? getString(String key) => _prefs.getString(key);

  static Future<bool> setJson(String key, Map<String, dynamic> jsonMap) =>
      _prefs.setString(key, jsonEncode(jsonMap));

  static Map<String, dynamic>? getJson(String key) {
    final str = _prefs.getString(key);
    if (str == null) return null;
    try {
      return jsonDecode(str) as Map<String, dynamic>;
    } catch (_) {
      return null;
    }
  }

  static Future<bool> remove(String key) => _prefs.remove(key);
  static Future<bool> clear() => _prefs.clear();
}
```

---

## 7. Localization (l10n) Standards

### Rules for Clean Multilingual Support
1. **Zero Hardcoded Strings**: No raw UI text inside widgets. Every label, validation string, and toast must come from localization.
2. **Synchronized Keys**: When adding a new key to `app_en.arb`, immediately add translations to `app_hi.arb` and `app_gu.arb`.
3. **Plurals & Placeholders**: Always use placeholders (e.g., `Hello {name}`) rather than manual string concatenation (`'Hello ' + name`).

### Sample `app_en.arb`
```json
{
  "@@locale": "en",
  "appName": "Sizzlo",
  "welcomeBack": "Welcome Back",
  "phoneRequired": "Phone number is required",
  "phoneInvalid": "Enter a valid 10-digit mobile number",
  "submit": "Submit",
  "loading": "Please wait...",
  "pressBackAgain": "Press back again to exit"
}
```

---

## 8. Network, Double-Tap Prevention & Loading Buttons

Never allow users to trigger multiple HTTP requests by tapping a button multiple times:

```dart
// app/lib/app/widgets/app_button.dart
import 'package:flutter/material.dart';

class AppButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final double height;
  final Color? backgroundColor;

  const AppButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isLoading = false,
    this.height = 50,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: height,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: backgroundColor,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
        onPressed: isLoading ? null : onPressed, // Disables button while loading
        child: isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(strokeWidth: 2.5, color: Colors.white),
              )
            : Text(
                text,
                style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
              ),
      ),
    );
  }
}
```

---

## 9. Web Application Specifics (Responsive & Browser Compatibility)

1. **Max-Width Constraint**: On desktop browsers, form cards must be constrained using `ConstrainedBox(constraints: BoxConstraints(maxWidth: 480))` to avoid stretching edge-to-edge.
2. **Keyboard Navigation**: Form inputs must support `Tab` for next input and `Enter` to submit.
3. **Browser Refresh State**: Web applications must parse query parameters and restore authentication sessions seamlessly upon browser page refresh (`F5`).
4. **URL Strategy**: Always initialize `usePathUrlStrategy()` to provide clean URLs without `#` hash prefixes.

---

## 10. Developer Pre-Flight Checklist (Run Before Every Release)

Before submitting or generating APK / Web builds, verify every item below:

- [ ] **No bare `TextField`**: Every input field uses `AppTextField`.
- [ ] **FocusNode Lifecycle**: Every `FocusNode` and `TextEditingController` is instantiated in state and disposed in `dispose()`.
- [ ] **Keyboard Scroll**: Forms are wrapped in `SingleChildScrollView(keyboardDismissBehavior: ScrollViewKeyboardDismissBehavior.onDrag)`.
- [ ] **Keyboard Overflow Tested**: Verified on small screen sizes that keyboard doesn't produce yellow-black overflow warnings.
- [ ] **Outside Tap Dismiss**: Tested that tapping outside of any text field dismisses the virtual keyboard.
- [ ] **Validation Centralized**: All validations use `Validators.<rule>` with clean trim and format verification.
- [ ] **Back Navigation**: Screen pop handled via `AppScaffold` / `PopScope`; login/splash routes removed from history stack upon authentication.
- [ ] **Storage Keys**: No raw strings used for storage keys; all access uses `StorageKeys.<key>`.
- [ ] **No Double Tap**: All submit buttons use `AppButton` with `isLoading` disabling rapid repeated taps.
- [ ] **Zero Hardcoded Strings**: All UI text is localized through l10n.
