package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "member_profiles")
public class MemberProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "membership_id", unique = true, nullable = false)
    private String membershipId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "first_name")
    private String firstName;

    @Column(nullable = false)
    private String mobile;

    private String email;

    @Column(name = "membership_type")
    private String membershipType; // e.g. "VIP MEMBER", "BLACK DIAMOND"

    private String status; // "Active", "Renewal Due", "Expired"

    @Column(name = "issued_date")
    private LocalDate issuedDate;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "total_savings")
    private Integer totalSavings;

    @Column(name = "coupons_used")
    private Integer couponsUsed;

    @Column(name = "coupons_total")
    private Integer couponsTotal;

    @Column(name = "loyalty_points")
    private Integer loyaltyPoints;

    @Column(name = "loyalty_goal")
    private Integer loyaltyGoal;

    @Column(name = "pending_dues")
    private Integer pendingDues;

    @Column(name = "total_spend")
    private Integer totalSpend;

    @Column(name = "last_visit")
    private String lastVisit;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (totalSavings == null) totalSavings = 0;
        if (couponsUsed == null) couponsUsed = 0;
        if (couponsTotal == null) couponsTotal = 12;
        if (loyaltyPoints == null) loyaltyPoints = 0;
        if (loyaltyGoal == null) loyaltyGoal = 250000;
        if (pendingDues == null) pendingDues = 0;
        if (totalSpend == null) totalSpend = 0;
    }

    public MemberProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMembershipId() { return membershipId; }
    public void setMembershipId(String membershipId) { this.membershipId = membershipId; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMembershipType() { return membershipType; }
    public void setMembershipType(String membershipType) { this.membershipType = membershipType; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDate getIssuedDate() { return issuedDate; }
    public void setIssuedDate(LocalDate issuedDate) { this.issuedDate = issuedDate; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public Integer getTotalSavings() { return totalSavings; }
    public void setTotalSavings(Integer totalSavings) { this.totalSavings = totalSavings; }

    public Integer getCouponsUsed() { return couponsUsed; }
    public void setCouponsUsed(Integer couponsUsed) { this.couponsUsed = couponsUsed; }

    public Integer getCouponsTotal() { return couponsTotal; }
    public void setCouponsTotal(Integer couponsTotal) { this.couponsTotal = couponsTotal; }

    public Integer getLoyaltyPoints() { return loyaltyPoints; }
    public void setLoyaltyPoints(Integer loyaltyPoints) { this.loyaltyPoints = loyaltyPoints; }

    public Integer getLoyaltyGoal() { return loyaltyGoal; }
    public void setLoyaltyGoal(Integer loyaltyGoal) { this.loyaltyGoal = loyaltyGoal; }

    public Integer getPendingDues() { return pendingDues; }
    public void setPendingDues(Integer pendingDues) { this.pendingDues = pendingDues; }

    public Integer getTotalSpend() { return totalSpend; }
    public void setTotalSpend(Integer totalSpend) { this.totalSpend = totalSpend; }

    public String getLastVisit() { return lastVisit; }
    public void setLastVisit(String lastVisit) { this.lastVisit = lastVisit; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
