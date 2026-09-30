package com.sizzlo.dto;

import javax.validation.constraints.NotBlank;

public class LoginRequest {
    @NotBlank(message = "Mobile number is required")
    private String mobile;

    public LoginRequest() {}
    public LoginRequest(String mobile) { this.mobile = mobile; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }
}
