// frontend/src/pages/ProductsPage.jsx
import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import useToastStore from '../store/toastStore';
import { useSocketNotifications } from '../hooks/useSocket';
import ProductCard from '../components/ProductCard/ProductCard';
import ProductForm from '../components/ProductForm/ProductForm';
import styles from './ProductsPage.module.scss';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);

  const { user, isSeller } = useAuthStore();
  const toast = useToastStore();

  const fetchProducts = useCallback(async () => {
    try {
      const { data } = await api.get('/products');
      setProducts(data.data || data);
    } catch (err) {
      toast.error('Не удалось загрузить товары');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Real-time WebSocket notifications
  useSocketNotifications(useCallback((product) => {
    setProducts((prev) => [product, ...prev]);
  }, []));

  const handleDelete = (id) => setProducts((p) => p.filter((x) => x.id !== id));
  const handleEdit = (product) => { setEditProduct(product); setShowForm(true); };
  const handleFormSuccess = () => { setShowForm(false); setEditProduct(null); fetchProducts(); };
  const handleAddToCart = (product) => setCart((c) => [...c, product]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <h1 className={styles.heroTitle}>
          Каталог <span className={styles.accent}>товаров</span>
        </h1>
        <p className={styles.heroSub}>
          {products.length} позиций · обновляется в реальном времени
        </p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>⌕</span>
          <input
            className={styles.search}
            placeholder="Поиск по названию..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className={styles.toolbarRight}>
          {cart.length > 0 && (
            <button
              className={styles.cartIndicator}
              onClick={() => toast.info(`В корзине ${cart.length} товаров`)}
            >
              🛒 {cart.length}
            </button>
          )}
          {isSeller() && (
            <button
              className={styles.addBtn}
              onClick={() => { setEditProduct(null); setShowForm(true); }}
            >
              + Добавить товар
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="spinner" />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">◈</div>
          <div className="empty-state__title">Товары не найдены</div>
          <div className="empty-state__text">Попробуйте изменить параметры поиска</div>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm
          product={editProduct}
          onSuccess={handleFormSuccess}
          onCancel={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}
    </div>
  );
}
