package com.sizzlo.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

public class ReservationRequest {
    @NotBlank(message = "Customer name is required")
    private String customerName;

    @NotBlank(message = "Customer mobile is required")
    private String customerMobile;

    @NotBlank(message = "Outlet is required")
    private String outlet;

    @NotBlank(message = "Reservation time is required")
    private String reservationTime;

    @NotNull(message = "Number of guests is required")
    private Integer guests;

    private Boolean vip;
    private String specialRequests;
    private Double bookingAdvance;
    private Boolean advancePaid;
    private String tierPriorityTag;
    private String occasionTag;

    public ReservationRequest() {}

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

    public Boolean getVip() { return vip; }
    public void setVip(Boolean vip) { this.vip = vip; }

    public String getSpecialRequests() { return specialRequests; }
    public void setSpecialRequests(String specialRequests) { this.specialRequests = specialRequests; }

    public Double getBookingAdvance() { return bookingAdvance; }
    public void setBookingAdvance(Double bookingAdvance) { this.bookingAdvance = bookingAdvance; }

    public Boolean getAdvancePaid() { return advancePaid; }
    public void setAdvancePaid(Boolean advancePaid) { this.advancePaid = advancePaid; }

    public String getTierPriorityTag() { return tierPriorityTag; }
    public void setTierPriorityTag(String tierPriorityTag) { this.tierPriorityTag = tierPriorityTag; }

    public String getOccasionTag() { return occasionTag; }
    public void setOccasionTag(String occasionTag) { this.occasionTag = occasionTag; }
}
