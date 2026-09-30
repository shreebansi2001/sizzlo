package com.sizzlo.repository;

import com.sizzlo.entity.MemberProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface MemberProfileRepository extends JpaRepository<MemberProfile, Long> {
    Optional<MemberProfile> findByMembershipId(String membershipId);
    Optional<MemberProfile> findByMobile(String mobile);
    List<MemberProfile> findByStatus(String status);
}
