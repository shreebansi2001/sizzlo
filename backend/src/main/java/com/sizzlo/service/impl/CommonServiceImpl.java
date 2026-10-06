package com.sizzlo.service.impl;

import com.sizzlo.entity.UserOtpEntity;
import com.sizzlo.repository.UserOtpRepository;
import com.sizzlo.service.CommonService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.env.Environment;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

import com.sizzlo.service.WhatsAppOtpService;

@Service
public class CommonServiceImpl implements CommonService, WhatsAppOtpService {

    private static final Logger log = LoggerFactory.getLogger(CommonServiceImpl.class);

    private static final String DEFAULT_APP_KEY = "6e2ba3ab-d783-4c4c-8242-e45b19025de3";
    private static final String DEFAULT_AUTH_KEY = "ZvY1dxfHobOPNjPB2EDmTW3ZYsXXd4nunuTjMTW6HChlF3EpkG";
    private static final String DEFAULT_API_URL = "https://app.justwedding.in/api/create-message";
    private static final String DEFAULT_TEMPLATE_ID = "otp_send_general_whatsapp";

    @Autowired
    private Environment environment;

    @Autowired
    private UserOtpRepository userOtpRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getAppKey() {
        String val = environment.getProperty("APP_KEY");
        if (val == null || val.trim().isEmpty()) {
            val = environment.getProperty("whatsapp.otp.app-key", DEFAULT_APP_KEY);
        }
        return val != null ? val.trim() : DEFAULT_APP_KEY;
    }

    public String getAuthKey() {
        String val = environment.getProperty("AUTH_KEY");
        if (val == null || val.trim().isEmpty()) {
            val = environment.getProperty("whatsapp.otp.auth-key", DEFAULT_AUTH_KEY);
        }
        return val != null ? val.trim() : DEFAULT_AUTH_KEY;
    }

    public String getApiUrl() {
        String val = environment.getProperty("API_URL");
        if (val == null || val.trim().isEmpty()) {
            val = environment.getProperty("whatsapp.otp.api-url", DEFAULT_API_URL);
        }
        return val != null ? val.trim() : DEFAULT_API_URL;
    }

    public String getTemplateId() {
        String val = environment.getProperty("TEMPLATE_ID");
        if (val == null || val.trim().isEmpty()) {
            val = environment.getProperty("whatsapp.otp.template-id", DEFAULT_TEMPLATE_ID);
        }
        return val != null ? val.trim() : DEFAULT_TEMPLATE_ID;
    }

    @Override
    @Transactional
    public String generateAndSendOtp(String email, String mobileNo, int ttlMinutes) {
        String cleanPhone = cleanMobile(mobileNo);
        int ttl = ttlMinutes > 0 ? ttlMinutes : 10;
        String otp = String.format("%06d", new Random().nextInt(999999));
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(ttl);

        if (email != null && !email.trim().isEmpty()) {
            try {
                userOtpRepository.deleteByEmailAndIsUsedTrue(email.trim().toLowerCase());
            } catch (Exception ex) {
                log.warn("Could not purge used OTPs for email: {}", ex.getMessage());
            }
        }

        if (!cleanPhone.isEmpty()) {
            try {
                userOtpRepository.deleteByMobileAndIsUsedTrue(cleanPhone);
            } catch (Exception ex) {
                log.warn("Could not purge used OTPs for mobile: {}", ex.getMessage());
            }
        }

        UserOtpEntity entity = new UserOtpEntity();
        entity.setEmail(email != null && !email.trim().isEmpty() ? email.trim().toLowerCase() : null);
        entity.setMobile(cleanPhone);
        entity.setOtp(otp);
        entity.setIsUsed(false);
        entity.setExpiryTime(expiry);
        userOtpRepository.save(entity);

        String[] dataArr = { otp };
        sendOtpWhatsappAuthType(getTemplateId(), cleanPhone, dataArr);

        return otp;
    }

    @Override
    public String sendOtpWhatsappAuthType(String templateId, String mob1, String[] valueArr) {
        if (mob1 == null || mob1.trim().isEmpty()) {
            log.warn("Empty mobile number provided for WhatsApp OTP");
            return "{\"status\":\"error\",\"message\":\"Mobile number required\"}";
        }

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("appkey", getAppKey());
        formData.add("authkey", getAuthKey());

        String cleanDigits = mob1.replaceAll("[^0-9]", "");
        if (cleanDigits.startsWith("0")) {
            cleanDigits = cleanDigits.substring(1);
        }
        String mobileNumber = cleanDigits.startsWith("91") ? cleanDigits : "91" + cleanDigits;
        formData.add("to", mobileNumber);

        String activeTemplate = (templateId != null && !templateId.trim().isEmpty())
                ? templateId.trim()
                : getTemplateId();
        formData.add("template_id", activeTemplate);

        if (valueArr != null) {
            for (int i = 0; i < valueArr.length; i++) {
                formData.add("variables[{variableKey" + (i + 1) + "}]", valueArr[i]);
            }
        }

        if (valueArr != null && valueArr.length > 0) {
            formData.add("buttons[{b1_type}]", "url");
            formData.add("buttons[{b1_value}]", valueArr[0]);
        }
        formData.add("language", "en");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);

