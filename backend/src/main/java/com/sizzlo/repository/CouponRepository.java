package com.sizzlo.repository;

import com.sizzlo.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCode(String code);
    Optional<Coupon> findByCodeAndMembershipId(String code, String membershipId);
    List<Coupon> findByStatus(String status);
    List<Coupon> findByMembershipId(String membershipId);
    List<Coupon> findByMembershipIdAndStatus(String membershipId, String status);
    List<Coupon> findByOutletContainingIgnoreCase(String outlet);
}
