package com.sizzlo.repository;

import com.sizzlo.entity.Outlet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OutletRepository extends JpaRepository<Outlet, Long> {
    Optional<Outlet> findByNameIgnoreCase(String name);
    List<Outlet> findByIsUpcoming(Boolean isUpcoming);
    List<Outlet> findByBrand(String brand);
    List<Outlet> findByIsUpcomingAndBrand(Boolean isUpcoming, String brand);
}
