package com.sizzlo.repository;

import com.sizzlo.entity.BillSettlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BillSettlementRepository extends JpaRepository<BillSettlement, Long> {
    List<BillSettlement> findByStatusOrderByCreatedAtDesc(String status);
    List<BillSettlement> findByCustomerMobileOrderByCreatedAtDesc(String customerMobile);
    List<BillSettlement> findByOutletNameOrderByCreatedAtDesc(String outletName);
    List<BillSettlement> findAllByOrderByCreatedAtDesc();
}
