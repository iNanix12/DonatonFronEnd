import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import AuthModal from './AuthModal'

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth()
  const [modal, setModal]           = useState(null)
  const [dropdownOpen, setDropdown] = useState(false)

  // Escucha eventos del Hero u otros componentes que quieran abrir el modal
  useEffect(() => {
    const handler = (e) => setModal(e.detail)
    window.addEventListener('abrir-auth', handler)
    return () => window.removeEventListener('abrir-auth', handler)
  }, [])

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5vw', height: 72,
        background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <a href="#" style={{
          fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800,
          color: 'var(--text)', textDecoration: 'none', letterSpacing: '-.02em',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.8rem', fontWeight: 800, color: '#fff',
          }}>D</div>
          Donaton<span style={{ color: 'var(--accent)' }}>.</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {[['#quienes', 'Quiénes somos'], ['#noticias', 'Noticias'], ['#', 'Cómo donar']].map(([href, label]) => (
            <a key={label} href={href} style={{
              color: 'var(--muted)', textDecoration: 'none', fontSize: '.875rem', transition: 'color .2s',
            }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >{label}</a>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setDropdown(o => !o)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 100, padding: '6px 16px 6px 6px', cursor: 'pointer',
                transition: 'border-color .2s',
              }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(232,52,90,.4)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.75rem', fontWeight: 700, color: '#fff',
                }}>
                  {(user.nombre || user.username)?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '.8rem', fontWeight: 500, color: 'var(--text)', lineHeight: 1.2 }}>
                    {user.nombre?.split(' ')[0] || user.username}
                  </div>
                  <div style={{ fontSize: '.7rem', color: isAdmin ? 'var(--accent)' : 'var(--muted)', lineHeight: 1.2 }}>
                    {isAdmin ? 'Administrador' : 'Donante'}
                  </div>
                </div>
                <span style={{ color: 'var(--muted)', fontSize: '.7rem' }}>▾</span>
              </button>

              {dropdownOpen && (
                <div style={{
                  position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 14, padding: 8, minWidth: 180,
                  boxShadow: '0 16px 40px rgba(0,0,0,.5)',
                }}>
                  {[
                    ['👤', 'Mi perfil'],
                    ['📋', 'Mis donaciones'],
                    ...(isAdmin ? [['⚙️', 'Panel admin']] : []),
                  ].map(([icon, label]) => (
                    <button key={label} style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', background: 'none', border: 'none',
                      borderRadius: 8, color: 'var(--text)', fontSize: '.875rem', cursor: 'pointer',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    ><span>{icon}</span>{label}</button>
                  ))}
                  <div style={{ height: 1, background: 'var(--border)', margin: '6px 0' }} />
                  <button onClick={() => { logout(); setDropdown(false) }} style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 12px', background: 'none', border: 'none',
                    borderRadius: 8, color: 'var(--accent)', fontSize: '.875rem', cursor: 'pointer',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,52,90,.08)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  ><span>🚪</span>Cerrar sesión</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => setModal('login')} style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '8px 20px', borderRadius: 100,
                fontFamily: 'var(--font-body)', fontSize: '.875rem', cursor: 'pointer',
              }}>Iniciar sesión</button>
              <button onClick={() => setModal('register')} style={{
                background: 'var(--accent)', border: 'none', color: '#fff',
                padding: '9px 22px', borderRadius: 100,
                fontFamily: 'var(--font-body)', fontSize: '.875rem', fontWeight: 500, cursor: 'pointer',
                boxShadow: '0 0 20px rgba(232,52,90,.3)',
              }}>Registrarse</button>
            </>
          )}
        </div>
      </nav>

      {modal && <AuthModal initialTab={modal} onClose={() => setModal(null)} />}
    </>
  )
}