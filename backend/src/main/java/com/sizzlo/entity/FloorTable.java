package com.sizzlo.entity;

import javax.persistence.*;

@Entity
@Table(name = "floor_tables")
public class FloorTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer tableNumber;

    @Column(nullable = false)
    private Integer seats;

    @Column(nullable = false)
    private String state; // Available, Reserved, Occupied, Cleaning

    private String guest;

    private Boolean premium = false;

    private String outletName = "Navrangpura";

    private String floorSection = "Main Dining Floor";

    private String notes;

    private String reservationRef;

    public FloorTable() {}

    public FloorTable(Integer tableNumber, Integer seats, String state, String guest, Boolean premium) {
        this.tableNumber = tableNumber;
        this.seats = seats;
        this.state = state;
        this.guest = guest;
        this.premium = premium;
        this.floorSection = "Main Dining Floor";
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getTableNumber() { return tableNumber; }
    public void setTableNumber(Integer tableNumber) { this.tableNumber = tableNumber; }

    public Integer getSeats() { return seats; }
    public void setSeats(Integer seats) { this.seats = seats; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getGuest() { return guest; }
    public void setGuest(String guest) { this.guest = guest; }

    public Boolean getPremium() { return premium; }
    public void setPremium(Boolean premium) { this.premium = premium; }

    public String getOutletName() { return outletName; }
    public void setOutletName(String outletName) { this.outletName = outletName; }

    public String getFloorSection() { return floorSection; }
    public void setFloorSection(String floorSection) { this.floorSection = floorSection; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public String getReservationRef() { return reservationRef; }
    public void setReservationRef(String reservationRef) { this.reservationRef = reservationRef; }
}
