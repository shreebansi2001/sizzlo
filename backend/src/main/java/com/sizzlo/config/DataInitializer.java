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
    @Autowired private SalesStaffQuotaRepository salesStaffQuotaRepository;
    @Autowired private SalesTrainingModuleRepository salesTrainingModuleRepository;
    @Autowired private SalesRewardContestRepository salesRewardContestRepository;
    @Autowired private SalesCommissionRecordRepository salesCommissionRecordRepository;
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
        if (outletTimeSlotRepository.count() == 0) {
            seedTimeSlots();
        }
        if (adminRoleRepository.count() == 0 || adminUserRepository.count() == 0) {
            seedRbacData();
        }
        if (salesStaffQuotaRepository.count() == 0) {
            seedSalesEcosystem();
        }
        cleanupDummyData();
    }

    private void cleanupDummyData() {
        try {
            // Remove known dummy seeded accounts while keeping real user registrations
            memberProfileRepository.findAll().forEach(m -> {
                if ("rahul.mehta@yanki.in".equalsIgnoreCase(m.getEmail()) 
                        || "Guest 1122".equalsIgnoreCase(m.getFullName())
                        || "+91 9822001122".equals(m.getMobile())
                        || "YSM-2024-04821".equalsIgnoreCase(m.getMembershipId())) {
                    memberProfileRepository.delete(m);
                }
            });
        } catch (Exception ignored) {}
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
        createOutlet("Yanki Sizzlerr Bodakdev", "Yanki Sizzlerr", "Bodakdev, Ahmedabad", "Ahmedabad", "+91 79 4001 0001", 0.0, 0, 0, 0, 4.9, false, "Heritage Sizzler Dining", null, "12:00 PM - 11:30 PM", 23.0373, 72.5120, "");
        createOutlet("Yanki Sizzlerr SG Highway", "Yanki Sizzlerr", "SG Highway, Ahmedabad", "Ahmedabad", "+91 79 4001 0002", 0.0, 0, 0, 0, 4.8, false, "Signature Dine-in Lounge", null, "12:00 PM - 11:30 PM", 23.0525, 72.5028, "");
        createOutlet("Dough by Yanki CG Road", "Dough by Yanki", "CG Road, Ahmedabad", "Ahmedabad", "+91 79 4001 0003", 0.0, 0, 0, 0, 4.7, false, "Bakery & Artisanal Café", null, "10:00 AM - 11:00 PM", 23.0298, 72.5567, "");
        createOutlet("House of Yanki Banquets Bopal", "House of Yanki", "South Bopal, Ahmedabad", "Ahmedabad", "+91 79 4001 0004", 0.0, 0, 0, 0, 4.9, false, "Grand Banquets & Lawns", null, "10:00 AM - 12:00 AM", 23.0135, 72.4645, "");
        createOutlet("Yanki Sizzlerr Vastrapur Lake", "Yanki Sizzlerr", "Opp. Vastrapur Lake, AlphaOne Mall, Vastrapur, Ahmedabad", "Ahmedabad", "+91 98250 12345", 0.0, 0, 0, 0, 4.9, false, "Lakeview Sizzler & Grill Bar", null, "11:30 AM - 11:30 PM", 23.0402, 72.5309, "");

        // Upcoming Outlets ("Coming Soon" Pipeline, Chapter 05.2)
        createOutlet("Yanki Sizzlerr Sindhu Bhavan Road", "Yanki Sizzlerr", "Sindhu Bhavan Road, Ahmedabad", "Ahmedabad", "+91 79 4001 0005", 0.0, 0, 0, 0, 4.9, true, "Rooftop Sizzler Lounge", "Opening December 2026", "Opening Soon", 23.0450, 72.5050, "");
        createOutlet("Dough by Yanki Infocity", "Dough by Yanki", "Infocity, Gandhinagar", "Gandhinagar", "+91 79 4001 0006", 0.0, 0, 0, 0, 4.8, true, "Express Café & Bakery", "Opening January 2027", "Opening Soon", 23.1890, 72.6280, "");
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

            // Level 2B: Sales Team Lead (Sales Head)
            AdminRole salesTlRole = new AdminRole(
                    "SALES_TL",
                    "Sales Team Lead (Head of Sales)",
                    "Target distribution, multi-branch sales operations, B2B deal approvals and training",
                    2,
                    "DASHBOARD_VIEW,SALES_MANAGE,CUSTOMERS_MANAGE,MEMBERSHIPS_MANAGE,EVENTS_MANAGE",
                    true
            );
            adminRoleRepository.save(salesTlRole);
        }

        if (adminUserRepository.findByUsername("salestl@sizzlo.com").isEmpty()) {
            adminUserRepository.save(new AdminUser(
                    "salestl@sizzlo.com",
                    "salestl@sizzlo.com",
                    "Pooja Sharma (Sales Head / TL)",
                    "+91 98250 99000",
                    "admin123",
                    "SALES_TL",
                    "Sales Team Lead (Head of Sales)",
                    "All Branches",
                    null,
                    "SYSTEM"
            ));
        }

        if (adminUserRepository.count() <= 1) {
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

    private void seedSalesEcosystem() {
        // 1. Master Sales Target
        SalesTarget target = salesTargetRepository.findByTargetMonth("OCT-2026").orElseGet(SalesTarget::new);
        target.setTargetMonth("OCT-2026");
        target.setMasterTargetRevenue(2000000.0);
        target.setFloorTargetRevenue(1000000.0);
        target.setCorporateTargetRevenue(1000000.0);
        target.setFloorAchievedRevenue(640000.0);
        target.setCorporateAchievedRevenue(600000.0);
        target.setFloorPlansSold(64);
        target.setCorporatePlansSold(50);
        target.setPayrollApproved(false);
        salesTargetRepository.save(target);

        // 2. Staff Quotas
        // Floor Captain 1 - Bodakdev
        SalesStaffQuota q1 = new SalesStaffQuota();
        q1.setStaffId("CAPT-01");
        q1.setStaffName("Rajesh Sharma");
        q1.setRoleType("FLOOR");
        q1.setBranchName("Yanki Sizzlerr Bodakdev");
        q1.setTargetMonth("OCT-2026");
        q1.setTargetRevenue(350000.0);
        q1.setTargetCount(35);
        q1.setAchievedRevenue(280000.0);
        q1.setAchievedCount(28);
        q1.setCalculatedCommission(11200.0);
        q1.setBonusEarned(1500.0);
        salesStaffQuotaRepository.save(q1);

        // Floor Captain 2 - Dough SBR
        SalesStaffQuota q2 = new SalesStaffQuota();
        q2.setStaffId("CAPT-02");
        q2.setStaffName("Deepak Joshi");
        q2.setRoleType("FLOOR");
        q2.setBranchName("Dough by Yanki SBR");
        q2.setTargetMonth("OCT-2026");
        q2.setTargetRevenue(350000.0);
        q2.setTargetCount(35);
        q2.setAchievedRevenue(240000.0);
        q2.setAchievedCount(24);
        q2.setCalculatedCommission(9600.0);
        q2.setBonusEarned(0.0);
        salesStaffQuotaRepository.save(q2);

        // Floor Captain 3 - Prahladnagar (Lagging Rep)
        SalesStaffQuota q3 = new SalesStaffQuota();
        q3.setStaffId("CAPT-03");
        q3.setStaffName("Amit Shah");
        q3.setRoleType("FLOOR");
        q3.setBranchName("Yanki Sizzlerr Prahladnagar");
        q3.setTargetMonth("OCT-2026");
        q3.setTargetRevenue(300000.0);
        q3.setTargetCount(30);
        q3.setAchievedRevenue(120000.0);
        q3.setAchievedCount(12);
        q3.setCalculatedCommission(4800.0);
        q3.setBonusEarned(0.0);
        salesStaffQuotaRepository.save(q3);

        // Corporate BDE 1 - Senior BDE
        SalesStaffQuota q4 = new SalesStaffQuota();
        q4.setStaffId("BDE-01");
        q4.setStaffName("Priya Patel");
        q4.setRoleType("CORPORATE");
        q4.setBranchName("Corporate HQ");
        q4.setTargetMonth("OCT-2026");
        q4.setTargetRevenue(600000.0);
        q4.setTargetCount(4);
        q4.setAchievedRevenue(450000.0);
        q4.setAchievedCount(3);
        q4.setCalculatedCommission(22500.0);
        q4.setBonusEarned(2500.0);
        salesStaffQuotaRepository.save(q4);

        // Corporate BDE 2 - Junior BDE (Lagging Rep)
        SalesStaffQuota q5 = new SalesStaffQuota();
        q5.setStaffId("BDE-02");
        q5.setStaffName("Vikram Singhania");
        q5.setRoleType("CORPORATE");
        q5.setBranchName("Corporate HQ");
        q5.setTargetMonth("OCT-2026");
        q5.setTargetRevenue(400000.0);
        q5.setTargetCount(3);
        q5.setAchievedRevenue(150000.0);
        q5.setAchievedCount(1);
        q5.setCalculatedCommission(4500.0);
        q5.setBonusEarned(0.0);
        salesStaffQuotaRepository.save(q5);

        // 3. Corporate Leads Pipeline
        if (corporateLeadRepository.count() == 0) {
            CorporateLead l1 = new CorporateLead();
            l1.setCompanyName("Zydus Lifesciences Ltd");
            l1.setGstNumber("24AAACZ1234F1Z8");
            l1.setContactPerson("Ramesh Varma (HR VP)");
            l1.setContactMobile("+91 98250 11223");
            l1.setEmail("ramesh.v@zyduslife.com");
            l1.setEmployeeCount(30);
            l1.setPlanTier("SIGNATURE");
            l1.setDealValue(300000.0);
            l1.setStage("CLOSED_WON");
            l1.setAssignedBdeId("BDE-01");
            l1.setAssignedBdeName("Priya Patel");
            l1.setTlApproved(true);
            corporateLeadRepository.save(l1);

            CorporateLead l2 = new CorporateLead();
            l2.setCompanyName("Adani Enterprise Group");
            l2.setGstNumber("24AAACA5678B1Z2");
            l2.setContactPerson("Sneha Roy (Admin Lead)");
            l2.setContactMobile("+91 98251 44556");
            l2.setEmail("sneha.roy@adani.com");
            l2.setEmployeeCount(30);
            l2.setPlanTier("ELITE");
            l2.setDealValue(450000.0);
            l2.setStage("NEGOTIATION");
            l2.setAssignedBdeId("BDE-01");
            l2.setAssignedBdeName("Priya Patel");
            corporateLeadRepository.save(l2);

            CorporateLead l3 = new CorporateLead();
            l3.setCompanyName("Torrent Pharmaceuticals");
            l3.setGstNumber("24AAACT9988C1Z4");
            l3.setContactPerson("Kunal Parekh (Procurement)");
            l3.setContactMobile("+91 98252 77889");
            l3.setEmail("kunal.p@torrentpharma.com");
            l3.setEmployeeCount(20);
            l3.setPlanTier("SIGNATURE");
            l3.setDealValue(200000.0);
            l3.setStage("PROPOSAL_SENT");
            l3.setAssignedBdeId("BDE-02");
            l3.setAssignedBdeName("Vikram Singhania");
            corporateLeadRepository.save(l3);
        }

        // 4. Contests & Rewards
        if (salesRewardContestRepository.count() == 0) {
            SalesRewardContest c1 = new SalesRewardContest();
            c1.setContestTitle("Diwali Gold Rush 2026: Elite Tier Sellers");
            c1.setDescription("Highest total volume of Elite ₹15,000 passes sold before Oct 31 receives ₹15,000 cash bonus + Trophy.");
            c1.setChannel("ALL");
            c1.setPrizeReward("₹15,000 Cash Bonus & Yanki Gold Trophy");
            c1.setTargetCriteria("Sell min 15 Elite VIP memberships in October");
            c1.setStartDate(LocalDate.of(2026, 10, 1));
            c1.setEndDate(LocalDate.of(2026, 10, 31));
            c1.setStatus("ACTIVE");
            salesRewardContestRepository.save(c1);

            SalesRewardContest c2 = new SalesRewardContest();
            c2.setContestTitle("Floor Captain Weekend Blitzkrieg");
            c2.setDescription("Top converting Captain on dining tables on Friday-Sunday wins instant ₹7,500 bonus.");
            c2.setChannel("FLOOR");
            c2.setPrizeReward("₹7,500 Cash Payout + Sizzlo Badge");
            c2.setTargetCriteria("Max table signups across Bodakdev & SBR");
            c2.setStartDate(LocalDate.of(2026, 10, 9));
            c2.setEndDate(LocalDate.of(2026, 10, 12));
            c2.setStatus("ACTIVE");
            salesRewardContestRepository.save(c2);
        }

        // 5. Training Modules
        if (salesTrainingModuleRepository.count() == 0) {
            SalesTrainingModule t1 = new SalesTrainingModule();
            t1.setTitle("30-Second Table Pitch for Diners: Overcoming 'Let me think'");
            t1.setCategory("FLOOR_PITCH");
            t1.setTargetAudience("FLOOR_CAPTAINS");
            t1.setDescription("Proven restaurant table opening and closing scripts to enroll patrons before the bill arrives.");
            t1.setContentHtml("<h4>The 3-Step Table Enrollment Formula</h4><p>1. <strong>The Savings Hook:</strong> 'Sir, on your bill of ₹3,400 today, our Signature Membership instantly saves you ₹340 today + gives you 1 Free 50% Couple Dinner coupon worth ₹1,500!'</p><p>2. <strong>Address Hesitation:</strong> 'You don't need any credit card lock-in. We settle it right on your table POS in 30 seconds.'</p><p>3. <strong>The 250k Points Renewal Rule:</strong> 'Dine regularly and your next year membership is 100% free!'</p>");
            t1.setDurationMinutes(15);
            salesTrainingModuleRepository.save(t1);

            SalesTrainingModule t2 = new SalesTrainingModule();
            t2.setTitle("Corporate Wellness Dining Package: B2B Pitch & GST Offset");
            t2.setCategory("CORPORATE_PITCH");
            t2.setTargetAudience("CORPORATE_BDES");
            t2.setDescription("Guide for BDEs pitching HR directors and Procurement teams on employee dining perks with GST input tax credit.");
            t2.setContentHtml("<h4>Executive Corporate Pitch Script</h4><p>Highlight 100% business expense claimability with 18% GST input credit, employee retention benefits, and direct VIP reservation routing at Yanki Sizzlerr and House of Yanki Banquets.</p>");
            t2.setDurationMinutes(20);
            salesTrainingModuleRepository.save(t2);
        }

        // 6. Commission Records
        if (salesCommissionRecordRepository.count() == 0) {
            createCommRecord("TXN-OCT-001", "CAPT-01", "Rajesh Sharma", "FLOOR", "Yanki Sizzlerr Bodakdev", "+91 98250 11001", "Kavita Shah", "SIGNATURE", 10000.0, 400.0);
            createCommRecord("TXN-OCT-002", "CAPT-01", "Rajesh Sharma", "FLOOR", "Yanki Sizzlerr Bodakdev", "+91 98250 11002", "Harshil Patel", "ELITE", 15000.0, 700.0);
            createCommRecord("TXN-OCT-003", "CAPT-02", "Deepak Joshi", "FLOOR", "Dough by Yanki SBR", "+91 98250 11003", "Siddharth Joshi", "SIGNATURE", 10000.0, 400.0);
            createCommRecord("TXN-OCT-004", "CAPT-03", "Amit Shah", "FLOOR", "Yanki Sizzlerr Prahladnagar", "+91 98250 11004", "Mayur Desai", "CLASSIC", 5000.0, 200.0);
            createCommRecord("TXN-OCT-CORP-01", "BDE-01", "Priya Patel", "CORPORATE", "Corporate HQ", "+91 98250 11223", "Zydus Lifesciences", "SIGNATURE", 300000.0, 15000.0);
        }
    }

    private void createCommRecord(String txnId, String staffId, String staffName, String channel, String branch, String mobile, String customer, String tier, Double fee, Double comm) {
        SalesCommissionRecord r = new SalesCommissionRecord();
        r.setTransactionId(txnId);
        r.setStaffId(staffId);
        r.setStaffName(staffName);
        r.setChannel(channel);
        r.setBranchName(branch);
        r.setCustomerMobile(mobile);
        r.setCustomerName(customer);
        r.setPlanTier(tier);
        r.setPlanFee(fee);
        r.setCommissionAmount(comm);
        r.setTargetMonth("OCT-2026");
        r.setPayoutStatus("APPROVED");
        r.setCreatedAt(LocalDateTime.now().minusDays(2));
        salesCommissionRecordRepository.save(r);
    }
}
