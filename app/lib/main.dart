import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'app/core/theme/app_theme.dart';
import 'app/core/values/app_constants.dart';
import 'app/routes/app_pages.dart';
import 'app/controllers/navigation_controller.dart';
import 'app/modules/home/controllers/home_controller.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ),
  );
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
    );
  }
}
