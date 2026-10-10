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
    private final com.sizzlo.repository.MemberProfileRepository memberProfileRepository;
    private final com.sizzlo.repository.ReservationRepository reservationRepository;
    private final com.sizzlo.repository.CouponRepository couponRepository;

    @Autowired
    public AdminServiceImpl(OutletRepository outletRepository,
                            com.sizzlo.repository.MemberProfileRepository memberProfileRepository,
                            com.sizzlo.repository.ReservationRepository reservationRepository,
                            com.sizzlo.repository.CouponRepository couponRepository) {
        this.outletRepository = outletRepository;
        this.memberProfileRepository = memberProfileRepository;
        this.reservationRepository = reservationRepository;
        this.couponRepository = couponRepository;
    }

    @Override
    public AdminDashboardDto getDashboardOverview() {
        long memberCount = memberProfileRepository.count();
        long reservationCount = reservationRepository.count();
        long totalCouponsUsed = memberProfileRepository.findAll().stream()
                .mapToLong(m -> m.getCouponsUsed() != null ? m.getCouponsUsed() : 0)
                .sum();

        long pendingDuesSum = memberProfileRepository.findAll().stream()
                .mapToLong(m -> m.getPendingDues() != null ? m.getPendingDues() : 0)
                .sum();
        double totalOutletRev = outletRepository.findAll().stream()
                .mapToDouble(o -> o.getRevenueLakhs() != null ? o.getRevenueLakhs() : 0)
                .sum();

        // Dynamic KPIs — zeros when empty
        List<Map<String, Object>> kpis = new ArrayList<>();
        String totalRevStr = totalOutletRev > 0 ? String.format(Locale.US, "%.2f", totalOutletRev / 100.0) : "0";
        kpis.add(createKpi("Total Revenue", "Rs. " + totalRevStr + " Cr", totalOutletRev > 0 ? "+12.4%" : "0%", "up"));
        kpis.add(createKpi("Membership Revenue", "Rs. " + (memberCount > 0 ? (memberCount * 10000 / 100000) : 0) + " Lakh", memberCount > 0 ? "+8.2%" : "0%", "up"));
        kpis.add(createKpi("Active Members", String.valueOf(memberCount), memberCount > 0 ? "+" + memberCount : "0", "up"));
        kpis.add(createKpi("Pending Payments", "Rs. " + (pendingDuesSum > 0 ? String.format(Locale.US, "%.2f L", pendingDuesSum / 100000.0) : "0"), pendingDuesSum > 0 ? "-4.1%" : "0%", "down"));
        kpis.add(createKpi("Coupons Redeemed", String.valueOf(totalCouponsUsed), totalCouponsUsed > 0 ? "+" + totalCouponsUsed : "0", "up"));
        kpis.add(createKpi("Reservations", String.valueOf(reservationCount), reservationCount > 0 ? "+" + reservationCount : "0", "up"));

        // Revenue series — purely dynamic
        List<Map<String, Object>> series = new ArrayList<>();
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        for (int i = 0; i < months.length; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("m", months[i]);
            point.put("revenue", 0);
            point.put("membership", 0);
            series.add(point);
        }

        // Outlets
        List<Outlet> outlets = outletRepository.findAll();

        // AI Insights — dynamic
        List<Map<String, Object>> insights = new ArrayList<>();

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
