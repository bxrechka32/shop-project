// frontend/src/App.jsx
import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import Layout from './components/Layout/Layout';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import ToastContainer from './components/Notifications/ToastContainer';

function ProtectedRoute({ children, roles }) {
  const { user, isLoading } = useAuthStore();
  if (isLoading) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<ProductsPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />
          <Route
            path="/orders"
            element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}
          />
          <Route
            path="/admin"
            element={<ProtectedRoute roles={['ADMIN']}><AdminPage /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
      <ToastContainer />
    </>
  );
}
