package com.ecodana.evodanavn1.controller.api.v1;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.dto.VehicleResponse;
import com.ecodana.evodanavn1.model.BankAccount;
import com.ecodana.evodanavn1.model.Booking;
import com.ecodana.evodanavn1.model.Payment;
import com.ecodana.evodanavn1.model.User;
import com.ecodana.evodanavn1.model.UserFeedback;
import com.ecodana.evodanavn1.model.Vehicle;
import com.ecodana.evodanavn1.repository.BookingRepository;
import com.ecodana.evodanavn1.repository.TransmissionTypeRepository;
import com.ecodana.evodanavn1.repository.VehicleCategoriesRepository;
import com.ecodana.evodanavn1.service.BankAccountService;
import com.ecodana.evodanavn1.service.BookingService;
import com.ecodana.evodanavn1.service.PaymentService;
import com.ecodana.evodanavn1.service.UserFeedbackService;
import com.ecodana.evodanavn1.service.UserService;
import com.ecodana.evodanavn1.service.VehicleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner")
@Tag(name = "Owner Management API", description = "API owner dashboard/vehicle/booking cho frontend React")
@SecurityRequirement(name = "bearerAuth")
public class OwnerManagementApiController {
    private static final List<Booking.BookingStatus> BLOCKING_BOOKING_STATUSES = List.of(
            Booking.BookingStatus.Pending,
            Booking.BookingStatus.Approved,
            Booking.BookingStatus.AwaitingDeposit,
            Booking.BookingStatus.Confirmed,
            Booking.BookingStatus.Ongoing,
            Booking.BookingStatus.LatePickup
    );

    private final UserService userService;
    private final VehicleService vehicleService;
    private final BookingService bookingService;
    private final PaymentService paymentService;
    private final UserFeedbackService userFeedbackService;
    private final BankAccountService bankAccountService;
    private final VehicleCategoriesRepository vehicleCategoriesRepository;
    private final TransmissionTypeRepository transmissionTypeRepository;
    private final BookingRepository bookingRepository;
    private final ObjectMapper objectMapper;
    private final Cloudinary cloudinary;

    public OwnerManagementApiController(UserService userService,
                                        VehicleService vehicleService,
                                        BookingService bookingService,
                                        PaymentService paymentService,
                                        UserFeedbackService userFeedbackService,
                                        BankAccountService bankAccountService,
                                        VehicleCategoriesRepository vehicleCategoriesRepository,
                                        TransmissionTypeRepository transmissionTypeRepository,
                                        BookingRepository bookingRepository,
                                        ObjectMapper objectMapper,
                                        Cloudinary cloudinary) {
        this.userService = userService;
        this.vehicleService = vehicleService;
        this.bookingService = bookingService;
        this.paymentService = paymentService;
        this.userFeedbackService = userFeedbackService;
        this.bankAccountService = bankAccountService;
        this.vehicleCategoriesRepository = vehicleCategoriesRepository;
        this.transmissionTypeRepository = transmissionTypeRepository;
        this.bookingRepository = bookingRepository;
        this.objectMapper = objectMapper;
        this.cloudinary = cloudinary;
    }

    @GetMapping("/metadata")
    @Operation(summary = "Lay metadata cho owner forms")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMetadata(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        List<Map<String, Object>> categories = vehicleCategoriesRepository.findAll().stream()
                .map(c -> Map.<String, Object>of(
                        "categoryId", c.getCategoryId(),
                        "categoryName", c.getCategoryName()
                ))
                .toList();

        List<Map<String, Object>> transmissions = transmissionTypeRepository.findAll().stream()
                .map(t -> Map.<String, Object>of(
                        "transmissionTypeId", t.getTransmissionTypeId(),
                        "transmissionTypeName", t.getTransmissionTypeName()
                ))
                .toList();

        List<String> vehicleStatuses = Arrays.stream(Vehicle.VehicleStatus.values())
                .map(Enum::name)
                .toList();

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("categories", categories);
        payload.put("transmissions", transmissions);
        payload.put("vehicleStatuses", vehicleStatuses);
        payload.put("vehicleTypes", List.of("ElectricCar", "ElectricMotorcycle"));

        return ResponseEntity.ok(ApiResponse.success("Lay metadata owner thanh cong", payload));
    }

