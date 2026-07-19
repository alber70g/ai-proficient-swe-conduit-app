# Spec: mute author

**Ticket:** "readers want to mute authors they don't like."
**Produced by:** plan-mode interview (read-only), Module 3.
**Status:** agreed — this file is the contract the implementation is judged
against.

## Decisions from the interview

Questions the one-line ticket left unanswered, with the product decisions:

| Question | Decision |
| --- | --- |
| Hide from my personal feed only, or the global feed too? | **Personal feed only** (`GET /api/articles/feed`). The global feed and tag/author listings are unaffected. |
| Can an anonymous user mute someone? | **No. Mute endpoints require authentication.** Anonymous requests get 401. |
| Can I unmute? | Yes — paired endpoint, same shape as follow/unfollow. |
| Can I see whom I muted? | Via the profile: `Profile` gains a `muted` boolean for the requesting user. No dedicated list endpoint in v1. |
| Are the author's comments hidden too? | **Out of scope v1.** Only feed articles are filtered. |
| Does muting affect the muted author? | No. Muting is invisible to the muted author; it only changes what the muting reader sees. |
| Mute twice / unmute when not muted? | Idempotent — no error, same response shape. |

## API design

Follows the existing follow/favorite pattern: paired POST/DELETE routes, a
boolean on the response object, a join table in Prisma.

- `POST /api/profiles/:username/mute` — auth **required** — returns
  `{ "profile": { ..., "muted": true } }`
- `DELETE /api/profiles/:username/mute` — auth **required** — returns
  `{ "profile": { ..., "muted": false } }`
- `Profile` response object gains `muted: boolean` (false for anonymous
  requests, like `following`).
- `GET /api/articles/feed` excludes articles whose author is muted by the
  requesting user — in **both** the returned articles and `articlesCount`.

## Data model

Self-relation on `User`, mirroring `UserFollows`:

- `mutedBy User[] @relation("UserMutes")` / `muting User[]` on the `User`
  model; Prisma generates the `_UserMutes` join table in a new migration.
- Never edit shipped migrations; this is a new `npx prisma migrate dev`.

## Milestones

Each milestone states its acceptance criterion **and** the command that
proves it. A criterion without a command is a wish.

1. **Schema + migration.**
   Criterion: `User` has the `UserMutes` self-relation; a new migration
   creates `_UserMutes`; no shipped migration edited.
   Verify: `npx prisma migrate dev --name add_user_mutes` applies cleanly;
   `npx prisma validate` passes; `git diff --stat src/prisma/migrations`
   shows only the new folder.
2. **Mute/unmute endpoints (auth required).**
   Criterion: authenticated POST/DELETE `/api/profiles/:username/mute`
   toggle the relation and return the profile with the correct `muted`
   value; anonymous requests are rejected with 401 before reaching the
   service.
   Verify: `npx nx test api --testFile=src/tests/services/profile.service.test.ts`
   passes; `curl -X POST localhost:3000/api/profiles/<u>/mute` (no token)
   prints 401, with `-H "Authorization: Token <jwt>"` prints
   `"muted": true`.
3. **Feed filtering, items and count.**
   Criterion: a muted author's articles never appear in
   `GET /api/articles/feed` for the muting user, and `articlesCount`
   matches the filtered list.
   Verify: `npx nx test api` passes (getFeed mute tests); with seeded
   data, feed curl before/after mute shows the author disappear and the
   count drop.
4. **Profile flag.**
   Criterion: `GET /api/profiles/:username` returns `muted` true/false for
   the requesting user, `false` when anonymous.
   Verify: profile service tests pass; curl with and without token shows
   the flag flip.
5. **Manual smoke test (human).**
   Criterion: end-to-end behaviour holds outside the test harness.
   Verify: seed the DB, mute an author via curl, load the personal feed —
   the author is gone; unmute — the author is back. Confirm the read-only
   frontend (`web/`) still renders the global feed unchanged.

## Task list

- [ ] Add `UserMutes` relation to `src/prisma/schema.prisma`; generate
      migration + client
- [ ] `profile.service.ts`: `muteAuthor` / `unmuteAuthor` (mirror
      follow/unfollow)
- [ ] `profile.controller.ts`: POST/DELETE `/profiles/:username/mute` with
      `auth.required`
- [ ] `profile.model.ts` + `profile.utils.ts`: `muted` boolean on Profile
- [ ] `article.service.ts` `getFeed`: exclude muted authors in `findMany`
      **and** `count`
- [ ] Tests: mute/unmute service tests + getFeed filtering tests (must be
      able to fail: assert values, not property presence)
- [ ] Run milestone verifications 1–4; human runs milestone 5
