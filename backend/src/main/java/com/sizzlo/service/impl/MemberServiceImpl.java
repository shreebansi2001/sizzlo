package com.sizzlo.service.impl;

import com.sizzlo.dto.AuthResponse;
import com.sizzlo.dto.RegisterRequest;
import com.sizzlo.entity.ActivityLog;
import com.sizzlo.entity.LoyaltyTransaction;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.exception.ResourceNotFoundException;
import com.sizzlo.repository.ActivityLogRepository;
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

    @Autowired
    public MemberServiceImpl(MemberProfileRepository memberProfileRepository,
                             LoyaltyTransactionRepository loyaltyTransactionRepository,
                             ActivityLogRepository activityLogRepository) {
        this.memberProfileRepository = memberProfileRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
        this.activityLogRepository = activityLogRepository;
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

    @Override
    public AuthResponse register(RegisterRequest request) {
        String cleanPhone = cleanMobile(request.getMobile());
        String formattedPhone = cleanPhone.length() == 10 ? "+91 " + cleanPhone : request.getMobile();

        MemberProfile profile = findMemberByPhone(request.getMobile())
                .orElseGet(() -> {
                    MemberProfile p = new MemberProfile();
                    p.setMembershipId("YSM-2024-" + (1000 + (int)(Math.random() * 9000)));
                    p.setIssuedDate(LocalDate.now());
                    p.setExpiryDate(LocalDate.now().plusYears(1));
                    p.setTotalSavings(0);
                    p.setCouponsUsed(0);
                    p.setCouponsTotal(12);
                    p.setLoyaltyPoints(5000); // 5,000 Welcome bonus points!
                    p.setLoyaltyGoal(250000);
                    p.setTotalSpend(0);
                    p.setPendingDues(0);
                    p.setStatus("Active");
                    return p;
                });

        profile.setFullName(request.getFullName().trim());
        String[] parts = request.getFullName().trim().split("\\s+");
        profile.setFirstName(parts.length > 0 ? parts[0] : request.getFullName().trim());
        profile.setMobile(formattedPhone);
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            profile.setEmail(request.getEmail().trim());
        } else if (profile.getEmail() == null || profile.getEmail().isEmpty()) {
            profile.setEmail(profile.getFirstName().toLowerCase() + "." + (cleanPhone.length() >= 4 ? cleanPhone.substring(cleanPhone.length() - 4) : "vip") + "@sizzlo.in");
        }
        profile.setAddress(request.getAddress());
        profile.setGender(request.getGender());
        profile.setBirthday(request.getBirthday());
        profile.setSpouseName(request.getSpouseName());
        profile.setSpouseBirthday(request.getSpouseBirthday());
        profile.setAnniversaryDate(request.getAnniversaryDate());
        profile.setIsMarried(request.getIsMarried());
        profile.setMembershipType("VIP MEMBER");
        profile.setLastVisit("Just Joined");

        MemberProfile saved = memberProfileRepository.save(profile);

        // Record welcome loyalty reward
        LoyaltyTransaction welcomeTx = new LoyaltyTransaction();
        welcomeTx.setMembershipId(saved.getMembershipId());
        welcomeTx.setTitle("VIP Welcome Privilege Points");
        welcomeTx.setDescription("Complimentary registration bonus credited");
        welcomeTx.setPoints(5000);
        welcomeTx.setType("BONUS");
        welcomeTx.setOutletName("Sizzlo VIP Privilege");
        welcomeTx.setTransactionTime(LocalDateTime.now());
        loyaltyTransactionRepository.save(welcomeTx);

        // Log into admin activity
        ActivityLog log = new ActivityLog();
        log.setActorName(saved.getFullName());
        log.setActionType("REGISTRATION");
        log.setDescription("New VIP Member registered with mobile " + saved.getMobile());
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
                .orElseGet(() -> {
                    // Create dynamic member with their real phone if logging in first time
                    MemberProfile newProfile = new MemberProfile();
                    newProfile.setMobile(formattedPhone);
                    String suffix = cleanPhone.length() >= 4 ? cleanPhone.substring(cleanPhone.length() - 4) : "VIP";
                    newProfile.setFullName("VIP Guest " + suffix);
                    newProfile.setFirstName("Guest");
                    newProfile.setEmail("guest." + suffix.toLowerCase() + "@sizzlo.in");
                    newProfile.setMembershipId("YSM-2024-" + (1000 + (int)(Math.random() * 9000)));
                    newProfile.setMembershipType("VIP MEMBER");
                    newProfile.setStatus("Active");
                    newProfile.setIssuedDate(LocalDate.now());
                    newProfile.setExpiryDate(LocalDate.now().plusYears(1));
                    newProfile.setTotalSavings(0);
                    newProfile.setCouponsUsed(0);
                    newProfile.setCouponsTotal(12);
                    newProfile.setLoyaltyPoints(5000);
                    newProfile.setLoyaltyGoal(250000);
                    newProfile.setTotalSpend(0);
                    newProfile.setPendingDues(0);
                    newProfile.setLastVisit("Today");
                    return memberProfileRepository.save(newProfile);
                });

        // Activity log for login
        ActivityLog log = new ActivityLog();
        log.setActorName(profile.getFullName());
        log.setActionType("CHECK_IN");
        log.setDescription("VIP Member authenticated via OTP");
        log.setOutletName("Mobile Client");
        log.setTimeAgo("Just now");
        log.setTimestamp(LocalDateTime.now());
        activityLogRepository.save(log);

        String dummyJwtToken = "sizzlo_jwt_" + UUID.randomUUID().toString().replace("-", "");
        return new AuthResponse(dummyJwtToken, profile);
    }

    @Override
    public MemberProfile getProfileByMembershipId(String membershipId) {
        return memberProfileRepository.findByMembershipId(membershipId)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with ID: " + membershipId));
    }

    @Override
    public MemberProfile getProfileByMobile(String mobile) {
        return findMemberByPhone(mobile)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with mobile: " + mobile));
    }

    @Override
    public MemberProfile updateProfile(String membershipId, MemberProfile updatedProfile) {
        MemberProfile existing = getProfileByMembershipId(membershipId);
        if (updatedProfile.getFullName() != null) {
            existing.setFullName(updatedProfile.getFullName());
            String[] parts = updatedProfile.getFullName().trim().split("\\s+");
            existing.setFirstName(parts.length > 0 ? parts[0] : updatedProfile.getFullName().trim());
        }
        if (updatedProfile.getFirstName() != null) existing.setFirstName(updatedProfile.getFirstName());
        if (updatedProfile.getEmail() != null) existing.setEmail(updatedProfile.getEmail());
        if (updatedProfile.getMobile() != null) existing.setMobile(updatedProfile.getMobile());
        if (updatedProfile.getAddress() != null) existing.setAddress(updatedProfile.getAddress());
        if (updatedProfile.getGender() != null) existing.setGender(updatedProfile.getGender());
        if (updatedProfile.getBirthday() != null) existing.setBirthday(updatedProfile.getBirthday());
        if (updatedProfile.getSpouseName() != null) existing.setSpouseName(updatedProfile.getSpouseName());
        if (updatedProfile.getSpouseBirthday() != null) existing.setSpouseBirthday(updatedProfile.getSpouseBirthday());
        if (updatedProfile.getAnniversaryDate() != null) existing.setAnniversaryDate(updatedProfile.getAnniversaryDate());
        if (updatedProfile.getIsMarried() != null) existing.setIsMarried(updatedProfile.getIsMarried());
        return memberProfileRepository.save(existing);
    }

    @Override
    public List<LoyaltyTransaction> getLoyaltyHistory(String membershipId) {
        return loyaltyTransactionRepository.findByMembershipIdOrderByTransactionTimeDesc(membershipId);
    }

    @Override
    public List<MemberProfile> getAllMembers() {
        return memberProfileRepository.findAll();
    }
}
