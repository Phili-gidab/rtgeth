const BASE = import.meta.env.VITE_API_URL || ''

export const getToken = () => localStorage.getItem('rtg-admin-token')
export const setToken = (t) => (t ? localStorage.setItem('rtg-admin-token', t) : localStorage.removeItem('rtg-admin-token'))

async function request(path, { method = 'GET', body, headers = {}, raw = false } = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      ...(raw ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: raw ? body : body !== undefined ? JSON.stringify(body) : undefined,
  })
  if (res.status === 401) {
    setToken(null)
    if (location.pathname.startsWith('/admin') && !location.pathname.endsWith('/login')) {
      location.href = '/admin/login'
    }
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  me: () => request('/api/auth/me'),
  changePassword: (current, next) => request('/api/auth/password', { method: 'POST', body: { current, new: next } }),

  getSingleton: (key) => request(`/api/admin/content/${key}`),
  saveSingleton: (key, data) => request(`/api/admin/content/${key}`, { method: 'PUT', body: data }),

  listItems: (collection) => request(`/api/admin/items/${collection}`),
  createItem: (collection, data) => request(`/api/admin/items/${collection}`, { method: 'POST', body: data }),
  updateItem: (collection, id, data) => request(`/api/admin/items/${collection}/${id}`, { method: 'PUT', body: data }),
  deleteItem: (collection, id) => request(`/api/admin/items/${collection}/${id}`, { method: 'DELETE' }),
  reorder: (collection, order) => request(`/api/admin/items/${collection}/reorder`, { method: 'POST', body: { order } }),

  upload: (file) => {
    const fd = new FormData()
    fd.append('file', file)
    return request('/api/admin/upload', { method: 'POST', body: fd, raw: true })
  },
  deleteUpload: (name) => request(`/api/admin/upload/${encodeURIComponent(name)}`, { method: 'DELETE' }),

  donations: () => request('/api/admin/donations'),
  submissions: (kind) => request(`/api/admin/submissions${kind ? `?kind=${kind}` : ''}`),
  markRead: (id) => request(`/api/admin/submissions/${id}/read`, { method: 'PUT' }),

  donateInit: (payload) => request('/api/donate/init', { method: 'POST', body: payload }),
  donateStatus: (txRef) => request(`/api/donate/status?tx_ref=${encodeURIComponent(txRef)}`),
  submit: (payload) => request('/api/submit', { method: 'POST', body: payload }),
}
