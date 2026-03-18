package com.ecodana.evodanavn1.controller.api.v1;

import com.ecodana.evodanavn1.api.ApiResponse;
import com.ecodana.evodanavn1.model.Booking;
import com.ecodana.evodanavn1.model.Discount;
import com.ecodana.evodanavn1.model.Payment;
import com.ecodana.evodanavn1.model.User;
import com.ecodana.evodanavn1.model.Vehicle;
import com.ecodana.evodanavn1.repository.PaymentRepository;
import com.ecodana.evodanavn1.service.BookingService;
import com.ecodana.evodanavn1.service.DiscountService;
import com.ecodana.evodanavn1.service.PayOSService;
import com.ecodana.evodanavn1.service.UserService;
import com.ecodana.evodanavn1.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/bookings")
@Tag(name = "Booking Flow API", description = "API checkout/create/payment cho frontend React")
@SecurityRequirement(name = "bearerAuth")
public class BookingFlowApiController {

    private static final BigDecimal PLATFORM_FEE_RATE = new BigDecimal("0.2");

    private final BookingService bookingService;
    private final UserService userService;
    private final VehicleService vehicleService;
    private final DiscountService discountService;
    private final PaymentRepository paymentRepository;
    private final PayOSService payOSService;

    public BookingFlowApiController(BookingService bookingService,
                                    UserService userService,
                                    VehicleService vehicleService,
                                    DiscountService discountService,
                                    PaymentRepository paymentRepository,
                                    PayOSService payOSService) {
        this.bookingService = bookingService;
        this.userService = userService;
        this.vehicleService = vehicleService;
        this.discountService = discountService;
        this.paymentRepository = paymentRepository;
        this.payOSService = payOSService;
    }

    @PostMapping("/checkout-preview")
    @Operation(summary = "Tinh toan tam tinh cho checkout")
    public ResponseEntity<ApiResponse<Map<String, Object>>> checkoutPreview(@Valid @RequestBody CheckoutPreviewRequest request,
                                                                            Authentication authentication) {
        getCurrentUser(authentication);

        Vehicle vehicle = vehicleService.getVehicleById(request.vehicleId())
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay xe"));

        PricingResult pricing = calculatePricing(vehicle,
                request.pickupDate(),
                request.pickupTime(),
                request.returnDate(),
                request.returnTime(),
                request.discountCode());

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("vehicleId", vehicle.getVehicleId());
        payload.put("vehicleModel", vehicle.getVehicleModel());
        payload.put("hourlyPrice", pricing.hourlyPrice());
        payload.put("dailyPrice", pricing.dailyPrice());
        payload.put("fullDays", pricing.fullDays());
        payload.put("remainingHours", pricing.remainingHours());
        payload.put("vehicleRentalFee", pricing.vehicleRentalFee());
        payload.put("discountCode", pricing.discountCode());
        payload.put("discountAmount", pricing.discountAmount());
        payload.put("totalAmount", pricing.totalAmount());
        payload.put("pickupDateTime", pricing.pickupDateTime());
        payload.put("returnDateTime", pricing.returnDateTime());

        return ResponseEntity.ok(ApiResponse.success("Tinh toan checkout thanh cong", payload));
    }

    @GetMapping("/available-discounts")
    @Operation(summary = "Lay danh sach ma giam gia hien co")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAvailableDiscounts(Authentication authentication) {
        getCurrentUser(authentication);

        List<Map<String, Object>> payload = discountService.getAvailableDiscountsForCustomer()
                .stream()
                .map(this::toDiscountPayload)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Lay danh sach ma giam gia thanh cong", payload));
    }

