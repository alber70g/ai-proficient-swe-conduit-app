import { useSearchParams, useParams } from 'react-router-dom';
import { getArticles } from '../api/articles';
import { getProfile } from '../api/profiles';
import { useAsync } from '../hooks/useAsync';
import ArticleList from '../components/ArticleList';
import { ErrorState, Loading } from '../components/StateMessage';

type Tab = 'author' | 'favorited';

export default function ProfilePage() {
  const { username = '' } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'favorited' ? 'favorited' : 'author';

  const profileState = useAsync(() => getProfile(username), [username]);
  const articlesState = useAsync(
    () =>
      getArticles(tab === 'favorited' ? { favorited: username } : { author: username }),
    [username, tab],
  );

  const selectTab = (next: Tab) => {
    setSearchParams(next === 'favorited' ? { tab: 'favorited' } : {});
  };

  if (profileState.loading) return <Loading what="Loading profile…" />;
  if (profileState.error)
    return <ErrorState message={profileState.error} resource="this profile" />;

  const profile = profileState.data?.profile;

  return (
    <div className="profile-page">
      <header className="profile-header">
        {profile?.image && <img src={profile.image} alt="" className="avatar-lg" />}
        <h1>{profile?.username ?? username}</h1>
        {profile?.bio && <p className="bio">{profile.bio}</p>}
      </header>

      <nav className="tabs" aria-label="profile articles">
        <button
          type="button"
          className={tab === 'author' ? 'tab active' : 'tab'}
          aria-current={tab === 'author' ? 'true' : undefined}
          onClick={() => selectTab('author')}
        >
          My Articles
        </button>
        <button
          type="button"
          className={tab === 'favorited' ? 'tab active' : 'tab'}
          aria-current={tab === 'favorited' ? 'true' : undefined}
          onClick={() => selectTab('favorited')}
        >
          Favorited Articles
        </button>
      </nav>

      <ArticleList
        loading={articlesState.loading}
        error={articlesState.error}
        articles={articlesState.data?.articles ?? null}
        emptyMessage={
          tab === 'favorited'
            ? 'No favorited articles.'
            : 'No articles published yet.'
        }
      />
    </div>
  );
}
