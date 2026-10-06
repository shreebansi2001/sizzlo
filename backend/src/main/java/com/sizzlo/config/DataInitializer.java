package com.sizzlo.config;

import com.sizzlo.entity.*;
import com.sizzlo.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired private MemberProfileRepository memberProfileRepository;
    @Autowired private CouponRepository couponRepository;
    @Autowired private ReservationRepository reservationRepository;
    @Autowired private LoyaltyTransactionRepository loyaltyTransactionRepository;
    @Autowired private OutletRepository outletRepository;
    @Autowired private FloorTableRepository floorTableRepository;
    @Autowired private WaitlistEntryRepository waitlistEntryRepository;
    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private BillSettlementRepository billSettlementRepository;
    @Autowired private BanquetInquiryRepository banquetInquiryRepository;
    @Autowired private CorporateLeadRepository corporateLeadRepository;
    @Autowired private SalesTargetRepository salesTargetRepository;
    @Autowired private FeedbackTicketRepository feedbackTicketRepository;

    @Override
    public void run(String... args) {
        initData();
    }

    public void resetAllData() {
        couponRepository.deleteAll();
        reservationRepository.deleteAll();
        loyaltyTransactionRepository.deleteAll();
        floorTableRepository.deleteAll();
        waitlistEntryRepository.deleteAll();
        activityLogRepository.deleteAll();
        memberProfileRepository.deleteAll();
        outletRepository.deleteAll();
        billSettlementRepository.deleteAll();
        banquetInquiryRepository.deleteAll();
        corporateLeadRepository.deleteAll();
        salesTargetRepository.deleteAll();
        feedbackTicketRepository.deleteAll();
        initData();
    }

    private void initData() {
        if (outletRepository.count() == 0) {
            seedOutlets();
        }
        if (memberProfileRepository.count() == 0) {
            seedMembers();
        }
        if (couponRepository.count() == 0) {
            seedCoupons();
        }
        if (reservationRepository.count() == 0) {
            seedReservations();
        }
        if (salesTargetRepository.count() == 0) {
            seedSalesTarget();
        }
        if (billSettlementRepository.count() == 0) {
            seedBillSettlements();
        }
        if (banquetInquiryRepository.count() == 0) {
            seedBanquets();
        }
        if (corporateLeadRepository.count() == 0) {
            seedCorporateLeads();
        }
        if (floorTableRepository.count() == 0) {
            seedFloorTables();
        }
    }

    private void seedOutlets() {
        // Active Operational Outlets (Chapter 05.1)
        createOutlet("Yanki Sizzlerr Bodakdev", "Yanki Sizzlerr", "Bodakdev, Ahmedabad", "Ahmedabad", "+91 79 4001 0001", 86.0, 1842, 2840, 412, 4.9, false, "Heritage Sizzler Dining", null, "12:00 PM - 11:30 PM", 23.0373, 72.5120, "https://images.unsplash.com/photo-1544025162-d76694265947?w=800");
        createOutlet("Yanki Sizzlerr SG Highway", "Yanki Sizzlerr", "SG Highway, Ahmedabad", "Ahmedabad", "+91 79 4001 0002", 64.0, 1124, 2210, 298, 4.8, false, "Signature Dine-in Lounge", null, "12:00 PM - 11:30 PM", 23.0525, 72.5028, "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800");
        createOutlet("Dough by Yanki CG Road", "Dough by Yanki", "CG Road, Ahmedabad", "Ahmedabad", "+91 79 4001 0003", 49.0, 942, 1180, 524, 4.7, false, "Bakery & Artisanal Café", null, "10:00 AM - 11:00 PM", 23.0298, 72.5567, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800");
        createOutlet("House of Yanki Banquets Bopal", "House of Yanki", "South Bopal, Ahmedabad", "Ahmedabad", "+91 79 4001 0004", 95.0, 520, 18400, 140, 4.9, false, "Grand Banquets & Lawns", null, "10:00 AM - 12:00 AM", 23.0135, 72.4645, "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800");

        // Upcoming Outlets ("Coming Soon" Pipeline, Chapter 05.2)
        createOutlet("Yanki Sizzlerr Sindhu Bhavan Road", "Yanki Sizzlerr", "Sindhu Bhavan Road, Ahmedabad", "Ahmedabad", "+91 79 4001 0005", 0.0, 0, 0, 0, 4.9, true, "Rooftop Sizzler Lounge", "Opening December 2026", "Opening Soon", 23.0450, 72.5050, "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800");
        createOutlet("Dough by Yanki Infocity", "Dough by Yanki", "Infocity, Gandhinagar", "Gandhinagar", "+91 79 4001 0006", 0.0, 0, 0, 0, 4.8, true, "Express Café & Bakery", "Opening January 2027", "Opening Soon", 23.1890, 72.6280, "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800");
    }

    private void createOutlet(String name, String brand, String address, String city, String phone, Double rev, Integer members, Integer abv, Integer coupons, Double rating, Boolean upcoming, String concept, String launchDate, String hours, Double lat, Double lng, String img) {
        Outlet o = new Outlet();
        o.setName(name);
        o.setBrand(brand);
        o.setAddress(address);
        o.setCity(city);
        o.setContactNumber(phone);
        o.setRevenueLakhs(rev);
        o.setActiveMembers(members);
        o.setAverageBillValue(abv);
        o.setCouponsRedeemed(coupons);
        o.setRating(rating);
        o.setIsUpcoming(upcoming);
        o.setConceptTag(concept);
        o.setTargetLaunchDate(launchDate);
        o.setOpeningHours(hours);
        o.setLatitude(lat);
        o.setLongitude(lng);
        o.setImageUrl(img);
        outletRepository.save(o);
    }

    private void seedMembers() {
        MemberProfile rahul = new MemberProfile();
        rahul.setFullName("Rahul Mehta");
        rahul.setFirstName("Rahul");
        rahul.setMembershipId("YSM-2024-04821");
        rahul.setMembershipType("SIGNATURE SUBSCRIBER");
        rahul.setSubscriptionTier("SIGNATURE");
        rahul.setMobile("+91 98250 12345");
        rahul.setEmail("rahul.mehta@yanki.in");
        rahul.setStatus("Active");
        rahul.setIssuedDate(LocalDate.now().minusMonths(3));
        rahul.setExpiryDate(LocalDate.now().plusMonths(9));
        rahul.setTotalSavings(24500);
        rahul.setCouponsUsed(5);
        rahul.setCouponsTotal(12);
        rahul.setLoyaltyPoints(125000);
        rahul.setLoyaltyGoal(250000);
        rahul.setPendingDues(0);
        rahul.setTotalSpend(68500);
        rahul.setLastVisit("Today");
        rahul.setBirthday("1992-06-15");
        rahul.setDobLocked(true);
        rahul.setAnniversaryDate("2018-12-08");
        rahul.setIsMarried("Yes");
        rahul.setSpouseName("Ananya Mehta");
        memberProfileRepository.save(rahul);

        LoyaltyTransaction t1 = new LoyaltyTransaction();
        t1.setMembershipId(rahul.getMembershipId());
        t1.setTitle("Dine-in at Yanki Sizzlerr Bodakdev");
        t1.setDescription("POS Bill #POS-88210 (₹1 Net Spend = 1 Point)");
        t1.setPoints(2850);
        t1.setType("EARN");
        t1.setOutletName("Yanki Sizzlerr Bodakdev");
        t1.setTransactionTime(LocalDateTime.now().minusDays(2));
        loyaltyTransactionRepository.save(t1);

        LoyaltyTransaction t2 = new LoyaltyTransaction();
        t2.setMembershipId(rahul.getMembershipId());
        t2.setTitle("Annual Signature Subscription Perk");
        t2.setDescription("Welcome VIP tier points bonus");
        t2.setPoints(5000);
        t2.setType("BONUS");
        t2.setOutletName("All Yanki Outlets");
        t2.setTransactionTime(LocalDateTime.now().minusMonths(3));
        MemberProfile guest = new MemberProfile();
        guest.setFullName("Guest 1122");
        guest.setFirstName("Guest");
        guest.setMembershipId("YSM-2024-7416");
        guest.setMembershipType("SIGNATURE SUBSCRIBER");
        guest.setSubscriptionTier("SIGNATURE");
        guest.setMobile("+91 9822001122");
        guest.setEmail("guest.1122@sizzlo.in");
        guest.setStatus("Active");
        guest.setIssuedDate(LocalDate.now().minusMonths(1));
        guest.setExpiryDate(LocalDate.now().plusMonths(11));
        guest.setTotalSavings(14500);
        guest.setCouponsUsed(6);
        guest.setCouponsTotal(12);
        guest.setLoyaltyPoints(65000);
        guest.setLoyaltyGoal(250000);
        guest.setPendingDues(0);
        guest.setTotalSpend(34200);
        guest.setLastVisit("Today");
        guest.setBirthday("1995-10-12");
        guest.setDobLocked(true);
        memberProfileRepository.save(guest);
    }

    private void seedCoupons() {
        createCoupon("C-10D-04821", "10% Flat Dining Discount", "10% off entire bill", "PERCENT", 10.0, 7, 12, LocalDate.now().plusMonths(9), "available", "All Yanki Outlets", "royal", "YSM-2024-04821");
        createCoupon("C-BDAY-04821", "15% Birthday Celebration", "15% off member dining + chef dessert", "PERCENT", 15.0, 1, 1, LocalDate.now().plusMonths(9), "available", "All Yanki Outlets", "gold", "YSM-2024-04821");
        createCoupon("C-CPL50-04821", "50% Off Couple Dinner", "50% off on romantic dinner for two", "PERCENT", 50.0, 1, 1, LocalDate.now().plusMonths(9), "available", "Yanki Sizzlerr & Dough", "gold", "YSM-2024-04821");
        createCoupon("C-DOUGH10-04821", "Dough by Yanki 10% Off", "10% off on spends ₹2,500+", "PERCENT", 10.0, 4, 6, LocalDate.now().plusMonths(9), "available", "Dough by Yanki CG Road", "emerald", "YSM-2024-04821");
        createCoupon("C-ODC20-04821", "Outdoor Catering 20% Off", "20% off catering card rates", "PERCENT", 20.0, 2, 2, LocalDate.now().plusMonths(9), "available", "House of Yanki Banquets", "royal", "YSM-2024-04821");
        createBurnedCoupon("C-10D-04821-USED-POS-77192", "10% Flat Dining Discount (Visit Used)", "10% off entire bill", "PERCENT", 10.0, LocalDate.now().plusMonths(9), "Yanki Sizzlerr Bodakdev", "royal", "YSM-2024-04821", "POS-77192");

        // Guest 1122 coupons (active in mobile session)
        createCoupon("C-10D-2024-7416", "10% Flat Dining Discount", "10% off entire bill", "PERCENT", 10.0, 6, 12, LocalDate.now().plusMonths(11), "available", "All Yanki Outlets", "royal", "YSM-2024-7416");
        createCoupon("C-BDAY-2024-7416", "15% Birthday Celebration", "15% off member dining + complimentary chef surprise", "PERCENT", 15.0, 1, 1, LocalDate.now().plusMonths(11), "available", "All Yanki Outlets", "gold", "YSM-2024-7416");
        createBurnedCoupon("C-10D-2024-7416-USED-POS-84210", "10% Flat Dining Discount (Visit Used)", "10% off entire bill", "PERCENT", 10.0, LocalDate.now().plusMonths(11), "Yanki Sizzlerr SG Highway", "royal", "YSM-2024-7416", "POS-84210");
    }

    private void createBurnedCoupon(String code, String name, String subtitle, String type, Double val, LocalDate expiry, String outlet, String color, String memberId, String invoiceNo) {
        Coupon c = new Coupon();
        c.setCode(code);
        c.setName(name);
        c.setSubtitle(subtitle + " · POS #" + invoiceNo);
        c.setDescription("Redeemed at " + outlet + " on Bill #" + invoiceNo);
        c.setDiscountType(type);
        c.setDiscountValue(val);
        c.setLeftCount(0);
        c.setTotalCount(1);
        c.setExpiryDate(expiry);
        c.setStatus("used");
        c.setOutlet(outlet);
        c.setColor(color);
        c.setMembershipId(memberId);
        c.setBurnedInvoiceNumber(invoiceNo);
        c.setBurnedCashierId("CASHIER-DESK-01");
        c.setBurnedAt(LocalDateTime.now().minusHours(2));
        couponRepository.save(c);
    }

    private void createCoupon(String code, String name, String subtitle, String type, Double val, Integer left, Integer total, LocalDate expiry, String status, String outlet, String color, String memberId) {
        Coupon c = new Coupon();
        c.setCode(code);
        c.setName(name);
        c.setSubtitle(subtitle);
        c.setDescription(name + " - Valid at " + outlet + ".");
        c.setDiscountType(type);
        c.setDiscountValue(val);
        c.setLeftCount(left);
        c.setTotalCount(total);
        c.setExpiryDate(expiry);
        c.setStatus(status);
        c.setOutlet(outlet);
        c.setColor(color);
        c.setMembershipId(memberId);
        c.setTermsAndConditions("1. Non-transferable. 2. One coupon per bill. 3. Zero loyalty points on banquet spend.");
        couponRepository.save(c);
    }

    private void seedReservations() {
        createReservation("R-2841", "Rahul Mehta", "+91 98250 12345", "Yanki Sizzlerr Bodakdev", "Today, 8:30 PM", 4, "Booked", true, "Signature", "Anniversary", "Table 4 reserved - VIP booth");
        createReservation("R-2840", "Priya Shah", "+91 98250 20000", "Dough by Yanki CG Road", "Tomorrow, 7:00 PM", 2, "Booked", false, "Non-Subscriber", "Regular", "Near bakery counter");
        createReservation("R-2839", "Kabir Joshi", "+91 98250 20333", "Yanki Sizzlerr SG Highway", "Tomorrow, 9:00 PM", 6, "Seated", true, "Elite", "Birthday", "Elite Gold VIP Table T1");
    }

    private void createReservation(String ref, String name, String mobile, String outlet, String time, Integer guests, String status, Boolean vip, String tier, String occasion, String notes) {
        Reservation r = new Reservation();
        r.setBookingReference(ref);
        r.setCustomerName(name);
        r.setCustomerMobile(mobile);
        r.setOutlet(outlet);
        r.setReservationTime(time);
        r.setGuests(guests);
        r.setStatus(status);
        r.setVip(vip);
        r.setTierPriorityTag(tier);
        r.setOccasionTag(occasion);
        r.setSpecialRequests(notes);
        reservationRepository.save(r);
    }

    private void seedSalesTarget() {
        SalesTarget st = new SalesTarget();
        st.setTargetMonth("OCT-2026");
        st.setMasterTargetRevenue(2000000.0);
        st.setFloorTargetRevenue(1000000.0);
        st.setCorporateTargetRevenue(1000000.0);
        st.setFloorAchievedRevenue(720000.0);
        st.setCorporateAchievedRevenue(680000.0);
        st.setFloorPlansSold(68);
        st.setCorporatePlansSold(55);
        st.setPayrollApproved(false);
        salesTargetRepository.save(st);
    }

    private void seedBillSettlements() {
        BillSettlement b1 = new BillSettlement();
        b1.setCustomerMobile("+91 98250 12345");
        b1.setCustomerName("Rahul Mehta");
        b1.setMembershipId("YSM-2024-04821");
        b1.setOutletName("Yanki Sizzlerr Bodakdev");
        b1.setPosInvoiceNumber("POS-94210");
        b1.setGrossAmount(3500.0);
        b1.setCouponCode("C-10D-04821");
        b1.setDiscountAmount(350.0);
        b1.setNetPayable(3150.0);
        b1.setPaymentMode("STORE_QR");
        b1.setUpiUtr("428901239841");
        b1.setStatus("PENDING_VERIFICATION");
        billSettlementRepository.save(b1);

        BillSettlement b2 = new BillSettlement();
        b2.setCustomerMobile("+91 98250 20000");
        b2.setCustomerName("Priya Shah");
        b2.setMembershipId("YSM-2024-04822");
        b2.setOutletName("Yanki Sizzlerr Bodakdev");
        b2.setPosInvoiceNumber("POS-94208");
        b2.setGrossAmount(2800.0);
        b2.setCouponCode("C-10D");
        b2.setDiscountAmount(280.0);
        b2.setNetPayable(2520.0);
        b2.setPaymentMode("CASH");
        b2.setStatus("PENDING_VERIFICATION");
        billSettlementRepository.save(b2);
    }

    private void seedBanquets() {
        BanquetInquiry bi = new BanquetInquiry();
        bi.setCustomerName("Adani Enterprises Ltd (HR Desk)");
        bi.setCustomerMobile("+91 98250 44556");
        bi.setEmail("events@adani.com");
        bi.setEventCategory("Corporate Seminar");
        bi.setEventDate("2026-11-15");
        bi.setEventShift("Dinner");
        bi.setEstimatedPax(350);
        bi.setCustomRequirements("Live sizzler counter + executive buffet arrangement");
        bi.setStatus("NEW");
        bi.setAssignedTo("Sales TL Desk");
        bi.setMembershipTier("ELITE");
        bi.setZeroPointsAcknowledged(true);
        banquetInquiryRepository.save(bi);
    }

    private void seedCorporateLeads() {
        CorporateLead cl = new CorporateLead();
        cl.setCompanyName("Cadila Pharmaceuticals");
        cl.setGstNumber("24AAACC1234F1Z8");
        cl.setContactPerson("Mehul Dave (VP HR)");
        cl.setContactMobile("+91 98250 88990");
        cl.setEmail("mehul.dave@cadila.com");
        cl.setEmployeeCount(50);
        cl.setPlanTier("SIGNATURE");
        cl.setDealValue(500000.0);
        cl.setStage("NEGOTIATION");
        cl.setAssignedBdeId("BDE-01");
        cl.setAssignedBdeName("Vikram Patel");
        cl.setTlApproved(false);
        cl.setNotes("Proposal for 50 Signature VIP cards sent with corporate tariff.");
        corporateLeadRepository.save(cl);
    }

    private void seedFloorTables() {
        int[] seats = {2, 4, 4, 6};
        String[] states = {"Available", "Reserved", "Occupied", "Cleaning"};
        String[] guests = {"Rahul Mehta", "Priya Shah", "Kabir Joshi"};

        for (int i = 1; i <= 16; i++) {
            FloorTable t = new FloorTable();
            t.setTableNumber(i);
            t.setSeats(seats[(i - 1) % 4]);
            String state = states[(i - 1) % 4];
            t.setState(state);
            if ("Occupied".equals(state) || "Reserved".equals(state)) {
                t.setGuest(guests[(i - 1) % 3]);
            }
            t.setPremium(i == 3 || i == 11);
            floorTableRepository.save(t);
        }

        waitlistEntryRepository.save(new WaitlistEntry("Mehta family", 4, 12));
        waitlistEntryRepository.save(new WaitlistEntry("Aarav Shah", 2, 7));
    }
}
