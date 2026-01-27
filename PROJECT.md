# HeroGlob – Project structure

Monorepo gồm **FE** (Next.js), **Admin** (Vite + React), **Backend** (NestJS).

## Cấu trúc thư mục

```
heroglob/
├── app/                 # Next.js App Router (FE)
├── admin/               # Admin dashboard (Vite + React)
├── backend/             # API (NestJS)
├── public/
├── .env.example
├── .editorconfig
├── package.json         # Root workspace (FE + workspaces: admin, backend)
└── PROJECT.md
```

## Công nghệ

| Phần     | Stack              | Port (dev) |
|----------|--------------------|------------|
| FE       | Next.js 16, React 19, Tailwind | 3000  |
| Admin    | Vite 7, React 19   | 5173  |
| Backend  | NestJS 11          | 4000  |

## Chạy dự án

- Cài một lần (từ root): `npm install` (workspaces sẽ cài cả admin + backend).
- Chạy từng app:
  - FE: `npm run dev` (hoặc `npm run dev -w .` nếu cần)
  - Admin: `npm run dev:admin`
  - Backend: `npm run dev:backend`
- Build: `npm run build` (FE), `npm run build:admin`, `npm run build:backend`.

## Biến môi trường

- Copy `.env.example` và tạo `.env` / `.env.local` theo từng app.
- Backend: đặt trong `backend/.env` (PORT, CORS_ORIGIN_FE, CORS_ORIGIN_ADMIN, …).
- FE: `.env.local` với `NEXT_PUBLIC_API_URL`.
- Admin: `admin/.env` với `VITE_API_URL`.

## Convention

- **FE (Next.js)**: App Router trong `app/`, component trong `components/`, shared logic trong `lib/`.
- **Admin**: Trang trong `src/pages/`, layout trong `src/layouts/`, API trong `src/api/`.
- **Backend**: Module theo domain trong `src/modules/`, shared trong `src/common/`, config trong `src/config/`. API prefix: `/api`.
