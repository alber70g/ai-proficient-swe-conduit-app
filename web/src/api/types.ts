// DTOs transcribed from the backend mappers (verified against source):
//   - article.mapper.ts / author.mapper.ts
//   - profile.utils.ts (profileMapper)
//   - the inline comment mapper in article.service.ts (getCommentsByArticle)
//
// GET responses do NOT include `id`/`authorId` on the article object.
// Dates are ISO 8601 strings over the wire. `favorited`/`following` are
// always `false` for anonymous (no-token) requests, which is all we make.

export interface Author {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
}

// The embedded profile object is identical in shape to an article/comment author.
export type Profile = Author;

export interface Article {
  slug: string;
  title: string;
  description: string;
  body: string;
  tagList: string[];
  createdAt: string;
  updatedAt: string;
  favorited: boolean;
  favoritesCount: number;
  author: Author;
}

export interface Comment {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: Author;
}

// Response envelopes returned by the endpoints.
export interface ArticlesResponse {
  articles: Article[];
  articlesCount: number;
}

export interface ArticleResponse {
  article: Article;
}

export interface CommentsResponse {
  comments: Comment[];
}

export interface ProfileResponse {
  profile: Profile;
}

export interface TagsResponse {
  tags: string[];
}

// Query params accepted by GET /api/articles. All optional and independent;
// the backend defaults limit=10, offset=0.
export interface ArticleQuery {
  tag?: string;
  author?: string;
  favorited?: string;
  limit?: number;
  offset?: number;
}
