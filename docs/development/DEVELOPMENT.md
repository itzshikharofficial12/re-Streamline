# Development Guide

## Goal

Provide a predictable, reproducible development workflow for every Streamline contributor and AI agent.

## Repository Layout

```text
apps/
  web/                 Next.js web application (port 3000)
  api/                 Node.js / Express API server (port 4000)

services/
  media/               Ingestion, transcoding, recording (planned)
  realtime/            WebSockets, chat, presence (planned)
  analytics/           Analytics processing (planned)

packages/
  config/              Shared TypeScript and ESLint configurations
  types/               Shared TypeScript contracts and response types
  database/            Prisma and database layer (planned)
  auth/                Authentication and authorization (planned)
  validation/          Shared validation schemas (planned)
  ui/                  Shared UI component library (planned)
  utils/               Domain-agnostic utilities (planned)

infrastructure/        Docker and runtime infrastructure
scripts/               Database, development, media, and testing helpers
tests/                 Integration, e2e, load, and fixtures
docs/                  Project architecture and development documentation
```

---

## Local Development Setup

### 1. Prerequisites

Ensure your host environment has:

- **Node.js**: `v20.x` or `v24.x` (verified with `v24.9.0`)
- **pnpm**: `v9.x` (verified with `v9.0.0`)
- **Docker & Docker Compose**: Docker Desktop with Compose v2+ (verified with Docker `v29.9.1`, Compose `v5.6.0`)

### 2. Initial Setup

Clone the repository and copy the example environment file:

```bash
cp .env.example .env
```

Install monorepo dependencies:

```bash
pnpm install
```

---

## Local Infrastructure (Docker Compose)

The local infrastructure services (PostgreSQL 16 and Redis 7) are managed via Docker Compose.

### Start Infrastructure

Start the containers in detached mode:

```bash
docker compose up -d
```

### Verify Service Health

Check the status and health check state of all running containers:

```bash
docker compose ps
```

Both `streamline-postgres` and `streamline-redis` should report `(healthy)`.

### View Logs

Stream logs from all containers or a specific service:

```bash
# All containers
docker compose logs -f

# PostgreSQL only
docker compose logs -f postgres

# Redis only
docker compose logs -f redis
```

### Stop Infrastructure

Stop the containers while preserving volume data:

```bash
docker compose down
```

### Reset Database & Data Volumes

If you need to wipe local database state and re-initialize volumes from scratch:

```bash
docker compose down -v
```

---

## Running Applications

### Run Full Monorepo in Development Mode

Starts both `@streamline/web` and `@streamline/api` concurrently via Turborepo:

```bash
pnpm dev
```

- **Frontend (Web):** `http://localhost:3000`
- **Backend (API):** `http://localhost:4000`
- **API Health Check:** `http://localhost:4000/health`

### Run Applications Independently

You can run individual applications in separate terminals:

```bash
# Start API only (port 4000)
pnpm --filter @streamline/api dev

# Start Web frontend only (port 3000)
pnpm --filter @streamline/web dev
```

---

## Building and Code Quality Checks

Execute validation checks across the workspace using Turborepo:

```bash
# Type check all packages and apps
pnpm typecheck

# Lint all packages and apps
pnpm lint

# Check code formatting with Prettier
pnpm format:check

# Auto-format all files
pnpm format

# Build all packages and applications for production
pnpm build
```

---

## Definition of Done

A meaningful task is complete only when:

1. **Service Boundaries:** Implementation resides in the correct package or application.
2. **Type Safety:** `pnpm typecheck` succeeds without compilation errors.
3. **Linting & Formatting:** `pnpm lint` and `pnpm format:check` pass cleanly.
4. **Build Verification:** `pnpm build` succeeds across the workspace.
5. **Runtime Validation:** Health checks, endpoints, or services are verified with real commands.
6. **Change Logging:** `docs/development/CHANGELOG.md` is updated in the same task per `AGENTS.md` Rule 4.
7. **No Unrelated Changes:** Git diff contains only changes relevant to the task.
