package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.FloorTable;
import com.sizzlo.entity.WaitlistEntry;
import com.sizzlo.repository.FloorTableRepository;
import com.sizzlo.repository.WaitlistEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/floor")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class FloorController {

    @Autowired
    private FloorTableRepository floorTableRepository;

    @Autowired
    private WaitlistEntryRepository waitlistEntryRepository;

    @GetMapping("/tables")
    public ResponseEntity<ApiResponse<List<FloorTable>>> getTables() {
        return ResponseEntity.ok(ApiResponse.success(floorTableRepository.findAllByOrderByTableNumberAsc()));
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
        }
        table.setState(next);
        floorTableRepository.save(table);
        return ResponseEntity.ok(ApiResponse.success("Table state updated", table));
    }

    @GetMapping("/waitlist")
    public ResponseEntity<ApiResponse<List<WaitlistEntry>>> getWaitlist() {
        return ResponseEntity.ok(ApiResponse.success(waitlistEntryRepository.findByStatusOrderByCreatedAtAsc("WAITING")));
    }

    @PostMapping("/waitlist")
    public ResponseEntity<ApiResponse<WaitlistEntry>> addWaitlist(@RequestBody WaitlistEntry entry) {
        WaitlistEntry saved = waitlistEntryRepository.save(entry);
        return ResponseEntity.ok(ApiResponse.success("Guest added to waitlist", saved));
    }

    @PostMapping("/waitlist/{id}/assign")
    public ResponseEntity<ApiResponse<WaitlistEntry>> assignWaitlist(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "1") Integer tableNumber) {
        Optional<WaitlistEntry> opt = waitlistEntryRepository.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Waitlist entry not found"));
        }
        WaitlistEntry entry = opt.get();
        entry.setStatus("SEATED");
        waitlistEntryRepository.save(entry);

        // Update table
        floorTableRepository.findByTableNumber(tableNumber).ifPresent(tbl -> {
            tbl.setState("Occupied");
            tbl.setGuest(entry.getName());
            floorTableRepository.save(tbl);
        });

        return ResponseEntity.ok(ApiResponse.success("Guest seated at Table " + tableNumber, entry));
    }
}
