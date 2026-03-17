# EcoDana Frontend (React + Vite + TypeScript)

Frontend SPA cho EcoDana, tách khỏi Thymeleaf để giao tiếp với Spring Boot qua REST API.

## Tech stack

- React + TypeScript + Vite
- Tailwind CSS
- react-router-dom
- Axios
- react-hook-form + zod

## Cấu trúc chính

```text
src/
  api/
  components/
  features/
  hooks/
  layouts/
  pages/
  routes/
  store/
  types/
  utils/
```

## Chạy local

1. Cài dependencies:

```bash
npm install
```

2. Cấu hình biến môi trường (`.env`):

```bash
VITE_API_BASE_URL=http://localhost:8080
```

3. Chạy dev server:

```bash
npm run dev
```

4. Build production:

```bash
npm run build
```

## API đã wiring

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/logout`
- `GET /api/v1/profile/me`
- `GET /api/v1/vehicles`
- `GET /api/v1/vehicles/{id}`

## Deploy Vercel

`vercel.json` đã thêm rewrite để fix lỗi refresh SPA:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/" }]
}
```

Trên Vercel, set ENV:

```bash
VITE_API_BASE_URL=https://your-backend-url.com
```
