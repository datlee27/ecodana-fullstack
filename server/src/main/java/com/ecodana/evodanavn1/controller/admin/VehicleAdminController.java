package com.ecodana.evodanavn1.controller.admin;

import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.dto.VehicleResponse;
import com.ecodana.evodanavn1.model.Vehicle;
import com.ecodana.evodanavn1.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/admin/api/vehicles")
public class VehicleAdminController {

    @Autowired
    private VehicleService vehicleService;

    @PostMapping("/{vehicleId}/approve")
    public ResponseEntity<ApiResponse<VehicleResponse>> approveVehicle(@PathVariable String vehicleId) {
        Vehicle vehicle = vehicleService.approveVehicle(vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Vehicle approved successfully", new VehicleResponse(vehicle)));
    }

    @PostMapping("/{vehicleId}/reject")
    public ResponseEntity<ApiResponse<VehicleResponse>> rejectVehicle(
            @PathVariable String vehicleId,
            @RequestBody Map<String, String> body) {
        String reason = body.get("reason");
        if (reason == null || reason.isBlank()) {
            throw new IllegalArgumentException("Rejection reason is required");
        }
        Vehicle vehicle = vehicleService.rejectVehicle(vehicleId, reason);
        return ResponseEntity.ok(ApiResponse.success("Vehicle rejected successfully", new VehicleResponse(vehicle)));
    }

    @DeleteMapping("/{vehicleId}/delete")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable String vehicleId) {
        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully", null));
    }

    @GetMapping("/{vehicleId}/detail")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleDetail(@PathVariable String vehicleId) {
        Vehicle vehicle = vehicleService.getVehicleById(vehicleId)
                .orElseThrow(() -> new NoSuchElementException("Vehicle not found: " + vehicleId));
        return ResponseEntity.ok(ApiResponse.success("OK", new VehicleResponse(vehicle)));
    }
}
