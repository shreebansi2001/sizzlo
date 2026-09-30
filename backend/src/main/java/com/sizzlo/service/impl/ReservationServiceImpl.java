package com.sizzlo.service.impl;

import com.sizzlo.dto.ReservationRequest;
import com.sizzlo.entity.Reservation;
import com.sizzlo.exception.ResourceNotFoundException;
import com.sizzlo.repository.ReservationRepository;
import com.sizzlo.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;

    @Autowired
    public ReservationServiceImpl(ReservationRepository reservationRepository) {
        this.reservationRepository = reservationRepository;
    }

    @Override
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAllByOrderByCreatedAtDesc();
    }

    @Override
    public List<Reservation> getCustomerReservations(String mobile) {
        return reservationRepository.findByCustomerMobileOrderByCreatedAtDesc(mobile);
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
        return reservationRepository.save(reservation);
    }

    @Override
    public Reservation updateStatus(Long id, String status) {
        Reservation existing = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found with id: " + id));
        existing.setStatus(status);
        return reservationRepository.save(existing);
    }
}