    @GetMapping("/vehicles")
    @Operation(summary = "Danh sach xe cua owner hien tai")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getOwnerVehicles(Authentication authentication,
                                                                               @RequestParam(required = false) String ownerId) {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        String resolvedOwnerId = currentUser.getId();
        if (ownerId != null && !ownerId.isBlank() && isPrivileged(currentUser)) {
            resolvedOwnerId = ownerId.trim();
        }

        List<VehicleResponse> payload = vehicleService.getVehiclesByOwnerId(resolvedOwnerId)
                .stream()
                .map(VehicleResponse::new)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lay danh sach xe cua owner thanh cong", payload));
    }

    @PostMapping("/vehicles")
    @Operation(summary = "Tao xe moi cho owner")
    public ResponseEntity<ApiResponse<VehicleResponse>> createOwnerVehicle(@RequestBody OwnerVehicleRequest request,
                                                                           Authentication authentication) throws Exception {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        validateVehicleRequest(request, true);
        if (vehicleService.vehicleExistsByLicensePlate(request.licensePlate().trim())) {
            throw new IllegalArgumentException("Bien so xe nay da ton tai");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setVehicleId(UUID.randomUUID().toString());
        vehicle.setOwnerId(currentUser.getId());
        vehicle.setLastUpdatedBy(currentUser);
        vehicle.setCreatedDate(LocalDateTime.now());

        applyVehicleRequest(vehicle, request, true);
        Vehicle saved = vehicleService.saveVehicle(vehicle);

        return ResponseEntity.ok(ApiResponse.success("Tao xe thanh cong", new VehicleResponse(saved)));
    }

    @PutMapping("/vehicles/{vehicleId}")
    @Operation(summary = "Cap nhat xe cua owner")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateOwnerVehicle(@PathVariable String vehicleId,
                                                                           @RequestBody OwnerVehicleRequest request,
                                                                           Authentication authentication) throws Exception {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        Vehicle vehicle = vehicleService.getVehicleById(vehicleId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay xe"));
        ensureVehicleAccess(vehicle, currentUser);

        validateVehicleRequest(request, false);
        String nextPlate = request.licensePlate().trim();
        if (vehicleService.vehicleExistsByLicensePlateAndNotId(nextPlate, vehicleId)) {
            throw new IllegalArgumentException("Bien so xe nay da ton tai");
        }

        Vehicle.VehicleStatus targetStatus = vehicle.getStatus();
        if (request.status() != null && !request.status().isBlank()) {
            targetStatus = Vehicle.VehicleStatus.valueOf(request.status().trim());
        }
        ensureVehicleCanBeSetAvailable(vehicleId, targetStatus);

        applyVehicleRequest(vehicle, request, false);
        vehicle.setLastUpdatedBy(currentUser);
        Vehicle saved = vehicleService.updateVehicle(vehicle);

        return ResponseEntity.ok(ApiResponse.success("Cap nhat xe thanh cong", new VehicleResponse(saved)));
    }

    @PatchMapping("/vehicles/{vehicleId}/status")
    @Operation(summary = "Cap nhat trang thai xe")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateVehicleStatus(@PathVariable String vehicleId,
                                                                                @RequestBody VehicleStatusRequest request,
                                                                                Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        Vehicle vehicle = vehicleService.getVehicleById(vehicleId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay xe"));
        ensureVehicleAccess(vehicle, currentUser);

        if (request.status() == null || request.status().isBlank()) {
            throw new IllegalArgumentException("Status la bat buoc");
        }

        Vehicle.VehicleStatus nextStatus = Vehicle.VehicleStatus.valueOf(request.status().trim());
        ensureVehicleCanBeSetAvailable(vehicleId, nextStatus);

        vehicle.setStatus(nextStatus);
        vehicle.setLastUpdatedBy(currentUser);
        vehicleService.updateVehicle(vehicle);

        return ResponseEntity.ok(ApiResponse.success("Cap nhat trang thai xe thanh cong", Map.of(
                "vehicleId", vehicle.getVehicleId(),
                "status", vehicle.getStatus().name()
        )));
    }

    @DeleteMapping("/vehicles/{vehicleId}")
    @Operation(summary = "Xoa xe cua owner")
    public ResponseEntity<ApiResponse<Map<String, Object>>> deleteOwnerVehicle(@PathVariable String vehicleId,
                                                                                Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        Vehicle vehicle = vehicleService.getVehicleById(vehicleId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay xe"));
        ensureVehicleAccess(vehicle, currentUser);

        vehicleService.deleteVehicle(vehicleId);
        return ResponseEntity.ok(ApiResponse.success("Xoa xe thanh cong", Map.of("vehicleId", vehicleId)));
    }

    @PostMapping("/vehicles/upload-main-image")
    @Operation(summary = "Upload anh chinh xe cho owner")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadVehicleMainImage(@RequestParam("file") MultipartFile file,
                                                                                    Authentication authentication) throws Exception {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File anh chinh khong hop le");
        }
        if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            throw new IllegalArgumentException("Chi ho tro file hinh anh");
        }

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "ecodana/vehicles"));
        String url = String.valueOf(uploadResult.get("secure_url"));

        return ResponseEntity.ok(ApiResponse.success("Upload anh chinh thanh cong", Map.of("url", url)));
    }

