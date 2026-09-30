package com.sizzlo.controller;

import com.sizzlo.dto.AdminDashboardDto;
import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.Outlet;
import com.sizzlo.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardDto>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboardOverview()));
    }

    @GetMapping("/outlets")
    public ResponseEntity<ApiResponse<List<Outlet>>> getOutlets() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllOutlets()));
    }

    @PutMapping("/outlets/{id}")
    public ResponseEntity<ApiResponse<Outlet>> updateOutlet(@PathVariable Long id, @RequestBody Outlet outlet) {
        return ResponseEntity.ok(ApiResponse.success("Outlet updated", adminService.updateOutlet(id, outlet)));
    }
}
