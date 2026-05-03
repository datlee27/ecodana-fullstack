package com.ecodana.evodanavn1.dto;

import com.ecodana.evodanavn1.model.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {

    private String paymentId;
    private BigDecimal amount;
    private String paymentMethod;
    private String paymentStatus;
    private String paymentType;
    private String transactionId;
    private LocalDateTime paymentDate;
    private String notes;
    private LocalDateTime createdDate;

    // Booking join
    private String bookingId;
    private String bookingCode;

    // User join
    private String userName;
    private String userEmail;
    private String userPhone;

    // Contract join
    private String contractCode;

    public PaymentResponse() {}

    public PaymentResponse(Payment p) {
        this.paymentId = p.getPaymentId();
        this.amount = p.getAmount();
        this.paymentMethod = p.getPaymentMethod();
        this.paymentStatus = p.getPaymentStatus() != null ? p.getPaymentStatus().name() : null;
        this.paymentType = p.getPaymentType() != null ? p.getPaymentType().name() : null;
        this.transactionId = p.getTransactionId();
        this.paymentDate = p.getPaymentDate();
        this.notes = p.getNotes();
        this.createdDate = p.getCreatedDate();

        if (p.getBooking() != null) {
            this.bookingId = p.getBooking().getBookingId();
            this.bookingCode = p.getBooking().getBookingCode();
        }
        if (p.getUser() != null) {
            String first = p.getUser().getFirstName() != null ? p.getUser().getFirstName() : "";
            String last = p.getUser().getLastName() != null ? p.getUser().getLastName() : "";
            this.userName = (first + " " + last).trim();
            this.userEmail = p.getUser().getEmail();
            this.userPhone = p.getUser().getPhoneNumber();
        }
        if (p.getContract() != null) {
            this.contractCode = p.getContract().getContractCode();
        }
    }

    // Getters
    public String getPaymentId() { return paymentId; }
    public BigDecimal getAmount() { return amount; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getPaymentType() { return paymentType; }
    public String getTransactionId() { return transactionId; }
    public LocalDateTime getPaymentDate() { return paymentDate; }
    public String getNotes() { return notes; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public String getBookingId() { return bookingId; }
    public String getBookingCode() { return bookingCode; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public String getUserPhone() { return userPhone; }
    public String getContractCode() { return contractCode; }
}
