package com.sizzlo.repository;

import com.sizzlo.entity.DiningEventBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DiningEventBookingRepository extends JpaRepository<DiningEventBooking, Long> {
    List<DiningEventBooking> findByCustomerMobileOrderByCreatedAtDesc(String customerMobile);
    List<DiningEventBooking> findByEventIdOrderByCreatedAtDesc(Long eventId);
    Optional<DiningEventBooking> findByBookingReference(String bookingReference);
    List<DiningEventBooking> findByEventIdAndCustomerMobile(Long eventId, String customerMobile);
    List<DiningEventBooking> findAllByOrderByCreatedAtDesc();
}
