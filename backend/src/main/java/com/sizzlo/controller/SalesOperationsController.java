package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.*;
import com.sizzlo.repository.*;
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
    private final SalesStaffQuotaRepository salesStaffQuotaRepository;
    private final SalesTrainingModuleRepository salesTrainingModuleRepository;
    private final SalesRewardContestRepository salesRewardContestRepository;
    private final SalesCommissionRecordRepository salesCommissionRecordRepository;
    private final CorporateLeadRepository corporateLeadRepository;
    private final BanquetInquiryRepository banquetInquiryRepository;
    private final MemberProfileRepository memberProfileRepository;
    private final PaymentController paymentController;

    @Autowired
    public SalesOperationsController(
            SalesTargetRepository salesTargetRepository,
            SalesStaffQuotaRepository salesStaffQuotaRepository,
            SalesTrainingModuleRepository salesTrainingModuleRepository,
            SalesRewardContestRepository salesRewardContestRepository,
            SalesCommissionRecordRepository salesCommissionRecordRepository,
            CorporateLeadRepository corporateLeadRepository,
            BanquetInquiryRepository banquetInquiryRepository,
            MemberProfileRepository memberProfileRepository,
            PaymentController paymentController) {
        this.salesTargetRepository = salesTargetRepository;
        this.salesStaffQuotaRepository = salesStaffQuotaRepository;
        this.salesTrainingModuleRepository = salesTrainingModuleRepository;
        this.salesRewardContestRepository = salesRewardContestRepository;
        this.salesCommissionRecordRepository = salesCommissionRecordRepository;
        this.corporateLeadRepository = corporateLeadRepository;
        this.banquetInquiryRepository = banquetInquiryRepository;
        this.memberProfileRepository = memberProfileRepository;
        this.paymentController = paymentController;
    }

    // ==========================================
    // 1. MASTER TARGET & TL BIFURCATION ENGINE
    // ==========================================

    @GetMapping("/targets/current")
    public ResponseEntity<ApiResponse<SalesTarget>> getCurrentTarget() {
        SalesTarget target = salesTargetRepository.findByTargetMonth("OCT-2026")
                .orElseGet(() -> {
                    SalesTarget st = new SalesTarget();
                    st.setTargetMonth("OCT-2026");
                    st.setMasterTargetRevenue(2000000.0);
                    st.setFloorTargetRevenue(1000000.0);
                    st.setCorporateTargetRevenue(1000000.0);
                    st.setFloorAchievedRevenue(0.0);
                    st.setCorporateAchievedRevenue(0.0);
                    st.setFloorPlansSold(0);
                    st.setCorporatePlansSold(0);
                    st.setPayrollApproved(false);
                    return salesTargetRepository.save(st);
                });
        return ResponseEntity.ok(ApiResponse.success(target));
    }

    public static class MasterTargetRequest {
        public String targetMonth;
        public Double masterTargetRevenue;
        public Integer masterTargetPlans;
    }

    @PostMapping("/targets/master-set")
    public ResponseEntity<ApiResponse<SalesTarget>> setMasterTarget(@RequestBody MasterTargetRequest req) {
        String month = req.targetMonth != null && !req.targetMonth.isEmpty() ? req.targetMonth : "OCT-2026";
        SalesTarget target = salesTargetRepository.findByTargetMonth(month).orElse(new SalesTarget());
        target.setTargetMonth(month);
        if (req.masterTargetRevenue != null) {
            target.setMasterTargetRevenue(req.masterTargetRevenue);
            // Default 50-50 split if not bifurcated yet
            if (target.getFloorTargetRevenue() == null || target.getFloorTargetRevenue() == 0.0) {
                target.setFloorTargetRevenue(req.masterTargetRevenue * 0.5);
                target.setCorporateTargetRevenue(req.masterTargetRevenue * 0.5);
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Master monthly target set by Owner", salesTargetRepository.save(target)));
    }

    public static class BifurcateRequest {
        public String targetMonth;
        public Double masterTarget;
        public Double floorTarget;
        public Double corporateTarget;
    }

    @PostMapping("/targets/bifurcate")
    public ResponseEntity<ApiResponse<SalesTarget>> bifurcateTarget(@RequestBody BifurcateRequest req) {
        String month = req.targetMonth != null && !req.targetMonth.isEmpty() ? req.targetMonth : "OCT-2026";
        SalesTarget target = salesTargetRepository.findByTargetMonth(month).orElse(new SalesTarget());
        target.setTargetMonth(month);
        if (req.masterTarget != null) target.setMasterTargetRevenue(req.masterTarget);
        if (req.floorTarget != null) target.setFloorTargetRevenue(req.floorTarget);
        if (req.corporateTarget != null) target.setCorporateTargetRevenue(req.corporateTarget);
        return ResponseEntity.ok(ApiResponse.success("Targets bifurcated into Floor & Corporate by Sales TL", salesTargetRepository.save(target)));
    }

    // ==========================================
    // 2. INDIVIDUAL STAFF QUOTAS (TL -> STAFF)
    // ==========================================

    @GetMapping("/quotas")
    public ResponseEntity<ApiResponse<List<SalesStaffQuota>>> getStaffQuotas(@RequestParam(defaultValue = "OCT-2026") String month) {
        List<SalesStaffQuota> list = salesStaffQuotaRepository.findByTargetMonth(month);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @PostMapping("/quotas")
    public ResponseEntity<ApiResponse<SalesStaffQuota>> createOrUpdateQuota(@RequestBody SalesStaffQuota quota) {
        if (quota.getTargetMonth() == null || quota.getTargetMonth().isEmpty()) {
            quota.setTargetMonth("OCT-2026");
        }
        if (quota.getStaffId() != null) {
            Optional<SalesStaffQuota> existing = salesStaffQuotaRepository.findByStaffIdAndTargetMonth(quota.getStaffId(), quota.getTargetMonth());
            if (existing.isPresent()) {
                SalesStaffQuota curr = existing.get();
                if (quota.getStaffName() != null) curr.setStaffName(quota.getStaffName());
                if (quota.getRoleType() != null) curr.setRoleType(quota.getRoleType());
                if (quota.getBranchName() != null) curr.setBranchName(quota.getBranchName());
                if (quota.getTargetRevenue() != null) curr.setTargetRevenue(quota.getTargetRevenue());
                if (quota.getTargetCount() != null) curr.setTargetCount(quota.getTargetCount());
                return ResponseEntity.ok(ApiResponse.success("Staff quota updated", salesStaffQuotaRepository.save(curr)));
            }
        }
        return ResponseEntity.ok(ApiResponse.success("Staff quota allocated by Sales TL", salesStaffQuotaRepository.save(quota)));
    }

    @DeleteMapping("/quotas/{id}")
    public ResponseEntity<ApiResponse<String>> deleteQuota(@PathVariable Long id) {
        salesStaffQuotaRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Staff quota removed", "OK"));
    }

    // ==========================================
    // 3. FLOOR SALES CHANNEL (CAPTAINS & MANAGERS)
    // ==========================================

    public static class FloorQuickEnrollRequest {
        public String customerMobile;
        public String customerName;
        public String planTier; // CLASSIC, SIGNATURE, ELITE
        public String staffId; // Floor Captain Employee ID
        public String staffName;
        public String branchName;
        public String paymentMethod; // PAYMENT_LINK, CASH, CARD, QR
    }

    @PostMapping("/floor/quick-enroll")
    public ResponseEntity<ApiResponse<Map<String, Object>>> floorQuickEnroll(@RequestBody FloorQuickEnrollRequest req) {
        String tier = req.planTier != null ? req.planTier.toUpperCase() : "SIGNATURE";
        double fee = "CLASSIC".equalsIgnoreCase(tier) ? 5000.0 : "SIGNATURE".equalsIgnoreCase(tier) ? 10000.0 : 15000.0;

        // Auto commission calculation (Classic 200, Signature 400, Elite 700)
        double commission = "CLASSIC".equalsIgnoreCase(tier) ? 200.0 : "SIGNATURE".equalsIgnoreCase(tier) ? 400.0 : 700.0;

        String staffId = req.staffId != null && !req.staffId.isEmpty() ? req.staffId : "CAPT-01";
        String staffName = req.staffName != null && !req.staffName.isEmpty() ? req.staffName : "Captain Desk";
        String branch = req.branchName != null && !req.branchName.isEmpty() ? req.branchName : "Yanki Sizzlerr Bodakdev";

        // Activate profile via PaymentController verification
        String txId = "FLOOR-" + staffId + "-" + System.currentTimeMillis();
        PaymentController.VerifyPaymentRequest verifyReq = new PaymentController.VerifyPaymentRequest();
        verifyReq.mobile = req.customerMobile;
        verifyReq.planId = tier.toLowerCase();
        verifyReq.razorpayPaymentId = txId;
        paymentController.verifyPayment(verifyReq);

        // Update staff attribution on MemberProfile
        Optional<MemberProfile> mOpt = memberProfileRepository.findByMobile(req.customerMobile);
        if (mOpt.isPresent()) {
            MemberProfile m = mOpt.get();
            if (req.customerName != null && !req.customerName.isEmpty()) {
                m.setFullName(req.customerName);
            }
            m.setReferredByStaffId(staffId);
            memberProfileRepository.save(m);
        }

        // Record granular SalesCommissionRecord
        SalesCommissionRecord comm = new SalesCommissionRecord();
        comm.setTransactionId(txId);
        comm.setCustomerMobile(req.customerMobile);
        comm.setCustomerName(req.customerName != null ? req.customerName : "Customer (" + req.customerMobile + ")");
        comm.setPlanTier(tier);
        comm.setPlanFee(fee);
        comm.setChannel("FLOOR");
        comm.setStaffId(staffId);
        comm.setStaffName(staffName);
        comm.setBranchName(branch);
        comm.setCommissionAmount(commission);
        comm.setBonusMultiplier(1.0);
        comm.setPayoutStatus("APPROVED");
        comm.setTargetMonth("OCT-2026");
        salesCommissionRecordRepository.save(comm);

        // Update individual Staff Quota
        Optional<SalesStaffQuota> quotaOpt = salesStaffQuotaRepository.findByStaffIdAndTargetMonth(staffId, "OCT-2026");
        SalesStaffQuota quota = quotaOpt.orElseGet(() -> {
            SalesStaffQuota q = new SalesStaffQuota();
            q.setStaffId(staffId);
            q.setStaffName(staffName);
            q.setRoleType("FLOOR");
            q.setBranchName(branch);
            q.setTargetMonth("OCT-2026");
            q.setTargetRevenue(100000.0);
            q.setTargetCount(10);
            return q;
        });
        quota.setAchievedRevenue((quota.getAchievedRevenue() != null ? quota.getAchievedRevenue() : 0.0) + fee);
        quota.setAchievedCount((quota.getAchievedCount() != null ? quota.getAchievedCount() : 0) + 1);
        quota.setCalculatedCommission((quota.getCalculatedCommission() != null ? quota.getCalculatedCommission() : 0.0) + commission);
        if (quota.getTargetCount() > 0 && quota.getAchievedCount() >= quota.getTargetCount()) {
            quota.setBonusEarned((quota.getCalculatedCommission() * 0.20));
        }
        salesStaffQuotaRepository.save(quota);

        // Update Global Target tallies
        SalesTarget st = salesTargetRepository.findByTargetMonth("OCT-2026").orElse(new SalesTarget());
        st.setFloorAchievedRevenue((st.getFloorAchievedRevenue() != null ? st.getFloorAchievedRevenue() : 0.0) + fee);
        st.setFloorPlansSold((st.getFloorPlansSold() != null ? st.getFloorPlansSold() : 0) + 1);
        salesTargetRepository.save(st);

        Map<String, Object> resp = new HashMap<>();
        resp.put("customerMobile", req.customerMobile);
        resp.put("customerName", req.customerName);
        resp.put("planTier", tier);
        resp.put("fee", fee);
        resp.put("staffId", staffId);
        resp.put("staffName", staffName);
        resp.put("commissionEarned", commission);
        resp.put("status", "ACTIVATED");
        resp.put("message", "VIP Plan enrolled! Rs. " + (int) commission + " credited to Captain " + staffName + "'s incentive ledger.");

        return ResponseEntity.ok(ApiResponse.success(resp));
    }

    // ==========================================
    // 4. CORPORATE B2B PIPELINE (CORPORATE BDES)
    // ==========================================

    @GetMapping("/corporate/leads")
    public ResponseEntity<ApiResponse<List<CorporateLead>>> getCorporateLeads() {
        return ResponseEntity.ok(ApiResponse.success(corporateLeadRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PostMapping("/corporate/leads")
    public ResponseEntity<ApiResponse<CorporateLead>> createOrUpdateCorporateLead(@RequestBody CorporateLead lead) {
        if (lead.getStage() == null) lead.setStage("NEW_LEAD");
        if (lead.getDealValue() == null && lead.getEmployeeCount() != null && lead.getPlanTier() != null) {
            double fee = "CLASSIC".equalsIgnoreCase(lead.getPlanTier()) ? 5000.0 : "SIGNATURE".equalsIgnoreCase(lead.getPlanTier()) ? 10000.0 : 15000.0;
            lead.setDealValue(fee * lead.getEmployeeCount());
        }
        return ResponseEntity.ok(ApiResponse.success("Corporate lead saved", corporateLeadRepository.save(lead)));
    }

    @DeleteMapping("/corporate/leads/{id}")
    public ResponseEntity<ApiResponse<String>> deleteCorporateLead(@PathVariable Long id) {
        corporateLeadRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Corporate lead deleted", "OK"));
    }

    @PutMapping("/corporate/leads/{id}")
    public ResponseEntity<ApiResponse<CorporateLead>> updateCorporateLead(@PathVariable Long id, @RequestBody CorporateLead update) {
        CorporateLead lead = corporateLeadRepository.findById(id).orElseThrow(() -> new RuntimeException("Lead not found"));
        if (update.getCompanyName() != null) lead.setCompanyName(update.getCompanyName());
        if (update.getGstNumber() != null) lead.setGstNumber(update.getGstNumber());
        if (update.getContactPerson() != null) lead.setContactPerson(update.getContactPerson());
        if (update.getContactMobile() != null) lead.setContactMobile(update.getContactMobile());
        if (update.getEmail() != null) lead.setEmail(update.getEmail());
        if (update.getEmployeeCount() != null) lead.setEmployeeCount(update.getEmployeeCount());
        if (update.getPlanTier() != null) lead.setPlanTier(update.getPlanTier());
        if (update.getDealValue() != null) lead.setDealValue(update.getDealValue());
        if (update.getStage() != null) lead.setStage(update.getStage());
        if (update.getAssignedBdeId() != null) lead.setAssignedBdeId(update.getAssignedBdeId());
        if (update.getAssignedBdeName() != null) lead.setAssignedBdeName(update.getAssignedBdeName());
        if (update.getNotes() != null) lead.setNotes(update.getNotes());
        return ResponseEntity.ok(ApiResponse.success("Corporate lead updated", corporateLeadRepository.save(lead)));
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

    @PostMapping("/corporate/leads/{id}/approve")
    public ResponseEntity<ApiResponse<CorporateLead>> approveCorporateDealByTl(@PathVariable Long id) {
        CorporateLead lead = corporateLeadRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found"));
        lead.setTlApproved(true);
        lead.setStage("CLOSED_WON");
        lead.setClosedAt(LocalDateTime.now());
        return ResponseEntity.ok(ApiResponse.success("Corporate deal verified and approved by Sales TL", corporateLeadRepository.save(lead)));
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
        String tier = lead.getPlanTier() != null ? lead.getPlanTier().toUpperCase() : "SIGNATURE";
        double feePerPlan = "CLASSIC".equalsIgnoreCase(tier) ? 5000.0 : "SIGNATURE".equalsIgnoreCase(tier) ? 10000.0 : 15000.0;
        double totalDealValue = lead.getDealValue() != null && lead.getDealValue() > 0 ? lead.getDealValue() : (feePerPlan * count);

        for (int i = 0; i < count; i++) {
            String phone = req.employeePhones.get(i);
            String name = (req.employeeNames != null && i < req.employeeNames.size()) ? req.employeeNames.get(i) : "Corporate Member " + (i + 1);

            PaymentController.VerifyPaymentRequest verifyReq = new PaymentController.VerifyPaymentRequest();
            verifyReq.mobile = phone;
            verifyReq.planId = tier.toLowerCase();
            verifyReq.razorpayPaymentId = "CORP-" + lead.getCompanyName().replaceAll("\\s+", "") + "-" + (i + 1);
            paymentController.verifyPayment(verifyReq);

            Optional<MemberProfile> mOpt = memberProfileRepository.findByMobile(phone);
            if (mOpt.isPresent()) {
                MemberProfile m = mOpt.get();
                m.setFullName(name);
                m.setCorporateId(lead.getId());
                m.setReferredByStaffId(lead.getAssignedBdeId() != null ? lead.getAssignedBdeId() : "CORP-BDE");
                memberProfileRepository.save(m);
            }
        }

        lead.setTlApproved(true);
        lead.setStage("CLOSED_WON");
        lead.setClosedAt(LocalDateTime.now());
        corporateLeadRepository.save(lead);

        // Update corporate target tallies
        SalesTarget st = salesTargetRepository.findByTargetMonth("OCT-2026").orElse(new SalesTarget());
        st.setCorporateAchievedRevenue((st.getCorporateAchievedRevenue() != null ? st.getCorporateAchievedRevenue() : 0.0) + totalDealValue);
        st.setCorporatePlansSold((st.getCorporatePlansSold() != null ? st.getCorporatePlansSold() : 0) + count);
        salesTargetRepository.save(st);

        // Update BDE quota & commission record
        String bdeId = lead.getAssignedBdeId() != null ? lead.getAssignedBdeId() : "BDE-01";
        String bdeName = lead.getAssignedBdeName() != null ? lead.getAssignedBdeName() : "Corporate BDE";
        
        Optional<SalesStaffQuota> quotaOpt = salesStaffQuotaRepository.findByStaffIdAndTargetMonth(bdeId, "OCT-2026");
        SalesStaffQuota quota = quotaOpt.orElseGet(() -> {
            SalesStaffQuota q = new SalesStaffQuota();
            q.setStaffId(bdeId);
            q.setStaffName(bdeName);
            q.setRoleType("CORPORATE");
            q.setBranchName("Corporate Head Office");
            q.setTargetMonth("OCT-2026");
            q.setTargetRevenue(500000.0);
            q.setTargetCount(50);
            return q;
        });
        quota.setAchievedRevenue((quota.getAchievedRevenue() != null ? quota.getAchievedRevenue() : 0.0) + totalDealValue);
        quota.setAchievedCount((quota.getAchievedCount() != null ? quota.getAchievedCount() : 0) + count);
        
        // Corporate slab: <80% = 0, 80-100% = 3%, 101-125% = 5%, >125% = 7%
        double target = quota.getTargetRevenue() > 0 ? quota.getTargetRevenue() : 500000.0;
        double achPct = (quota.getAchievedRevenue() / target) * 100.0;
        double slabRate = achPct < 80.0 ? 0.0 : achPct <= 100.0 ? 0.03 : achPct <= 125.0 ? 0.05 : 0.07;
        quota.setCalculatedCommission(quota.getAchievedRevenue() * slabRate);
        salesStaffQuotaRepository.save(quota);

        // Record in SalesCommissionRecord
        SalesCommissionRecord comm = new SalesCommissionRecord();
        comm.setTransactionId("CORP-DEAL-" + lead.getId());
        comm.setCustomerMobile(lead.getContactMobile());
        comm.setCustomerName(lead.getCompanyName() + " (" + count + " VIP Members)");
        comm.setPlanTier(tier);
        comm.setPlanFee(totalDealValue);
        comm.setChannel("CORPORATE");
        comm.setStaffId(bdeId);
        comm.setStaffName(bdeName);
        comm.setBranchName("Corporate HQ");
        comm.setCommissionAmount(totalDealValue * slabRate);
        comm.setPayoutStatus("APPROVED");
        comm.setTargetMonth("OCT-2026");
        salesCommissionRecordRepository.save(comm);

        Map<String, Object> resp = new HashMap<>();
        resp.put("activatedCount", count);
        resp.put("companyName", lead.getCompanyName());
        resp.put("dealValue", totalDealValue);
        resp.put("commissionCredited", totalDealValue * slabRate);

        return ResponseEntity.ok(ApiResponse.success("Successfully bulk-activated " + count + " corporate memberships for " + lead.getCompanyName(), resp));
    }

    // ==========================================
    // 5. TRAINING & ENABLEMENT CENTER
    // ==========================================

    @GetMapping("/training")
    public ResponseEntity<ApiResponse<List<SalesTrainingModule>>> getTrainingModules() {
        return ResponseEntity.ok(ApiResponse.success(salesTrainingModuleRepository.findByActiveTrueOrderByCreatedAtDesc()));
    }

    @PostMapping("/training")
    public ResponseEntity<ApiResponse<SalesTrainingModule>> createOrUpdateTraining(@RequestBody SalesTrainingModule module) {
        if (module.getCreatedByName() == null) module.setCreatedByName("Sales TL (Head of Sales)");
        return ResponseEntity.ok(ApiResponse.success("Sales training module published", salesTrainingModuleRepository.save(module)));
    }

    @PutMapping("/training/{id}")
    public ResponseEntity<ApiResponse<SalesTrainingModule>> updateTraining(@PathVariable Long id, @RequestBody SalesTrainingModule update) {
        SalesTrainingModule module = salesTrainingModuleRepository.findById(id).orElseThrow(() -> new RuntimeException("Training module not found"));
        if (update.getTitle() != null) module.setTitle(update.getTitle());
        if (update.getCategory() != null) module.setCategory(update.getCategory());
        if (update.getTargetAudience() != null) module.setTargetAudience(update.getTargetAudience());
        if (update.getDescription() != null) module.setDescription(update.getDescription());
        if (update.getContentHtml() != null) module.setContentHtml(update.getContentHtml());
        if (update.getVideoUrl() != null) module.setVideoUrl(update.getVideoUrl());
        if (update.getDurationMinutes() != null) module.setDurationMinutes(update.getDurationMinutes());
        return ResponseEntity.ok(ApiResponse.success("Training module updated", salesTrainingModuleRepository.save(module)));
    }

    @DeleteMapping("/training/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTraining(@PathVariable Long id) {
        salesTrainingModuleRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Training module removed", "OK"));
    }

    // ==========================================
    // 6. REWARDS & CONTESTS ENGINE
    // ==========================================

    @GetMapping("/contests")
    public ResponseEntity<ApiResponse<List<SalesRewardContest>>> getContests() {
        return ResponseEntity.ok(ApiResponse.success(salesRewardContestRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PostMapping("/contests")
    public ResponseEntity<ApiResponse<SalesRewardContest>> createOrUpdateContest(@RequestBody SalesRewardContest contest) {
        return ResponseEntity.ok(ApiResponse.success("Sales reward contest created", salesRewardContestRepository.save(contest)));
    }

    public static class AwardContestRequest {
        public String winnerStaffId;
        public String winnerStaffName;
        public Boolean prizeAwarded;
    }

    @PatchMapping("/contests/{id}/award")
    public ResponseEntity<ApiResponse<SalesRewardContest>> awardContestWinner(
            @PathVariable Long id,
            @RequestBody AwardContestRequest req) {
        SalesRewardContest contest = salesRewardContestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Contest not found"));
        contest.setStatus("COMPLETED");
        if (req.winnerStaffId != null) contest.setWinnerStaffId(req.winnerStaffId);
        if (req.winnerStaffName != null) contest.setWinnerStaffName(req.winnerStaffName);
        contest.setWinnerPrizeAwarded(Boolean.TRUE.equals(req.prizeAwarded));
        return ResponseEntity.ok(ApiResponse.success("Contest winner announced and reward awarded!", salesRewardContestRepository.save(contest)));
    }

    // ==========================================
    // 7. INCENTIVES & PAYROLL LEDGER
    // ==========================================

    @GetMapping("/incentives/ledger")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getIncentiveLedger() {
        SalesTarget st = salesTargetRepository.findByTargetMonth("OCT-2026").orElse(new SalesTarget());

        double floorRev = st.getFloorAchievedRevenue() != null ? st.getFloorAchievedRevenue() : 0.0;
        double floorTarget = st.getFloorTargetRevenue() != null && st.getFloorTargetRevenue() > 0 ? st.getFloorTargetRevenue() : 1000000.0;
        double floorAchievementPct = (floorRev / floorTarget) * 100.0;

        // Floor Staff Slab: Classic 200, Signature 400, Elite 700 + 20% multiplier if >100%
        int plansSold = st.getFloorPlansSold() != null ? st.getFloorPlansSold() : 0;
        double floorCommissionBase = plansSold * 450.0; // blended estimate
        double floorBonusMultiplier = floorAchievementPct >= 100.0 ? 1.20 : 1.0;
        double totalFloorIncentive = floorCommissionBase * floorBonusMultiplier;

        // Corporate Slab: <80% = 0, 80-100% = 3%, 101-125% = 5%, >125% = 7%
        double corpRev = st.getCorporateAchievedRevenue() != null ? st.getCorporateAchievedRevenue() : 0.0;
        double corpTarget = st.getCorporateTargetRevenue() != null && st.getCorporateTargetRevenue() > 0 ? st.getCorporateTargetRevenue() : 1000000.0;
        double corpAchievementPct = (corpRev / corpTarget) * 100.0;
        double corpCommissionPct = corpAchievementPct < 80.0 ? 0.0 : corpAchievementPct <= 100.0 ? 0.03 : corpAchievementPct <= 125.0 ? 0.05 : 0.07;
        double totalCorpIncentive = corpRev * corpCommissionPct;

        // Sales TL Override: 1.0% to 1.5% if cumulative target hit
        double totalRev = floorRev + corpRev;
        double masterTarget = st.getMasterTargetRevenue() != null && st.getMasterTargetRevenue() > 0 ? st.getMasterTargetRevenue() : 2000000.0;
        double masterPct = (totalRev / masterTarget) * 100.0;
        double tlOverride = masterPct >= 100.0 ? totalRev * 0.015 : (masterPct >= 80.0 ? totalRev * 0.01 : 0.0);

        Map<String, Object> ledger = new HashMap<>();
        ledger.put("targetMonth", "OCT-2026");
        ledger.put("floorTargetRevenue", floorTarget);
        ledger.put("floorAchievedRevenue", floorRev);
        ledger.put("floorAchievementPct", Math.round(floorAchievementPct * 10.0) / 10.0);
        ledger.put("floorPlansSold", plansSold);
        ledger.put("floorIncentiveTotal", totalFloorIncentive);
        ledger.put("corporateTargetRevenue", corpTarget);
        ledger.put("corporateAchievedRevenue", corpRev);
        ledger.put("corporateAchievementPct", Math.round(corpAchievementPct * 10.0) / 10.0);
        ledger.put("corporateIncentiveTotal", totalCorpIncentive);
        ledger.put("masterTargetRevenue", masterTarget);
        ledger.put("masterAchievedRevenue", totalRev);
        ledger.put("masterAchievementPct", Math.round(masterPct * 10.0) / 10.0);
        ledger.put("tlOverrideCommission", tlOverride);
        ledger.put("totalPayrollIncentive", totalFloorIncentive + totalCorpIncentive + tlOverride);
        ledger.put("isPayrollApproved", Boolean.TRUE.equals(st.getPayrollApproved()));
        ledger.put("payrollApprovedAt", st.getPayrollApprovedAt());

        return ResponseEntity.ok(ApiResponse.success(ledger));
    }

    @GetMapping("/incentives/records")
    public ResponseEntity<ApiResponse<List<SalesCommissionRecord>>> getCommissionRecords() {
        return ResponseEntity.ok(ApiResponse.success(salesCommissionRecordRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PostMapping("/incentives/payroll-approve")
    public ResponseEntity<ApiResponse<String>> approvePayroll() {
        SalesTarget st = salesTargetRepository.findByTargetMonth("OCT-2026").orElse(new SalesTarget());
        st.setPayrollApproved(true);
        st.setPayrollApprovedAt(LocalDateTime.now());
        salesTargetRepository.save(st);
        return ResponseEntity.ok(ApiResponse.success("Monthly incentive payroll signed off and approved by Owner/Super Admin.", "OK"));
    }

    // ==========================================
    // 8. BANQUET & ODC LEAD REASSIGNMENT DESK
    // ==========================================

    @GetMapping("/banquet/leads")
    public ResponseEntity<ApiResponse<List<BanquetInquiry>>> getBanquetLeads() {
        return ResponseEntity.ok(ApiResponse.success(banquetInquiryRepository.findAllByOrderByCreatedAtDesc()));
    }

    @PostMapping("/banquet/{id}/assign")
    public ResponseEntity<ApiResponse<BanquetInquiry>> assignBanquetLead(
            @PathVariable Long id,
            @RequestParam String assignedTo,
            @RequestParam(required = false) String status) {
        BanquetInquiry inq = banquetInquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banquet enquiry not found"));
        inq.setAssignedTo(assignedTo);
        if (status != null && !status.isEmpty()) {
            inq.setStatus(status);
        } else if ("NEW".equalsIgnoreCase(inq.getStatus())) {
            inq.setStatus("ASSIGNED");
        }
        return ResponseEntity.ok(ApiResponse.success("Banquet enquiry assigned to " + assignedTo, banquetInquiryRepository.save(inq)));
    }
}
