import type { Article } from '../api/types';
import ArticlePreview from './ArticlePreview';
import { Empty, ErrorState, Loading } from './StateMessage';

interface ArticleListProps {
  loading: boolean;
  error: string | null;
  articles: Article[] | null;
  emptyMessage?: string;
}

// Renders exactly one of four states from props: loading, error, empty, or the
// list of article previews. Pages feed it straight from useAsync.
export default function ArticleList({
  loading,
  error,
  articles,
  emptyMessage = 'No articles here.',
}: ArticleListProps) {
  if (loading) return <Loading what="Loading articles…" />;
  if (error) return <ErrorState message={error} resource="articles" />;
  if (!articles || articles.length === 0) return <Empty message={emptyMessage} />;

  return (
    <div className="article-list">
      {articles.map((article) => (
        <ArticlePreview key={article.slug} article={article} />
      ))}
    </div>
  );
}
