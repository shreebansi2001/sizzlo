package com.sizzlo.dto;

import com.sizzlo.entity.MemberProfile;

public class AuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private MemberProfile profile;

    public AuthResponse() {}

    public AuthResponse(String token, MemberProfile profile) {
        this.token = token;
        this.profile = profile;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }

    public MemberProfile getProfile() { return profile; }
    public void setProfile(MemberProfile profile) { this.profile = profile; }
}
