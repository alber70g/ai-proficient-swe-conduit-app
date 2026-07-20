import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import HomePage from './HomePage';
import ArticlePage from './ArticlePage';
import ProfilePage from './ProfilePage';
import type { Article } from '../api/types';

vi.mock('../api/articles');
vi.mock('../api/tags');
vi.mock('../api/profiles');

import { getArticles, getArticle, getComments } from '../api/articles';
import { getTags } from '../api/tags';
import { getProfile } from '../api/profiles';

const article: Article = {
  slug: 'hello-world',
  title: 'Hello World',
  description: 'A first post',
  body: '# Heading\n\nBody text.',
  tagList: ['intro'],
  createdAt: '2026-07-02T10:00:00.000Z',
  updatedAt: '2026-07-02T10:00:00.000Z',
  favorited: false,
  favoritesCount: 3,
  author: { username: 'demo', bio: 'hi', image: null, following: false },
};

afterEach(() => vi.clearAllMocks());

describe('HomePage', () => {
  it('renders the feed and popular tags', async () => {
    vi.mocked(getArticles).mockResolvedValue({ articles: [article], articlesCount: 1 });
    vi.mocked(getTags).mockResolvedValue({ tags: ['intro', 'react'] });

    render(
      <MemoryRouter initialEntries={['/']}>
        <HomePage />
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'Hello World' })).toBeInTheDocument();
    expect(screen.getByText('Popular Tags')).toBeInTheDocument();
    expect(screen.getByText('Global Feed')).toBeInTheDocument();
  });
});

describe('ArticlePage', () => {
  it('renders the markdown body and its comments', async () => {
    vi.mocked(getArticle).mockResolvedValue({ article });
    vi.mocked(getComments).mockResolvedValue({
      comments: [
        {
          id: 1,
          body: 'Nice post!',
          createdAt: '2026-07-02T11:00:00.000Z',
          updatedAt: '2026-07-02T11:00:00.000Z',
          author: { username: 'reader', bio: null, image: null, following: false },
        },
      ],
    });

    render(
      <MemoryRouter initialEntries={['/article/hello-world']}>
        <Routes>
          <Route path="/article/:slug" element={<ArticlePage />} />
        </Routes>
      </MemoryRouter>,
    );

    // Markdown "# Heading" renders as an <h1>.
    expect(await screen.findByRole('heading', { name: 'Heading' })).toBeInTheDocument();
    expect(screen.getByText('Nice post!')).toBeInTheDocument();
  });
});

describe('ProfilePage', () => {
  it('renders the profile and its author articles by default', async () => {
    vi.mocked(getProfile).mockResolvedValue({
      profile: { username: 'demo', bio: 'hi', image: null, following: false },
    });
    vi.mocked(getArticles).mockResolvedValue({ articles: [article], articlesCount: 1 });

    render(
      <MemoryRouter initialEntries={['/profile/demo']}>
        <Routes>
          <Route path="/profile/:username" element={<ProfilePage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByRole('heading', { name: 'demo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'My Articles' })).toBeInTheDocument();
    // The default "author" tab requests articles by author.
    await waitFor(() => expect(getArticles).toHaveBeenCalledWith({ author: 'demo' }));
  });
});
