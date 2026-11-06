// ==============================================================
// Pragati University Canteen Order App
// REST API Service Stubs for Spring Boot Backend & Razorpay
// ==============================================================

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

/**
 * Common request handler prepared for future Spring Boot JWT token injection
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('pec_jwt_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `API Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // In frontend-only mock mode, console warning instead of fatal crash
    console.warn(`[Spring Boot API Placeholder] ${endpoint}:`, error.message);
    throw error;
  }
}

// ==============================================================
// 1. Authentication Services (Spring Boot /api/auth/*)
// ==============================================================
export const authService = {
  // Student / Faculty unified login endpoint
  loginUser: async (registrationId, password) => {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ registrationId, password })
    });
  },

  // Admin login endpoint
  loginAdmin: async (adminId, password) => {
    return request('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ adminId, password })
    });
  },

  // Get current user profile
  getProfile: async () => {
    return request('/auth/me');
  }
};

// ==============================================================
// 2. Menu Services (Spring Boot /api/menu/*)
// ==============================================================
export const menuService = {
  // Get all active dishes for today
  getTodaysMenu: async (category) => {
    const query = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
    return request(`/menu/today${query}`);
  },

  // Admin: Add new food item
  addFoodItem: async (foodData) => {
    return request('/menu/items', {
      method: 'POST',
      body: JSON.stringify(foodData)
    });
  },

  // Admin: Update food item
  updateFoodItem: async (id, foodData) => {
    return request(`/menu/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(foodData)
    });
  },

  // Admin: Toggle availability (AVAILABLE / SOLD OUT)
  toggleAvailability: async (id, isAvailable) => {
    return request(`/menu/items/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable })
    });
  },

  // Admin: Delete food item
  deleteFoodItem: async (id) => {
    return request(`/menu/items/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==============================================================
// 3. Order Services (Spring Boot /api/orders/*)
// ==============================================================
export const orderService = {
  // Create reserved order after payment
  createOrder: async (orderPayload) => {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });
  },

  // Get order details & digital ticket by ID
  getOrderById: async (orderId) => {
    return request(`/orders/${orderId}`);
  },

  // Get user order history
  getUserOrders: async (registrationId) => {
    return request(`/orders/user/${registrationId}`);
  },

  // Admin: Get live kitchen queue
  getAllOrders: async (filters = {}) => {
    return request('/orders/admin');
  },

  // Admin/Chef: Update order status (CONFIRMED -> PREPARING -> READY FOR PICKUP -> COMPLETED)
  updateOrderStatus: async (orderId, status) => {
    return request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }
};

// ==============================================================
// 4. Razorpay Cashless Gateway Integration Point (/api/payment/*)
// ==============================================================
export const paymentService = {
  // Step 1: Create Razorpay Order on server
  createRazorpayOrder: async (amountInINR, receiptId) => {
    return request('/payment/razorpay/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount: amountInINR, receipt: receiptId })
    });
  },

  // Step 2: Verify Razorpay Signature after checkout
  verifyPayment: async (paymentDetails) => {
    return request('/payment/razorpay/verify', {
      method: 'POST',
      body: JSON.stringify(paymentDetails)
    });
  }
};

export default {
  auth: authService,
  menu: menuService,
  order: orderService,
  payment: paymentService
};
