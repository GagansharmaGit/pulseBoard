# 🚀 GPollS Backend Architecture & Implementation Guide

Welcome to the definitive deep-dive guide into the GPollS Backend API. This document is written for engineers who want to understand *every single detail* of how this system was architected, why specific libraries were chosen, how data flows through the application, and exactly how the infrastructure is configured.

This is a **modular Express application** written in strict TypeScript. It heavily leverages PostgreSQL, Redis, and WebSockets to create a high-performance, real-time, anti-spam polling platform.

---

## 📖 Table of Contents
1. [How to Run the Project Locally](#1-how-to-run-the-project-locally)
2. [The Core Technology Stack (Libraries & Justifications)](#2-the-core-technology-stack-libraries--justifications)
3. [Folder Structure & Domain-Driven Design](#3-folder-structure--domain-driven-design)
4. [Deep Dive: Data Flows & Subsystems](#4-deep-dive-data-flows--subsystems)
   - [Authentication & Two-Database Sync](#auth-sync)
   - [Poll Lifecycle & State Machine](#poll-lifecycle)
   - [Anti-Spam & Rate Limiting](#anti-spam)
   - [ACID Transactions in Responses](#acid-transactions)
   - [Real-Time Socket Broadcasting](#sockets)
   - [SQL Aggregation & Analytics](#analytics)

---

## 1. How to Run the Project Locally

To test this API, you need to spin up the local infrastructure and the Node.js server.

### Prerequisites
- Node.js v20+
- `pnpm` (`npm install -g pnpm`)
- Docker & Docker Compose (for the databases)

### Step 1: Environment Variables
Create a `.env` file in the `apps/api` folder by copying the example:
```bash
cp .env.example .env
```
Ensure you have your Clerk keys from your dashboard. For local development, it should look like this:
```env
NODE_ENV=development
PORT=3001

# Docker local connections
DATABASE_URL=postgresql://gpolls:gpolls_secret@localhost:5432/gpolls
REDIS_URL=redis://:gpolls_redis_secret@localhost:6379

# Authentication
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
# (CLERK_WEBHOOK_SECRET is optional for local dev thanks to Lazy Sync)

CORS_ORIGIN=http://localhost:5173
```

### Step 2: Boot up the Databases
From the **root of the monorepo** (`/Gpolls`), start the Postgres and Redis Docker containers in the background:
```bash
docker compose up -d
```
*Note: This relies on the `docker-compose.yml` file which provisions a Postgres 16 container on port 5432 and a Redis 7 container on port 6379, both with persistent volumes.*

### Step 3: Push the Database Schema
Before the API can read/write data, the Postgres tables must exist. Drizzle makes this easy. From the `apps/api` folder, run:
```bash
pnpm run db:push
```
*What this does:* Drizzle looks at your TypeScript schema (`apps/api/src/database/schema/`), compares it to the live database, and executes the exact SQL `CREATE TABLE` and `ALTER TABLE` commands needed to sync them.

### Step 4: Start the Server
Run the development server in watch mode:
```bash
pnpm run dev
```
You will see Pino logs indicating that Redis is ready, Socket.io is initialized, and the Express server is listening on port 3001.

---

## 2. The Core Technology Stack (Libraries & Justifications)

Every dependency in `package.json` was carefully selected for performance, type safety, and scalability.

### 🌐 Core Web Server
- **`express` (v4.19)**: The foundational HTTP web framework. We use it because it has the largest ecosystem of middleware and is rock-solid in production.
- **`helmet`**: A security middleware that automatically sets over 10 different HTTP headers (like CSP, X-Frame-Options, HSTS) to protect against common web vulnerabilities (XSS, Clickjacking).
- **`cors`**: Middleware to allow our Vite frontend (`localhost:5173`) to talk to our API (`localhost:3001`) securely, passing cookies and authorization headers.

### 🗄️ Database Layer
- **`drizzle-orm`**: The ORM used to interact with PostgreSQL. 
  - *Why Drizzle over Prisma?* Prisma runs a heavy background Rust engine and abstracts away SQL entirely. Drizzle is a "SQL-like" ORM. It executes exactly what you write, resulting in vastly superior performance, zero cold-start penalties (great for serverless/edge), and total control over SQL joins and aggregations.
- **`pg`**: The underlying PostgreSQL driver for Node.js.
- **`zod`**: A TypeScript-first schema declaration and validation library. We use Zod to define the shape of incoming HTTP request bodies. If a user sends a string instead of a boolean, Zod catches it instantly, throws a `400 Bad Request`, and prevents malformed data from ever touching the database.

### ⚡ Caching & Rate Limiting
- **`ioredis`**: A robust Redis client for Node.js. Used to connect to our Dockerized Redis container.
- **`rate-limiter-flexible`**: An extremely efficient rate-limiting library.
  - *Why?* Polls can be public and anonymous. Without rate limiting, a malicious script could submit 10,000 votes in a second, ruining the integrity of a poll. We use this library in conjunction with Redis to track IP addresses and limit how fast they can hit the `/respond` endpoint.

### 📡 Real-Time WebSockets
- **`socket.io`**: The industry standard for real-time bidirectional event-based communication. Used to broadcast new votes to the Analytics dashboard.
- **`@socket.io/redis-adapter`**: A critical scaling tool. If you deploy this API to Render with 3 separate servers (horizontal scaling), a client might be connected to Server A, while a vote is processed by Server B. Without the Redis adapter, Server A wouldn't know the vote happened. The Redis Adapter uses Redis Pub/Sub to instantly forward the event to *all* servers, ensuring all connected clients see the update.

### 🔒 Authentication & Security
- **`@clerk/express`**: Clerk's official middleware for Express. It extracts the JWT from the `Authorization: Bearer <token>` header, cryptographically verifies its signature using Clerk's public JWKS keys, and attaches the `userId` to the `req.auth` object.
- **`svix`**: A library specifically designed for securely receiving Webhooks. We use it to verify cryptographic signatures (`svix-signature` header) to ensure that `user.created` events actually came from Clerk and not a hacker.

### 📊 Observability
- **`pino` & `pino-http`**: The fastest logger in the Node.js ecosystem. 
  - *Why not `console.log`?* `console.log` blocks the Node.js event loop and outputs unstructured text. Pino outputs highly structured JSON. In production, log aggregators (like Datadog, AWS CloudWatch, or Render logs) parse this JSON perfectly, allowing you to search logs by `userId`, `pollId`, or `responseTime` instantly.

---

## 3. Folder Structure & Domain-Driven Design

Instead of dumping all routes into an `index.ts` file, the architecture follows **Domain-Driven Design (DDD)**.
```text
apps/api/src/
├── config/                  # Environment variables, DB, Redis, and Socket singletons
├── common/                  
│   ├── guards/              # Authentication middleware (requireAuth, optionalAuth)
│   ├── middleware/          # Global interceptors (error handler, request logger)
│   └── utils/               # Helper functions (asyncHandler for try/catch)
├── database/
│   └── schema/              # Drizzle ORM table definitions (users, polls, responses)
├── modules/                 # The core business logic, split by feature:
│   ├── analytics/           # GET /api/polls/:id/analytics
│   ├── polls/               # CRUD operations for Polls
│   ├── responses/           # Submitting votes
│   ├── users/               # Fetching the current user
│   └── webhooks/            # Clerk sync logic
├── app.ts                   # Bootstraps Express, adds CORS/Helmet, mounts module routers
└── main.ts                  # The true entry point. Starts Redis, HTTP, and Socket.io.
```

### The Module Pattern
Every folder inside `/modules/` follows a strict 3-tier architecture:
1. **`*.router.ts`**: Defines the HTTP endpoints and attaches middleware guards.
2. **`*.controller.ts`**: The "Traffic Cop." It receives the HTTP Request (`req`), extracts the parameters/body, calls the Service, and returns the HTTP Response (`res.json()`). It knows *nothing* about databases.
3. **`*.service.ts`**: The "Brain." It contains all the business logic, status checks, validation, and triggers Socket.io events.
4. **`*.repository.ts`**: The "Database." It is the *only* file allowed to import `drizzle-orm` and write SQL queries.

---

## 4. Deep Dive: Data Flows & Subsystems

This section breaks down exactly how the most complex parts of the API function behind the scenes.

### A. Authentication & Two-Database Sync <a name="auth-sync"></a>

We have two databases: Clerk (IdP) and our PostgreSQL `users` table. They must stay in sync because a `Poll` in our database must reference a valid `creatorId` in our PostgreSQL `users` table.

**Flow 1: Webhook Sync (Production)**
1. User signs up on the frontend via Clerk.
2. Clerk's servers instantly send an HTTP POST to `POST /api/webhooks/clerk` with a JSON payload.
3. The `webhooks.router.ts` intercepts this *before* it gets parsed as JSON so it can use the raw string to cryptographically verify the signature via `svix`.
4. If verified, the `UsersRepository.upsert()` function inserts the user into PostgreSQL.

**Flow 2: Lazy Sync (Local Development)**
Setting up public URL tunnels (Ngrok) for webhooks locally is annoying. To solve this:
1. The frontend, when loaded, immediately makes an authenticated request to `GET /api/users/me`.
2. The `UsersService` checks PostgreSQL for the `req.userId`.
3. If the user is missing, it reaches out to the `https://api.clerk.com/v1/users` REST API, fetches their profile, and inserts them into PostgreSQL "just in time".

### B. Poll Lifecycle & State Machine <a name="poll-lifecycle"></a>

A Poll is not just a database row; it is a State Machine managed by the `PollsService`.

1. **`draft`**: The poll is being built. Users can add/remove questions and edit the title. *Responses are blocked.*
2. **`active`**: The creator locks the poll. Editing is disabled. *Responses are accepted.* The poll is broadcasted to the public.
3. **`closed`**: The creator manually ends the poll, or the `expiresAt` timestamp is reached. *Responses are blocked.* Only the creator can view the analytics.
4. **`published`**: The creator makes the analytics dashboard entirely public.

When `GET /api/polls/:id/respond` is hit, the `ResponsesService` verifies this State Machine. If you try to vote on a `draft` poll, it throws a `400 Bad Request`.

### C. Anti-Spam & Rate Limiting <a name="anti-spam"></a>

To protect the `POST /api/polls/:id/respond` route, we utilize `rate-limiter-flexible` backed by Redis.

In `common/middleware/rate-limiter.middleware.ts`:
1. We determine the user's identity: either their `req.userId` (if logged in) or their IP Address (`req.ip`, if anonymous).
2. We query Redis. 
   - Anonymous users: Max 5 votes per hour globally.
   - Authenticated users: Max 20 votes per hour globally.
3. If they exceed the limit, Redis tells Express to instantly reject the request with `429 Too Many Requests`. This prevents brute-force bot scripts from destroying poll integrity.

### D. ACID Transactions in Responses <a name="acid-transactions"></a>

When a user submits 5 answers to a 5-question poll, we must save 1 row to the `responses` table, and 5 rows to the `response_answers` table.

If the server crashes exactly after writing the `responses` row but *before* writing the `response_answers`, we get orphaned data (a ghost response with no answers).

To prevent this, `ResponsesRepository.create()` uses a **Database Transaction** (`db.transaction(async (tx) => { ... })`).
1. It opens a secure lock.
2. It inserts the `responses` row.
3. It maps and inserts the 5 `response_answers` rows.
4. It checks for constraints (e.g., did they submit an option that doesn't belong to the question?).
5. If *anything* fails, it triggers an instant **Rollback**, deleting all partial data. The database remains in a perfect, consistent state.

### E. Real-Time Socket Broadcasting <a name="sockets"></a>

We don't want poll creators constantly refreshing the page to see new votes. 

1. When a creator views `/p/:pollId/results` on the frontend, their browser connects to the WebSocket server on port `3001` and emits: `socket.emit('subscribe_poll', pollId)`.
2. In `config/socket.ts`, the backend hears this and runs `socket.join("poll:123")`, placing that specific user's socket connection into a specific room.
3. When a completely random user submits a vote on that poll, the `ResponsesService` successfully saves it to Postgres.
4. Immediately after the SQL transaction completes, the service executes: `getSocketServer().to("poll:123").emit("poll_updated")`.
5. The frontend receives the event and asks TanStack Query to stealthily fetch the fresh analytics data in the background, updating the charts instantly.

### F. SQL Aggregation & Analytics <a name="analytics"></a>

In `AnalyticsRepository.getPollAnalytics()`, we need to figure out exactly how many people voted for "Option A". 

A junior engineer might pull all 10,000 response rows into Node.js and run a `for` loop to count them. This will crash the server due to Out-Of-Memory (OOM) errors.

Instead, we force the PostgreSQL engine (written in highly optimized C) to do the math:
```ts
const optionCounts = await db
  .select({
    questionId: responseAnswers.questionId,
    optionId: responseAnswers.optionId,
    count: sql<number>`cast(count(${responseAnswers.id}) as int)`,
  })
  .from(responseAnswers)
  .innerJoin(responses, eq(responses.id, responseAnswers.responseId))
  .where(eq(responses.pollId, pollId))
  .groupBy(responseAnswers.questionId, responseAnswers.optionId);
```
This query returns a tiny array of numbers instantly, even if there are 10 million responses. We then format it into a Map and return it to the frontend to render the Recharts.

---

*This concludes the architectural deep dive. You are now fully equipped to modify, scale, and debug the GPollS backend.*
