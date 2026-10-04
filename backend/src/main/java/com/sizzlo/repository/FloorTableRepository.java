package com.sizzlo.repository;

import com.sizzlo.entity.FloorTable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FloorTableRepository extends JpaRepository<FloorTable, Long> {
    List<FloorTable> findAllByOrderByTableNumberAsc();
    Optional<FloorTable> findByTableNumber(Integer tableNumber);
}
