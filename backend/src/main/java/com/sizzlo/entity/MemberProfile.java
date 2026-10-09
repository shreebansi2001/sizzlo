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

    @Column(nullable = false, unique = true)
    private String mobile;

    private String email;

    @Column(name = "membership_type")
    private String membershipType; // e.g. "REGISTERED USER", "CLASSIC SUBSCRIBER", "SIGNATURE SUBSCRIBER", "ELITE SUBSCRIBER"

    @Column(name = "subscription_tier")
    private String subscriptionTier; // "REGISTERED", "CLASSIC", "SIGNATURE", "ELITE"

    private String status; // "Active", "Renewal Due", "In Grace Period", "Expired"

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

    private String address;

    private String gender;

    private String birthday;

    @Column(name = "dob_locked")
    private Boolean dobLocked; // Mandatory Profile Rule: strictly locked once submitted!

    @Column(name = "spouse_name")
    private String spouseName;

    @Column(name = "spouse_birthday")
    private String spouseBirthday;

    @Column(name = "anniversary_date")
    private String anniversaryDate;

    @Column(name = "is_married")
    private String isMarried;

    @Column(name = "referred_by_staff_id")
    private String referredByStaffId; // Floor Captain Staff ID for incentive attribution

    @Column(name = "corporate_id")
    private Long corporateId;

    @Column(name = "avatar_url")
    private String avatarUrl;

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
        if (loyaltyGoal == null) loyaltyGoal = 25000;
        if (pendingDues == null) pendingDues = 0;
        if (totalSpend == null) totalSpend = 0;
        if (subscriptionTier == null) subscriptionTier = "REGISTERED";
        if (dobLocked == null) dobLocked = false;
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

    public String getSubscriptionTier() { return subscriptionTier; }
    public void setSubscriptionTier(String subscriptionTier) { this.subscriptionTier = subscriptionTier; }

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

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getBirthday() { return birthday; }
    public void setBirthday(String birthday) { this.birthday = birthday; }

    public Boolean getDobLocked() { return dobLocked; }
    public void setDobLocked(Boolean dobLocked) { this.dobLocked = dobLocked; }

    public String getSpouseName() { return spouseName; }
    public void setSpouseName(String spouseName) { this.spouseName = spouseName; }

    public String getSpouseBirthday() { return spouseBirthday; }
    public void setSpouseBirthday(String spouseBirthday) { this.spouseBirthday = spouseBirthday; }

    public String getAnniversaryDate() { return anniversaryDate; }
    public void setAnniversaryDate(String anniversaryDate) { this.anniversaryDate = anniversaryDate; }

    public String getIsMarried() { return isMarried; }
    public void setIsMarried(String isMarried) { this.isMarried = isMarried; }

    @Lob
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    public String getReferredByStaffId() { return referredByStaffId; }
    public void setReferredByStaffId(String referredByStaffId) { this.referredByStaffId = referredByStaffId; }

    public Long getCorporateId() { return corporateId; }
    public void setCorporateId(Long corporateId) { this.corporateId = corporateId; }

    public String getAvatarUrl() { return avatarUrl != null ? avatarUrl : profilePictureUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getProfilePictureUrl() { return profilePictureUrl != null ? profilePictureUrl : avatarUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
}
