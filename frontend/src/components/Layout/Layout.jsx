// frontend/src/components/Layout/Layout.jsx
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import styles from './Layout.module.scss';

export default function Layout({ children }) {
  const { user, logout, isAdmin, isSeller } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path ? styles.active : '';

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={`container ${styles.headerInner}`}>
          <Link to="/" className={styles.logo}>
            <span className={styles.logoIcon}>◈</span>
            <span>ShopPWA</span>
          </Link>

          <nav className={styles.nav}>
            <Link to="/" className={`${styles.navLink} ${isActive('/')}`}>Товары</Link>
            {user && <Link to="/orders" className={`${styles.navLink} ${isActive('/orders')}`}>Заказы</Link>}
            {isAdmin() && <Link to="/admin" className={`${styles.navLink} ${isActive('/admin')}`}>Панель</Link>}
          </nav>

          <div className={styles.actions}>
            {user ? (
              <>
                <Link to="/profile" className={styles.userBadge}>
                  <span className={`badge badge--${user.role.toLowerCase()}`}>{user.role}</span>
                  <span className={styles.userName}>{user.first_name}</span>
                </Link>
                <button className={styles.logoutBtn} onClick={handleLogout}>Выйти</button>
              </>
            ) : (
              <>
                <Link to="/login" className={styles.navLink}>Войти</Link>
                <Link to="/register" className={styles.registerBtn}>Регистрация</Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className="container">{children}</div>
      </main>

      <footer className={styles.footer}>
        <div className="container">
          <p>© {new Date().getFullYear()} ShopPWA — Fullstack PWA Demo</p>
        </div>
      </footer>
    </div>
  );
}
