import { Link, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <>
      <header className="site-header">
        <div className="container">
          <Link to="/" className="brand">
            conduit
          </Link>
          <span className="tagline">read-only</span>
        </div>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/profile/:username" element={<ProfilePage />} />
          <Route path="*" element={<p className="state state-empty">Page not found.</p>} />
        </Routes>
      </main>
    </>
  );
}
