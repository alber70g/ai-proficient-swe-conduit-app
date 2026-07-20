// Read-only fetch client. Always GET, never sends an Authorization header.
//
// The backend error handler (src/main.ts) is NOT the RealWorld
// `{ errors: { body: [] } }` envelope. A non-2xx body may be:
//   - a bare JSON string            (500s: res.json(err.message))
//   - a bare empty object `{}`      (HttpException(404, {}) — not found)
//   - `{ status, message }`         (401 auth failures)
//   - `{ errors: { field: [...] } }` (some validation throw sites)
// normalizeError() collapses all of these to a single readable string.

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function messageForStatus(status: number): string {
  if (status === 404) return 'Not found.';
  if (status === 401) return 'Not authorized.';
  return `Request failed (${status}).`;
}

// Turn an arbitrary parsed error body into a human-readable message.
// `status` is the fallback when the body carries no usable text.
export function normalizeError(status: number, body: unknown): string {
  if (typeof body === 'string') {
    const trimmed = body.trim();
    return trimmed.length > 0 ? trimmed : messageForStatus(status);
  }

  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;

    // `{ status, message }` shape (401 and similar).
    if (typeof obj.message === 'string' && obj.message.trim().length > 0) {
      return obj.message.trim();
    }

    // `{ errors: { field: string[] } }` shape — flatten to "field msg".
    if (obj.errors && typeof obj.errors === 'object') {
      const parts: string[] = [];
      for (const [field, messages] of Object.entries(obj.errors as Record<string, unknown>)) {
        const list = Array.isArray(messages) ? messages : [messages];
        for (const m of list) parts.push(`${field} ${String(m)}`.trim());
      }
      if (parts.length > 0) return parts.join(', ');
    }
  }

  // Bare `{}`, null, or anything unrecognized: fall back to the status.
  return messageForStatus(status);
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text();
  if (text.length === 0) return '';
  try {
    return JSON.parse(text);
  } catch {
    return text; // non-JSON body — return the raw string
  }
}

// GET `path` (relative to '/api'), parse JSON, throw ApiError on non-2xx.
export async function request<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { Accept: 'application/json' },
  });

  const body = await parseBody(res);

  if (!res.ok) {
    throw new ApiError(res.status, normalizeError(res.status, body));
  }

  return body as T;
}
