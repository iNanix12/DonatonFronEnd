import { useState } from 'react'
import AuthModal from './AuthModal'

export default function Hero() {
  const [modal, setModal] = useState(null)

  return (
    <>
      <section style={{
        minHeight: '100vh', display: 'grid', placeItems: 'center',
        position: 'relative', padding: '100px 5vw 80px', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', width: 700, height: 700, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,52,90,.12) 0%, transparent 70%)',
          top: -200, right: -100, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,107,53,.08) 0%, transparent 70%)',
          bottom: 0, left: -100, pointerEvents: 'none',
        }} />

        <div style={{
          maxWidth: 1100, width: '100%',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 60, alignItems: 'center', position: 'relative', zIndex: 1,
        }}>
          {/* Izquierda */}
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(232,52,90,.1)', border: '1px solid rgba(232,52,90,.25)',
              borderRadius: 100, padding: '6px 14px', fontSize: '.8rem',
              color: 'var(--accent)', letterSpacing: '.08em', textTransform: 'uppercase',
              fontWeight: 500, marginBottom: 24,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              🇨🇱 Red solidaria Chile
            </div>

            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(2.8rem, 5vw, 4.2rem)',
              fontWeight: 800, lineHeight: 1.05, letterSpacing: '-.03em',
            }}>
              Dona hoy,<br />
              <span style={{
                background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>transforma</span>
              <br />una vida
            </h1>

            <p style={{
              color: 'var(--muted)', fontSize: '1.05rem', lineHeight: 1.7,
              margin: '20px 0 36px', maxWidth: 460, fontWeight: 300,
            }}>
              Conectamos donantes con quienes más lo necesitan. Una plataforma transparente
              para canalizar ayuda en desastres y emergencias a lo largo de todo Chile.
            </p>

            <div style={{ display: 'flex', gap: 14 }}>
              <button onClick={() => setModal('register')} style={{
                background: 'var(--accent)', border: 'none', color: '#fff',
                padding: '14px 28px', borderRadius: 14, fontFamily: 'var(--font-body)',
                fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
                boxShadow: '0 0 24px rgba(232,52,90,.35)',
              }}>Quiero donar</button>
              <button style={{
                background: 'transparent', border: '1px solid var(--border)',
                color: 'var(--text)', padding: '14px 28px', borderRadius: 14,
                fontFamily: 'var(--font-body)', fontSize: '1rem', cursor: 'pointer',
              }}>Ver necesidades</button>
            </div>

            <div style={{ display: 'flex', gap: 32, marginTop: 48 }}>
              {[['4.800+', 'Familias ayudadas'], ['127', 'Toneladas donadas'], ['15', 'Regiones activas']].map(([num, label]) => (
                <div key={label} style={{ borderLeft: '2px solid var(--accent)', paddingLeft: 16 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>{num}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '.8rem', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Derecha — tarjeta */}
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute', top: -16, right: 24, zIndex: 2,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              color: '#fff', borderRadius: 100, padding: '8px 16px',
              fontSize: '.8rem', fontWeight: 600, whiteSpace: 'nowrap',
              boxShadow: '0 8px 24px rgba(232,52,90,.4)',
              animation: 'float 3s ease-in-out infinite',
            }}>🔴 En vivo — 3 emergencias activas</div>

            <div style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: 24, padding: 28,
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 600, marginBottom: 20 }}>
                Donaciones recientes
              </div>
              {[
                { icon: '🍚', bg: 'rgba(232,52,90,.15)',   nombre: 'Alimentos — Valparaíso',  meta: 'Hace 12 min · Centro Acopio #3', amount: '80 kg'  },
                { icon: '💊', bg: 'rgba(255,107,53,.15)',  nombre: 'Insumos médicos — Temuco', meta: 'Hace 35 min · Centro Acopio #7', amount: '40 u'   },
                { icon: '💰', bg: 'rgba(100,200,150,.15)', nombre: 'Dinero — Santiago',        meta: 'Hace 1h · Empresa Ejemplo SpA',  amount: '$250k'  },
              ].map(item => (
                <div key={item.nombre} style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: 12,
                  background: 'var(--surface2)', borderRadius: 12, marginBottom: 10,
                  border: '1px solid var(--border)',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10, background: item.bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.1rem', flexShrink: 0,
                  }}>{item.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.875rem', fontWeight: 500 }}>{item.nombre}</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2 }}>{item.meta}</div>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '.9rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {item.amount}
                  </div>
                </div>
              ))}
              <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, marginTop: 16, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '73%', borderRadius: 2, background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '.75rem', color: 'var(--muted)', marginTop: 6 }}>
                <span>Meta mensual</span><span>73% alcanzado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {modal && <AuthModal initialTab={modal} onClose={() => setModal(null)} />}
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </>
  )
}