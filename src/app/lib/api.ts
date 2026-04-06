const BASE_URL = `${window.location.protocol}//${window.location.hostname}:3001/api`;

function getToken(): string | null {
  return localStorage.getItem('hv_token');
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If body is FormData, remove Content-Type so browser can set boundary
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  return fetch(`${BASE_URL}${path}`, { ...options, headers });
}

export async function authFetch(path: string, options: RequestInit = {}) {
  const res = await apiFetch(path, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// Auth
export const api = {
  // Auth
  register: (name: string, email: string, password: string, gender: string, age?: number) =>
    authFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, gender, age }) }),

  login: (email: string, password: string) =>
    authFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

  me: () => authFetch('/auth/me'),

  updateProfile: (data: any) =>
    authFetch('/auth/me', { method: 'PUT', body: JSON.stringify(data) }),

  // Reports
  uploadReport: (formData: FormData) =>
    authFetch('/reports/upload', { method: 'POST', body: formData }),

  getReports: () => authFetch('/reports'),

  // Metrics
  getMetrics: () => authFetch('/metrics'),

  getMetric: (id: string | number) => authFetch(`/metrics/${id}`),

  getMetricInsights: (id: string | number) => authFetch(`/metrics/${id}/insights`),

  createMetric: (data: object) =>
    authFetch('/metrics', { method: 'POST', body: JSON.stringify(data) }),

  // Chat
  chat: (messages: object[], userHealthContext?: string) =>
    authFetch('/chat', { method: 'POST', body: JSON.stringify({ messages, userHealthContext }) }),

  // Analytics
  getAnalytics: () => authFetch('/analytics'),

  // Alerts
  getAlerts: () => authFetch('/alerts'),

  markAlertRead: (id: string | number) =>
    authFetch(`/alerts/${id}/read`, { method: 'PATCH' }),

  markAllAlertsRead: () =>
    authFetch('/alerts/read-all', { method: 'PATCH' }),
};
