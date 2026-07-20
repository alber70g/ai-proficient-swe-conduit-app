import { describe, expect, it } from 'vitest';
import { buildArticleQuery } from './articles';

describe('buildArticleQuery', () => {
  it('returns an empty string when no params are given', () => {
    expect(buildArticleQuery({})).toBe('');
  });

  it('includes only the provided filters', () => {
    expect(buildArticleQuery({ tag: 'react' })).toBe('?tag=react');
  });

  it('serializes tag, limit and offset together', () => {
    expect(buildArticleQuery({ tag: 'x', limit: 10, offset: 20 })).toBe(
      '?tag=x&limit=10&offset=20',
    );
  });

  it('includes offset=0 (a meaningful value) but omits undefined limit', () => {
    expect(buildArticleQuery({ offset: 0 })).toBe('?offset=0');
  });

  it('encodes author and favorited', () => {
    expect(buildArticleQuery({ author: 'jane doe' })).toBe('?author=jane+doe');
    expect(buildArticleQuery({ favorited: 'bob' })).toBe('?favorited=bob');
  });
});
