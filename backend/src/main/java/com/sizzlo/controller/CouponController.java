package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.Coupon;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.repository.CouponRepository;
import com.sizzlo.repository.MemberProfileRepository;
import com.sizzlo.service.CouponService;
import com.sizzlo.entity.NotificationEntity;
import com.sizzlo.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CouponController {

    private final CouponService couponService;
    private final CouponRepository couponRepository;
    private final MemberProfileRepository memberProfileRepository;
    private final NotificationRepository notificationRepository;

    @Autowired
    public CouponController(CouponService couponService,
                            CouponRepository couponRepository,
                            MemberProfileRepository memberProfileRepository,
                            NotificationRepository notificationRepository) {
        this.couponService = couponService;
        this.couponRepository = couponRepository;
        this.memberProfileRepository = memberProfileRepository;
        this.notificationRepository = notificationRepository;
    }

    /**
     * If membershipId/mobile is passed: returns user's assigned coupons (only for active subscribed tiers).
     * If neither is passed (e.g. Web Admin portal): returns all coupons in database.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons(
            @RequestParam(required = false) String membershipId,
            @RequestParam(required = false) String mobile) {
        
        if ((membershipId == null || membershipId.trim().isEmpty()) && 
            (mobile == null || mobile.trim().isEmpty())) {
            return ResponseEntity.ok(ApiResponse.success(couponRepository.findAll()));
        }

        MemberProfile profile = resolveProfile(membershipId, mobile);
        if (profile == null) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }

        String tier = profile.getSubscriptionTier();
        if (tier == null || "REGISTERED".equalsIgnoreCase(tier) || "NONE".equalsIgnoreCase(tier)) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }

        List<Coupon> userCoupons = couponRepository.findByMembershipId(profile.getMembershipId());
        return ResponseEntity.ok(ApiResponse.success(userCoupons));
    }

    /**
     * Catalog of all active vouchers for exploration / preview.
     * Both VIP members and non-subscribed guests can view the catalog.
     * Non-subscribed guests see VIP-exclusive vouchers with lock state.
     */
    @GetMapping("/catalog")
    public ResponseEntity<ApiResponse<List<Coupon>>> getCatalog(
            @RequestParam(required = false) String membershipId,
            @RequestParam(required = false) String mobile) {
        List<Coupon> allAvailable = couponRepository.findByStatus("available");
        return ResponseEntity.ok(ApiResponse.success(allAvailable));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAvailableCoupons(
            @RequestParam(required = false) String membershipId,
            @RequestParam(required = false) String mobile) {
        
        if ((membershipId == null || membershipId.trim().isEmpty()) && 
            (mobile == null || mobile.trim().isEmpty())) {
            return ResponseEntity.ok(ApiResponse.success(couponRepository.findByStatus("available")));
        }

        MemberProfile profile = resolveProfile(membershipId, mobile);
        if (profile == null) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }

        String tier = profile.getSubscriptionTier();
        if (tier == null || "REGISTERED".equalsIgnoreCase(tier) || "NONE".equalsIgnoreCase(tier)) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }

        List<Coupon> available = couponRepository.findByMembershipIdAndStatus(profile.getMembershipId(), "available");
        return ResponseEntity.ok(ApiResponse.success(available));
    }

    private MemberProfile resolveProfile(String membershipId, String mobile) {
        if (membershipId != null && !membershipId.trim().isEmpty()) {
            MemberProfile m = memberProfileRepository.findByMembershipId(membershipId.trim()).orElse(null);
            if (m != null) return m;
        }
        if (mobile != null && !mobile.trim().isEmpty()) {
            String digits = mobile.replaceAll("\\D", "");
            for (MemberProfile m : memberProfileRepository.findAll()) {
                String mDigits = m.getMobile().replaceAll("\\D", "");
                if (!digits.isEmpty() && (mDigits.equals(digits) || (mDigits.length() >= 10 && mDigits.endsWith(digits)))) {
                    return m;
                }
            }
        }
        return null;
    }

    @GetMapping("/{code}")
    public ResponseEntity<ApiResponse<Coupon>> getCouponByCode(@PathVariable String code) {
        return ResponseEntity.ok(ApiResponse.success(couponService.getCouponByCode(code)));
    }

    @PostMapping("/{code}/redeem")
    public ResponseEntity<ApiResponse<Coupon>> redeemCoupon(
            @PathVariable String code,
            @RequestParam(name = "membershipId", defaultValue = "YSM-2024-04821") String membershipId) {
        Coupon redeemed = couponService.redeemCoupon(code, membershipId);
        return ResponseEntity.ok(ApiResponse.success("Coupon redeemed successfully", redeemed));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Coupon>> createCoupon(@RequestBody Coupon coupon) {
        Coupon created = couponService.createCoupon(coupon);

        // Auto-broadcast push notification for newly created coupon
        try {
            NotificationEntity notif = new NotificationEntity(
                    "tag",
                    "New Offer: " + (created.getName() != null ? created.getName() : created.getCode()),
                    (created.getSubtitle() != null ? created.getSubtitle() : "Exclusive dining voucher available") + " · Valid at " + (created.getOutlet() != null ? created.getOutlet() : "All Outlets"),
                    "ALL",
                    null,
                    null,
                    false
            );
            notificationRepository.save(notif);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.success("Coupon created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Coupon>> updateCoupon(@PathVariable Long id, @RequestBody Coupon coupon) {
        Coupon updated = couponService.updateCoupon(id, coupon);
        return ResponseEntity.ok(ApiResponse.success("Coupon updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        couponService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted successfully", null));
    }
}
