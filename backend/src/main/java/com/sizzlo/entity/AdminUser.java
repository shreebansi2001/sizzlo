package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_users")
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "username", unique = true, nullable = false, length = 100)
    private String username;

    @Column(name = "email", nullable = false, length = 120)
    private String email;

    @Column(name = "full_name", nullable = false, length = 120)
    private String fullName;

    @Column(name = "mobile", length = 30)
    private String mobile;

    @Column(name = "password", nullable = false, length = 100)
    private String password = "admin123";

    @Column(name = "role_code", nullable = false, length = 50)
    private String roleCode; // SUPER_ADMIN, BRANCH_ADMIN, MANAGER, FLOOR_CAPTAIN

    @Column(name = "role_name", length = 100)
    private String roleName;

    @Column(name = "branch_name", nullable = false, length = 150)
    private String branchName = "All Branches"; // "All Branches" or specific branch name like "Yanki Sizzlerr Bodakdev"

    @Column(name = "outlet_id")
    private Long outletId; // Nullable if all branches

    @Column(name = "custom_permissions", length = 2000)
    private String customPermissions; // If set, overrides or extends role permissions

    @Column(name = "created_by_username", length = 100)
    private String createdByUsername = "SYSTEM";

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    public AdminUser() {}

    public AdminUser(String username, String email, String fullName, String mobile, String password, String roleCode, String roleName, String branchName, Long outletId, String createdByUsername) {
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.mobile = mobile;
        this.password = password != null ? password : "admin123";
        this.roleCode = roleCode;
        this.roleName = roleName;
        this.branchName = branchName != null ? branchName : "All Branches";
        this.outletId = outletId;
        this.createdByUsername = createdByUsername;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getBranchName() { return branchName; }
    public void setBranchName(String branchName) { this.branchName = branchName; }

    public Long getOutletId() { return outletId; }
    public void setOutletId(Long outletId) { this.outletId = outletId; }

    public String getCustomPermissions() { return customPermissions; }
    public void setCustomPermissions(String customPermissions) { this.customPermissions = customPermissions; }

    public String getCreatedByUsername() { return createdByUsername; }
    public void setCreatedByUsername(String createdByUsername) { this.createdByUsername = createdByUsername; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
}
