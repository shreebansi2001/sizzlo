package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.dto.ReservationRequest;
import com.sizzlo.entity.Reservation;
import com.sizzlo.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationService reservationService;

    @Autowired
    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Reservation>>> getAllReservations() {
        return ResponseEntity.ok(ApiResponse.success(reservationService.getAllReservations()));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Reservation>>> getMyReservations(
            @RequestParam(name = "mobile", defaultValue = "+91 98250 12345") String mobile) {
        return ResponseEntity.ok(ApiResponse.success(reservationService.getCustomerReservations(mobile)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Reservation>> createReservation(@Valid @RequestBody ReservationRequest request) {
        Reservation created = reservationService.createReservation(request);
        return ResponseEntity.ok(ApiResponse.success("Table reserved successfully!", created));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Reservation>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Reservation updated = reservationService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Reservation status updated", updated));
    }
}
