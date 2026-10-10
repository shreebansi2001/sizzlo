package com.sizzlo.repository;

import com.sizzlo.entity.SalesRewardContest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesRewardContestRepository extends JpaRepository<SalesRewardContest, Long> {
    List<SalesRewardContest> findByStatus(String status);
    List<SalesRewardContest> findAllByOrderByCreatedAtDesc();
}
