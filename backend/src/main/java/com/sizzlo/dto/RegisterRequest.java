package com.sizzlo.dto;

import javax.validation.constraints.NotBlank;

public class RegisterRequest {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Mobile number is required")
    private String mobile;

    private String email;
    private String address;
    private String gender;
    private String birthday;
    private String spouseName;
    private String spouseBirthday;
    private String anniversaryDate;
    private String isMarried;
    private String profilePictureUrl;

    public RegisterRequest() {}

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getMobile() { return mobile; }
    public void setMobile(String mobile) { this.mobile = mobile; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getBirthday() { return birthday; }
    public void setBirthday(String birthday) { this.birthday = birthday; }

    public String getSpouseName() { return spouseName; }
    public void setSpouseName(String spouseName) { this.spouseName = spouseName; }

    public String getSpouseBirthday() { return spouseBirthday; }
    public void setSpouseBirthday(String spouseBirthday) { this.spouseBirthday = spouseBirthday; }

    public String getAnniversaryDate() { return anniversaryDate; }
    public void setAnniversaryDate(String anniversaryDate) { this.anniversaryDate = anniversaryDate; }

    public String getIsMarried() { return isMarried; }
    public void setIsMarried(String isMarried) { this.isMarried = isMarried; }

    public String getProfilePictureUrl() { return profilePictureUrl; }
    public void setProfilePictureUrl(String profilePictureUrl) { this.profilePictureUrl = profilePictureUrl; }
}
