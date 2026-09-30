class NotificationItemModel {
  final int id;
  final String type; // 'gift', 'calendar', 'sparkle', 'alert', 'tag'
  final String title;
  final String desc;
  final String time;

  NotificationItemModel({
    required this.id,
    required this.type,
    required this.title,
    required this.desc,
    required this.time,
  });

  factory NotificationItemModel.fromJson(Map<String, dynamic> json) {
    return NotificationItemModel(
      id: json['id'] ?? 1,
      type: json['type'] ?? 'tag',
      title: json['title'] ?? '',
      desc: json['desc'] ?? '',
      time: json['time'] ?? 'Just now',
    );
  }
}
