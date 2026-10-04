package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.dto.AuthResponse;
import com.sizzlo.dto.LoginRequest;
import com.sizzlo.dto.OtpVerifyRequest;
import com.sizzlo.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AuthController {

    private final MemberService memberService;

    @Autowired
    public AuthController(MemberService memberService) {
        this.memberService = memberService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, String>>> requestOtp(@Valid @RequestBody LoginRequest request) {
        Map<String, String> response = new HashMap<>();
        response.put("mobile", request.getMobile());
        response.put("message", "OTP sent successfully to " + request.getMobile() + " (Use demo OTP: 1234)");
        return ResponseEntity.ok(ApiResponse.success("OTP sent", response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        AuthResponse authResponse = memberService.loginWithOtp(request.getMobile(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", authResponse));
    }
}
