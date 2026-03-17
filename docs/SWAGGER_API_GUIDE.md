# EcoDana API-Only + Swagger Guide

Tài liệu này mô tả đúng mốc hiện tại: tập trung Backend API + Swagger (chưa làm FE React).

## 1. Mục tiêu

- Backend phục vụ API qua `/api/v1/*`
- Xác thực bằng JWT (stateless)
- Test và kiểm tra API qua Swagger UI
- FE có thể đổi công nghệ sau này (React/Vue/Flutter) mà không ảnh hưởng BE

## 2. Chạy project ở mốc Swagger API

1. Cấu hình DB trong `src/main/resources/application.properties`
2. Chạy backend:
   ```bash
   ./mvnw spring-boot:run
   ```
3. Mở Swagger:
   - `http://localhost:8080/swagger-ui/index.html`
   - Spec JSON: `http://localhost:8080/v3/api-docs`

## 3. Luồng test chuẩn trên Swagger

### Bước 1: Đăng nhập để lấy JWT

- Mở API login (ví dụ `POST /api/v1/auth/login`)
- Nhấn `Try it out`
- Nhập body:
  ```json
  {
    "usernameOrEmail": "your_account",
    "password": "your_password"
  }
  ```
- Nhấn `Execute`
- Copy token trong response

### Bước 2: Authorize token

- Nhấn nút `Authorize` (góc phải trên Swagger)
- Dán token vào ô `bearerAuth`
- Nhấn `Authorize` -> `Close`

Ghi chú:
- Thường chỉ cần dán token thô.
- Nếu backend/security setup yêu cầu, dùng format: `Bearer <token>`.

### Bước 3: Gọi API protected

Ví dụ:
- `GET /api/v1/profile/me`: lấy user hiện tại
- `GET /api/v1/bookings/my-bookings`: bookings của user đăng nhập
- `GET /api/v1/bookings/my-active`: bookings đang hoạt động
- `GET /api/v1/bookings/{bookingId}`: chi tiết 1 booking

Với API có path/query param:
- Bấm `Try it out`
- Nhập giá trị param (vd `bookingId`, `userId`)
- Bấm `Execute`

## 4. Vì sao Swagger có lúc chỉ hiện `"string"`?

`"string"` trong phần `Example Value` là ví dụ schema mặc định của model, không phải dữ liệu thật.

Để xem dữ liệu thật:
1. `Try it out`
2. Nhập param/body hợp lệ
3. `Execute`
4. Xem mục `Response body`

## 5. Bạn nên làm gì tiếp theo (không đổi FE lúc này)

1. Ổn định contract API:
   - chuẩn response/error
   - status code nhất quán
2. Hoàn thiện mô tả Swagger:
   - mô tả rõ từng field quan trọng (`bookingId`, `userId`, `status`, ...)
3. Test role/permission:
   - user thường vs admin/owner
4. Chốt API trước khi đổi FE:
   - FE chỉ cần gọi API theo contract đã chốt

## 6. Khi nào mới bắt đầu FE React?

Chỉ nên bắt đầu khi:
- API auth/profile/booking/vehicle đã ổn
- Swagger test đủ các luồng chính
- Đã thống nhất payload giữa BE và FE

Khi đó mới tách FE riêng để tránh sửa 2 phía cùng lúc.
