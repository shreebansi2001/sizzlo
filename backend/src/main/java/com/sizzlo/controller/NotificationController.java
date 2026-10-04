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

        // 1. Check member profile
        MemberProfile profile = null;
        if (membershipId != null && !membershipId.isEmpty()) {
            profile = memberProfileRepository.findByMembershipId(membershipId).orElse(null);
        }
        if (profile == null && mobile != null && !mobile.isEmpty()) {
            String digits = mobile.replaceAll("\\D", "");
            for (MemberProfile m : memberProfileRepository.findAll()) {
                String mDigits = m.getMobile().replaceAll("\\D", "");
                if (mDigits.equals(digits) || (mDigits.length() >= 10 && mDigits.endsWith(digits))) {
                    profile = m;
                    break;
                }
            }
        }

        // Welcome / VIP notification
        if (profile != null) {
            list.add(new NotificationDto(
                    idCounter++,
                    "gift",
                    "VIP Membership Activated",
                    "Welcome " + profile.getFullName() + "! Your " + profile.getMembershipType() + " benefits are ready.",
                    "Active now"
            ));

            if (profile.getLoyaltyPoints() != null && profile.getLoyaltyPoints() > 0) {
                list.add(new NotificationDto(
                        idCounter++,
                        "sparkle",
                        "Privilege Points Credited",
                        profile.getLoyaltyPoints() + " loyalty points available in your wallet.",
                        "Recent"
                ));
            }
        } else {
            list.add(new NotificationDto(
                    idCounter++,
                    "gift",
                    "Welcome to Sizzlo",
                    "Unlock exclusive 50% dining discounts and VIP privileges across Yanki outlets.",
                    "Today"
            ));
        }

        // 2. Add Recent Reservations
        String searchMobile = profile != null ? profile.getMobile() : (mobile != null ? mobile : "");
        if (!searchMobile.isEmpty()) {
            String cleanPhone = searchMobile.replaceAll("\\D", "");
            for (Reservation r : reservationRepository.findAllByOrderByCreatedAtDesc()) {
                String rPhone = r.getCustomerMobile().replaceAll("\\D", "");
                if (rPhone.equals(cleanPhone) || (rPhone.length() >= 10 && rPhone.endsWith(cleanPhone))) {
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

        // 3. Add Top Available Coupons
        List<Coupon> availableCoupons = couponRepository.findByStatus("available");
        for (Coupon c : availableCoupons) {
            if (list.size() >= 6) break;
            list.add(new NotificationDto(
                    idCounter++,
                    "tag",
                    c.getName(),
                    c.getSubtitle() + " · Valid at " + c.getOutlet(),
                    "Expires " + c.getExpiryDate()
            ));
        }

        // 4. Default promotional notification
        list.add(new NotificationDto(
                idCounter++,
                "alert",
                "Weekend Chef's Sizzler Tasting",
                "Reserve your priority VIP table for this Saturday evening at Yanki Signature.",
                "Upcoming"
        ));

        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
