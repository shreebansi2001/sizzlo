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
        return ResponseEntity.ok(ApiResponse.success("Outlet registered", outletRepository.save(outlet)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Outlet>> updateOutlet(@PathVariable Long id, @RequestBody Outlet updated) {
        Outlet existing = outletRepository.findById(id).orElseThrow(() -> new RuntimeException("Outlet not found"));
        if (updated.getName() != null) existing.setName(updated.getName());
        if (updated.getBrand() != null) existing.setBrand(updated.getBrand());
        if (updated.getAddress() != null) existing.setAddress(updated.getAddress());
        if (updated.getOpeningHours() != null) existing.setOpeningHours(updated.getOpeningHours());
        if (updated.getContactNumber() != null) existing.setContactNumber(updated.getContactNumber());
        if (updated.getIsUpcoming() != null) existing.setIsUpcoming(updated.getIsUpcoming());
        if (updated.getConceptTag() != null) existing.setConceptTag(updated.getConceptTag());
        if (updated.getTargetLaunchDate() != null) existing.setTargetLaunchDate(updated.getTargetLaunchDate());
        return ResponseEntity.ok(ApiResponse.success("Outlet updated", outletRepository.save(existing)));
    }
}
