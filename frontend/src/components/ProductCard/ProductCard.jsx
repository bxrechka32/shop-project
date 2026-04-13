// frontend/src/components/ProductCard/ProductCard.jsx
import { useState } from 'react';
import useAuthStore from '../../store/authStore';
import useToastStore from '../../store/toastStore';
import api from '../../utils/api';
import styles from './ProductCard.module.scss';

export default function ProductCard({ product, onDelete, onEdit, onAddToCart }) {
  const { user, isAdmin } = useAuthStore();
  const toast = useToastStore();
  const [adding, setAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!user) { toast.error('Войдите, чтобы добавить в корзину'); return; }
    setAdding(true);
    setTimeout(() => {
      setAdding(false);
      toast.success(`«${product.name}» добавлен в корзину`);
      if (onAddToCart) onAddToCart(product);
    }, 500);
  };

  const handleDelete = async () => {
    if (!confirm(`Удалить «${product.name}»?`)) return;
    try {
      await api.delete(`/products/${product.id}`);
      toast.success('Товар удалён');
      if (onDelete) onDelete(product.id);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка удаления');
    }
  };

  const canEdit = user && ['SELLER', 'ADMIN'].includes(user.role);
  const canDelete = isAdmin();

  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <img
          src={product.image || `https://picsum.photos/seed/${product.id}/400/300`}
          alt={product.name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.imageOverlay} />
        <span className={styles.priceBadge}>${product.price.toFixed(2)}</span>
      </div>

      <div className={styles.body}>
        <h3 className={styles.name}>{product.name}</h3>
        <p className={styles.description}>{product.description}</p>

        {product.seller && (
          <p className={styles.seller}>
            <span className={styles.sellerLabel}>Продавец:</span>
            {product.seller.first_name} {product.seller.last_name}
          </p>
        )}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.cartBtn}
          onClick={handleAddToCart}
          disabled={adding}
        >
          {adding ? '...' : '+ В корзину'}
        </button>

        {canEdit && (
          <button className={styles.editBtn} onClick={() => onEdit && onEdit(product)}>
            ✏️
          </button>
        )}
        {canDelete && (
          <button className={styles.deleteBtn} onClick={handleDelete}>
            🗑️
          </button>
        )}
      </div>
    </article>
  );
}
