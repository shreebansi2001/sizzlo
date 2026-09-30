package com.sizzlo.service;

import com.sizzlo.dto.ReservationRequest;
import com.sizzlo.entity.Reservation;

import java.util.List;

public interface ReservationService {
    List<Reservation> getAllReservations();
    List<Reservation> getCustomerReservations(String mobile);
    Reservation createReservation(ReservationRequest request);
    Reservation updateStatus(Long id, String status);
}
