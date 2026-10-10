package com.sizzlo.repository;

import com.sizzlo.entity.SalesStaffQuota;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalesStaffQuotaRepository extends JpaRepository<SalesStaffQuota, Long> {
    List<SalesStaffQuota> findByTargetMonth(String targetMonth);
    Optional<SalesStaffQuota> findByStaffIdAndTargetMonth(String staffId, String targetMonth);
}
