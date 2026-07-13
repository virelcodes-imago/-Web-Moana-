import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import CartDrawer from './components/cart/CartDrawer';
import WhatsAppFloat from './components/layout/WhatsAppFloat';

// Public pages
import HomePage from './pages/public/HomePage';
import PaquetesPage from './pages/public/PaquetesPage';
import PaqueteDetallePage from './pages/public/PaqueteDetallePage';
import PosadaPage from './pages/public/PosadaPage';
import NosotrosPage from './pages/public/NosotrosPage';
import ContactoPage from './pages/public/ContactoPage';

// Admin pages
import LoginPage from './pages/admin/LoginPage';
import AdminPreciosPage from './pages/admin/AdminPreciosPage';
import VendedorCotizadorPage from './pages/admin/VendedorCotizadorPage';

import useAuthStore from './store/authStore';

// Protected route wrapper
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/admin" replace />;
  if (requiredRole && role !== requiredRole && role !== 'admin') return <Navigate to="/admin/cotizador" replace />;
  return children;
}

// Layout wrapper for public pages
function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <WhatsAppFloat />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/paquetes" element={<PublicLayout><PaquetesPage /></PublicLayout>} />
      <Route path="/paquetes/:slug" element={<PublicLayout><PaqueteDetallePage /></PublicLayout>} />
      <Route path="/posada" element={<PublicLayout><PosadaPage /></PublicLayout>} />
      <Route path="/nosotros" element={<PublicLayout><NosotrosPage /></PublicLayout>} />
      <Route path="/contacto" element={<PublicLayout><ContactoPage /></PublicLayout>} />

      {/* Admin routes */}
      <Route path="/admin" element={<LoginPage />} />
      <Route
        path="/admin/precios"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminPreciosPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/cotizador"
        element={
          <ProtectedRoute>
            <VendedorCotizadorPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
