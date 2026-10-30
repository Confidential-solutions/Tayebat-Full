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

### Target layer structure

```
Request → Route → Middleware → Controller → Service → Repository → DB
                                         ↑
                                     Zod Validator
```

| Layer | Folder | Responsibility |
|---|---|---|
| **Routes** | `src/routes/` | URL mapping; keep thin |
| **Middleware** | `src/middleware/` | Auth guard, error handler |
| **Controllers** | `src/controllers/` | req/res only |
| **Services** | `src/services/` | Business logic |
| **DB / Schema** | `src/db/schema/` | Drizzle tables |
| **Validators** | `src/validators/` | Zod request bodies |
| **Config** | `src/config/` | Zod-validated env (fail fast) |

### Current state (honest)

- `src/services/` currently has **base + repository** helpers only.
- Most domain logic still lives in **route modules** (`auth`, `tracker`, `foods`, `plans`, …).
- Controllers folder is minimal (e.g. health).
- **Planned work (#7):** extract auth / tracker / foods / plans into service modules; leave Zod at the route boundary; thin routes calling services.

Until that lands, treat routes as the de-facto application layer and avoid duplicating logic when adding endpoints.

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
