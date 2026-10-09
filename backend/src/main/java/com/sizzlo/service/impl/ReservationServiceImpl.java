package com.sizzlo.service.impl;

import com.sizzlo.dto.ReservationRequest;
import com.sizzlo.entity.ActivityLog;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.entity.Reservation;
import com.sizzlo.exception.ResourceNotFoundException;
import com.sizzlo.repository.ActivityLogRepository;
import com.sizzlo.repository.MemberProfileRepository;
import com.sizzlo.repository.ReservationRepository;
import com.sizzlo.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.sizzlo.entity.NotificationEntity;
import com.sizzlo.repository.NotificationRepository;
import com.sizzlo.service.CommonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final ActivityLogRepository activityLogRepository;
    private final MemberProfileRepository memberProfileRepository;
    private final NotificationRepository notificationRepository;
    private final CommonService commonService;

    @Autowired
    public ReservationServiceImpl(ReservationRepository reservationRepository,
                                  ActivityLogRepository activityLogRepository,
                                  MemberProfileRepository memberProfileRepository,
                                  NotificationRepository notificationRepository,
                                  CommonService commonService) {
        this.reservationRepository = reservationRepository;
        this.activityLogRepository = activityLogRepository;
        this.memberProfileRepository = memberProfileRepository;
        this.notificationRepository = notificationRepository;
        this.commonService = commonService;
    }

    @Override
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Reservation> getCustomerReservations(String mobile) {
        if (mobile == null || mobile.trim().isEmpty()) {
            return reservationRepository.findAllByOrderByCreatedAtDesc();
        }
        String cleanPhone = mobile.replaceAll("\\D", "");
        if (cleanPhone.length() > 10) {
            cleanPhone = cleanPhone.substring(cleanPhone.length() - 10);
        }

        List<Reservation> matched = new ArrayList<>();
        for (Reservation r : reservationRepository.findAllByOrderByCreatedAtDesc()) {
            String rPhone = r.getCustomerMobile().replaceAll("\\D", "");
            if (rPhone.equals(cleanPhone) || (rPhone.length() >= 10 && rPhone.endsWith(cleanPhone))) {
                matched.add(r);
            }
        }
        return matched.isEmpty() ? reservationRepository.findByCustomerMobileOrderByCreatedAtDesc(mobile) : matched;
    }

    @Override
    public Reservation createReservation(ReservationRequest request) {
        Reservation reservation = new Reservation();
        reservation.setBookingReference("R-" + (1000 + (int)(Math.random() * 9000)));
        reservation.setCustomerName(request.getCustomerName());
        reservation.setCustomerMobile(request.getCustomerMobile());
        reservation.setOutlet(request.getOutlet());
        reservation.setReservationTime(request.getReservationTime());
        reservation.setGuests(request.getGuests());
        reservation.setSpecialRequests(request.getSpecialRequests());
        reservation.setOccasionTag(request.getOccasionTag() != null ? request.getOccasionTag() : "Regular");
        reservation.setStatus("Confirmed");

        // Determine if customer is an active VIP subscriber or non-subscribed guest
        boolean isVip = Boolean.TRUE.equals(request.getVip());
        String tier = request.getTierPriorityTag();
        if (request.getCustomerMobile() != null) {
            String cleanDigits = request.getCustomerMobile().replaceAll("\\D", "");
            if (cleanDigits.length() > 10) cleanDigits = cleanDigits.substring(cleanDigits.length() - 10);
            for (MemberProfile m : memberProfileRepository.findAll()) {
                String mDigits = m.getMobile() != null ? m.getMobile().replaceAll("\\D", "") : "";
                if (!cleanDigits.isEmpty() && (mDigits.equals(cleanDigits) || mDigits.endsWith(cleanDigits))) {
                    String subTier = m.getSubscriptionTier();
                    if (subTier != null && !subTier.equalsIgnoreCase("REGISTERED") && !subTier.equalsIgnoreCase("NONE")) {
                        isVip = true;
                        if (tier == null || tier.isEmpty()) tier = subTier;
                    }
                    break;
                }
            }
        }

        reservation.setVip(isVip);
        reservation.setTierPriorityTag(isVip ? (tier != null ? tier : "Signature") : "Non-Subscriber");
        // Subscribed members pay nominal booking charge (₹99) which is 100% deducted from final dining bill
        double advanceAmount = request.getBookingAdvance() != null ? request.getBookingAdvance() : 99.0;
        reservation.setBookingAdvance(advanceAmount);
        reservation.setAdvancePaid(true);
        reservation.setAdvanceDeducted(false);

        Reservation saved = reservationRepository.save(reservation);

        // Record in Admin activity log
        ActivityLog log = new ActivityLog();
        log.setActorName(saved.getCustomerName());
        log.setActionType("RESERVATION");
        log.setDescription((saved.getVip() ? "[VIP Priority] " : "[Guest Table] ") + "Booked for " + saved.getGuests() + " at " + saved.getOutlet() + " (" + saved.getReservationTime() + ")");
        log.setOutletName(saved.getOutlet());
        log.setTimeAgo("Just now");
        log.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(log);

        // 1. Save In-App Notification for user
        try {
            NotificationEntity notif = new NotificationEntity(
                    "calendar",
                    "Table Reservation Confirmed!",
                    "Table for " + saved.getGuests() + " at " + saved.getOutlet() + " (" + saved.getReservationTime() + ") confirmed. Ref: " + saved.getBookingReference() + ". Advance: ₹" + String.format("%.0f", saved.getBookingAdvance()) + " (deductible on bill).",
                    "SPECIFIC",
                    null,
                    saved.getCustomerMobile(),
                    true
            );
            notificationRepository.save(notif);
        } catch (Exception ignored) {}

        // 2. Dispatch WhatsApp Notification to customer
        try {
            if (saved.getCustomerMobile() != null && !saved.getCustomerMobile().trim().isEmpty()) {
                String title = "Table Reservation Confirmed - Sizzlo";
                String body = "Dear " + saved.getCustomerName() + ", your table for " + saved.getGuests() + " at " + saved.getOutlet() + " (" + saved.getReservationTime() + ") is confirmed! Booking Ref: " + saved.getBookingReference() + ". Advance paid ₹" + String.format("%.0f", saved.getBookingAdvance()) + " will be deducted from your final bill. See you soon!";
                commonService.sendNotificationWhatsApp(saved.getCustomerMobile(), title, body);
            }
        } catch (Exception ignored) {}

        return saved;
    }

    @Override
    public Reservation updateStatus(Long id, String status) {
        Reservation existing = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
        existing.setStatus(status);
        Reservation saved = reservationRepository.save(existing);

        ActivityLog log = new ActivityLog();
        log.setActorName(saved.getCustomerName());
        log.setActionType("RESERVATION");
        log.setDescription("Reservation " + saved.getBookingReference() + " marked as " + status);
        log.setOutletName(saved.getOutlet());
        log.setTimeAgo("Just now");
        log.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(log);

        return saved;
    }
}