        try {
            log.info("Sending WhatsApp OTP via gateway to {} with template {}", mobileNumber, activeTemplate);
            ResponseEntity<String> response = restTemplate.exchange(
                    getApiUrl(),
                    HttpMethod.POST,
                    request,
                    String.class
            );
            log.info("WhatsApp Gateway response: Status={}, Body={}", response.getStatusCode(), response.getBody());
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to deliver WhatsApp OTP to {}: {}", mobileNumber, e.getMessage());
            return "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }

    @Override
    @Transactional
    public boolean verifyOtp(String mobileNo, String otp) {
        if (otp == null || otp.trim().isEmpty()) {
            return false;
        }
        String trimmedOtp = otp.trim();

        // Testing / bypass codes for review & local development
        if ("1234".equals(trimmedOtp) || "123456".equals(trimmedOtp)) {
            return true;
        }

        String cleanPhone = cleanMobile(mobileNo);
        LocalDateTime now = LocalDateTime.now();

        Optional<UserOtpEntity> tokenOpt = userOtpRepository
                .findTopByMobileAndOtpAndIsUsedFalseAndExpiryTimeAfterOrderByCreatedAtDesc(cleanPhone, trimmedOtp, now);

        if (tokenOpt.isPresent()) {
            UserOtpEntity token = tokenOpt.get();
            token.setIsUsed(true);
            userOtpRepository.save(token);
            return true;
        }

        // Also check if raw mobile was passed
        if (!cleanPhone.equals(mobileNo)) {
            Optional<UserOtpEntity> rawOpt = userOtpRepository
                    .findTopByMobileAndOtpAndIsUsedFalseAndExpiryTimeAfterOrderByCreatedAtDesc(mobileNo, trimmedOtp, now);
            if (rawOpt.isPresent()) {
                UserOtpEntity token = rawOpt.get();
                token.setIsUsed(true);
                userOtpRepository.save(token);
                return true;
            }
        }

        return false;
    }

    @Override
    @Transactional
    public boolean verifyOtpByEmail(String email, String otp) {
        if (email == null || otp == null || otp.trim().isEmpty()) {
            return false;
        }
        String trimmedOtp = otp.trim();
        if ("1234".equals(trimmedOtp) || "123456".equals(trimmedOtp)) {
            return true;
        }
        LocalDateTime now = LocalDateTime.now();
        Optional<UserOtpEntity> tokenOpt = userOtpRepository
                .findTopByEmailAndOtpAndIsUsedFalseAndExpiryTimeAfterOrderByCreatedAtDesc(email.trim().toLowerCase(), trimmedOtp, now);
        if (tokenOpt.isPresent()) {
            UserOtpEntity token = tokenOpt.get();
            token.setIsUsed(true);
            userOtpRepository.save(token);
            return true;
        }
        return false;
    }

    @Override
    public String sendNotificationWhatsApp(String mobileNo, String title, String body) {
        if (mobileNo == null || mobileNo.trim().isEmpty()) {
            return "{\"status\":\"error\",\"message\":\"Mobile number required\"}";
        }
        String cleanDigits = cleanMobile(mobileNo);
        String to = cleanDigits.startsWith("91") ? cleanDigits : "91" + cleanDigits;

        MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
        formData.add("appkey", getAppKey());
        formData.add("authkey", getAuthKey());
        formData.add("to", to);
        formData.add("template_id", getTemplateId());
        formData.add("variables[{variableKey1}]", title != null ? title : "Sizzlo Privilege");
        formData.add("variables[{variableKey2}]", body != null ? body : "");
        formData.add("language", "en");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(formData, headers);

        try {
            log.info("Dispatching WhatsApp Notification to {} | {} : {}", to, title, body);
            ResponseEntity<String> response = restTemplate.exchange(getApiUrl(), HttpMethod.POST, request, String.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("Failed to deliver WhatsApp message to {}: {}", to, e.getMessage());
            return "{\"status\":\"error\",\"message\":\"" + e.getMessage() + "\"}";
        }
    }

    private String cleanMobile(String mobile) {
        if (mobile == null) return "";
        String clean = mobile.replaceAll("[^0-9]", "");
        if (clean.startsWith("91") && clean.length() == 12) {
            return clean.substring(2);
        }
        if (clean.startsWith("0") && clean.length() == 11) {
            return clean.substring(1);
        }
        return clean;
    }
}
