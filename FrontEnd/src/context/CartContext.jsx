import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { currentUser } = useAuth();

  // User-scoped identifier for complete cart isolation between accounts
  const userKey = currentUser
    ? (currentUser.registrationId || currentUser.adminId || currentUser.role || 'user')
    : 'guest';
  const storageKey = `pu_canteen_cart_${userKey}`;

  // Helper to load user-isolated cart from localStorage
  const loadUserCart = (key) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const [cartItems, setCartItems] = useState(() => loadUserCart(storageKey));
  const [selectedSlot, setSelectedSlot] = useState("12:30 PM");

  // Keep track of the current active user key to avoid saving wrong cart during user switch
  const activeUserKeyRef = useRef(userKey);

  // When logged-in user switches (e.g., student to faculty or vice versa), load that user's isolated cart
  useEffect(() => {
    activeUserKeyRef.current = userKey;
    const userCart = loadUserCart(`pu_canteen_cart_${userKey}`);
    setCartItems(userCart);
  }, [userKey]);

  // Save cart changes exclusively to the active user's storage key
  useEffect(() => {
    if (activeUserKeyRef.current === userKey) {
      localStorage.setItem(`pu_canteen_cart_${userKey}`, JSON.stringify(cartItems));
    }
  }, [cartItems, userKey]);

  const getItemCartQuantity = (foodId) => {
    const item = cartItems.find(i => i.id === foodId);
    return item ? item.quantity : 0;
  };

  const addToCart = (foodItem, quantity = 1, maxStock = 999) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === foodItem.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, maxStock);
        return prev.map(item =>
          item.id === foodItem.id
            ? { ...item, quantity: newQty }
            : item
        );
      }
      const initialQty = Math.min(quantity, maxStock);
      return [...prev, { ...foodItem, quantity: initialQty }];
    });
  };

  const removeFromCart = (foodId) => {
    setCartItems(prev => prev.filter(item => item.id !== foodId));
  };

  const updateQuantity = (foodId, delta, maxStock = 999) => {
    setCartItems(prev => {
      return prev
        .map(item => {
          if (item.id === foodId) {
            const desired = item.quantity + delta;
            if (desired <= 0) return null;
            const capped = Math.min(desired, maxStock);
            return { ...item, quantity: capped };
          }
          return item;
        })
        .filter(Boolean);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    try {
      localStorage.removeItem(`pu_canteen_cart_${userKey}`);
    } catch (e) {}
  };

  // Calculations in Indian Rupees (₹)
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const tax = Number((subtotal * 0.05).toFixed(2)); // 5% Canteen GST
  const grandTotal = Number((subtotal + tax).toFixed(2));
  const itemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        subtotal,
        tax,
        grandTotal,
        selectedSlot,
        setSelectedSlot,
        getItemCartQuantity,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

export default CartContext;
