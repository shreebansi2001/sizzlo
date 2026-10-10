package com.sizzlo.repository;

import com.sizzlo.entity.BanquetHall;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BanquetHallRepository extends JpaRepository<BanquetHall, Long> {
    List<BanquetHall> findByOutletName(String outletName);
    List<BanquetHall> findByStatus(String status);
}
