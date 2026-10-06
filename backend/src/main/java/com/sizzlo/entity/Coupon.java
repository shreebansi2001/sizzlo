package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false)
    private String code;

    @Column(nullable = false)
    private String name;

    private String subtitle;

    private String description;

    @Column(name = "coupons_left")
    private Integer leftCount;

    @Column(name = "coupons_total")
    private Integer totalCount;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    private String status; // "available", "redeemed", "expired"

    private String outlet; // e.g. "All Yanki Outlets", "Yanki Sizzlerr Bodakdev"

    private String color;  // "royal", "gold", "emerald"

    @Column(name = "discount_type")
    private String discountType; // "PERCENT", "FLAT", "BOGO"

    @Column(name = "discount_value")
    private Double discountValue; // e.g. 10.0, 50.0

    @Column(name = "membership_id")
    private String membershipId; // Bound to member, or null for general

    @Column(name = "burned_invoice_number")
    private String burnedInvoiceNumber;

    @Column(name = "burned_cashier_id")
    private String burnedCashierId;

    @Column(name = "burned_at")
    private LocalDateTime burnedAt;

    @Column(name = "terms_and_conditions", length = 1000)
    private String termsAndConditions;

    @PrePersist
    public void prePersist() {
        if (status == null) status = "available";
        if (discountType == null) discountType = "PERCENT";
        if (discountValue == null) discountValue = 10.0;
        if (leftCount == null) leftCount = 1;
        if (totalCount == null) totalCount = 1;
    }

    public Coupon() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getLeftCount() { return leftCount; }
    public void setLeftCount(Integer leftCount) { this.leftCount = leftCount; }

    public Integer getTotalCount() { return totalCount; }
    public void setTotalCount(Integer totalCount) { this.totalCount = totalCount; }

    public LocalDate getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDate expiryDate) { this.expiryDate = expiryDate; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getOutlet() { return outlet; }
    public void setOutlet(String outlet) { this.outlet = outlet; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public Double getDiscountValue() { return discountValue; }
    public void setDiscountValue(Double discountValue) { this.discountValue = discountValue; }

    public String getMembershipId() { return membershipId; }
    public void setMembershipId(String membershipId) { this.membershipId = membershipId; }

    public String getBurnedInvoiceNumber() { return burnedInvoiceNumber; }
    public void setBurnedInvoiceNumber(String burnedInvoiceNumber) { this.burnedInvoiceNumber = burnedInvoiceNumber; }

    public String getBurnedCashierId() { return burnedCashierId; }
    public void setBurnedCashierId(String burnedCashierId) { this.burnedCashierId = burnedCashierId; }

    public LocalDateTime getBurnedAt() { return burnedAt; }
    public void setBurnedAt(LocalDateTime burnedAt) { this.burnedAt = burnedAt; }

    public String getTermsAndConditions() { return termsAndConditions; }
    public void setTermsAndConditions(String termsAndConditions) { this.termsAndConditions = termsAndConditions; }
}
