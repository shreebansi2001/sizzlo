package com.sizzlo.repository;

import com.sizzlo.entity.FloorTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FloorTableRepository extends JpaRepository<FloorTable, Long> {
    List<FloorTable> findAllByOrderByTableNumberAsc();
    List<FloorTable> findByOutletNameOrderByTableNumberAsc(String outletName);
    List<FloorTable> findByOutletNameAndFloorSectionOrderByTableNumberAsc(String outletName, String floorSection);
    Optional<FloorTable> findByTableNumber(Integer tableNumber);
    Optional<FloorTable> findByTableNumberAndOutletName(Integer tableNumber, String outletName);
    boolean existsByTableNumberAndOutletName(Integer tableNumber, String outletName);
}
