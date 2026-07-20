# Conduit — Reading Frontend

A **read-only** React SPA for browsing content served by the Conduit
(RealWorld) API in this repo. A visitor can browse the article feed, filter by
tag, read a single article with its comments, and view author profiles.

There is **no authentication and no write operations** — no login, favoriting,
following, commenting, or editing. It only issues anonymous `GET` requests.

## Prerequisites

- The Conduit **API running on port 3000** (`npx nx serve api` from the repo root).
- A **seeded database** — see the caveat below.

## Run

```bash
# 1. From the repo root: start the API on :3000 (needs Postgres + a generated
#    Prisma client). Seed it if you haven't:
npx prisma db seed
npx nx serve api

# 2. In this folder: start the Vite dev server on :5173.
cd web
npm install      # first time only
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` →
`http://localhost:3000`, so there is no CORS setup and no base-URL env to
configure.

## Scripts

| Script            | What it does                                  |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Vite dev server on :5173 (with the `/api` proxy) |
| `npm run build`   | Type-check + production build to `dist/`      |
| `npm run preview` | Serve the production build locally            |
| `npm run test`    | Run the Vitest unit/component suite           |
| `npm run lint`    | Lint with the local ESLint config             |

## Important: the `demo`-flag caveat

The backend filters article, comment, and tag listings by a `demo` flag
(`buildFindAllQuery` in `article.service.ts`). An **anonymous** request — which
is all this frontend makes — only ever sees content authored by users with
`demo: true`. So:

- **The database must be seeded** (`npx prisma db seed`) for anything to appear.
  `src/prisma/seed.ts` creates demo users and articles.
- Articles authored by ordinary (non-demo) signed-up users are **invisible**
  here by design. This is intentional multi-tenant-style filtering for the
  shared demo deployment, not a bug — do not work around it.
- `GET /api/tags` is likewise demo-filtered and returns the top 10 tags.

When the DB is empty or unseeded, every page renders a clean empty state
("No articles here.", etc.) rather than an error.

## Project structure

```
src/
  main.tsx            entry + router mount
  App.tsx             layout shell + routes
  api/
    client.ts         fetch wrapper (GET only, no auth) + error normalizer
    articles.ts       getArticles / getArticle / getComments + query builder
    profiles.ts       getProfile
    tags.ts           getTags
    types.ts          Article / Comment / Profile / Author DTOs
  hooks/useAsync.ts   loading / data / error state, stale-guarded
  components/         ArticleList, ArticlePreview, Pagination, TagList, StateMessage
  pages/              HomePage, ArticlePage, ProfilePage
  lib/format.ts       date formatting
  index.css           hand-rolled styles (no framework)
```

## Notes

- Article bodies are authored in Markdown and rendered with `react-markdown` +
  `rehype-sanitize` (content is sanitized because it comes from arbitrary users).
- This folder is intentionally **outside** the Nx `api` project: its own
  `package.json`, `tsconfig.json`, ESLint config, and Vitest (independent of the
  backend's Jest). It is excluded from the repo-root ESLint/Prettier runs.
