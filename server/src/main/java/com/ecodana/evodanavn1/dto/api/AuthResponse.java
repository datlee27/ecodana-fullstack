package com.ecodana.evodanavn1.dto.api;

public class AuthResponse {

    private String tokenType;
    private String accessToken;
    private long expiresInSeconds;
    private UserProfileResponse user;

    public AuthResponse() {
    }

    public AuthResponse(String tokenType, String accessToken, long expiresInSeconds, UserProfileResponse user) {
        this.tokenType = tokenType;
        this.accessToken = accessToken;
        this.expiresInSeconds = expiresInSeconds;
        this.user = user;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public void setExpiresInSeconds(long expiresInSeconds) {
        this.expiresInSeconds = expiresInSeconds;
    }

    public UserProfileResponse getUser() {
        return user;
    }

    public void setUser(UserProfileResponse user) {
        this.user = user;
    }
}
