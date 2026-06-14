import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${API_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${refreshToken}` }
        });
        localStorage.setItem('access_token', data.access_token);
        original.headers.Authorization = `Bearer ${data.access_token}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
};

export const applicationsAPI = {
  getAll: (params) => api.get('/applications/', { params }),
  getById: (id) => api.get(`/applications/${id}`),
  create: (data) => api.post('/applications/', data),
  update: (id, data) => api.put(`/applications/${id}`, data),
  delete: (id) => api.delete(`/applications/${id}`),
  updateStatus: (id, status) => api.patch(`/applications/${id}/status`, { status }),
  exportCSV: () => api.get('/applications/export/csv', { responseType: 'blob' }),
  importCSV: (formData) => api.post('/applications/import/csv', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
};

export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getCompanyInsights: () => api.get('/analytics/company-insights'),
  getInsightsText: () => api.get('/analytics/insights-text'),
};

export const aiAPI = {
  analyzeResume: (formData) => api.post('/ai/analyze-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  jobMatch: (data) => api.post('/ai/job-match', data),
  generateCoverLetter: (data) => api.post('/ai/cover-letter', data),
  interviewPrep: (data) => api.post('/ai/interview-prep', data),
};

export const resumesAPI = {
  getAll: () => api.get('/resumes/'),
  upload: (formData) => api.post('/resumes/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/resumes/${id}`),
  activate: (id) => api.patch(`/resumes/${id}/activate`),
};

export const interviewsAPI = {
  getAll: () => api.get('/interviews/'),
  create: (data) => api.post('/interviews/', data),
  update: (id, data) => api.put(`/interviews/${id}`, data),
  delete: (id) => api.delete(`/interviews/${id}`),
};

export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getStats: () => api.get('/admin/stats'),
  deactivateUser: (id) => api.patch(`/admin/users/${id}/deactivate`),
};

export default api;
