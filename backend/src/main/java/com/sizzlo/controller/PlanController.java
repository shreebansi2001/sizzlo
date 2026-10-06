package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class PlanController {

    private final List<Map<String, Object>> plans = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void init() {
        resetDefaults();
    }

    private synchronized void resetDefaults() {
        plans.clear();

        // Classic Plan
        Map<String, Object> classic = new LinkedHashMap<>();
        classic.put("id", "classic");
        classic.put("name", "Classic");
        classic.put("memberLabel", "CLASSIC SUBSCRIBER");
        classic.put("price", 5000);
        classic.put("couponLimit", 6);
        classic.put("giftVoucherLimit", 0);
        classic.put("offerLabel", "6 OFFERS");
        classic.put("description", "Yanki Sizzlerr only");
        classic.put("personality", "Warm Premium");
        classic.put("highlights", new ArrayList<>(Arrays.asList(
                "10% off across 6 visits",
                "Birthday week benefit",
                "Complimentary couple meal"
        )));
        classic.put("benefits", new ArrayList<>(Arrays.asList(
                "10% off bill amount, 6 times a year",
                "Complimentary birthday dessert and gift voucher",
                "Complimentary couple meal on special anniversary",
                "Priority table reservations on weekends",
                "Valid across all Yanki Sizzlerr locations"
        )));
        plans.add(classic);

        // Signature Plan
        Map<String, Object> signature = new LinkedHashMap<>();
        signature.put("id", "signature");
        signature.put("name", "Signature");
        signature.put("memberLabel", "SIGNATURE SUBSCRIBER");
        signature.put("price", 10000);
        signature.put("couponLimit", 12);
        signature.put("giftVoucherLimit", 0);
        signature.put("offerLabel", "12 OFFERS");
        signature.put("description", "Restaurant, Dough, banquet and catering");
        signature.put("personality", "Rich & Sophisticated");
        signature.put("highlights", new ArrayList<>(Arrays.asList(
                "12 dining visits annually",
                "Dough by Yanki rewards",
                "Banquet and catering benefits"
        )));
        signature.put("benefits", new ArrayList<>(Arrays.asList(
                "12 dining visits annually with 10% privilege discount",
                "Couple dinner at 50% off twice per year",
                "Dough by Yanki Buy 1 Get 1 complimentary",
                "Banquet & catering privileges at House of Yanki",
                "Free renewal subscription upon earning 25,000 points",
                "VIP private table reservation with dedicated manager"
        )));
        plans.add(signature);

        // Elite Plan
        Map<String, Object> elite = new LinkedHashMap<>();
        elite.put("id", "elite");
        elite.put("name", "Elite");
        elite.put("memberLabel", "ELITE SUBSCRIBER");
        elite.put("price", 15000);
        elite.put("couponLimit", 10);
        elite.put("giftVoucherLimit", 5);
        elite.put("offerLabel", "10 OFFERS + GIFT VOUCHERS");
        elite.put("description", "All Yanki outlets");
        elite.put("personality", "Exclusive VIP");
        elite.put("highlights", new ArrayList<>(Arrays.asList(
                "18 dining visits annually",
                "Premium banquet benefits",
                "Exclusive gift vouchers"
        )));
        elite.put("benefits", new ArrayList<>(Arrays.asList(
                "18 dining visits annually across all Yanki outlets",
                "Premium banquet reservations with dedicated catering manager",
                "Exclusive gift vouchers worth ₹5,000 for family & friends",
                "All access pass to Yanki Signature, Dough & Banquets",
                "Complimentary VIP birthday dinner for up to 4 guests",
                "Highest priority reservation window even on rush days"
        )));
        plans.add(elite);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getMembershipPlans() {
        return ResponseEntity.ok(ApiResponse.success(new ArrayList<>(plans)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getPlanById(@PathVariable String id) {
        for (Map<String, Object> plan : plans) {
            if (id.equalsIgnoreCase(String.valueOf(plan.get("id")))) {
                return ResponseEntity.ok(ApiResponse.success(plan));
            }
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Plan not found: " + id));
    }

    @PostMapping("/{id}/offers")
    @SuppressWarnings("unchecked")
    public synchronized ResponseEntity<ApiResponse<Map<String, Object>>> addOfferToPlan(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {
        String offerText = body.get("offer");
        if (offerText == null || offerText.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Offer text cannot be empty"));
        }

        for (Map<String, Object> plan : plans) {
            if (id.equalsIgnoreCase(String.valueOf(plan.get("id")))) {
                List<String> highlights = (List<String>) plan.get("highlights");
                if (highlights == null) {
                    highlights = new ArrayList<>();
                    plan.put("highlights", highlights);
                }
                highlights.add(offerText.trim());

                List<String> benefits = (List<String>) plan.get("benefits");
                if (benefits == null) {
                    benefits = new ArrayList<>();
                    plan.put("benefits", benefits);
                }
                benefits.add(offerText.trim());

                // Automatically update offerLabel
                int totalOffers = highlights.size();
                plan.put("offerLabel", totalOffers + " OFFERS" + ("elite".equalsIgnoreCase(id) ? " + GIFT VOUCHERS" : ""));

                return ResponseEntity.ok(ApiResponse.success("Offer successfully added to " + plan.get("name") + " plan", plan));
            }
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Plan not found: " + id));
    }

    @DeleteMapping("/{id}/offers")
    @SuppressWarnings("unchecked")
    public synchronized ResponseEntity<ApiResponse<Map<String, Object>>> removeOfferFromPlan(
            @PathVariable String id,
            @RequestParam(name = "offer") String offerText) {
        for (Map<String, Object> plan : plans) {
            if (id.equalsIgnoreCase(String.valueOf(plan.get("id")))) {
                List<String> highlights = (List<String>) plan.get("highlights");
                if (highlights != null) {
                    highlights.removeIf(h -> h.equalsIgnoreCase(offerText.trim()));
                }
                List<String> benefits = (List<String>) plan.get("benefits");
                if (benefits != null) {
                    benefits.removeIf(b -> b.equalsIgnoreCase(offerText.trim()));
                }
                int totalOffers = highlights != null ? highlights.size() : 0;
                plan.put("offerLabel", totalOffers + " OFFERS" + ("elite".equalsIgnoreCase(id) ? " + GIFT VOUCHERS" : ""));

                return ResponseEntity.ok(ApiResponse.success("Offer removed from " + plan.get("name"), plan));
            }
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Plan not found: " + id));
    }

    @PutMapping("/{id}")
    @SuppressWarnings("unchecked")
    public synchronized ResponseEntity<ApiResponse<Map<String, Object>>> updatePlan(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates) {
        for (Map<String, Object> plan : plans) {
            if (id.equalsIgnoreCase(String.valueOf(plan.get("id")))) {
                if (updates.containsKey("price")) plan.put("price", updates.get("price"));
                if (updates.containsKey("description")) plan.put("description", updates.get("description"));
                if (updates.containsKey("offerLabel")) plan.put("offerLabel", updates.get("offerLabel"));
                if (updates.containsKey("highlights") && updates.get("highlights") instanceof List) {
                    plan.put("highlights", new ArrayList<>((List<String>) updates.get("highlights")));
                }
                return ResponseEntity.ok(ApiResponse.success("Plan updated successfully", plan));
            }
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Plan not found: " + id));
    }

    @PostMapping("/reset")
    public synchronized ResponseEntity<ApiResponse<List<Map<String, Object>>>> resetPlans() {
        resetDefaults();
        return ResponseEntity.ok(ApiResponse.success("Plans reset to default", new ArrayList<>(plans)));
    }
}
