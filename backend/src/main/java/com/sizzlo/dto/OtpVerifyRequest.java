package com.sizzlo.dto;

import javax.validation.constraints.NotBlank;

public class OtpVerifyRequest {
    @NotBlank(message = "Mobile number is required")
    private String mobile;

    @NotBlank(message = "OTP code is required")
    private String otp;

    public OtpVerifyRequest() {}

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}
