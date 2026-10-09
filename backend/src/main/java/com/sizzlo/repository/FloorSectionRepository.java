package com.sizzlo.repository;

import com.sizzlo.entity.FloorSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FloorSectionRepository extends JpaRepository<FloorSection, Long> {
    List<FloorSection> findByOutletNameOrderByNameAsc(String outletName);
    boolean existsByNameAndOutletName(String name, String outletName);
}
