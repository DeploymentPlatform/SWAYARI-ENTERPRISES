// SWAYARI ENTERPRISES - Central API Wrapper

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/api/${endpoint}`;
  
  const headers = {
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(options.body);
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: 'same-origin' // Ensures HttpOnly session cookies are transmitted safely
  };

  try {
    const res = await fetch(url, fetchOptions);
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMessage = data.error || `Request failed with status ${res.status}`;
      const err = new Error(errMessage);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    console.error(`API Error on [${options.method || 'GET'} ${url}]:`, err.message);
    throw err;
  }
}

export const API = {
  // Auth
  getMe: () => apiRequest('/api/auth/me'),
  logout: () => apiRequest('/api/auth/logout', { method: 'POST' }),
  verifyGoogle: (credential) => apiRequest('/api/auth/google', { method: 'POST', body: { credential } }),
  devLogin: (role, customEmail) => apiRequest('/api/auth/dev-login', { method: 'POST', body: { role, customEmail } }),

  // Storefront
  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/api/products${qs ? '?' + qs : ''}`);
  },
  getProductBySlug: (slug) => apiRequest(`/api/products/${encodeURIComponent(slug)}`),
  getCategories: () => apiRequest('/api/categories'),

  // Orders
  submitOrderRequest: (orderData) => apiRequest('/api/orders', { method: 'POST', body: orderData }),
  getCustomerOrders: () => apiRequest('/api/orders'),
  getCustomerOrderDetails: (id) => apiRequest(`/api/orders/${encodeURIComponent(id)}`),

  // Admin
  getAdminStats: () => apiRequest('/api/admin/stats'),
  getAdminOrders: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiRequest(`/api/admin/orders${qs ? '?' + qs : ''}`);
  },
  getAdminOrderDetails: (id) => apiRequest(`/api/admin/orders/${encodeURIComponent(id)}`),
  updateAdminOrder: (id, updates) => apiRequest(`/api/admin/orders/${encodeURIComponent(id)}`, { method: 'PATCH', body: updates }),
  getAdminProducts: () => apiRequest('/api/admin/products'),
  createAdminProduct: (prodData) => apiRequest('/api/admin/products', { method: 'POST', body: prodData }),
  updateAdminProduct: (id, updates) => apiRequest(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'PATCH', body: updates }),
  archiveAdminProduct: (id) => apiRequest(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getAdminCategories: () => apiRequest('/api/admin/categories'),
  createAdminCategory: (catData) => apiRequest('/api/admin/categories', { method: 'POST', body: catData }),
  getAdminAssets: () => apiRequest('/api/admin/assets')
};
