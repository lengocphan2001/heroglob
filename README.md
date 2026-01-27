# HeroGlob

Monorepo: **FE** (Next.js), **Admin** (Vite + React), **Backend** (NestJS).

## Cấu trúc

| Thư mục   | Mô tả              | Công nghệ        |
|-----------|--------------------|------------------|
| `/`       | Frontend (site)    | Next.js 16, React 19, Tailwind |
| `/admin`  | Trang quản trị     | Vite 7, React 19, Tailwind |
| `/backend`| API                | NestJS 11        |

Chi tiết: [PROJECT.md](./PROJECT.md).

## Chạy nhanh

```bash
# Cài dependency (một lần, từ root)
npm install

# Chạy FE (http://localhost:3000)
npm run dev

# Chạy Admin (http://localhost:5173)
npm run dev:admin

# Chạy Backend (http://localhost:4000/api)
npm run dev:backend
```

Sao chép `.env.example` và tạo file `.env` / `.env.local` cho từng app khi cần (xem PROJECT.md).
