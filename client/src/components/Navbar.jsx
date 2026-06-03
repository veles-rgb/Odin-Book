import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { useLogout } from '../hooks/useLogout';
import styles from './styles/Navbar.module.css';

const Navbar = () => {
  const { user } = useAuthContext();
  const { logout } = useLogout();

  const handleClick = () => {
    logout();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/" className={styles.logoLink}>
          <h1 className={styles.logo}>Vel</h1>
        </Link>

        <nav>
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
              <span className={styles.username}>{user.username}</span>

              <img
                src={
                  user.profile_picture_url ||
                  'https://static.vecteezy.com/system/resources/thumbnails/009/292/244/small/default-avatar-icon-of-social-media-user-vector.jpg'
                }
                alt="profile"
                className={styles.avatar}
              />

              <button className={styles.logoutButton} onClick={handleClick}>
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
