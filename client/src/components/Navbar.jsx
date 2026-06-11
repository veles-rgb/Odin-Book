import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { useAuthContext } from '../hooks/useAuthContext';
import { useLogout } from '../hooks/useLogout';
import { useApiFetch } from '../hooks/useApiFetch';
import styles from './styles/Navbar.module.css';

import { FaRegBell, FaSearch } from 'react-icons/fa';
import ActivityModal from './ActivityModal';

const Navbar = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();
  const { apiFetch } = useApiFetch();

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [receivedRequestCount, setReceivedRequestCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setReceivedRequestCount(0);
      return;
    }

    const fetchReceivedRequestCount = async () => {
      try {
        const response = await apiFetch('/api/follow/requests/received');

        if (!response) return;

        const data = await response.json();

        if (!response.ok) return;

        setReceivedRequestCount(data.received_follow_requests?.length || 0);
      } catch {
        setReceivedRequestCount(0);
      }
    };

    fetchReceivedRequestCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const handleActivityToggle = () => {
    setShowActivityModal((prev) => !prev);
  };

  const handleCloseActivity = () => {
    setShowActivityModal(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoLink}>
          <h1 className={styles.logo}>Vel</h1>
        </Link>

        <nav className={styles.nav}>
          {!user && (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginLink}>
                Login
              </Link>

              <Link to="/register" className={styles.registerLink}>
                Register
              </Link>
            </div>
          )}

          {user && (
            <div className={styles.userMenu}>
              <FaSearch
                className={styles.searchButton}
                onClick={() => navigate('/search')}
              />

              <div className={styles.activityWrapper}>
                <button
                  type="button"
                  className={styles.activityButton}
                  onClick={handleActivityToggle}
                  aria-label="Open activity"
                >
                  <FaRegBell className={styles.activityBell} />

                  {receivedRequestCount > 0 && (
                    <span className={styles.notificationCount}>
                      {receivedRequestCount}
                    </span>
                  )}
                </button>

                {showActivityModal && (
                  <ActivityModal
                    onClose={handleCloseActivity}
                    onReceivedCountChange={setReceivedRequestCount}
                  />
                )}
              </div>

              <Link
                to={`/profile/${user.username}`}
                className={styles.profileLink}
              >
                <span className={styles.username}>@{user.username}</span>

                <img
                  src={
                    user.profile_picture_url ||
                    'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                  }
                  alt={`${user.username}'s profile`}
                  className={styles.avatar}
                />
              </Link>

              <button
                type="button"
                className={styles.logoutButton}
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
