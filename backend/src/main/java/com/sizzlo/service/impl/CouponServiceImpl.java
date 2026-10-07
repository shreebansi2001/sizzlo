package com.sizzlo.service.impl;

import com.sizzlo.entity.Coupon;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.exception.ResourceNotFoundException;
import com.sizzlo.repository.CouponRepository;
import com.sizzlo.repository.MemberProfileRepository;
import com.sizzlo.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CouponServiceImpl implements CouponService {

    private final CouponRepository couponRepository;
    private final MemberProfileRepository memberProfileRepository;
    private final com.sizzlo.repository.ActivityLogRepository activityLogRepository;

    @Autowired
    public CouponServiceImpl(CouponRepository couponRepository,
                             MemberProfileRepository memberProfileRepository,
                             com.sizzlo.repository.ActivityLogRepository activityLogRepository) {
        this.couponRepository = couponRepository;
        this.memberProfileRepository = memberProfileRepository;
        this.activityLogRepository = activityLogRepository;
    }

    @Override
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    @Override
    public List<Coupon> getAvailableCoupons() {
        return couponRepository.findByStatus("available");
    }

    @Override
    public Coupon getCouponByCode(String code) {
        return couponRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with code: " + code));
    }

    @Override
    public Coupon redeemCoupon(String code, String membershipId) {
        Coupon coupon = getCouponByCode(code);
        if (coupon.getLeftCount() > 0) {
            coupon.setLeftCount(coupon.getLeftCount() - 1);
            if (coupon.getLeftCount() == 0) {
                coupon.setStatus("used");
            }
            couponRepository.save(coupon);

            // Update member's used coupon count
            memberProfileRepository.findByMembershipId(membershipId).ifPresent(member -> {
                member.setCouponsUsed(member.getCouponsUsed() + 1);
                memberProfileRepository.save(member);

                com.sizzlo.entity.ActivityLog log = new com.sizzlo.entity.ActivityLog();
                log.setActorName(member.getFullName());
                log.setActionType("REDEMPTION");
                log.setDescription("Voucher " + coupon.getName() + " (" + coupon.getCode() + ") redeemed");
                log.setOutletName(coupon.getOutlet() != null ? coupon.getOutlet() : "Yanki Signature");
                log.setTimeAgo("Just now");
                log.setTimestamp(java.time.LocalDateTime.now());
                activityLogRepository.save(log);
            });
        }
        return coupon;
    }

    @Override
    public Coupon createCoupon(Coupon coupon) {
        return couponRepository.save(coupon);
    }

    @Override
    public Coupon updateCoupon(Long id, Coupon coupon) {
        Coupon existing = couponRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon not found with id: " + id));
        existing.setName(coupon.getName());
        existing.setSubtitle(coupon.getSubtitle());
        existing.setDescription(coupon.getDescription());
        existing.setLeftCount(coupon.getLeftCount());
        existing.setTotalCount(coupon.getTotalCount());
        existing.setExpiryDate(coupon.getExpiryDate());
        existing.setStatus(coupon.getStatus());
        existing.setOutlet(coupon.getOutlet());
        existing.setColor(coupon.getColor());
        existing.setTargetAudience(coupon.getTargetAudience());
        existing.setVipOnly(coupon.getVipOnly());
        existing.setImageUrl(coupon.getImageUrl());
        if (coupon.getDiscountType() != null) existing.setDiscountType(coupon.getDiscountType());
        if (coupon.getDiscountValue() != null) existing.setDiscountValue(coupon.getDiscountValue());
        if (coupon.getCode() != null) existing.setCode(coupon.getCode());
        return couponRepository.save(existing);
    }

    @Override
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }
}
