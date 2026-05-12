const BASE_URL = 'http://localhost:9090'

function getToken() {
  // Intenta localStorage primero, luego sessionStorage como fallback
  return localStorage.getItem('token') || sessionStorage.getItem('token') || null
}

function authHeaders() {
  const token = getToken()
  if (!token) {
    console.warn('[adminApi] No hay token en localStorage — request sin Authorization')
  }
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function req(path, options = {}) {
  const headers = { ...authHeaders(), ...(options.headers || {}) }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    // Intenta parsear el error como JSON, si no usa el statusText
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw { status: res.status, message: err.error || err.mensaje || `Error ${res.status}` }
  }

  // 204 No Content o respuesta sin body (Content-Length: 0)
  if (res.status === 204) return null
  
  const contentLength = res.headers.get('content-length')
  const contentType   = res.headers.get('content-type')
  
  // Si no hay body o no es JSON, retornar null sin intentar parsear
  if (contentLength === '0' || !contentType?.includes('application/json')) {
    return null
  }

  return res.json()
}

export const adminDonaciones = {
  listarGlobal:    (page = 0, size = 20) => req(`/api/donaciones/admin?page=${page}&size=${size}`),
  historialPorRut: (rut, page = 0)       => req(`/api/donaciones/historial/paginado?rut=${rut}&page=${page}&size=10`),
  registrar:       (body)                => req('/api/donaciones', { method: 'POST', body: JSON.stringify(body) }),

  // Donantes
  listarDonantes:   ()          => req('/api/donaciones/donantes'),
  obtenerDonante:   (rut)       => req(`/api/donaciones/donantes/rut/${rut}`),
  actualizarDonante:(id, body)  => req(`/api/donaciones/donantes/${id}`, { method: 'PUT',    body: JSON.stringify(body) }),
  eliminarDonante:  (id)        => req(`/api/donaciones/donantes/${id}`, { method: 'DELETE' }),

  // Recursos
  eliminarRecurso:  (id)        => req(`/api/donaciones/recursos/${id}`, { method: 'DELETE' }),
}

export const adminLogistica = {
  listarCentros:       (region = '')  => req(`/api/logistica/centros${region ? `?region=${region}` : ''}`),
  obtenerCentro:       (id)           => req(`/api/logistica/centros/${id}`),
  crearCentro:         (body)         => req('/api/logistica/centros', { method: 'POST', body: JSON.stringify(body) }),
  recibirDonacion:     (centroId, tipoRecurso, cantidad, unidadMedida) =>
    req(`/api/logistica/inventario/recibir/${centroId}?tipoRecurso=${tipoRecurso}&cantidad=${cantidad}&unidadMedida=${unidadMedida}`, { method: 'POST' }),
  listarEnvios:        (page = 0, size = 20) => req(`/api/logistica/envios?page=${page}&size=${size}`),
  listarEnviosPorCentro: (centroId, page = 0) => req(`/api/logistica/envios/centro/${centroId}?page=${page}&size=10`),
  planificarEnvio:     (body)         => req('/api/logistica/envios', { method: 'POST', body: JSON.stringify(body) }),
  despachar:           (id)           => req(`/api/logistica/envios/${id}/despachar`, { method: 'PATCH' }),
  confirmarEntrega:    (id, observaciones) => req(`/api/logistica/envios/${id}/entregar`, { method: 'PATCH', body: JSON.stringify({ observaciones }) }),
  cancelar:            (id, motivo)   => req(`/api/logistica/envios/${id}/cancelar`, { method: 'PATCH', body: JSON.stringify({ motivo }) }),
  rastrear:            (numero)       => req(`/api/logistica/seguimiento/${numero}`),
  // Agrega estas 3 líneas dentro del objeto adminLogistica
  actualizarCentro: (id, body) => req(`/api/logistica/centros/${id}`,               { method: 'PUT',    body: JSON.stringify(body) }),
  toggleEstado:     (id)       => req(`/api/logistica/centros/${id}/toggle-estado`,  { method: 'PATCH' }),
  eliminarCentro:   (id)       => req(`/api/logistica/centros/${id}`,               { method: 'DELETE' }),
  // Distribucion de Inventario a los centros de acopio
  distribuirAlInventario: (centroId, tipoRecurso, cantidad, unidadMedida) => {
  // NO usar encodeURIComponent en tipoRecurso — el backend espera el string exacto
  const params = new URLSearchParams({
    tipoRecurso:  tipoRecurso,
    cantidad:     String(cantidad),
    unidadMedida: unidadMedida,
  })
  return req(`/api/logistica/inventario/recibir/${centroId}?${params.toString()}`, { method: 'POST' })},
}

