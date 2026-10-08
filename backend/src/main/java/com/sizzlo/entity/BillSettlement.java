package com.sizzlo.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bill_settlements")
public class BillSettlement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "customer_mobile", nullable = false)
    private String customerMobile;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "membership_id")
    private String membershipId;

    @Column(name = "outlet_name", nullable = false)
    private String outletName;

    @Column(name = "pos_invoice_number", nullable = false)
    private String posInvoiceNumber;

    @Column(name = "gross_amount", nullable = false)
    private Double grossAmount;

    @Column(name = "discount_amount")
    private Double discountAmount;

    @Column(name = "net_payable", nullable = false)
    private Double netPayable;

    @Column(name = "coupon_code")
    private String couponCode;

    @Column(name = "payment_mode", nullable = false)
    private String paymentMode; // CASH, CARD, ONLINE, STORE_QR

    @Column(name = "upi_utr")
    private String upiUtr; // 12-digit UPI UTR for Store Counter QR

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "status", nullable = false)
    private String status; // PENDING_VERIFICATION, APPROVED, REJECTED

    @Column(name = "table_advance_deduction")
    private Double tableAdvanceDeduction; // Advance holding fee deducted (e.g. 100.0)

    @Column(name = "receipt_image_url")
    private String receiptImageUrl; // Uploaded physical POS receipt photo

    @Column(name = "booking_reference")
    private String bookingReference; // Linked reservation reference (if any)

    @Column(name = "cashier_id")
    private String cashierId;

    @Column(name = "points_credited")
    private Integer pointsCredited;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "approved_at")
    private LocalDateTime approvedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (status == null) status = "PENDING_VERIFICATION";
        if (discountAmount == null) discountAmount = 0.0;
        if (pointsCredited == null) pointsCredited = 0;
        if (tableAdvanceDeduction == null) tableAdvanceDeduction = 0.0;
    }

    public BillSettlement() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCustomerMobile() { return customerMobile; }
    public void setCustomerMobile(String customerMobile) { this.customerMobile = customerMobile; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getMembershipId() { return membershipId; }
    public void setMembershipId(String membershipId) { this.membershipId = membershipId; }

    public String getOutletName() { return outletName; }
    public void setOutletName(String outletName) { this.outletName = outletName; }

    public String getPosInvoiceNumber() { return posInvoiceNumber; }
    public void setPosInvoiceNumber(String posInvoiceNumber) { this.posInvoiceNumber = posInvoiceNumber; }

    public Double getGrossAmount() { return grossAmount; }
    public void setGrossAmount(Double grossAmount) { this.grossAmount = grossAmount; }

    public Double getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(Double discountAmount) { this.discountAmount = discountAmount; }

    public Double getNetPayable() { return netPayable; }
    public void setNetPayable(Double netPayable) { this.netPayable = netPayable; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public String getPaymentMode() { return paymentMode; }
    public void setPaymentMode(String paymentMode) { this.paymentMode = paymentMode; }

    public String getUpiUtr() { return upiUtr; }
    public void setUpiUtr(String upiUtr) { this.upiUtr = upiUtr; }

    public String getRazorpayPaymentId() { return razorpayPaymentId; }
    public void setRazorpayPaymentId(String razorpayPaymentId) { this.razorpayPaymentId = razorpayPaymentId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCashierId() { return cashierId; }
    public void setCashierId(String cashierId) { this.cashierId = cashierId; }

    public Integer getPointsCredited() { return pointsCredited; }
    public void setPointsCredited(Integer pointsCredited) { this.pointsCredited = pointsCredited; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Double getTableAdvanceDeduction() { return tableAdvanceDeduction; }
    public void setTableAdvanceDeduction(Double tableAdvanceDeduction) { this.tableAdvanceDeduction = tableAdvanceDeduction; }

    public String getReceiptImageUrl() { return receiptImageUrl; }
    public void setReceiptImageUrl(String receiptImageUrl) { this.receiptImageUrl = receiptImageUrl; }

    public String getBookingReference() { return bookingReference; }
    public void setBookingReference(String bookingReference) { this.bookingReference = bookingReference; }

    public LocalDateTime getApprovedAt() { return approvedAt; }
    public void setApprovedAt(LocalDateTime approvedAt) { this.approvedAt = approvedAt; }
}
