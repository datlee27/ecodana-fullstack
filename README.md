# EcoDana Project

EcoDana hiện gồm 2 phần:

- Backend: Spring Boot (REST API + legacy Thymeleaf)
- Frontend mới: React + Vite + TypeScript tại `ecodana-fe/`

## Technologies

### Backend

- Java 21
- Spring Boot 3
- Spring Security + JWT
- Spring Data JPA
- MySQL

### Frontend

- React + TypeScript + Vite
- Tailwind CSS
- react-router-dom
- Axios

## Run backend

```bash
cd server
./mvnw spring-boot:run
```

Backend mặc định chạy tại `http://localhost:8080`.

## Run frontend

```bash
cd client
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173`.

## Environment

### Frontend (`client/.env.local`)

```bash
# Local backend
VITE_DEV_API_PROXY_TARGET=http://localhost:8080

# Remote backend while running Vite locally
VITE_DEV_API_PROXY_TARGET=https://your-backend-domain.com
```

Trong dev, frontend gọi `/api/v1/*` qua Vite proxy. Nếu đặt backend remote ở `VITE_DEV_API_PROXY_TARGET`, trình duyệt vẫn gọi cùng origin frontend nên tránh lỗi CORS local.

Khi build/deploy frontend tĩnh, dùng:

```bash
VITE_API_BASE_URL=https://your-backend-domain.com
```

### Backend CORS

Backend đã hỗ trợ CORS qua biến `APP_CORS_ALLOWED_ORIGINS`, mặc định có:

- `http://localhost:3000`
- `http://localhost:5173`

## Swagger API

- `http://localhost:8080/swagger-ui/index.html`
- OpenAPI: `http://localhost:8080/v3/api-docs`

Guide chi tiết API-first: `docs/SWAGGER_API_GUIDE.md`
