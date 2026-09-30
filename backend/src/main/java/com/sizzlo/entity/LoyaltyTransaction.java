package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "loyalty_transactions")
public class LoyaltyTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "membership_id", nullable = false)
    private String membershipId;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(nullable = false)
    private Integer points; // positive for earned, negative for redeemed

    private String type; // "EARN", "REDEEM", "BONUS"

    @Column(name = "outlet_name")
    private String outletName;

    @Column(name = "transaction_time")
    private LocalDateTime transactionTime;

    @PrePersist
    public void prePersist() {
        if (transactionTime == null) {
            transactionTime = LocalDateTime.now();
        }
    }

    public LoyaltyTransaction() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMembershipId() { return membershipId; }
    public void setMembershipId(String membershipId) { this.membershipId = membershipId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getOutletName() { return outletName; }
    public void setOutletName(String outletName) { this.outletName = outletName; }

    public LocalDateTime getTransactionTime() { return transactionTime; }
    public void setTransactionTime(LocalDateTime transactionTime) { this.transactionTime = transactionTime; }
}
