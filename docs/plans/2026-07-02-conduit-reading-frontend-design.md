# Conduit Reading Frontend — Design (v1)

**Date:** 2026-07-02
**Status:** Approved
**Author:** design session (brainstorming)

## Overview

A **read-only** React SPA that consumes the existing Conduit (RealWorld) REST API.
No authentication and no write operations. A visitor can browse articles, read a
single article with its comments, filter by tag, and view author profiles.

All interactive / write features (favorite, follow, comment posting, article
editor, login / sign-up) are explicitly **out of scope for v1**.

## Scope

### In scope

- Global article feed with tag filtering and pagination.
- Single article view with Markdown-rendered body and read-only comments.
- Author profile pages with "My Articles" and "Favorited" tabs.
- Popular tags sidebar.

### Out of scope (deliberate cuts — YAGNI)

- Authentication (login / sign-up / current user / settings).
- Any write operation: favorite, follow, post/delete comment, create/edit/delete
  article.
- Query library (TanStack Query) — plain `fetch` + a small hook is sufficient for
  read-only screens.
- CSS framework — minimal hand-rolled CSS only.

## API surface used

All endpoints below are public or `auth.optional`; **no token is ever sent**.

- `GET /api/articles?tag=&author=&favorited=&limit=&offset=` — feed, filtering,
  pagination (`articlesCount` drives paging).
- `GET /api/articles/:slug` — single article.
- `GET /api/articles/:slug/comments` — comments (read).
- `GET /api/profiles/:username` — profile.
- `GET /api/tags` — popular tags.

**Deliberately unused:** everything under `auth.required` (personal feed,
create/update/delete article, favorite, follow, add/delete comment) and all of
`/users`, `/user`.

## Known backend behavior designed around

- **`demo` flag filtering:** `buildFindAllQuery` in `article.service.ts` returns
  only articles authored by `demo: true` users OR by the requesting user. An
  anonymous reader therefore only ever sees seeded demo content. v1 **assumes the
  DB is seeded** (`npx prisma db seed`) and shows clean empty states otherwise.
- **Error body shape:** the API returns either `{ errors: {...} }` or a bare
  string. The client normalizes both to a readable message.

## Stack

- **React + Vite + TypeScript** — lightweight SPA, fast HMR, matches the TS backend.
- **React Router** — client-side routing.
- **Plain `fetch` + a small `useAsync` hook** — loading / data / error. No query
  library (avoids speculative complexity for read-only screens).
- **`react-markdown` + `rehype-sanitize`** — render article bodies (authored in
  Markdown); sanitize because content comes from arbitrary users.
- **Minimal hand-rolled CSS** — one small `index.css`, no framework.

## Project layout

New standalone `web/` folder at the repo root, kept **outside** the Nx `api`
project to avoid tooling entanglement.

```
web/
  index.html
  package.json          # own deps, independent of the backend
  vite.config.ts        # dev proxy: /api -> http://localhost:3000
  tsconfig.json
  src/
    main.tsx            # entry, router mount
    App.tsx             # routes + layout shell
    api/
      client.ts         # fetch wrapper, base '/api', JSON + error handling
      articles.ts       # getArticles, getArticle, getComments
      profiles.ts       # getProfile
      tags.ts           # getTags
      types.ts          # Article, Comment, Profile, Author DTOs
    hooks/
      useAsync.ts       # loading/data/error state
    pages/
      HomePage.tsx      # feed + tag sidebar + pagination
      ArticlePage.tsx   # single article + comments (read-only)
      ProfilePage.tsx   # author articles + favorited tabs
    components/
      ArticleList.tsx   # list + loading/empty/error states
      ArticlePreview.tsx
      Pagination.tsx
      TagList.tsx
    index.css
```

**Dev flow:** `npm run dev` in `web/` (Vite on :5173) proxies `/api` →
`localhost:3000` (a running `nx serve api`). No CORS juggling, no base-URL env.

## Data flow

- **`api/client.ts`** — one `request(path)` helper. Always GET,
  `Accept: application/json`, no auth header. Non-2xx throws
  `ApiError { status, body }`; the body is normalized to a readable message.
- **HomePage** — reads `?tag=` and `?page=` from the URL (`useSearchParams`).
  Fetches `GET /articles` with `limit=10` and computed `offset`. Renders `TagList`
  from `GET /tags`; clicking a tag sets `?tag=`. `Pagination` uses `articlesCount`.
- **ArticlePage** (`/article/:slug`) — parallel fetch of article + comments.
  Renders title, author line (links to profile), Markdown body (sanitized), tag
  pills, and a read-only comment list.
- **ProfilePage** (`/profile/:username`) — fetches profile, plus two tabs:
  "My Articles" (`GET /articles?author=<username>`) and "Favorited"
  (`GET /articles?favorited=<username>`).

## Error handling

Every fetch surface renders three explicit states:

- **loading** — simple "Loading…".
- **error** — the normalized message + the failing resource.
- **empty** — e.g. "No articles here."

Fail-loud: errors are shown, never swallowed.

## Testing

- Component-level smoke tests for the three pages against a mocked `client`
  (loading → data → empty → error paths).
- Manual verification against a seeded API (`nx serve api` + `prisma db seed`),
  driving the home → article → profile flow in the browser.
