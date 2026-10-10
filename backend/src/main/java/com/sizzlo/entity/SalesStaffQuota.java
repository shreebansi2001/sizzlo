package com.sizzlo.entity;

import javax.persistence.*;

@Entity
@Table(name = "sales_staff_quotas")
public class SalesStaffQuota {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "staff_id")
    private String staffId;

    @Column(name = "staff_name")
    private String staffName;

    @Column(name = "role_type")
    private String roleType;

    @Column(name = "branch_name")
    private String branchName;

    @Column(name = "target_month")
    private String targetMonth;

    @Column(name = "target_revenue")
    private Double targetRevenue;

    @Column(name = "target_count")
    private Integer targetCount;

    @Column(name = "achieved_revenue")
    private Double achievedRevenue;

    @Column(name = "achieved_count")
    private Integer achievedCount;

    @Column(name = "calculated_commission")
    private Double calculatedCommission;

    @Column(name = "bonus_earned")
    private Double bonusEarned;

    public SalesStaffQuota() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getStaffId() { return staffId; }
    public void setStaffId(String staffId) { this.staffId = staffId; }

    public String getStaffName() { return staffName; }
    public void setStaffName(String staffName) { this.staffName = staffName; }

    public String getRoleType() { return roleType; }
    public void setRoleType(String roleType) { this.roleType = roleType; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public String getTargetMonth() { return targetMonth; }
    public void setTargetMonth(String targetMonth) { this.targetMonth = targetMonth; }

    public Double getTargetRevenue() { return targetRevenue; }
    public void setTargetRevenue(Double targetRevenue) { this.targetRevenue = targetRevenue; }

    public Integer getTargetCount() { return targetCount; }
    public void setTargetCount(Integer targetCount) { this.targetCount = targetCount; }

    public Double getAchievedRevenue() { return achievedRevenue; }
    public void setAchievedRevenue(Double achievedRevenue) { this.achievedRevenue = achievedRevenue; }

    public Integer getAchievedCount() { return achievedCount; }
    public void setAchievedCount(Integer achievedCount) { this.achievedCount = achievedCount; }

    public Double getCalculatedCommission() { return calculatedCommission; }
    public void setCalculatedCommission(Double calculatedCommission) { this.calculatedCommission = calculatedCommission; }

    public Double getBonusEarned() { return bonusEarned; }
    public void setBonusEarned(Double bonusEarned) { this.bonusEarned = bonusEarned; }
}
