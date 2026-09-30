import 'package:get/get.dart';
import '../../../data/models/notification_item_model.dart';

class NotificationsController extends GetxController {
  final RxList<NotificationItemModel> notifications = <NotificationItemModel>[].obs;

  @override
  void onInit() {
    super.onInit();
    _loadNotifications();
  }

  void _loadNotifications() {
    notifications.value = [
      NotificationItemModel(id: 1, type: "gift", title: "Birthday Coupon Activated", desc: "Your complimentary cake voucher is ready", time: "2h ago"),
      NotificationItemModel(id: 2, type: "calendar", title: "Reservation Confirmed", desc: "Table for 4 at Yanki Signature, 20 Jun 8:30 PM", time: "Yesterday"),
      NotificationItemModel(id: 3, type: "sparkle", title: "Points Earned", desc: "+1,200 loyalty points credited from last visit", time: "2 days ago"),
      NotificationItemModel(id: 4, type: "alert", title: "Membership Expiry Reminder", desc: "365 days remaining — renew anytime for benefits", time: "3 days ago"),
      NotificationItemModel(id: 5, type: "tag", title: "New Offer Available", desc: "Weekend brunch with chef's tasting menu — explore", time: "1 week ago"),
    ];
  }

  void clearAll() {
    notifications.clear();
    Get.snackbar('Notifications Cleared', 'All messages marked as read');
  }
}
