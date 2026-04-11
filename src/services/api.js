import axios from 'axios';

const defaultProdApi =
  import.meta.env.VITE_API_URL || 'https://bigdream-backend.vercel.app/api';

const api = axios.create({
  baseURL: import.meta.env.DEV
    ? import.meta.env.VITE_API_URL || '/api'
    : defaultProdApi,
  headers: {
    'Content-Type': 'application/json',
  },
  // Send cookies with every cross-origin request (required for HttpOnly cookies)
  withCredentials: true,
  // Vercel + Neon cold starts can exceed 30s on first request; keep a generous default
  timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 90000,
});

// ─── Request Interceptor — Attach JWT from sessionStorage (fallback) ─────────
// Primary auth is via HttpOnly cookie (automatic). sessionStorage is a fallback
// for scenarios where cookies don't work (e.g., dev with different ports).
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response Interceptor — Handle auth errors globally ──────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Token expired or invalid — clear session and redirect to login
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('admin');
      // Only redirect if not already on the login page
      if (!window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }

    // Request timed out (axios) or aborted
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(
        new Error(
          'The server took too long to respond. If the API is on Vercel, the first request after idle can be slow — wait a moment and try again.'
        )
      );
    }

    // Network error or security block (no response from server)
    if (!error.response) {
      // Check if it's likely a CSP or connection issue
      return Promise.reject(new Error('Unable to connect to the server. This may be due to a security block or network issue. Please check your connection and try again.'));
    }

    return Promise.reject(error);
  }
);

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getAvailability: (date) => api.get(`/bookings/availability?date=${encodeURIComponent(date)}`),
  getAuthorizedDates: () => api.get('/bookings/availability/dates'),
};

export const adminService = {
  login: (credentials) =>
    api.post('/auth/login', credentials, {
      timeout: Number(import.meta.env.VITE_LOGIN_TIMEOUT_MS) || 120000,
    }),
  logout: () => api.post('/auth/logout'),
  getAllBookings: (page = 1, limit = 20, search = '') =>
    api.get(`/admin/bookings?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  updateBooking: (id, data) => api.patch(`/admin/bookings/${id}`, data),
  blockSlot: (data) => api.post('/admin/block-slot', data),
  manualBooking: (data) => api.post('/admin/manual-booking', data),
  getScreens: () => api.get('/admin/screens'),
  updateScreenSlots: (id, slots, is_active) => api.patch(`/admin/screens/${id}/slots`, { slots, is_active }),
  getMessages: (page = 1) => api.get(`/admin/messages?page=${page}`),
  toggleInquiryRead: (id, is_read) => api.patch(`/admin/messages/${id}/read`, { is_read }),
  getSetting: (key) => api.get(`/admin/settings/${encodeURIComponent(key)}`),
  updateSetting: (key, value) => api.patch(`/admin/settings/${encodeURIComponent(key)}`, { value }),
  changePassword: (body) => api.patch('/admin/password', body),
};

export const settingService = {
  getTimeSlots: () => api.get('/settings/time-slots'),
  updateTimeSlots: (slots) => api.patch('/settings/time-slots', { slots }),
};

export default api;
