// frontend/src/components/ProductForm/ProductForm.jsx
import { useState, useEffect } from 'react';
import api from '../../utils/api';
import useToastStore from '../../store/toastStore';
import styles from './ProductForm.module.scss';

export default function ProductForm({ product, onSuccess, onCancel }) {
  const toast = useToastStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    publishAt: '',
  });

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        image: product.image || '',
        publishAt: product.publishAt ? new Date(product.publishAt).toISOString().slice(0, 16) : '',
      });
    }
  }, [product]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, price: parseFloat(form.price) };
      if (!payload.publishAt) delete payload.publishAt;

      if (product?.id) {
        await api.put(`/products/${product.id}`, payload);
        toast.success('Товар обновлён');
      } else {
        await api.post('/products', payload);
        toast.success('Товар создан');
      }
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Ошибка сохранения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            {product?.id ? 'Редактировать товар' : 'Новый товар'}
          </h2>
          <button className={styles.closeBtn} onClick={onCancel}>✕</button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label}>Название *</label>
            <input
              className={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Название товара"
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Описание *</label>
            <textarea
              className={styles.textarea}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Описание товара"
              rows={3}
              required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.label}>Цена ($) *</label>
              <input
                className={styles.input}
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                required
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Дата публикации</label>
              <input
                className={styles.input}
                name="publishAt"
                type="datetime-local"
                value={form.publishAt}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Ссылка на изображение</label>
            <input
              className={styles.input}
              name="image"
              value={form.image}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          {form.image && (
            <img src={form.image} alt="preview" className={styles.preview} />
          )}

          <div className={styles.actions}>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Отмена
            </button>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
