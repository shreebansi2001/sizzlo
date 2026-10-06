package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.dto.NotificationDto;
import com.sizzlo.entity.Coupon;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.entity.Reservation;
import com.sizzlo.repository.CouponRepository;
import com.sizzlo.repository.MemberProfileRepository;
import com.sizzlo.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class NotificationController {

    private final MemberProfileRepository memberProfileRepository;
    private final ReservationRepository reservationRepository;
    private final CouponRepository couponRepository;

    @Autowired
    public NotificationController(MemberProfileRepository memberProfileRepository,
                                  ReservationRepository reservationRepository,
                                  CouponRepository couponRepository) {
        this.memberProfileRepository = memberProfileRepository;
        this.reservationRepository = reservationRepository;
        this.couponRepository = couponRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(
            @RequestParam(required = false) String membershipId,
            @RequestParam(required = false) String mobile) {

        List<NotificationDto> list = new ArrayList<>();
        long idCounter = 1;

        // 1. Resolve member profile
        MemberProfile profile = null;
        if (membershipId != null && !membershipId.trim().isEmpty()) {
            profile = memberProfileRepository.findByMembershipId(membershipId.trim()).orElse(null);
        }
        if (profile == null && mobile != null && !mobile.trim().isEmpty()) {
            String digits = mobile.replaceAll("\\D", "");
            for (MemberProfile m : memberProfileRepository.findAll()) {
                String mDigits = m.getMobile().replaceAll("\\D", "");
                if (!digits.isEmpty() && (mDigits.equals(digits) || (mDigits.length() >= 10 && mDigits.endsWith(digits)))) {
                    profile = m;
                    break;
                }
            }
        }

        // For new accounts or unauthenticated sessions with no events, return clean empty list
        if (profile == null) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }

        String tier = profile.getSubscriptionTier();
        boolean isSubscriber = tier != null && !"REGISTERED".equalsIgnoreCase(tier) && !"NONE".equalsIgnoreCase(tier);

        // Only show subscription and loyalty notifications if member has actually subscribed
        if (isSubscriber) {
            list.add(new NotificationDto(
                    idCounter++,
                    "gift",
                    tier + " VIP Subscription Active",
                    "Welcome " + profile.getFullName() + "! Your " + tier + " privileges and 12-coupon vault are active.",
                    "Active"
            ));

            if (profile.getLoyaltyPoints() != null && profile.getLoyaltyPoints() > 0) {
                list.add(new NotificationDto(
                        idCounter++,
                        "sparkle",
                        "Loyalty Points Available",
                        profile.getLoyaltyPoints() + " loyalty points available in your Sizzlo wallet.",
                        "Wallet"
                ));
            }

            // Real user's available coupons
            List<Coupon> userCoupons = couponRepository.findByMembershipIdAndStatus(profile.getMembershipId(), "available");
            for (Coupon c : userCoupons) {
                if (list.size() >= 5) break;
                list.add(new NotificationDto(
                        idCounter++,
                        "tag",
                        c.getName(),
                        c.getSubtitle() + " · Valid at " + c.getOutlet(),
                        "Expires " + c.getExpiryDate()
                ));
            }
        }

        // Real user's dining reservations
        String searchMobile = profile.getMobile();
        if (searchMobile != null && !searchMobile.trim().isEmpty()) {
            String cleanPhone = searchMobile.replaceAll("\\D", "");
            for (Reservation r : reservationRepository.findAllByOrderByCreatedAtDesc()) {
                String rPhone = r.getCustomerMobile() != null ? r.getCustomerMobile().replaceAll("\\D", "") : "";
                if (!cleanPhone.isEmpty() && (rPhone.equals(cleanPhone) || (rPhone.length() >= 10 && rPhone.endsWith(cleanPhone)))) {
                    list.add(new NotificationDto(
                            idCounter++,
                            "calendar",
                            "Reservation " + r.getStatus(),
                            "Table for " + r.getGuests() + " at " + r.getOutlet() + " (" + r.getReservationTime() + ")",
                            r.getCreatedAt() != null ? "Confirmed" : "Recent"
                    ));
                    if (list.size() >= 5) break;
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
