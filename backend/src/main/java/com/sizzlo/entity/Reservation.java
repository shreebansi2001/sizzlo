package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_reference", unique = true, nullable = false)
    private String bookingReference;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_mobile")
    private String customerMobile;

    @Column(nullable = false)
    private String outlet;

    @Column(name = "reservation_time")
    private String reservationTime; // e.g. "20 Jun, 8:30 PM" or ISO

    @Column(nullable = false)
    private Integer guests;

    @Column(nullable = false)
    private String status; // "Booked", "Seated", "Completed", "No-Show", "Cancelled"

    @Column(name = "is_vip")
    private Boolean vip;

    @Column(name = "tier_priority_tag")
    private String tierPriorityTag; // "Non-Subscriber", "Classic", "Signature", "Elite"

    @Column(name = "occasion_tag")
    private String occasionTag; // "Birthday", "Anniversary", "Business", "Regular"

    @Column(name = "special_requests")
    private String specialRequests;

    @Column(name = "table_assigned")
    private String tableAssigned;

    @Column(name = "booking_advance")
    private Double bookingAdvance; // e.g. 100.0 or 200.0 for non-subscribed, 0.0 for VIP

    @Column(name = "advance_paid")
    private Boolean advancePaid;

    @Column(name = "advance_deducted")
    private Boolean advanceDeducted; // Flagged true when deducted on POS bill settlement

    @Column(name = "pos_settlement_id")
    private Long posSettlementId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (vip == null) vip = false;
        if (status == null) status = "Booked";
        if (tierPriorityTag == null) tierPriorityTag = vip ? "Signature" : "Non-Subscriber";
        if (occasionTag == null) occasionTag = "Regular";
        if (bookingAdvance == null) bookingAdvance = vip ? 0.0 : 100.0;
        if (advancePaid == null) advancePaid = !vip; // VIP is complimentary, non-subscribed marks paid when reserved
        if (advanceDeducted == null) advanceDeducted = false;
    }

    public Reservation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }

    public String getOutlet() { return outlet; }
    public void setOutlet(String outlet) { this.outlet = outlet; }

    public String getReservationTime() { return reservationTime; }
    public void setReservationTime(String reservationTime) { this.reservationTime = reservationTime; }

    public Integer getGuests() { return guests; }
    public void setGuests(Integer guests) { this.guests = guests; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getVip() { return vip; }
    public void setVip(Boolean vip) { this.vip = vip; }

    public String getTierPriorityTag() { return tierPriorityTag; }
    public void setTierPriorityTag(String tierPriorityTag) { this.tierPriorityTag = tierPriorityTag; }

    public String getOccasionTag() { return occasionTag; }
    public void setOccasionTag(String occasionTag) { this.occasionTag = occasionTag; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public String getTableAssigned() { return tableAssigned; }
    public void setTableAssigned(String tableAssigned) { this.tableAssigned = tableAssigned; }

    public Double getBookingAdvance() { return bookingAdvance; }
    public void setBookingAdvance(Double bookingAdvance) { this.bookingAdvance = bookingAdvance; }

    public Boolean getAdvancePaid() { return advancePaid; }
    public void setAdvancePaid(Boolean advancePaid) { this.advancePaid = advancePaid; }

    public Boolean getAdvanceDeducted() { return advanceDeducted; }
    public void setAdvanceDeducted(Boolean advanceDeducted) { this.advanceDeducted = advanceDeducted; }

    public Long getPosSettlementId() { return posSettlementId; }
    public void setPosSettlementId(Long posSettlementId) { this.posSettlementId = posSettlementId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
