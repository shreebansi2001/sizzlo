package com.sizzlo.service.impl;

import com.sizzlo.dto.AuthResponse;
import com.sizzlo.dto.RegisterRequest;
import com.sizzlo.entity.ActivityLog;
import com.sizzlo.entity.LoyaltyTransaction;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.exception.ResourceNotFoundException;
import com.sizzlo.repository.ActivityLogRepository;
import com.sizzlo.repository.CouponRepository;
import com.sizzlo.repository.LoyaltyTransactionRepository;
import com.sizzlo.repository.MemberProfileRepository;
import com.sizzlo.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class MemberServiceImpl implements MemberService {

    private final MemberProfileRepository memberProfileRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;
    private final ActivityLogRepository activityLogRepository;
    private final CouponRepository couponRepository;

    @Autowired
    public MemberServiceImpl(MemberProfileRepository memberProfileRepository,
                             LoyaltyTransactionRepository loyaltyTransactionRepository,
                             ActivityLogRepository activityLogRepository,
                             CouponRepository couponRepository) {
        this.memberProfileRepository = memberProfileRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.activityLogRepository = activityLogRepository;
        this.couponRepository = couponRepository;
    }

    private String cleanMobile(String mobile) {
        if (mobile == null) return "";
        return mobile.replaceAll("\\D", "");
    }

    private Optional<MemberProfile> findMemberByPhone(String mobile) {
        String digits = cleanMobile(mobile);
        if (digits.length() > 10) {
            digits = digits.substring(digits.length() - 10);
        }
        for (MemberProfile m : memberProfileRepository.findAll()) {
            String mDigits = cleanMobile(m.getMobile());
            if (mDigits.equals(digits) || (mDigits.length() >= 10 && mDigits.endsWith(digits))) {
                return Optional.of(m);
            }
        }
        return Optional.empty();
    }

    private MemberProfile sanitizeProfile(MemberProfile p) {
        if (p == null) return null;
        boolean changed = false;
        if (p.getEmail() != null && p.getEmail().toLowerCase().endsWith("@sizzlo.in")) {
            p.setEmail(null);
            changed = true;
        }
        if (p.getSubscriptionTier() == null || "REGISTERED".equalsIgnoreCase(p.getSubscriptionTier())) {
            if (!"Registered".equals(p.getStatus())) {
                p.setStatus("Registered");
                changed = true;
            }
            if (!"REGISTERED USER".equals(p.getMembershipType())) {
                p.setMembershipType("REGISTERED USER");
                changed = true;
            }
        }
        if (changed) {
            return memberProfileRepository.save(p);
        }
        return p;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        String cleanPhone = cleanMobile(request.getMobile());
        String formattedPhone = cleanPhone.length() == 10 ? "+91 " + cleanPhone : request.getMobile();

        MemberProfile profile = findMemberByPhone(request.getMobile())
                .orElseGet(() -> {
                    MemberProfile p = new MemberProfile();
                    p.setMembershipId("REG-" + (1000 + (int)(Math.random() * 9000)));
                    p.setIssuedDate(LocalDate.now());
                    p.setExpiryDate(null);
                    p.setTotalSavings(0);
                    p.setCouponsUsed(0);
                    p.setCouponsTotal(0);
                    p.setLoyaltyPoints(0);
                    p.setLoyaltyGoal(25000);
                    p.setTotalSpend(0);
                    p.setPendingDues(0);
                    p.setStatus("Registered");
                    p.setSubscriptionTier("REGISTERED");
                    return p;
                });

        profile.setFullName(request.getFullName().trim());
        String[] parts = request.getFullName().trim().split("\\s+");
        profile.setFirstName(parts.length > 0 ? parts[0] : request.getFullName().trim());
        profile.setMobile(formattedPhone);

        // Never generate synthetic dummy emails - only store real user-provided email
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty() && !request.getEmail().trim().toLowerCase().endsWith("@sizzlo.in")) {
            profile.setEmail(request.getEmail().trim());
        } else {
            profile.setEmail(null);
        }

        profile.setAddress(request.getAddress());
        profile.setGender(request.getGender());
        
        // Strictly lock DOB once submitted (Chapter 03.2 SRS)
        if (request.getBirthday() != null && !request.getBirthday().isEmpty()) {
            profile.setBirthday(request.getBirthday());
            profile.setDobLocked(true);
        }
        
        profile.setSpouseName(request.getSpouseName());
        profile.setSpouseBirthday(request.getSpouseBirthday());
        profile.setAnniversaryDate(request.getAnniversaryDate());
        profile.setIsMarried(request.getIsMarried());
        if (request.getProfilePictureUrl() != null && !request.getProfilePictureUrl().isEmpty()) {
            profile.setProfilePictureUrl(request.getProfilePictureUrl());
        }
        profile.setMembershipType(profile.getSubscriptionTier() != null && !profile.getSubscriptionTier().equals("REGISTERED")
                ? profile.getSubscriptionTier() + " SUBSCRIBER" : "REGISTERED USER");
        profile.setLastVisit("Just Joined");

        MemberProfile saved = memberProfileRepository.save(profile);

        // Log into admin activity
        ActivityLog log = new ActivityLog();
        log.setActorName(saved.getFullName());
        log.setActionType("REGISTRATION");
        log.setDescription("New User registered with mobile " + saved.getMobile());
        log.setOutletName("Digital Portal");
        log.setTimeAgo("Just now");
        log.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(log);

        String dummyJwtToken = "sizzlo_jwt_" + UUID.randomUUID().toString().replace("-", "");
        return new AuthResponse(dummyJwtToken, saved);
    }

    @Override
    public AuthResponse loginWithOtp(String mobile, String otp) {
        String cleanPhone = cleanMobile(mobile);
        String formattedPhone = cleanPhone.length() == 10 ? "+91 " + cleanPhone : mobile;

        MemberProfile profile = findMemberByPhone(mobile)
                .orElseThrow(() -> new ResourceNotFoundException("No account registered with mobile: " + mobile));

        // Activity log for login
        ActivityLog log = new ActivityLog();
        log.setActorName(profile.getFullName());
        log.setActionType("CHECK_IN");
        log.setDescription("Member authenticated via DLT OTP");
        log.setOutletName("Mobile Client");
        log.setTimeAgo("Just now");
        log.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(log);

        String dummyJwtToken = "sizzlo_jwt_" + UUID.randomUUID().toString().replace("-", "");
        return new AuthResponse(dummyJwtToken, profile);
    }

    @Override
    public MemberProfile getProfileByMembershipId(String membershipId) {
        MemberProfile p = memberProfileRepository.findByMembershipId(membershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + membershipId));
        return sanitizeProfile(p);
    }

    @Override
    public MemberProfile getProfileByMobile(String mobile) {
        MemberProfile p = findMemberByPhone(mobile)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with mobile: " + mobile));
        return sanitizeProfile(p);
    }

    @Override
    public MemberProfile updateProfile(String membershipId, MemberProfile updatedProfile) {
        MemberProfile existing;
        try {
            existing = memberProfileRepository.findByMembershipId(membershipId)
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + membershipId));
        } catch (Exception e) {
            if (updatedProfile.getMobile() != null && !updatedProfile.getMobile().trim().isEmpty()) {
                existing = findMemberByPhone(updatedProfile.getMobile())
                        .orElseThrow(() -> new ResourceNotFoundException("Member not found with mobile: " + updatedProfile.getMobile()));
            } else {
                throw new ResourceNotFoundException("Member not found: " + membershipId);
            }
        }
        if (updatedProfile.getFullName() != null) {
            existing.setFullName(updatedProfile.getFullName().trim());
            String[] parts = updatedProfile.getFullName().trim().split("\\s+");
            existing.setFirstName(parts.length > 0 ? parts[0] : updatedProfile.getFullName().trim());
        }
        if (updatedProfile.getFirstName() != null) existing.setFirstName(updatedProfile.getFirstName());
        if (updatedProfile.getEmail() != null) {
            String em = updatedProfile.getEmail().trim();
            existing.setEmail(em.isEmpty() || em.toLowerCase().endsWith("@sizzlo.in") ? null : em);
        }
        if (updatedProfile.getMobile() != null) existing.setMobile(updatedProfile.getMobile());
        if (updatedProfile.getAddress() != null) existing.setAddress(updatedProfile.getAddress());
        if (updatedProfile.getGender() != null) existing.setGender(updatedProfile.getGender());
        if (updatedProfile.getProfilePictureUrl() != null) existing.setProfilePictureUrl(updatedProfile.getProfilePictureUrl());
        
        // Strict DOB lock constraint: cannot modify once locked!
        if (Boolean.TRUE.equals(existing.getDobLocked())) {
            // Do not allow DOB override
        } else if (updatedProfile.getBirthday() != null && !updatedProfile.getBirthday().isEmpty()) {
            existing.setBirthday(updatedProfile.getBirthday());
            existing.setDobLocked(true);
        }

        if (updatedProfile.getSpouseName() != null) existing.setSpouseName(updatedProfile.getSpouseName());
        if (updatedProfile.getSpouseBirthday() != null) existing.setSpouseBirthday(updatedProfile.getSpouseBirthday());
        if (updatedProfile.getAnniversaryDate() != null) existing.setAnniversaryDate(updatedProfile.getAnniversaryDate());
        if (updatedProfile.getIsMarried() != null) existing.setIsMarried(updatedProfile.getIsMarried());
        MemberProfile saved = memberProfileRepository.save(existing);
        return sanitizeProfile(saved);
    }

    @Override
    public List<LoyaltyTransaction> getLoyaltyHistory(String membershipId) {
        return loyaltyTransactionRepository.findByMembershipIdOrderByTransactionTimeDesc(membershipId);
    }

    @Override
    public List<MemberProfile> getAllMembers() {
        List<MemberProfile> all = memberProfileRepository.findAll();
        for (MemberProfile p : all) {
            sanitizeProfile(p);
        }
        return all;
    }

    @Override
    public boolean deleteAccount(String mobile) {
        Optional<MemberProfile> opt = findMemberByPhone(mobile);
        if (opt.isPresent()) {
            MemberProfile m = opt.get();
            // Purge personal PII and member record (Apple App Store & Google Play compliance)
            memberProfileRepository.delete(m);
            return true;
        }
        return false;
    }

    @Override
    public MemberProfile renewWithPoints(String membershipId) {
        MemberProfile m = getProfileByMembershipId(membershipId);
        int points = m.getLoyaltyPoints() != null ? m.getLoyaltyPoints() : 0;
        int goal = m.getLoyaltyGoal() != null && m.getLoyaltyGoal() > 0 ? m.getLoyaltyGoal() : 25000;
        if (points < goal) {
            throw new RuntimeException("Insufficient points for free renewal. Required: " + goal + " points. Current: " + points);
        }

        m.setLoyaltyPoints(points - goal);
        m.setStatus("Active");
        m.setIssuedDate(LocalDate.now());
        m.setExpiryDate(LocalDate.now().plusDays(365));

        LoyaltyTransaction tx = new LoyaltyTransaction();
        tx.setMembershipId(m.getMembershipId());
        tx.setTitle("Annual Plan Free Renewal (" + goal + " Points)");
        tx.setDescription("1-Tap Loyalty Milestone Redemption");
        tx.setPoints(-goal);
        tx.setType("REDEEM");
        tx.setOutletName("All Yanki Outlets");
        tx.setTransactionTime(LocalDateTime.now());
        loyaltyTransactionRepository.save(tx);

        return memberProfileRepository.save(m);
    }

    @Override
    public void updateGlobalLoyaltyGoal(int newGoal) {
        List<MemberProfile> list = memberProfileRepository.findAll();
        for (MemberProfile p : list) {
            p.setLoyaltyGoal(newGoal);
        }
        memberProfileRepository.saveAll(list);
    }
}
