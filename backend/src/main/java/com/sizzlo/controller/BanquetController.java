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
}
