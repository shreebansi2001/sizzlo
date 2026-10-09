package com.sizzlo.entity;

import javax.persistence.*;

@Entity
@Table(name = "floor_sections")
public class FloorSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name; // e.g. "Main Dining Floor", "Rooftop Terrace", "VIP Private Dining"

    @Column(nullable = false)
    private String outletName = "Navrangpura";

    private String description;

    public FloorSection() {}

    public FloorSection(String name, String outletName, String description) {
        this.name = name;
        this.outletName = outletName;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOutletName() { return outletName; }
    public void setOutletName(String outletName) { this.outletName = outletName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
