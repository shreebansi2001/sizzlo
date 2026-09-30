package com.sizzlo.service;

import com.sizzlo.dto.AdminDashboardDto;
import com.sizzlo.entity.Outlet;

import java.util.List;

public interface AdminService {
    AdminDashboardDto getDashboardOverview();
    List<Outlet> getAllOutlets();
    Outlet updateOutlet(Long id, Outlet outlet);
}
