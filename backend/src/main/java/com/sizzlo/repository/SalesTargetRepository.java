package com.sizzlo.repository;

import com.sizzlo.entity.SalesTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalesTargetRepository extends JpaRepository<SalesTarget, Long> {
    Optional<SalesTarget> findByTargetMonth(String targetMonth);
    Optional<SalesTarget> findFirstByOrderByTargetMonthDesc();
}
