package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.BanquetInquiry;
import com.sizzlo.repository.BanquetInquiryRepository;
import com.sizzlo.service.CommonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/banquets")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class BanquetController {

    private final BanquetInquiryRepository banquetInquiryRepository;
    private final CommonService commonService;

    @Value("${banquet.manager.whatsapp:+919825012345}")
    private String managerWhatsapp;

    @Value("${banquet.owner.whatsapp:+919879567890}")
    private String ownerWhatsapp;

    @Autowired
    public BanquetController(
            BanquetInquiryRepository banquetInquiryRepository,
            CommonService commonService) {
        this.banquetInquiryRepository = banquetInquiryRepository;
        this.commonService = commonService;
    }

    @PostMapping("/inquiry")
    public ResponseEntity<ApiResponse<BanquetInquiry>> submitInquiry(@RequestBody BanquetInquiry inquiry) {
        // Enforce zero-points acknowledgement & default status
        inquiry.setZeroPointsAcknowledged(true);
        inquiry.setStatus("NEW");
        BanquetInquiry saved = banquetInquiryRepository.save(inquiry);

        // 1. Dispatch WhatsApp notification to User
        try {
            if (saved.getCustomerMobile() != null && !saved.getCustomerMobile().isEmpty()) {
                String userTitle = "Event Inquiry Received: " + saved.getEventCategory();
                String userBody = "Dear " + saved.getCustomerName() + ",\n\n" +
                        "Thank you for your inquiry with House of Yanki!\n" +
                        "• Event: *" + saved.getEventCategory() + "*\n" +
                        "• Date: " + saved.getEventDate() + " (" + saved.getEventShift() + ")\n" +
                        "• Expected Guests: " + saved.getEstimatedPax() + " Pax\n" +
                        "• Ref ID: #" + saved.getId() + "\n\n" +
                        "Our Executive Event Manager will contact you on this number within 24 hours to review custom menus and availability.";
                commonService.sendNotificationWhatsApp(saved.getCustomerMobile(), userTitle, userBody);
            }
        } catch (Exception e) {
            System.err.println("Could not dispatch User WhatsApp notification: " + e.getMessage());
        }

        // 2. Dispatch WhatsApp notification to Event Manager
        try {
            if (managerWhatsapp != null && !managerWhatsapp.isEmpty()) {
                String mgrTitle = "🚨 NEW EVENT INQUIRY #" + saved.getId();
                String mgrBody = "NEW LEAD FOR EVENT DESK:\n" +
                        "• Customer: *" + saved.getCustomerName() + "*\n" +
                        "• Contact: " + saved.getCustomerMobile() + "\n" +
                        "• Category: " + saved.getEventCategory() + "\n" +
                        "• Target Date: " + saved.getEventDate() + " (" + saved.getEventShift() + ")\n" +
                        "• Guests: " + saved.getEstimatedPax() + " Pax\n" +
                        "• Notes: " + (saved.getCustomRequirements() != null ? saved.getCustomRequirements() : "None") + "\n\n" +
                        "👉 Action: Please contact the customer and update status to 'CONTACTED' on the Admin Dashboard.";
                commonService.sendNotificationWhatsApp(managerWhatsapp, mgrTitle, mgrBody);
            }
        } catch (Exception e) {
            System.err.println("Could not dispatch Manager WhatsApp notification: " + e.getMessage());
        }

        // 3. Dispatch WhatsApp notification to Owner
        try {
            if (ownerWhatsapp != null && !ownerWhatsapp.isEmpty()) {
                String ownerTitle = "🔔 EXECUTIVE ALERT: New Event Inquiry #" + saved.getId();
                String ownerBody = "EXECUTIVE BRIEF:\n" +
                        "New event lead received from *" + saved.getCustomerName() + "* (" + saved.getCustomerMobile() + ")\n" +
                        "• Type: " + saved.getEventCategory() + "\n" +
                        "• Date: " + saved.getEventDate() + " (" + saved.getEstimatedPax() + " Guests)\n" +
                        "Status: Logged in Dashboard. Dispatched to Event Manager.";
                commonService.sendNotificationWhatsApp(ownerWhatsapp, ownerTitle, ownerBody);
            }
        } catch (Exception e) {
            System.err.println("Could not dispatch Owner WhatsApp notification: " + e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success(
                "Banquet & ODC inquiry submitted! Routed to House of Yanki Event Desk and WhatsApp notifications dispatched.",
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

    @RequestMapping(value = "/leads/{id}/assign", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<BanquetInquiry>> assignLead(
            @PathVariable Long id,
            @RequestParam String assignedTo) {
        BanquetInquiry inquiry = banquetInquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setAssignedTo(assignedTo);
        inquiry.setStatus("ASSIGNED");
        return ResponseEntity.ok(ApiResponse.success("Inquiry assigned to " + assignedTo, banquetInquiryRepository.save(inquiry)));
    }

    @RequestMapping(value = "/leads/{id}/status", method = {RequestMethod.PATCH, RequestMethod.PUT})
    public ResponseEntity<ApiResponse<BanquetInquiry>> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        BanquetInquiry inquiry = banquetInquiryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inquiry not found"));
        inquiry.setStatus(status);
        BanquetInquiry updated = banquetInquiryRepository.save(inquiry);

        // When status changes to CONTACTED, notify the user via WhatsApp
        try {
            if ("CONTACTED".equalsIgnoreCase(status) && inquiry.getCustomerMobile() != null) {
                String title = "Event Desk Update - Inquiry #" + id;
                String body = "Dear " + inquiry.getCustomerName() + ",\n\n" +
                        "Our House of Yanki event manager has initiated contact regarding your *" + inquiry.getEventCategory() + "* inquiry.\n" +
                        "We are curating custom banquet / ODC setups for your event. Feel free to reply or call back anytime!";
                commonService.sendNotificationWhatsApp(inquiry.getCustomerMobile(), title, body);
            } else if ("CONFIRMED".equalsIgnoreCase(status) && inquiry.getCustomerMobile() != null) {
                String title = "🎉 Booking Confirmed - Inquiry #" + id;
                String body = "Dear " + inquiry.getCustomerName() + ",\n\n" +
                        "Congratulations! Your booking for *" + inquiry.getEventCategory() + "* on " + inquiry.getEventDate() + " (" + inquiry.getEstimatedPax() + " Guests) is CONFIRMED.\n\n" +
                        "Thank you for choosing House of Yanki!";
                commonService.sendNotificationWhatsApp(inquiry.getCustomerMobile(), title, body);
            }
        } catch (Exception e) {
            System.err.println("Could not dispatch status update WhatsApp: " + e.getMessage());
        }

        return ResponseEntity.ok(ApiResponse.success("Status updated to " + status, updated));
    }

    @Autowired(required = false)
    private com.sizzlo.repository.BanquetHallRepository banquetHallRepository;

    @GetMapping("/halls")
    public ResponseEntity<ApiResponse<List<com.sizzlo.entity.BanquetHall>>> getAllHalls() {
        if (banquetHallRepository == null) {
            return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList()));
        }
        return ResponseEntity.ok(ApiResponse.success(banquetHallRepository.findAll()));
    }

    @PostMapping("/halls")
    public ResponseEntity<ApiResponse<com.sizzlo.entity.BanquetHall>> createHall(@RequestBody com.sizzlo.entity.BanquetHall hall) {
        if (banquetHallRepository == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BanquetHall repository unavailable"));
        }
        if (hall.getStatus() == null) hall.setStatus("Active");
        com.sizzlo.entity.BanquetHall saved = banquetHallRepository.save(hall);
        return ResponseEntity.ok(ApiResponse.success("Banquet hall created successfully", saved));
    }

    @PutMapping("/halls/{id}")
    public ResponseEntity<ApiResponse<com.sizzlo.entity.BanquetHall>> updateHall(
            @PathVariable Long id,
            @RequestBody com.sizzlo.entity.BanquetHall hall) {
        if (banquetHallRepository == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("BanquetHall repository unavailable"));
        }
        return banquetHallRepository.findById(id).map(existing -> {
            if (hall.getName() != null) existing.setName(hall.getName());
            if (hall.getOutletName() != null) existing.setOutletName(hall.getOutletName());
            if (hall.getMinCapacity() != null) existing.setMinCapacity(hall.getMinCapacity());
            if (hall.getMaxCapacity() != null) existing.setMaxCapacity(hall.getMaxCapacity());
            if (hall.getRatePerPlate() != null) existing.setRatePerPlate(hall.getRatePerPlate());
            if (hall.getSlotRentalPrice() != null) existing.setSlotRentalPrice(hall.getSlotRentalPrice());
            if (hall.getSupportedSessions() != null) existing.setSupportedSessions(hall.getSupportedSessions());
            if (hall.getAmenities() != null) existing.setAmenities(hall.getAmenities());
            if (hall.getStatus() != null) existing.setStatus(hall.getStatus());
            if (hall.getImageUrl() != null) existing.setImageUrl(hall.getImageUrl());
            com.sizzlo.entity.BanquetHall saved = banquetHallRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("Banquet hall updated", saved));
        }).orElse(ResponseEntity.badRequest().body(ApiResponse.error("Hall not found")));
    }

    @DeleteMapping("/halls/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHall(@PathVariable Long id) {
        if (banquetHallRepository != null && banquetHallRepository.existsById(id)) {
            banquetHallRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Banquet hall deleted successfully", null));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("Hall not found"));
    }
}
