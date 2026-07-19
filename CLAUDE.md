# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## Project Overview

This project is a Medium clone for blogposts, called Conduit. It is a
[RealWorld](https://github.com/gothinkster/realworld) example application: a
Node.js + Express + Prisma REST API implementing the RealWorld spec (auth,
articles, comments, profiles/following, tags, favorites), plus a read-only
React frontend in `web/`. The backend is a single Nx application named `api`
(not a multi-app monorepo, despite the Nx tooling), with a separate `e2e`
project. The project uses git for version control.

The backend is written in TypeScript and uses Express as the web framework and
Prisma as the ORM against a PostgreSQL database. The frontend is written in
TypeScript with React and built with Vite.

## Common Commands

Tasks run through Nx. The `api` project is inferred from `project.json` at the
repo root.

- **Serve (dev):** `npx nx serve api` — builds and runs `dist/api/main.js` on
  port 3000 (`PORT` overrides).
- **Build:** `npx nx build api` (production config strips sourcemaps and
  generates a lockfile).
- **Lint:** `npx nx lint api`
- **Unit tests:** `npx nx test api` (Jest via ts-jest).
- **Single test file:**
  `npx nx test api --testFile=src/tests/services/article.service.test.ts`
- **Filter by test name:** `npx nx test api -t "creates an article"`
- **E2E tests:** `npx nx e2e e2e` — expects a server already running (the
  global-setup is a stub; it does not boot the app or a DB).
- **Docker build:** `npx nx docker-build api`, then
  `docker run -p 3000:3000 -t api`.

Frontend (from `web/`):

- **Dev server:** `npm run dev` (Vite on :5173, proxies `/api` → :3000)
- **Build:** `npm run build` (tsc + vite build)
- **Tests:** `npm run test` (Vitest)
- **Lint:** `npm run lint`

## Prisma / Database

- Schema and migrations live under `src/prisma/` (not the conventional
  `prisma/` root). `package.json` points Prisma at `src/prisma/schema.prisma`.
- After changing `schema.prisma`: `npx prisma generate`, then create a
  migration with `npx prisma migrate dev`.
- Apply existing migrations: `npx prisma migrate deploy`.
- Seed: `npx prisma db seed` (runs `src/prisma/seed.ts`).
- The database connection is configured via the `DATABASE_URL` environment
  variable.

## Architecture

The whole API is wired in three layers. Each resource (`article`, `auth`,
`profile`, `tag`) is a folder under `src/app/routes/` following the same
structure:

- **`*.controller.ts`** — an Express `Router`. Defines routes, attaches auth
  middleware, extracts params/body, calls the service, and forwards errors
  with `next(error)`. Controllers contain no business logic.
- **`*.service.ts`** — business logic. Talks to Prisma directly (imports the
  shared client), throws `HttpException` on failure, and returns
  already-mapped view models.
- **`*.mapper.ts` / `*.utils.ts`** — pure functions that shape Prisma records
  into RealWorld API response DTOs (e.g. `articleMapper`, `profileMapper`,
  `authorMapper`).
- **`*.model.ts`** — TypeScript interfaces for inputs/outputs.

Request flow: `src/main.ts` (Express app + global error handler) →
`src/app/routes/routes.ts` (mounts every controller under `/api`) → resource
controller → service → Prisma.

The frontend in `web/` is a standalone Vite React SPA with its own
`package.json`, `tsconfig.json`, ESLint config, and Vitest suite. It is
deliberately kept outside the Nx `api` project and is excluded from the
repo-root ESLint/Prettier runs. It only issues anonymous GET requests; there
is no authentication and no write operations in the frontend.

## Key Conventions

- **Auth** uses `express-jwt`. `src/app/routes/auth/auth.ts` exports
  `auth.required` and `auth.optional` middleware; tokens are read from the
  `Authorization` header as either `Token <jwt>` or `Bearer <jwt>`. The
  authenticated user id is available as `req.auth?.user?.id` (typed via
  `user-request.d.ts`). Tokens are signed in `token.utils.ts` with a 60-day
  expiry.
- **The `demo` user flag** (`User.demo` in the schema) controls article
  visibility. `buildFindAllQuery` in `article.service.ts` only returns
  articles authored by `demo: true` users OR by the requesting user. This is
  intentional multi-tenant-style filtering for the shared demo deployment —
  preserve it when touching article listing/feed queries.
- The API implements the RealWorld spec; response shapes must match it.

## Testing

- **Unit tests** live in `src/tests/` (mirroring `services/` and `utils/`),
  not co-located with source.
- Prisma is mocked with `jest-mock-extended` via `src/tests/prisma-mock.ts`.
  Import that module's default export (`prismaMock`) and set return values
  with `prismaMock.<model>.<method>.mockResolvedValue(...)`. It auto-resets
  before each test. Services import the real client, but the `jest.mock` in
  the mock module replaces it.
- Import `prisma-mock` **before** the service under test, otherwise the real
  Prisma client is constructed and the tests require a live database.

## Code Style

- Prettier is configured at the repo root; format code before committing.
- ESLint runs per project (`npx nx lint api`, `npm run lint` in `web/`).
- Write clean, well-structured TypeScript code with meaningful names.
- Follow the existing patterns in the codebase when adding new features.
