package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
public class NotificationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type; // 'gift', 'tag', 'sparkle', 'alert', 'calendar', 'bill', 'card'

    @Column(nullable = false)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "target_type")
    private String targetType; // "ALL" or "SPECIFIC"

    @Column(name = "target_membership_id")
    private String targetMembershipId;

    @Column(name = "target_mobile")
    private String targetMobile;

    @Column(name = "sent_via_whatsapp")
    private Boolean sentViaWhatsApp = false;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public NotificationEntity() {}

    public NotificationEntity(String type, String title, String description, String targetType, String targetMembershipId, String targetMobile, Boolean sentViaWhatsApp) {
        this.type = type != null ? type : "tag";
        this.title = title;
        this.description = description;
        this.targetType = targetType != null ? targetType : "ALL";
        this.targetMembershipId = targetMembershipId;
        this.targetMobile = targetMobile;
        this.sentViaWhatsApp = sentViaWhatsApp != null ? sentViaWhatsApp : false;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTargetType() {
        return targetType;
    }

    public void setTargetType(String targetType) {
        this.targetType = targetType;
    }

    public String getTargetMembershipId() {
        return targetMembershipId;
    }

    public void setTargetMembershipId(String targetMembershipId) {
        this.targetMembershipId = targetMembershipId;
    }

    public String getTargetMobile() {
        return targetMobile;
    }

    public void setTargetMobile(String targetMobile) {
        this.targetMobile = targetMobile;
    }

    public Boolean getSentViaWhatsApp() {
        return sentViaWhatsApp;
    }

    public void setSentViaWhatsApp(Boolean sentViaWhatsApp) {
        this.sentViaWhatsApp = sentViaWhatsApp;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
