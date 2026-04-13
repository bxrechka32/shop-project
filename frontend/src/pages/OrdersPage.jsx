// frontend/src/pages/OrdersPage.jsx
import { useState, useEffect } from 'react';
import api from '../utils/api';
import useToastStore from '../store/toastStore';
import styles from './OrdersPage.module.scss';

const STATUS_LABELS = {
  PENDING: 'Ожидает', PROCESSING: 'Обработка',
  SHIPPED: 'Отправлен', DELIVERED: 'Доставлен', CANCELLED: 'Отменён'
};
const STATUS_TYPES = {
  PENDING: 'info', PROCESSING: 'info', SHIPPED: 'info',
  DELIVERED: 'success', CANCELLED: 'error'
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToastStore();

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(data))
      .catch(() => toast.error('Не удалось загрузить заказы'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner" />;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Мои заказы</h1>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📦</div>
          <div className="empty-state__title">Заказов пока нет</div>
          <div className="empty-state__text">Добавьте товары в корзину и оформите заказ</div>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map((order) => (
            <div key={order.id} className={styles.order}>
              <div className={styles.orderHeader}>
                <div>
                  <span className={styles.orderId}>Заказ #{order.id}</span>
                  <span className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                  </span>
                </div>
                <div className={styles.orderRight}>
                  <span className={`badge badge--${STATUS_TYPES[order.status]}`}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span className={styles.total}>${order.total.toFixed(2)}</span>
                </div>
              </div>

              <div className={styles.items}>
                {order.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <img
                      src={item.product?.image || `https://picsum.photos/seed/${item.productId}/60/60`}
                      alt={item.product?.name}
                      className={styles.itemImg}
                    />
                    <div className={styles.itemInfo}>
                      <span className={styles.itemName}>{item.product?.name}</span>
                      <span className={styles.itemMeta}>×{item.quantity} · ${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
