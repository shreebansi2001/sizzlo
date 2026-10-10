package com.sizzlo.repository;

import com.sizzlo.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    List<PaymentRecord> findAllByOrderByCreatedAtDesc();
    Optional<PaymentRecord> findByPaymentId(String paymentId);
}
