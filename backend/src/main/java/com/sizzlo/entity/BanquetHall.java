package com.sizzlo.entity;

import javax.persistence.*;

@Entity
@Table(name = "banquet_halls")
public class BanquetHall {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "outlet_name", nullable = false)
    private String outletName;

    @Column(name = "min_capacity")
    private Integer minCapacity;

    @Column(name = "max_capacity")
    private Integer maxCapacity;

    @Column(name = "rate_per_plate")
    private Double ratePerPlate;

    @Column(name = "slot_rental_price")
    private Double slotRentalPrice;

    @Column(name = "supported_sessions")
    private String supportedSessions; // "Morning,Evening,Full Day"

    @Column(length = 1000)
    private String amenities;

    private String status; // "Active", "Maintenance", "Inactive"

    @Column(name = "image_url")
    private String imageUrl;

    public BanquetHall() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getOutletName() { return outletName; }
    public void setOutletName(String outletName) { this.outletName = outletName; }

    public Integer getMinCapacity() { return minCapacity; }
    public void setMinCapacity(Integer minCapacity) { this.minCapacity = minCapacity; }

    public Integer getMaxCapacity() { return maxCapacity; }
    public void setMaxCapacity(Integer maxCapacity) { this.maxCapacity = maxCapacity; }

    public Double getRatePerPlate() { return ratePerPlate; }
    public void setRatePerPlate(Double ratePerPlate) { this.ratePerPlate = ratePerPlate; }

    public Double getSlotRentalPrice() { return slotRentalPrice; }
    public void setSlotRentalPrice(Double slotRentalPrice) { this.slotRentalPrice = slotRentalPrice; }

    public String getSupportedSessions() { return supportedSessions; }
    public void setSupportedSessions(String supportedSessions) { this.supportedSessions = supportedSessions; }

    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
