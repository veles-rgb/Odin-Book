import { Link } from 'react-router-dom';
import { useAuthContext } from '../hooks/useAuthContext';
import { useLogout } from '../hooks/useLogout';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { authUser } = useAuthContext();
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
          {!authUser && (
            <div className={styles.authLinks}>
              <Link to="/login" className={styles.loginLink}>
                Login
              </Link>

              <Link to="/register" className={styles.registerLink}>
                Register
              </Link>
            </div>
          )}

          {authUser && (
            <div className={styles.userMenu}>
              <span className={styles.username}>{authUser.username}</span>

              {authUser.profile_picture_url && (
                <img
                  src={authUser.profile_picture_url}
                  alt="profile"
                  className={styles.avatar}
                />
              )}

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
