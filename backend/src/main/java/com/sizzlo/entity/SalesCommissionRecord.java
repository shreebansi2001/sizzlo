package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_commission_records")
public class SalesCommissionRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "staff_id")
    private String staffId;

    @Column(name = "staff_name")
    private String staffName;

    private String channel;

    @Column(name = "branch_name")
    private String branchName;

    @Column(name = "customer_mobile")
    private String customerMobile;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "plan_tier")
    private String planTier;

    @Column(name = "plan_fee")
    private Double planFee;

    @Column(name = "commission_amount")
    private Double commissionAmount;

    @Column(name = "bonus_multiplier")
    private Double bonusMultiplier = 1.0;

    @Column(name = "target_month")
    private String targetMonth;

    @Column(name = "payout_status")
    private String payoutStatus;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public SalesCommissionRecord() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }

    public String getChannel() { return channel; }
    public void setChannel(String channel) { this.channel = channel; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getPlanTier() { return planTier; }
    public void setPlanTier(String planTier) { this.planTier = planTier; }

    public Double getPlanFee() { return planFee; }
    public void setPlanFee(Double planFee) { this.planFee = planFee; }

    public Double getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(Double commissionAmount) { this.commissionAmount = commissionAmount; }

    public Double getBonusMultiplier() { return bonusMultiplier; }
    public void setBonusMultiplier(Double bonusMultiplier) { this.bonusMultiplier = bonusMultiplier; }

    public String getTargetMonth() { return targetMonth; }
    public void setTargetMonth(String targetMonth) { this.targetMonth = targetMonth; }

    public String getPayoutStatus() { return payoutStatus; }
    public void setPayoutStatus(String payoutStatus) { this.payoutStatus = payoutStatus; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
