# Decision: markdown rendering & sanitization for article bodies

- **Problem:** article bodies are user-written markdown; the API should
  return sanitized HTML alongside the raw markdown so no client ever
  renders an unsanitized `<script>`.
- **Alternatives (last npm publish, checked 2026-07-19):** `markdown-it`
  (2026-07) · `marked` (2026-07, but its `sanitize` option is deprecated
  since 2019 — needs an external sanitizer either way) · `remarkable`
  (2022-06, stale — avoid) · `showdown` (2023-07, stale — avoid);
  sanitizers: `sanitize-html` (2026-07) · `dompurify` (2026-07, needs a
  DOM, i.e. jsdom on the server).
- **Choice:** adopt `markdown-it` + `sanitize-html` for server-side
  rendering. Renderer and sanitizer are separate, both actively
  maintained, both plain-Node with no DOM dependency.
- **Reasoning:** maintenance (both shipped within the last month),
  security posture (dedicated sanitizer instead of a deprecated renderer
  flag), footprint (no jsdom), low lock-in (CommonMark in, HTML out).
- **Accepted consequence:** two sanitization paths exist during the
  transition — the read-only frontend (`web/`) already sanitizes
  client-side with `rehype-sanitize`; it keeps doing so until the API
  field ships.