export const adminNecesidades = {
  resumen:              ()              => req('/api/necesidades/admin/resumen'),

  // Zonas
  listarZonas:          ()              => req('/api/necesidades/zonas/todas'),
  listarZonasActivas:   ()              => req('/api/necesidades/zonas'),
  listarZonasPorRegion: (region)        => req(`/api/necesidades/zonas/region/${region}`),
  obtenerZona:          (id)            => req(`/api/necesidades/zonas/${id}`),
  crearZona:            (body)          => req('/api/necesidades/zonas',   { method: 'POST',   body: JSON.stringify(body) }),
  actualizarZona:       (id, body)      => req(`/api/necesidades/zonas/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminarZona:         (id)            => req(`/api/necesidades/zonas/${id}`, { method: 'DELETE' }),
  cerrarZona:           (id)            => req(`/api/necesidades/zonas/${id}/cerrar`, { method: 'PATCH' }),

  // Reportes
  listarUrgentes:       ()              => req('/api/necesidades/reportes/urgentes'),
  listarReportes:       (page = 0, size = 20) => req(`/api/necesidades/reportes?page=${page}&size=${size}`),
  listarReportesPorZona:(zonaId)        => req(`/api/necesidades/reportes/zona/${zonaId}`),
  obtenerReporte:       (id)            => req(`/api/necesidades/reportes/${id}`),
  crearReporte:         (body)          => req('/api/necesidades/reportes',    { method: 'POST',   body: JSON.stringify(body) }),
  actualizarReporte:    (id, body)      => req(`/api/necesidades/reportes/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  eliminarReporte:      (id)            => req(`/api/necesidades/reportes/${id}`, { method: 'DELETE' }),
  actualizarEstado:     (id, nuevoEstado, observaciones = '') =>
    req(`/api/necesidades/reportes/${id}/estado`, { method: 'PATCH', body: JSON.stringify({ nuevoEstado, observaciones }) }),

  // Asignaciones
  listarAsignaciones:   (reporteId)     => req(`/api/necesidades/asignaciones/reporte/${reporteId}`),
  crearAsignacion:      (body)          => req('/api/necesidades/asignaciones', { method: 'POST', body: JSON.stringify(body) }),
  confirmarAsignacion:  (id)            => req(`/api/necesidades/asignaciones/${id}/confirmar`, { method: 'PATCH' }),
  cancelarAsignacion:   (id, motivo)    => req(`/api/necesidades/asignaciones/${id}/cancelar?motivo=${encodeURIComponent(motivo)}`, { method: 'PATCH' }),
  eliminarAsignacion:   (id)            => req(`/api/necesidades/asignaciones/${id}`, { method: 'DELETE' }),
}


export const adminUsuarios = {
  listar:          ()        => req('/auth/usuarios'),
  obtener:         (id)      => req(`/auth/usuarios/${id}`),
  actualizar:      (id, body) => req(`/auth/usuarios/${id}`, { method: 'PUT',   body: JSON.stringify(body) }),
  cambiarPassword: (id, pwd)  => req(`/auth/usuarios/${id}/password`, { method: 'PATCH', body: JSON.stringify({ nuevaPassword: pwd }) }),
  toggleActivo:    (id)       => req(`/auth/usuarios/${id}/toggle-activo`, { method: 'PATCH' }),
  eliminar:        (id)       => req(`/auth/usuarios/${id}`, { method: 'DELETE' }),
}


