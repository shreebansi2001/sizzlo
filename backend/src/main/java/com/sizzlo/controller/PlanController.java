package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class PlanController {

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMembershipPlans() {
        List<Map<String, Object>> plans = new ArrayList<>();

        // Classic Plan
        Map<String, Object> classic = new HashMap<>();
        classic.put("id", "classic");
        classic.put("name", "Classic");
        classic.put("memberLabel", "CLASSIC SUBSCRIBER");
        classic.put("price", 5000);
        classic.put("couponLimit", 6);
        classic.put("giftVoucherLimit", 0);
        classic.put("offerLabel", "6 Offers");
        classic.put("description", "Yanki Sizzlerr only");
        classic.put("personality", "Warm Premium");
        classic.put("highlights", Arrays.asList("10% off across 6 visits", "Birthday week benefit", "Complimentary couple meal"));
        plans.add(classic);

        // Signature Plan
        Map<String, Object> signature = new HashMap<>();
        signature.put("id", "signature");
        signature.put("name", "Signature");
        signature.put("memberLabel", "SIGNATURE SUBSCRIBER");
        signature.put("price", 10000);
        signature.put("couponLimit", 12);
        signature.put("giftVoucherLimit", 0);
        signature.put("offerLabel", "12 Offers");
        signature.put("description", "Restaurant, Dough, banquet and catering");
        signature.put("personality", "Rich & Sophisticated");
        signature.put("highlights", Arrays.asList("12 dining visits annually", "Dough by Yanki rewards", "Banquet and catering benefits"));
        plans.add(signature);

        // Elite Plan
        Map<String, Object> elite = new HashMap<>();
        elite.put("id", "elite");
        elite.put("name", "Elite");
        elite.put("memberLabel", "ELITE SUBSCRIBER");
        elite.put("price", 15000);
        elite.put("couponLimit", 10);
        elite.put("giftVoucherLimit", 5);
        elite.put("offerLabel", "10 Offers + Gift Vouchers");
        elite.put("description", "All Yanki outlets");
        elite.put("personality", "Exclusive VIP");
        elite.put("highlights", Arrays.asList("18 dining visits annually", "Premium banquet benefits", "Exclusive gift vouchers"));
        plans.add(elite);

        return ResponseEntity.ok(ApiResponse.success(plans));
    }
}
