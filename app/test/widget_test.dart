import 'package:flutter_test/flutter_test.dart';
import 'package:sizzlo_app/main.dart';

void main() {
  testWidgets('App launches successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const SizzloApp());
    expect(find.byType(SizzloApp), findsOneWidget);
  });
}
