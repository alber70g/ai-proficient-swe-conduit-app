import { afterEach, describe, expect, it, vi } from 'vitest';
import { ApiError, normalizeError, request } from './client';

describe('normalizeError', () => {
  it('returns a trimmed non-empty string body verbatim', () => {
    expect(normalizeError(500, '  something broke  ')).toBe('something broke');
  });

  it('falls back to a status message for an empty string body (500)', () => {
    expect(normalizeError(500, '')).toBe('Request failed (500).');
  });

  it('falls back to a status message for a bare empty object (404 not found)', () => {
    // The backend throws HttpException(404, {}) — body is literally {}.
    expect(normalizeError(404, {})).toBe('Not found.');
  });

  it('uses the message field of a { status, message } body (401)', () => {
    expect(
      normalizeError(401, { status: 'error', message: 'missing authorization credentials' }),
    ).toBe('missing authorization credentials');
  });

  it('flattens a { errors: { field: [...] } } body', () => {
    expect(normalizeError(422, { errors: { body: ["can't be blank"] } })).toBe(
      "body can't be blank",
    );
  });
});

describe('request', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed JSON on 200', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ tags: ['a', 'b'] }), { status: 200 }),
    );
    await expect(request('/tags')).resolves.toEqual({ tags: ['a', 'b'] });
  });

  it('throws ApiError with a readable message when the 404 body is {}', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({}), { status: 404 }),
    );
    await expect(request('/profiles/ghost')).rejects.toMatchObject({
      name: 'ApiError',
      status: 404,
      message: 'Not found.',
    });
  });

  it('throws ApiError with a readable message when the 500 body is a bare string', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify('boom'), { status: 500 }),
    );
    const err = await request('/articles').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).message).toBe('boom');
  });
});
