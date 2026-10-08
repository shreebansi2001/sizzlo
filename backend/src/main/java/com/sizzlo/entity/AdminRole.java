package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_roles")
public class AdminRole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "role_code", unique = true, nullable = false, length = 50)
    private String roleCode; // SUPER_ADMIN, BRANCH_ADMIN, MANAGER, FLOOR_CAPTAIN

    @Column(name = "role_name", nullable = false, length = 100)
    private String roleName;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "hierarchy_level", nullable = false)
    private Integer level; // 1 = SuperAdmin (Owner), 2 = BranchAdmin, 3 = Manager, 4 = Floor Captain

    @Column(name = "permissions", length = 2000)
    private String permissions; // Comma-separated permission codes

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public AdminRole() {}

    public AdminRole(String roleCode, String roleName, String description, Integer level, String permissions, Boolean isSystem) {
        this.roleCode = roleCode;
        this.roleName = roleName;
        this.description = description;
        this.level = level;
        this.permissions = permissions;
        this.isSystem = isSystem;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRoleCode() { return roleCode; }
    public void setRoleCode(String roleCode) { this.roleCode = roleCode; }

    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getLevel() { return level; }
    public void setLevel(Integer level) { this.level = level; }

    public String getPermissions() { return permissions; }
    public void setPermissions(String permissions) { this.permissions = permissions; }

    public Boolean getIsSystem() { return isSystem; }
    public void setIsSystem(Boolean isSystem) { this.isSystem = isSystem; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
