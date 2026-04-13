// frontend/src/components/Notifications/ToastContainer.jsx
import useToastStore from '../../store/toastStore';
import styles from './ToastContainer.module.scss';

export default function ToastContainer() {
  const { toasts, remove } = useToastStore();

  return (
    <div className={styles.container}>
      {toasts.map((t) => (
        <div key={t.id} className={`${styles.toast} ${styles[t.type]}`}>
          <span className={styles.icon}>
            {t.type === 'success' ? '✓' : t.type === 'error' ? '✕' : 'ℹ'}
          </span>
          <span className={styles.message}>{t.message}</span>
          <button className={styles.close} onClick={() => remove(t.id)}>✕</button>
        </div>
      ))}
    </div>
  );
}
