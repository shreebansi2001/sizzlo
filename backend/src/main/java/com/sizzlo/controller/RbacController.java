package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.AdminRole;
import com.sizzlo.entity.AdminUser;
import com.sizzlo.repository.AdminRoleRepository;
import com.sizzlo.repository.AdminUserRepository;
import com.sizzlo.repository.OutletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin/rbac")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class RbacController {

    private final AdminRoleRepository roleRepository;
    private final AdminUserRepository userRepository;
    private final OutletRepository outletRepository;

    @Autowired
    public RbacController(AdminRoleRepository roleRepository, AdminUserRepository userRepository, OutletRepository outletRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.outletRepository = outletRepository;
    }

    // --- SYSTEM RIGHTS CATALOG ---
    public static class RightDef {
        public String code;
        public String name;
        public String category;
        public String description;

        public RightDef(String code, String name, String category, String description) {
            this.code = code;
            this.name = name;
            this.category = category;
            this.description = description;
        }
    }

    private static final List<RightDef> SYSTEM_RIGHTS = Arrays.asList(
            new RightDef("DASHBOARD_VIEW", "Executive Overview", "Overview", "View live revenue, sales KPI & patron telemetry"),
            new RightDef("INSIGHTS_VIEW", "AI Predictive Engine", "Overview", "Access automated revenue growth & AI forecasting"),
            new RightDef("CEO_SUITE_VIEW", "CEO Strategic Suite", "Overview", "Consolidated group multi-branch turnover & margins"),
            new RightDef("CUSTOMERS_MANAGE", "Patron 360 CRM", "Subscribers", "Search, view and manage VIP member dining accounts"),
            new RightDef("MEMBERSHIPS_MANAGE", "Subscription Plans", "Subscribers", "Manage Classic, Signature, Elite subscriptions and renewals"),
            new RightDef("LOYALTY_MANAGE", "Loyalty Points", "Subscribers", "View loyalty issuance, balance adjustments and rewards"),
            new RightDef("COUPONS_MANAGE", "Voucher Manager", "Operations", "Issue, edit and pause dining discount coupons"),
            new RightDef("PAYMENTS_SETTLE_APPROVE", "Table Bill Settlement", "Operations", "Approve offline POS bill settlements & coupon burns"),
            new RightDef("RESERVATIONS_MANAGE", "Table Reservations", "Operations", "Manage dining table bookings and waitlists"),
            new RightDef("FLOOR_TABLES_MANAGE", "Floor & Tables", "Operations", "Real-time table seating layout, table statuses and captain assignment"),
            new RightDef("REDEMPTION_VALIDATE", "Redemption Desk", "Operations", "Scan and validate dining vouchers at cashier terminal"),
            new RightDef("OUTLETS_MANAGE", "Venues & Outlets", "Operations", "Edit outlet operating hours, contact info, and seating capacity"),
            new RightDef("EVENTS_MANAGE", "Banquet & Brunches", "Operations", "Manage Sunday Brunches, banquets, passes and guest lists"),
            new RightDef("MARKETING_MANAGE", "Broadcast Campaigns", "Growth & Governance", "Execute WhatsApp and SMS promotional blasts"),
            new RightDef("USER_MGMT", "Staff & Roles (RBAC)", "Growth & Governance", "Create branch admins, managers, captains & customize rights"),
            new RightDef("FEEDBACK_VIEW", "Patron Reviews", "Growth & Governance", "Monitor customer ratings and dining satisfaction feedback")
    );

    @GetMapping("/rights")
    public ResponseEntity<ApiResponse<List<RightDef>>> getAllRights() {
        return ResponseEntity.ok(ApiResponse.success(SYSTEM_RIGHTS));
    }

    // --- ROLES APIS ---

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<AdminRole>>> getAllRoles(
            @RequestParam(required = false) String requesterRole) {
        List<AdminRole> roles = roleRepository.findAllByOrderByLevelAsc();
        if ("BRANCH_ADMIN".equalsIgnoreCase(requesterRole)) {
            // Branch admin can only see sub-roles (Manager & Floor Captain)
            roles = roles.stream()
                    .filter(r -> r.getLevel() != null && r.getLevel() >= 3)
                    .collect(Collectors.toList());
        } else if ("MANAGER".equalsIgnoreCase(requesterRole)) {
            roles = roles.stream()
                    .filter(r -> r.getLevel() != null && r.getLevel() >= 4)
                    .collect(Collectors.toList());
        }
        return ResponseEntity.ok(ApiResponse.success(roles));
    }

    @PostMapping("/roles")
    public ResponseEntity<ApiResponse<AdminRole>> createRole(@RequestBody AdminRole role) {
        if (roleRepository.findByRoleCode(role.getRoleCode()).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Role code already exists"));
        }
        role.setIsSystem(false);
        role.setCreatedAt(LocalDateTime.now());
        AdminRole saved = roleRepository.save(role);
        return ResponseEntity.ok(ApiResponse.success("Role created successfully", saved));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<ApiResponse<AdminRole>> updateRole(
            @PathVariable Long id,
            @RequestBody AdminRole updated) {
        AdminRole role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));

        if (updated.getRoleName() != null) role.setRoleName(updated.getRoleName());
        if (updated.getDescription() != null) role.setDescription(updated.getDescription());
        if (updated.getPermissions() != null) role.setPermissions(updated.getPermissions());
        if (updated.getLevel() != null && !Boolean.TRUE.equals(role.getIsSystem())) {
            role.setLevel(updated.getLevel());
        }

        AdminRole saved = roleRepository.save(role);
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", saved));
    }

    // --- USERS APIS WITH MULTI-TENANT BRANCH HIERARCHY ---

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminUser>>> getUsers(
            @RequestParam(required = false, defaultValue = "SUPER_ADMIN") String requesterRole,
            @RequestParam(required = false, defaultValue = "All Branches") String requesterBranch,
            @RequestParam(required = false) String branch) {

        List<AdminUser> allUsers = userRepository.findAll();

        List<AdminUser> filtered;
        if ("SUPER_ADMIN".equalsIgnoreCase(requesterRole)) {
            if (branch != null && !branch.trim().isEmpty() && !"All Branches".equalsIgnoreCase(branch) && !"All".equalsIgnoreCase(branch)) {
                filtered = allUsers.stream()
                        .filter(u -> branch.equalsIgnoreCase(u.getBranchName()))
                        .collect(Collectors.toList());
            } else {
                filtered = allUsers;
            }
        } else if ("BRANCH_ADMIN".equalsIgnoreCase(requesterRole)) {
            // Branch Admin strictly sees only users belonging to their branch!
            filtered = allUsers.stream()
                    .filter(u -> requesterBranch.equalsIgnoreCase(u.getBranchName()) || (u.getBranchName() != null && u.getBranchName().toLowerCase().contains(requesterBranch.toLowerCase())))
                    .collect(Collectors.toList());
        } else if ("MANAGER".equalsIgnoreCase(requesterRole)) {
            // Manager strictly sees only Floor Captains & Cashiers under their branch!
            filtered = allUsers.stream()
                    .filter(u -> requesterBranch.equalsIgnoreCase(u.getBranchName()) && ("FLOOR_CAPTAIN".equalsIgnoreCase(u.getRoleCode()) || "CASHIER".equalsIgnoreCase(u.getRoleCode())))
                    .collect(Collectors.toList());
        } else {
            filtered = Collections.emptyList();
        }

        // Mask passwords in response
        filtered.forEach(u -> u.setPassword("••••••••"));
        return ResponseEntity.ok(ApiResponse.success(filtered));
    }

    @PostMapping("/users")
    public ResponseEntity<ApiResponse<AdminUser>> createUser(
            @RequestParam(required = false, defaultValue = "SUPER_ADMIN") String requesterRole,
            @RequestParam(required = false, defaultValue = "All Branches") String requesterBranch,
            @RequestParam(required = false, defaultValue = "SYSTEM") String requesterUsername,
            @RequestBody AdminUser req) {

        if (req.getUsername() == null || req.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Username/Email is required"));
        }

        String username = req.getUsername().trim().toLowerCase();
        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("User with username " + username + " already exists"));
        }

        // Enforce Multi-tenant Hierarchical Access Control
        if ("BRANCH_ADMIN".equalsIgnoreCase(requesterRole)) {
            // Branch Admin can NEVER create another Super Admin or Branch Admin!
            if ("SUPER_ADMIN".equalsIgnoreCase(req.getRoleCode()) || "BRANCH_ADMIN".equalsIgnoreCase(req.getRoleCode())) {
                return ResponseEntity.status(403).body(ApiResponse.error("Branch Admins can only create Managers or Floor Captains for their branch"));
            }
            // Branch is strictly locked to Branch Admin's branch!
            req.setBranchName(requesterBranch);
        } else if ("MANAGER".equalsIgnoreCase(requesterRole)) {
            // Manager can ONLY create Floor Captains
            if (!"FLOOR_CAPTAIN".equalsIgnoreCase(req.getRoleCode())) {
                return ResponseEntity.status(403).body(ApiResponse.error("Managers can only register Floor Captains"));
            }
            req.setBranchName(requesterBranch);
        }

        // Role name resolution
        Optional<AdminRole> roleOpt = roleRepository.findByRoleCode(req.getRoleCode());
        if (roleOpt.isPresent()) {
            req.setRoleName(roleOpt.get().getRoleName());
            if (req.getCustomPermissions() == null || req.getCustomPermissions().trim().isEmpty()) {
                req.setCustomPermissions(roleOpt.get().getPermissions());
            }
        }

        req.setUsername(username);
        req.setEmail(req.getEmail() != null ? req.getEmail().trim().toLowerCase() : username);
        req.setFullName(req.getFullName() != null ? req.getFullName().trim() : username);
        req.setPassword(req.getPassword() != null && !req.getPassword().trim().isEmpty() ? req.getPassword().trim() : "admin123");
        req.setCreatedByUsername(requesterUsername);
        req.setCreatedAt(LocalDateTime.now());
        req.setActive(true);

        AdminUser saved = userRepository.save(req);
        saved.setPassword("••••••••");
        return ResponseEntity.ok(ApiResponse.success("User created successfully for branch: " + saved.getBranchName(), saved));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<ApiResponse<AdminUser>> updateUser(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "SUPER_ADMIN") String requesterRole,
            @RequestParam(required = false, defaultValue = "All Branches") String requesterBranch,
            @RequestBody AdminUser req) {

        AdminUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Enforce hierarchy boundary
        if ("BRANCH_ADMIN".equalsIgnoreCase(requesterRole)) {
            if (!requesterBranch.equalsIgnoreCase(user.getBranchName())) {
                return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized: You can only modify users within your branch (" + requesterBranch + ")"));
            }
            if ("SUPER_ADMIN".equalsIgnoreCase(user.getRoleCode())) {
                return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized: Cannot modify Super Admin account"));
            }
        }

        if (req.getFullName() != null) user.setFullName(req.getFullName().trim());
        if (req.getMobile() != null) user.setMobile(req.getMobile().trim());
        if (req.getEmail() != null) user.setEmail(req.getEmail().trim().toLowerCase());
        if (req.getActive() != null) user.setActive(req.getActive());

        // Super Admin can change branch, Branch Admin cannot
        if ("SUPER_ADMIN".equalsIgnoreCase(requesterRole) && req.getBranchName() != null) {
            user.setBranchName(req.getBranchName().trim());
        }

        // Role code update
        if (req.getRoleCode() != null && !req.getRoleCode().equalsIgnoreCase(user.getRoleCode())) {
            if ("BRANCH_ADMIN".equalsIgnoreCase(requesterRole) && ("SUPER_ADMIN".equalsIgnoreCase(req.getRoleCode()) || "BRANCH_ADMIN".equalsIgnoreCase(req.getRoleCode()))) {
                return ResponseEntity.status(403).body(ApiResponse.error("Cannot elevate user to Super Admin or Branch Admin"));
            }
            user.setRoleCode(req.getRoleCode());
            roleRepository.findByRoleCode(req.getRoleCode()).ifPresent(r -> user.setRoleName(r.getRoleName()));
        }

        // Granular permissions update
        if (req.getCustomPermissions() != null) {
            user.setCustomPermissions(req.getCustomPermissions().trim());
        }

        // Password reset if provided
        if (req.getPassword() != null && !req.getPassword().trim().isEmpty() && !req.getPassword().contains("••••")) {
            user.setPassword(req.getPassword().trim());
        }

        AdminUser saved = userRepository.save(user);
        saved.setPassword("••••••••");
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", saved));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "SUPER_ADMIN") String requesterRole,
            @RequestParam(required = false, defaultValue = "All Branches") String requesterBranch) {

        AdminUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        if ("SUPER_ADMIN".equalsIgnoreCase(user.getRoleCode())) {
            return ResponseEntity.status(403).body(ApiResponse.error("Super Admin (Owner) account cannot be deleted"));
        }

        if ("BRANCH_ADMIN".equalsIgnoreCase(requesterRole) && !requesterBranch.equalsIgnoreCase(user.getBranchName())) {
            return ResponseEntity.status(403).body(ApiResponse.error("Unauthorized to delete user outside your branch"));
        }

        userRepository.delete(user);
        return ResponseEntity.ok(ApiResponse.success("User successfully removed", "DELETED"));
    }

    // --- AUTHENTICATION & LOGIN API ---

    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class LoginResponse {
        public Long id;
        public String username;
        public String email;
        public String fullName;
        public String mobile;
        public String roleCode;
        public String roleName;
        public Integer roleLevel;
        public String branchName;
        public Long outletId;
        public List<String> permissions;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@RequestBody LoginRequest req) {
        if (req.username == null || req.password == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Username and password required"));
        }

        String uname = req.username.trim().toLowerCase();
        Optional<AdminUser> userOpt = userRepository.findByUsername(uname);
        if (!userOpt.isPresent()) {
            userOpt = userRepository.findByEmail(uname);
        }

        if (!userOpt.isPresent()) {
            // Also accept legacy fallback 'admin' or 'admin@sizzlo.com'
            if (("admin".equals(uname) || "admin@sizzlo.com".equals(uname)) && "admin123".equals(req.password.trim())) {
                userOpt = userRepository.findByUsername("owner@sizzlo.com");
            }
        }

        if (!userOpt.isPresent() || !userOpt.get().getPassword().equals(req.password.trim())) {
            return ResponseEntity.status(401).body(ApiResponse.error("Invalid credentials. Please verify your email and password."));
        }

        AdminUser user = userOpt.get();
        if (Boolean.FALSE.equals(user.getActive())) {
            return ResponseEntity.status(403).body(ApiResponse.error("Your staff account is currently inactive. Please contact the Owner/Admin."));
        }

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        // Resolve effective permissions
        Set<String> effectivePerms = new HashSet<>();
        Optional<AdminRole> roleOpt = roleRepository.findByRoleCode(user.getRoleCode());
        Integer level = 1;
        if (roleOpt.isPresent()) {
            level = roleOpt.get().getLevel();
            if (roleOpt.get().getPermissions() != null) {
                effectivePerms.addAll(Arrays.asList(roleOpt.get().getPermissions().split(",")));
            }
        }

        if (user.getCustomPermissions() != null && !user.getCustomPermissions().trim().isEmpty()) {
            effectivePerms.clear();
            effectivePerms.addAll(Arrays.asList(user.getCustomPermissions().split(",")));
        }

        LoginResponse resp = new LoginResponse();
        resp.id = user.getId();
        resp.username = user.getUsername();
        resp.email = user.getEmail();
        resp.fullName = user.getFullName();
        resp.mobile = user.getMobile();
        resp.roleCode = user.getRoleCode();
        resp.roleName = user.getRoleName() != null ? user.getRoleName() : (roleOpt.isPresent() ? roleOpt.get().getRoleName() : user.getRoleCode());
        resp.roleLevel = level;
        resp.branchName = user.getBranchName();
        resp.outletId = user.getOutletId();
        resp.permissions = new ArrayList<>(effectivePerms);

        return ResponseEntity.ok(ApiResponse.success("Authentication successful", resp));
    }
}
