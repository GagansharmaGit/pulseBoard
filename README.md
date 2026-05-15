<div align="center">
  <img src="./apps/web/public/favicon.ico" alt="PulseBoard Logo" width="80" height="80" />
  <br/>
  <h1>PulseBoard</h1>
  <p><strong>Real-time Polling & Feedback Intelligence Platform</strong></p>
  <p>An enterprise-grade full-stack platform to create, share, and analyze live polls.</p>

  <div>
    <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite%20%7C%20Tailwind-00DC82?style=flat-square&logo=react&logoColor=white" alt="Frontend" />
    <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express%20%7C%20Socket.io-0B1120?style=flat-square&logo=node.js&logoColor=white" alt="Backend" />
    <img src="https://img.shields.io/badge/Database-PostgreSQL%20%7C%20Drizzle-336791?style=flat-square&logo=postgresql&logoColor=white" alt="Database" />
  </div>
</div>

---

## ⚡ Overview

**PulseBoard** is a high-performance polling application built for modern web standards. It enables users to create dynamic polls, collect anonymous or authenticated feedback, and visualize results in real-time through a beautifully designed, data-dense analytics dashboard. 

This project was built to fulfill all requirements for the **Full Stack Engineering** track, placing heavy emphasis on scalability, security, and a premium "SaaS" user experience.

---

## 🏗️ Architecture & Technology Stack

The project is structured as a **Turborepo monorepo** (`apps/web` and `apps/api`), ensuring code sharing, strict separation of concerns, and atomic deployments.

### 🌐 Frontend (`apps/web`)

The frontend is a Single Page Application (SPA) designed with a strict, dark-themed glassmorphic aesthetic inspired by premium dev-tools (Linear, Vercel).

| Library | Purpose & "Why we chose it" |
| :--- | :--- |
| **React 18 + Vite** | Provides the core UI rendering. Vite was chosen over CRA for its significantly faster HMR and optimized build times using esbuild. |
| **TypeScript** | Strict end-to-end type safety. Eliminates entire classes of runtime bugs related to undefined data payloads. |
| **Tailwind CSS + Shadcn UI** | Utility-first styling combined with unstyled, accessible radix primitives. Chosen for rapid UI iteration without sacrificing bundle size or accessibility standards. |
| **React Hook Form + Zod** | Manages complex, nested form states (like dynamic arrays of poll questions and options). Zod provides schema validation before data ever touches the network. |
| **React Query (@tanstack)** | Handles asynchronous state, caching, and background data fetching. Drastically reduces boilerplate compared to Redux/Context for server-state synchronization. |
| **Framer Motion** | Used for smooth, declarative micro-animations (like progress bar fills and card reveals) which elevate the UX from a "basic tool" to a "premium product". |
| **Socket.io-client** | Listens for server broadcasts to trigger instant React Query invalidations, making the dashboard feel "live". |

### ⚙️ Backend (`apps/api`)

The backend is a robust RESTful API built on Node.js, utilizing a modular `Controller ➔ Service ➔ Repository` pattern.

| Library | Purpose & "Why we chose it" |
| :--- | :--- |
| **Express.js** | The core HTTP server. Chosen for its massive ecosystem, stability, and un-opinionated middleware pipeline. |
| **Drizzle ORM** | A lightweight, edge-ready TypeScript ORM. Chosen over Prisma for its SQL-like syntax, lack of a heavy Rust query engine, and zero-overhead performance. |
| **PostgreSQL** | The primary relational database. Chosen for its strict ACID compliance, JSONB support, and robustness in handling relational data (Polls ➔ Questions ➔ Options ➔ Responses). |
| **Redis (Upstash)** | Used for caching active polls and managing IP-based Rate Limiting. Chosen to protect the database from read-heavy traffic spikes during viral poll sharing. |
| **Zod** | Validates incoming JSON payloads at the edge of the API. Shared with the frontend for guaranteed type parity. |
| **Clerk (SDK & Webhooks)** | Handles complex authentication flows and identity management. Offloads security, MFA, and session token rotation to a specialized provider. |
| **Socket.io** | Powers the real-time analytics. Chosen over raw WebSockets for its automatic reconnection logic, fallback polling, and easy "room" broadcasting. |

---

## 🔄 Core Application Flows

### 1. Poll Creation & Lifecycle State Machine
Polls don't just exist; they move through a strict lifecycle controlled by the creator:
1. **Draft**: The poll is being configured. Questions and options can be added/deleted.
2. **Active**: The poll is open to the public. Edits are locked to ensure data integrity.
3. **Closed**: The poll has ended (either manually or via the `expiresAt` timestamp). No new responses are accepted.
4. **Published**: The creator makes the final analytics visible to the public via the poll's share link.

