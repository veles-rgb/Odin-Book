import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApiFetch } from '../hooks/useApiFetch';
import styles from './styles/UserIndex.module.css';

const UserIndex = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const { apiFetch } = useApiFetch();

  useEffect(() => {
    if (!searchTerm.trim()) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUsers([]);
      setError(null);
      return;
    }

    const fetchSearch = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiFetch(
          `/api/user?search=${encodeURIComponent(searchTerm)}`,
        );

        if (!response) return;

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || data.message);
          return;
        }

        setUsers(data.users || []);
      } catch {
        setError('Something went wrong.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  return (
    <div className={styles.userIndexMain}>
      <section className={styles.searchCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Find Users</h1>
          <p className={styles.subtitle}>
            Search by username, first name, or last name.
          </p>
        </div>

        <form
          className={styles.searchForm}
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className={styles.searchInput}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for a user..."
            autoComplete="off"
          />
        </form>

        <div className={styles.resultsArea}>
          {isLoading && <div className={styles.status}>Searching...</div>}

          {error && <div className={styles.error}>{error}</div>}

          {!isLoading && !error && !searchTerm.trim() && (
            <div className={styles.emptyState}>
              Start typing to search for users.
            </div>
          )}

          {!isLoading && !error && searchTerm.trim() && users.length === 0 && (
            <div className={styles.emptyState}>No users found.</div>
          )}

          {!isLoading && !error && users.length > 0 && (
            <div className={styles.userList}>
              {users.map((user) => (
                <Link
                  to={`/profile/${user.username}`}
                  className={styles.userCard}
                  key={user.id}
                >
                  <img
                    className={styles.avatar}
                    src={
                      user.profile_picture_url ||
                      'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                    }
                    alt={`${user.username}'s profile`}
                  />

                  <div className={styles.userInfo}>
                    <div className={styles.displayName}>
                      {user.first_name} {user.last_name}
                    </div>

                    <div className={styles.username}>@{user.username}</div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserIndex;
