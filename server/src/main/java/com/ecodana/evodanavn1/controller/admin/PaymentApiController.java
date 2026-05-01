package com.ecodana.evodanavn1.controller.admin;

import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.dto.PaymentResponse;
import com.ecodana.evodanavn1.model.Payment;
import com.ecodana.evodanavn1.model.Payment.PaymentStatus;
import com.ecodana.evodanavn1.service.AdminPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Admin REST controller for payment management.
 * Route → service → ApiResponse<T>. No try-catch. No Map building. No repo injection.
 */
@RestController
@RequestMapping("/admin/api/payments")
public class PaymentApiController {

    @Autowired
    private AdminPaymentService adminPaymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String dateFrom,
            @RequestParam(required = false) String dateTo) {
        List<PaymentResponse> result = adminPaymentService.getPayments(status, method, search, dateFrom, dateTo);
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<AdminPaymentService.PaymentStats>> getStatistics() {
        return ResponseEntity.ok(ApiResponse.success("OK", adminPaymentService.getStatistics()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable String id) {
        PaymentResponse p = adminPaymentService.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Payment not found: " + id));
        return ResponseEntity.ok(ApiResponse.success("OK", p));
    }

    @PutMapping("/{id}/update")
    public ResponseEntity<ApiResponse<Void>> updatePayment(
            @PathVariable String id,
            @RequestBody Map<String, Object> updates) {
        adminPaymentService.updatePayment(id, updates);
        return ResponseEntity.ok(ApiResponse.success("Payment updated successfully", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable String id) {
        adminPaymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success("Payment deleted successfully", null));
    }

    @PostMapping("/{id}/mark-completed")
    public ResponseEntity<ApiResponse<Void>> markAsCompleted(@PathVariable String id) {
        adminPaymentService.markStatus(id, PaymentStatus.Completed);
        return ResponseEntity.ok(ApiResponse.success("Payment marked as completed", null));
    }

    @PostMapping("/{id}/mark-failed")
    public ResponseEntity<ApiResponse<Void>> markAsFailed(@PathVariable String id) {
        adminPaymentService.markStatus(id, PaymentStatus.Failed);
        return ResponseEntity.ok(ApiResponse.success("Payment marked as failed", null));
    }

    @PostMapping("/{id}/refund")
    public ResponseEntity<ApiResponse<Void>> processRefund(@PathVariable String id) {
        adminPaymentService.processRefund(id);
        return ResponseEntity.ok(ApiResponse.success("Refund processed successfully", null));
    }
}
