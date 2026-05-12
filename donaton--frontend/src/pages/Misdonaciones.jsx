import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DonationModal from '../components/user/DonationModal'

/* ─── helpers ──────────────────────────────────────────────────────── */
const TIPO_META = {
  ALIMENTOS:      { icon: '🥫', label: 'Alimentos',      color: '#f59e0b' },
  ROPA:           { icon: '👕', label: 'Ropa',           color: '#3b82f6' },
  INSUMOS_MEDICOS:{ icon: '💊', label: 'Insumos médicos',color: '#10b981' },
  INSUMOS_HIGIENE:{ icon: '🧴', label: 'Higiene',        color: '#8b5cf6' },
  DINERO:         { icon: '💰', label: 'Dinero',         color: '#e8345a' },
  OTRO:           { icon: '📦', label: 'Otro',           color: '#6b7280' },
}

/* El backend aún no tiene campo "estado"; lo simulamos con un campo
   observaciones que el admin puede rellenar. Mientras tanto mostramos
   PENDIENTE como estado inicial de toda donación nueva.              */
const ESTADO_META = {
  PENDIENTE:  { label: 'Pendiente',  color: '#f59e0b', bg: 'rgba(245,158,11,.1)',  icon: '⏳' },
  APROBADO:   { label: 'Aprobado',   color: '#10b981', bg: 'rgba(16,185,129,.1)', icon: '✅' },
  RECHAZADO:  { label: 'Rechazado',  color: '#e8345a', bg: 'rgba(232,52,90,.1)',  icon: '❌' },
  CONFIRMADO: { label: 'Confirmado', color: '#3b82f6', bg: 'rgba(59,130,246,.1)', icon: '🏦' },
}

function getEstado(d) {
  const obs = (d.observaciones ?? '').toUpperCase()
  if (obs.includes('APROBADO'))   return 'APROBADO'
  if (obs.includes('RECHAZADO'))  return 'RECHAZADO'
  if (obs.includes('CONFIRMADO')) return 'CONFIRMADO'
  return 'PENDIENTE'
}

function fmt(fecha) {
  if (!fecha) return '—'
  return new Date(fecha).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })
}

function TipoBadge({ tipo }) {
  const m = TIPO_META[tipo] ?? TIPO_META.OTRO
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      background: m.color + '18', color: m.color,
      fontSize: '.72rem', fontWeight: 600, letterSpacing: '.04em',
    }}>
      {m.icon} {m.label}
    </span>
  )
}

function EstadoBadge({ estado }) {
  const m = ESTADO_META[estado] ?? ESTADO_META.PENDIENTE
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      background: m.bg, color: m.color,
      fontSize: '.72rem', fontWeight: 600, letterSpacing: '.04em',
    }}>
      {m.icon} {m.label}
    </span>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '18px 22px',
    }}>
      <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-.02em' }}>{value}</div>
      <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginTop: 2 }}>{label}</div>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════ */