### 2. Response Collection & Validation Engine
When a user submits a response to a poll (`/p/:id`), the backend pipeline performs rigorous checks:
- **Authentication Check**: If the poll `isAnonymous === false`, the API rejects unauthenticated requests.
- **Expiry Check**: Verifies `expiresAt`. If the time has passed, the poll is virtually "Closed".
- **Duplicate Prevention**: If authenticated, queries the DB to ensure the `userId` hasn't already voted on this specific `pollId`.
- **Integrity Validation**: Ensures that answered `optionId`s actually belong to the provided `questionId`s, and that no `isRequired` questions were skipped.
- **Rate Limiting**: Protects the endpoint using Redis to prevent automated spamming.

### 3. Real-Time Analytics Pipeline
1. A respondent submits their form.
2. The DB records the response atomically.
3. The Express controller triggers the `SocketServer`.
4. `Socket.io` emits a `poll_updated` event to the specific `poll:${pollId}` room.
5. All connected clients (creators watching the dashboard) receive the event.
6. The frontend `useSocket` hook triggers `queryClient.invalidateQueries()`.
7. React Query silently fetches the updated analytics JSON and Framer Motion smoothly animates the CSS progress bars to their new percentages.

---

## 🔒 Security, Webhooks & Middleware

Security is deeply embedded into the architecture of the backend, rather than treated as an afterthought.

### Authentication & Dual-Database Synchronization (Clerk Webhooks)
- Authentication is handled by Clerk via JWTs, but our PostgreSQL database needs to know which user owns which poll.
- To bridge this gap without sacrificing speed, we implemented **Cryptographically Signed Webhooks** via Svix (`/api/webhooks/clerk`).
- When a user signs up on the frontend, Clerk POSTs a webhook to our server. We verify the `svix-signature` header using our `CLERK_WEBHOOK_SECRET` to prevent replay attacks.
- Once verified, the user is duplicated into our `users` table, ensuring strict relational integrity via foreign keys (`creatorId` on `polls`).

### Express Guard Middleware (`auth.guard.ts`)
- `requireAuth`: Extracts the JWT from the `Authorization` header, verifies the asymmetric signature against Clerk's JWKS, and injects `req.userId`. Used for all Dashboard/Creator routes.
- `optionalAuth`: Verifies the token *if present*, but does not throw a `401 Unauthorized` if missing. Used for public poll submission routes, enabling the application to gracefully handle both *Anonymous* and *Authenticated* voters using the exact same Controller logic.

### Abuse Prevention & Redis Rate Limiting
Public poll links are highly susceptible to spam and automated bot scraping. We mitigate this using a sliding window rate limiter backed by **Redis**:
- The `applyResponseRateLimit` middleware intercepts incoming votes.
- It uses the `userId` if authenticated, or falls back to the extracted `clientIp` from the `req.socket` for anonymous voters.
- Allows a strict limit of requests per minute. Violators are blocked at the Redis layer with a `429 Too Many Requests` response, ensuring the PostgreSQL database is completely shielded from connection exhaustion during DDoS attempts.

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18+)
- pnpm (`npm install -g pnpm`)
- PostgreSQL database URL (e.g. Neon, Supabase, local Docker)
- Redis URL (e.g. Upstash, local Docker)
- Clerk Account

### 1. Clone & Install
```bash
git clone <your-repo-url>
cd Gpolls
pnpm install
```

### 2. Environment Setup

Create `.env` in `apps/api`:
```env
PORT=8000
NODE_ENV=development
DATABASE_URL="postgresql://user:pass@host/db"
REDIS_URL="redis://default:pass@host:port"
CLERK_SECRET_KEY="sk_test_..."
CLERK_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:5173"
```

Create `.env` in `apps/web`:
```env
VITE_API_URL="http://localhost:8000"
VITE_CLERK_PUBLISHABLE_KEY="pk_test_..."
```

### 3. Database Migration
```bash
cd apps/api
pnpm db:push
```

### 4. Run the Application
From the root directory, start both the frontend and backend simultaneously utilizing Turborepo:
```bash
pnpm dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

---

## ☁️ Free Deployment Guide

To host PulseBoard for free with permanent Database and Redis instances, follow this recommended stack:

### 1. Database (PostgreSQL) - [Neon](https://neon.tech/)
Render's built-in PostgreSQL is not free forever. Use **Neon** for a generous, serverless Postgres free tier:
- Create a project on Neon.
- Copy the **Connection String**.
- Use this as your `DATABASE_URL` in the Render environment variables.

### 2. Redis - [Upstash](https://upstash.com/)
Upstash provides a "Serverless Redis" with a robust free tier that never expires:
- Create a Redis database on Upstash.
- Copy the **Redis URL** (format: `redis://default:password@endpoint:port`).
- Use this as your `REDIS_URL` in the Render environment variables.

### 3. Hosting - [Render](https://render.com/)
Use the provided `render.yaml` to deploy:
- Go to Render ➔ **New** ➔ **Blueprint**.
- Connect this repository.
- Render will automatically detect the services.
- **Important**: You must manually add the `DATABASE_URL` and `REDIS_URL` you got from Neon and Upstash during the setup.

---

<div align="center">
  <sub>Built with ❤️ for the Hackathon</sub>
</div>

