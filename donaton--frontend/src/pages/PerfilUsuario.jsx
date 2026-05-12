import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import DonationModal from '../components/user/DonationModal'

/* ─── API helper ────────────────────────────────────────────────────── */
const api = (path, opts = {}) => {
  const token = localStorage.getItem('token')
  return fetch(`http://localhost:9090${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  })
}

/* ─── Estilos base compartidos ──────────────────────────────────────── */
const lbl = {
  fontSize: '.72rem', color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '.07em',
}
const inp = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
  borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
  fontFamily: 'var(--font-body)', fontSize: '.9rem',
  outline: 'none', transition: 'border-color .2s',
}
const card = {
  background: 'var(--surface)', border: '1px solid var(--border)',
  borderRadius: 20, padding: 28,
}

/* ─── Sub-componentes ───────────────────────────────────────────────── */
function FormField({ label, type = 'text', placeholder, required, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={lbl}>{label}</label>
      <input
        type={type} placeholder={placeholder} required={required}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        style={inp}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}

function Pill({ color, bg, children }) {
  return (
    <span style={{
      padding: '3px 12px', borderRadius: 100, background: bg, color,
      fontSize: '.75rem', fontWeight: 600, letterSpacing: '.04em',
    }}>
      {children}
    </span>
  )
}

function DataRow({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: '.92rem', color: 'var(--text)' }}>{value || '—'}</div>
    </div>
  )
}

function ErrorBox({ children }) {
  return (
    <div style={{
      background: 'rgba(232,52,90,.1)', border: '1px solid rgba(232,52,90,.3)',
      borderRadius: 10, padding: '10px 14px', margin: '14px 0',
      color: 'var(--accent)', fontSize: '.85rem',
    }}>
      {children}
    </div>
  )
}

/* ─── Formulario crear / editar donante ─────────────────────────────── */
function PerfilDonanteForm({ donante, user, onSaved }) {
  const isEdit = !!donante
  const [tipo,   setTipo]   = useState(donante?.tipoDonante ?? 'PARTICULAR')
  const [form,   setForm]   = useState({
    rut:            donante?.rut            ?? user?.rut ?? '',
    email:          donante?.email          ?? '',
    telefono:       donante?.telefono       ?? '',
    direccion:      donante?.direccion      ?? '',
    nombres:        donante?.nombres        ?? (donante?.tipoDonante === 'PARTICULAR' ? donante?.nombreVisible?.split(' ')[0] ?? '' : ''),
    apellidos:      donante?.apellidos      ?? (donante?.tipoDonante === 'PARTICULAR' ? donante?.nombreVisible?.split(' ').slice(1).join(' ') ?? '' : ''),
    razonSocial:    donante?.razonSocial    ?? (donante?.tipoDonante === 'EMPRESA'    ? donante?.nombreVisible ?? '' : ''),
    nombreContacto: donante?.nombreContacto ?? '',
    giro:           donante?.giro           ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState(null)

  const f = key => ({ value: form[key], onChange: v => setForm(p => ({ ...p, [key]: v })) })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setError(null)
    try {
      const body = { ...form, tipoDonante: tipo }
      const res  = isEdit
        ? await api(`/api/donaciones/donantes/${donante.id}`, { method: 'PUT',  body: JSON.stringify(body) })
        : await api('/api/donaciones/donantes',               { method: 'POST', body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al guardar')
      onSaved(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={card}>
      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
        {isEdit ? '✏️ Editar perfil de donante' : '📝 Completar perfil de donante'}
      </h3>
      <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginBottom: 24 }}>
        {isEdit
          ? 'Actualiza tus datos para que podamos mantenernos en contacto.'
          : 'Necesitas este perfil para poder registrar donaciones en la plataforma.'}
      </p>

      <form onSubmit={handleSubmit}>
        {!isEdit && (
          <div style={{ marginBottom: 22 }}>
            <label style={lbl}>Tipo de donante</label>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              {[['PARTICULAR', '👤 Persona natural'], ['EMPRESA', '🏢 Empresa']].map(([t, label]) => (
                <button type="button" key={t} onClick={() => setTipo(t)} style={{
                  flex: 1, padding: 12, borderRadius: 12, cursor: 'pointer',
                  border: `1px solid ${tipo === t ? 'var(--accent)' : 'var(--border)'}`,
                  background: tipo === t ? 'rgba(232,52,90,.1)' : 'var(--bg)',
                  color: tipo === t ? 'var(--accent)' : 'var(--muted)',
                  fontFamily: 'var(--font-body)', fontSize: '.875rem',
                  fontWeight: tipo === t ? 600 : 400, transition: 'all .2s',
                }}>{label}</button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 20px' }}>
          {tipo === 'PARTICULAR' ? (
            <>
              <FormField label="Nombres *"   placeholder="Juan"  required {...f('nombres')} />
              <FormField label="Apellidos *" placeholder="Pérez" required {...f('apellidos')} />
            </>
          ) : (
            <>
              <FormField label="Razón social *"       placeholder="Mi Empresa S.A." required {...f('razonSocial')} />
              <FormField label="Nombre de contacto *" placeholder="Juan Pérez"      required {...f('nombreContacto')} />
              <div style={{ gridColumn: '1/-1' }}>
                <FormField label="Giro" placeholder="Comercio al por mayor" {...f('giro')} />
              </div>
            </>
          )}
          <FormField label="RUT *"     placeholder="12345678-9"         required {...f('rut')} />
          <FormField label="Email *"   type="email" placeholder="tu@correo.cl" required {...f('email')} />
          <FormField label="Teléfono"  placeholder="+56 9 1234 5678"    {...f('telefono')} />
          <div style={{ gridColumn: '1/-1' }}>
            <FormField label="Dirección" placeholder="Av. Ejemplo 123, Santiago" {...f('direccion')} />
          </div>
        </div>

        {error && <ErrorBox>{error}</ErrorBox>}

        <button type="submit" disabled={saving} style={{
          width: '100%', padding: 13, marginTop: 20,
          background: 'var(--accent)', border: 'none', color: '#fff',
          borderRadius: 12, fontFamily: 'var(--font-body)',
          fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
          opacity: saving ? .7 : 1, transition: 'opacity .2s',
        }}>
          {saving ? 'Guardando…' : (isEdit ? '💾 Guardar cambios' : '✅ Crear perfil de donante')}
        </button>
      </form>
    </div>
  )
}

/* ════════════════════════════════════════════════════════════════════ */
/*   PÁGINA PRINCIPAL                                                   */
/* ════════════════════════════════════════════════════════════════════ */
export default function PerfilUsuario() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [donante,      setDonante]      = useState(null)
  const [dLoading,     setDLoading]     = useState(false)
  const [tab,          setTab]          = useState('perfil')
  const [showDonation, setShowDonation] = useState(false)

  /* Redirigir si no hay sesión */
  useEffect(() => {
    if (!authLoading && !user) navigate('/')
  }, [user, authLoading, navigate])

  /* Cargar perfil donante por RUT */
  useEffect(() => {
    if (!user?.rut) return
    setDLoading(true)
    api(`/api/donaciones/donantes/rut/${encodeURIComponent(user.rut)}`)
      .then(r => (r.ok ? r.json() : null))
      .then(setDonante)
      .catch(() => setDonante(null))
      .finally(() => setDLoading(false))
  }, [user])

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
        Cargando…
      </div>
    )
  }
  if (!user) return null

  const inicial   = (user.nombre || user.username)?.charAt(0).toUpperCase()
  const isEmpresa = donante?.tipoDonante === 'EMPRESA'

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
      <Navbar />

      {/* ── Banner header ── */}
      <div style={{
        paddingTop: 72,
        background: 'linear-gradient(180deg,rgba(232,52,90,.07) 0%,transparent 100%)',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '40px 5vw 32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,var(--accent),var(--accent2))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', fontWeight: 800, color: '#fff',
              boxShadow: '0 0 32px rgba(232,52,90,.25)',
            }}>{inicial}</div>

            <div style={{ flex: 1, minWidth: 180 }}>
              <h1 style={{
                fontFamily: 'var(--font-display)', fontSize: '1.8rem',
                fontWeight: 800, letterSpacing: '-.03em', marginBottom: 6,
              }}>
                {user.nombre || user.username}
              </h1>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Pill
                  color={donante ? '#10b981' : '#888898'}
                  bg={donante    ? 'rgba(16,185,129,.1)' : 'rgba(255,255,255,.06)'}
                >
                  {donante
                    ? (isEmpresa ? '🏢 Empresa donante' : '✅ Donante activo')
                    : '⚠️ Perfil incompleto'}
                </Pill>
                {user.rut && (
                  <span style={{ fontSize: '.8rem', color: 'var(--muted)' }}>RUT: {user.rut}</span>
                )}
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => donante ? setShowDonation(true) : setTab('completar')}
              style={{
                background: 'var(--accent)', border: 'none', color: '#fff',
                padding: '11px 26px', borderRadius: 100,
                fontFamily: 'var(--font-body)', fontSize: '.9rem', fontWeight: 600,
                cursor: 'pointer', boxShadow: '0 0 24px rgba(232,52,90,.3)',
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(232,52,90,.5)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 0 24px rgba(232,52,90,.3)' }}
            >
              {donante ? '❤️ Hacer donación' : '📝 Completar perfil'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Cuerpo ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 5vw 80px' }}>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 4, marginBottom: 28,
          background: 'var(--surface)', borderRadius: 12, padding: 4,
          width: 'fit-content',
        }}>
          {[
            ['perfil',    '👤 Mi perfil'],
            ['completar', donante ? '✏️ Editar datos' : '📝 Completar perfil'],
            ['cuenta',    '🔒 Cuenta'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: '8px 18px', border: 'none', borderRadius: 8, cursor: 'pointer',
              fontFamily: 'var(--font-body)', fontSize: '.85rem',
              background: tab === id ? 'var(--accent)' : 'none',
              color:      tab === id ? '#fff' : 'var(--muted)',
              fontWeight: tab === id ? 600 : 400, transition: 'all .2s',
            }}>{label}</button>
          ))}
        </div>

        {/* ── TAB: Resumen perfil ── */}
        {tab === 'perfil' && (
          <>
            {dLoading ? (
              <div style={{ ...card, textAlign: 'center', padding: '48px 0', color: 'var(--muted)' }}>Cargando perfil…</div>
            ) : !donante ? (
              <div style={card}>
                <div style={{
                  background: 'rgba(232,52,90,.08)', border: '1px solid rgba(232,52,90,.2)',
                  borderRadius: 12, padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>⚠️</span>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: 6 }}>Perfil de donante incompleto</p>
                    <p style={{ color: 'var(--muted)', fontSize: '.875rem', lineHeight: 1.5 }}>
                      Para registrar donaciones necesitas completar tu perfil de donante.{' '}
                      <button
                        onClick={() => setTab('completar')}
                        style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '.875rem', padding: 0, fontWeight: 500 }}
                      >
                        Completar ahora →
                      </button>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div style={card}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>
                  {isEmpresa ? '🏢 Datos de la empresa' : '👤 Datos personales'}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
                  <DataRow label="Nombre / Razón social" value={donante.nombreVisible} />
                  <DataRow label="RUT"                   value={donante.rut} />
                  <DataRow label="Email"                 value={donante.email} />
                  <DataRow label="Tipo de donante"       value={isEmpresa ? 'Empresa' : 'Persona natural'} />
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setTab('completar')}
                    style={{ background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 18px', borderRadius: 100, fontFamily: 'var(--font-body)', fontSize: '.8rem', cursor: 'pointer' }}
                  >✏️ Editar datos</button>
                  <button
                    onClick={() => navigate('/mis-donaciones')}
                    style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '8px 18px', borderRadius: 100, fontFamily: 'var(--font-body)', fontSize: '.8rem', cursor: 'pointer' }}
                  >📋 Ver mis donaciones</button>
                  <button
                    onClick={() => setShowDonation(true)}
                    style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '8px 18px', borderRadius: 100, fontFamily: 'var(--font-body)', fontSize: '.8rem', fontWeight: 600, cursor: 'pointer' }}
                  >❤️ Nueva donación</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TAB: Completar / Editar donante ── */}
        {tab === 'completar' && (
          <PerfilDonanteForm
            donante={donante}
            user={user}
            onSaved={d => { setDonante(d); setTab('perfil') }}
          />
        )}

        {/* ── TAB: Cuenta ── */}
        {tab === 'cuenta' && (
          <div style={card}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>
              🔒 Información de cuenta
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 24px' }}>
              <DataRow label="Usuario" value={user.username} />
              <DataRow label="Nombre"  value={user.nombre} />
              <DataRow label="RUT"     value={user.rut || '—'} />
              <DataRow label="Rol"     value={user.rol === 'ROLE_ADMIN' ? 'Administrador' : 'Donante'} />
            </div>
            <p style={{ marginTop: 20, fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              Para cambiar tu contraseña contacta al administrador de la plataforma.
            </p>
          </div>
        )}
      </div>

      {/* Modal de donación */}
      {showDonation && (
        <DonationModal
          donante={donante}
          user={user}
          onClose={() => setShowDonation(false)}
          onSuccess={() => { setShowDonation(false); navigate('/mis-donaciones') }}
        />
      )}

      <Footer />
    </div>
  )
}