import { useState } from 'react'
import AuthModal from './AuthModal'

export default function Navbar() {
  const [modal, setModal] = useState(null) // 'login' | 'register' | null

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 5vw', height: '72px',
        background: 'rgba(10,10,15,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
      }}>
        <a href="#" style={{
          fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800,
          color: 'var(--text)', textDecoration: 'none', letterSpacing: '-0.02em',
          display: 'flex', alignItems: 'center', gap: '10px'
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '.8rem', fontWeight: 800, color: '#fff'
          }}>D</div>
          Donaton<span style={{ color: 'var(--accent)' }}>.</span>
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {['#quienes', '#noticias'].map((href, i) => (
            <a key={i} href={href} style={{
              color: 'var(--muted)', textDecoration: 'none',
              fontSize: '.875rem', transition: 'color .2s'
            }}
              onMouseEnter={e => e.target.style.color = 'var(--text)'}
              onMouseLeave={e => e.target.style.color = 'var(--muted)'}
            >
              {['Quiénes somos', 'Noticias'][i]}
            </a>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setModal('login')} style={{
            background: 'transparent', border: '1px solid var(--border)',
            color: 'var(--text)', padding: '8px 20px', borderRadius: '100px',
            fontFamily: 'var(--font-body)', fontSize: '.875rem', cursor: 'pointer'
          }}>Iniciar sesión</button>
          <button onClick={() => setModal('register')} style={{
            background: 'var(--accent)', border: 'none',
            color: '#fff', padding: '9px 22px', borderRadius: '100px',
            fontFamily: 'var(--font-body)', fontSize: '.875rem',
            fontWeight: 500, cursor: 'pointer',
            boxShadow: '0 0 20px rgba(232,52,90,.3)'
          }}>Registrarse</button>
        </div>
      </nav>

      {modal && <AuthModal initialTab={modal} onClose={() => setModal(null)} />}
    </>
  )
}