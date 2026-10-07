package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "outlet_time_slots")
public class OutletTimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String outlet; // "All Outlets" or specific outlet name

    @Column(name = "slot_time", nullable = false)
    private String slotTime; // e.g. "12:00 PM", "12:30 PM", "8:00 PM"

    @Column(nullable = false)
    private String session; // "LUNCH" or "DINNER"

    @Column(name = "is_active", nullable = false)
    private Boolean active;

    @Column(name = "max_covers")
    private Integer maxCovers;

    @Column(name = "display_order")
    private Integer displayOrder;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (active == null) active = true;
        if (maxCovers == null) maxCovers = 40;
        if (displayOrder == null) displayOrder = 0;
        if (outlet == null) outlet = "All Outlets";
        if (session == null) {
            session = (slotTime != null && (slotTime.contains("7:") || slotTime.contains("8:") || slotTime.contains("9:") || slotTime.contains("10:"))) ? "DINNER" : "LUNCH";
        }
    }

    public OutletTimeSlot() {}

    public OutletTimeSlot(String outlet, String slotTime, String session, Boolean active, Integer displayOrder) {
        this.outlet = outlet;
        this.slotTime = slotTime;
        this.session = session;
        this.active = active;
        this.displayOrder = displayOrder;
        this.maxCovers = 40;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getOutlet() { return outlet; }
    public void setOutlet(String outlet) { this.outlet = outlet; }

    public String getSlotTime() { return slotTime; }
    public void setSlotTime(String slotTime) { this.slotTime = slotTime; }

    public String getSession() { return session; }
    public void setSession(String session) { this.session = session; }

    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }

    public Integer getMaxCovers() { return maxCovers; }
    public void setMaxCovers(Integer maxCovers) { this.maxCovers = maxCovers; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
