import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'app/core/theme/app_theme.dart';
import 'app/core/values/app_constants.dart';
import 'app/routes/app_pages.dart';
import 'app/controllers/navigation_controller.dart';
import 'app/modules/home/controllers/home_controller.dart';
import 'app/data/services/notification_service.dart';

import 'app/data/services/local_storage_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
  await Get.putAsync(() => NotificationService().init());
  try {
    final session = await LocalStorageService.getUserSession();
    if (session['mobile'] != null && session['mobile']!.isNotEmpty) {
      AppConstants.currentUserMobile = session['mobile']!;
    }
    if (session['membershipId'] != null && session['membershipId']!.isNotEmpty) {
      AppConstants.currentMembershipId = session['membershipId']!;
    }
    if (session['name'] != null && session['name']!.isNotEmpty) {
      AppConstants.currentUserName = session['name']!;
    }
    if (session['profilePic'] != null && session['profilePic']!.isNotEmpty) {
      AppConstants.currentUserProfilePic = session['profilePic']!;
    }
  } catch (_) {}
  runApp(const SizzloApp());
}

class SizzloApp extends StatelessWidget {
  const SizzloApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GetMaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      initialRoute: AppPages.INITIAL,
      initialBinding: BindingsBuilder(() {
        Get.put(NavigationController(), permanent: true);
        Get.put(HomeController(), permanent: true);
      }),
      getPages: AppPages.routes,
      defaultTransition: Transition.cupertino,
      builder: (context, child) {
        return GestureDetector(
          behavior: HitTestBehavior.translucent,
          onTap: () => FocusManager.instance.primaryFocus?.unfocus(),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
