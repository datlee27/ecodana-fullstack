package com.ecodana.evodanavn1.controller.admin;

import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.dto.RefundResponse;
import com.ecodana.evodanavn1.model.BankAccount;
import com.ecodana.evodanavn1.model.Booking;
import com.ecodana.evodanavn1.model.RefundRequest;
import com.ecodana.evodanavn1.repository.RefundRequestRepository;
import com.ecodana.evodanavn1.service.BankAccountService;
import com.ecodana.evodanavn1.service.RefundRequestService;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Admin REST controller for refund request management.
 * Route → service → ApiResponse<T>. No try-catch. No Map building.
 * Debug/sync endpoints retained but cleaned up.
 */
@RestController
@RequestMapping("/admin/api/refund-requests")
public class RefundRequestApiController {

    @Autowired private RefundRequestRepository refundRequestRepository;
    @Autowired private RefundRequestService refundRequestService;
    @Autowired private BankAccountService bankAccountService;
    @Autowired private Cloudinary cloudinary;

    // ── Queries ───────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<ApiResponse<List<RefundResponse>>> getAllRefundRequests(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        List<RefundResponse> result = refundRequestRepository.findAll().stream()
                .filter(r -> matchesStatus(r, status))
                .filter(r -> matchesSearch(r, search))
                .map(RefundResponse::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    @GetMapping("/pending")
    public ResponseEntity<ApiResponse<List<RefundResponse>>> getPendingRefundRequests() {
        List<RefundRequest> requests = refundRequestRepository.findPendingRequestsOrderByCreatedDate();
        if (requests.isEmpty()) {
            requests = refundRequestRepository.findAll();
            requests.sort((a, b) -> b.getCreatedDate().compareTo(a.getCreatedDate()));
        }
        List<RefundResponse> result = requests.stream().map(RefundResponse::new).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("OK", result));
    }

