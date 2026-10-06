package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback_tickets")
public class FeedbackTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_mobile", nullable = false)
    private String customerMobile;

    @Column(name = "outlet_name", nullable = false)
    private String outletName;

    @Column(nullable = false)
    private Integer rating; // 1 to 5

    @Column(name = "food_rating")
    private Integer foodRating;

    @Column(name = "service_rating")
    private Integer serviceRating;

    @Column(name = "cleanliness_rating")
    private Integer cleanlinessRating;

    @Column(length = 1000)
    private String comments;

    @Column(name = "is_google_redirected")
    private Boolean isGoogleRedirected; // true if 4 or 5 stars

    @Column(name = "is_urgent_recovery")
    private Boolean isUrgentRecovery; // true if 1, 2, or 3 stars

    @Column(name = "status", nullable = false)
    private String status; // OPEN, CONTACTED, RESOLVED

    @Column(name = "resolution_notes", length = 1000)
    private String resolutionNotes;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "OPEN";
        if (isGoogleRedirected == null) isGoogleRedirected = (rating != null && rating >= 4);
        if (isUrgentRecovery == null) isUrgentRecovery = (rating != null && rating <= 3);
    }

    public FeedbackTicket() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }

    public String getOutletName() { return outletName; }
    public void setOutletName(String outletName) { this.outletName = outletName; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public Integer getFoodRating() { return foodRating; }
    public void setFoodRating(Integer foodRating) { this.foodRating = foodRating; }

    public Integer getServiceRating() { return serviceRating; }
    public void setServiceRating(Integer serviceRating) { this.serviceRating = serviceRating; }

    public Integer getCleanlinessRating() { return cleanlinessRating; }
    public void setCleanlinessRating(Integer cleanlinessRating) { this.cleanlinessRating = cleanlinessRating; }

    public String getComments() { return comments; }
    public void setComments(String comments) { this.comments = comments; }

    public Boolean getIsGoogleRedirected() { return isGoogleRedirected; }
    public void setIsGoogleRedirected(Boolean isGoogleRedirected) { this.isGoogleRedirected = isGoogleRedirected; }

    public Boolean getIsUrgentRecovery() { return isUrgentRecovery; }
    public void setIsUrgentRecovery(Boolean isUrgentRecovery) { this.isUrgentRecovery = isUrgentRecovery; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
