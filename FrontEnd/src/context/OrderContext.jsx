import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_MENU_ITEMS, INITIAL_ORDERS, ORDER_STATUS_FLOW, PICKUP_SLOTS } from '../data/mockData';

export { ORDER_STATUS_FLOW, PICKUP_SLOTS };

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  // Menu items state with live stock quantity tracking
  const [menuItems, setMenuItems] = useState(() => {
    const saved = localStorage.getItem('pu_canteen_menu_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Quick sanity check to ensure items have stockQuantity
        if (parsed.length > 0 && typeof parsed[0].stockQuantity === 'number') {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_MENU_ITEMS;
  });

  // Orders state
  const [orders, setOrders] = useState(() => {
    const saved = localStorage.getItem('pu_canteen_orders_v2');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  // Admin configurable settings
  const [canteenSettings, setCanteenSettings] = useState(() => {
    const saved = localStorage.getItem('pu_canteen_settings_v2');
    return saved ? JSON.parse(saved) : {
      breakfastStart: "06:00 AM",
      breakfastEnd: "09:30 AM",
      lunchStart: "09:00 AM",
      lunchEnd: "12:00 PM",
      lunchPickupStart: "12:00 PM",
      lunchPickupEnd: "02:00 PM",
      snacksStart: "01:00 PM",
      snacksEnd: "03:30 PM",
      cakeCutoff: "01:00 PM",
      cakePickupStart: "03:00 PM",
      allowDirectCounterSales: true
    };
  });

  // Persist state
  useEffect(() => {
    localStorage.setItem('pu_canteen_menu_v2', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('pu_canteen_orders_v2', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('pu_canteen_settings_v2', JSON.stringify(canteenSettings));
  }, [canteenSettings]);

  // Real-time synchronization across browser tabs (Storage event listener)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'pu_canteen_orders_v2' && e.newValue) {
        try {
          setOrders(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Storage sync error for orders:", err);
        }
      }
      if (e.key === 'pu_canteen_menu_v2' && e.newValue) {
        try {
          setMenuItems(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Storage sync error for menu:", err);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Menu Management functions for Admin
  const addMenuItem = (item) => {
    const newItem = {
      ...item,
      id: `item-${Date.now()}`,
      isAvailable: item.isAvailable !== false,
      price: Number(item.price) || 50,
      stockQuantity: Number(item.stockQuantity) || 50,
      initialStock: Number(item.stockQuantity) || 50,
      isAllDay: Boolean(item.isAllDay),
      mealType: item.isAllDay ? 'ALL_DAY' : (item.mealType || 'LUNCH')
    };
    setMenuItems(prev => [newItem, ...prev]);
    return newItem;
  };

  const editMenuItem = (id, updatedFields) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        const merged = { ...item, ...updatedFields };
        if (typeof updatedFields.stockQuantity !== 'undefined') {
          merged.stockQuantity = Math.max(0, Number(updatedFields.stockQuantity));
          merged.isAvailable = merged.stockQuantity > 0 && merged.isAvailable !== false;
        }
        return merged;
      }
      return item;
    }));
  };

  const updateItemStock = (id, newQuantity) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        const qty = Math.max(0, Number(newQuantity));
        return {
          ...item,
          stockQuantity: qty,
          isAvailable: qty > 0 && item.isAvailable !== false
        };
      }
      return item;
    }));
  };

  const deleteMenuItem = (id) => {
    setMenuItems(prev => prev.filter(item => item.id !== id));
  };

  const toggleItemAvailability = (id) => {
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, isAvailable: !item.isAvailable } : item));
  };

  // Reset daily stock to initial mock counts (Prompt Rule 19: Daily Reset)
  const resetDailyStock = () => {
    setMenuItems(INITIAL_MENU_ITEMS);
    localStorage.setItem('pu_canteen_menu_v2', JSON.stringify(INITIAL_MENU_ITEMS));
  };

  // Safe fallback for pickup slot capacity
  const isSlotFull = () => false;

  // Order Operations: Deducts inventory immediately!
  const placeOrder = (orderData) => {
    const orderNumber = Math.floor(1000 + Math.random() * 9000);
    const tokenNum = `TKT-${Math.floor(20 + Math.random() * 80)}`;

    const newOrder = {
      id: `PU-2026-00${orderNumber}`,
      tokenNumber: tokenNum,
      userName: orderData.userName || orderData.user?.name || "Student/Faculty Member",
      userRegistrationId: orderData.userRegistrationId || orderData.user?.registrationId || "23A91A0501",
      userRole: orderData.userRole || orderData.user?.role || "STUDENT",
      date: "Today, " + new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      status: "CONFIRMED",
      items: orderData.items || [],
      subtotal: orderData.subtotal || 0,
      tax: orderData.tax || 0,
      totalAmount: orderData.totalAmount || 0,
      paymentMethod: orderData.paymentMethod || "Razorpay (Direct Online)",
      razorpayPaymentId: orderData.razorpayPaymentId || `pay_PU${Math.floor(10000000 + Math.random() * 90000000)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // 1. Immediately deduct stock for each ordered item in state (Prompt rule 10 & 11)
    setMenuItems(prev => prev.map(menuItem => {
      const orderedItem = orderData.items?.find(it => it.id === menuItem.id);
      if (orderedItem) {
        const remainingStock = Math.max(0, (menuItem.stockQuantity ?? 50) - orderedItem.quantity);
        return {
          ...menuItem,
          stockQuantity: remainingStock,
          isAvailable: remainingStock > 0 && menuItem.isAvailable !== false
        };
      }
      return menuItem;
    }));

    // 2. Save new order
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => {
      const updated = prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
      try {
        localStorage.setItem('pu_canteen_orders_v2', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to persist updated order status:", err);
      }
      return updated;
    });
  };

  const advanceOrderStatus = (orderId) => {
    setOrders(prev => {
      const updated = prev.map(o => {
        if (o.id !== orderId) return o;
        const curIdx = ORDER_STATUS_FLOW.indexOf(o.status);
        if (curIdx >= 0 && curIdx < ORDER_STATUS_FLOW.length - 1) {
          return { ...o, status: ORDER_STATUS_FLOW[curIdx + 1] };
        }
        return o;
      });
      try {
        localStorage.setItem('pu_canteen_orders_v2', JSON.stringify(updated));
      } catch (err) {
        console.error("Failed to persist advanced order status:", err);
      }
      return updated;
    });
  };

  const updateSettings = (newSettings) => {
    setCanteenSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getActiveOrderForUser = (registrationId) => {
    return orders.find(o => 
      (!registrationId || o.userRegistrationId === registrationId) && 
      (o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'READY FOR PICKUP')
    );
  };

  return (
    <OrderContext.Provider
      value={{
        menuItems,
        orders,
        pickupSlots: [],
        canteenSettings,
        addMenuItem,
        editMenuItem,
        updateItemStock,
        deleteMenuItem,
        toggleItemAvailability,
        resetDailyStock,
        isSlotFull,
        placeOrder,
        updateOrderStatus,
        advanceOrderStatus,
        updateSettings,
        getActiveOrderForUser
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);

export default OrderContext;
