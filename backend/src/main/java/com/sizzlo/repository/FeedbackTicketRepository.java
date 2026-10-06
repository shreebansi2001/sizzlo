package com.sizzlo.repository;

import com.sizzlo.entity.FeedbackTicket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackTicketRepository extends JpaRepository<FeedbackTicket, Long> {
    List<FeedbackTicket> findAllByOrderByCreatedAtDesc();
    List<FeedbackTicket> findByIsUrgentRecoveryTrueOrderByCreatedAtDesc();
    List<FeedbackTicket> findByOutletNameOrderByCreatedAtDesc(String outletName);
}
