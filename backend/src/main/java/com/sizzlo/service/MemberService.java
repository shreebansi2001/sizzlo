package com.sizzlo.service;

import com.sizzlo.dto.AuthResponse;
import com.sizzlo.entity.LoyaltyTransaction;
import com.sizzlo.entity.MemberProfile;

import java.util.List;

public interface MemberService {
    AuthResponse loginWithOtp(String mobile, String otp);
    MemberProfile getProfileByMembershipId(String membershipId);
    MemberProfile getProfileByMobile(String mobile);
    MemberProfile updateProfile(String membershipId, MemberProfile updatedProfile);
    List<LoyaltyTransaction> getLoyaltyHistory(String membershipId);
    List<MemberProfile> getAllMembers();
}
