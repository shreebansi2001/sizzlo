package com.sizzlo.repository;

import com.sizzlo.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    Optional<Reservation> findByBookingReference(String bookingReference);
    List<Reservation> findByCustomerMobileOrderByCreatedAtDesc(String customerMobile);
    List<Reservation> findAllByOrderByCreatedAtDesc();
    List<Reservation> findByOutletIgnoreCase(String outlet);
}
