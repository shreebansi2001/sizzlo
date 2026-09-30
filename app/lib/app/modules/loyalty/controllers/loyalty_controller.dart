import 'package:get/get.dart';
import '../../../data/models/loyalty_model.dart';
import '../../../data/models/member_model.dart';
import '../../../data/services/api_service.dart';

class LoyaltyController extends GetxController {
  final ApiService _apiService = ApiService();

  final Rx<MemberModel> member = MemberModel.defaultProfile().obs;
  final RxList<LoyaltyTransactionModel> transactions = <LoyaltyTransactionModel>[].obs;
  final RxBool isLoading = true.obs;

  @override
  void onInit() {
    super.onInit();
    loadLoyaltyData();
  }

  void loadLoyaltyData() async {
    isLoading.value = true;
    try {
      member.value = await _apiService.getMemberProfile();
      transactions.value = await _apiService.getLoyaltyHistory();
    } finally {
      isLoading.value = false;
    }
  }
}
