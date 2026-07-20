import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getArticles } from '../api/articles';
import { getTags } from '../api/tags';
import { useAsync } from '../hooks/useAsync';
import ArticleList from '../components/ArticleList';
import Pagination, { PAGE_SIZE } from '../components/Pagination';
import TagList from '../components/TagList';

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tag = searchParams.get('tag') ?? undefined;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const articlesState = useAsync(
    () => getArticles({ tag, limit: PAGE_SIZE, offset }),
    [tag, offset],
  );
  const tagsState = useAsync(() => getTags(), []);

  const setTag = useCallback(
    (next: string) => {
      // Toggle the tag off if it's already active; always reset to page 1.
      const params: Record<string, string> = {};
      if (next !== tag) params.tag = next;
      setSearchParams(params);
    },
    [tag, setSearchParams],
  );

  const setPage = useCallback(
    (next: number) => {
      const params: Record<string, string> = {};
      if (tag) params.tag = tag;
      if (next > 1) params.page = String(next);
      setSearchParams(params);
    },
    [tag, setSearchParams],
  );

  const heading = useMemo(() => (tag ? `#${tag}` : 'Global Feed'), [tag]);

  return (
    <div className="home">
      <div className="home-main">
        <h1 className="feed-heading">{heading}</h1>
        <ArticleList
          loading={articlesState.loading}
          error={articlesState.error}
          articles={articlesState.data?.articles ?? null}
          emptyMessage={
            tag ? `No articles tagged “${tag}”.` : 'No articles here yet.'
          }
        />
        {articlesState.data && (
          <Pagination
            articlesCount={articlesState.data.articlesCount}
            currentPage={page}
            onPageChange={setPage}
          />
        )}
      </div>

      <aside className="home-sidebar">
        {tagsState.data && (
          <TagList tags={tagsState.data.tags} activeTag={tag} onSelect={setTag} />
        )}
      </aside>
    </div>
  );
}
