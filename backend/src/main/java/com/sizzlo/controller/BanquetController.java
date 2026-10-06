package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.BanquetInquiry;
import com.sizzlo.repository.BanquetInquiryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banquets")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class BanquetController {

    private final BanquetInquiryRepository banquetInquiryRepository;

    @Autowired
    public BanquetController(BanquetInquiryRepository banquetInquiryRepository) {
        this.banquetInquiryRepository = banquetInquiryRepository;
    }

    @PostMapping("/inquiry")
    public ResponseEntity<ApiResponse<BanquetInquiry>> submitInquiry(@RequestBody BanquetInquiry inquiry) {
        // Enforce zero-points acknowledgement & default status
        inquiry.setZeroPointsAcknowledged(true);
        inquiry.setStatus("NEW");
        BanquetInquiry saved = banquetInquiryRepository.save(inquiry);
        return ResponseEntity.ok(ApiResponse.success(
                "Banquet & ODC inquiry submitted! Routed to House of Yanki Event Desk. (Note: Banquet spend does not accrue loyalty points)",
                saved));
    }

    @GetMapping("/leads")
    public ResponseEntity<ApiResponse<List<BanquetInquiry>>> getAllLeads() {
        return ResponseEntity.ok(ApiResponse.success(banquetInquiryRepository.findAllByOrderByCreatedAtDesc()));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BanquetInquiry>>> getMyInquiries(
            @RequestParam(required = false, defaultValue = "+91 98250 12345") String mobile) {
        return ResponseEntity.ok(ApiResponse.success(banquetInquiryRepository.findByCustomerMobileOrderByCreatedAtDesc(mobile)));
    }

    @PatchMapping("/leads/{id}/assign")
    public ResponseEntity<ApiResponse<BanquetInquiry>> assignLead(
            @PathVariable Long id,
            @RequestParam String assignedTo) {
        BanquetInquiry inquiry = banquetInquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setAssignedTo(assignedTo);
        inquiry.setStatus("ASSIGNED");
        return ResponseEntity.ok(ApiResponse.success("Inquiry assigned to " + assignedTo, banquetInquiryRepository.save(inquiry)));
    }

    @PatchMapping("/leads/{id}/status")
    public ResponseEntity<ApiResponse<BanquetInquiry>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        BanquetInquiry inquiry = banquetInquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Status updated to " + status, banquetInquiryRepository.save(inquiry)));
    }
}
