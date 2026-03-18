package com.ecodana.evodanavn1.dto.api;

import com.ecodana.evodanavn1.model.User;

public final class ApiUserMapper {

    private ApiUserMapper() {
    }

    public static UserProfileResponse toUserProfile(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRoleName());
        response.setStatus(user.getStatus() != null ? user.getStatus().name() : null);
        return response;
    }
}
