package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "waitlist_entries")
public class WaitlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private Integer guests;

    private Integer waitMinutes;

    private String status = "WAITING"; // WAITING, SEATED, CANCELLED

    private LocalDateTime createdAt = LocalDateTime.now();

    public WaitlistEntry() {}

    public WaitlistEntry(String name, Integer guests, Integer waitMinutes) {
        this.name = name;
        this.guests = guests;
        this.waitMinutes = waitMinutes;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Integer getGuests() { return guests; }
    public void setGuests(Integer guests) { this.guests = guests; }

    public Integer getWaitMinutes() { return waitMinutes; }
    public void setWaitMinutes(Integer waitMinutes) { this.waitMinutes = waitMinutes; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
