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

    public FloorTable() {}

    public FloorTable(Integer tableNumber, Integer seats, String state, String guest, Boolean premium) {
        this.tableNumber = tableNumber;
        this.seats = seats;
        this.state = state;
        this.guest = guest;
        this.premium = premium;
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
}
