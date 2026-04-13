// frontend/src/pages/ProfilePage.jsx
import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { subscribeToPush } from '../utils/push';
import styles from './ProfilePage.module.scss';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const toast = useToastStore();
  const [pushStatus, setPushStatus] = useState('unknown');

  useEffect(() => {
    if ('Notification' in window) {
      setPushStatus(Notification.permission);
    }
  }, []);

  const handlePushSubscribe = async () => {
    try {
      const perm = await Notification.requestPermission();
      setPushStatus(perm);
      if (perm === 'granted') {
        const sub = await subscribeToPush();
        if (sub) toast.success('Push-уведомления включены');
        else toast.error('Не удалось подписаться на уведомления');
      }
    } catch (err) {
      toast.error('Ошибка подписки');
    }
  };

  if (!user) return null;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Профиль</h1>

      <div className={styles.card}>
        <div className={styles.avatar}>
          {user.first_name[0]}{user.last_name[0]}
        </div>
        <div className={styles.info}>
          <h2 className={styles.name}>{user.first_name} {user.last_name}</h2>
          <p className={styles.email}>{user.email}</p>
          <span className={`badge badge--${user.role.toLowerCase()}`}>{user.role}</span>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Push-уведомления</h3>
        <div className={styles.pushCard}>
          <div>
            <p className={styles.pushDesc}>
              Получайте уведомления о новых товарах в реальном времени
            </p>
            <p className={styles.pushStatus}>
              Статус: <strong className={pushStatus === 'granted' ? styles.granted : styles.denied}>
                {pushStatus === 'granted' ? 'Включены' : pushStatus === 'denied' ? 'Запрещены' : 'Не настроены'}
              </strong>
            </p>
          </div>
          {pushStatus !== 'granted' && pushStatus !== 'denied' && (
            <button className={styles.pushBtn} onClick={handlePushSubscribe}>
              🔔 Подписаться
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
