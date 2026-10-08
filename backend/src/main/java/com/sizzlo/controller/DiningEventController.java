package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.DiningEvent;
import com.sizzlo.entity.DiningEventBooking;
import com.sizzlo.repository.DiningEventBookingRepository;
import com.sizzlo.repository.DiningEventRepository;
import com.sizzlo.service.CommonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/dining-events")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class DiningEventController {

    private final DiningEventRepository eventRepository;
    private final DiningEventBookingRepository bookingRepository;
    private final CommonService commonService;

    @Autowired
    public DiningEventController(
            DiningEventRepository eventRepository,
            DiningEventBookingRepository bookingRepository,
            CommonService commonService) {
        this.eventRepository = eventRepository;
        this.bookingRepository = bookingRepository;
        this.commonService = commonService;
    }

    /**
     * Fetch all active dining events (seeds demo events if database is empty).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<DiningEvent>>> getEvents() {
        List<DiningEvent> list = eventRepository.findAllByOrderByCreatedAtDesc();
        if (list.isEmpty()) {
            list = seedInitialEvents();
        }
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Get specific event details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DiningEvent>> getEvent(@PathVariable Long id) {
        return eventRepository.findById(id)
                .map(e -> ResponseEntity.ok(ApiResponse.success(e)))
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Book seats for an event with nominal booking charge and trigger WhatsApp pass.
     */
    @PostMapping("/book")
    public ResponseEntity<ApiResponse<DiningEventBooking>> bookEvent(@RequestBody Map<String, Object> req) {
        Long eventId = req.get("eventId") != null ? Long.valueOf(req.get("eventId").toString()) : null;
        if (eventId == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Event ID is required"));
        }

        DiningEvent event = eventRepository.findById(eventId).orElse(null);
        if (event == null) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Event not found"));
        }

        int guestCount = req.get("guestCount") != null ? Integer.parseInt(req.get("guestCount").toString()) : 1;
        if (guestCount < 1) guestCount = 1;

        int remaining = event.getRemainingSeats();
        if (remaining < guestCount) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Only " + remaining + " seat(s) remaining for this event!"));
        }

        String customerName = req.get("customerName") != null ? req.get("customerName").toString().trim() : "Patron";
        String customerMobile = req.get("customerMobile") != null ? req.get("customerMobile").toString().trim() : "";
        String customerEmail = req.get("customerEmail") != null ? req.get("customerEmail").toString().trim() : "";
        String paymentId = req.get("razorpayPaymentId") != null ? req.get("razorpayPaymentId").toString() : "pay_sim_" + System.currentTimeMillis();
        String orderId = req.get("razorpayOrderId") != null ? req.get("razorpayOrderId").toString() : "ord_evt_" + System.currentTimeMillis();

        double totalAmount = (event.getPricePerGuest() != null ? event.getPricePerGuest() : 99.0) * guestCount;

        // Generate unique reference
        String ref = "EVT-" + (10000 + new Random().nextInt(90000));

        DiningEventBooking booking = new DiningEventBooking();
        booking.setBookingReference(ref);
        booking.setEventId(event.getId());
        booking.setEventTitle(event.getTitle());
        booking.setCustomerName(customerName);
        booking.setCustomerMobile(customerMobile);
        booking.setCustomerEmail(customerEmail);
        booking.setGuestCount(guestCount);
        booking.setTotalAmount(totalAmount);
        booking.setRazorpayPaymentId(paymentId);
        booking.setRazorpayOrderId(orderId);
        booking.setPaymentStatus("PAID");
        booking.setStatus("CONFIRMED");
        booking.setCreatedAt(LocalDateTime.now());

        // Update event booked seat capacity
        int newBooked = (event.getBookedSeats() != null ? event.getBookedSeats() : 0) + guestCount;
        event.setBookedSeats(newBooked);
        if (event.getRemainingSeats() <= 0) {
            event.setStatus("HOUSEFULL");
        }
        eventRepository.save(event);

        // Send WhatsApp notification
        try {
            if (!customerMobile.isEmpty()) {
                String title = "Event Pass Confirmed: " + event.getTitle();
                String body = "Dear " + customerName + ", your entry pass for *" + event.getTitle() + "* (" + event.getTimings() + ", " + event.getEventDay() + ") is CONFIRMED for " + guestCount + " Guests at " + event.getOutletName() + ". Booking ID: #" + ref + ". Present this pass at venue desk!";
                commonService.sendNotificationWhatsApp(customerMobile, title, body);
                booking.setWhatsappSent(true);
            }
        } catch (Exception e) {
            System.err.println("Could not dispatch WhatsApp message: " + e.getMessage());
        }

        DiningEventBooking saved = bookingRepository.save(booking);
        return ResponseEntity.ok(ApiResponse.success("Event booking confirmed! Your digital pass has been generated.", saved));
    }

    /**
     * Get bookings for a specific mobile number (User's passes).
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<ApiResponse<List<DiningEventBooking>>> getMyBookings(
            @RequestParam(required = false) String mobile) {
        if (mobile == null || mobile.trim().isEmpty()) {
            return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
        }
        String cleanMobile = mobile.trim();
        List<DiningEventBooking> list = bookingRepository.findByCustomerMobileOrderByCreatedAtDesc(cleanMobile);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Admin: Get all attendees for a specific event.
     */
    @GetMapping("/{id}/attendees")
    public ResponseEntity<ApiResponse<List<DiningEventBooking>>> getAttendees(@PathVariable Long id) {
        List<DiningEventBooking> list = bookingRepository.findByEventIdOrderByCreatedAtDesc(id);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /**
     * Admin: Create a new event.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<DiningEvent>> createEvent(@RequestBody DiningEvent event) {
        if (event.getBookedSeats() == null) event.setBookedSeats(0);
        if (event.getStatus() == null) event.setStatus("ACTIVE");
        event.setCreatedAt(LocalDateTime.now());
        DiningEvent saved = eventRepository.save(event);
        return ResponseEntity.ok(ApiResponse.success("Event created successfully", saved));
    }

    /**
     * Admin: Update event.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DiningEvent>> updateEvent(
            @PathVariable Long id,
            @RequestBody DiningEvent update) {
        return eventRepository.findById(id).map(existing -> {
            if (update.getTitle() != null) existing.setTitle(update.getTitle());
            if (update.getDescription() != null) existing.setDescription(update.getDescription());
            if (update.getOutletName() != null) existing.setOutletName(update.getOutletName());
            if (update.getEventDay() != null) existing.setEventDay(update.getEventDay());
            if (update.getEventDate() != null) existing.setEventDate(update.getEventDate());
            if (update.getTimings() != null) existing.setTimings(update.getTimings());
            if (update.getTotalSeats() != null) existing.setTotalSeats(update.getTotalSeats());
            if (update.getBookedSeats() != null) existing.setBookedSeats(update.getBookedSeats());
            if (update.getPricePerGuest() != null) existing.setPricePerGuest(update.getPricePerGuest());
            if (update.getInclusions() != null) existing.setInclusions(update.getInclusions());
            if (update.getStatus() != null) existing.setStatus(update.getStatus());
            if (update.getBannerUrl() != null) existing.setBannerUrl(update.getBannerUrl());
            return ResponseEntity.ok(ApiResponse.success("Event updated", eventRepository.save(existing)));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Admin: Delete event.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<String>> deleteEvent(@PathVariable Long id) {
        if (eventRepository.existsById(id)) {
            eventRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.success("Event deleted", "OK"));
        }
        return ResponseEntity.notFound().build();
    }

    private List<DiningEvent> seedInitialEvents() {
        List<DiningEvent> seeded = new ArrayList<>();

        DiningEvent brunch = new DiningEvent();
        brunch.setTitle("Yanki Sparkling Sunday Brunch");
        brunch.setDescription("Indulge in our signature Sunday Brunch buffet featuring live sizzler grill stations, chef-crafted desserts, artisanal mocktails, and live jazz music.");
        brunch.setOutletName("Yanki Sizzlers - CG Road");
        brunch.setEventDay("Every Sunday");
        brunch.setEventDate("Upcoming Sunday");
        brunch.setTimings("12:00 PM – 04:00 PM");
        brunch.setTotalSeats(50);
        brunch.setBookedSeats(38);
        brunch.setPricePerGuest(99.0);
        brunch.setInclusions("Live grill buffet, artisanal desserts, live jazz music, welcome drink & priority table");
        brunch.setStatus("ACTIVE");
        brunch.setBannerUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80");
        brunch.setCreatedAt(LocalDateTime.now());
        seeded.add(eventRepository.save(brunch));

        DiningEvent masterclass = new DiningEvent();
        masterclass.setTitle("Chef's Table: Gourmet Sizzler Masterclass");
        masterclass.setDescription("An exclusive evening with our Executive Chef showcasing secret smoke-infusion techniques, pairing artisanal sizzler cuts with vintage beverages.");
        masterclass.setOutletName("Yanki Sizzlers - Bodakdev");
        masterclass.setEventDay("Friday Special");
        masterclass.setEventDate("This Friday");
        masterclass.setTimings("07:30 PM – 10:30 PM");
        masterclass.setTotalSeats(25);
        masterclass.setBookedSeats(19);
        masterclass.setPricePerGuest(149.0);
        masterclass.setInclusions("5-course curated tasting menu, sizzler demo with Executive Chef, complimentary mocktail pairing");
        masterclass.setStatus("ACTIVE");
        masterclass.setBannerUrl("https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80");
        masterclass.setCreatedAt(LocalDateTime.now().minusHours(2));
        seeded.add(eventRepository.save(masterclass));

        return seeded;
    }
}
