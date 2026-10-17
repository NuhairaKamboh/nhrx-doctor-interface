const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const getToken = () => (typeof window !== 'undefined' ? localStorage.getItem('nhrx_token') : null);
export const getDoctor = () => {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('nhrx_doctor');
  return raw ? JSON.parse(raw) : null;
};
export const saveSession = (token, doctor) => {
  localStorage.setItem('nhrx_token', token);
  localStorage.setItem('nhrx_doctor', JSON.stringify(doctor));
};
export const clearSession = () => {
  localStorage.removeItem('nhrx_token');
  localStorage.removeItem('nhrx_doctor');
};

async function request(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401 && typeof window !== 'undefined' && !path.startsWith('/auth/login')) {
    clearSession();
    window.location.href = '/login';
  }
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  getCases: (cnic) => request(`/cases/${encodeURIComponent(cnic)}`),
  createCase: (payload) => request('/cases', { method: 'POST', body: JSON.stringify(payload) }),
  updateStatus: (id, caseStatus) => request(`/cases/${id}/status`, { method: 'PATCH', body: JSON.stringify({ caseStatus }) }),
};