    @PostMapping("/vehicles/upload-auxiliary-images")
    @Operation(summary = "Upload anh phu xe cho owner")
    public ResponseEntity<ApiResponse<Map<String, Object>>> uploadVehicleAuxiliaryImages(@RequestParam("files") MultipartFile[] files,
                                                                                          Authentication authentication) throws Exception {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        if (files == null || files.length == 0) {
            throw new IllegalArgumentException("Khong co file anh phu nao duoc chon");
        }
        if (files.length > 10) {
            throw new IllegalArgumentException("Chi duoc upload toi da 10 anh phu moi lan");
        }

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty()) {
                continue;
            }
            if (file.getContentType() == null || !file.getContentType().startsWith("image/")) {
                throw new IllegalArgumentException("Chi ho tro file hinh anh");
            }
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("folder", "ecodana/vehicles/auxiliary"));
            urls.add(String.valueOf(uploadResult.get("secure_url")));
        }

        return ResponseEntity.ok(ApiResponse.success("Upload anh phu thanh cong", Map.of("urls", urls)));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Danh sach booking cua owner")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOwnerBookings(Authentication authentication,
                                                                                    @RequestParam(required = false) String ownerId) {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        String resolvedOwnerId = currentUser.getId();
        if (ownerId != null && !ownerId.isBlank() && isPrivileged(currentUser)) {
            resolvedOwnerId = ownerId.trim();
        }

        List<Booking> rawBookings = bookingService.getBookingsByOwnerId(resolvedOwnerId);
        List<Booking> uniqueBookings = deduplicateBookings(rawBookings);

        List<Map<String, Object>> payload = uniqueBookings.stream()
                .map(this::toOwnerBookingPayload)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lay danh sach booking owner thanh cong", payload));
    }

    @PostMapping("/bookings/{bookingId}/approve")
    @Operation(summary = "Owner duyet booking")
    public ResponseEntity<ApiResponse<Map<String, Object>>> approveBooking(@PathVariable String bookingId,
                                                                           Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        Booking booking = getBookingWithOwnershipCheck(bookingId, currentUser);
        Booking updated = bookingService.approveBooking(booking.getBookingId(), currentUser);
        if (updated == null) {
            throw new NoSuchElementException("Khong tim thay booking");
        }

        return ResponseEntity.ok(ApiResponse.success("Duyet booking thanh cong", toOwnerBookingPayload(updated)));
    }

    @PostMapping("/bookings/{bookingId}/reject")
    @Operation(summary = "Owner tu choi booking")
    public ResponseEntity<ApiResponse<Map<String, Object>>> rejectBooking(@PathVariable String bookingId,
                                                                          @RequestBody BookingRejectRequest request,
                                                                          Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        if (request.reason() == null || request.reason().isBlank()) {
            throw new IllegalArgumentException("Ly do tu choi la bat buoc");
        }

        Booking booking = getBookingWithOwnershipCheck(bookingId, currentUser);
        Booking updated = bookingService.rejectBooking(booking.getBookingId(), request.reason().trim(), currentUser);
        if (updated == null) {
            throw new NoSuchElementException("Khong tim thay booking");
        }

        return ResponseEntity.ok(ApiResponse.success("Tu choi booking thanh cong", toOwnerBookingPayload(updated)));
    }

    @PostMapping("/bookings/{bookingId}/handover")
    @Operation(summary = "Owner giao xe (chuyen booking sang Ongoing)")
    public ResponseEntity<ApiResponse<Map<String, Object>>> handoverBooking(@PathVariable String bookingId,
                                                                            @RequestBody BookingHandoverRequest request,
                                                                            Authentication authentication) throws Exception {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        if (request.odometer() == null || request.odometer() < 0) {
            throw new IllegalArgumentException("Odometer khong hop le");
        }

        Booking booking = getBookingWithOwnershipCheck(bookingId, currentUser);
        Booking updated = bookingService.handoverVehicle(
                booking.getBookingId(),
                currentUser,
                List.of(),
                request.odometer(),
                request.notes()
        );

        return ResponseEntity.ok(ApiResponse.success("Giao xe thanh cong", toOwnerBookingPayload(updated)));
    }

    @PostMapping("/bookings/{bookingId}/complete")
    @Operation(summary = "Owner hoan tat chuyen di")
    public ResponseEntity<ApiResponse<Map<String, Object>>> completeBooking(@PathVariable String bookingId,
                                                                            @RequestBody BookingCompleteRequest request,
                                                                            Authentication authentication) throws Exception {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        Booking booking = getBookingWithOwnershipCheck(bookingId, currentUser);
        Booking updated = bookingService.completeBooking(
                booking.getBookingId(),
                currentUser,
                request.notes(),
                new ArrayList<>(),
                true
        );

        return ResponseEntity.ok(ApiResponse.success("Hoan tat chuyen di thanh cong", toOwnerBookingPayload(updated)));
    }

    @GetMapping("/payments")
    @Operation(summary = "Danh sach thanh toan owner")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOwnerPayments(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        List<Map<String, Object>> items = paymentService.getPaymentsForOwner(currentUser.getId()).stream()
                .map(this::toOwnerPaymentPayload)
                .toList();

        Map<String, BigDecimal> stats = paymentService.getOwnerPaymentStatistics(currentUser.getId());
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("items", items);
        payload.put("stats", stats);

        return ResponseEntity.ok(ApiResponse.success("Lay danh sach thanh toan owner thanh cong", payload));
    }

    @GetMapping("/feedback")
    @Operation(summary = "Danh sach feedback cua owner")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOwnerFeedback(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        List<Map<String, Object>> payload = userFeedbackService.getFeedbackForOwner(currentUser).stream()
                .map(this::toOwnerFeedbackPayload)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lay danh sach feedback owner thanh cong", payload));
    }

    @GetMapping("/bank-accounts")
    @Operation(summary = "Danh sach tai khoan ngan hang cua owner")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOwnerBankAccounts(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        ensureOwnerArea(currentUser);

        List<Map<String, Object>> payload = bankAccountService.getBankAccountsByUserId(currentUser.getId()).stream()
                .map(this::toOwnerBankAccountPayload)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lay danh sach tai khoan ngan hang thanh cong", payload));
    }

    private void applyVehicleRequest(Vehicle vehicle, OwnerVehicleRequest request, boolean createMode) throws Exception {
        vehicle.setVehicleModel(request.vehicleModel().trim());
        vehicle.setLicensePlate(request.licensePlate().trim());
        vehicle.setVehicleType(Vehicle.VehicleType.valueOf(request.vehicleType().trim()));
        vehicle.setYearManufactured(request.yearManufactured());
        vehicle.setSeats(request.seats());
        vehicle.setOdometer(request.odometer());
        vehicle.setDescription(request.description());
        vehicle.setRequiresLicense(request.requiresLicense() != null ? request.requiresLicense() : Boolean.TRUE);
        vehicle.setBatteryCapacity(request.batteryCapacity());
        vehicle.setMainImageUrl(request.mainImageUrl());

        if (createMode) {
            vehicle.setStatus(Vehicle.VehicleStatus.PendingApproval);
        } else if (request.status() != null && !request.status().isBlank()) {
            vehicle.setStatus(Vehicle.VehicleStatus.valueOf(request.status().trim()));
        }

        BigDecimal hourlyPrice = defaultMoney(request.hourlyPrice());
        BigDecimal dailyPrice = defaultMoney(request.dailyPrice());
        BigDecimal monthlyPrice = defaultMoney(request.monthlyPrice());
        Map<String, BigDecimal> prices = new LinkedHashMap<>();
        prices.put("hourly", hourlyPrice);
        prices.put("daily", dailyPrice);
        prices.put("monthly", monthlyPrice);
        vehicle.setRentalPrices(objectMapper.writeValueAsString(prices));

        List<String> imageUrls = sanitizeStringList(request.imageUrls());
        vehicle.setImageUrls(objectMapper.writeValueAsString(imageUrls));

        List<String> features = sanitizeStringList(request.features());
        vehicle.setFeatures(objectMapper.writeValueAsString(features));

        if (request.categoryId() != null) {
            vehicleCategoriesRepository.findById(request.categoryId()).ifPresent(vehicle::setCategory);
        } else {
            vehicle.setCategory(null);
        }

        if (request.transmissionTypeId() != null) {
            transmissionTypeRepository.findById(request.transmissionTypeId()).ifPresent(vehicle::setTransmissionType);
        } else {
            vehicle.setTransmissionType(null);
        }
    }

    private void ensureVehicleCanBeSetAvailable(String vehicleId, Vehicle.VehicleStatus nextStatus) {
        if (nextStatus != Vehicle.VehicleStatus.Available) {
            return;
        }
        boolean hasBlockingBookings = bookingRepository.hasBookingsByVehicleAndStatuses(vehicleId, BLOCKING_BOOKING_STATUSES);
        if (hasBlockingBookings) {
            throw new IllegalArgumentException("Khong the chuyen xe sang Available vi van con booking dang xu ly.");
        }
    }

    private void validateVehicleRequest(OwnerVehicleRequest request, boolean createMode) {
        if (request.vehicleModel() == null || request.vehicleModel().isBlank()) {
            throw new IllegalArgumentException("Vehicle model la bat buoc");
        }
        if (request.licensePlate() == null || request.licensePlate().isBlank()) {
            throw new IllegalArgumentException("License plate la bat buoc");
        }
        if (request.vehicleType() == null || request.vehicleType().isBlank()) {
            throw new IllegalArgumentException("Vehicle type la bat buoc");
        }
        if (request.seats() == null || request.seats() <= 0) {
            throw new IllegalArgumentException("Seats phai lon hon 0");
        }
        if (request.dailyPrice() == null || request.dailyPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Daily price phai lon hon 0");
        }
        if (createMode && request.mainImageUrl() != null && request.mainImageUrl().isBlank()) {
            throw new IllegalArgumentException("Main image URL khong hop le");
        }
    }

    private List<Booking> deduplicateBookings(List<Booking> bookings) {
        Map<String, Booking> unique = new LinkedHashMap<>();
        for (Booking booking : bookings) {
            unique.putIfAbsent(booking.getBookingId(), booking);
        }
        return new ArrayList<>(unique.values());
    }

    private Map<String, Object> toOwnerBookingPayload(Booking booking) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("bookingId", booking.getBookingId());
        payload.put("bookingCode", booking.getBookingCode());
        payload.put("status", booking.getStatus() != null ? booking.getStatus().name() : null);
        payload.put("pickupDateTime", booking.getPickupDateTime());
        payload.put("returnDateTime", booking.getReturnDateTime());
        payload.put("pickupLocation", booking.getPickupLocation());
        payload.put("paymentOption", booking.getPaymentOption());
        payload.put("totalAmount", booking.getTotalAmount());
        payload.put("depositAmountRequired", booking.getDepositAmountRequired());
        payload.put("remainingAmount", calculateRemainingAmount(booking));
        payload.put("cancelReason", booking.getCancelReason());
        payload.put("createdDate", booking.getCreatedDate());

        if (booking.getVehicle() != null) {
            payload.put("vehicleId", booking.getVehicle().getVehicleId());
            payload.put("vehicleModel", booking.getVehicle().getVehicleModel());
            payload.put("licensePlate", booking.getVehicle().getLicensePlate());
            payload.put("vehicleMainImageUrl", booking.getVehicle().getMainImageUrl());
        }

        if (booking.getUser() != null) {
            payload.put("userId", booking.getUser().getId());
            payload.put("userEmail", booking.getUser().getEmail());
            payload.put("userPhone", booking.getUser().getPhoneNumber());
            payload.put("userFullName", (booking.getUser().getFirstName() + " " + booking.getUser().getLastName()).trim());
        }

        return payload;
    }

    private Map<String, Object> toOwnerPaymentPayload(Payment payment) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("paymentId", payment.getPaymentId());
        payload.put("amount", payment.getAmount());
        payload.put("paymentMethod", payment.getPaymentMethod());
        payload.put("paymentStatus", payment.getPaymentStatus() != null ? payment.getPaymentStatus().name() : null);
        payload.put("paymentType", payment.getPaymentType() != null ? payment.getPaymentType().name() : null);
        payload.put("paymentDate", payment.getPaymentDate());
        payload.put("createdDate", payment.getCreatedDate());
        payload.put("orderCode", payment.getOrderCode());
        payload.put("transactionId", payment.getTransactionId());

        if (payment.getBooking() != null) {
            payload.put("bookingId", payment.getBooking().getBookingId());
            payload.put("bookingCode", payment.getBooking().getBookingCode());
            payload.put("bookingStatus", payment.getBooking().getStatus() != null ? payment.getBooking().getStatus().name() : null);
            if (payment.getBooking().getVehicle() != null) {
                payload.put("vehicleModel", payment.getBooking().getVehicle().getVehicleModel());
                payload.put("licensePlate", payment.getBooking().getVehicle().getLicensePlate());
            }
        }

        return payload;
    }

    private Map<String, Object> toOwnerFeedbackPayload(UserFeedback feedback) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("feedbackId", feedback.getFeedbackId());
        payload.put("rating", feedback.getRating());
        payload.put("content", feedback.getContent());
        payload.put("reviewed", feedback.getReviewed());
        payload.put("createdDate", feedback.getCreatedDate());
        payload.put("staffReply", feedback.getStaffReply());
        payload.put("replyDate", feedback.getReplyDate());

        if (feedback.getBooking() != null) {
            payload.put("bookingId", feedback.getBooking().getBookingId());
            payload.put("bookingCode", feedback.getBooking().getBookingCode());
        }
        if (feedback.getVehicle() != null) {
            payload.put("vehicleId", feedback.getVehicle().getVehicleId());
            payload.put("vehicleModel", feedback.getVehicle().getVehicleModel());
        }
        if (feedback.getUser() != null) {
            payload.put("userId", feedback.getUser().getId());
            payload.put("userEmail", feedback.getUser().getEmail());
            payload.put("userFullName", (feedback.getUser().getFirstName() + " " + feedback.getUser().getLastName()).trim());
        }

        return payload;
    }

    private Map<String, Object> toOwnerBankAccountPayload(BankAccount account) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("bankAccountId", account.getBankAccountId());
        payload.put("accountNumber", account.getAccountNumber());
        payload.put("accountHolderName", account.getAccountHolderName());
        payload.put("bankName", account.getBankName());
        payload.put("bankCode", account.getBankCode());
        payload.put("qrCodeImagePath", account.getQrCodeImagePath());
        payload.put("isDefault", account.isDefault());
        payload.put("createdDate", account.getCreatedDate());
        payload.put("updatedDate", account.getUpdatedDate());
        return payload;
    }

    private BigDecimal calculateRemainingAmount(Booking booking) {
        BigDecimal total = defaultMoney(booking.getTotalAmount());
        BigDecimal paid = defaultMoney(booking.getPayments() == null ? BigDecimal.ZERO : booking.getPayments().stream()
                .filter(p -> p.getPaymentStatus() == Payment.PaymentStatus.Completed)
                .map(Payment::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add));
        return total.subtract(paid).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    private User getCurrentUser(Authentication authentication) {
        String principal = authentication.getName();
        User currentUser = userService.getUserWithRole(principal);
        if (currentUser == null) {
            throw new NoSuchElementException("Khong tim thay nguoi dung tu token");
        }
        return currentUser;
    }

    private void ensureOwnerArea(User currentUser) {
        if (!userService.isOwner(currentUser) && !isPrivileged(currentUser)) {
            throw new AccessDeniedException("Ban khong co quyen truy cap khu vuc owner");
        }
    }

    private boolean isPrivileged(User user) {
        return userService.isAdmin(user) || userService.isStaff(user);
    }

    private void ensureVehicleAccess(Vehicle vehicle, User currentUser) {
        if (vehicle.getOwnerId() == null) {
            throw new AccessDeniedException("Xe nay khong gan owner");
        }
        if (!isPrivileged(currentUser) && !vehicle.getOwnerId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Ban khong co quyen thao tac voi xe nay");
        }
    }

    private Booking getBookingWithOwnershipCheck(String bookingId, User currentUser) {
        Booking booking = bookingService.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay booking"));
        if (booking.getVehicle() == null || booking.getVehicle().getOwnerId() == null) {
            throw new AccessDeniedException("Booking nay khong thuoc owner hop le");
        }
        if (!isPrivileged(currentUser) && !booking.getVehicle().getOwnerId().equals(currentUser.getId())) {
            throw new AccessDeniedException("Ban khong co quyen thao tac voi booking nay");
        }
        return booking;
    }

    private BigDecimal defaultMoney(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private List<String> sanitizeStringList(List<String> input) {
        if (input == null || input.isEmpty()) {
            return List.of();
        }
        return input.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
    }

    public record OwnerVehicleRequest(
            String vehicleModel,
            Integer yearManufactured,
            String licensePlate,
            Integer seats,
            Integer odometer,
            BigDecimal hourlyPrice,
            BigDecimal dailyPrice,
            BigDecimal monthlyPrice,
            String description,
            String vehicleType,
            Boolean requiresLicense,
            BigDecimal batteryCapacity,
            String mainImageUrl,
            List<String> imageUrls,
            List<String> features,
            Integer categoryId,
            Integer transmissionTypeId,
            String status
    ) {
    }

    public record VehicleStatusRequest(String status) {
    }

    public record BookingRejectRequest(String reason) {
    }

    public record BookingHandoverRequest(Integer odometer, String notes) {
    }

    public record BookingCompleteRequest(String notes, Boolean setMaintenance) {
    }
}
