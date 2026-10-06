package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.ActivityLog;
import com.sizzlo.repository.ActivityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/redemption")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class RedemptionController {

    @Autowired
    private ActivityLogRepository activityLogRepository;

    public static class ValidateRequest {
        private String code;
        public String getCode() { return code; }
        public void setCode(String code) { this.code = code; }
    }

    public static class ValidateResponse {
        private boolean valid;
        private String errorMessage;
        private String subscriberName;
        private String planTier;
        private String benefitTitle;
        private String discountSummary;
        private List<String> rulesPassed;

        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }
        public String getErrorMessage() { return errorMessage; }
        public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
        public String getSubscriberName() { return subscriberName; }
        public void setSubscriberName(String subscriberName) { this.subscriberName = subscriberName; }
        public String getPlanTier() { return planTier; }
        public void setPlanTier(String planTier) { this.planTier = planTier; }
        public String getBenefitTitle() { return benefitTitle; }
        public void setBenefitTitle(String benefitTitle) { this.benefitTitle = benefitTitle; }
        public String getDiscountSummary() { return discountSummary; }
        public void setDiscountSummary(String discountSummary) { this.discountSummary = discountSummary; }
        public List<String> getRulesPassed() { return rulesPassed; }
        public void setRulesPassed(List<String> rulesPassed) { this.rulesPassed = rulesPassed; }
    }

    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<ValidateResponse>> validateCoupon(@RequestBody ValidateRequest request) {
        String code = request.getCode() != null ? request.getCode().trim().toUpperCase() : "";
        ValidateResponse resp = new ValidateResponse();

        if (code.contains("EXPIRED")) {
            resp.setValid(false);
            resp.setErrorMessage("Code expired");
            return ResponseEntity.ok(ApiResponse.success(resp));
        } else if (code.contains("USED")) {
            resp.setValid(false);
            resp.setErrorMessage("Already used · 7:42 PM at Navrangpura");
            return ResponseEntity.ok(ApiResponse.success(resp));
        } else if (code.contains("OUTLET")) {
            resp.setValid(false);
            resp.setErrorMessage("Wrong outlet · Valid only at Bodakdev");
            return ResponseEntity.ok(ApiResponse.success(resp));
        } else if (code.contains("BILL")) {
            resp.setValid(false);
            resp.setErrorMessage("Bill below minimum (Rs. 2,500 required)");
            return ResponseEntity.ok(ApiResponse.success(resp));
        } else if (code.contains("WINDOW")) {
            resp.setValid(false);
            resp.setErrorMessage("Outside valid time window");
            return ResponseEntity.ok(ApiResponse.success(resp));
        }

        resp.setValid(true);
        resp.setSubscriberName("Rahul Mehta");
        resp.setPlanTier("ELITE");
        resp.setBenefitTitle("50% Dining Discount");
        resp.setDiscountSummary("Up to Rs. 2,000 off on total bill");
        resp.setRulesPassed(Arrays.asList(
            "Subscription active",
            "Valid at this outlet",
            "Rs. 2,500 minimum met",
            "Valid during dinner"
        ));
        return ResponseEntity.ok(ApiResponse.success(resp));
    }

    @PostMapping("/confirm")
    public ResponseEntity<ApiResponse<String>> confirmRedemption(@RequestBody Map<String, String> payload) {
        String code = payload.getOrDefault("code", "C-01-RAHUL");
        String subscriber = payload.getOrDefault("subscriber", "Rahul Mehta");

        ActivityLog log = new ActivityLog(
            subscriber,
            "REDEMPTION",
            "Redeemed " + code + " (50% Dining Discount)",
            "Navrangpura",
            "Just now"
        );
        activityLogRepository.save(log);

        return ResponseEntity.ok(ApiResponse.success("Redemption confirmed for " + subscriber, code));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<ActivityLog>>> getRecentRedemptions() {
        return ResponseEntity.ok(ApiResponse.success(activityLogRepository.findTop20ByOrderByTimestampDesc()));
    }
}
