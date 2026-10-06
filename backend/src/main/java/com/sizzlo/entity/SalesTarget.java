package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sales_targets")
public class SalesTarget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "target_month", nullable = false)
    private String targetMonth; // e.g. "OCT-2026"

    @Column(name = "master_target_revenue", nullable = false)
    private Double masterTargetRevenue; // e.g. 2000000.0

    @Column(name = "floor_target_revenue", nullable = false)
    private Double floorTargetRevenue; // e.g. 1000000.0

    @Column(name = "corporate_target_revenue", nullable = false)
    private Double corporateTargetRevenue; // e.g. 1000000.0

    @Column(name = "floor_achieved_revenue")
    private Double floorAchievedRevenue;

    @Column(name = "corporate_achieved_revenue")
    private Double corporateAchievedRevenue;

    @Column(name = "floor_plans_sold")
    private Integer floorPlansSold;

    @Column(name = "corporate_plans_sold")
    private Integer corporatePlansSold;

    @Column(name = "is_payroll_approved")
    private Boolean payrollApproved;

    @Column(name = "payroll_approved_at")
    private LocalDateTime payrollApprovedAt;

    @PrePersist
    public void prePersist() {
        if (floorAchievedRevenue == null) floorAchievedRevenue = 0.0;
        if (corporateAchievedRevenue == null) corporateAchievedRevenue = 0.0;
        if (floorPlansSold == null) floorPlansSold = 0;
        if (corporatePlansSold == null) corporatePlansSold = 0;
        if (payrollApproved == null) payrollApproved = false;
    }

    public SalesTarget() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTargetMonth() { return targetMonth; }
    public void setTargetMonth(String targetMonth) { this.targetMonth = targetMonth; }

    public Double getMasterTargetRevenue() { return masterTargetRevenue; }
    public void setMasterTargetRevenue(Double masterTargetRevenue) { this.masterTargetRevenue = masterTargetRevenue; }

    public Double getFloorTargetRevenue() { return floorTargetRevenue; }
    public void setFloorTargetRevenue(Double floorTargetRevenue) { this.floorTargetRevenue = floorTargetRevenue; }

    public Double getCorporateTargetRevenue() { return corporateTargetRevenue; }
    public void setCorporateTargetRevenue(Double corporateTargetRevenue) { this.corporateTargetRevenue = corporateTargetRevenue; }

    public Double getFloorAchievedRevenue() { return floorAchievedRevenue; }
    public void setFloorAchievedRevenue(Double floorAchievedRevenue) { this.floorAchievedRevenue = floorAchievedRevenue; }

    public Double getCorporateAchievedRevenue() { return corporateAchievedRevenue; }
    public void setCorporateAchievedRevenue(Double corporateAchievedRevenue) { this.corporateAchievedRevenue = corporateAchievedRevenue; }

    public Integer getFloorPlansSold() { return floorPlansSold; }
    public void setFloorPlansSold(Integer floorPlansSold) { this.floorPlansSold = floorPlansSold; }

    public Integer getCorporatePlansSold() { return corporatePlansSold; }
    public void setCorporatePlansSold(Integer corporatePlansSold) { this.corporatePlansSold = corporatePlansSold; }

    public Boolean getPayrollApproved() { return payrollApproved; }
    public void setPayrollApproved(Boolean payrollApproved) { this.payrollApproved = payrollApproved; }

    public LocalDateTime getPayrollApprovedAt() { return payrollApprovedAt; }
    public void setPayrollApprovedAt(LocalDateTime payrollApprovedAt) { this.payrollApprovedAt = payrollApprovedAt; }
}
