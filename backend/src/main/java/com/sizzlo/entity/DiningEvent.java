package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dining_events")
public class DiningEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "banner_url")
    private String bannerUrl;

    @Column(name = "outlet_name", nullable = false)
    private String outletName;

    @Column(name = "event_day")
    private String eventDay; // e.g., "Every Sunday" or "Sun, 18 Oct"

    @Column(name = "event_date")
    private String eventDate; // e.g., "2026-10-18"

    @Column(nullable = false)
    private String timings; // e.g., "12:00 PM – 04:00 PM"

    @Column(name = "total_seats", nullable = false)
    private Integer totalSeats; // e.g. 50

    @Column(name = "booked_seats", nullable = false)
    private Integer bookedSeats = 0;

    @Column(name = "price_per_guest", nullable = false)
    private Double pricePerGuest = 99.0; // Nominal booking charge

    @Column(columnDefinition = "TEXT")
    private String inclusions; // e.g. "Live grill buffet, desserts, live jazz"

    @Column(nullable = false)
    private String status = "ACTIVE"; // "ACTIVE", "HOUSEFULL", "CANCELLED", "COMPLETED"

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    public DiningEvent() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public String getOutletName() {
        return outletName;
    }

    public void setOutletName(String outletName) {
        this.outletName = outletName;
    }

    public String getEventDay() {
        return eventDay;
    }

    public void setEventDay(String eventDay) {
        this.eventDay = eventDay;
    }

    public String getEventDate() {
        return eventDate;
    }

    public void setEventDate(String eventDate) {
        this.eventDate = eventDate;
    }

    public String getTimings() {
        return timings;
    }

    public void setTimings(String timings) {
        this.timings = timings;
    }

    public Integer getTotalSeats() {
        return totalSeats;
    }

    public void setTotalSeats(Integer totalSeats) {
        this.totalSeats = totalSeats;
    }

    public Integer getBookedSeats() {
        return bookedSeats;
    }

    public void setBookedSeats(Integer bookedSeats) {
        this.bookedSeats = bookedSeats;
    }

    public Double getPricePerGuest() {
        return pricePerGuest;
    }

    public void setPricePerGuest(Double pricePerGuest) {
        this.pricePerGuest = pricePerGuest;
    }

    public String getInclusions() {
        return inclusions;
    }

    public void setInclusions(String inclusions) {
        this.inclusions = inclusions;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getRemainingSeats() {
        if (totalSeats == null) return 0;
        int booked = bookedSeats != null ? bookedSeats : 0;
        return Math.max(0, totalSeats - booked);
    }
}
