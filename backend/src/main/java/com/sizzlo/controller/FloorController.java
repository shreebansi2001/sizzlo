package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.FloorSection;
import com.sizzlo.entity.FloorTable;
import com.sizzlo.entity.Reservation;
import com.sizzlo.entity.WaitlistEntry;
import com.sizzlo.repository.FloorSectionRepository;
import com.sizzlo.repository.FloorTableRepository;
import com.sizzlo.repository.ReservationRepository;
import com.sizzlo.repository.WaitlistEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/floor")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class FloorController {

    @Autowired
    private FloorTableRepository floorTableRepository;

    @Autowired
    private FloorSectionRepository floorSectionRepository;

    @Autowired
    private WaitlistEntryRepository waitlistEntryRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    // ==========================================
    // FLOORS & SECTIONS MANAGEMENT
    // ==========================================

    @GetMapping("/sections")
    public ResponseEntity<ApiResponse<List<FloorSection>>> getSections(
            @RequestParam(required = false, defaultValue = "Navrangpura") String outlet) {
        List<FloorSection> sections = floorSectionRepository.findByOutletNameOrderByNameAsc(outlet);
        if (sections.isEmpty()) {
            // Seed default floors for the outlet
            FloorSection s1 = new FloorSection("Main Dining Floor", outlet, "Ground level primary dining hall");
            FloorSection s2 = new FloorSection("Rooftop Terrace", outlet, "Open-air scenic dining terrace");
            FloorSection s3 = new FloorSection("VIP Private Dining", outlet, "Exclusive suite for connoisseurs");
            floorSectionRepository.save(s1);
            floorSectionRepository.save(s2);
            floorSectionRepository.save(s3);
            sections = floorSectionRepository.findByOutletNameOrderByNameAsc(outlet);
        }
        return ResponseEntity.ok(ApiResponse.success(sections));
    }

    @PostMapping("/sections")
    public ResponseEntity<ApiResponse<FloorSection>> createSection(@RequestBody FloorSection section) {
        if (section.getName() == null || section.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Section / Floor name is required"));
        }
        if (section.getOutletName() == null || section.getOutletName().trim().isEmpty()) {
            section.setOutletName("Navrangpura");
        }
        if (floorSectionRepository.existsByNameAndOutletName(section.getName().trim(), section.getOutletName())) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Section '" + section.getName() + "' already exists for this outlet"));
        }
        section.setName(section.getName().trim());
        FloorSection saved = floorSectionRepository.save(section);
        return ResponseEntity.ok(ApiResponse.success("Floor section created successfully", saved));
    }

    @DeleteMapping("/sections/{id}")
    public ResponseEntity<ApiResponse<String>> deleteSection(@PathVariable Long id) {
        if (!floorSectionRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Floor section not found"));
        }
        floorSectionRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Floor section deleted successfully", "DELETED"));
    }

    // ==========================================
    // TABLE MANAGEMENT
    // ==========================================

    @GetMapping("/tables")
    public ResponseEntity<ApiResponse<List<FloorTable>>> getTables(
            @RequestParam(required = false) String outlet,
            @RequestParam(required = false) String section) {
        
        List<FloorTable> allTables = floorTableRepository.findAllByOrderByTableNumberAsc();
        boolean hasNullSection = false;
        for (FloorTable t : allTables) {
            if (t.getFloorSection() == null || t.getFloorSection().trim().isEmpty()) {
                t.setFloorSection(t.getTableNumber() != null && t.getTableNumber() > 8 ? "Rooftop Terrace" : "Main Dining Floor");
                floorTableRepository.save(t);
                hasNullSection = true;
            }
        }
        if (hasNullSection) {
            allTables = floorTableRepository.findAllByOrderByTableNumberAsc();
        }

        List<FloorTable> tables;
        if (outlet != null && !outlet.trim().isEmpty() && !"All Branches".equalsIgnoreCase(outlet)) {
            if (section != null && !section.trim().isEmpty() && !"ALL".equalsIgnoreCase(section)) {
                tables = floorTableRepository.findByOutletNameAndFloorSectionOrderByTableNumberAsc(outlet, section);
            } else {
                tables = floorTableRepository.findByOutletNameOrderByTableNumberAsc(outlet);
            }
        } else {
            if (section != null && !section.trim().isEmpty() && !"ALL".equalsIgnoreCase(section)) {
                List<FloorTable> filtered = new ArrayList<>();
                for (FloorTable t : allTables) {
                    if (section.equalsIgnoreCase(t.getFloorSection())) {
                        filtered.add(t);
                    }
                }
                tables = filtered;
            } else {
                tables = allTables;
            }
        }

        return ResponseEntity.ok(ApiResponse.success(tables));
    }

    @PostMapping("/tables")
    public ResponseEntity<ApiResponse<FloorTable>> addTable(@RequestBody FloorTable table) {
        if (table.getTableNumber() == null || table.getTableNumber() <= 0) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Valid Table number is required"));
        }
        if (table.getSeats() == null || table.getSeats() <= 0) {
            table.setSeats(4);
        }
        if (table.getOutletName() == null || table.getOutletName().trim().isEmpty()) {
            table.setOutletName("Navrangpura");
        }
        if (table.getFloorSection() == null || table.getFloorSection().trim().isEmpty()) {
            table.setFloorSection("Main Dining Floor");
        }
        if (table.getState() == null || table.getState().trim().isEmpty()) {
            table.setState("Available");
        }

        // Check uniqueness by tableNumber
        Optional<FloorTable> existing = floorTableRepository.findByTableNumber(table.getTableNumber());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Table T" + table.getTableNumber() + " already exists. Choose a unique number."));
        }

        FloorTable saved = floorTableRepository.save(table);
        return ResponseEntity.ok(ApiResponse.success("Table T" + saved.getTableNumber() + " added successfully", saved));
    }

    @PutMapping("/tables/{id}")
    public ResponseEntity<ApiResponse<FloorTable>> updateTable(
            @PathVariable Long id,
            @RequestBody FloorTable table) {
        Optional<FloorTable> opt = floorTableRepository.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Table not found"));
        }

        FloorTable existing = opt.get();
        if (table.getTableNumber() != null && !table.getTableNumber().equals(existing.getTableNumber())) {
            Optional<FloorTable> duplicate = floorTableRepository.findByTableNumber(table.getTableNumber());
            if (duplicate.isPresent() && !duplicate.get().getId().equals(id)) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Table number T" + table.getTableNumber() + " is already in use"));
            }
            existing.setTableNumber(table.getTableNumber());
        }

        if (table.getSeats() != null) existing.setSeats(table.getSeats());
        if (table.getFloorSection() != null) existing.setFloorSection(table.getFloorSection());
        if (table.getPremium() != null) existing.setPremium(table.getPremium());
        if (table.getState() != null) existing.setState(table.getState());
        if (table.getGuest() != null) existing.setGuest(table.getGuest());
        if (table.getNotes() != null) existing.setNotes(table.getNotes());
        if (table.getReservationRef() != null) existing.setReservationRef(table.getReservationRef());

        FloorTable updated = floorTableRepository.save(existing);
        return ResponseEntity.ok(ApiResponse.success("Table updated successfully", updated));
    }

    @PatchMapping("/tables/{id}/status")
    public ResponseEntity<ApiResponse<FloorTable>> updateTableStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        Optional<FloorTable> opt = floorTableRepository.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Table not found"));
        }

        FloorTable table = opt.get();
        String newState = (String) payload.get("state");
        if (newState != null) {
            table.setState(newState);
            if ("Available".equalsIgnoreCase(newState)) {
                table.setGuest(null);
                table.setNotes(null);
                table.setReservationRef(null);
            }
        }

        if (payload.containsKey("guest")) {
            table.setGuest((String) payload.get("guest"));
        }
        if (payload.containsKey("notes")) {
            table.setNotes((String) payload.get("notes"));
        }
        if (payload.containsKey("reservationRef")) {
            table.setReservationRef((String) payload.get("reservationRef"));
        }

        FloorTable updated = floorTableRepository.save(table);
        return ResponseEntity.ok(ApiResponse.success("Table status set to " + table.getState(), updated));
    }

    @DeleteMapping("/tables/{id}")
    public ResponseEntity<ApiResponse<String>> deleteTable(@PathVariable Long id) {
        if (!floorTableRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Table not found"));
        }
        floorTableRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Table removed successfully", "DELETED"));
    }

    @PostMapping("/tables/{number}/cycle")
    public ResponseEntity<ApiResponse<FloorTable>> cycleTableState(@PathVariable Integer number) {
        Optional<FloorTable> opt = floorTableRepository.findByTableNumber(number);
        if (!opt.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Table not found"));
        }
        FloorTable table = opt.get();
        String current = table.getState();
        String next;
        if ("Available".equalsIgnoreCase(current)) {
            next = "Reserved";
        } else if ("Reserved".equalsIgnoreCase(current)) {
            next = "Occupied";
        } else if ("Occupied".equalsIgnoreCase(current)) {
            next = "Cleaning";
        } else {
            next = "Available";
            table.setGuest(null);
            table.setNotes(null);
            table.setReservationRef(null);
        }
        table.setState(next);
        floorTableRepository.save(table);
        return ResponseEntity.ok(ApiResponse.success("Table state updated", table));
    }

    // ==========================================
    // BOOKING ASSIGNMENT & SEATING
    // ==========================================

    @PostMapping("/assign-booking")
    public ResponseEntity<ApiResponse<FloorTable>> assignBooking(@RequestBody Map<String, Object> payload) {
        Long tableId = payload.get("tableId") != null ? Long.valueOf(payload.get("tableId").toString()) : null;
        Integer tableNumber = payload.get("tableNumber") != null ? Integer.valueOf(payload.get("tableNumber").toString()) : null;

        Optional<FloorTable> opt = tableId != null 
                ? floorTableRepository.findById(tableId) 
                : (tableNumber != null ? floorTableRepository.findByTableNumber(tableNumber) : Optional.empty());

        if (!opt.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Target table not found"));
        }

        FloorTable table = opt.get();
        String guestName = (String) payload.get("guestName");
        String state = payload.get("state") != null ? (String) payload.get("state") : "Occupied";
        String notes = (String) payload.get("notes");
        String reservationRef = (String) payload.get("reservationRef");

        table.setState(state);
        if (guestName != null && !guestName.trim().isEmpty()) {
            table.setGuest(guestName.trim());
        }
        if (notes != null) {
            table.setNotes(notes.trim());
        }
        if (reservationRef != null) {
            table.setReservationRef(reservationRef.trim());
        }

        FloorTable savedTable = floorTableRepository.save(table);

        // Link with reservation if reservationId provided
        if (payload.get("reservationId") != null) {
            try {
                Long resId = Long.valueOf(payload.get("reservationId").toString());
                reservationRepository.findById(resId).ifPresent(res -> {
                    res.setTableAssigned("T" + savedTable.getTableNumber());
                    if ("Occupied".equalsIgnoreCase(state)) {
                        res.setStatus("Seated");
                    } else {
                        res.setStatus("Confirmed");
                    }
                    reservationRepository.save(res);
                });
            } catch (Exception ignored) {}
        }

        return ResponseEntity.ok(ApiResponse.success("Assigned guest to Table T" + savedTable.getTableNumber(), savedTable));
    }

    // ==========================================
    // WAITLIST MANAGEMENT
    // ==========================================

    @GetMapping("/waitlist")
    public ResponseEntity<ApiResponse<List<WaitlistEntry>>> getWaitlist() {
        return ResponseEntity.ok(ApiResponse.success(waitlistEntryRepository.findByStatusOrderByCreatedAtAsc("WAITING")));
    }

    @PostMapping("/waitlist")
    public ResponseEntity<ApiResponse<WaitlistEntry>> addWaitlist(@RequestBody WaitlistEntry entry) {
        if (entry.getName() == null || entry.getName().trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Guest name is required"));
        }
        if (entry.getGuests() == null || entry.getGuests() <= 0) {
            entry.setGuests(2);
        }
        if (entry.getWaitMinutes() == null) {
            entry.setWaitMinutes(10);
        }
        entry.setStatus("WAITING");
        WaitlistEntry saved = waitlistEntryRepository.save(entry);
        return ResponseEntity.ok(ApiResponse.success("Guest added to waitlist", saved));
    }

    @PostMapping("/waitlist/{id}/assign")
    public ResponseEntity<ApiResponse<WaitlistEntry>> assignWaitlist(
            @PathVariable Long id,
            @RequestParam(required = false) Integer tableNumber,
            @RequestParam(required = false) Long tableId) {
        
        Optional<WaitlistEntry> opt = waitlistEntryRepository.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Waitlist entry not found"));
        }
        WaitlistEntry entry = opt.get();
        entry.setStatus("SEATED");
        waitlistEntryRepository.save(entry);

        // Find table
        Optional<FloorTable> tableOpt = tableId != null 
                ? floorTableRepository.findById(tableId) 
                : (tableNumber != null ? floorTableRepository.findByTableNumber(tableNumber) : Optional.empty());

        tableOpt.ifPresent(tbl -> {
            tbl.setState("Occupied");
            tbl.setGuest(entry.getName() + " (" + entry.getGuests() + " guests)");
            floorTableRepository.save(tbl);
        });

        return ResponseEntity.ok(ApiResponse.success("Guest seated at Table " + (tableOpt.map(FloorTable::getTableNumber).orElse(tableNumber)), entry));
    }

    @DeleteMapping("/waitlist/{id}")
    public ResponseEntity<ApiResponse<String>> removeWaitlist(@PathVariable Long id) {
        if (!waitlistEntryRepository.existsById(id)) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Waitlist entry not found"));
        }
        waitlistEntryRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Waitlist entry removed", "DELETED"));
    }
}
