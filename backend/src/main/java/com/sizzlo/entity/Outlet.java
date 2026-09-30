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

    public Outlet() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

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
}
