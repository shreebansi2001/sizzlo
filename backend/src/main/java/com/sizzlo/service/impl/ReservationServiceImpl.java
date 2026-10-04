package com.sizzlo.service.impl;

import com.sizzlo.dto.ReservationRequest;
import com.sizzlo.entity.ActivityLog;
import com.sizzlo.entity.Reservation;
import com.sizzlo.exception.ResourceNotFoundException;
import com.sizzlo.repository.ActivityLogRepository;
import com.sizzlo.repository.ReservationRepository;
import com.sizzlo.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final ActivityLogRepository activityLogRepository;

    @Autowired
    public ReservationServiceImpl(ReservationRepository reservationRepository,
                                  ActivityLogRepository activityLogRepository) {
        this.reservationRepository = reservationRepository;
        this.activityLogRepository = activityLogRepository;
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
        reservation.setVip(request.getVip() != null && request.getVip());
        reservation.setSpecialRequests(request.getSpecialRequests());
        reservation.setStatus("Confirmed");

        Reservation saved = reservationRepository.save(reservation);

        // Record in Admin activity log
        ActivityLog log = new ActivityLog();
        log.setActorName(saved.getCustomerName());
        log.setActionType("RESERVATION");
        log.setDescription("VIP Table booked for " + saved.getGuests() + " at " + saved.getOutlet() + " (" + saved.getReservationTime() + ")");
        log.setOutletName(saved.getOutlet());
        log.setTimeAgo("Just now");
        log.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(log);

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

