import { Link } from 'react-router-dom';
import type { Article } from '../api/types';
import { formatDate } from '../lib/format';

// A single article card in a list: author line, title, description, tag pills,
// and the (read-only) favorites count.
export default function ArticlePreview({ article }: { article: Article }) {
  const { author } = article;
  return (
    <article className="article-preview">
      <div className="article-meta">
        <Link to={`/profile/${encodeURIComponent(author.username)}`} className="author">
          {author.image && <img src={author.image} alt="" className="avatar" />}
          <span>{author.username}</span>
        </Link>
        <span className="date">{formatDate(article.createdAt)}</span>
        <span className="favorites" aria-label="favorites count">
          ♥ {article.favoritesCount}
        </span>
      </div>

      <Link to={`/article/${encodeURIComponent(article.slug)}`} className="preview-link">
        <h2>{article.title}</h2>
        <p>{article.description}</p>
      </Link>

      {article.tagList.length > 0 && (
        <ul className="tag-list">
          {article.tagList.map((tag) => (
            <li key={tag} className="tag-pill">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
