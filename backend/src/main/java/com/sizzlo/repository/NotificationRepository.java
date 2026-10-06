package com.sizzlo.repository;

import com.sizzlo.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    List<NotificationEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT n FROM NotificationEntity n WHERE n.targetType = 'ALL' " +
           "OR (:membershipId IS NOT NULL AND n.targetMembershipId = :membershipId) " +
           "OR (:mobile IS NOT NULL AND n.targetMobile LIKE %:mobile%) " +
           "ORDER BY n.createdAt DESC")
    List<NotificationEntity> findUserNotifications(
            @Param("membershipId") String membershipId,
            @Param("mobile") String mobile
    );
}
