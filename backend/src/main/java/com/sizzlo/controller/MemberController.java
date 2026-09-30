package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.LoyaltyTransaction;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(origins = "*")
public class MemberController {

    private final MemberService memberService;

    @Autowired
    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberProfile>> getCurrentProfile(
            @RequestParam(name = "membershipId", defaultValue = "YSM-2024-04821") String membershipId) {
        MemberProfile profile = memberService.getProfileByMembershipId(membershipId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/{membershipId}")
    public ResponseEntity<ApiResponse<MemberProfile>> getMemberById(@PathVariable String membershipId) {
        MemberProfile profile = memberService.getProfileByMembershipId(membershipId);
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/{membershipId}")
    public ResponseEntity<ApiResponse<MemberProfile>> updateMember(
            @PathVariable String membershipId,
            @RequestBody MemberProfile profile) {
        MemberProfile updated = memberService.updateProfile(membershipId, profile);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", updated));
    }

    @GetMapping("/{membershipId}/loyalty")
    public ResponseEntity<ApiResponse<List<LoyaltyTransaction>>> getLoyaltyHistory(@PathVariable String membershipId) {
        List<LoyaltyTransaction> history = memberService.getLoyaltyHistory(membershipId);
        return ResponseEntity.ok(ApiResponse.success(history));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MemberProfile>>> getAllMembers() {
        List<MemberProfile> list = memberService.getAllMembers();
        return ResponseEntity.ok(ApiResponse.success(list));
    }
}