    @PostMapping("/create")
    @Transactional
    @Operation(summary = "Tao booking tu frontend React")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createBooking(@Valid @RequestBody BookingCreateRequest request,
                                                                          Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        Vehicle vehicle = vehicleService.getVehicleById(request.vehicleId())
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay xe"));

        if (vehicle.getStatus() != Vehicle.VehicleStatus.Available) {
            throw new IllegalArgumentException("Xe khong kha dung de dat");
        }

        PricingResult pricing = calculatePricing(vehicle,
                request.pickupDate(),
                request.pickupTime(),
                request.returnDate(),
                request.returnTime(),
                request.discountCode());

        // Duplicate booking protection (same user, same vehicle, same time range)
        List<Booking> existingBookings = bookingService.getBookingsByUserId(currentUser.getId());
        for (Booking existing : existingBookings) {
            if (existing.getVehicle() != null
                    && vehicle.getVehicleId().equals(existing.getVehicle().getVehicleId())
                    && existing.getPickupDateTime().equals(pricing.pickupDateTime())
                    && existing.getReturnDateTime().equals(pricing.returnDateTime())
                    && (existing.getStatus() == Booking.BookingStatus.Pending
                    || existing.getStatus() == Booking.BookingStatus.Confirmed
                    || existing.getStatus() == Booking.BookingStatus.AwaitingDeposit)) {
                throw new IllegalArgumentException("Ban da co booking nay roi: " + existing.getBookingCode());
            }
        }

        // Mark vehicle as rented like legacy flow
        vehicle.setStatus(Vehicle.VehicleStatus.Rented);
        vehicleService.updateVehicle(vehicle);

        Discount appliedDiscount = null;
        if (pricing.discountCode() != null && !pricing.discountCode().isBlank()) {
            appliedDiscount = discountService.findByVoucherCode(pricing.discountCode()).orElse(null);
            if (appliedDiscount != null && discountService.isDiscountValid(appliedDiscount)) {
                appliedDiscount.setUsedCount(appliedDiscount.getUsedCount() + 1);
                discountService.updateDiscount(appliedDiscount);
            } else {
                appliedDiscount = null;
            }
        }

        String paymentMethod = normalizePaymentMethod(request.paymentMethod());

        Booking booking = new Booking();
        booking.setBookingId(UUID.randomUUID().toString());
        booking.setUser(currentUser);
        booking.setVehicle(vehicle);
        booking.setPickupDateTime(pricing.pickupDateTime());
        booking.setReturnDateTime(pricing.returnDateTime());

        BigDecimal platformFee = pricing.vehicleRentalFee().multiply(PLATFORM_FEE_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal ownerPayout = pricing.vehicleRentalFee().subtract(platformFee);

        booking.setVehicleRentalFee(pricing.vehicleRentalFee());
        booking.setPlatformFee(platformFee);
        booking.setOwnerPayout(ownerPayout);
        booking.setTotalAmount(pricing.totalAmount());
        booking.setStatus(Booking.BookingStatus.Pending);
        booking.setBookingCode("BK" + System.currentTimeMillis());
        booking.setRentalType(Booking.RentalType.daily);
        booking.setCreatedDate(LocalDateTime.now());
        booking.setPickupLocation(request.pickupLocation().trim());
        booking.setTermsAgreed(true);
        booking.setTermsAgreedAt(LocalDateTime.now());
        booking.setPaymentOption(paymentMethod);
        booking.setExpectedPaymentMethod("PayOS");
        booking.setDiscount(appliedDiscount);

        if ("FULL".equals(paymentMethod)) {
            booking.setDepositAmountRequired(pricing.totalAmount());
        } else {
            booking.setDepositAmountRequired(pricing.totalAmount().multiply(new BigDecimal("0.2")).setScale(2, RoundingMode.HALF_UP));
        }

        bookingService.addBooking(booking);

        BigDecimal remainingAmount = booking.getTotalAmount().subtract(booking.getDepositAmountRequired());

        Map<String, Object> payload = Map.of(
                "bookingId", booking.getBookingId(),
                "bookingCode", booking.getBookingCode(),
                "status", booking.getStatus(),
                "totalAmount", booking.getTotalAmount(),
                "depositAmount", booking.getDepositAmountRequired(),
                "remainingAmount", remainingAmount.max(BigDecimal.ZERO)
        );

        return ResponseEntity.ok(ApiResponse.success("Tao booking thanh cong", payload));
    }

    @GetMapping("/{bookingId}/payment-summary")
    @Operation(summary = "Lay thong tin thanh toan cua booking")
    public ResponseEntity<ApiResponse<Map<String, Object>>> paymentSummary(@PathVariable String bookingId,
                                                                           Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        Booking booking = getOwnedBooking(bookingId, currentUser);

        BigDecimal depositAmount = booking.getDepositAmountRequired() != null
                ? booking.getDepositAmountRequired()
                : booking.getTotalAmount().multiply(new BigDecimal("0.2")).setScale(2, RoundingMode.HALF_UP);

        BigDecimal paidAmount = getPaidAmount(bookingId);
        BigDecimal remainingAmount = booking.getTotalAmount().subtract(paidAmount).max(BigDecimal.ZERO);

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("bookingId", booking.getBookingId());
        payload.put("bookingCode", booking.getBookingCode());
        payload.put("status", booking.getStatus());
        payload.put("vehicleModel", booking.getVehicle() != null ? booking.getVehicle().getVehicleModel() : "");
        payload.put("vehicleMainImageUrl", booking.getVehicle() != null ? booking.getVehicle().getMainImageUrl() : "");
        payload.put("licensePlate", booking.getVehicle() != null ? booking.getVehicle().getLicensePlate() : "");
        payload.put("pickupDateTime", booking.getPickupDateTime());
        payload.put("returnDateTime", booking.getReturnDateTime());
        payload.put("totalAmount", booking.getTotalAmount());
        payload.put("depositAmount", depositAmount);
        payload.put("paidAmount", paidAmount);
        payload.put("remainingAmount", remainingAmount);

        return ResponseEntity.ok(ApiResponse.success("Lay payment summary thanh cong", payload));
    }

    @PostMapping("/{bookingId}/payment-link")
    @Operation(summary = "Tao checkout URL PayOS cho booking")
    public ResponseEntity<ApiResponse<Map<String, Object>>> createPaymentLink(@PathVariable String bookingId,
                                                                               @Valid @RequestBody PaymentLinkRequest request,
                                                                               Authentication authentication,
                                                                               HttpServletRequest httpRequest) {
        User currentUser = getCurrentUser(authentication);
        Booking booking = getOwnedBooking(bookingId, currentUser);

        String paymentType = request.paymentType() != null ? request.paymentType().trim().toLowerCase() : "deposit";
        if (!"deposit".equals(paymentType) && !"full".equals(paymentType)) {
            throw new IllegalArgumentException("paymentType phai la deposit hoac full");
        }

        BigDecimal paidAmount = getPaidAmount(bookingId);
        BigDecimal remainingAmount = booking.getTotalAmount().subtract(paidAmount).max(BigDecimal.ZERO);

        BigDecimal amountToPay;
        if ("full".equals(paymentType)) {
            amountToPay = remainingAmount;
        } else {
            BigDecimal depositAmount = booking.getDepositAmountRequired() != null
                    ? booking.getDepositAmountRequired()
                    : booking.getTotalAmount().multiply(new BigDecimal("0.2")).setScale(2, RoundingMode.HALF_UP);
            amountToPay = depositAmount.subtract(paidAmount).max(BigDecimal.ZERO);
            if (amountToPay.compareTo(BigDecimal.ZERO) == 0) {
                amountToPay = remainingAmount;
                paymentType = "full";
            }
        }

        if (amountToPay.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Booking nay da thanh toan du");
        }

        long amount = amountToPay.setScale(0, RoundingMode.HALF_UP).longValue();
        String orderInfo = "deposit".equals(paymentType)
                ? "Coc " + booking.getBookingCode()
                : "Toan bo " + booking.getBookingCode();

        String checkoutUrl = payOSService.createPaymentLink(amount, orderInfo, bookingId, paymentType, httpRequest);

        Map<String, Object> payload = Map.of(
                "bookingId", bookingId,
                "paymentType", paymentType,
                "amount", amount,
                "checkoutUrl", checkoutUrl
        );

        return ResponseEntity.ok(ApiResponse.success("Tao payment link thanh cong", payload));
    }

    @PostMapping("/payment/confirm-return")
    @Transactional
    @Operation(summary = "Xac nhan ket qua thanh toan tu query PayOS return")
    public ResponseEntity<ApiResponse<Map<String, Object>>> confirmPaymentReturn(@RequestBody PaymentReturnRequest request,
                                                                                 Authentication authentication) {
        User currentUser = getCurrentUser(authentication);

        Booking booking;
        if (request.bookingId() != null && !request.bookingId().isBlank()) {
            booking = getOwnedBooking(request.bookingId(), currentUser);
        } else if (request.orderCode() != null && !request.orderCode().isBlank()) {
            Payment byOrder = paymentRepository.findByOrderCode(request.orderCode())
                    .orElseThrow(() -> new NoSuchElementException("Khong tim thay payment theo orderCode"));
            booking = byOrder.getBooking();
            if (booking == null || booking.getUser() == null || !currentUser.getId().equals(booking.getUser().getId())) {
                throw new AccessDeniedException("Ban khong co quyen truy cap booking nay");
            }
        } else {
            throw new IllegalArgumentException("Thieu bookingId hoac orderCode");
        }

        boolean isCancelled = (request.cancel() != null && !request.cancel().isBlank())
                || "CANCELLED".equalsIgnoreCase(request.status());

        if (isCancelled) {
            Map<String, Object> payload = Map.of(
                    "success", false,
                    "warning", true,
                    "message", "Ban da huy thanh toan. Vui long thu lai khi san sang.",
                    "bookingId", booking.getBookingId(),
                    "bookingCode", booking.getBookingCode()
            );
            return ResponseEntity.ok(ApiResponse.success("Thanh toan bi huy", payload));
        }

        boolean isSuccess = "PAID".equalsIgnoreCase(request.status()) || "00".equals(request.code());
        if (!isSuccess) {
            Map<String, Object> payload = Map.of(
                    "success", false,
                    "error", true,
                    "message", "Thanh toan khong thanh cong. Vui long thu lai.",
                    "bookingId", booking.getBookingId(),
                    "bookingCode", booking.getBookingCode()
            );
            return ResponseEntity.ok(ApiResponse.success("Thanh toan that bai", payload));
        }

        BigDecimal paidAmount = BigDecimal.ZERO;
        if (request.orderCode() != null && !request.orderCode().isBlank()) {
            Optional<Payment> optionalPayment = paymentRepository.findByOrderCode(request.orderCode());
            if (optionalPayment.isPresent()) {
                Payment payment = optionalPayment.get();
                if (payment.getPaymentStatus() != Payment.PaymentStatus.Completed) {
                    payment.setPaymentStatus(Payment.PaymentStatus.Completed);
                    payment.setPaymentDate(LocalDateTime.now());
                    paymentRepository.save(payment);
                }
                paidAmount = payment.getAmount() != null ? payment.getAmount() : BigDecimal.ZERO;
            }
        }

        BigDecimal totalPaid = getPaidAmount(booking.getBookingId());
        BigDecimal remainingAmount = booking.getTotalAmount().subtract(totalPaid).max(BigDecimal.ZERO);

        if (totalPaid.compareTo(BigDecimal.ZERO) > 0) {
            booking.setStatus(Booking.BookingStatus.Confirmed);
            booking.setPaymentConfirmedAt(LocalDateTime.now());
            if (totalPaid.compareTo(booking.getTotalAmount()) >= 0) {
                booking.setDepositAmountRequired(booking.getTotalAmount());
            } else {
                booking.setDepositAmountRequired(totalPaid);
            }
            bookingService.updateBooking(booking);
        }

        Map<String, Object> payload = Map.of(
                "success", true,
                "message", "Thanh toan thanh cong",
                "bookingId", booking.getBookingId(),
                "bookingCode", booking.getBookingCode(),
                "paidAmount", paidAmount,
                "totalPaid", totalPaid,
                "totalAmount", booking.getTotalAmount(),
                "remainingAmount", remainingAmount,
                "status", booking.getStatus()
        );

        return ResponseEntity.ok(ApiResponse.success("Xac nhan thanh toan thanh cong", payload));
    }

    private User getCurrentUser(Authentication authentication) {
        String principal = authentication.getName();
        User user = userService.getUserWithRole(principal);
        if (user == null) {
            throw new NoSuchElementException("Khong tim thay nguoi dung tu token");
        }
        return user;
    }

    private Booking getOwnedBooking(String bookingId, User currentUser) {
        Booking booking = bookingService.findById(bookingId)
                .orElseThrow(() -> new NoSuchElementException("Khong tim thay booking"));

        if (booking.getUser() == null || !currentUser.getId().equals(booking.getUser().getId())) {
            throw new AccessDeniedException("Ban khong co quyen truy cap booking nay");
        }
        return booking;
    }

    private BigDecimal getPaidAmount(String bookingId) {
        return paymentRepository.findByBookingId(bookingId)
                .stream()
                .filter(payment -> payment.getPaymentStatus() == Payment.PaymentStatus.Completed)
                .filter(payment -> payment.getPaymentType() == Payment.PaymentType.Deposit
                        || payment.getPaymentType() == Payment.PaymentType.FinalPayment)
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Map<String, Object> toDiscountPayload(Discount discount) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("discountId", discount.getDiscountId());
        payload.put("discountName", discount.getDiscountName());
        payload.put("voucherCode", discount.getVoucherCode());
        payload.put("discountType", discount.getDiscountType());
        payload.put("discountValue", discount.getDiscountValue());
        payload.put("minOrderAmount", discount.getMinOrderAmount());
        payload.put("maxDiscountAmount", discount.getMaxDiscountAmount() != null ? discount.getMaxDiscountAmount() : BigDecimal.ZERO);
        return payload;
    }

    private PricingResult calculatePricing(Vehicle vehicle,
                                           String pickupDate,
                                           String pickupTime,
                                           String returnDate,
                                           String returnTime,
                                           String discountCode) {
        LocalDate pickup = LocalDate.parse(pickupDate);
        LocalDate ret = LocalDate.parse(returnDate);
        LocalTime pickupAt = LocalTime.parse(pickupTime);
        LocalTime returnAt = LocalTime.parse(returnTime);

        LocalDateTime pickupDateTime = LocalDateTime.of(pickup, pickupAt);
        LocalDateTime returnDateTime = LocalDateTime.of(ret, returnAt);

        if (pickupDateTime.isBefore(LocalDateTime.now().minusMinutes(5))) {
            throw new IllegalArgumentException("Ngay nhan xe khong the la qua khu");
        }

        if (!returnDateTime.isAfter(pickupDateTime)) {
            throw new IllegalArgumentException("Ngay tra xe phai sau ngay nhan xe");
        }

        BigDecimal dailyPrice = vehicle.getDailyPriceFromJson();
        BigDecimal hourlyPrice = vehicle.getHourlyPriceFromJson();

        Duration duration = Duration.between(pickupDateTime, returnDateTime);
        double totalHours = duration.toMinutes() / 60.0;

        long fullDays = (long) Math.floor(totalHours / 24);
        double remainingHours = Math.max(0, totalHours - (fullDays * 24));

        BigDecimal rentalFee = dailyPrice.multiply(BigDecimal.valueOf(fullDays))
                .add(hourlyPrice.multiply(BigDecimal.valueOf(remainingHours)))
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedDiscountCode = null;

        if (discountCode != null && !discountCode.isBlank()) {
            Optional<Discount> discountOptional = discountService.findByVoucherCode(discountCode.trim());
            if (discountOptional.isPresent()) {
                Discount discount = discountOptional.get();
                if (discountService.isDiscountValid(discount)) {
                    discountAmount = discountService.calculateDiscountAmount(discount, rentalFee)
                            .setScale(2, RoundingMode.HALF_UP);
                    appliedDiscountCode = discount.getVoucherCode();
                }
            }
        }

        BigDecimal totalAmount = rentalFee.subtract(discountAmount).max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);

        return new PricingResult(
                vehicle.getVehicleId(),
                dailyPrice,
                hourlyPrice,
                fullDays,
                BigDecimal.valueOf(remainingHours).setScale(2, RoundingMode.HALF_UP),
                rentalFee,
                appliedDiscountCode,
                discountAmount,
                totalAmount,
                pickupDateTime,
                returnDateTime
        );
    }

