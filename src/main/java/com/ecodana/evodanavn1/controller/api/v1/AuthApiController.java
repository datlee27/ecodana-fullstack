package com.ecodana.evodanavn1.controller.api.v1;

import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.dto.api.ApiUserMapper;
import com.ecodana.evodanavn1.dto.api.AuthResponse;
import com.ecodana.evodanavn1.dto.api.LoginRequest;
import com.ecodana.evodanavn1.dto.api.RegisterRequest;
import com.ecodana.evodanavn1.model.User;
import com.ecodana.evodanavn1.security.JwtTokenProvider;
import com.ecodana.evodanavn1.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.NoSuchElementException;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth API", description = "API đăng nhập/đăng ký cho Frontend decoupled")
public class AuthApiController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthApiController(AuthenticationManager authenticationManager,
                             UserService userService,
                             JwtTokenProvider jwtTokenProvider) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @PostMapping("/login")
    @Operation(summary = "Đăng nhập", description = "Trả về JWT token để FE gọi các API protected")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        String usernameOrEmail = request.getUsernameOrEmail().trim();

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(usernameOrEmail, request.getPassword())
        );

        User user = userService.getUserWithRole(usernameOrEmail);
        if (user == null) {
            throw new NoSuchElementException("Không tìm thấy người dùng");
        }

        String token = jwtTokenProvider.generateToken(user);
        AuthResponse authResponse = new AuthResponse(
                "Bearer",
                token,
                jwtTokenProvider.getExpirationSeconds(),
                ApiUserMapper.toUserProfile(user)
        );

        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", authResponse));
    }

    @PostMapping("/register")
    @Operation(summary = "Đăng ký", description = "Tạo tài khoản customer và trả JWT ngay sau khi đăng ký")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String phoneNumber = request.getPhoneNumber() != null ? request.getPhoneNumber().trim() : "";

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Mật khẩu xác nhận không khớp");
        }

        if (userService.existsByEmail(email)) {
            throw new IllegalArgumentException("Email đã tồn tại trong hệ thống");
        }

        if (!phoneNumber.isEmpty() && userService.existsByPhoneNumber(phoneNumber)) {
            throw new IllegalArgumentException("Số điện thoại đã tồn tại trong hệ thống");
        }

        User user = new User();
        user.setEmail(email);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setPhoneNumber(phoneNumber);
        user.setPassword(request.getPassword());
        user.setUsername(email.split("@")[0] + "_" + UUID.randomUUID().toString().substring(0, 8));

        boolean registered = userService.register(user);
        if (!registered) {
            throw new IllegalArgumentException("Đăng ký thất bại. Vui lòng kiểm tra dữ liệu đầu vào");
        }

        User registeredUser = userService.getUserWithRole(email);
        if (registeredUser == null) {
            throw new IllegalStateException("Tạo tài khoản thành công nhưng không tải được thông tin người dùng");
        }

        String token = jwtTokenProvider.generateToken(registeredUser);
        AuthResponse authResponse = new AuthResponse(
                "Bearer",
                token,
                jwtTokenProvider.getExpirationSeconds(),
                ApiUserMapper.toUserProfile(registeredUser)
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Đăng ký thành công", authResponse));
    }

    @PostMapping("/logout")
    @Operation(summary = "Đăng xuất", description = "JWT stateless nên chỉ cần FE xóa token")
    public ResponseEntity<ApiResponse<Object>> logout() {
        return ResponseEntity.ok(ApiResponse.success("Đăng xuất thành công", null));
    }
}
