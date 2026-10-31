import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Products from './pages/Products';
import Plans from './pages/Plans';
import Quotations from './pages/Quotations';
import Subscriptions from './pages/Subscriptions';
import Invoices from './pages/Invoices';
import Payments from './pages/Payments';
import Discounts from './pages/Discounts';
import TaxRules from './pages/TaxRules';
import Staff from './pages/Staff';
import Settings from './pages/Settings';
import FinanceBento from './pages/FinanceBento';
import Packages from './pages/Packages';
import ResetPassword from './pages/ResetPassword';

// Customer Portal Pages
import MySubscriptions from './pages/MySubscriptions';
import MyInvoices from './pages/MyInvoices';
import MyPayments from './pages/MyPayments';

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // If customer tries to access admin route, redirect to customer portal
    if (role === 'customer') {
      return <Navigate to="/my-subscriptions" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return <Layout>{children}</Layout>;
}

export default function App() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            role === 'customer' ? (
              <Navigate to="/my-subscriptions" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Login />
          )
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? (
            role === 'customer' ? (
              <Navigate to="/my-subscriptions" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Register />
          )
        }
      />
      <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

      {/* Admin and Staff Shared Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Customers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Products />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plans"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Plans />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotations"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Quotations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Subscriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/invoices"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Invoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={['admin', 'staff']}>
            <Payments />
          </ProtectedRoute>
        }
      />

      {/* Admin Only Routes */}
      <Route
        path="/discounts"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Discounts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tax-rules"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <TaxRules />
          </ProtectedRoute>
        }
      />
      <Route
        path="/staff"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Staff />
          </ProtectedRoute>
        }
      />
      <Route
        path="/finance-bento"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <FinanceBento />
          </ProtectedRoute>
        }
      />

      {/* Customer Portal Routes */}
      <Route
        path="/packages"
        element={
          <ProtectedRoute allowedRoles={['customer', 'admin', 'staff']}>
            <Packages />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-subscriptions"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MySubscriptions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-invoices"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MyInvoices />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-payments"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <MyPayments />
          </ProtectedRoute>
        }
      />

      {/* Shared Profile / Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Catch-all redirect */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            role === 'customer' ? (
              <Navigate to="/my-subscriptions" replace />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

