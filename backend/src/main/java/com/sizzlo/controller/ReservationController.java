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
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class ReservationController {

    private final ReservationService reservationService;
    private final com.sizzlo.repository.OutletTimeSlotRepository outletTimeSlotRepository;
    private final com.sizzlo.repository.ReservationRepository reservationRepository;

    @Autowired(required = false)
    private com.sizzlo.repository.FloorTableRepository floorTableRepository;

    @Autowired(required = false)
    private com.sizzlo.repository.WaitlistEntryRepository waitlistEntryRepository;

    @Autowired
    public ReservationController(ReservationService reservationService,
                                 com.sizzlo.repository.OutletTimeSlotRepository outletTimeSlotRepository,
                                 com.sizzlo.repository.ReservationRepository reservationRepository) {
        this.reservationService = reservationService;
        this.outletTimeSlotRepository = outletTimeSlotRepository;
        this.reservationRepository = reservationRepository;
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

    @RequestMapping(value = "/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<Reservation>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        Reservation updated = reservationService.updateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Reservation status updated", updated));
    }

    @PostMapping("/{id}/assign-table")
    public ResponseEntity<ApiResponse<Reservation>> assignTable(
            @PathVariable Long id,
            @RequestParam String tableNumber,
            @RequestParam(required = false, defaultValue = "Occupied") String state) {
        Reservation res = reservationRepository.findById(id).orElse(null);
        if (res == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Reservation not found"));
        }
        String cleanTable = tableNumber.replaceAll("[^0-9]", "");
        res.setTableAssigned("T" + cleanTable);
        res.setStatus("Occupied".equalsIgnoreCase(state) ? "Seated" : "Confirmed");
        Reservation saved = reservationRepository.save(res);

        if (floorTableRepository != null && !cleanTable.isEmpty()) {
            try {
                int tblNum = Integer.parseInt(cleanTable);
                floorTableRepository.findByTableNumber(tblNum).ifPresent(tbl -> {
                    tbl.setState(state);
                    tbl.setGuest(saved.getCustomerName() + " (" + saved.getGuests() + " guests)");
                    tbl.setReservationRef(saved.getBookingReference());
                    floorTableRepository.save(tbl);
                });
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(ApiResponse.success("Table T" + cleanTable + " settled successfully", saved));
    }

    @PostMapping("/{id}/send-to-queue")
    public ResponseEntity<ApiResponse<Reservation>> sendToQueue(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "15") Integer waitMinutes) {
        Reservation res = reservationRepository.findById(id).orElse(null);
        if (res == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Reservation not found"));
        }
        res.setStatus("Waitlisted");
        Reservation saved = reservationRepository.save(res);

        if (waitlistEntryRepository != null) {
            com.sizzlo.entity.WaitlistEntry entry = new com.sizzlo.entity.WaitlistEntry(
                    saved.getCustomerName() + " (" + saved.getBookingReference() + ")",
                    saved.getGuests() != null ? saved.getGuests() : 2,
                    waitMinutes != null ? waitMinutes : 15
            );
            entry.setStatus("WAITING");
            waitlistEntryRepository.save(entry);
        }
        return ResponseEntity.ok(ApiResponse.success("Party added to live dining queue", saved));
    }

    /**
     * Mobile & Web: Get active time slots dynamically configured by Admin
     */
    @GetMapping("/slots")
    public ResponseEntity<ApiResponse<List<com.sizzlo.entity.OutletTimeSlot>>> getActiveSlots(
            @RequestParam(required = false) String outlet) {
        List<com.sizzlo.entity.OutletTimeSlot> list;
        if (outlet != null && !outlet.trim().isEmpty() && !outlet.equalsIgnoreCase("All Outlets")) {
            list = outletTimeSlotRepository.findByOutletAndActiveTrueOrderByDisplayOrderAsc(outlet.trim());
            // Also append generic slots configured for "All Outlets"
            List<com.sizzlo.entity.OutletTimeSlot> generic = outletTimeSlotRepository.findByOutletAndActiveTrueOrderByDisplayOrderAsc("All Outlets");
            for (com.sizzlo.entity.OutletTimeSlot g : generic) {
                boolean exists = list.stream().anyMatch(s -> s.getSlotTime().equalsIgnoreCase(g.getSlotTime()));
                if (!exists) {
                    list.add(g);
                }
            }
        } else {
            list = outletTimeSlotRepository.findByActiveTrueOrderByDisplayOrderAsc();
        }
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Admin: Get all slots (active and inactive) for management
     */
    @GetMapping("/slots/all")
    public ResponseEntity<ApiResponse<List<com.sizzlo.entity.OutletTimeSlot>>> getAllSlots() {
        return ResponseEntity.ok(ApiResponse.success(outletTimeSlotRepository.findAllByOrderByDisplayOrderAsc()));
    }

    /**
     * Admin: Add a new dynamic slot
     */
    @PostMapping("/slots")
    public ResponseEntity<ApiResponse<com.sizzlo.entity.OutletTimeSlot>> createSlot(@RequestBody com.sizzlo.entity.OutletTimeSlot slot) {
        if (slot.getDisplayOrder() == null) {
            slot.setDisplayOrder((int) outletTimeSlotRepository.count() + 1);
        }
        com.sizzlo.entity.OutletTimeSlot saved = outletTimeSlotRepository.save(slot);
        return ResponseEntity.ok(ApiResponse.success("Time slot added successfully", saved));
    }

    /**
     * Admin: Toggle slot active/inactive
     */
    @PutMapping("/slots/{id}/toggle")
    public ResponseEntity<ApiResponse<com.sizzlo.entity.OutletTimeSlot>> toggleSlot(@PathVariable Long id) {
        return outletTimeSlotRepository.findById(id)
                .map(slot -> {
                    slot.setActive(!Boolean.TRUE.equals(slot.getActive()));
                    com.sizzlo.entity.OutletTimeSlot updated = outletTimeSlotRepository.save(slot);
                    return ResponseEntity.ok(ApiResponse.success("Slot status changed to " + (updated.getActive() ? "ACTIVE" : "INACTIVE"), updated));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Admin: Delete slot
     */
    @DeleteMapping("/slots/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSlot(@PathVariable Long id) {
        if (outletTimeSlotRepository.existsById(id)) {
            outletTimeSlotRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Slot deleted successfully", null));
        }
        return ResponseEntity.notFound().build();
    }

    /**
     * Admin: Live Traffic & Priority Queue
     * Returns today's footfall, subscribed VIP vs non-subscribed counts, and queue sorted with Subscribed VIPs first!
     */
    @GetMapping("/traffic/today")
    public ResponseEntity<ApiResponse<java.util.Map<String, Object>>> getTodayTraffic() {
        List<Reservation> all = reservationRepository.findAllByOrderByCreatedAtDesc();
        
        int totalGuests = 0;
        int subscribedCount = 0;
        int nonSubscribedCount = 0;
        double totalAdvanceCollected = 0.0;

        List<Reservation> vipList = new java.util.ArrayList<>();
        List<Reservation> guestList = new java.util.ArrayList<>();

        for (Reservation r : all) {
            int guests = r.getGuests() != null ? r.getGuests() : 2;
            totalGuests += guests;

            boolean isVip = Boolean.TRUE.equals(r.getVip()) || 
                    (r.getTierPriorityTag() != null && !r.getTierPriorityTag().equalsIgnoreCase("Non-Subscriber") && !r.getTierPriorityTag().equalsIgnoreCase("GUEST"));

            if (isVip) {
                subscribedCount++;
                vipList.add(r);
            } else {
                nonSubscribedCount++;
                guestList.add(r);
                if (r.getBookingAdvance() != null && Boolean.TRUE.equals(r.getAdvancePaid())) {
                    totalAdvanceCollected += r.getBookingAdvance();
                }
            }
        }

        // Merge prioritized queue: VIP Subscribers always go first!
        List<Reservation> prioritizedQueue = new java.util.ArrayList<>();
        prioritizedQueue.addAll(vipList);
        prioritizedQueue.addAll(guestList);

        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("totalBookings", all.size());
        data.put("totalGuests", totalGuests);
        data.put("subscribedVIPs", subscribedCount);
        data.put("nonSubscribedGuests", nonSubscribedCount);
        data.put("totalAdvanceCollected", totalAdvanceCollected);
        data.put("prioritizedQueue", prioritizedQueue);

        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
