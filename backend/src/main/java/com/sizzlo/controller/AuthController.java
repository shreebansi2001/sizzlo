package com.sizzlo.controller;

import com.sizzlo.dto.ApiResponse;
import com.sizzlo.dto.AuthResponse;
import com.sizzlo.dto.LoginRequest;
import com.sizzlo.dto.OtpVerifyRequest;
import com.sizzlo.entity.MemberProfile;
import com.sizzlo.exception.ResourceNotFoundException;
import com.sizzlo.service.CommonService;
import com.sizzlo.service.MemberService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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
    private final CommonService commonService;

    @Autowired
    public AuthController(MemberService memberService, CommonService commonService) {
        this.memberService = memberService;
        this.commonService = commonService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody com.sizzlo.dto.RegisterRequest request) {
        // 1. Check if member already exists with a completed profile
        try {
            MemberProfile existing = memberService.getProfileByMobile(request.getMobile());
            if (existing != null && existing.getFullName() != null && !existing.getFullName().startsWith("Guest")) {
                Map<String, Object> errData = new HashMap<>();
                errData.put("registered", true);
                errData.put("mobile", request.getMobile());
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(ApiResponse.error("An account with this mobile number already exists. Please log in."));
            }
        } catch (ResourceNotFoundException ignored) {}

        // 2. Register new VIP profile
        AuthResponse authResponse = memberService.register(request);

        // 3. Dispatch dynamic WhatsApp OTP for immediate verification
        try {
            commonService.generateAndSendOtp(request.getEmail(), request.getMobile(), 10);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.success("Registration successful! VIP Account created. OTP sent to your WhatsApp.", authResponse));
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<AuthResponse>> signup(@Valid @RequestBody com.sizzlo.dto.RegisterRequest request) {
        return register(request);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<Map<String, Object>>> requestOtp(@Valid @RequestBody LoginRequest request) {
        // 1. Verify that user is registered before sending login OTP
        MemberProfile existing;
        try {
            existing = memberService.getProfileByMobile(request.getMobile());
        } catch (ResourceNotFoundException e) {
            Map<String, Object> errData = new HashMap<>();
            errData.put("registered", false);
            errData.put("mobile", request.getMobile());
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error("No account found with this mobile number. Please sign up to create your VIP profile.", errData));
        }

        // 2. Dynamic WhatsApp OTP generation & dispatch
        String generatedOtp = commonService.generateAndSendOtp(request.getEmail(), request.getMobile(), 10);

        Map<String, Object> response = new HashMap<>();
        response.put("mobile", request.getMobile());
        response.put("channel", "WHATSAPP");
        response.put("message", "Dynamic OTP sent successfully via WhatsApp to " + request.getMobile());
        response.put("ttlMinutes", 10);
        response.put("memberName", existing != null ? existing.getFullName() : "Member");
        return ResponseEntity.ok(ApiResponse.success("OTP sent via WhatsApp", response));
    }

    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resendOtp(@RequestBody Map<String, String> request) {
        String mobile = request.get("mobile");
        if (mobile == null || mobile.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Mobile number is required"));
        }
        String cleanPhone = mobile.replaceAll("[^0-9]", "");
        commonService.generateAndSendOtp(null, cleanPhone, 10);

        Map<String, Object> response = new HashMap<>();
        response.put("mobile", cleanPhone);
        response.put("channel", "WHATSAPP");
        response.put("message", "New OTP dispatched to WhatsApp on +91 " + cleanPhone);
        response.put("ttlMinutes", 10);
        return ResponseEntity.ok(ApiResponse.success("New OTP sent via WhatsApp", response));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyOtp(@Valid @RequestBody OtpVerifyRequest request) {
        boolean isValid = commonService.verifyOtp(request.getMobile(), request.getOtp());
        if (!isValid) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("Invalid or expired OTP. Please enter the valid code sent to your WhatsApp."));
        }

        AuthResponse authResponse = memberService.loginWithOtp(request.getMobile(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("Authentication successful", authResponse));
    }

    /**
     * Dedicated testing endpoint to trigger dynamic WhatsApp template message with custom parameters.
     */
    @PostMapping("/send-whatsapp-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendWhatsAppOtp(
            @RequestParam(required = false, defaultValue = "otp_send_general_whatsapp") String templateId,
            @RequestParam String mobile,
            @RequestParam(required = false) String otp) {

        String finalOtp = (otp != null && !otp.trim().isEmpty())
                ? otp.trim()
                : String.format("%06d", new java.util.Random().nextInt(999999));

        String[] dataArr = { finalOtp };
        String gatewayResponse = commonService.sendOtpWhatsappAuthType(templateId, mobile, dataArr);

        Map<String, Object> res = new HashMap<>();
        res.put("mobile", mobile);
        res.put("templateId", templateId);
        res.put("otp", finalOtp);
        res.put("gatewayResponse", gatewayResponse);

        return ResponseEntity.ok(ApiResponse.success("WhatsApp OTP triggered", res));
    }
}

