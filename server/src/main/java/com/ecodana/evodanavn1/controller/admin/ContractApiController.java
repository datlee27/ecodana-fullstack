package com.ecodana.evodanavn1.controller.admin;

import com.ecodana.evodanavn1.model.Contract;
import com.ecodana.evodanavn1.service.ContractService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin/api/contracts")
public class ContractApiController {

    @Autowired
    private ContractService contractService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllContracts(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        try {
            List<Contract> contracts = contractService.getAllContracts();
            
            // Apply filters
            contracts = contracts.stream().filter(contract -> {
                // Status filter
                if (status != null && !status.isEmpty()) {
                    try {
                        Contract.ContractStatus filterStatus = Contract.ContractStatus.valueOf(status);
                        if (contract.getStatus() != filterStatus) return false;
                    } catch (IllegalArgumentException ignored) {}
                }
                
                // Search filter (contractCode, userName, bookingCode)
                if (search != null && !search.isEmpty()) {
                    String searchLower = search.toLowerCase();
                    boolean matches = false;
                    if (contract.getContractCode() != null && contract.getContractCode().toLowerCase().contains(searchLower)) matches = true;
                    if (contract.getUser() != null && contract.getUser().getFirstName() != null 
                        && (contract.getUser().getFirstName() + " " + contract.getUser().getLastName()).toLowerCase().contains(searchLower)) matches = true;
                    if (contract.getBooking() != null && contract.getBooking().getBookingCode() != null 
                        && contract.getBooking().getBookingCode().toLowerCase().contains(searchLower)) matches = true;
                    if (contract.getUser() != null && contract.getUser().getEmail() != null 
                        && contract.getUser().getEmail().toLowerCase().contains(searchLower)) matches = true;
                    if (!matches) return false;
                }
                
                return true;
            }).collect(Collectors.toList());
            
            List<Map<String, Object>> contractsData = contracts.stream().map(contract -> {
                Map<String, Object> data = new HashMap<>();
                data.put("contractId", contract.getContractId());
                data.put("contractCode", contract.getContractCode());
                data.put("status", contract.getStatus().toString());
                data.put("createdDate", contract.getCreatedDate());
                data.put("signedDate", contract.getSignedDate());
                data.put("completedDate", contract.getCompletedDate());
                data.put("termsAccepted", contract.getTermsAccepted());
                data.put("notes", contract.getNotes());
                data.put("cancellationReason", contract.getCancellationReason());
                
                // User info
                if (contract.getUser() != null) {
                    data.put("userName", contract.getUser().getFirstName() + " " + contract.getUser().getLastName());
                    data.put("userEmail", contract.getUser().getEmail());
                    data.put("userPhone", contract.getUser().getPhoneNumber());
                }
                
                // Booking info
                if (contract.getBooking() != null) {
                    data.put("bookingCode", contract.getBooking().getBookingCode());
                    data.put("totalAmount", contract.getBooking().getTotalAmount());
                    
                    // Vehicle info
                    if (contract.getBooking().getVehicle() != null) {
                        data.put("vehicleModel", contract.getBooking().getVehicle().getVehicleModel());
                        data.put("licensePlate", contract.getBooking().getVehicle().getLicensePlate());
                    }
                }
                
                return data;
            }).collect(Collectors.toList());
            
            return ResponseEntity.ok(contractsData);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getContractById(@PathVariable String id) {
        try {
            return contractService.getContractById(id)
                .map(contract -> {
                    Map<String, Object> data = new HashMap<>();
                    data.put("contractId", contract.getContractId());
                    data.put("contractCode", contract.getContractCode());
                    data.put("status", contract.getStatus().toString());
                    data.put("createdDate", contract.getCreatedDate());
                    data.put("signedDate", contract.getSignedDate());
                    data.put("completedDate", contract.getCompletedDate());
                    data.put("termsAccepted", contract.getTermsAccepted());
                    data.put("notes", contract.getNotes());
                    data.put("cancellationReason", contract.getCancellationReason());
                    data.put("signatureData", contract.getSignatureData());
                    data.put("signatureMethod", contract.getSignatureMethod());
                    
                    if (contract.getUser() != null) {
                        data.put("userName", contract.getUser().getFirstName() + " " + contract.getUser().getLastName());
                        data.put("userEmail", contract.getUser().getEmail());
                        data.put("userPhone", contract.getUser().getPhoneNumber());
                    }
                    
                    if (contract.getBooking() != null) {
                        data.put("bookingCode", contract.getBooking().getBookingCode());
                        data.put("totalAmount", contract.getBooking().getTotalAmount());
                        
                        if (contract.getBooking().getVehicle() != null) {
                            data.put("vehicleModel", contract.getBooking().getVehicle().getVehicleModel());
                            data.put("licensePlate", contract.getBooking().getVehicle().getLicensePlate());
                        }
                    }
                    
                    return ResponseEntity.ok(data);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("total", contractService.getTotalContracts());
            stats.put("draft", contractService.getDraftContracts());
            stats.put("signed", contractService.getSignedContracts());
            stats.put("completed", contractService.getCompletedContracts());
            stats.put("cancelled", contractService.getCancelledContracts());
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateContractStatus(
            @PathVariable String id,
            @RequestParam String status) {
        try {
            Contract.ContractStatus newStatus = Contract.ContractStatus.valueOf(status);
            return contractService.getContractById(id)
                .map(contract -> {
                    contract.setStatus(newStatus);
                    contractService.saveContract(contract);
                    return ResponseEntity.ok(Map.<String, Object>of(
                        "status", "success",
                        "message", "Contract status updated to " + status
                    ));
                })
                .orElse(ResponseEntity.status(404).body(
                    Map.of("status", "error", "message", "Contract not found: " + id)
                ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("status", "error", "message", "Invalid status value: " + status)
            );
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(
                Map.of("status", "error", "message", "Failed to update status: " + e.getMessage())
            );
        }
    }
}
