package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_otps")
public class UserOtpEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String mobile;

    private String email;

    @Column(nullable = false, length = 10)
    private String otp;

    @Column(nullable = false)
    private Boolean isUsed = false;

    @Column(nullable = false)
    private LocalDateTime expiryTime;

    private LocalDateTime createdAt;

    @PrePersist
    public void onPrePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now(java.time.ZoneId.of("Asia/Kolkata"));
        }
    }

    public UserOtpEntity() {}

    public UserOtpEntity(String mobile, String email, String otp, LocalDateTime expiryTime) {
        this.mobile = mobile;
        this.email = email;
        this.otp = otp;
        this.isUsed = false;
        this.expiryTime = expiryTime;
        this.createdAt = LocalDateTime.now(java.time.ZoneId.of("Asia/Kolkata"));
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }

    public Boolean getIsUsed() { return isUsed; }
    public void setIsUsed(Boolean used) { isUsed = used; }

    public LocalDateTime getExpiryTime() { return expiryTime; }
    public void setExpiryTime(LocalDateTime expiryTime) { this.expiryTime = expiryTime; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
