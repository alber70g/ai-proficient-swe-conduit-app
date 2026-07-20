import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ArticleList from './ArticleList';
import type { Article } from '../api/types';

const article: Article = {
  slug: 'hello-world',
  title: 'Hello World',
  description: 'A first post',
  body: '# hi',
  tagList: ['intro'],
  createdAt: '2026-07-02T10:00:00.000Z',
  updatedAt: '2026-07-02T10:00:00.000Z',
  favorited: false,
  favoritesCount: 3,
  author: { username: 'demo', bio: null, image: null, following: false },
};

function renderList(props: Parameters<typeof ArticleList>[0]) {
  return render(
    <MemoryRouter>
      <ArticleList {...props} />
    </MemoryRouter>,
  );
}

describe('ArticleList', () => {
  it('renders the loading state', () => {
    renderList({ loading: true, error: null, articles: null });
    expect(screen.getByText('Loading articles…')).toBeInTheDocument();
  });

  it('renders the error state with the message', () => {
    renderList({ loading: false, error: 'boom', articles: null });
    expect(screen.getByRole('alert')).toHaveTextContent('boom');
  });

  it('renders the empty state', () => {
    renderList({ loading: false, error: null, articles: [] });
    expect(screen.getByText('No articles here.')).toBeInTheDocument();
  });

  it('renders each article in the list state', () => {
    renderList({ loading: false, error: null, articles: [article] });
    expect(screen.getByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
    expect(screen.getByText('A first post')).toBeInTheDocument();
    expect(screen.getByText('intro')).toBeInTheDocument();
  });
});
