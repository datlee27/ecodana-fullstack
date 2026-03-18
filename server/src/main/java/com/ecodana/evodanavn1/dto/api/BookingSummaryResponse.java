package com.ecodana.evodanavn1.dto.api;

import com.ecodana.evodanavn1.model.Booking;
import com.ecodana.evodanavn1.model.Vehicle;
import com.ecodana.evodanavn1.model.User;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

public class BookingSummaryResponse {

    private String bookingId;
    private String bookingCode;
    private String status;
    private boolean active;
    private LocalDateTime pickupDateTime;
    private LocalDateTime returnDateTime;
    private String pickupLocation;
    private BigDecimal totalAmount;
    private BigDecimal depositAmountRequired;
    private String paymentOption;
    private String rentalType;

    private String vehicleId;
    private String vehicleModel;
    private String vehicleMainImageUrl;

    private String userId;
    private String userEmail;
    private String userFullName;

    public static BookingSummaryResponse fromBooking(Booking booking) {
        BookingSummaryResponse response = new BookingSummaryResponse();
        response.setBookingId(booking.getBookingId());
        response.setBookingCode(booking.getBookingCode());
        response.setStatus(booking.getStatus() != null ? booking.getStatus().name() : null);
        response.setActive(isActiveStatus(booking.getStatus()));
        response.setPickupDateTime(booking.getPickupDateTime());
        response.setReturnDateTime(booking.getReturnDateTime());
        response.setPickupLocation(booking.getPickupLocation());
        response.setTotalAmount(booking.getTotalAmount());
        response.setDepositAmountRequired(booking.getDepositAmountRequired());
        response.setPaymentOption(booking.getPaymentOption());
        response.setRentalType(booking.getRentalType() != null ? booking.getRentalType().name() : null);

        Vehicle vehicle = booking.getVehicle();
        if (vehicle != null) {
            response.setVehicleId(vehicle.getVehicleId());
            response.setVehicleModel(vehicle.getVehicleModel());
            response.setVehicleMainImageUrl(vehicle.getMainImageUrl());
        }

        User user = booking.getUser();
        if (user != null) {
            response.setUserId(user.getId());
            response.setUserEmail(user.getEmail());
            response.setUserFullName((user.getFirstName() + " " + user.getLastName()).trim());
        }

        return response;
    }

    private static boolean isActiveStatus(Booking.BookingStatus status) {
        if (status == null) {
            return false;
        }
        Set<Booking.BookingStatus> activeStatuses = Set.of(
                Booking.BookingStatus.Pending,
                Booking.BookingStatus.Approved,
                Booking.BookingStatus.AwaitingDeposit,
                Booking.BookingStatus.Confirmed,
                Booking.BookingStatus.Ongoing
        );
        return activeStatuses.contains(status);
    }

    public String getBookingId() {
        return bookingId;
    }

    public void setBookingId(String bookingId) {
        this.bookingId = bookingId;
    }

    public String getBookingCode() {
        return bookingCode;
    }

    public void setBookingCode(String bookingCode) {
        this.bookingCode = bookingCode;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public LocalDateTime getPickupDateTime() {
        return pickupDateTime;
    }

    public void setPickupDateTime(LocalDateTime pickupDateTime) {
        this.pickupDateTime = pickupDateTime;
    }

    public LocalDateTime getReturnDateTime() {
        return returnDateTime;
    }

    public void setReturnDateTime(LocalDateTime returnDateTime) {
        this.returnDateTime = returnDateTime;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getDepositAmountRequired() {
        return depositAmountRequired;
    }

    public void setDepositAmountRequired(BigDecimal depositAmountRequired) {
        this.depositAmountRequired = depositAmountRequired;
    }

    public String getPaymentOption() {
        return paymentOption;
    }

    public void setPaymentOption(String paymentOption) {
        this.paymentOption = paymentOption;
    }

    public String getRentalType() {
        return rentalType;
    }

    public void setRentalType(String rentalType) {
        this.rentalType = rentalType;
    }

    public String getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(String vehicleId) {
        this.vehicleId = vehicleId;
    }

    public String getVehicleModel() {
        return vehicleModel;
    }

    public void setVehicleModel(String vehicleModel) {
        this.vehicleModel = vehicleModel;
    }

    public String getVehicleMainImageUrl() {
        return vehicleMainImageUrl;
    }

    public void setVehicleMainImageUrl(String vehicleMainImageUrl) {
        this.vehicleMainImageUrl = vehicleMainImageUrl;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }
}
