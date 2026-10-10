package com.sizzlo.repository;

import com.sizzlo.entity.SalesTrainingModule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesTrainingModuleRepository extends JpaRepository<SalesTrainingModule, Long> {
    List<SalesTrainingModule> findByActiveTrueOrderByCreatedAtDesc();
}
