import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Dashboard from '../components/admin/Dashboard'
import GestionDonaciones from '../components/admin/GestionDonaciones'
import GestionLogistica from '../components/admin/GestionLogistica'
import GestionNecesidades from '../components/admin/GestionNecesidades'
import GestionUsuarios from '../components/admin/GestionUsuarios'

const TABS = [
  { id: 'dashboard',   icon: '▦',  label: 'Dashboard' },
  { id: 'usuarios',    icon: '👥', label: 'Usuarios' },
  { id: 'donaciones',  icon: '💝', label: 'Donaciones' },
  { id: 'logistica',   icon: '🚚', label: 'Logística' },
  { id: 'necesidades', icon: '📋', label: 'Necesidades' },
]

export default function AdminPanel() {
  const { user, logout, isAdmin } = useAuth()
  const [tab, setTab] = useState('dashboard')

  if (!isAdmin) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: '3rem' }}>🔒</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700 }}>Acceso restringido</div>
      <div style={{ color: 'var(--muted)' }}>Solo administradores pueden acceder a este panel.</div>
      <a href="/" style={{ color: 'var(--accent)', textDecoration: 'none', marginTop: 8 }}>← Volver al inicio</a>
    </div>
  )

  const titles = {
  dashboard:   'Dashboard general',
  usuarios:    'Gestión de usuarios',
  donaciones:  'Gestión de donaciones',
  logistica:   'Gestión logística',
  necesidades: 'Gestión de necesidades',
}
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Sidebar */}
      <aside style={{ width: 240, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-.02em' }}>
            Donaton<span style={{ color: 'var(--accent)' }}>.</span>
          </div>
          <div style={{ fontSize: '.72rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginTop: 2 }}>Panel Admin</div>
        </div>

        <nav style={{ flex: 1, padding: '12px 10px' }}>
          {TABS.map(({ id, icon, label }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => setTab(id)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 12px', borderRadius: 10, border: 'none',
                background: active ? 'rgba(232,52,90,.12)' : 'none',
                color: active ? 'var(--accent)' : 'var(--muted)',
                fontFamily: 'var(--font-body)', fontSize: '.875rem',
                fontWeight: active ? 600 : 400, cursor: 'pointer',
                transition: 'all .15s', marginBottom: 2, textAlign: 'left',
              }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)' } }}
              >
                <span style={{ fontSize: '1rem', width: 20, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                {label}
                {active && <div style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)' }} />}
              </button>
            )
          })}
        </nav>

        <div style={{ padding: '16px 10px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: 'var(--surface2)', marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.8rem', fontWeight: 700, color: '#fff' }}>
              {(user?.nombre || user?.username)?.charAt(0).toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '.8rem', fontWeight: 500, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user?.nombre?.split(' ')[0] || user?.username}
              </div>
              <div style={{ fontSize: '.7rem', color: 'var(--accent)' }}>Administrador</div>
            </div>
          </div>

          <button onClick={logout} style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: 'none', background: 'none', color: 'var(--muted)', fontFamily: 'var(--font-body)', fontSize: '.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,52,90,.08)'; e.currentTarget.style.color = '#e8345a' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)' }}
          ><span>🚪</span>Cerrar sesión</button>

          <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', borderRadius: 10, color: 'var(--muted)', textDecoration: 'none', fontFamily: 'var(--font-body)', fontSize: '.85rem', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface2)'; e.currentTarget.style.color = 'var(--text)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--muted)' }}
          ><span>←</span>Ir al inicio</a>
        </div>
      </aside>

      {/* Contenido */}
      <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 32 }}>
          <div style={{ fontSize: '.75rem', color: 'var(--accent)', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', marginBottom: 6 }}>Panel de administración</div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-.02em' }}>{titles[tab]}</h1>
        </div>

        {tab === 'dashboard'   && <Dashboard onNavigate={setTab} />}
        {tab === 'donaciones'  && <GestionDonaciones />}
        {tab === 'logistica'   && <GestionLogistica />}
        {tab === 'necesidades' && <GestionNecesidades />}
        {tab === 'usuarios'    && <GestionUsuarios />}
      </main>

      <style>{`@keyframes modalIn { from{opacity:0;transform:scale(.94) translateY(12px)} to{opacity:1;transform:none} }`}</style>
    </div>
  )
}