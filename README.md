<div align="center">

# 🥗 Tayebat (Eltayebat)

**A full-stack nutrition & wellness platform — track meals, manage plans, discover recipes, and reach your health goals.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Drizzle_ORM-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[📖 Docs](./docs/) · [🚀 Setup Guide](./docs/SETUP.md) · [🔌 API Reference](./docs/API.md) · [🤝 Contributing](./CONTRIBUTING.md)

Live: [eltayebat.vercel.app](https://eltayebat.vercel.app)

</div>

---

## ✨ Features

| Area | What's Included |
|---|---|
| 🔐 **Auth** | JWT register / login / logout via **`Authorization: Bearer`** header (not HTTP cookies) |
| 📊 **Dashboard** | Macro overview, calorie progress, and daily summary cards |
| 🍽️ **Food Tracker** | Log meals per day, search foods, track macros (protein, carbs, fat) |
| 📅 **Meal Plans** | Create, assign, and follow structured weekly meal plans |
| 🧑‍🍳 **Recipes** | Browse, create, and save community recipes with full nutrition info |
| 👤 **Profile** | Personal stats, goals, and preferences management |
| 🌙 **Dark Mode** | Full light/dark theme with system preference detection |
| 🌍 **i18n Ready** | Multi-language context built in |
| 📱 **PWA** | Installable as a Progressive Web App |

### Auth token storage (frontend)

The API expects **Bearer JWT** only. Typical client options:

- **Memory / React state** (recommended for XSS resistance; lost on refresh)
- **`localStorage` / `sessionStorage`** (common SPA pattern; protect against XSS)
- HttpOnly cookies are **not** implemented yet (`cookie-parser` is present but unused)

---

## 🏗️ Architecture

```
Tayebat-Full/
├── backend/                   # Node.js + Express REST API
│   ├── api/                   # Vercel serverless entry (index.ts)
│   ├── src/
│   │   ├── app.ts             # Express app setup (CORS, logging, routes)
│   │   ├── index.ts           # Server entry + graceful shutdown
│   │   ├── config/            # Zod-validated env config
│   │   ├── controllers/       # Thin handlers (expanding)
│   │   ├── db/                # Drizzle schema + connection
│   │   ├── middleware/        # Auth guard, error handler
│   │   ├── routes/            # Route definitions
│   │   ├── services/          # Domain services (base + repository; domain modules TBD)
│   │   ├── utils/             # JWT, hashing helpers
│   │   └── validators/        # Zod request validators
│   ├── .env.example
│   └── package.json
│
├── frontend/                  # React 19 + Vite SPA
├── docs/
├── .github/workflows/         # CI (typecheck + tests)
├── vercel.json
└── README.md
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **Node.js + Express 5** | HTTP server & routing |
| **TypeScript 5.9** | Type safety |
| **Drizzle ORM** | Type-safe PostgreSQL queries & migrations |
| **PostgreSQL** | Primary database |
| **Pino** | Structured JSON logging |
| **Zod** | Runtime schema & env validation |
| **JWT + bcryptjs** | Bearer authentication & password hashing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 19** | UI framework |
| **Vite 7** | Dev server & bundler |
| **Tailwind CSS v4** | Utility-first styling |
| **Shadcn/UI + Radix UI** | Accessible component primitives |
| **Wouter** | Lightweight client-side router |
| **TanStack Query v5** | Server state management & caching |
| **Axios** | HTTP client (Bearer token) |

---

## 🚀 Quick Start

> **Prerequisites:** Node.js ≥ 18, PostgreSQL running locally

### 1. Clone & Install

```bash
git clone https://github.com/Confidential-solutions/Tayebat-Full.git
cd Tayebat-Full
```

### 2. Backend Setup

```bash
cd backend
npm install

cp .env.example .env
# Edit .env — set DATABASE_URL and a strong JWT_SECRET (>= 32 chars)

npx drizzle-kit push
npm run dev
```

✅ API at **`http://localhost:3000`**

### 3. Frontend Setup

```bash
cd ../frontend
npm install
echo "VITE_API_URL=http://localhost:3000" > .env
npm run dev
```

✅ App at **`http://localhost:5173`**

---

## 📝 Scripts

### Backend (`/backend`)

```bash
npm run dev        # Dev server (tsx watch)
npm run build      # Compile → dist/
npm run start      # Production build
npm run typecheck  # tsc --noEmit
npm test           # Vitest unit tests
```

### Frontend (`/frontend`)

```bash
npm run dev        # Vite dev server
npm run build      # Production bundle
npm run preview    # Preview production build
npm run typecheck  # tsc --noEmit
```

---

## 🌐 API Routes

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ❌ | Create account |
| `POST` | `/api/auth/login` | ❌ | Sign in (returns JWT) |
| `POST` | `/api/auth/logout` | ✅ Bearer | Sign out |
| `GET` | `/api/dashboard` | ✅ Bearer | Dashboard summary |
| `GET/POST` | `/api/tracker` | ✅ Bearer | Food log entries |
| `GET/POST` | `/api/plans` | ✅ Bearer | Meal plans |
| `GET/POST` | `/api/recipes` | ✅ Bearer | Recipes |
| `GET/POST` | `/api/foods` | ✅ Bearer | Food database |
| `GET/PUT` | `/api/profile` | ✅ Bearer | User profile |
| `GET` | `/api/health` | ❌ | Health check |

Send tokens as: `Authorization: Bearer <token>`

---

## 🚢 Deployment

Configured for **Vercel** via [`vercel.json`](./vercel.json). Set `DATABASE_URL` and `JWT_SECRET` in the Vercel project environment (never commit them).

```bash
npx vercel --prod
```

---

## 📚 Documentation

| Document | Description |
|---|---|
| [SETUP.md](./docs/SETUP.md) | Local dev setup |
| [API.md](./docs/API.md) | REST API reference |
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | Deployment |

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) and [Code of Conduct](./CODE_OF_CONDUCT.md).

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

---

<div align="center">

Repo: [Confidential-solutions/Tayebat-Full](https://github.com/Confidential-solutions/Tayebat-Full)

</div>