    private String normalizePaymentMethod(String raw) {
        if (raw == null || raw.isBlank()) {
            return "DEPOSIT";
        }
        String normalized = raw.trim().toUpperCase();
        if ("FULL".equals(normalized)) {
            return "FULL";
        }
        return "DEPOSIT";
    }

    private record PricingResult(String vehicleId,
                                 BigDecimal dailyPrice,
                                 BigDecimal hourlyPrice,
                                 long fullDays,
                                 BigDecimal remainingHours,
                                 BigDecimal vehicleRentalFee,
                                 String discountCode,
                                 BigDecimal discountAmount,
                                 BigDecimal totalAmount,
                                 LocalDateTime pickupDateTime,
                                 LocalDateTime returnDateTime) {
    }

    public record CheckoutPreviewRequest(
            @NotBlank String vehicleId,
            @NotBlank String pickupDate,
            @NotBlank String pickupTime,
            @NotBlank String returnDate,
            @NotBlank String returnTime,
            String discountCode
    ) {
    }

    public record BookingCreateRequest(
            @NotBlank String vehicleId,
            @NotBlank String pickupDate,
            @NotBlank String pickupTime,
            @NotBlank String returnDate,
            @NotBlank String returnTime,
            @NotBlank String pickupLocation,
            String discountCode,
            String paymentMethod
    ) {
    }

    public record PaymentLinkRequest(String paymentType) {
    }

    public record PaymentReturnRequest(
            String code,
            String status,
            String cancel,
            String orderCode,
            String bookingId
    ) {
    }
}
