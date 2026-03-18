package com.ecodana.evodanavn1.dto.api;

import jakarta.validation.constraints.NotBlank;

public class LoginRequest {

    @NotBlank(message = "usernameOrEmail là bắt buộc")
    private String usernameOrEmail;

    @NotBlank(message = "password là bắt buộc")
    private String password;

    public String getUsernameOrEmail() {
        return usernameOrEmail;
    }

    public void setUsernameOrEmail(String usernameOrEmail) {
        this.usernameOrEmail = usernameOrEmail;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
