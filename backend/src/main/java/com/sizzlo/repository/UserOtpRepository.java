package com.sizzlo.repository;

import com.sizzlo.entity.UserOtpEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserOtpRepository extends JpaRepository<UserOtpEntity, Long> {

    Optional<UserOtpEntity> findTopByMobileAndOtpAndIsUsedFalseAndExpiryTimeAfterOrderByCreatedAtDesc(
            String mobile, String otp, LocalDateTime now);

    Optional<UserOtpEntity> findTopByMobileAndIsUsedFalseAndExpiryTimeAfterOrderByCreatedAtDesc(
            String mobile, LocalDateTime now);

    Optional<UserOtpEntity> findTopByEmailAndOtpAndIsUsedFalseAndExpiryTimeAfterOrderByCreatedAtDesc(
            String email, String otp, LocalDateTime now);

    Optional<UserOtpEntity> findTopByEmailAndIsUsedFalseAndExpiryTimeAfterOrderByCreatedAtDesc(
            String email, LocalDateTime now);

    List<UserOtpEntity> findByMobile(String mobile);

    @Transactional
    @Modifying
    @Query("DELETE FROM UserOtpEntity u WHERE u.email = :email AND u.isUsed = true")
    void deleteByEmailAndIsUsedTrue(@Param("email") String email);

    @Transactional
    @Modifying
    @Query("DELETE FROM UserOtpEntity u WHERE u.mobile = :mobile AND u.isUsed = true")
    void deleteByMobileAndIsUsedTrue(@Param("mobile") String mobile);

    @Transactional
    @Modifying
    @Query("UPDATE UserOtpEntity u SET u.isUsed = true WHERE u.mobile = :mobile AND u.isUsed = false")
    void invalidatePreviousOtpsByMobile(@Param("mobile") String mobile);

    @Transactional
    @Modifying
    @Query("UPDATE UserOtpEntity u SET u.isUsed = true WHERE u.email = :email AND u.isUsed = false")
    void invalidatePreviousOtpsByEmail(@Param("email") String email);
}
