export const PAGE_SIZE = 10;

interface PaginationProps {
  articlesCount: number;
  currentPage: number; // 1-based
  onPageChange: (page: number) => void;
}

// Simple numbered pager derived from the total count and a fixed page size.
// Renders nothing when everything fits on one page.
export default function Pagination({
  articlesCount,
  currentPage,
  onPageChange,
}: PaginationProps) {
  const pageCount = Math.ceil(articlesCount / PAGE_SIZE);
  if (pageCount <= 1) return null;

  const pages = Array.from({ length: pageCount }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="pagination">
      {pages.map((page) => (
        <button
          key={page}
          type="button"
          className={page === currentPage ? 'page active' : 'page'}
          aria-current={page === currentPage ? 'page' : undefined}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </nav>
  );
}
