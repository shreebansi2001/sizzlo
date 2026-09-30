package com.sizzlo.config;

import com.sizzlo.entity.Coupon;
import com.sizzlo.entity.LoyaltyTransaction;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.entity.Outlet;
import com.sizzlo.entity.Reservation;
import com.sizzlo.repository.CouponRepository;
import com.sizzlo.repository.LoyaltyTransactionRepository;
import com.sizzlo.repository.MemberProfileRepository;
import com.sizzlo.repository.OutletRepository;
import com.sizzlo.repository.ReservationRepository;
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

    @Override
    public void run(String... args) {
        if (memberProfileRepository.count() > 0) return;

        // 1. Seed Outlets
        seedOutlets();

        // 2. Seed Primary Member Profile (Rahul Mehta) + CRM Customers
        seedMembers();

        // 3. Seed Coupons
        seedCoupons();

        // 4. Seed Reservations
        seedReservations();

        // 5. Seed Loyalty Transactions
        seedLoyaltyTransactions();
    }

    private void seedOutlets() {
        createOutlet("Yanki Signature", "Bodakdev, Ahmedabad", "Ahmedabad", "+91 79 4001 0001", 86.0, 1842, 2840, 412, 4.8);
        createOutlet("Yanki Lounge SG", "SG Highway, Ahmedabad", "Ahmedabad", "+91 79 4001 0002", 64.0, 1124, 2210, 298, 4.7);
        createOutlet("Dough by Yanki", "CG Road, Ahmedabad", "Ahmedabad", "+91 79 4001 0003", 49.0, 942, 1180, 524, 4.6);
        createOutlet("Yanki Banquet", "Bopal, Ahmedabad", "Ahmedabad", "+91 79 4001 0004", 38.0, 412, 18400, 86, 4.9);
        createOutlet("Yanki Café CG", "CG Road, Ahmedabad", "Ahmedabad", "+91 79 4001 0005", 28.0, 262, 920, 142, 4.5);
    }

    private void createOutlet(String name, String address, String city, String phone, Double rev, Integer members, Integer abv, Integer coupons, Double rating) {
        Outlet o = new Outlet();
        o.setName(name);
        o.setAddress(address);
        o.setCity(city);
        o.setContactNumber(phone);
        o.setRevenueLakhs(rev);
        o.setActiveMembers(members);
        o.setAverageBillValue(abv);
        o.setCouponsRedeemed(coupons);
        o.setRating(rating);
        outletRepository.save(o);
    }

    private void seedMembers() {
        MemberProfile rahul = new MemberProfile();
        rahul.setFullName("Rahul Mehta");
        rahul.setFirstName("Rahul");
        rahul.setMembershipId("YSM-2024-04821");
        rahul.setMembershipType("VIP MEMBER");
        rahul.setMobile("+91 98250 12345");
        rahul.setEmail("rahul.mehta@yanki.in");
        rahul.setStatus("Active");
        rahul.setIssuedDate(LocalDate.of(2024, 6, 20));
        rahul.setExpiryDate(LocalDate.of(2027, 6, 20));
        rahul.setTotalSavings(24500);
        rahul.setCouponsUsed(5);
        rahul.setCouponsTotal(12);
        rahul.setLoyaltyPoints(125000);
        rahul.setLoyaltyGoal(250000);
        rahul.setPendingDues(0);
        rahul.setTotalSpend(68500);
        rahul.setLastVisit("Today");
        memberProfileRepository.save(rahul);

        String[] names = {"Priya Shah", "Arjun Patel", "Sneha Iyer", "Kabir Joshi", "Riya Desai", "Vivaan Kumar", "Ananya Rao", "Aditya Verma", "Isha Kapoor", "Dev Nair"};
        for (int i = 0; i < names.length; i++) {
            MemberProfile m = new MemberProfile();
            m.setFullName(names[i]);
            m.setFirstName(names[i].split(" ")[0]);
            m.setMembershipId(String.format("YSM-2024-%05d", 4002 + i));
            m.setMembershipType(i % 3 == 0 ? "BLACK DIAMOND" : "VIP MEMBER");
            m.setMobile(String.format("+91 98250 %05d", 20000 + i * 111));
            m.setEmail(names[i].toLowerCase().replace(" ", ".") + "@gmail.com");
            m.setStatus(i % 5 == 0 ? "Renewal Due" : "Active");
            m.setIssuedDate(LocalDate.now().minusMonths(4 + i));
            m.setExpiryDate(LocalDate.now().plusMonths(8 + i));
            m.setTotalSavings(12000 + i * 2500);
            m.setCouponsUsed(2 + (i % 6));
            m.setCouponsTotal(12);
            m.setLoyaltyPoints(15000 + i * 9000);
            m.setLoyaltyGoal(250000);
            m.setPendingDues(i % 4 == 0 ? 15000 : 0);
            m.setTotalSpend(45000 + i * 7250);
            m.setLastVisit(i % 2 == 0 ? "Yesterday" : "3 days ago");
            memberProfileRepository.save(m);
        }
    }

    private void seedCoupons() {
        createCoupon("C-01", "50% Dining Discount", "Up to ₹2,000 off", 2, 3, LocalDate.of(2027, 6, 30), "available", "All Yanki Outlets", "royal");
        createCoupon("C-02", "Birthday Special", "Complimentary cake + 30% off", 1, 1, LocalDate.of(2027, 6, 20), "available", "Yanki Signature", "gold");
        createCoupon("C-03", "Anniversary Special", "Free 3-course meal for 2", 1, 1, LocalDate.of(2027, 6, 20), "available", "Yanki Banquet", "royal");
        createCoupon("C-04", "Corporate Discount", "25% off on bills above ₹5,000", 2, 2, LocalDate.of(2026, 12, 31), "available", "All Outlets", "royal");
        createCoupon("C-05", "Dough by Yanki", "Buy 1 Get 1 Pizza", 2, 3, LocalDate.of(2026, 9, 30), "available", "Dough by Yanki", "gold");
        createCoupon("C-06", "Banquet Discount", "15% off on banquet hall bookings", 1, 1, LocalDate.of(2027, 6, 20), "available", "Yanki Banquet", "royal");
        createCoupon("C-07", "ODC Benefits", "10% off outdoor catering", 0, 1, LocalDate.of(2026, 5, 15), "used", "Yanki ODC", "royal");
        createCoupon("C-08", "Festive Brunch", "Complimentary mocktail", 0, 1, LocalDate.of(2026, 3, 1), "used", "Yanki Signature", "royal");
    }

    private void createCoupon(String code, String name, String subtitle, Integer left, Integer total, LocalDate expiry, String status, String outlet, String color) {
        Coupon c = new Coupon();
        c.setCode(code);
        c.setName(name);
        c.setSubtitle(subtitle);
        c.setDescription("Enjoy exclusive privileges with " + name + " applicable at " + outlet + ".");
        c.setLeftCount(left);
        c.setTotalCount(total);
        c.setExpiryDate(expiry);
        c.setStatus(status);
        c.setOutlet(outlet);
        c.setColor(color);
        c.setTermsAndConditions("1. Non-transferable. 2. Cannot be combined with other ongoing promotions. 3. Valid for dine-in.");
        couponRepository.save(c);
    }

    private void seedReservations() {
        createReservation("R-2841", "Rahul Mehta", "+91 98250 12345", "Yanki Signature", "20 Jun, 8:30 PM", 4, "Confirmed", true, "Quiet corner table near garden");
        createReservation("R-2840", "Priya Shah", "+91 98250 20000", "Dough by Yanki", "21 Jun, 7:00 PM", 2, "Confirmed", false, "High chair needed");
        createReservation("R-2839", "Kabir Joshi", "+91 98250 20333", "Yanki Lounge SG", "22 Jun, 9:00 PM", 6, "Pending", true, "Birthday decor celebration");
        createReservation("R-2838", "Ananya Rao", "+91 98250 20666", "Yanki Banquet", "25 Jun, 7:30 PM", 80, "Confirmed", true, "Banquet corporate get-together");
    }

    private void createReservation(String ref, String name, String mobile, String outlet, String time, Integer guests, String status, Boolean vip, String notes) {
        Reservation r = new Reservation();
        r.setBookingReference(ref);
        r.setCustomerName(name);
        r.setCustomerMobile(mobile);
        r.setOutlet(outlet);
        r.setReservationTime(time);
        r.setGuests(guests);
        r.setStatus(status);
        r.setVip(vip);
        r.setSpecialRequests(notes);
        reservationRepository.save(r);
    }

    private void seedLoyaltyTransactions() {
        createLoyalty("YSM-2024-04821", "Dine-in at Yanki Signature", "Earned 10 points per ₹100 spent", 1200, "EARN", "Yanki Signature");
        createLoyalty("YSM-2024-04821", "Redeemed for Chef's Tasting Vouchers", "Redeemed at Yanki Banquet", -5000, "REDEEM", "Yanki Banquet");
        createLoyalty("YSM-2024-04821", "VIP Membership Anniversary Bonus", "Annual loyalty milestone credit", 10000, "BONUS", "All Yanki Outlets");
    }

    private void createLoyalty(String memberId, String title, String desc, Integer points, String type, String outlet) {
        LoyaltyTransaction t = new LoyaltyTransaction();
        t.setMembershipId(memberId);
        t.setTitle(title);
        t.setDescription(desc);
        t.setPoints(points);
        t.setType(type);
        t.setOutletName(outlet);
        t.setTransactionTime(LocalDateTime.now().minusDays(points > 0 ? 2 : 7));
        loyaltyTransactionRepository.save(t);
    }
}
