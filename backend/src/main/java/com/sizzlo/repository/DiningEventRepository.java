package com.sizzlo.repository;

import com.sizzlo.entity.DiningEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DiningEventRepository extends JpaRepository<DiningEvent, Long> {
    List<DiningEvent> findByStatusOrderByCreatedAtDesc(String status);
    List<DiningEvent> findAllByOrderByCreatedAtDesc();
}
