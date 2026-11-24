import {
  Product,
  Order,
  UserReview,
  Coupon,
  Category,
  InventoryItem,
  InventoryLog,
  SubscriptionPlan,
  StoreSettings,
  AdminMetrics
} from '../types';

const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '');

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('itsclear_jwt_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function getAdminAuthHeader(): Record<string, string> {
  const adminToken = localStorage.getItem('itsclear_admin_jwt_token');
  const userToken = localStorage.getItem('itsclear_jwt_token');
  const token = adminToken || userToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  async getStoreConfig(): Promise<{
    onlinePaymentsEnabled: boolean;
    codEnabled: boolean;
    currency: string;
    freeDeliveryThreshold: number;
  }> {
    const res = await fetch(`${API_BASE}/config`);
    if (!res.ok) throw new Error('Store configuration is unavailable');
    return res.json();
  },

  // PRODUCTS
  async getProducts(): Promise<Product[]> {
    const res = await fetch(`${API_BASE}/products`);
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  },

  async getProductById(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`);
    if (!res.ok) throw new Error('Product not found');
    return res.json();
  },

  async createProduct(product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to create product');
    return res.json();
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(product)
    });
    if (!res.ok) throw new Error('Failed to update product');
    return res.json();
  },

  async deleteProduct(id: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch(`${API_BASE}/products/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) {
      const err: any = new Error(data.error || 'Failed to delete product');
      err.hasOrders = data.hasOrders;
      err.orderCount = data.orderCount;
      throw err;
    }
    return data;
  },

  async duplicateProduct(id: string): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}/duplicate`, {
      method: 'POST',
      headers: getAdminAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to duplicate product');
    return data;
  },

  async bulkUpdateProductStatus(payload: {
    productIds: string[];
    status?: string;
    category?: string;
    isActive?: boolean;
  }): Promise<{ success: boolean; modifiedCount: number }> {
    const res = await fetch(`${API_BASE}/products/bulk/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to bulk update products');
    return data;
  },

  // IMAGE UPLOADS
  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getAdminAuthHeader(),
      body: formData
    });
    if (!res.ok) throw new Error('Failed to upload image');
    return res.json();
  },

  async uploadMultipleImages(files: File[]): Promise<{
    success: boolean;
    files: Array<{ id: string; url: string; filename: string; size: number; alt: string }>;
    count: number;
  }> {
    const formData = new FormData();
    files.forEach(f => formData.append('images', f));
    const res = await fetch(`${API_BASE}/upload/multiple`, {
      method: 'POST',
      headers: getAdminAuthHeader(),
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to upload images');
    return data;
  },

  // ORDERS
  async getOrders(userId?: string, useAdminToken: boolean = false): Promise<Order[]> {
    const url = userId ? `${API_BASE}/orders?userId=${userId}` : `${API_BASE}/orders`;
    const res = await fetch(url, {
      headers: useAdminToken ? getAdminAuthHeader() : getAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  async getOrder(orderId: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderId)}`, {
      headers: getAuthHeader()
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch order details');
    return result;
  },

  async createOrder(orderData: any): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(orderData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to place order');
    return result;
  },

  async createPaymentOrder(orderData: any): Promise<{
    keyId: string;
    providerOrderId: string;
    amount: number;
    currency: string;
    quote: { subtotal: number; discount: number; deliveryFee: number; tax: number; total: number };
  }> {
    const res = await fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(orderData)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Unable to initialize secure payment');
    return result;
  },

  async updateOrderStatus(orderId: string, status: Order['orderStatus']): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({ status })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update order status');
    return result;
  },

  async cancelOrder(orderId: string, reason: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ reason })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to cancel order');
    return result;
  },

  async returnOrder(orderId: string, reason: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${orderId}/return`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ reason })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to request return');
    return result;
  },

  // AUTHENTICATION
  async sendRegistrationOtp(data: {
    fullName?: string;
    name?: string;
    mobile?: string;
    phone?: string;
    email: string;
    city?: string;
    password: string;
    confirmPassword?: string;
  }): Promise<{ success: boolean; message: string; expiresIn: number; resendAfter: number; mode?: string; devOtp?: string }> {
    const res = await fetch(`${API_BASE}/auth/register/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: data.fullName || data.name,
        name: data.name || data.fullName,
        mobile: data.mobile || data.phone,
        phone: data.phone || data.mobile,
        email: data.email,
        city: data.city || 'Lucknow',
        password: data.password,
        confirmPassword: data.confirmPassword || data.password
      })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send verification OTP');
    return result;
  },

  async verifyOtpAndCreateAccount(data: {
    email: string;
    otp: string;
  }): Promise<{ success: boolean; message: string; user: any; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register/verify-and-create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to verify OTP');
    if (result.token) {
      localStorage.setItem('itsclear_jwt_token', result.token);
    }
    return result;
  },

  async resendRegistrationOtp(email: string): Promise<{ success: boolean; message: string; expiresIn: number; resendAfter: number; mode?: string; devOtp?: string }> {
    const res = await fetch(`${API_BASE}/auth/register/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to resend OTP');
    return result;
  },

  async sendLoginOtp(email: string): Promise<{ success: boolean; message: string; expiresIn: number; resendAfter: number; devOtp?: string }> {
    const res = await fetch(`${API_BASE}/auth/login/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to send login code');
    return result;
  },

  async verifyLoginOtp(email: string, otp: string, portal: 'customer' | 'admin' = 'customer') {
    const res = await fetch(`${API_BASE}/auth/login/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, portal })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to verify login code');
    if (result.token) {
      if (portal === 'admin') {
        localStorage.setItem('itsclear_admin_jwt_token', result.token);
      } else {
        localStorage.setItem('itsclear_jwt_token', result.token);
      }
    }
    return result;
  },

  async register(data: { name: string; email: string; phone: string; city: string; password?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        password: data.password || ''
      })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Registration failed');
    if (result.token) {
      localStorage.setItem('itsclear_jwt_token', result.token);
    }
    return result;
  },

  async googleAuth(credential: string, portal: 'customer' | 'admin' = 'customer') {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, portal })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Google authentication failed');
    if (result.token) {
      if (portal === 'admin') {
        localStorage.setItem('itsclear_admin_jwt_token', result.token);
        localStorage.setItem('itsclear_admin_logged_in', 'true');
      } else {
        localStorage.setItem('itsclear_jwt_token', result.token);
        localStorage.setItem('itsclear_auth_logged_in', 'true');
      }
    }
    return result;
  },

  async googleLink(credential: string, opts: { password?: string; otp?: string }) {
    const res = await fetch(`${API_BASE}/auth/google/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential, ...opts })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Google account linking failed');
    if (result.token) {
      localStorage.setItem('itsclear_jwt_token', result.token);
      localStorage.setItem('itsclear_auth_logged_in', 'true');
    }
    return result;
  },

  async login(emailOrPhone: string, password?: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emailOrPhone,
        password: password || ''
      })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    if (result.token) {
      localStorage.setItem('itsclear_jwt_token', result.token);
    }
    return result;
  },

  async adminLogin(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Admin login failed');
    if (result.token) {
      localStorage.setItem('itsclear_admin_jwt_token', result.token);
    }
    return result;
  },

  async adminChangePassword(newPassword: string) {
    const res = await fetch(`${API_BASE}/auth/admin-change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({ newPassword })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update admin password');
    return result;
  },

  logout() {
    localStorage.removeItem('itsclear_jwt_token');
    localStorage.removeItem('itsclear_admin_jwt_token');
  },

  async getCurrentUser() {
    const token = localStorage.getItem('itsclear_jwt_token');
    if (!token) return null;
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeader()
    });
    if (!res.ok) return null;
    return res.json();
  },

  // COUPONS
  async getCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/coupons`);
    if (!res.ok) throw new Error('Failed to fetch coupons');
    return res.json();
  },

  // REVIEWS
  async getReviews(productId?: string): Promise<UserReview[]> {
    const url = productId ? `${API_BASE}/reviews?productId=${productId}` : `${API_BASE}/reviews`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async createReview(review: { productId: string; author: string; city: string; rating: number; comment: string }): Promise<UserReview> {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(review)
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to submit review');
    return result;
  },

  // ─────────────────────────────────────────────────────────────
  // ADMIN 2.0 API CLIENT METHODS
  // ─────────────────────────────────────────────────────────────

  // Products (Admin Extended)
  async getAdminProducts(category?: string, status?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (status && status !== 'all') params.append('status', status);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/products/admin/all${query}`, {
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch admin products');
    return res.json();
  },

  async updateProductStatus(id: string, status?: string, isActive?: boolean): Promise<Product> {
    const res = await fetch(`${API_BASE}/products/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({ status, isActive })
    });
    if (!res.ok) throw new Error('Failed to update product status');
    return res.json();
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories`);
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  },

  async getAdminCategories(): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories/admin/all`, {
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch admin categories');
    return res.json();
  },

  async getCategory(slugOrId: string): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${slugOrId}`);
    if (!res.ok) throw new Error('Failed to fetch category');
    return res.json();
  },

  async createCategory(cat: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(cat)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create category');
    return data;
  },

  async updateCategory(id: string, cat: Partial<Category>): Promise<Category> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(cat)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update category');
    return data;
  },

  async reorderCategories(items: { id: string; sortOrder: number }[]): Promise<Category[]> {
    const res = await fetch(`${API_BASE}/categories/reorder`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({ items })
    });
    if (!res.ok) throw new Error('Failed to reorder categories');
    return res.json();
  },

  async deleteCategory(id: string): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete category');
    return data;
  },

  // Inventory
  async getInventory(lowStockOnly: boolean = false, search: string = ''): Promise<InventoryItem[]> {
    const params = new URLSearchParams();
    if (lowStockOnly) params.append('lowStockOnly', 'true');
    if (search) params.append('search', search);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/inventory${query}`, {
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch inventory');
    return res.json();
  },

  async adjustInventory(payload: {
    productId: string;
    variantId: string;
    newStock?: number;
    changeAmount?: number;
    reason?: string;
    sku?: string;
  }): Promise<{ success: boolean; variant: any; log: InventoryLog }> {
    const res = await fetch(`${API_BASE}/inventory/adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to adjust inventory');
    return data;
  },

  async getInventoryLogs(productId?: string, variantId?: string): Promise<InventoryLog[]> {
    const params = new URLSearchParams();
    if (productId) params.append('productId', productId);
    if (variantId) params.append('variantId', variantId);
    const query = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${API_BASE}/inventory/logs${query}`, {
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch inventory logs');
    return res.json();
  },

  // Orders Admin
  async getAdminOrderMetrics(): Promise<AdminMetrics> {
    const res = await fetch(`${API_BASE}/orders/admin/metrics`, {
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch order metrics');
    return res.json();
  },

  async dispatchOrder(id: string, payload: {
    driverName?: string;
    driverPhone?: string;
    vehicleNumber?: string;
    estimatedDelivery?: string;
  }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/dispatch`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to dispatch order');
    return data;
  },

  async refundOrder(id: string, payload: { amount?: number; reason?: string }): Promise<Order> {
    const res = await fetch(`${API_BASE}/orders/${id}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to process refund');
    return data;
  },

  // Content (CMS)
  async getContent(key: string): Promise<any> {
    const res = await fetch(`${API_BASE}/content/${key}`);
    if (!res.ok) throw new Error('Failed to fetch content');
    return res.json();
  },

  async updateContent(key: string, data: any): Promise<any> {
    const res = await fetch(`${API_BASE}/content/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({ data })
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update content');
    return result;
  },

  // Subscription Plans
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const res = await fetch(`${API_BASE}/subscription-plans`);
    if (!res.ok) throw new Error('Failed to fetch subscription plans');
    return res.json();
  },

  async getAdminSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    const res = await fetch(`${API_BASE}/subscription-plans/admin/all`, {
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch admin subscription plans');
    return res.json();
  },

  async saveSubscriptionPlan(plan: Partial<SubscriptionPlan>): Promise<SubscriptionPlan> {
    const res = await fetch(`${API_BASE}/subscription-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(plan)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save subscription plan');
    return data;
  },

  async deleteSubscriptionPlan(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/subscription-plans/${id}`, {
      method: 'DELETE',
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete subscription plan');
    return res.json();
  },

  // Coupons Admin
  async getAdminCoupons(): Promise<Coupon[]> {
    const res = await fetch(`${API_BASE}/coupons/admin/all`, {
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch admin coupons');
    return res.json();
  },

  async createCoupon(coupon: Partial<Coupon>): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/coupons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(coupon)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to save coupon');
    return data;
  },

  async toggleCoupon(code: string): Promise<Coupon> {
    const res = await fetch(`${API_BASE}/coupons/${encodeURIComponent(code)}/toggle`, {
      method: 'PATCH',
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to toggle coupon status');
    return res.json();
  },

  async deleteCoupon(code: string): Promise<{ success: boolean }> {
    const res = await fetch(`${API_BASE}/coupons/${encodeURIComponent(code)}`, {
      method: 'DELETE',
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to delete coupon');
    return res.json();
  },

  // Settings Admin
  async getStoreSettings(): Promise<StoreSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch store settings');
    return res.json();
  },

  async updateStoreSettingsGroup(group: string, value: any): Promise<{ success: boolean; group: string; value: any }> {
    const res = await fetch(`${API_BASE}/settings/${group}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(value)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update store settings');
    return data;
  },

  async getStaffUsers(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/settings/staff/users`, {
      headers: getAdminAuthHeader()
    });
    if (!res.ok) throw new Error('Failed to fetch staff accounts');
    return res.json();
  },

  async updateStaffRole(email: string, role: string): Promise<any> {
    const res = await fetch(`${API_BASE}/settings/staff/role`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({ email, role })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update staff role');
    return data;
  },

  // Inventory Bulk Adjust
  async bulkAdjustInventory(adjustments: Array<{
    productId: string;
    variantId: string;
    operationType?: string;
    quantity: number;
    reason?: string;
  }>): Promise<any> {
    const res = await fetch(`${API_BASE}/inventory/bulk-adjust`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify({ adjustments })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to bulk adjust inventory');
    return data;
  },

  // Customers Admin
  async getCustomers(params?: { search?: string; page?: number; limit?: number }): Promise<{
    customers: any[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const q = new URLSearchParams();
    if (params?.search) q.append('search', params.search);
    if (params?.page) q.append('page', String(params.page));
    if (params?.limit) q.append('limit', String(params.limit));

    const res = await fetch(`${API_BASE}/customers?${q.toString()}`, {
      headers: getAdminAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch customers');
    return data;
  },

  async getCustomerDetail(id: string): Promise<{ customer: any; orders: any[]; metrics: any }> {
    const res = await fetch(`${API_BASE}/customers/${id}`, {
      headers: getAdminAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch customer details');
    return data;
  },

  async adjustCustomerCoins(id: string, payload: { changeAmount: number; reason: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/customers/${id}/coins`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to adjust ClearCoins');
    return data;
  },

  // Reports Admin
  async getReportsSales(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/sales`, {
      headers: getAdminAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch sales report');
    return data;
  },

  async getReportsTopProducts(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/reports/top-products`, {
      headers: getAdminAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch top products report');
    return data;
  },

  async getReportsInventoryHealth(): Promise<any> {
    const res = await fetch(`${API_BASE}/reports/inventory-health`, {
      headers: getAdminAuthHeader()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch inventory health report');
    return data;
  }
};
