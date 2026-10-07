package com.sizzlo.repository;

import com.sizzlo.entity.OutletTimeSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OutletTimeSlotRepository extends JpaRepository<OutletTimeSlot, Long> {
    List<OutletTimeSlot> findByActiveTrueOrderByDisplayOrderAsc();
    List<OutletTimeSlot> findByOutletAndActiveTrueOrderByDisplayOrderAsc(String outlet);
    List<OutletTimeSlot> findAllByOrderByDisplayOrderAsc();
    List<OutletTimeSlot> findByOutletOrderByDisplayOrderAsc(String outlet);
}
