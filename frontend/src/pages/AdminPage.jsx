// frontend/src/pages/AdminPage.jsx
import { useState, useEffect } from 'react';
import api from '../utils/api';
import useToastStore from '../store/toastStore';
import styles from './AdminPage.module.scss';

const TABS = ['Пользователи', 'Товары', 'Заказы', 'Логи'];
const ROLES = ['USER', 'SELLER', 'ADMIN'];

export default function AdminPage() {
  const [tab, setTab] = useState(0);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const toast = useToastStore();

  useEffect(() => {
    loadTab(tab);
  }, [tab]);

  async function loadTab(t) {
    setLoading(true);
    try {
      if (t === 0) { const { data } = await api.get('/users'); setUsers(data); }
      if (t === 1) { const { data } = await api.get('/products'); setProducts(data.data || data); }
      if (t === 2) { const { data } = await api.get('/orders'); setOrders(data); }
      if (t === 3) { const { data } = await api.get('/users/logs'); setLogs(data); }
    } catch (err) {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/users/${userId}`, { role });
      setUsers((u) => u.map((x) => x.id === userId ? { ...x, role } : x));
      toast.success('Роль обновлена');
    } catch { toast.error('Ошибка обновления роли'); }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('Удалить пользователя?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers((u) => u.filter((x) => x.id !== id));
      toast.success('Пользователь удалён');
    } catch { toast.error('Ошибка удаления'); }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders((o) => o.map((x) => x.id === id ? { ...x, status } : x));
      toast.success('Статус обновлён');
    } catch { toast.error('Ошибка'); }
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Панель администратора</h1>

      <div className={styles.tabs}>
        {TABS.map((name, i) => (
          <button key={i} className={`${styles.tab} ${tab === i ? styles.active : ''}`} onClick={() => setTab(i)}>
            {name}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : (
        <div className={styles.content}>
          {tab === 0 && (
            <table className={styles.table}>
              <thead><tr><th>ID</th><th>Имя</th><th>Email</th><th>Роль</th><th>Действия</th></tr></thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className={styles.muted}>#{u.id}</td>
                    <td>{u.first_name} {u.last_name}</td>
                    <td className={styles.muted}>{u.email}</td>
                    <td>
                      <select className={styles.select} value={u.role} onChange={(e) => handleRoleChange(u.id, e.target.value)}>
                        {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className={styles.dangerBtn} onClick={() => handleDeleteUser(u.id)}>Удалить</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 1 && (
            <table className={styles.table}>
              <thead><tr><th>ID</th><th>Название</th><th>Цена</th><th>Продавец</th><th>Создан</th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className={styles.muted}>#{p.id}</td>
                    <td>{p.name}</td>
                    <td className={styles.price}>${p.price.toFixed(2)}</td>
                    <td className={styles.muted}>{p.seller?.email || '—'}</td>
                    <td className={styles.muted}>{new Date(p.createdAt).toLocaleDateString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 2 && (
            <table className={styles.table}>
              <thead><tr><th>ID</th><th>Пользователь</th><th>Сумма</th><th>Статус</th><th>Дата</th></tr></thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className={styles.muted}>#{o.id}</td>
                    <td>{o.user?.email}</td>
                    <td className={styles.price}>${o.total.toFixed(2)}</td>
                    <td>
                      <select className={styles.select} value={o.status}
                        onChange={(e) => handleOrderStatus(o.id, e.target.value)}>
                        {['PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map((s) =>
                          <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className={styles.muted}>{new Date(o.createdAt).toLocaleDateString('ru-RU')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {tab === 3 && (
            <div className={styles.logs}>
              {logs.map((log) => (
                <div key={log._id} className={styles.logEntry}>
                  <span className={styles.logAction}>{log.action}</span>
                  <span className={styles.logResource}>{log.resource}</span>
                  <span className={styles.logUser}>{log.userEmail}</span>
                  <span className={styles.logTime}>{new Date(log.timestamp).toLocaleString('ru-RU')}</span>
                  <span className={`badge badge--${log.details?.statusCode < 400 ? 'success' : 'error'}`}>
                    {log.details?.statusCode}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