    @GetMapping("/by-booking/{bookingId}")
    public ResponseEntity<ApiResponse<RefundResponse>> getRefundByBookingId(@PathVariable String bookingId) {
        RefundRequest r = refundRequestRepository.findByBookingBookingId(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Refund request not found for booking: " + bookingId));
        return ResponseEntity.ok(ApiResponse.success("OK", new RefundResponse(r)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RefundResponse>> getRefundById(@PathVariable String id) {
        RefundRequest r = refundRequestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Refund request not found: " + id));
        return ResponseEntity.ok(ApiResponse.success("OK", new RefundResponse(r)));
    }

    @GetMapping("/statistics")
    public ResponseEntity<ApiResponse<RefundStats>> getStatistics() {
        List<RefundRequest> all = refundRequestRepository.findAll();
        long total = all.size();
        long pending = all.stream().filter(r -> r.getStatus() == RefundRequest.RefundStatus.Pending).count();
        long refunded = all.stream().filter(r -> r.getStatus() == RefundRequest.RefundStatus.Refunded).count();
        long rejected = all.stream().filter(r -> r.getStatus() == RefundRequest.RefundStatus.Rejected).count();
        long urgent = refundRequestRepository.findUrgentPendingRequests().size();
        double totalPendingAmount = all.stream()
                .filter(r -> r.getStatus() == RefundRequest.RefundStatus.Pending)
                .mapToDouble(r -> r.getRefundAmount().doubleValue())
                .sum();
        return ResponseEntity.ok(ApiResponse.success("OK",
                new RefundStats(total, pending, refunded, rejected, urgent, totalPendingAmount)));
    }

    @GetMapping("/customer-bank-accounts/{userId}")
    public ResponseEntity<ApiResponse<List<BankAccount>>> getCustomerBankAccounts(@PathVariable String userId) {
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("User ID is required");
        }
        return ResponseEntity.ok(ApiResponse.success("OK", bankAccountService.getBankAccountsByUserId(userId)));
    }

    // ── Commands ──────────────────────────────────────────────────────────────

    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<Void>> approveRefundRequest(
            @PathVariable String id,
            @RequestParam(required = false) String adminNotes) {
        RefundRequest r = refundRequestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Refund request not found: " + id));
        if (r.getStatus() != RefundRequest.RefundStatus.Pending) {
            throw new IllegalStateException("Only pending requests can be approved");
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        refundRequestService.approveRefundRequest(id, auth.getName(), adminNotes != null ? adminNotes : "");
        return ResponseEntity.ok(ApiResponse.success("Refund request approved successfully", null));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectRefundRequest(
            @PathVariable String id,
            @RequestParam(required = false) String adminNotes) {
        RefundRequest r = refundRequestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Refund request not found: " + id));
        if (r.getStatus() != RefundRequest.RefundStatus.Pending) {
            throw new IllegalStateException("Only pending requests can be rejected");
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        refundRequestService.rejectRefundRequest(id, auth.getName(), adminNotes != null ? adminNotes : "");
        return ResponseEntity.ok(ApiResponse.success("Refund request rejected successfully", null));
    }

    @PostMapping("/{id}/mark-transferred")
    public ResponseEntity<ApiResponse<Void>> markRefundTransferred(
            @PathVariable String id,
            @RequestParam(required = false) String transferProofImagePath) {
        RefundRequest r = refundRequestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Refund request not found: " + id));
        if (r.getStatus() != RefundRequest.RefundStatus.Pending) {
            throw new IllegalStateException("Only pending requests can be marked as transferred");
        }
        refundRequestService.markRefundTransferred(id, transferProofImagePath);
        return ResponseEntity.ok(ApiResponse.success("Refund marked as transferred successfully", null));
    }

    @PostMapping("/{id}/mark-completed")
    public ResponseEntity<ApiResponse<Void>> markRefundCompleted(
            @PathVariable String id,
            @RequestParam(required = false) String transferProofImagePath) {
        RefundRequest r = refundRequestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Refund request not found: " + id));
        if (r.getStatus() != RefundRequest.RefundStatus.Pending) {
            throw new IllegalStateException("Only pending requests can be marked as completed");
        }
        r.setStatus(RefundRequest.RefundStatus.Refunded);
        r.setTransferProofImagePath(transferProofImagePath);
        r.setProcessedDate(LocalDateTime.now());
        refundRequestRepository.save(r);
        return ResponseEntity.ok(ApiResponse.success("Refund marked as completed successfully", null));
    }

    @PostMapping("/{id}/update-status")
    public ResponseEntity<ApiResponse<Void>> updateRefundStatus(
            @PathVariable String id,
            @RequestParam String status) {
        RefundRequest.RefundStatus newStatus;
        try {
            newStatus = RefundRequest.RefundStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid status: " + status);
        }
        RefundRequest r = refundRequestRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Refund request not found: " + id));
        r.setStatus(newStatus);
        refundRequestRepository.save(r);
        return ResponseEntity.ok(ApiResponse.success("Status updated successfully", null));
    }

    @PostMapping("/upload-transfer-proof")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadTransferProof(
            @RequestParam("file") MultipartFile file,
            @RequestParam("refundRequestId") String refundRequestId) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("File is empty");
        @SuppressWarnings("unchecked")
        Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(),
                ObjectUtils.asMap("folder", "ecodana/refund-proofs", "resource_type", "auto"));
        String imageUrl = (String) uploadResult.get("secure_url");
        return ResponseEntity.ok(ApiResponse.success("Transfer proof uploaded", Map.of("imageUrl", imageUrl)));
    }

    // ── Sync utilities (admin-only maintenance) ───────────────────────────────

    @PostMapping("/sync-payment-refunds")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncPaymentRefunds() {
        int count = refundRequestService.syncPaymentRefunds();
        return ResponseEntity.ok(ApiResponse.success("Synced " + count + " payment refunds", Map.of("count", count)));
    }

    @PostMapping("/sync-pending-bookings")
    public ResponseEntity<ApiResponse<Map<String, Object>>> syncPendingBookings() {
        int count = refundRequestService.syncPendingBookings();
        return ResponseEntity.ok(ApiResponse.success("Synced " + count + " pending bookings", Map.of("count", count)));
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private boolean matchesStatus(RefundRequest r, String status) {
        if (status == null || status.isBlank()) return true;
        try { return r.getStatus() == RefundRequest.RefundStatus.valueOf(status); }
        catch (IllegalArgumentException e) { return true; }
    }

    private boolean matchesSearch(RefundRequest r, String search) {
        if (search == null || search.isBlank()) return true;
        String q = search.toLowerCase();
        if (r.getRefundRequestId() != null && r.getRefundRequestId().toLowerCase().contains(q)) return true;
        if (r.getBooking() != null && r.getBooking().getBookingCode() != null
                && r.getBooking().getBookingCode().toLowerCase().contains(q)) return true;
        if (r.getUser() != null && r.getUser().getFirstName() != null
                && (r.getUser().getFirstName() + " " + r.getUser().getLastName()).toLowerCase().contains(q)) return true;
        return r.getCancelReason() != null && r.getCancelReason().toLowerCase().contains(q);
    }

    // ── Nested stats DTO ──────────────────────────────────────────────────────
    record RefundStats(long total, long pending, long refunded, long rejected, long urgent, double totalPendingAmount) {}
}
