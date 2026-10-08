class LoyaltyTransactionModel {
  final String id;
  final String title;
  final String description;
  final int points;
  final String type; // 'EARN', 'REDEEM', 'BONUS'
  final String outletName;
  final String time;

  LoyaltyTransactionModel({
    required this.id,
    required this.title,
    required this.description,
    required this.points,
    required this.type,
    required this.outletName,
    required this.time,
  });

  factory LoyaltyTransactionModel.fromJson(Map<String, dynamic> json) {
    return LoyaltyTransactionModel(
      id: json['id']?.toString() ?? '',
      title: json['title'] ?? '',
      description: json['description'] ?? '',
      points: json['points'] ?? 0,
      type: json['type'] ?? 'EARN',
      outletName: json['outletName'] ?? 'Yanki Outlets',
      time: json['transactionTime']?.toString() ??
          json['createdAt']?.toString() ??
          json['date']?.toString() ??
          'Recent',
    );
  }
}
