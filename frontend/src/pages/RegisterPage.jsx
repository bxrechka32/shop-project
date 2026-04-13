// frontend/src/pages/RegisterPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import styles from './AuthPage.module.scss';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', first_name: '', last_name: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const toast = useToastStore();
  const navigate = useNavigate();

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Аккаунт создан!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.logoMark}>◈</div>
          <h1 className={styles.title}>Регистрация</h1>
          <p className={styles.sub}>Создайте аккаунт ShopPWA</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Имя</label>
              <input className={styles.input} name="first_name" value={form.first_name}
                onChange={handleChange} placeholder="Иван" required />
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Фамилия</label>
              <input className={styles.input} name="last_name" value={form.last_name}
                onChange={handleChange} placeholder="Иванов" required />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} name="email" type="email" value={form.email}
              onChange={handleChange} placeholder="you@example.com" required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Пароль</label>
            <input className={styles.input} name="password" type="password" value={form.password}
              onChange={handleChange} placeholder="Минимум 6 символов" minLength={6} required />
          </div>

          <button className={styles.submitBtn} disabled={loading}>
            {loading ? 'Создание...' : 'Создать аккаунт'}
          </button>
        </form>

        <p className={styles.footer}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}
