package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.Coupon;
import com.sizzlo.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coupons")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class CouponController {

    private final CouponService couponService;

    @Autowired
    public CouponController(CouponService couponService) {
        this.couponService = couponService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Coupon>>> getAllCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAllCoupons()));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<Coupon>>> getAvailableCoupons() {
        return ResponseEntity.ok(ApiResponse.success(couponService.getAvailableCoupons()));
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
