package com.ecodana.evodanavn1.dto;

import com.ecodana.evodanavn1.model.RefundRequest;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class RefundResponse {

    private String refundRequestId;
    private BigDecimal refundAmount;
    private String status;
    private String cancelReason;
    private String adminNotes;
    private LocalDateTime createdDate;
    private LocalDateTime processedDate;
    private boolean isWithinTwoHours;
    private String transferProofImagePath;

    // Booking join
    private String bookingId;
    private String bookingCode;

    // Customer join
    private String userId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Bank account join
    private String bankName;
    private String bankCode;
    private String accountNumber;
    private String accountHolder;
    private String qrCodeImagePath;

    public RefundResponse() {}

    public RefundResponse(RefundRequest r) {
        this.refundRequestId = r.getRefundRequestId();
        this.refundAmount = r.getRefundAmount();
        this.status = r.getStatus() != null ? r.getStatus().name() : null;
        this.cancelReason = r.getCancelReason();
        this.adminNotes = r.getAdminNotes();
        this.createdDate = r.getCreatedDate();
        this.processedDate = r.getProcessedDate();
        this.isWithinTwoHours = r.isWithinTwoHours();
        this.transferProofImagePath = r.getTransferProofImagePath();

        if (r.getBooking() != null) {
            this.bookingId = r.getBooking().getBookingId();
            this.bookingCode = r.getBooking().getBookingCode();
        }
        if (r.getUser() != null) {
            this.userId = r.getUser().getId();
            String first = r.getUser().getFirstName() != null ? r.getUser().getFirstName() : "";
            String last = r.getUser().getLastName() != null ? r.getUser().getLastName() : "";
            this.customerName = (first + " " + last).trim();
            this.customerEmail = r.getUser().getEmail();
            this.customerPhone = r.getUser().getPhoneNumber();
        }
        if (r.getBankAccount() != null) {
            this.bankName = r.getBankAccount().getBankName();
            this.bankCode = r.getBankAccount().getBankCode();
            this.accountNumber = r.getBankAccount().getAccountNumber();
            this.accountHolder = r.getBankAccount().getAccountHolderName();
            this.qrCodeImagePath = r.getBankAccount().getQrCodeImagePath();
        }
    }

    // Getters
    public String getRefundRequestId() { return refundRequestId; }
    public BigDecimal getRefundAmount() { return refundAmount; }
    public String getStatus() { return status; }
    public String getCancelReason() { return cancelReason; }
    public String getAdminNotes() { return adminNotes; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public LocalDateTime getProcessedDate() { return processedDate; }
    public boolean isWithinTwoHours() { return isWithinTwoHours; }
    public String getTransferProofImagePath() { return transferProofImagePath; }
    public String getBookingId() { return bookingId; }
    public String getBookingCode() { return bookingCode; }
    public String getUserId() { return userId; }
    public String getCustomerName() { return customerName; }
    public String getCustomerEmail() { return customerEmail; }
    public String getCustomerPhone() { return customerPhone; }
    public String getBankName() { return bankName; }
    public String getBankCode() { return bankCode; }
    public String getAccountNumber() { return accountNumber; }
    public String getAccountHolder() { return accountHolder; }
    public String getQrCodeImagePath() { return qrCodeImagePath; }
}
