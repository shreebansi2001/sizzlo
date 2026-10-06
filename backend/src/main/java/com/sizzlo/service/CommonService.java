package com.sizzlo.service;

public interface CommonService {

    /**
     * Generates a 6-digit dynamic OTP, saves it with TTL, and sends it via WhatsApp.
     *
     * @param email      User email (optional)
     * @param mobileNo   User mobile number
     * @param ttlMinutes Expiry time in minutes
     * @return Generated 6-digit OTP string
     */
    String generateAndSendOtp(String email, String mobileNo, int ttlMinutes);

    /**
     * Sends dynamic WhatsApp template message with Auth Type buttons using RestTemplate.
     *
     * @param templateId WhatsApp template ID (e.g. otp_send_general_whatsapp)
     * @param mob1       Target mobile number
     * @param valueArr   Array of variables to substitute into template and button URL
     * @return Raw HTTP response body from WhatsApp provider gateway
     */
    String sendOtpWhatsappAuthType(String templateId, String mob1, String[] valueArr);

    /**
     * Validates dynamic OTP against database records and expiry time.
     *
     * @param mobileNo Mobile number
     * @param otp      OTP provided by user
     * @return true if valid and unused, false otherwise
     */
    boolean verifyOtp(String mobileNo, String otp);

    /**
     * Validates OTP against email if provided.
     */
    boolean verifyOtpByEmail(String email, String otp);
}
