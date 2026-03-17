package com.ecodana.evodanavn1.controller.api.v1;

import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.dto.VehicleResponse;
import com.ecodana.evodanavn1.model.User;
import com.ecodana.evodanavn1.model.UserFavoriteVehicles;
import com.ecodana.evodanavn1.service.FavoriteService;
import com.ecodana.evodanavn1.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/favorites")
@Tag(name = "Favorite API", description = "API yeu thich xe cho FE")
@SecurityRequirement(name = "bearerAuth")
public class FavoriteApiController {

    private final FavoriteService favoriteService;
    private final UserService userService;

    public FavoriteApiController(FavoriteService favoriteService, UserService userService) {
        this.favoriteService = favoriteService;
        this.userService = userService;
    }

    @GetMapping
    @Operation(summary = "Danh sach xe yeu thich cua user hien tai")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getFavorites(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        List<VehicleResponse> vehicles = favoriteService.getFavorites(currentUser)
                .stream()
                .map(UserFavoriteVehicles::getVehicle)
                .map(VehicleResponse::new)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lay danh sach yeu thich thanh cong", vehicles));
    }

    @GetMapping("/ids")
    @Operation(summary = "Danh sach vehicleId da yeu thich")
    public ResponseEntity<ApiResponse<List<String>>> getFavoriteVehicleIds(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        List<String> ids = favoriteService.getFavorites(currentUser)
                .stream()
                .map(item -> item.getVehicle().getVehicleId())
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lay danh sach id yeu thich thanh cong", ids));
    }

    @PostMapping("/toggle/{vehicleId}")
    @Operation(summary = "Them/bo yeu thich xe")
    public ResponseEntity<ApiResponse<Map<String, Object>>> toggleFavorite(@PathVariable String vehicleId,
                                                                           Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        boolean favorited = favoriteService.toggleFavorite(currentUser, vehicleId);
        Map<String, Object> payload = Map.of(
                "favorited", favorited,
                "vehicleId", vehicleId
        );

        return ResponseEntity.ok(ApiResponse.success("Cap nhat yeu thich thanh cong", payload));
    }

    private User getCurrentUser(Authentication authentication) {
        String principal = authentication.getName();
        User currentUser = userService.getUserWithRole(principal);
        if (currentUser == null) {
            throw new NoSuchElementException("Khong tim thay nguoi dung tu token");
        }
        return currentUser;
    }
}
