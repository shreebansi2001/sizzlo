package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.FeedbackTicket;
import com.sizzlo.repository.FeedbackTicketRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class FeedbackController {

    private final FeedbackTicketRepository feedbackTicketRepository;

    @Autowired
    public FeedbackController(FeedbackTicketRepository feedbackTicketRepository) {
        this.feedbackTicketRepository = feedbackTicketRepository;
    }

    public static class FeedbackRequest {
        public String customerName;
        public String customerMobile;
        public String outletName;
        public Integer rating; // 1 to 5
        public Integer foodRating;
        public Integer serviceRating;
        public Integer cleanlinessRating;
        public String comments;
    }

    @PostMapping("/submit")
    public ResponseEntity<ApiResponse<Map<String, Object>>> submitFeedback(@RequestBody FeedbackRequest req) {
        FeedbackTicket ticket = new FeedbackTicket();
        ticket.setCustomerName(req.customerName != null ? req.customerName : "Dining Guest");
        ticket.setCustomerMobile(req.customerMobile != null ? req.customerMobile : "+91 98250 12345");
        ticket.setOutletName(req.outletName != null ? req.outletName : "Yanki Sizzlerr Bodakdev");
        ticket.setRating(req.rating != null ? req.rating : 5);
        ticket.setFoodRating(req.foodRating);
        ticket.setServiceRating(req.serviceRating);
        ticket.setCleanlinessRating(req.cleanlinessRating);
        ticket.setComments(req.comments);

        // Smart Sentiment Routing Logic (Chapter 11 SRS)
        // 4 or 5 stars -> Prompt Google Review deep-link
        // 1, 2, or 3 stars -> Google link suppressed, create Urgent Recovery Ticket
        boolean isPositive = ticket.getRating() >= 4;
        ticket.setIsGoogleRedirected(isPositive);
        ticket.setIsUrgentRecovery(!isPositive);
        ticket.setStatus(isPositive ? "RESOLVED" : "OPEN");

        FeedbackTicket saved = feedbackTicketRepository.save(ticket);

        Map<String, Object> resp = new HashMap<>();
        resp.put("ticketId", saved.getId());
        resp.put("rating", saved.getRating());
        resp.put("isPositive", isPositive);

        if (isPositive) {
            resp.put("message", "Glad you enjoyed it! Please share your review on Google.");
            resp.put("googleReviewUrl", "https://search.google.com/local/writereview?placeid=ChIJyankiSizzlerrBodakdev");
        } else {
            resp.put("message", "Thank you for sharing your constructive feedback. Our Store Manager has received an urgent recovery ticket and will contact you shortly.");
            resp.put("googleReviewUrl", null);
        }

        return ResponseEntity.ok(ApiResponse.success(resp));
    }

    @GetMapping("/tickets")
    public ResponseEntity<ApiResponse<List<FeedbackTicket>>> getAllTickets() {
        return ResponseEntity.ok(ApiResponse.success(feedbackTicketRepository.findAllByOrderByCreatedAtDesc()));
    }

    @GetMapping("/urgent")
    public ResponseEntity<ApiResponse<List<FeedbackTicket>>> getUrgentRecoveryTickets() {
        return ResponseEntity.ok(ApiResponse.success(feedbackTicketRepository.findByIsUrgentRecoveryTrueOrderByCreatedAtDesc()));
    }

    @PatchMapping("/tickets/{id}/resolve")
    public ResponseEntity<ApiResponse<FeedbackTicket>> resolveTicket(
            @PathVariable Long id,
            @RequestParam String resolutionNotes) {
        FeedbackTicket ticket = feedbackTicketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        ticket.setStatus("RESOLVED");
        ticket.setResolutionNotes(resolutionNotes);
        return ResponseEntity.ok(ApiResponse.success("Recovery ticket resolved", feedbackTicketRepository.save(ticket)));
    }
}
