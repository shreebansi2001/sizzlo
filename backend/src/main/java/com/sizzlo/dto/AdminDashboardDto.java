package com.sizzlo.dto;

import com.sizzlo.entity.Outlet;
import java.util.List;
import java.util.Map;

public class AdminDashboardDto {
    private List<Map<String, Object>> kpis;
    private List<Map<String, Object>> revenueSeries;
    private List<Outlet> outletPerformance;
    private List<Map<String, Object>> aiInsights;

    public AdminDashboardDto() {}

    public AdminDashboardDto(List<Map<String, Object>> kpis,
                             List<Map<String, Object>> revenueSeries,
                             List<Outlet> outletPerformance,
                             List<Map<String, Object>> aiInsights) {
        this.kpis = kpis;
        this.revenueSeries = revenueSeries;
        this.outletPerformance = outletPerformance;
        this.aiInsights = aiInsights;
    }

    public List<Map<String, Object>> getKpis() { return kpis; }
    public void setKpis(List<Map<String, Object>> kpis) { this.kpis = kpis; }

    public List<Map<String, Object>> getRevenueSeries() { return revenueSeries; }
    public void setRevenueSeries(List<Map<String, Object>> revenueSeries) { this.revenueSeries = revenueSeries; }

    public List<Outlet> getOutletPerformance() { return outletPerformance; }
    public void setOutletPerformance(List<Outlet> outletPerformance) { this.outletPerformance = outletPerformance; }

    public List<Map<String, Object>> getAiInsights() { return aiInsights; }
    public void setAiInsights(List<Map<String, Object>> aiInsights) { this.aiInsights = aiInsights; }
}
