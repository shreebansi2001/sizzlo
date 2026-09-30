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

    @Autowired
    public CouponServiceImpl(CouponRepository couponRepository, MemberProfileRepository memberProfileRepository) {
        this.couponRepository = couponRepository;
        this.memberProfileRepository = memberProfileRepository;
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
        return couponRepository.save(existing);
    }

    @Override
    public void deleteCoupon(Long id) {
        couponRepository.deleteById(id);
    }
}
