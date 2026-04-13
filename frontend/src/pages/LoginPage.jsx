// frontend/src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import styles from './AuthPage.module.scss';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const toast = useToastStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Добро пожаловать!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.logoMark}>◈</div>
          <h1 className={styles.title}>Войти</h1>
          <p className={styles.sub}>В аккаунт ShopPWA</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} name="email" type="email"
              value={form.email} onChange={handleChange}
              placeholder="you@example.com" required autoFocus />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <input className={styles.input} name="password" type="password"
              value={form.password} onChange={handleChange}
              placeholder="••••••••" required />
          </div>

          <button className={styles.submitBtn} disabled={loading}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className={styles.hint}>
          <p className={styles.hintText}>Демо-аккаунты:</p>
          <code>admin@shop.com / admin123</code><br />
          <code>seller@shop.com / seller123</code><br />
          <code>user@shop.com / user123</code>
        </div>

        <p className={styles.footer}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}
