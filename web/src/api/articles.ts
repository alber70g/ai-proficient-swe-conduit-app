import { request } from './client';
import type {
  ArticleQuery,
  ArticleResponse,
  ArticlesResponse,
  CommentsResponse,
} from './types';

// Build a query string from the article filters, omitting empty/undefined
// params so the backend's `'x' in query` presence checks behave predictably.
// Exported for unit testing.
export function buildArticleQuery(params: ArticleQuery): string {
  const search = new URLSearchParams();
  if (params.tag) search.set('tag', params.tag);
  if (params.author) search.set('author', params.author);
  if (params.favorited) search.set('favorited', params.favorited);
  if (params.limit !== undefined) search.set('limit', String(params.limit));
  if (params.offset !== undefined) search.set('offset', String(params.offset));
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export function getArticles(params: ArticleQuery = {}): Promise<ArticlesResponse> {
  return request<ArticlesResponse>(`/articles${buildArticleQuery(params)}`);
}

export function getArticle(slug: string): Promise<ArticleResponse> {
  return request<ArticleResponse>(`/articles/${encodeURIComponent(slug)}`);
}

export function getComments(slug: string): Promise<CommentsResponse> {
  return request<CommentsResponse>(`/articles/${encodeURIComponent(slug)}/comments`);
}
