---
name: conduit-api-spec
description: |
  RealWorld/Conduit API endpoint reference: routes, request/response shapes,
  auth requirements, error format. Use when adding or modifying API
  endpoints, changing response objects, or writing tests that hit the API.
---

# Conduit API conventions

All routes live under `/api`. Auth header: `Authorization: Token <jwt>`.
Validation errors return 422 with `{"errors": {"body": ["..."]}}`;
401 unauthenticated, 403 forbidden, 404 not found.

## Endpoint map

| Method + path | Auth | Returns |
| --- | --- | --- |
| POST /users/login, POST /users | no | User |
| GET /user, PUT /user | yes | User |
| GET /profiles/:username | optional | Profile |
| POST/DELETE /profiles/:username/follow | yes | Profile |
| GET /articles (?tag&author&favorited&limit&offset) | optional | Articles |
| GET /articles/feed (?limit&offset) | yes | Articles (followed authors) |
| GET /articles/:slug | no | Article |
| POST /articles, PUT/DELETE /articles/:slug | yes | Article |
| GET/POST /articles/:slug/comments | optional/yes | Comment(s) |
| DELETE /articles/:slug/comments/:id | yes | — |
| POST/DELETE /articles/:slug/favorite | yes | Article |
| GET /tags | no | Tags |

## Response envelopes

Every response wraps its object: `{"user": {...}}`, `{"profile": {...}}`,
`{"article": {...}}`, `{"articles": [...], "articlesCount": n}`,
`{"comment": {...}}`, `{"comments": [...]}`, `{"tags": [...]}`.

Key fields: User has `email, token, username, bio, image`. Profile has
`username, bio, image, following`. Article has `slug, title, description,
body, tagList, createdAt, updatedAt, favorited, favoritesCount, author
(Profile)`. Comment has `id, createdAt, updatedAt, body, author (Profile)`.

## Conventions when extending

- New relations follow the follow/favorite pattern: paired POST/DELETE
  routes, a boolean on the response object, a join table in Prisma.
- `slug` regenerates when `title` changes.
- Never edit `src/prisma/migrations/`; schema changes get a new migration
  via `npx prisma migrate dev`.
