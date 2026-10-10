package com.sizzlo.repository;

import com.sizzlo.entity.SalesCommissionRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesCommissionRecordRepository extends JpaRepository<SalesCommissionRecord, Long> {
    List<SalesCommissionRecord> findByTargetMonth(String targetMonth);
    List<SalesCommissionRecord> findAllByOrderByCreatedAtDesc();
}
