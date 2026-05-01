// ── Todas las solicitudes pasan por el ApiGateway en :9090 ──────────────────
const BASE_URL = 'http://localhost:9090'

function getToken() {
  return localStorage.getItem('token')
}

function authHeaders() {
  const token = getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw { status: res.status, message: err.error || err.mensaje || 'Error desconocido' }
  }

  if (res.status === 204) return null
  return res.json()
}

// ── Auth (rutas públicas) ─────────────────────────────────────────────────────
export const auth = {
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => request('/auth/me'),
}

// ── Donaciones (:8086 vía gateway) ───────────────────────────────────────────
export const donaciones = {
  registrarDonante: (body)     => request('/api/donaciones/donantes', { method: 'POST', body: JSON.stringify(body) }),
  registrar:        (body)     => request('/api/donaciones',          { method: 'POST', body: JSON.stringify(body) }),
  historial:        (rut)      => request(`/api/donaciones/historial?rut=${rut}`),
  historialAdmin:   (page = 0) => request(`/api/donaciones/admin?page=${page}&size=20`),
}

// ── Logística (:8087 vía gateway) ────────────────────────────────────────────
export const logistica = {
  obtenerCentro: (id)       => request(`/api/logistica/centros/${id}`),
  crearEnvio:    (body)     => request('/api/logistica/envios', { method: 'POST', body: JSON.stringify(body) }),
  listarEnvios:  (page = 0) => request(`/api/logistica/envios?page=${page}`),
  rastrear:      (numero)   => request(`/api/logistica/seguimiento/${numero}`),
}

// ── Necesidades (:8088 vía gateway) ──────────────────────────────────────────
export const necesidades = {
  listarZonas:    ()           => request('/api/necesidades/zonas'),
  listarUrgentes: ()           => request('/api/necesidades/reportes/urgentes'),
  listarReportes: (page = 0)   => request(`/api/necesidades/reportes?page=${page}&size=20`),
  crearReporte:   (body)       => request('/api/necesidades/reportes', { method: 'POST', body: JSON.stringify(body) }),
  resumenAdmin:   ()           => request('/api/necesidades/admin/resumen'),
}