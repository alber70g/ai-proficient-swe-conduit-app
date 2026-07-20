import { Link, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { getArticle, getComments } from '../api/articles';
import { useAsync } from '../hooks/useAsync';
import { formatDate } from '../lib/format';
import { Empty, ErrorState, Loading } from '../components/StateMessage';

function AuthorLine({
  username,
  image,
  date,
}: {
  username: string;
  image: string | null;
  date: string;
}) {
  return (
    <div className="article-meta">
      <Link to={`/profile/${encodeURIComponent(username)}`} className="author">
        {image && <img src={image} alt="" className="avatar" />}
        <span>{username}</span>
      </Link>
      <span className="date">{formatDate(date)}</span>
    </div>
  );
}

export default function ArticlePage() {
  const { slug = '' } = useParams();

  // Both effects run on mount → article and comments fetch concurrently.
  const articleState = useAsync(() => getArticle(slug), [slug]);
  const commentsState = useAsync(() => getComments(slug), [slug]);

  if (articleState.loading) return <Loading what="Loading article…" />;
  if (articleState.error)
    return <ErrorState message={articleState.error} resource="this article" />;
  if (!articleState.data) return <Empty message="Article not found." />;

  const article = articleState.data.article;
  const comments = commentsState.data?.comments ?? [];

  return (
    <article className="article-page">
      <header className="article-header">
        <h1>{article.title}</h1>
        <AuthorLine
          username={article.author.username}
          image={article.author.image}
          date={article.createdAt}
        />
      </header>

      <div className="article-body">
        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{article.body}</ReactMarkdown>
      </div>

      {article.tagList.length > 0 && (
        <ul className="tag-list">
          {article.tagList.map((tag) => (
            <li key={tag} className="tag-pill">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <section className="comments" aria-label="comments">
        <h2>Comments</h2>
        {commentsState.loading && <Loading what="Loading comments…" />}
        {commentsState.error && (
          <ErrorState message={commentsState.error} resource="comments" />
        )}
        {!commentsState.loading && !commentsState.error && comments.length === 0 && (
          <Empty message="No comments yet." />
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="comment-card">
            <div className="comment-body">{comment.body}</div>
            <AuthorLine
              username={comment.author.username}
              image={comment.author.image}
              date={comment.createdAt}
            />
          </div>
        ))}
      </section>
    </article>
  );
}
