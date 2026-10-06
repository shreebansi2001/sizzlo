package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banquet_inquiries")
public class BanquetInquiry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_mobile", nullable = false)
    private String customerMobile;

    private String email;

    @Column(name = "event_category", nullable = false)
    private String eventCategory; // Wedding, Sangeet, Corporate Seminar, Anniversary, Birthday, Lawn Outdoor Catering

    @Column(name = "event_date", nullable = false)
    private String eventDate;

    @Column(name = "event_shift", nullable = false)
    private String eventShift; // Lunch, Dinner

    @Column(name = "estimated_pax", nullable = false)
    private Integer estimatedPax;

    @Column(name = "custom_requirements", length = 1000)
    private String customRequirements;

    @Column(name = "status", nullable = false)
    private String status; // NEW, ASSIGNED, IN_PROGRESS, CONFIRMED, CLOSED

    @Column(name = "assigned_to")
    private String assignedTo; // Sales Representative / Event Desk

    @Column(name = "membership_tier")
    private String membershipTier; // CLASSIC, SIGNATURE, ELITE, NON_SUBSCRIBER

    @Column(name = "zero_points_acknowledged")
    private Boolean zeroPointsAcknowledged;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "NEW";
        if (zeroPointsAcknowledged == null) zeroPointsAcknowledged = true;
        if (eventCategory == null) eventCategory = "Wedding";
        if (eventDate == null) eventDate = "2026-11-20";
        if (eventShift == null) eventShift = "Dinner";
        if (estimatedPax == null) estimatedPax = 50;
    }

    public BanquetInquiry() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getEventCategory() { return eventCategory; }
    public void setEventCategory(String eventCategory) { this.eventCategory = eventCategory; }

    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }
    public void setTargetDate(String targetDate) { this.eventDate = targetDate; }

    public String getEventShift() { return eventShift; }
    public void setEventShift(String eventShift) { this.eventShift = eventShift; }
    public void setShift(String shift) { this.eventShift = shift; }

    public Integer getEstimatedPax() { return estimatedPax; }
    public void setEstimatedPax(Integer estimatedPax) { this.estimatedPax = estimatedPax; }
    public void setPaxCount(Integer paxCount) { this.estimatedPax = paxCount; }

    public String getCustomRequirements() { return customRequirements; }
    public void setCustomRequirements(String customRequirements) { this.customRequirements = customRequirements; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getAssignedTo() { return assignedTo; }
    public void setAssignedTo(String assignedTo) { this.assignedTo = assignedTo; }

    public String getMembershipTier() { return membershipTier; }
    public void setMembershipTier(String membershipTier) { this.membershipTier = membershipTier; }

    public Boolean getZeroPointsAcknowledged() { return zeroPointsAcknowledged; }
    public void setZeroPointsAcknowledged(Boolean zeroPointsAcknowledged) { this.zeroPointsAcknowledged = zeroPointsAcknowledged; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
