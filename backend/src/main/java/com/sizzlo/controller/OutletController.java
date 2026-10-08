package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.Outlet;
import com.sizzlo.repository.OutletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/outlets")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class OutletController {

    private final OutletRepository outletRepository;

    @Autowired
    public OutletController(OutletRepository outletRepository) {
        this.outletRepository = outletRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Outlet>>> getActiveOutlets(
            @RequestParam(required = false) String brand) {
        List<Outlet> list;
        if (brand != null && !brand.isEmpty() && !"All".equalsIgnoreCase(brand) && !"All Outlets".equalsIgnoreCase(brand)) {
            list = outletRepository.findByIsUpcomingAndBrand(false, brand);
        } else {
            list = outletRepository.findByIsUpcoming(false);
        }
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<List<Outlet>>> getUpcomingOutlets() {
        return ResponseEntity.ok(ApiResponse.success(outletRepository.findByIsUpcoming(true)));
    }

    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<Outlet>>> getAllOutlets() {
        return ResponseEntity.ok(ApiResponse.success(outletRepository.findAll()));
    }

    @PostMapping("/notify-launch")
    public ResponseEntity<ApiResponse<Map<String, String>>> notifyLaunch(
            @RequestBody Map<String, String> payload) {
        String outletName = payload.getOrDefault("outletName", "New Outlet");
        String mobile = payload.getOrDefault("mobile", "+91 98250 12345");

        Map<String, String> resp = new HashMap<>();
        resp.put("outletName", outletName);
        resp.put("mobile", mobile);
        resp.put("message", "Subscribed! You will receive an exclusive opening-week dining voucher when " + outletName + " launches.");
        return ResponseEntity.ok(ApiResponse.success(resp));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Outlet>> createOutlet(@RequestBody Outlet outlet) {
        if (outlet.getIsUpcoming() == null) outlet.setIsUpcoming(false);
        if (outlet.getRating() == null) outlet.setRating(4.8);
        if (outlet.getRevenueLakhs() == null) outlet.setRevenueLakhs(0.0);
        if (outlet.getActiveMembers() == null) outlet.setActiveMembers(0);
        if (outlet.getAverageBillValue() == null) outlet.setAverageBillValue(1250);
        if (outlet.getCouponsRedeemed() == null) outlet.setCouponsRedeemed(0);
        if (outlet.getBrand() == null || outlet.getBrand().trim().isEmpty()) outlet.setBrand("Yanki Sizzlerr");
        return ResponseEntity.ok(ApiResponse.success("Outlet registered", outletRepository.save(outlet)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Outlet>> updateOutlet(@PathVariable Long id, @RequestBody Outlet updated) {
        Outlet existing = outletRepository.findById(id).orElseThrow(() -> new RuntimeException("Outlet not found"));
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getBrand() != null) existing.setBrand(updated.getBrand());
        if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
        if (updated.getCity() != null) existing.setCity(updated.getCity());
        if (updated.getOpeningHours() != null) existing.setOpeningHours(updated.getOpeningHours());
        if (updated.getContactNumber() != null) existing.setContactNumber(updated.getContactNumber());
        if (updated.getIsUpcoming() != null) existing.setIsUpcoming(updated.getIsUpcoming());
        if (updated.getConceptTag() != null) existing.setConceptTag(updated.getConceptTag());
        if (updated.getTargetLaunchDate() != null) existing.setTargetLaunchDate(updated.getTargetLaunchDate());
        if (updated.getRating() != null) existing.setRating(updated.getRating());
        if (updated.getRevenueLakhs() != null) existing.setRevenueLakhs(updated.getRevenueLakhs());
        if (updated.getActiveMembers() != null) existing.setActiveMembers(updated.getActiveMembers());
        if (updated.getAverageBillValue() != null) existing.setAverageBillValue(updated.getAverageBillValue());
        if (updated.getCouponsRedeemed() != null) existing.setCouponsRedeemed(updated.getCouponsRedeemed());
        if (updated.getImageUrl() != null) existing.setImageUrl(updated.getImageUrl());
        return ResponseEntity.ok(ApiResponse.success("Outlet updated", outletRepository.save(existing)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteOutlet(@PathVariable Long id) {
        if (outletRepository.existsById(id)) {
            outletRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Outlet deleted successfully", "OK"));
        }
        return ResponseEntity.status(404).body(ApiResponse.error("Outlet not found"));
    }
}
