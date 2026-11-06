import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { TimeProvider } from './context/TimeContext';
import { OrderProvider } from './context/OrderContext';
import { CartProvider } from './context/CartContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TimeProvider>
            <OrderProvider>
              <CartProvider>
                <AppRoutes />
              </CartProvider>
            </OrderProvider>
          </TimeProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
