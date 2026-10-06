package com.sizzlo.dto;

import javax.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "Mobile number is required")
    private String mobile;

    private String email;

    public LoginRequest() {}
    public LoginRequest(String mobile) { this.mobile = mobile; }
    public LoginRequest(String mobile, String email) {
        this.mobile = mobile;
        this.email = email;
    }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
