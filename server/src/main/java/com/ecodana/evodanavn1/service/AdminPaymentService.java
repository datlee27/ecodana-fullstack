package com.ecodana.evodanavn1.service;

import com.ecodana.evodanavn1.dto.PaymentResponse;
import com.ecodana.evodanavn1.model.Payment;
import com.ecodana.evodanavn1.model.Payment.PaymentStatus;
import com.ecodana.evodanavn1.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Admin-scoped payment service.
 * Handles filtering, status transitions, and statistics for admin panel.
 * Separate from PaymentService (owner-scoped) to respect Single Responsibility.
 */
@Service
public class AdminPaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    public List<PaymentResponse> getPayments(String status, String method, String search,
                                              String dateFrom, String dateTo) {
        List<Payment> payments = paymentRepository.findAll();

        return payments.stream()
                .filter(p -> matchesStatus(p, status))
                .filter(p -> matchesMethod(p, method))
                .filter(p -> matchesDateFrom(p, dateFrom))
                .filter(p -> matchesDateTo(p, dateTo))
                .filter(p -> matchesSearch(p, search))
                .map(PaymentResponse::new)
                .collect(Collectors.toList());
    }

    public Optional<PaymentResponse> findById(String id) {
        return paymentRepository.findById(id).map(PaymentResponse::new);
    }

    public PaymentStats getStatistics() {
        List<Payment> all = paymentRepository.findAll();
        long total = all.size();
        long pending = all.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.Pending).count();
        long completed = all.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.Completed).count();
        long failed = all.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.Failed).count();
        long refunded = all.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.Refunded).count();
        double totalRevenue = all.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.Completed)
                .mapToDouble(p -> p.getAmount().doubleValue())
                .sum();
        return new PaymentStats(total, pending, completed, failed, refunded, totalRevenue);
    }

    @Transactional
    public void updatePayment(String id, Map<String, Object> updates) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Payment not found: " + id));

        if (updates.containsKey("paymentStatus")) {
            String statusStr = (String) updates.get("paymentStatus");
            PaymentStatus newStatus = PaymentStatus.valueOf(statusStr);
            payment.setPaymentStatus(newStatus);
            if (newStatus == PaymentStatus.Completed && payment.getPaymentDate() == null) {
                payment.setPaymentDate(LocalDateTime.now());
            }
        }
        if (updates.containsKey("amount") && updates.get("amount") instanceof Number num) {
            payment.setAmount(new BigDecimal(num.toString()));
        }
        if (updates.containsKey("paymentMethod")) {
            payment.setPaymentMethod((String) updates.get("paymentMethod"));
        }
        if (updates.containsKey("notes")) {
            payment.setNotes((String) updates.get("notes"));
        }
        if (updates.containsKey("transactionId")) {
            payment.setTransactionId((String) updates.get("transactionId"));
        }
        paymentRepository.save(payment);
    }

    @Transactional
    public void deletePayment(String id) {
        if (!paymentRepository.existsById(id)) {
            throw new NoSuchElementException("Payment not found: " + id);
        }
        paymentRepository.deleteById(id);
    }

    @Transactional
    public void markStatus(String id, PaymentStatus status) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Payment not found: " + id));
        payment.setPaymentStatus(status);
        if (status == PaymentStatus.Completed) {
            payment.setPaymentDate(LocalDateTime.now());
        }
        paymentRepository.save(payment);
    }

    @Transactional
    public void processRefund(String id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Payment not found: " + id));
        if (payment.getPaymentStatus() != PaymentStatus.Completed) {
            throw new IllegalStateException("Only completed payments can be refunded");
        }
        payment.setPaymentStatus(PaymentStatus.Refunded);
        paymentRepository.save(payment);
    }

    // ── Private filter helpers ─────────────────────────────────────────────────

    private boolean matchesStatus(Payment p, String status) {
        if (status == null || status.isBlank()) return true;
        try {
            return p.getPaymentStatus() == PaymentStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            return true;
        }
    }

    private boolean matchesMethod(Payment p, String method) {
        if (method == null || method.isBlank()) return true;
        return method.equalsIgnoreCase(p.getPaymentMethod());
    }

    private boolean matchesDateFrom(Payment p, String dateFrom) {
        if (dateFrom == null || dateFrom.isBlank() || p.getPaymentDate() == null) return true;
        try {
            return !p.getPaymentDate().toLocalDate().isBefore(LocalDate.parse(dateFrom));
        } catch (Exception e) {
            return true;
        }
    }

    private boolean matchesDateTo(Payment p, String dateTo) {
        if (dateTo == null || dateTo.isBlank() || p.getPaymentDate() == null) return true;
        try {
            return !p.getPaymentDate().toLocalDate().isAfter(LocalDate.parse(dateTo));
        } catch (Exception e) {
            return true;
        }
    }

    private boolean matchesSearch(Payment p, String search) {
        if (search == null || search.isBlank()) return true;
        String q = search.toLowerCase();
        if (p.getBooking() != null && p.getBooking().getBookingCode() != null
                && p.getBooking().getBookingCode().toLowerCase().contains(q)) return true;
        if (p.getUser() != null) {
            String name = ((p.getUser().getFirstName() != null ? p.getUser().getFirstName() : "") + " "
                    + (p.getUser().getLastName() != null ? p.getUser().getLastName() : "")).toLowerCase();
            if (name.contains(q)) return true;
            if (p.getUser().getEmail() != null && p.getUser().getEmail().toLowerCase().contains(q)) return true;
        }
        return p.getTransactionId() != null && p.getTransactionId().toLowerCase().contains(q);
    }

    // ── Nested stats DTO ──────────────────────────────────────────────────────

    public record PaymentStats(
            long total,
            long pending,
            long completed,
            long failed,
            long refunded,
            double totalRevenue
    ) {}
}
