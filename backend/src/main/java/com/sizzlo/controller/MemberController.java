package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.entity.LoyaltyTransaction;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/members")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class MemberController {

    private final MemberService memberService;

    @Autowired
    public MemberController(MemberService memberService) {
        this.memberService = memberService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<MemberProfile>> getCurrentProfile(
            @RequestParam(required = false) String membershipId,
            @RequestParam(required = false) String mobile) {
        if (membershipId != null && !membershipId.trim().isEmpty()) {
            try {
                MemberProfile profile = memberService.getProfileByMembershipId(membershipId.trim());
                return ResponseEntity.ok(ApiResponse.success(profile));
            } catch (Exception ignored) {}
        }
        if (mobile != null && !mobile.trim().isEmpty()) {
            try {
                MemberProfile profile = memberService.getProfileByMobile(mobile.trim());
                return ResponseEntity.ok(ApiResponse.success(profile));
            } catch (Exception ignored) {}
        }
        return ResponseEntity.ok(ApiResponse.error("Profile not found"));
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

    @PutMapping("/loyalty-goal")
    public ResponseEntity<ApiResponse<String>> updateGlobalLoyaltyGoal(@RequestBody Map<String, Object> req) {
        Object goalObj = req.get("goal");
        if (goalObj != null) {
            int newGoal = Integer.parseInt(goalObj.toString());
            memberService.updateGlobalLoyaltyGoal(newGoal);
            return ResponseEntity.ok(ApiResponse.success("Loyalty milestone goal updated to " + newGoal + " points across all patron accounts.", "OK"));
        }
        return ResponseEntity.badRequest().body(ApiResponse.error("Missing goal in request body"));
    }

    @PostMapping("/{membershipId}/renew-points")
    public ResponseEntity<ApiResponse<MemberProfile>> renewWithPoints(@PathVariable String membershipId) {
        MemberProfile renewed = memberService.renewWithPoints(membershipId);
        return ResponseEntity.ok(ApiResponse.success("Subscription renewed for 365 days via loyalty milestone points!", renewed));
    }

    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<String>> deleteAccount(
            @RequestParam(name = "mobile") String mobile) {
        boolean deleted = memberService.deleteAccount(mobile);
        if (deleted) {
            return ResponseEntity.ok(ApiResponse.success("Your Sizzlo account and personal data have been completely deleted as per privacy regulations.", "DELETED"));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Account already inactive or deleted.", "NOT_FOUND"));
        }
    }
}
