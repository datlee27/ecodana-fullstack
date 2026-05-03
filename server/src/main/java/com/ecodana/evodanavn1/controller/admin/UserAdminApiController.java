package com.ecodana.evodanavn1.controller.admin;

import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.dto.UserRequest;
import com.ecodana.evodanavn1.dto.UserResponse;
import com.ecodana.evodanavn1.model.Role;
import com.ecodana.evodanavn1.model.User;
import com.ecodana.evodanavn1.repository.RoleRepository;
import com.ecodana.evodanavn1.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

/**
 * REST API controller for admin user management.
 * Authentication is enforced by Spring Security — no manual checks needed.
 * Thymeleaf page rendering lives in UserAdminController.
 */
@RestController
@RequestMapping("/admin/users/api")
public class UserAdminApiController {

    @Autowired
    private UserService userService;

    @Autowired
    private RoleRepository roleRepository;

    @GetMapping("/list")
    public ResponseEntity<ApiResponse<Object>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String role) {

        List<User> users = userService.getAllUsersWithRole();

        if (search != null && !search.isBlank()) {
            String q = search.toLowerCase();
            users = users.stream()
                    .filter(u -> u.getUsername().toLowerCase().contains(q)
                            || u.getEmail().toLowerCase().contains(q)
                            || (u.getFirstName() != null && u.getFirstName().toLowerCase().contains(q))
                            || (u.getLastName() != null && u.getLastName().toLowerCase().contains(q)))
                    .collect(Collectors.toList());
        }
        if (status != null && !status.isBlank() && !"all".equalsIgnoreCase(status)) {
            users = users.stream()
                    .filter(u -> u.getStatus() != null && status.equalsIgnoreCase(u.getStatus().name()))
                    .collect(Collectors.toList());
        }
        if (role != null && !role.isBlank() && !"all".equalsIgnoreCase(role)) {
            users = users.stream()
                    .filter(u -> u.getRole() != null && role.equalsIgnoreCase(u.getRole().getRoleName()))
                    .collect(Collectors.toList());
        }

        List<UserResponse> result = users.stream().map(UserResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("OK", new UsersPage(result, result.size())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable String id) {
        User user = userService.findByIdWithRole(id);
        if (user == null) throw new NoSuchElementException("User not found: " + id);
        return ResponseEntity.ok(ApiResponse.success("OK", new UserResponse(user)));
    }

    @PostMapping("/create")
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@Valid @RequestBody UserRequest req) {
        UserResponse created = userService.createAdminUser(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("User created successfully", created));
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable String id,
            @Valid @RequestBody UserRequest req) {
        UserResponse updated = userService.updateAdminUser(id, req);
        return ResponseEntity.ok(ApiResponse.success("User updated successfully", updated));
    }

    /**
     * Change a user's role only.
     * Delegates to userService.updateUserRole() which handles:
     *   - roleId validation via RoleService
     *   - email notification when promoted to Owner
     */
    @PatchMapping("/role/{id}")
    public ResponseEntity<ApiResponse<Void>> updateUserRole(
            @PathVariable String id,
            @RequestParam String roleId) {
        User target = userService.findById(id);
        if (target == null) throw new NoSuchElementException("User not found: " + id);

        boolean updated = userService.updateUserRole(id, roleId);
        if (!updated) {
            return ResponseEntity.badRequest()
                .body(ApiResponse.error("Invalid role ID or user not found", null));
        }
        return ResponseEntity.ok(ApiResponse.success("Role updated successfully", null));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable String id) {
        String currentUserId = SecurityContextHolder.getContext().getAuthentication().getName();
        User current = userService.findByUsername(currentUserId);
        if (current == null) current = userService.findByEmail(currentUserId);
        if (current != null && current.getId().equals(id)) {
            throw new IllegalArgumentException("Cannot delete your own account");
        }
        if (userService.findById(id) == null) throw new NoSuchElementException("User not found: " + id);
        userService.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted successfully", null));
    }

    @PatchMapping("/status/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable String id,
            @RequestParam String status) {
        if (!Arrays.asList("Active", "Inactive", "Banned").contains(status)) {
            throw new IllegalArgumentException("Invalid status value: " + status);
        }
        User user = userService.findById(id);
        if (user == null) throw new NoSuchElementException("User not found: " + id);
        user.setStatus(User.UserStatus.valueOf(status));
        User saved = userService.save(user);
        User withRole = userService.findByIdWithRole(saved.getId());
        return ResponseEntity.ok(ApiResponse.success("Status updated", new UserResponse(withRole)));
    }

    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<List<Role>>> getAllRoles() {
        return ResponseEntity.ok(ApiResponse.success("OK", roleRepository.findAll()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Object>> searchUsers(@RequestParam String keyword) {
        List<UserResponse> result = userService.searchUsers(keyword).stream()
                .map(UserResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("OK", new UsersPage(result, result.size())));
    }

    @PostMapping("/ban")
    public ResponseEntity<ApiResponse<Void>> banUser(@RequestParam String userId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User current = userService.findByUsername(auth.getName());
        if (current == null) current = userService.findByEmail(auth.getName());
        if (current != null && current.getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot ban your own account");
        }
        userService.updateUserStatus(userId, User.UserStatus.Banned);
        return ResponseEntity.ok(ApiResponse.success("User banned successfully", null));
    }

    @PostMapping("/unban")
    public ResponseEntity<ApiResponse<Void>> unbanUser(@RequestParam String userId) {
        userService.updateUserStatus(userId, User.UserStatus.Active);
        return ResponseEntity.ok(ApiResponse.success("User unbanned successfully", null));
    }

    // Inline DTO to preserve legacy response shape { users, total } expected by frontend
    record UsersPage(List<UserResponse> users, int total) {}
}
