package com.sizzlo.repository;

import com.sizzlo.entity.CorporateLead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CorporateLeadRepository extends JpaRepository<CorporateLead, Long> {
    List<CorporateLead> findAllByOrderByCreatedAtDesc();
    List<CorporateLead> findByStageOrderByCreatedAtDesc(String stage);
    List<CorporateLead> findByAssignedBdeIdOrderByCreatedAtDesc(String assignedBdeId);
}
