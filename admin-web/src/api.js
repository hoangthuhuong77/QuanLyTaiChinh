const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const TOKEN_KEY = 'finance_admin_token';

export const session = {
  get: () => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY),
  set: (token, remember) => {
    localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY);
    (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  },
  clear: () => { localStorage.removeItem(TOKEN_KEY); sessionStorage.removeItem(TOKEN_KEY); },
};

export async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = session.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers, body: options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body });
  const data = response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || 'Không thể kết nối đến máy chủ.');
    error.status = response.status;
    if (response.status === 401) session.clear();
    throw error;
  }
  return data;
}

export const api = {
  login: (body) => request('/dangnhap', { method: 'POST', body }),
  profile: () => request('/admin/profile'),
  updateProfile: (body) => request('/admin/profile', { method: 'PUT', body }),
  changePassword: (body) => request('/admin/change-password', { method: 'PUT', body }),
  dashboard: () => request('/admin/dashboard'),
  statistics: () => request('/admin/statistics'),
  users: (params = {}) => request(`/admin/users?${new URLSearchParams(Object.entries(params).filter(([, value]) => value !== '' && value != null))}`),
  user: (id) => request(`/admin/users/${id}`),
  setUserStatus: (id, status) => request(`/admin/users/${id}/status`, { method: 'PATCH', body: { status } }),
  removeUser: (id) => request(`/admin/users/${id}`, { method: 'DELETE' }),
  categories: () => request('/admin/categories'),
  createCategory: (body) => request('/admin/categories', { method: 'POST', body }),
  updateCategory: (id, body) => request(`/admin/categories/${id}`, { method: 'PUT', body }),
  removeCategory: (id) => request(`/admin/categories/${id}`, { method: 'DELETE' }),
  notifications: (status = '') => request(`/admin/notifications${status ? `?status=${status}` : ''}`),
  createNotification: (body) => request('/admin/notifications', { method: 'POST', body }),
  updateNotification: (id, body) => request(`/admin/notifications/${id}`, { method: 'PUT', body }),
  sendNotification: (id) => request(`/admin/notifications/${id}/send`, { method: 'POST' }),
  removeNotification: (id) => request(`/admin/notifications/${id}`, { method: 'DELETE' }),
  feedback: (status = '') => request(`/admin/feedback${status ? `?status=${status}` : ''}`),
  updateFeedback: (id, body) => request(`/admin/feedback/${id}`, { method: 'PATCH', body }),
  sessions: () => request('/admin/sessions'),
  revokeSession: (id) => request(`/admin/sessions/${id}`, { method: 'DELETE' }),
  revokeOthers: () => request('/admin/sessions/others', { method: 'DELETE' }),
  logout: () => request('/admin/logout', { method: 'POST' }),
};
