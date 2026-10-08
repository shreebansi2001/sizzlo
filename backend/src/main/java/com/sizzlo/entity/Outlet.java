package com.sizzlo.entity;

import javax.persistence.*;

@Entity
@Table(name = "outlets")
public class Outlet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String brand; // "Yanki Sizzlerr", "Dough by Yanki", "House of Yanki"

    private String address;

    private String city;

    private String contactNumber;

    @Column(name = "revenue_lakhs")
    private Double revenueLakhs;

    @Column(name = "active_members")
    private Integer activeMembers;

    @Column(name = "average_bill_value")
    private Integer averageBillValue;

    @Column(name = "coupons_redeemed")
    private Integer couponsRedeemed;

    private Double rating;

    @Column(name = "is_upcoming")
    private Boolean isUpcoming; // Chapter 05 Upcoming Outlets ("Coming Soon" Pipeline)

    @Column(name = "concept_tag")
    private String conceptTag; // e.g. "Rooftop Sizzler Lounge", "Express Café & Bakery"

    @Column(name = "target_launch_date")
    private String targetLaunchDate; // e.g. "December 2026"

    @Column(name = "opening_hours")
    private String openingHours; // e.g. "12:00 PM - 11:30 PM"

    private Double latitude;

    private Double longitude;

    @Lob
    @Column(name = "image_url")
    private String imageUrl;

    @PrePersist
    public void prePersist() {
        if (isUpcoming == null) isUpcoming = false;
        if (rating == null) rating = 4.8;
    }

    public Outlet() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getContactNumber() { return contactNumber; }
    public void setContactNumber(String contactNumber) { this.contactNumber = contactNumber; }

    public Double getRevenueLakhs() { return revenueLakhs; }
    public void setRevenueLakhs(Double revenueLakhs) { this.revenueLakhs = revenueLakhs; }

    public Integer getActiveMembers() { return activeMembers; }
    public void setActiveMembers(Integer activeMembers) { this.activeMembers = activeMembers; }

    public Integer getAverageBillValue() { return averageBillValue; }
    public void setAverageBillValue(Integer averageBillValue) { this.averageBillValue = averageBillValue; }

    public Integer getCouponsRedeemed() { return couponsRedeemed; }
    public void setCouponsRedeemed(Integer couponsRedeemed) { this.couponsRedeemed = couponsRedeemed; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Boolean getIsUpcoming() { return isUpcoming; }
    public void setIsUpcoming(Boolean isUpcoming) { this.isUpcoming = isUpcoming; }

    public String getConceptTag() { return conceptTag; }
    public void setConceptTag(String conceptTag) { this.conceptTag = conceptTag; }

    public String getTargetLaunchDate() { return targetLaunchDate; }
    public void setTargetLaunchDate(String targetLaunchDate) { this.targetLaunchDate = targetLaunchDate; }

    public String getOpeningHours() { return openingHours; }
    public void setOpeningHours(String openingHours) { this.openingHours = openingHours; }

    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }

    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}
