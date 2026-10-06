package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "corporate_leads")
public class CorporateLead {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "gst_number")
    private String gstNumber;

    @Column(name = "contact_person", nullable = false)
    private String contactPerson;

    @Column(name = "contact_mobile", nullable = false)
    private String contactMobile;

    private String email;

    @Column(name = "employee_count", nullable = false)
    private Integer employeeCount;

    @Column(name = "plan_tier", nullable = false)
    private String planTier; // CLASSIC, SIGNATURE, ELITE

    @Column(name = "deal_value", nullable = false)
    private Double dealValue;

    @Column(name = "stage", nullable = false)
    private String stage; // NEW_LEAD, PROPOSAL_SENT, NEGOTIATION, CLOSED_WON, REJECTED

    @Column(name = "assigned_bde_id")
    private String assignedBdeId;

    @Column(name = "assigned_bde_name")
    private String assignedBdeName;

    @Column(name = "tl_approved")
    private Boolean tlApproved;

    @Column(name = "notes", length = 1000)
    private String notes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "closed_at")
    private LocalDateTime closedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (stage == null) stage = "NEW_LEAD";
        if (tlApproved == null) tlApproved = false;
        if (dealValue == null) dealValue = 0.0;
    }

    public CorporateLead() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }

    public String getGstNumber() { return gstNumber; }
    public void setGstNumber(String gstNumber) { this.gstNumber = gstNumber; }

    public String getContactPerson() { return contactPerson; }
    public void setContactPerson(String contactPerson) { this.contactPerson = contactPerson; }

    public String getContactMobile() { return contactMobile; }
    public void setContactMobile(String contactMobile) { this.contactMobile = contactMobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getEmployeeCount() { return employeeCount; }
    public void setEmployeeCount(Integer employeeCount) { this.employeeCount = employeeCount; }

    public String getPlanTier() { return planTier; }
    public void setPlanTier(String planTier) { this.planTier = planTier; }

    public Double getDealValue() { return dealValue; }
    public void setDealValue(Double dealValue) { this.dealValue = dealValue; }

    public String getStage() { return stage; }
    public void setStage(String stage) { this.stage = stage; }

    public String getAssignedBdeId() { return assignedBdeId; }
    public void setAssignedBdeId(String assignedBdeId) { this.assignedBdeId = assignedBdeId; }

    public String getAssignedBdeName() { return assignedBdeName; }
    public void setAssignedBdeName(String assignedBdeName) { this.assignedBdeName = assignedBdeName; }

    public Boolean getTlApproved() { return tlApproved; }
    public void setTlApproved(Boolean tlApproved) { this.tlApproved = tlApproved; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getClosedAt() { return closedAt; }
    public void setClosedAt(LocalDateTime closedAt) { this.closedAt = closedAt; }
}
