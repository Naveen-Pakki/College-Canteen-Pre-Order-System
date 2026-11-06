import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Pages
import { Login } from '../pages/Login';
import { Home } from '../pages/Home';
import { Menu } from '../pages/Menu';
import { Cart } from '../pages/Cart';
import { Checkout } from '../pages/Checkout';
import { Orders } from '../pages/Orders';
import { Ticket } from '../pages/Ticket';
import { Profile } from '../pages/Profile';

// Admin Pages
import { AdminDashboard } from '../admin/AdminDashboard';
import { TodaysFood } from '../admin/TodaysFood';
import { ManageMenu } from '../admin/ManageMenu';
import { ManageOrders } from '../admin/ManageOrders';
import { ChefPreparation } from '../admin/ChefPreparation';
import { AdminSettings } from '../admin/AdminSettings';

export const AppRoutes = () => {
  const { currentUser } = useAuth();

  return (
    <Routes>
      {/* Starting Page is strictly the LOGIN PAGE when not logged in */}
      <Route
        path="/"
        element={
          currentUser ? (
            currentUser.role === 'ADMIN' ? (
              <Navigate to="/admin/dashboard" replace />
            ) : (
              <Navigate to="/home" replace />
            )
          ) : (
            <Login />
          )
        }
      />

      <Route path="/login" element={<Login />} />

      {/* Unified User Portal: Student & Faculty have the EXACT same experience */}
      <Route path="/home" element={<Home />} />
      <Route path="/menu" element={<Menu />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/orders" element={<Orders />} />
      <Route path="/orders/track" element={<Orders />} />
      <Route path="/ticket" element={<Ticket />} />
      <Route path="/profile" element={<Profile />} />

      {/* Admin Portal (One single portal for both Menu and Chef/Preparation) */}
      <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/todays-food" element={<TodaysFood />} />
      <Route path="/admin/menu" element={<ManageMenu />} />
      <Route path="/admin/orders" element={<ManageOrders />} />
      <Route path="/admin/chef-preparation" element={<ChefPreparation />} />
      <Route path="/admin/settings" element={<AdminSettings />} />

      {/* Compatibility redirects */}
      <Route path="/student-dashboard" element={<Navigate to="/home" replace />} />
      <Route path="/staff" element={<Navigate to="/home" replace />} />
      <Route path="/register" element={<Navigate to="/" replace />} />

      {/* Fallback to Root */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;
