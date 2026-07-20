# Conduit Reading Frontend — Implementation Plan (v1)

**Date:** 2026-07-02
**Design:** [2026-07-02-conduit-reading-frontend-design.md](./2026-07-02-conduit-reading-frontend-design.md)
**Status:** Ready to implement

Phased, each step has a verification check. Scope is read-only (no auth, no writes).

---

## Phase 1 — Scaffold `web/`

1. Create `web/` with Vite React+TS scaffold (`npm create vite@latest web -- --template react-ts`),
   then trim the boilerplate (demo counter, logos, default CSS).
   → **verify:** `cd web && npm install && npm run dev` serves a blank page on :5173 with no console errors.
2. Add deps: `react-router-dom`, `react-markdown`, `rehype-sanitize`.
   → **verify:** `npm ls react-router-dom react-markdown rehype-sanitize` resolves all three.
3. Configure `vite.config.ts` dev proxy: `/api` → `http://localhost:3000`.
   → **verify:** with `nx serve api` running, `curl localhost:5173/api/tags` returns the tags JSON.

## Phase 2 — API layer

4. `src/api/types.ts` — `Article`, `Comment`, `Profile`, `Author`, and list-response
   DTOs matching the mappers (`article.mapper.ts`, `author.mapper.ts`, `profile.utils.ts`).
   → **verify:** `tsc --noEmit` passes; types match a real `GET /api/articles` response.
5. `src/api/client.ts` — `request(path)` GET helper; throws `ApiError { status, body }`
   on non-2xx; normalizes `{ errors }`-object and bare-string bodies to a message.
   → **verify:** unit test: 200 returns parsed JSON; 404 throws `ApiError` with normalized message.
6. `src/api/{articles,profiles,tags}.ts` — typed functions:
   `getArticles(params)`, `getArticle(slug)`, `getComments(slug)`, `getProfile(username)`, `getTags()`.
   → **verify:** each builds the correct URL/query string (unit test on the query builder).

## Phase 3 — Shared hook & components

7. `src/hooks/useAsync.ts` — runs an async fn, returns `{ loading, data, error }`,
   re-runs on dependency change.
   → **verify:** test transitions loading→data and loading→error.
8. `src/components/`: `ArticleList` (loading/empty/error states), `ArticlePreview`,
   `Pagination` (from `articlesCount` + page size 10), `TagList`.
   → **verify:** `ArticleList` renders each state from mocked props (component tests).

## Phase 4 — Pages & routing

9. `App.tsx` — routes: `/` → HomePage, `/article/:slug` → ArticlePage,
   `/profile/:username` → ProfilePage; simple layout shell + nav.
   → **verify:** navigating each route in the browser mounts the right page.
10. `HomePage` — `?tag=` + `?page=` via `useSearchParams`; fetch `/articles`
    (`limit=10`, computed `offset`) + `/tags`; tag click sets `?tag=`.
    → **verify:** feed renders seeded articles; clicking a tag filters; pagination changes page.
11. `ArticlePage` — parallel fetch article + comments; Markdown body via
    `react-markdown` + `rehype-sanitize`; author links to profile; read-only comments.
    → **verify:** a seeded article renders formatted Markdown and its comments.
12. `ProfilePage` — fetch profile; "My Articles" (`?author=`) / "Favorited"
    (`?favorited=`) tabs.
    → **verify:** both tabs load the correct article sets for a seeded user.

## Phase 5 — Styling & polish

13. `src/index.css` — minimal readable layout (max-width container, spacing, links, tag pills).
    → **verify:** pages are legible; no framework added.
14. Empty/error copy pass across all fetch surfaces.
    → **verify:** stopping the API shows error states, not blank screens.

## Phase 6 — Verify end-to-end

15. Seed + serve: `npx prisma db seed`, `nx serve api`, `npm run dev` in `web/`.
    Drive home → tag filter → article → author profile → favorited tab.
    → **verify:** full read flow works against the live seeded API.
16. `README` note in `web/` — how to run (API on :3000, `npm run dev`, seed reminder,
    and the `demo`-flag caveat that anonymous users only see demo content).
    → **verify:** a fresh reader can start the frontend from the README alone.

---

## Task checklist

- [ ] Phase 1 — scaffold `web/`, deps, dev proxy
- [ ] Phase 2 — types, client, api functions
- [ ] Phase 3 — `useAsync` hook + components
- [ ] Phase 4 — routing + three pages
- [ ] Phase 5 — minimal CSS + empty/error copy
- [ ] Phase 6 — e2e verify + `web/README`

## Open considerations (none blocking)

- **`demo` filtering:** anonymous readers only see `demo: true` authors' articles —
  document, don't work around.
- **Test runner:** `web/` gets its own Vitest (independent of the backend's Jest) so
  the two toolchains don't collide.
