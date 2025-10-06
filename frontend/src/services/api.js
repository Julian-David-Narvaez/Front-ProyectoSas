import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Interceptor para añadir token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Funciones de autenticación
export const authService = {
  login: (credentials) => api.post('/login', credentials),
  register: (userData) => api.post('/register', userData),
  logout: () => api.post('/logout'),
  getUser: () => api.get('/user')
};

// Funciones de negocios
export const businessService = {
  getAll: () => api.get('/businesses'),
  getOne: (id) => api.get(`/businesses/${id}`),
  create: (data) => api.post('/businesses', data),
  update: (id, data) => api.put(`/businesses/${id}`, data),
  delete: (id) => api.delete(`/businesses/${id}`)
};

// Funciones de servicios
export const serviceService = {
  getAll: (businessId) => api.get(`/businesses/${businessId}/services`),
  create: (businessId, data) => api.post(`/businesses/${businessId}/services`, data),
  update: (businessId, serviceId, data) => api.put(`/businesses/${businessId}/services/${serviceId}`, data),
  delete: (businessId, serviceId) => api.delete(`/businesses/${businessId}/services/${serviceId}`)
};

// Funciones de citas
export const appointmentService = {
  getAll: (businessId) => api.get(`/businesses/${businessId}/appointments`),
  getAvailableSlots: (slug, date, serviceId) => 
    api.get(`/businesses/${slug}/available-slots`, { params: { date, service_id: serviceId } }),
  book: (data) => api.post('/appointments/book', data),
  updateStatus: (id, status) => api.patch(`/appointments/${id}/status`, { status })
};