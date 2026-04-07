import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add JWT token if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const bookingService = {
  createBooking: (data) => api.post('/bookings', data),
  getAvailability: (date) => api.get(`/availability?date=${date}`),
  getAuthorizedDates: () => api.get('/bookings/availability/dates'),
};

export const adminService = {
  login: (credentials) => api.post('/auth/login', credentials),
  getAllBookings: (page = 1, limit = 20, search = '') => 
    api.get(`/admin/bookings?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`),
  updateBooking: (id, data) => api.patch(`/admin/bookings/${id}`, data),
  blockSlot: (data) => api.post('/admin/block-slot', data),
  manualBooking: (data) => api.post('/admin/manual-booking', data),
  getScreens: () => api.get('/admin/screens'),
  updateScreenSlots: (id, slots, is_active) => api.patch(`/admin/screens/${id}/slots`, { slots, is_active }),
  getMessages: (page = 1) => api.get(`/admin/messages?page=${page}`),
  getSetting: (key) => api.get(`/admin/settings/${key}`),
  updateSetting: (key, value) => api.patch(`/admin/settings/${key}`, { value }),
};

export const settingService = {
  getTimeSlots: () => api.get('/settings/time-slots'),
  updateTimeSlots: (slots) => api.patch('/settings/time-slots', { slots }),
};

export default api;
