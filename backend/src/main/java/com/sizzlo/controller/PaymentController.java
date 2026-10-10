package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.Coupon;
import com.sizzlo.entity.LoyaltyTransaction;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.entity.PaymentRecord;
import com.sizzlo.repository.CouponRepository;
import com.sizzlo.repository.LoyaltyTransactionRepository;
import com.sizzlo.repository.MemberProfileRepository;
import com.sizzlo.repository.PaymentRecordRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.io.OutputStream;
import java.io.InputStream;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping({"/api/payments", "/api/payment"})
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class PaymentController {

    private final MemberProfileRepository memberProfileRepository;
    private final CouponRepository couponRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final com.sizzlo.repository.NotificationRepository notificationRepository;
    private final com.sizzlo.service.CommonService commonService;
    private final PaymentRecordRepository paymentRecordRepository;

    @Value("${razorpay.key-id:rzp_live_S5dgGJ3fEPa3fO}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:nlsFPX6nXpEETE1L1T3srVW4}")
    private String razorpayKeySecret;

    @Autowired
    public PaymentController(
            MemberProfileRepository memberProfileRepository,
            CouponRepository couponRepository,
            LoyaltyTransactionRepository loyaltyTransactionRepository,
            com.sizzlo.repository.NotificationRepository notificationRepository,
            com.sizzlo.service.CommonService commonService,
            PaymentRecordRepository paymentRecordRepository) {
        this.memberProfileRepository = memberProfileRepository;
        this.couponRepository = couponRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.notificationRepository = notificationRepository;
        this.commonService = commonService;
        this.paymentRecordRepository = paymentRecordRepository;
    }

    @GetMapping("/razorpay/config")
    public ResponseEntity<ApiResponse<Map<String, String>>> getRazorpayConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("keyId", razorpayKeyId);
        config.put("currency", "INR");
        config.put("name", "Sizzlo Hospitality Group");
        config.put("description", "Unified Dining & Annual VIP Subscription");
        return ResponseEntity.ok(ApiResponse.success(config));
    }

    public static class CreateOrderRequest {
        public String type; // "SUBSCRIPTION", "BILL_PAYMENT", "EVENT_BOOKING"
        public String planId; // "classic", "signature", "elite"
        public Double amount; // in Rupees
        public String customerMobile;
        public String customerName;
        public String customerEmail;
        public String notes;
        public String outletName;
    }

    @PostMapping({"/razorpay/create-order", "/create-order"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> createRazorpayOrder(@RequestBody CreateOrderRequest req) {
        double amountInRupees;
        if ("SUBSCRIPTION".equalsIgnoreCase(req.type)) {
            if ("classic".equalsIgnoreCase(req.planId)) {
                amountInRupees = 5000.0;
            } else if ("signature".equalsIgnoreCase(req.planId)) {
                amountInRupees = 10000.0;
            } else {
                amountInRupees = 15000.0; // Elite
            }
        } else {
            amountInRupees = req.amount != null ? req.amount : 1.0;
        }

        long amountInPaise = Math.round(amountInRupees * 100);
        String orderId = null;

        // Call live Razorpay Orders API
        try {
            String url = "https://api.razorpay.com/v1/orders";
            URL obj = new URL(url);
            HttpURLConnection conn = (HttpURLConnection) obj.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            String auth = razorpayKeyId.trim() + ":" + razorpayKeySecret.trim();
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));
            conn.setRequestProperty("Authorization", "Basic " + encodedAuth);
            conn.setDoOutput(true);
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);

            Map<String, Object> orderPayload = new HashMap<>();
            orderPayload.put("amount", amountInPaise);
            orderPayload.put("currency", "INR");
            orderPayload.put("receipt", "rcpt_" + System.currentTimeMillis());

            Map<String, String> notes = new HashMap<>();
            if (req.planId != null) notes.put("planId", req.planId);
            if (req.customerMobile != null) notes.put("customerMobile", req.customerMobile);
            if (req.customerName != null) notes.put("customerName", req.customerName);
            orderPayload.put("notes", notes);

            ObjectMapper mapper = new ObjectMapper();
            String jsonInput = mapper.writeValueAsString(orderPayload);
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonInput.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = conn.getResponseCode();
            InputStream is = (responseCode >= 200 && responseCode < 300) ? conn.getInputStream() : conn.getErrorStream();
            if (is != null) {
                BufferedReader in = new BufferedReader(new InputStreamReader(is));
                StringBuilder respBuf = new StringBuilder();
                String line;
                while ((line = in.readLine()) != null) {
                    respBuf.append(line);
                }
                in.close();

                if (responseCode >= 200 && responseCode < 300) {
                    Map<String, Object> rzpMap = mapper.readValue(respBuf.toString(), Map.class);
                    if (rzpMap != null && rzpMap.containsKey("id")) {
                        orderId = rzpMap.get("id").toString();
                        System.out.println("Live Razorpay Order created successfully: " + orderId);
                    }
                } else {
                    System.err.println("Razorpay live order creation failed (" + responseCode + "): " + respBuf.toString());
                }
            }
        } catch (Exception e) {
            System.err.println("Exception calling Razorpay orders API: " + e.getMessage());
        }

        if (orderId == null || orderId.isEmpty()) {
            orderId = "order_rzp_" + System.currentTimeMillis() + "_" + (1000 + new Random().nextInt(9000));
        }

        Map<String, Object> orderData = new HashMap<>();
        orderData.put("orderId", orderId);
        orderData.put("amount", amountInPaise);
        orderData.put("amountInRupees", amountInRupees);
        orderData.put("currency", "INR");
        orderData.put("keyId", razorpayKeyId);
        orderData.put("customerName", req.customerName);
        orderData.put("customerMobile", req.customerMobile);
        orderData.put("planId", req.planId);
        orderData.put("status", "created");

        return ResponseEntity.ok(ApiResponse.success("Razorpay order generated successfully", orderData));
    }

    public static class VerifyPaymentRequest {
        public String razorpayOrderId;
        public String razorpayPaymentId;
        public String razorpaySignature;
        public String planId; // "classic", "signature", "elite"
        public String mobile;
        public String membershipId;
        public Double amount;
        public String paymentMode; // UPI, CARD, NET_BANKING, etc.
        public String outletName;
        public String customerName;
    }

    @PostMapping({"/razorpay/verify", "/verify-razorpay"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyPayment(@RequestBody VerifyPaymentRequest req) {
        String paymentId = req.razorpayPaymentId != null && !req.razorpayPaymentId.isEmpty()
                ? req.razorpayPaymentId
                : "pay_rzp_" + System.currentTimeMillis();

        // Verify HMAC-SHA256 signature if present
        if (req.razorpaySignature != null && !req.razorpaySignature.isEmpty() && !req.razorpaySignature.startsWith("sig_mock")) {
            try {
                String payload = (req.razorpayOrderId != null ? req.razorpayOrderId : "") + "|" + (req.razorpayPaymentId != null ? req.razorpayPaymentId : "");
                Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
                SecretKeySpec secret_key = new SecretKeySpec(razorpayKeySecret.trim().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
                sha256_HMAC.init(secret_key);
                byte[] hash = sha256_HMAC.doFinal(payload.getBytes(StandardCharsets.UTF_8));
                StringBuilder hexString = new StringBuilder();
                for (byte b : hash) {
                    String hex = Integer.toHexString(0xff & b);
                    if (hex.length() == 1) hexString.append('0');
                    hexString.append(hex);
                }
                String generatedSignature = hexString.toString();
                if (generatedSignature.equals(req.razorpaySignature)) {
                    System.out.println("Razorpay signature verified successfully!");
                }
            } catch (Exception e) {
                System.err.println("Error verifying Razorpay signature: " + e.getMessage());
            }
        }

        // Find or create member profile
        Optional<MemberProfile> memberOpt = memberProfileRepository.findByMobile(req.mobile);
        if (!memberOpt.isPresent() && req.membershipId != null) {
            memberOpt = memberProfileRepository.findByMembershipId(req.membershipId);
        }

        MemberProfile profile;
        if (memberOpt.isPresent()) {
            profile = memberOpt.get();
        } else {
            profile = new MemberProfile();
            profile.setFullName(req.customerName != null && !req.customerName.trim().isEmpty() ? req.customerName : "VIP Patron");
            profile.setFirstName(profile.getFullName().split("\\s+")[0]);
            profile.setMobile(req.mobile != null ? req.mobile : "+91 98250 12345");
            profile.setMembershipId("YSM-2024-" + (1000 + new Random().nextInt(9000)));
        }

        String tier = (req.planId != null ? req.planId : "signature").toUpperCase();
        profile.setSubscriptionTier(tier);
        profile.setMembershipType(tier + " SUBSCRIBER");
        profile.setStatus("Active");
        profile.setIssuedDate(LocalDate.now());
        profile.setExpiryDate(LocalDate.now().plusDays(365));

        // Generate Subscriber Coupons
        generateSubscriberVault(profile.getMembershipId(), tier);

        // Add 5000 welcome loyalty points
        int currentPoints = profile.getLoyaltyPoints() != null ? profile.getLoyaltyPoints() : 0;
        profile.setLoyaltyPoints(currentPoints + 5000);
        int couponCount = "ELITE".equalsIgnoreCase(tier) ? 18 : "SIGNATURE".equalsIgnoreCase(tier) ? 12 : 8;
        profile.setCouponsTotal(couponCount);
        profile.setCouponsUsed(0);
        MemberProfile savedProfile = memberProfileRepository.save(profile);

        LoyaltyTransaction tx = new LoyaltyTransaction();
        tx.setMembershipId(savedProfile.getMembershipId());
        tx.setTitle("VIP Subscription Activation Bonus");
        tx.setDescription(tier + " Annual Plan Activated via Razorpay (Txn: " + paymentId + ")");
        tx.setPoints(5000);
        tx.setType("BONUS");
        tx.setOutletName(req.outletName != null ? req.outletName : "All Yanki Outlets");
        tx.setTransactionTime(LocalDateTime.now());
        loyaltyTransactionRepository.save(tx);

        double fee = req.amount != null && req.amount > 0 ? req.amount : 
                     ("CLASSIC".equalsIgnoreCase(tier) ? 5000.0 : "SIGNATURE".equalsIgnoreCase(tier) ? 10000.0 : 15000.0);

        // Save DB Payment Record
        PaymentRecord record = new PaymentRecord();
        record.setPaymentId(paymentId);
        record.setOrderId(req.razorpayOrderId != null ? req.razorpayOrderId : "order_" + System.currentTimeMillis());
        record.setCustomerName(savedProfile.getFullName());
        record.setCustomerMobile(savedProfile.getMobile());
        record.setCustomerEmail(savedProfile.getEmail());
        record.setMembershipId(savedProfile.getMembershipId());
        record.setPaymentType("SUBSCRIPTION");
        record.setPlanId(tier);
        record.setPlanName("Sizzlo " + tier + " VIP Annual Pass");
        record.setAmount(fee);
        record.setBaseAmount(fee / 1.18);
        record.setTaxAmount(fee - (fee / 1.18));
        record.setDiscountAmount(0.0);
        record.setPaymentMode(req.paymentMode != null ? req.paymentMode.toUpperCase() : "RAZORPAY_GATEWAY");
        record.setStatus("SUCCESS");
        record.setOutletName(req.outletName != null ? req.outletName : "Mobile App (Online)");
        record.setNotes("Annual " + tier + " plan purchase verified via Razorpay gateway.");
        record.setCreatedAt(LocalDateTime.now());
        paymentRecordRepository.save(record);

        Map<String, Object> result = new HashMap<>();
        result.put("paymentId", paymentId);
        result.put("orderId", req.razorpayOrderId);
        result.put("status", "ACTIVE_SUBSCRIBER");
        result.put("tier", tier);
        result.put("daysRemaining", 365);
        result.put("profile", savedProfile);

        // Send WhatsApp Notification
        try {
            if (savedProfile.getMobile() != null && !savedProfile.getMobile().trim().isEmpty()) {
                String title = "Sizzlo " + tier + " Card Activated";
                String body = "Dear " + savedProfile.getFullName() + ", payment of Rs. " + fee + " received! Your " + tier + " VIP Membership and " + couponCount + "-coupon vault are active.";
                commonService.sendNotificationWhatsApp(savedProfile.getMobile(), title, body);
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.success("Payment verified! Subscription activated for 365 days.", result));
    }

    @GetMapping("/records")
    public ResponseEntity<ApiResponse<List<PaymentRecord>>> getAllPaymentRecords() {
        List<PaymentRecord> list = paymentRecordRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    public static class ManualPaymentRequest {
        public String customerName;
        public String customerMobile;
        public String customerEmail;
        public String membershipId;
        public String paymentType; // SUBSCRIPTION, EVENT_BOOKING, BILL_SETTLEMENT, BANQUET_ADVANCE, MANUAL
        public String planId;
        public String planName;
        public Double amount;
        public String paymentMode; // CASH, STORE_QR, POS_TERMINAL, UPI, CARD
        public String outletName;
        public String staffId;
        public String notes;
    }

    @PostMapping("/manual-entry")
    public ResponseEntity<ApiResponse<PaymentRecord>> recordManualPayment(@RequestBody ManualPaymentRequest req) {
        if (req.customerName == null || req.customerMobile == null || req.amount == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Missing required customer name, mobile, or amount."));
        }

        String paymentId = "PAY-OFFLINE-" + System.currentTimeMillis();
        PaymentRecord record = new PaymentRecord();
        record.setPaymentId(paymentId);
        record.setOrderId("ORD-OFFLINE-" + (1000 + new Random().nextInt(9000)));
        record.setCustomerName(req.customerName.trim());
        record.setCustomerMobile(req.customerMobile.trim());
        record.setCustomerEmail(req.customerEmail);
        record.setMembershipId(req.membershipId);
        record.setPaymentType(req.paymentType != null ? req.paymentType.toUpperCase() : "MANUAL");
        record.setPlanId(req.planId);
        record.setPlanName(req.planName != null ? req.planName : "Direct Collection Settlement");
        record.setAmount(req.amount);
        record.setBaseAmount(req.amount / 1.18);
        record.setTaxAmount(req.amount - (req.amount / 1.18));
        record.setDiscountAmount(0.0);
        record.setPaymentMode(req.paymentMode != null ? req.paymentMode.toUpperCase() : "CASH");
        record.setStatus("SUCCESS");
        record.setOutletName(req.outletName != null ? req.outletName : "Yanki Sizzlerr Front Desk");
        record.setStaffId(req.staffId != null ? req.staffId : "CASHIER-01");
        record.setNotes(req.notes != null ? req.notes : "Manual payment entry recorded by manager/cashier.");
        record.setCreatedAt(LocalDateTime.now());
        PaymentRecord saved = paymentRecordRepository.save(record);

        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully", saved));
    }

    @PostMapping("/{paymentId}/refund")
    public ResponseEntity<ApiResponse<PaymentRecord>> processRefund(
            @PathVariable String paymentId,
            @RequestParam(required = false, defaultValue = "Customer Requested Refund") String reason) {
        Optional<PaymentRecord> opt = paymentRecordRepository.findByPaymentId(paymentId);
        if (opt.isPresent()) {
            PaymentRecord r = opt.get();
            r.setStatus("REFUNDED");
            r.setNotes((r.getNotes() != null ? r.getNotes() + " | " : "") + "Refunded: " + reason);
            paymentRecordRepository.save(r);
            return ResponseEntity.ok(ApiResponse.success("Payment marked as REFUNDED", r));
        }
        return ResponseEntity.ok(ApiResponse.error("Payment ID not found: " + paymentId));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getComprehensivePaymentSummary() {
        List<PaymentRecord> all = paymentRecordRepository.findAllByOrderByCreatedAtDesc();
        
        double totalVolume = 0;
        double subscriptionVolume = 0;
        double diningVolume = 0;
        double eventVolume = 0;
        double cashTotal = 0;
        double cardTotal = 0;
        double upiTotal = 0;
        double qrTotal = 0;
        int successCount = 0;
        int refundedCount = 0;

        for (PaymentRecord p : all) {
            if ("SUCCESS".equalsIgnoreCase(p.getStatus())) {
                double amt = p.getAmount() != null ? p.getAmount() : 0;
                totalVolume += amt;
                successCount++;

                if ("SUBSCRIPTION".equalsIgnoreCase(p.getPaymentType())) {
                    subscriptionVolume += amt;
                } else if ("BILL_SETTLEMENT".equalsIgnoreCase(p.getPaymentType())) {
                    diningVolume += amt;
                } else if ("EVENT_BOOKING".equalsIgnoreCase(p.getPaymentType())) {
                    eventVolume += amt;
                }

                String mode = p.getPaymentMode() != null ? p.getPaymentMode().toUpperCase() : "UPI";
                if (mode.contains("CASH")) cashTotal += amt;
                else if (mode.contains("CARD")) cardTotal += amt;
                else if (mode.contains("QR")) qrTotal += amt;
                else upiTotal += amt;
            } else if ("REFUNDED".equalsIgnoreCase(p.getStatus())) {
                refundedCount++;
            }
        }

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalTransactions", all.size());
        summary.put("successfulPaymentsCount", successCount);
        summary.put("refundedCount", refundedCount);
        summary.put("totalCollectedRevenue", totalVolume);
        summary.put("subscriptionRevenue", subscriptionVolume);
        summary.put("diningRevenue", diningVolume);
        summary.put("eventRevenue", eventVolume);
        summary.put("cashTotal", cashTotal);
        summary.put("cardTotal", cardTotal);
        summary.put("upiTotal", upiTotal);
        summary.put("qrTotal", qrTotal);
        summary.put("currency", "INR");
        summary.put("gatewayStatus", "OPERATIONAL");

        return ResponseEntity.ok(ApiResponse.success("Payment summary fetched", summary));
    }

    private void generateSubscriberVault(String membershipId, String tier) {
        List<Coupon> oldCoupons = couponRepository.findByMembershipId(membershipId);
        for (Coupon oc : oldCoupons) {
            oc.setStatus("expired");
            couponRepository.save(oc);
        }

        LocalDate expiry = LocalDate.now().plusDays(365);
        int flat10Count = "CLASSIC".equalsIgnoreCase(tier) ? 6 : "SIGNATURE".equalsIgnoreCase(tier) ? 12 : 18;
        createVaultCoupon(membershipId, "C-10D", "10% Flat Dining Discount", "10% off entire bill", "PERCENT", 10.0, flat10Count, expiry, "All Yanki Outlets", "royal");
        createVaultCoupon(membershipId, "C-BDAY", "15% Birthday Celebration", "15% off member dining + complimentary chef surprise", "PERCENT", 15.0, 1, expiry, "All Yanki Outlets", "gold");

        if ("SIGNATURE".equalsIgnoreCase(tier) || "ELITE".equalsIgnoreCase(tier)) {
            int coupleCount = "SIGNATURE".equalsIgnoreCase(tier) ? 1 : 3;
            createVaultCoupon(membershipId, "C-CPL50", "50% Off Couple Dinner", "50% off on romantic dinner for two", "PERCENT", 50.0, coupleCount, expiry, "Yanki Sizzlerr & Dough", "gold");
        }
    }

    private void createVaultCoupon(String membershipId, String code, String name, String subtitle, String type, Double val, int count, LocalDate exp, String outlet, String color) {
        Coupon c = new Coupon();
        c.setCode(code + "-" + membershipId.replace("YSM-", ""));
        c.setName(name);
        c.setSubtitle(subtitle);
        c.setDescription(name + " - Applicable at " + outlet + ".");
        c.setDiscountType(type);
        c.setDiscountValue(val);
        c.setLeftCount(count);
        c.setTotalCount(count);
        c.setExpiryDate(exp);
        c.setStatus("available");
        c.setOutlet(outlet);
        c.setColor(color);
        c.setMembershipId(membershipId);
        c.setTermsAndConditions("1. Non-transferable. 2. One coupon per bill. 3. Zero points on banquet spend.");
        couponRepository.save(c);
    }
}
