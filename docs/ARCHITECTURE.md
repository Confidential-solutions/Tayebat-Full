# Architecture — Tayebat (Eltayebat)

This document describes the system design, data models, and architectural direction for Tayebat.

---

## System Overview

```
Browser (React SPA)
       │
       │  HTTP / JSON + Authorization: Bearer <JWT>
       ▼
Express REST API  ──── PostgreSQL
  (Node.js / TS)         (Drizzle ORM)
       │
       ▼ (Vercel serverless)
  api/index.ts
```

Monorepo: independently deployable `frontend/` and `backend/`, coordinated via root `vercel.json`.

---

## Backend Architecture

### Layer structure

```
Request → Route → Middleware → Service → DB (Drizzle)
                       ↑
                   Zod Validator
```

| Layer | Folder | Responsibility |
|---|---|---|
| **Routes** | `src/routes/` | URL mapping, Zod validation, HTTP status mapping — keep thin |
| **Middleware** | `src/middleware/` | Auth guard, error handler |
| **Controllers** | `src/controllers/` | Optional thin handlers (e.g. health) |
| **Services** | `src/services/` | Domain business logic |
| **DB / Schema** | `src/db/schema/` | Drizzle tables |
| **Validators** | `src/validators/` | Zod request bodies |
| **Config** | `src/config/` | Zod-validated env (fail fast) |

### Domain services (current)

| Service | File | Covers |
|---|---|---|
| **AuthService** | `auth.service.ts` | register, login, me |
| **FoodsService** | `foods.service.ts` | list, categories, getById |
| **TrackerService** | `tracker.service.ts` | entries CRUD, today summary, weight |
| **PlansService** | `plans.service.ts` | meal plans CRUD with entries |

Routes call these services; they no longer embed DB/auth business rules.

Still fat / not fully extracted: `dashboard`, `profile`, `recipes` (follow-up).

### Key decisions

- **Auth:** Bearer JWT only (no HttpOnly cookies yet; `cookie-parser` unused).
- **Env:** `DATABASE_URL` (PostgreSQL) and `JWT_SECRET` required; weak placeholders rejected in production.
- **Logging:** Pino — avoid logging tokens/passwords.
- **OpenAPI:** `src/openapi.yaml` + Orval for client types where used.

---

## Frontend Architecture

### Layer structure

```
Pages
  └── Components (Shadcn/UI + custom)
        ├── hooks/         # TanStack Query + useAuth
        ├── contexts/      # theme, language, notifications
        ├── lib/axios.ts   # Axios + Bearer token
        └── types/
```

### Routing (Wouter)

```
/              → Home
/login         → Login
/register      → Register
/dashboard     → Dashboard
/tracker       → Food Tracker
/plans         → Meal Plans
/recipes       → Recipes
/profile       → Profile
```

### State

| Concern | Solution |
|---|---|
| Server state | TanStack Query |
| Auth | Context + `useAuth` (store JWT per client choice: memory / storage) |
| Theme / i18n | Context providers |

---

## Database (high level)

Tables include `users`, `profiles`, `foods`, `tracker`, `plans`, `recipes` (see `backend/src/db/schema/`). Primary store is **PostgreSQL** via Drizzle.

---

## Deployment

```
Vercel
  vercel.json rewrites
       ├── /api/*  → backend serverless
       └── /*      → frontend static
```

Set `DATABASE_URL` and `JWT_SECRET` in Vercel project env — never commit them.
