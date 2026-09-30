package com.sizzlo.service.impl;

import com.sizzlo.dto.AdminDashboardDto;
import com.sizzlo.entity.Outlet;
import com.sizzlo.exception.ResourceNotFoundException;
import com.sizzlo.repository.OutletRepository;
import com.sizzlo.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class AdminServiceImpl implements AdminService {

    private final OutletRepository outletRepository;

    @Autowired
    public AdminServiceImpl(OutletRepository outletRepository) {
        this.outletRepository = outletRepository;
    }

    @Override
    public AdminDashboardDto getDashboardOverview() {
        // KPIs
        List<Map<String, Object>> kpis = new ArrayList<>();
        kpis.add(createKpi("Total Revenue", "₹2.75 Cr", "+12.4%", "up"));
        kpis.add(createKpi("Membership Revenue", "₹42 Lakh", "+8.2%", "up"));
        kpis.add(createKpi("Active Members", "4,582", "+342", "up"));
        kpis.add(createKpi("Pending Payments", "₹8.75 L", "-4.1%", "down"));
        kpis.add(createKpi("Coupons Redeemed", "12,874", "+22%", "up"));
        kpis.add(createKpi("Reservations", "1,245", "+9.6%", "up"));

        // Revenue series (monthly)
        List<Map<String, Object>> series = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        double[] revenues = {18, 19.5, 22.1, 21, 24.6, 26.8, 25.4, 27.9, 29.1, 30.2, 28.7, 32.4};
        double[] memberships = {3.2, 3.5, 3.8, 3.7, 4.1, 4.4, 4.2, 4.6, 4.9, 5.0, 4.8, 5.5};
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("m", months[i]);
            point.put("revenue", revenues[i]);
            point.put("membership", memberships[i]);
            series.add(point);
        }

        // Outlets
        List<Outlet> outlets = outletRepository.findAll();

        // AI Insights
        List<Map<String, Object>> insights = new ArrayList<>();
        insights.add(createInsight("Renewal opportunity", "150 memberships expiring within 30 days. Trigger campaign C-09 for best response.", "gold"));
        insights.add(createInsight("Revenue forecast", "Revenue expected to grow 12% next quarter, driven by Yanki Signature & Banquet.", "royal"));
        insights.add(createInsight("Best-performing coupon", "Coupon C-09 generates the highest repeat visits — 3.2× average.", "royal"));
        insights.add(createInsight("Brand contribution", "Dough by Yanki contributes 18% of total member spending this quarter.", "gold"));
        insights.add(createInsight("Capacity alert", "Weekend reservations expected to surge 24% — open extra slots for Sat 8–10 PM.", "royal"));

        return new AdminDashboardDto(kpis, series, outlets, insights);
    }

    @Override
    public List<Outlet> getAllOutlets() {
        return outletRepository.findAll();
    }

    @Override
    public Outlet updateOutlet(Long id, Outlet outlet) {
        Outlet existing = outletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + id));
        existing.setName(outlet.getName());
        existing.setAddress(outlet.getAddress());
        existing.setCity(outlet.getCity());
        existing.setContactNumber(outlet.getContactNumber());
        existing.setRevenueLakhs(outlet.getRevenueLakhs());
        existing.setActiveMembers(outlet.getActiveMembers());
        existing.setAverageBillValue(outlet.getAverageBillValue());
        existing.setCouponsRedeemed(outlet.getCouponsRedeemed());
        existing.setRating(outlet.getRating());
        return outletRepository.save(existing);
    }

    private Map<String, Object> createKpi(String label, String value, String delta, String trend) {
        Map<String, Object> map = new HashMap<>();
        map.put("label", label);
        map.put("value", value);
        map.put("delta", delta);
        map.put("trend", trend);
        return map;
    }

    private Map<String, Object> createInsight(String title, String body, String tone) {
        Map<String, Object> map = new HashMap<>();
        map.put("title", title);
        map.put("body", body);
        map.put("tone", tone);
        return map;
    }
}
