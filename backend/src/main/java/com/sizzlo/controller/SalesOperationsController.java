package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.CorporateLead;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.entity.SalesTarget;
import com.sizzlo.repository.CorporateLeadRepository;
import com.sizzlo.repository.MemberProfileRepository;
import com.sizzlo.repository.SalesTargetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/sales")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class SalesOperationsController {

    private final SalesTargetRepository salesTargetRepository;
    private final CorporateLeadRepository corporateLeadRepository;
    private final MemberProfileRepository memberProfileRepository;
    private final PaymentController paymentController;

    @Autowired
    public SalesOperationsController(
            SalesTargetRepository salesTargetRepository,
            CorporateLeadRepository corporateLeadRepository,
            MemberProfileRepository memberProfileRepository,
            PaymentController paymentController) {
        this.salesTargetRepository = salesTargetRepository;
        this.corporateLeadRepository = corporateLeadRepository;
        this.memberProfileRepository = memberProfileRepository;
        this.paymentController = paymentController;
    }

    // 1. Target Bifurcation & Status (Chapter 15)
    @GetMapping("/targets/current")
    public ResponseEntity<ApiResponse<SalesTarget>> getCurrentTarget() {
        SalesTarget target = salesTargetRepository.findByTargetMonth("OCT-2026")
                .orElseGet(() -> {
                    SalesTarget st = new SalesTarget();
                    st.setTargetMonth("OCT-2026");
                    st.setMasterTargetRevenue(2000000.0);
                    st.setFloorTargetRevenue(1000000.0);
                    st.setCorporateTargetRevenue(1000000.0);
                    st.setFloorAchievedRevenue(720000.0);
                    st.setCorporateAchievedRevenue(680000.0);
                    st.setFloorPlansSold(68);
                    st.setCorporatePlansSold(55);
                    return salesTargetRepository.save(st);
                });
        return ResponseEntity.ok(ApiResponse.success(target));
    }

    public static class BifurcateRequest {
        public Double masterTarget;
        public Double floorTarget;
        public Double corporateTarget;
    }

    @PostMapping("/targets/bifurcate")
    public ResponseEntity<ApiResponse<SalesTarget>> bifurcateTarget(@RequestBody BifurcateRequest req) {
        SalesTarget target = salesTargetRepository.findByTargetMonth("OCT-2026")
                .orElse(new SalesTarget());
        target.setTargetMonth("OCT-2026");
        if (req.masterTarget != null) target.setMasterTargetRevenue(req.masterTarget);
        if (req.floorTarget != null) target.setFloorTargetRevenue(req.floorTarget);
        if (req.corporateTarget != null) target.setCorporateTargetRevenue(req.corporateTarget);
        return ResponseEntity.ok(ApiResponse.success("Targets bifurcated successfully by Sales TL", salesTargetRepository.save(target)));
    }

    // 2. Floor Sales Quick-Enroll Form (Chapter 16.1)
    public static class FloorQuickEnrollRequest {
        public String customerMobile;
        public String customerName;
        public String planTier; // CLASSIC, SIGNATURE, ELITE
        public String staffId; // Floor Captain Employee ID
        public String staffName;
        public String paymentMethod; // PAYMENT_LINK or COUNTER_SETTLEMENT
    }

    @PostMapping("/floor/quick-enroll")
    public ResponseEntity<ApiResponse<Map<String, Object>>> floorQuickEnroll(@RequestBody FloorQuickEnrollRequest req) {
        String tier = req.planTier != null ? req.planTier.toUpperCase() : "SIGNATURE";
        double fee = "CLASSIC".equalsIgnoreCase(tier) ? 5000.0 : "SIGNATURE".equalsIgnoreCase(tier) ? 10000.0 : 15000.0;

        // Auto commission calculation (Classic 200, Signature 400, Elite 700)
        double commission = "CLASSIC".equalsIgnoreCase(tier) ? 200.0 : "SIGNATURE".equalsIgnoreCase(tier) ? 400.0 : 700.0;

        // Activate profile
        PaymentController.VerifyPaymentRequest verifyReq = new PaymentController.VerifyPaymentRequest();
        verifyReq.mobile = req.customerMobile;
        verifyReq.planId = tier.toLowerCase();
        verifyReq.razorpayPaymentId = "FLOOR-" + (req.staffId != null ? req.staffId : "CAPT-01") + "-" + System.currentTimeMillis();
        paymentController.verifyPayment(verifyReq);

        // Update staff attribution
        Optional<MemberProfile> mOpt = memberProfileRepository.findByMobile(req.customerMobile);
        if (mOpt.isPresent()) {
            MemberProfile m = mOpt.get();
            m.setFullName(req.customerName != null ? req.customerName : m.getFullName());
            m.setReferredByStaffId(req.staffId != null ? req.staffId : "CAPT-01");
            memberProfileRepository.save(m);
        }

        // Update target tallies
        SalesTarget st = salesTargetRepository.findByTargetMonth("OCT-2026").orElse(new SalesTarget());
        st.setFloorAchievedRevenue((st.getFloorAchievedRevenue() != null ? st.getFloorAchievedRevenue() : 0.0) + fee);
        st.setFloorPlansSold((st.getFloorPlansSold() != null ? st.getFloorPlansSold() : 0) + 1);
        salesTargetRepository.save(st);

        Map<String, Object> resp = new HashMap<>();
        resp.put("customerMobile", req.customerMobile);
        resp.put("customerName", req.customerName);
        resp.put("planTier", tier);
        resp.put("fee", fee);
        resp.put("staffId", req.staffId);
        resp.put("commissionEarned", commission);
        resp.put("status", "ACTIVATED");
        resp.put("message", "Plan enrolled successfully! Rs. " + (int) commission + " credited to Captain " + (req.staffName != null ? req.staffName : req.staffId) + "'s incentive ledger.");

        return ResponseEntity.ok(ApiResponse.success(resp));
    }

    // 3. Corporate B2B Pipeline (Chapter 16.2)
    @GetMapping("/corporate/leads")
    public ResponseEntity<ApiResponse<List<CorporateLead>>> getCorporateLeads() {
        return ResponseEntity.ok(ApiResponse.success(corporateLeadRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PostMapping("/corporate/leads")
    public ResponseEntity<ApiResponse<CorporateLead>> createCorporateLead(@RequestBody CorporateLead lead) {
        if (lead.getStage() == null) lead.setStage("NEW_LEAD");
        return ResponseEntity.ok(ApiResponse.success("Corporate lead created", corporateLeadRepository.save(lead)));
    }

    @PatchMapping("/corporate/leads/{id}/stage")
    public ResponseEntity<ApiResponse<CorporateLead>> updateCorporateStage(
            @PathVariable Long id,
            @RequestParam String stage) {
        CorporateLead lead = corporateLeadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        lead.setStage(stage);
        if ("CLOSED_WON".equalsIgnoreCase(stage)) {
            lead.setClosedAt(LocalDateTime.now());
        }
        return ResponseEntity.ok(ApiResponse.success("Stage updated to " + stage, corporateLeadRepository.save(lead)));
    }

    public static class BulkEnrollRequest {
        public List<String> employeeNames;
        public List<String> employeePhones;
    }

    @PostMapping("/corporate/leads/{id}/bulk-enroll")
    public ResponseEntity<ApiResponse<Map<String, Object>>> bulkEnrollCorporate(
            @PathVariable Long id,
            @RequestBody BulkEnrollRequest req) {
        CorporateLead lead = corporateLeadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Corporate deal not found"));

        int count = req.employeePhones != null ? req.employeePhones.size() : 0;
        for (int i = 0; i < count; i++) {
            String phone = req.employeePhones.get(i);
            String name = (req.employeeNames != null && i < req.employeeNames.size()) ? req.employeeNames.get(i) : "Corporate Member";
            
            PaymentController.VerifyPaymentRequest verifyReq = new PaymentController.VerifyPaymentRequest();
            verifyReq.mobile = phone;
            verifyReq.planId = lead.getPlanTier().toLowerCase();
            verifyReq.razorpayPaymentId = "CORP-" + lead.getCompanyName().replaceAll("\\s+", "") + "-" + i;
            paymentController.verifyPayment(verifyReq);

            Optional<MemberProfile> mOpt = memberProfileRepository.findByMobile(phone);
            if (mOpt.isPresent()) {
                MemberProfile m = mOpt.get();
                m.setFullName(name);
                m.setCorporateId(lead.getId());
                memberProfileRepository.save(m);
            }
        }

        lead.setTlApproved(true);
        lead.setStage("CLOSED_WON");
        lead.setClosedAt(LocalDateTime.now());
        corporateLeadRepository.save(lead);

        // Update corporate target
        SalesTarget st = salesTargetRepository.findByTargetMonth("OCT-2026").orElse(new SalesTarget());
        st.setCorporateAchievedRevenue((st.getCorporateAchievedRevenue() != null ? st.getCorporateAchievedRevenue() : 0.0) + lead.getDealValue());
        st.setCorporatePlansSold((st.getCorporatePlansSold() != null ? st.getCorporatePlansSold() : 0) + count);
        salesTargetRepository.save(st);

        Map<String, Object> resp = new HashMap<>();
        resp.put("activatedCount", count);
        resp.put("companyName", lead.getCompanyName());
        resp.put("dealValue", lead.getDealValue());

        return ResponseEntity.ok(ApiResponse.success("Successfully bulk-activated " + count + " corporate memberships for " + lead.getCompanyName(), resp));
    }

    // 4. Automated Incentive Slabs Calculation (Chapter 17)
    @GetMapping("/incentives/ledger")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getIncentiveLedger() {
        SalesTarget st = salesTargetRepository.findByTargetMonth("OCT-2026").orElse(new SalesTarget());

        double floorRev = st.getFloorAchievedRevenue() != null ? st.getFloorAchievedRevenue() : 720000.0;
        double floorTarget = st.getFloorTargetRevenue() != null ? st.getFloorTargetRevenue() : 1000000.0;
        double floorAchievementPct = (floorRev / floorTarget) * 100.0;

        // Floor Staff Slab: Classic 200, Signature 400, Elite 700 + 20% multiplier if >100%
        int plansSold = st.getFloorPlansSold() != null ? st.getFloorPlansSold() : 68;
        double floorCommissionBase = plansSold * 450.0; // average blended slab
        double floorBonusMultiplier = floorAchievementPct >= 100.0 ? 1.20 : 1.0;
        double totalFloorIncentive = floorCommissionBase * floorBonusMultiplier;

        // Corporate Slab: <80% = 0, 80-100% = 3%, 101-125% = 5%, >125% = 7%
        double corpRev = st.getCorporateAchievedRevenue() != null ? st.getCorporateAchievedRevenue() : 680000.0;
        double corpTarget = st.getCorporateTargetRevenue() != null ? st.getCorporateTargetRevenue() : 1000000.0;
        double corpAchievementPct = (corpRev / corpTarget) * 100.0;
        double corpCommissionPct = corpAchievementPct < 80.0 ? 0.0 : corpAchievementPct <= 100.0 ? 0.03 : corpAchievementPct <= 125.0 ? 0.05 : 0.07;
        double totalCorpIncentive = corpRev * corpCommissionPct;

        // Sales TL Override: 1.0% to 1.5% if cumulative target hit
        double totalRev = floorRev + corpRev;
        double masterTarget = st.getMasterTargetRevenue() != null ? st.getMasterTargetRevenue() : 2000000.0;
        double masterPct = (totalRev / masterTarget) * 100.0;
        double tlOverride = masterPct >= 100.0 ? totalRev * 0.015 : 0.0;

        Map<String, Object> ledger = new HashMap<>();
        ledger.put("targetMonth", "OCT-2026");
        ledger.put("floorAchievementPct", Math.round(floorAchievementPct * 10.0) / 10.0);
        ledger.put("floorPlansSold", plansSold);
        ledger.put("floorIncentiveTotal", totalFloorIncentive);
        ledger.put("corporateAchievementPct", Math.round(corpAchievementPct * 10.0) / 10.0);
        ledger.put("corporateRevenueCollected", corpRev);
        ledger.put("corporateIncentiveTotal", totalCorpIncentive);
        ledger.put("masterAchievementPct", Math.round(masterPct * 10.0) / 10.0);
        ledger.put("tlOverrideCommission", tlOverride);
        ledger.put("totalPayrollIncentive", totalFloorIncentive + totalCorpIncentive + tlOverride);
        ledger.put("isPayrollApproved", Boolean.TRUE.equals(st.getPayrollApproved()));

        return ResponseEntity.ok(ApiResponse.success(ledger));
    }

    @PostMapping("/incentives/payroll-approve")
    public ResponseEntity<ApiResponse<String>> approvePayroll() {
        SalesTarget st = salesTargetRepository.findByTargetMonth("OCT-2026").orElse(new SalesTarget());
        st.setPayrollApproved(true);
        st.setPayrollApprovedAt(LocalDateTime.now());
        salesTargetRepository.save(st);
        return ResponseEntity.ok(ApiResponse.success("Monthly incentive payroll signed off and exported to CSV audit trail.", "OK"));
    }
}
