package com.ecodana.evodanavn1.controller.api.v1;

import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.dto.VehicleResponse;
import com.ecodana.evodanavn1.model.Vehicle;
import com.ecodana.evodanavn1.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/vehicles")
@Tag(name = "Vehicle API", description = "API danh sách/chi tiết xe cho FE")
public class VehicleApiController {

    private final VehicleService vehicleService;

    public VehicleApiController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    @Operation(summary = "Tìm kiếm/lọc danh sách xe")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> listVehicles(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String pickupDate,
            @RequestParam(required = false) String returnDate,
            @RequestParam(required = false) String pickupTime,
            @RequestParam(required = false) String returnTime,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String vehicleType,
            @RequestParam(required = false) String budget,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) Boolean requiresLicense
    ) {
        List<VehicleResponse> vehicles = vehicleService
                .filterVehicles(location, pickupDate, returnDate, pickupTime, returnTime,
                        category, vehicleType, budget, seats, requiresLicense)
                .stream()
                .map(VehicleResponse::new)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách xe thành công", vehicles));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Lấy chi tiết xe theo ID")
    public ResponseEntity<ApiResponse<VehicleResponse>> vehicleDetail(@PathVariable("id") String vehicleId) {
        Vehicle vehicle = vehicleService.getVehicleById(vehicleId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy xe"));

        return ResponseEntity.ok(
                ApiResponse.success("Lấy chi tiết xe thành công", new VehicleResponse(vehicle))
        );
    }
}