export default function MisDonaciones() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [donante,      setDonante]      = useState(null)
  const [historial,    setHistorial]    = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showDonation, setShowDonation] = useState(false)
  const [filtroTipo,   setFiltroTipo]   = useState('TODOS')
  const [filtroEstado, setFiltroEstado] = useState('TODOS')

  useEffect(() => {
    if (!authLoading && !user) navigate('/')
  }, [user, authLoading, navigate])

  /* Cargar donante y historial */
  useEffect(() => {
    if (!user?.rut) return
    const token = localStorage.getItem('token')
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }

    Promise.all([
      fetch(`http://localhost:9090/api/donaciones/donantes/rut/${encodeURIComponent(user.rut)}`, { headers })
        .then(r => r.ok ? r.json() : null),
      fetch(`http://localhost:9090/api/donaciones/historial?rut=${encodeURIComponent(user.rut)}`, { headers })
        .then(r => r.ok ? r.json() : []),
    ])
      .then(([d, h]) => { setDonante(d); setHistorial(Array.isArray(h) ? h : []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  if (authLoading || loading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
      Cargando…
    </div>
  )
  if (!user) return null

  /* Stats */
  const total      = historial.length
  const pendientes = historial.filter(d => getEstado(d) === 'PENDIENTE').length
  const aprobados  = historial.filter(d => getEstado(d) === 'APROBADO').length

  /* Filtros */
  const filtrado = historial.filter(d => {
    const tipo   = filtroTipo   === 'TODOS' || d.tipoRecurso === filtroTipo
    const estado = filtroEstado === 'TODOS' || getEstado(d) === filtroEstado
    return tipo && estado
  })

  const tiposDisponibles = [...new Set(historial.map(d => d.tipoRecurso))]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
      <Navbar />

      {/* Header */}
      <div style={{ paddingTop: 72, borderBottom: '1px solid var(--border)', background: 'linear-gradient(180deg,rgba(232,52,90,.05) 0%,transparent 100%)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '36px 5vw 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <button onClick={() => navigate('/perfil')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '.8rem', padding: 0, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 4 }}>
                ← Volver al perfil
              </button>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-.03em', marginBottom: 4 }}>
                Mis donaciones
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '.875rem' }}>
                Historial completo de tus aportes a Donaton
              </p>
            </div>
            {donante && (
              <button
                onClick={() => setShowDonation(true)}
                style={{
                  background: 'var(--accent)', border: 'none', color: '#fff',
                  padding: '11px 24px', borderRadius: 100,
                  fontFamily: 'var(--font-body)', fontSize: '.875rem', fontWeight: 600,
                  cursor: 'pointer', boxShadow: '0 0 20px rgba(232,52,90,.3)',
                }}
              >
                ❤️ Nueva donación
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: 12, marginTop: 24 }}>
            <StatCard icon="📦" label="Total donaciones" value={total} />
            <StatCard icon="⏳" label="Pendientes"        value={pendientes} />
            <StatCard icon="✅" label="Aprobadas"         value={aprobados} />
            <StatCard icon="📅" label="Última donación"   value={historial[0] ? fmt(historial[0].fechaDonacion) : '—'} />
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '28px 5vw 80px' }}>

        {/* Filtros */}
        {historial.length > 0 && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>Filtrar:</span>

            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '.8rem', cursor: 'pointer', outline: 'none' }}
            >
              <option value="TODOS">Todos los tipos</option>
              {tiposDisponibles.map(t => (
                <option key={t} value={t}>{TIPO_META[t]?.label ?? t}</option>
              ))}
            </select>

            <select
              value={filtroEstado}
              onChange={e => setFiltroEstado(e.target.value)}
              style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '.8rem', cursor: 'pointer', outline: 'none' }}
            >
              <option value="TODOS">Todos los estados</option>
              {Object.entries(ESTADO_META).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>

            <span style={{ fontSize: '.8rem', color: 'var(--muted)', marginLeft: 'auto' }}>
              {filtrado.length} de {total} resultado{total !== 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Panel */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, overflow: 'hidden' }}>
          {historial.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '56px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📭</div>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, marginBottom: 8 }}>Sin donaciones aún</p>
              <p style={{ fontSize: '.875rem', marginBottom: 20 }}>Aún no has registrado ninguna donación.</p>
              {donante ? (
                <button onClick={() => setShowDonation(true)} style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 100, fontFamily: 'var(--font-body)', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer' }}>
                  ❤️ Hacer mi primera donación
                </button>
              ) : (
                <button onClick={() => navigate('/perfil')} style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '10px 24px', borderRadius: 100, fontFamily: 'var(--font-body)', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer' }}>
                  📝 Completar mi perfil primero
                </button>
              )}
            </div>
          ) : filtrado.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
              <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>🔍</div>
              Sin resultados para los filtros seleccionados.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    {['Tipo', 'Descripción', 'Cantidad', 'Centro', 'Estado', 'Fecha'].map(h => (
                      <th key={h} style={{ padding: '12px 16px', textAlign: 'left', color: 'var(--muted)', fontWeight: 500, fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtrado.map((d, i) => {
                    const estado = getEstado(d)
                    return (
                      <tr
                        key={d.id ?? i}
                        style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface2)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                      >
                        <td style={{ padding: '13px 16px' }}><TipoBadge tipo={d.tipoRecurso} /></td>
                        <td style={{ padding: '13px 16px', color: 'var(--muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {d.descripcion || '—'}
                        </td>
                        <td style={{ padding: '13px 16px', fontWeight: 600 }}>
                          {d.cantidad} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{d.unidadMedida}</span>
                        </td>
                        <td style={{ padding: '13px 16px', color: 'var(--muted)', fontSize: '.8rem' }}>
                          {d.centroAcopioId ? `Centro #${d.centroAcopioId}` : '—'}
                        </td>
                        <td style={{ padding: '13px 16px' }}>
                          <EstadoBadge estado={estado} />
                          {estado === 'PENDIENTE' && d.tipoRecurso === 'DINERO' && (
                            <div style={{ marginTop: 4 }}>
                              <button
                                onClick={() => navigate('/confirmar-deposito', { state: { donacion: d } })}
                                style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: '.72rem', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: 0, textDecoration: 'underline' }}
                              >
                                Confirmar depósito →
                              </button>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '13px 16px', color: 'var(--muted)', fontSize: '.8rem', whiteSpace: 'nowrap' }}>
                          {fmt(d.fechaDonacion)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Aviso aprobación */}
        {historial.length > 0 && (
          <div style={{
            marginTop: 16,
            background: 'rgba(59,130,246,.07)', border: '1px solid rgba(59,130,246,.15)',
            borderRadius: 12, padding: '12px 16px',
            display: 'flex', gap: 10, alignItems: 'flex-start',
          }}>
            <span style={{ flexShrink: 0 }}>ℹ️</span>
            <p style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>
              Todas las donaciones quedan en estado <strong style={{ color: 'var(--text)' }}>Pendiente</strong> hasta ser revisadas por un administrador.
              Las donaciones en dinero requieren confirmación de depósito adicional.
            </p>
          </div>
        )}
      </div>

      {showDonation && (
        <DonationModal
          donante={donante}
          user={user}
          onClose={() => setShowDonation(false)}
          onSuccess={nueva => {
            setHistorial(h => [nueva, ...h])
            setShowDonation(false)
          }}
        />
      )}

      <Footer />
    </div>
  )
}