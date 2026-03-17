package com.ecodana.evodanavn1.controller.api.v1;

import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.dto.api.BookingSummaryResponse;
import com.ecodana.evodanavn1.model.Booking;
import com.ecodana.evodanavn1.model.User;
import com.ecodana.evodanavn1.service.BookingService;
import com.ecodana.evodanavn1.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Booking API", description = "API booking cho FE tách riêng")
@SecurityRequirement(name = "bearerAuth")
public class BookingApiController {

    private final BookingService bookingService;
    private final UserService userService;

    public BookingApiController(BookingService bookingService, UserService userService) {
        this.bookingService = bookingService;
        this.userService = userService;
    }

    @GetMapping("/my-bookings")
    @Operation(summary = "Danh sách booking của user hiện tại")
    public ResponseEntity<ApiResponse<List<BookingSummaryResponse>>> getMyBookings(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        List<BookingSummaryResponse> bookings = bookingService.getBookingsByUserId(currentUser.getId())
                .stream()
                .map(BookingSummaryResponse::fromBooking)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách booking thành công", bookings));
    }

    @GetMapping("/my-active")
    @Operation(summary = "Danh sách booking đang hoạt động của user hiện tại")
    public ResponseEntity<ApiResponse<List<BookingSummaryResponse>>> getMyActiveBookings(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        List<BookingSummaryResponse> activeBookings = bookingService.getBookingsByUserId(currentUser.getId())
                .stream()
                .map(BookingSummaryResponse::fromBooking)
                .filter(BookingSummaryResponse::isActive)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách booking đang hoạt động thành công", activeBookings));
    }

    @GetMapping("/{bookingId}")
    @Operation(summary = "Chi tiết booking theo ID (chỉ owner của booking)")
    public ResponseEntity<ApiResponse<BookingSummaryResponse>> getBookingDetail(@PathVariable String bookingId,
                                                                                Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Booking booking = bookingService.getBookingById(bookingId);

        if (booking == null) {
            throw new NoSuchElementException("Không tìm thấy booking");
        }

        if (booking.getUser() == null || !currentUser.getId().equals(booking.getUser().getId())) {
            throw new AccessDeniedException("Bạn không có quyền truy cập booking này");
        }

        return ResponseEntity.ok(
                ApiResponse.success("Lấy chi tiết booking thành công", BookingSummaryResponse.fromBooking(booking))
        );
    }

    private User getCurrentUser(Authentication authentication) {
        String principal = authentication.getName();
        User currentUser = userService.getUserWithRole(principal);

        if (currentUser == null) {
            throw new NoSuchElementException("Không tìm thấy người dùng từ token");
        }

        return currentUser;
    }
}
