# CLAUDE.md

Nx wraps every task: `npx nx serve api` (port 3000), `npx nx test api`,
single file: `npx nx test api --testFile=src/tests/services/<file>`.

- The API implements the RealWorld spec; response shapes must match it
  exactly.
- Prisma schema + migrations live under `src/prisma/` (not `prisma/`).
  Never edit a shipped migration; schema changes get a new migration via
  `npx prisma migrate dev`.
- `buildFindAllQuery` in `article.service.ts` filters listings to
  `demo: true` authors OR the requesting user, on purpose — preserve it in
  every article listing/feed query.
- In tests, import `src/tests/prisma-mock.ts` before the service under
  test, or the real Prisma client is constructed and tests want a live DB.
- `web/` is a standalone Vite SPA with its own toolchain; keep it out of
  Nx and the root ESLint/Prettier runs.
- Before editing a module, read its immediate callers, its exports, and
  the shared utilities it touches.
- Researched choices are recorded in `decisions/` (five-line notes; see
  `decisions/README.md`). Read the relevant note before proposing a
  library, and never re-litigate a recorded decision without saying so.
