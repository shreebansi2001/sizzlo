package com.sizzlo.repository;

import com.sizzlo.entity.BanquetInquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BanquetInquiryRepository extends JpaRepository<BanquetInquiry, Long> {
    List<BanquetInquiry> findAllByOrderByCreatedAtDesc();
    List<BanquetInquiry> findByStatusOrderByCreatedAtDesc(String status);
    List<BanquetInquiry> findByCustomerMobileOrderByCreatedAtDesc(String customerMobile);
}
