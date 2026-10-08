package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.dto.NotificationDto;
import com.sizzlo.entity.Coupon;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.entity.NotificationEntity;
import com.sizzlo.entity.Reservation;
import com.sizzlo.repository.CouponRepository;
import com.sizzlo.repository.MemberProfileRepository;
import com.sizzlo.repository.NotificationRepository;
import com.sizzlo.repository.ReservationRepository;
import com.sizzlo.service.CommonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class NotificationController {

    private final MemberProfileRepository memberProfileRepository;
    private final ReservationRepository reservationRepository;
    private final CouponRepository couponRepository;
    private final NotificationRepository notificationRepository;
    private final CommonService commonService;

    @Autowired
    public NotificationController(MemberProfileRepository memberProfileRepository,
                                  ReservationRepository reservationRepository,
                                  CouponRepository couponRepository,
                                  NotificationRepository notificationRepository,
                                  CommonService commonService) {
        this.memberProfileRepository = memberProfileRepository;
        this.reservationRepository = reservationRepository;
        this.couponRepository = couponRepository;
        this.notificationRepository = notificationRepository;
        this.commonService = commonService;
    }

    public static class SendNotificationRequest {
        public String targetType = "ALL"; // "ALL" or "SPECIFIC"
        public String targetMembershipId;
        public String targetMobile;
        public String title;
        public String message;
        public String type = "tag"; // "gift", "tag", "sparkle", "alert", "calendar", "bill", "card"
        public Boolean sendWhatsApp = false;
    }

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<NotificationEntity>> sendNotification(@RequestBody SendNotificationRequest req) {
        if (req.title == null || req.title.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Notification title is required"));
        }

        NotificationEntity entity = new NotificationEntity(
                req.type != null ? req.type : "tag",
                req.title.trim(),
                req.message != null ? req.message.trim() : "",
                req.targetType != null ? req.targetType : "ALL",
                req.targetMembershipId != null ? req.targetMembershipId.trim() : null,
                req.targetMobile != null ? req.targetMobile.trim() : null,
                req.sendWhatsApp != null ? req.sendWhatsApp : false
        );

        NotificationEntity saved = notificationRepository.save(entity);

        // If WhatsApp requested, dispatch WhatsApp message
        if (Boolean.TRUE.equals(req.sendWhatsApp)) {
            if ("SPECIFIC".equalsIgnoreCase(req.targetType)) {
                String targetPhone = req.targetMobile;
                if ((targetPhone == null || targetPhone.trim().isEmpty()) && req.targetMembershipId != null) {
                    memberProfileRepository.findByMembershipId(req.targetMembershipId)
                            .ifPresent(m -> commonService.sendNotificationWhatsApp(m.getMobile(), req.title, req.message));
                } else if (targetPhone != null && !targetPhone.trim().isEmpty()) {
                    commonService.sendNotificationWhatsApp(targetPhone, req.title, req.message);
                }
            } else {
                List<MemberProfile> members = memberProfileRepository.findAll();
                int sentCount = 0;
                for (MemberProfile m : members) {
                    boolean eligible = true;
                    String tier = m.getSubscriptionTier();
                    boolean isSub = tier != null && !"REGISTERED".equalsIgnoreCase(tier) && !"NONE".equalsIgnoreCase(tier);
                    if ("VIP".equalsIgnoreCase(req.targetType) && !isSub) eligible = false;
                    if ("FREE".equalsIgnoreCase(req.targetType) && isSub) eligible = false;

                    if (eligible && m.getMobile() != null && !m.getMobile().trim().isEmpty()) {
                        commonService.sendNotificationWhatsApp(m.getMobile(), req.title, req.message);
                        sentCount++;
                        if (sentCount >= 10) break;
                    }
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success("Notification dispatched successfully", saved));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<NotificationEntity>>> getNotificationHistory() {
        return ResponseEntity.ok(ApiResponse.success(notificationRepository.findAllByOrderByCreatedAtDesc()));
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

        String searchMemId = profile != null ? profile.getMembershipId() : (membershipId != null ? membershipId.trim() : null);
        String searchMobile = profile != null ? profile.getMobile() : (mobile != null ? mobile.trim() : null);
        String cleanPhone = searchMobile != null ? searchMobile.replaceAll("\\D", "") : null;

        boolean isSubscriber = false;
        if (profile != null) {
            String tier = profile.getSubscriptionTier();
            isSubscriber = tier != null && !"REGISTERED".equalsIgnoreCase(tier) && !"NONE".equalsIgnoreCase(tier);
        }

        // 2. Fetch persistent database notifications (Broadcast + VIP + Free + User specific)
        List<NotificationEntity> dbNotifs = notificationRepository.findAllByOrderByCreatedAtDesc();
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("dd MMM, hh:mm a");
        for (NotificationEntity n : dbNotifs) {
            boolean matches = false;
            String tType = n.getTargetType() != null ? n.getTargetType().toUpperCase() : "ALL";
            if ("ALL".equals(tType)) {
                matches = true;
            } else if ("VIP".equals(tType) && isSubscriber) {
                matches = true;
            } else if ("FREE".equals(tType) && !isSubscriber) {
                matches = true;
            } else if ("SPECIFIC".equals(tType)) {
                if (searchMemId != null && searchMemId.equalsIgnoreCase(n.getTargetMembershipId())) {
                    matches = true;
                } else if (cleanPhone != null && n.getTargetMobile() != null && n.getTargetMobile().replaceAll("\\D", "").contains(cleanPhone)) {
                    matches = true;
                }
            }
            if (matches) {
                String timeStr = n.getCreatedAt() != null ? n.getCreatedAt().format(timeFmt) : "Recent";
                list.add(new NotificationDto(
                        n.getId() != null ? n.getId() : idCounter++,
                        n.getType() != null ? n.getType() : "tag",
                        n.getTitle(),
                        n.getDescription(),
                        timeStr
                ));
            }
        }

        // 3. User account dynamic alerts (if profile exists and is subscriber)
        if (profile != null) {
            String tier = profile.getSubscriptionTier();
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

                // User's available coupons
                List<Coupon> userCoupons = couponRepository.findByMembershipIdAndStatus(profile.getMembershipId(), "available");
                for (Coupon c : userCoupons) {
                    if (list.size() >= 15) break;
                    list.add(new NotificationDto(
                            idCounter++,
                            "tag",
                            c.getName(),
                            c.getSubtitle() + " · Valid at " + c.getOutlet(),
                            "Expires " + c.getExpiryDate()
                    ));
                }
            }

            // User's reservations
            if (cleanPhone != null && !cleanPhone.isEmpty()) {
                for (Reservation r : reservationRepository.findAllByOrderByCreatedAtDesc()) {
                    String rPhone = r.getCustomerMobile() != null ? r.getCustomerMobile().replaceAll("\\D", "") : "";
                    if (!rPhone.isEmpty() && (rPhone.equals(cleanPhone) || (rPhone.length() >= 10 && rPhone.endsWith(cleanPhone)))) {
                        list.add(new NotificationDto(
                                idCounter++,
                                "calendar",
                                "Reservation " + r.getStatus(),
                                "Table for " + r.getGuests() + " at " + r.getOutlet() + " (" + r.getReservationTime() + ")",
                                r.getCreatedAt() != null ? "Confirmed" : "Recent"
                        ));
                        if (list.size() >= 15) break;
                    }
                }
            }
        }

        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
