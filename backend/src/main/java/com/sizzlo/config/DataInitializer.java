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
    @Autowired private FloorSectionRepository floorSectionRepository;
    @Autowired private WaitlistEntryRepository waitlistEntryRepository;
    @Autowired private ActivityLogRepository activityLogRepository;
    @Autowired private BillSettlementRepository billSettlementRepository;
    @Autowired private BanquetInquiryRepository banquetInquiryRepository;
    @Autowired private CorporateLeadRepository corporateLeadRepository;
    @Autowired private SalesTargetRepository salesTargetRepository;
    @Autowired private FeedbackTicketRepository feedbackTicketRepository;
    @Autowired private OutletTimeSlotRepository outletTimeSlotRepository;
    @Autowired private AdminRoleRepository adminRoleRepository;
    @Autowired private AdminUserRepository adminUserRepository;

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
        adminUserRepository.deleteAll();
        adminRoleRepository.deleteAll();
        initData();
    }

    public void initData() {
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
        if (banquetInquiryRepository.count() == 0) {
            seedBanquets();
        }
        if (corporateLeadRepository.count() == 0) {
            seedCorporateLeads();
        }
        if (floorTableRepository.count() == 0) {
            seedFloorTables();
        }
        if (outletTimeSlotRepository.count() == 0) {
            seedTimeSlots();
        }
        if (adminRoleRepository.count() == 0 || adminUserRepository.count() == 0) {
            seedRbacData();
        }
    }

    private void seedTimeSlots() {
        String[] lunchSlots = {"12:00 PM", "12:30 PM", "01:00 PM", "01:30 PM", "02:00 PM", "02:30 PM", "03:00 PM"};
        String[] dinnerSlots = {"07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM", "09:00 PM", "09:30 PM", "10:00 PM", "10:30 PM"};

        int order = 1;
        for (String slot : lunchSlots) {
            outletTimeSlotRepository.save(new OutletTimeSlot("All Outlets", slot, "LUNCH", true, order++));
        }
        for (String slot : dinnerSlots) {
            outletTimeSlotRepository.save(new OutletTimeSlot("All Outlets", slot, "DINNER", true, order++));
        }
    }

    private void seedOutlets() {
        // Active Operational Outlets (Chapter 05.1)
        createOutlet("Yanki Sizzlerr Bodakdev", "Yanki Sizzlerr", "Bodakdev, Ahmedabad", "Ahmedabad", "+91 79 4001 0001", 86.0, 1842, 2840, 412, 4.9, false, "Heritage Sizzler Dining", null, "12:00 PM - 11:30 PM", 23.0373, 72.5120, "https://images.unsplash.com/photo-1544025162-d76694265947?w=800");
        createOutlet("Yanki Sizzlerr SG Highway", "Yanki Sizzlerr", "SG Highway, Ahmedabad", "Ahmedabad", "+91 79 4001 0002", 64.0, 1124, 2210, 298, 4.8, false, "Signature Dine-in Lounge", null, "12:00 PM - 11:30 PM", 23.0525, 72.5028, "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800");
        createOutlet("Dough by Yanki CG Road", "Dough by Yanki", "CG Road, Ahmedabad", "Ahmedabad", "+91 79 4001 0003", 49.0, 942, 1180, 524, 4.7, false, "Bakery & Artisanal Café", null, "10:00 AM - 11:00 PM", 23.0298, 72.5567, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800");
        createOutlet("House of Yanki Banquets Bopal", "House of Yanki", "South Bopal, Ahmedabad", "Ahmedabad", "+91 79 4001 0004", 95.0, 520, 18400, 140, 4.9, false, "Grand Banquets & Lawns", null, "10:00 AM - 12:00 AM", 23.0135, 72.4645, "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=800");
        createOutlet("Yanki Sizzlerr Vastrapur Lake", "Yanki Sizzlerr", "Opp. Vastrapur Lake, AlphaOne Mall, Vastrapur, Ahmedabad", "Ahmedabad", "+91 98250 12345", 52.0, 820, 2400, 210, 4.9, false, "Lakeview Sizzler & Grill Bar", null, "11:30 AM - 11:30 PM", 23.0402, 72.5309, "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800");

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
        createMember("YSM-1001", "Rahul Mehta", "+91 98250 12345", "rahul.mehta@gujaratmerchants.com", "ELITE VIP CONNOISSEUR", "Active", 42500, 6, 18, 18240, 184500, "Yesterday at Bodakdev Signature");
        createMember("YSM-1002", "Priya Sharma", "+91 98980 23456", "priya.sharma@aerovista.in", "SIGNATURE GOURMET", "Active", 28400, 4, 12, 12450, 112000, "3 days ago at Shilaj");
        createMember("YSM-1003", "Siddharth Patel", "+91 98790 34567", "siddharth@patelinfra.com", "ELITE VIP CONNOISSEUR", "Active", 56800, 8, 18, 24100, 245000, "2 days ago at Navrangpura");
        createMember("YSM-1004", "Ananya Iyer", "+91 98240 45678", "ananya.iyer@zencos.io", "CLASSIC PRIVILEGES", "Active", 14200, 3, 8, 6850, 62400, "1 week ago at Gandhinagar");
        createMember("YSM-1005", "Vikramaditya Singhania", "+91 97270 56789", "vikram@singhaniaholdings.com", "ELITE VIP CONNOISSEUR", "Renewal Due", 68900, 14, 18, 31200, 315000, "5 days ago at Bodakdev Signature");
        createMember("YSM-1006", "Meera Nair", "+91 99090 67890", "meera.nair@designstudio.in", "SIGNATURE GOURMET", "Active", 21500, 3, 12, 9400, 88500, "Yesterday at Shilaj");
        createMember("YSM-1007", "Arjun Kapoor", "+91 98251 78901", "arjun.kapoor@fintechadvisors.com", "CLASSIC PRIVILEGES", "Renewal Due", 16800, 5, 8, 7200, 74200, "2 weeks ago at Navrangpura");
        createMember("YSM-1008", "Divya Desai", "+91 98791 89012", "divya.desai@architects.in", "SIGNATURE GOURMET", "Active", 26500, 5, 12, 11800, 104500, "3 days ago at Bodakdev Signature");
        createMember("YSM-1009", "Kabir Joshi", "+91 99240 90123", "kabir.joshi@joshilaw.com", "ELITE VIP CONNOISSEUR", "Active", 38900, 4, 18, 16500, 162000, "Yesterday at Navrangpura");
        createMember("YSM-1010", "Tanvi Kulkarni", "+91 98981 01234", "tanvi.k@medresearch.org", "CLASSIC PRIVILEGES", "Expired", 18200, 7, 8, 8100, 78000, "1 month ago at Shilaj");
        createMember("YSM-1011", "Aditya Rao", "+91 98252 11223", "aditya.rao@cloudscale.io", "SIGNATURE GOURMET", "Active", 29800, 5, 12, 13200, 119500, "4 days ago at Gandhinagar");
        createMember("YSM-1012", "Pooja Bansal", "+91 98792 22334", "pooja.bansal@bansalexports.com", "ELITE VIP CONNOISSEUR", "Active", 49200, 7, 18, 21900, 208000, "Yesterday at Bodakdev Signature");

        // Non-Subscribed Free Accounts
        createMember("REG-2041", "Chirag Patel", "+91 98253 33445", "chirag.patel@gmail.com", "NON-SUBSCRIBED", "Active", 0, 0, 0, 450, 4200, "Last week at Navrangpura");
        createMember("REG-2042", "Hardik Dave", "+91 98982 44556", "hardik.dave@outlook.com", "NON-SUBSCRIBED", "Active", 0, 0, 0, 620, 6800, "3 days ago at Shilaj");
        createMember("REG-2043", "Bhavin Shah", "+91 98793 55667", "bhavin.shah@yahoo.com", "NON-SUBSCRIBED", "Active", 0, 0, 0, 310, 3500, "5 days ago at Bodakdev Signature");
        createMember("REG-2044", "Nilam Vora", "+91 98241 66778", "nilam.vora@gmail.com", "NON-SUBSCRIBED", "Active", 0, 0, 0, 890, 9400, "Yesterday at Gandhinagar");
        createMember("REG-2045", "Rajesh Bhatt", "+91 97271 77889", "rajesh.bhatt@bhattassociates.in", "NON-SUBSCRIBED", "Active", 0, 0, 0, 1200, 13500, "4 days ago at Navrangpura");
        createMember("REG-2046", "Alok Parikh", "+91 99091 88990", "alok.parikh@technocraft.com", "NON-SUBSCRIBED", "Active", 0, 0, 0, 540, 5200, "2 weeks ago at Shilaj");
        createMember("REG-2047", "Manisha Soni", "+91 98254 99001", "manisha.soni@gmail.com", "NON-SUBSCRIBED", "Active", 0, 0, 0, 780, 8100, "6 days ago at Bodakdev Signature");
        createMember("REG-2048", "Deep Contractor", "+91 98794 00112", "deep.c@contractorinfra.in", "NON-SUBSCRIBED", "Active", 0, 0, 0, 950, 10200, "3 days ago at Navrangpura");
        createMember("REG-2049", "Jignesh Panchal", "+91 99241 11223", "jignesh.panchal@panchalsteel.com", "NON-SUBSCRIBED", "Active", 0, 0, 0, 410, 4600, "Yesterday at Shilaj");
        createMember("REG-2050", "Hetal Vyas", "+91 98983 22334", "hetal.vyas@eduworld.org", "NON-SUBSCRIBED", "Active", 0, 0, 0, 360, 3900, "1 week ago at Gandhinagar");
        createMember("REG-2051", "Keyur Barot", "+91 98255 33445", "keyur.barot@barotmedia.in", "NON-SUBSCRIBED", "Active", 0, 0, 0, 210, 2400, "Just joined via Mobile App");
        createMember("REG-2052", "Ritu Agrawal", "+91 98795 44556", "ritu.agrawal@gmail.com", "NON-SUBSCRIBED", "Active", 0, 0, 0, 150, 1800, "Just joined via Mobile App");
    }

    private void createMember(String id, String fullName, String mobile, String email, String tier, String status, int savings, int used, int total, int points, int spend, String lastVisit) {
        MemberProfile m = new MemberProfile();
        m.setMembershipId(id);
        m.setFullName(fullName);
        m.setFirstName(fullName.split(" ")[0]);
        m.setMobile(mobile);
        m.setEmail(email);
        m.setMembershipType(tier);
        m.setSubscriptionTier(tier.contains("ELITE") ? "ELITE" : tier.contains("SIGNATURE") ? "SIGNATURE" : tier.contains("CLASSIC") ? "CLASSIC" : "FREE");
        m.setStatus(status);
        m.setIssuedDate(LocalDate.now().minusMonths(6));
        m.setExpiryDate("Active".equalsIgnoreCase(status) ? LocalDate.now().plusMonths(6) : LocalDate.now().minusDays(10));
        m.setTotalSavings(savings);
        m.setCouponsUsed(used);
        m.setCouponsTotal(total);
        m.setLoyaltyPoints(points);
        m.setLoyaltyGoal(25000);
        m.setPendingDues("Renewal Due".equalsIgnoreCase(status) ? 10000 : 0);
        m.setTotalSpend(spend);
        m.setLastVisit(lastVisit);
        m.setDobLocked(true);
        memberProfileRepository.save(m);
    }

    private void seedCoupons() {
        createCoupon("C-10D-04821", "10% Flat Dining Discount", "10% off entire bill", "PERCENT", 10.0, 7, 12, LocalDate.now().plusMonths(9), "available", "All Yanki Outlets", "royal", "YSM-2024-04821");
        createCoupon("C-BDAY-04821", "15% Birthday Celebration", "15% off member dining + chef dessert", "PERCENT", 15.0, 1, 1, LocalDate.now().plusMonths(9), "available", "All Yanki Outlets", "gold", "YSM-2024-04821");
        createCoupon("C-CPL50-04821", "50% Off Couple Dinner", "50% off on romantic dinner for two", "PERCENT", 50.0, 1, 1, LocalDate.now().plusMonths(9), "available", "Yanki Sizzlerr & Dough", "gold", "YSM-2024-04821");
        createCoupon("C-DOUGH10-04821", "Dough by Yanki 10% Off", "10% off on spends Rs. 2,500+", "PERCENT", 10.0, 4, 6, LocalDate.now().plusMonths(9), "available", "Dough by Yanki CG Road", "emerald", "YSM-2024-04821");
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
        r.setBookingAdvance(vip ? 0.0 : 100.0);
        r.setAdvancePaid(true);
        r.setAdvanceDeducted(false);
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
        if (floorSectionRepository.count() == 0) {
            floorSectionRepository.save(new FloorSection("Main Dining Floor", "Navrangpura", "Ground level primary dining hall"));
            floorSectionRepository.save(new FloorSection("Rooftop Terrace", "Navrangpura", "Open-air scenic dining terrace"));
            floorSectionRepository.save(new FloorSection("VIP Private Dining", "Navrangpura", "Exclusive suite for connoisseurs"));
        }

        int[] seats = {2, 4, 4, 6};
        for (int i = 1; i <= 14; i++) {
            FloorTable t = new FloorTable();
            t.setTableNumber(i);
            t.setSeats(seats[(i - 1) % 4]);
            t.setState("Available");
            t.setOutletName("Navrangpura");
            t.setFloorSection(i <= 8 ? "Main Dining Floor" : "Rooftop Terrace");
            t.setPremium(i == 3 || i == 7 || i == 11);
            floorTableRepository.save(t);
        }

        if (waitlistEntryRepository.count() == 0) {
            waitlistEntryRepository.save(new WaitlistEntry("Mehta family", 4, 12));
            waitlistEntryRepository.save(new WaitlistEntry("Aarav Shah", 2, 7));
        }
    }

    private void seedRbacData() {
        if (adminRoleRepository.count() == 0) {
            // Level 1: Super Admin (Owner)
            AdminRole superAdmin = new AdminRole(
                    "SUPER_ADMIN",
                    "Owner (Super Admin)",
                    "Group Owner & Managing Director with global oversight across all outlets",
                    1,
                    "DASHBOARD_VIEW,INSIGHTS_VIEW,CEO_SUITE_VIEW,CUSTOMERS_MANAGE,MEMBERSHIPS_MANAGE,LOYALTY_MANAGE,COUPONS_MANAGE,PAYMENTS_SETTLE_APPROVE,RESERVATIONS_MANAGE,FLOOR_TABLES_MANAGE,REDEMPTION_VALIDATE,OUTLETS_MANAGE,EVENTS_MANAGE,MARKETING_MANAGE,USER_MGMT,FEEDBACK_VIEW",
                    true
            );
            adminRoleRepository.save(superAdmin);

            // Level 2: Branch Admin
            AdminRole branchAdmin = new AdminRole(
                    "BRANCH_ADMIN",
                    "Branch Admin / General Manager",
                    "Full administrative authority within their assigned outlet branch",
                    2,
                    "DASHBOARD_VIEW,CUSTOMERS_MANAGE,LOYALTY_MANAGE,COUPONS_MANAGE,PAYMENTS_SETTLE_APPROVE,RESERVATIONS_MANAGE,FLOOR_TABLES_MANAGE,REDEMPTION_VALIDATE,OUTLETS_MANAGE,EVENTS_MANAGE,USER_MGMT,FEEDBACK_VIEW",
                    true
            );
            adminRoleRepository.save(branchAdmin);

            // Level 3: Manager
            AdminRole manager = new AdminRole(
                    "MANAGER",
                    "Operations Manager / Shift Lead",
                    "Daily dining operations, table seating, reservations, staff shifts and approvals",
                    3,
                    "DASHBOARD_VIEW,CUSTOMERS_MANAGE,RESERVATIONS_MANAGE,FLOOR_TABLES_MANAGE,REDEMPTION_VALIDATE,PAYMENTS_SETTLE_APPROVE,FEEDBACK_VIEW",
                    true
            );
            adminRoleRepository.save(manager);

            // Level 4: Floor Captain
            AdminRole floorCaptain = new AdminRole(
                    "FLOOR_CAPTAIN",
                    "Floor Captain / Head Waiter",
                    "Table seating assignments, waitlist coordination and dining floor management",
                    4,
                    "RESERVATIONS_MANAGE,FLOOR_TABLES_MANAGE,REDEMPTION_VALIDATE",
                    true
            );
            adminRoleRepository.save(floorCaptain);
        }

        if (adminUserRepository.count() == 0) {
            // 1. Super Admin (Owner)
            adminUserRepository.save(new AdminUser(
                    "owner@sizzlo.com",
                    "owner@sizzlo.com",
                    "Rajesh Patel (Group Owner)",
                    "+91 98250 11000",
                    "admin123",
                    "SUPER_ADMIN",
                    "Owner (Super Admin)",
                    "All Branches",
                    null,
                    "SYSTEM"
            ));

            // 2. Branch Admin: Yanki Sizzlerr Bodakdev
            adminUserRepository.save(new AdminUser(
                    "bodakdev.admin@sizzlo.com",
                    "bodakdev.admin@sizzlo.com",
                    "Sanjay Verma (Bodakdev GM)",
                    "+91 98251 22001",
                    "admin123",
                    "BRANCH_ADMIN",
                    "Branch Admin / General Manager",
                    "Yanki Sizzlerr Bodakdev",
                    1L,
                    "owner@sizzlo.com"
            ));

            // 3. Branch Admin: Yanki Sizzlerr SG Highway
            adminUserRepository.save(new AdminUser(
                    "sghighway.admin@sizzlo.com",
                    "sghighway.admin@sizzlo.com",
                    "Neha Trivedi (SG Highway GM)",
                    "+91 98252 33002",
                    "admin123",
                    "BRANCH_ADMIN",
                    "Branch Admin / General Manager",
                    "Yanki Sizzlerr SG Highway",
                    2L,
                    "owner@sizzlo.com"
            ));

            // 4. Branch Admin: Yanki Sizzlerr Vastrapur Lake
            adminUserRepository.save(new AdminUser(
                    "vastrapur.admin@sizzlo.com",
                    "vastrapur.admin@sizzlo.com",
                    "Pooja Desai (Vastrapur GM)",
                    "+91 98255 66005",
                    "admin123",
                    "BRANCH_ADMIN",
                    "Branch Admin / General Manager",
                    "Yanki Sizzlerr Vastrapur Lake",
                    5L,
                    "owner@sizzlo.com"
            ));

            // 5. Manager: Yanki Sizzlerr Bodakdev
            adminUserRepository.save(new AdminUser(
                    "manager.bodakdev@sizzlo.com",
                    "manager.bodakdev@sizzlo.com",
                    "Amit Shah (Operations Manager)",
                    "+91 98253 44003",
                    "admin123",
                    "MANAGER",
                    "Operations Manager / Shift Lead",
                    "Yanki Sizzlerr Bodakdev",
                    1L,
                    "bodakdev.admin@sizzlo.com"
            ));

            // 6. Floor Captain: Yanki Sizzlerr Bodakdev
            adminUserRepository.save(new AdminUser(
                    "captain.rahul@sizzlo.com",
                    "captain.rahul@sizzlo.com",
                    "Rahul Mehta (Floor Captain)",
                    "+91 98254 55004",
                    "admin123",
                    "FLOOR_CAPTAIN",
                    "Floor Captain / Head Waiter",
                    "Yanki Sizzlerr Bodakdev",
                    1L,
                    "manager.bodakdev@sizzlo.com"
            ));
        }
    }
}
