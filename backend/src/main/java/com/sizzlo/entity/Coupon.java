package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "coupons")
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", unique = true, nullable = false)
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

    private String status; // "available", "used", "expired"

    private String outlet; // e.g. "All Yanki Outlets", "Yanki Signature"

    private String color;  // "royal", "gold"

    @Column(name = "terms_and_conditions", length = 1000)
    private String termsAndConditions;

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

    public String getTermsAndConditions() { return termsAndConditions; }
    public void setTermsAndConditions(String termsAndConditions) { this.termsAndConditions = termsAndConditions; }
}
