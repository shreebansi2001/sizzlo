package com.sizzlo.service;

import com.sizzlo.entity.Coupon;

import java.util.List;

public interface CouponService {
    List<Coupon> getAllCoupons();
    List<Coupon> getAvailableCoupons();
    Coupon getCouponByCode(String code);
    Coupon redeemCoupon(String code, String membershipId);
    Coupon createCoupon(Coupon coupon);
    Coupon updateCoupon(Long id, Coupon coupon);
    void deleteCoupon(Long id);
}
