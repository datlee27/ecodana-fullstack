package com.ecodana.evodanavn1.controller.api.v1;

import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.dto.api.ApiUserMapper;
import com.ecodana.evodanavn1.dto.api.UserProfileResponse;
import com.ecodana.evodanavn1.model.User;
import com.ecodana.evodanavn1.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/profile")
@Tag(name = "Profile API", description = "API thông tin tài khoản hiện tại")
public class ProfileApiController {

    private final UserService userService;

    public ProfileApiController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/me")
    @Operation(summary = "Thông tin người dùng hiện tại")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(Authentication authentication) {
        String principal = authentication.getName();
        User user = userService.getUserWithRole(principal);

        if (user == null) {
            throw new NoSuchElementException("Không tìm thấy người dùng từ token");
        }

        return ResponseEntity.ok(
                ApiResponse.success("Lấy thông tin người dùng thành công", ApiUserMapper.toUserProfile(user))
        );
    }
}
