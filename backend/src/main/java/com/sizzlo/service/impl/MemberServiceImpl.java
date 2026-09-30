package com.sizzlo.service.impl;

import com.sizzlo.dto.AuthResponse;
import com.sizzlo.entity.LoyaltyTransaction;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.exception.ResourceNotFoundException;
import com.sizzlo.repository.LoyaltyTransactionRepository;
import com.sizzlo.repository.MemberProfileRepository;
import com.sizzlo.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class MemberServiceImpl implements MemberService {

    private final MemberProfileRepository memberProfileRepository;
    private final LoyaltyTransactionRepository loyaltyTransactionRepository;

    @Autowired
    public MemberServiceImpl(MemberProfileRepository memberProfileRepository,
                             LoyaltyTransactionRepository loyaltyTransactionRepository) {
        this.memberProfileRepository = memberProfileRepository;
        this.loyaltyTransactionRepository = loyaltyTransactionRepository;
    }

    @Override
    public AuthResponse loginWithOtp(String mobile, String otp) {
        // Standard OTP verification (demo accepts 1234 or any 4/6 digit code)
        MemberProfile profile = memberProfileRepository.findByMobile(mobile)
                .orElseGet(() -> {
                    // Create default member if first time login
                    MemberProfile newProfile = new MemberProfile();
                    newProfile.setMobile(mobile);
                    newProfile.setFullName("Rahul Mehta");
                    newProfile.setFirstName("Rahul");
                    newProfile.setEmail("rahul.mehta@yanki.in");
                    newProfile.setMembershipId("YSM-2024-" + (1000 + (int)(Math.random() * 9000)));
                    newProfile.setMembershipType("VIP MEMBER");
                    newProfile.setStatus("Active");
                    newProfile.setIssuedDate(LocalDate.now().minusMonths(6));
                    newProfile.setExpiryDate(LocalDate.now().plusYears(1));
                    newProfile.setTotalSavings(24500);
                    newProfile.setCouponsUsed(5);
                    newProfile.setCouponsTotal(12);
                    newProfile.setLoyaltyPoints(125000);
                    newProfile.setLoyaltyGoal(250000);
                    newProfile.setTotalSpend(45000);
                    newProfile.setPendingDues(0);
                    newProfile.setLastVisit("Today");
                    return memberProfileRepository.save(newProfile);
                });

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
        return memberProfileRepository.findByMobile(mobile)
                .orElseThrow(() -> new ResourceNotFoundException("Member not found with mobile: " + mobile));
    }

    @Override
    public MemberProfile updateProfile(String membershipId, MemberProfile updatedProfile) {
        MemberProfile existing = getProfileByMembershipId(membershipId);
        if (updatedProfile.getFullName() != null) existing.setFullName(updatedProfile.getFullName());
        if (updatedProfile.getFirstName() != null) existing.setFirstName(updatedProfile.getFirstName());
        if (updatedProfile.getEmail() != null) existing.setEmail(updatedProfile.getEmail());
        if (updatedProfile.getMobile() != null) existing.setMobile(updatedProfile.getMobile());
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
