import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

/* ─── Datos bancarios ficticios de Donaton ─────────────────────────── */
const DATOS_BANCO = {
  banco:    'Banco Estado',
  tipo:     'Cuenta Corriente',
  numero:   '00-123-45678-9',
  rut:      '76.543.210-K',
  nombre:   'Fundación Donaton Chile',
  email:    'donaciones@donaton.cl',
}

/* ════════════════════════════════════════════════════════════════════ */
export default function ConfirmacionDeposito() {
  const { user, loading: authLoading } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()

  // La donación puede llegar por state (desde MisDonaciones) o en nulo
  const donacionInicial = location.state?.donacion ?? null

  const [step,      setStep]      = useState(1)   // 1=instrucciones, 2=formulario, 3=éxito
  const [form,      setForm]      = useState({
    numeroBoleta:  '',
    banco:         '',
    monto:         donacionInicial?.cantidad ?? '',
    fechaDeposito: new Date().toISOString().slice(0, 10),
    comentario:    '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState(null)
  const [nroSeguimiento, setNroSeguimiento] = useState(null)

  useEffect(() => {
    if (!authLoading && !user) navigate('/')
  }, [user, authLoading, navigate])

  const handleConfirmar = async (e) => {
    e.preventDefault()
    setSubmitting(true); setError(null)
    try {
      const token = localStorage.getItem('token')

      // Si tenemos una donación, actualizamos sus observaciones para marcarla como CONFIRMADO
      if (donacionInicial?.id) {
        const observaciones = `CONFIRMADO | Boleta: ${form.numeroBoleta} | Banco: ${form.banco} | Monto: $${form.monto} CLP | Fecha depósito: ${form.fechaDeposito}${form.comentario ? ` | ${form.comentario}` : ''}`

        // Registramos una nueva donación con las observaciones de confirmación
        // (El backend no tiene PATCH en recursos, usamos el campo observaciones al crear)
        const rutDonante = user?.rut ?? ''
        const body = {
          tipoDonante:   donacionInicial.donanteTipo ?? 'PARTICULAR',
          rut:           rutDonante,
          email:         user?.email ?? '',
          tipoRecurso:   'DINERO',
          cantidad:      parseFloat(form.monto),
          unidadMedida:  'CLP',
          descripcion:   `Depósito bancario confirmado - Boleta ${form.numeroBoleta}`,
          observaciones,
          centroAcopioId: donacionInicial.centroAcopioId ?? null,
        }

        const res = await fetch('http://localhost:9090/api/donaciones', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al confirmar depósito')
        setNroSeguimiento(data.recursoId ?? data.donanteId ?? Math.floor(Math.random() * 90000 + 10000))
      } else {
        // No hay donación previa: simulamos número de seguimiento
        await new Promise(r => setTimeout(r, 1200))
        setNroSeguimiento(Math.floor(Math.random() * 90000 + 10000))
      }
      setStep(3)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: 'var(--font-body)' }}>
      Cargando…
    </div>
  )
  if (!user) return null

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-body)' }}>
      <Navbar />

      <div style={{ paddingTop: 72, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 5vw 80px', width: '100%', flex: 1 }}>

          {/* Breadcrumb */}
          <button onClick={() => navigate('/mis-donaciones')} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '.8rem', padding: 0, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Volver a mis donaciones
          </button>

          {/* Progress */}
          {step < 3 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
              {[1, 2].map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', flex: s < 2 ? 1 : 'none' }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: step >= s ? 'var(--accent)' : 'var(--surface2)',
                    color: step >= s ? '#fff' : 'var(--muted)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.8rem', fontWeight: 700, transition: 'all .3s',
                  }}>{s}</div>
                  <span style={{ marginLeft: 8, fontSize: '.8rem', color: step >= s ? 'var(--text)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                    {s === 1 ? 'Instrucciones' : 'Confirmar'}
                  </span>
                  {s < 2 && <div style={{ flex: 1, height: 1, background: step > s ? 'var(--accent)' : 'var(--border)', margin: '0 16px', transition: 'background .3s' }} />}
                </div>
              ))}
            </div>
          )}

          {/* ── PASO 1: Instrucciones ── */}
          {step === 1 && (
            <div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(232,52,90,.1)', border: '1px solid rgba(232,52,90,.2)', borderRadius: 100, padding: '4px 14px', fontSize: '.75rem', color: 'var(--accent)', letterSpacing: '.08em', textTransform: 'uppercase', fontWeight: 500, marginBottom: 12 }}>
                  💰 Donación en dinero
                </div>
                <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8 }}>
                  Instrucciones de depósito
                </h1>
                <p style={{ color: 'var(--muted)', fontSize: '.9rem', lineHeight: 1.6 }}>
                  Realiza tu transferencia a la cuenta de Donaton y luego confirma el depósito en el siguiente paso.
                </p>
              </div>

              {/* Tarjeta datos bancarios */}
              <div style={{
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 20, padding: 28, marginBottom: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(135deg,var(--accent),var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🏦</div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>Datos bancarios</div>
                    <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>Transferencia o depósito en efectivo</div>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 14 }}>
                  {[
                    ['Banco',          DATOS_BANCO.banco],
                    ['Tipo de cuenta', DATOS_BANCO.tipo],
                    ['N° de cuenta',   DATOS_BANCO.numero],
                    ['RUT titular',    DATOS_BANCO.rut],
                    ['Nombre',         DATOS_BANCO.nombre],
                    ['Email',          DATOS_BANCO.email],
                  ].map(([label, value]) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
                      <span style={{ fontSize: '.75rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0 }}>{label}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, fontSize: '.9rem', textAlign: 'right' }}>{value}</span>
                        <button
                          onClick={() => navigator.clipboard?.writeText(value)}
                          title="Copiar"
                          style={{ background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: '.7rem', color: 'var(--muted)' }}
                        >📋</button>
                      </div>
                    </div>
                  ))}
                </div>

                {donacionInicial?.cantidad && (
                  <div style={{
                    marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Monto de tu donación:</span>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--accent)' }}>
                      ${Number(donacionInicial.cantidad).toLocaleString('es-CL')} CLP
                    </span>
                  </div>
                )}
              </div>

              {/* Aviso importante */}
              <div style={{
                background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)',
                borderRadius: 12, padding: '14px 18px', marginBottom: 24,
                display: 'flex', gap: 10,
              }}>
                <span style={{ flexShrink: 0 }}>⚠️</span>
                <p style={{ fontSize: '.8rem', color: 'var(--text)', lineHeight: 1.5 }}>
                  <strong>Importante:</strong> Una vez realizado el depósito, deberás guardar el número de boleta o comprobante. Lo necesitarás en el siguiente paso para confirmar la transacción.
                </p>
              </div>

              <button
                onClick={() => setStep(2)}
                style={{
                  width: '100%', padding: 14, background: 'var(--accent)', border: 'none', color: '#fff',
                  borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600,
                  cursor: 'pointer', boxShadow: '0 0 24px rgba(232,52,90,.3)', transition: 'opacity .2s',
                }}
              >
                Ya realicé el depósito → Confirmar
              </button>
            </div>
          )}

          {/* ── PASO 2: Formulario confirmación ── */}
          {step === 2 && (
            <div>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-.03em', marginBottom: 8 }}>
                Confirmar depósito
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 28 }}>
                Ingresa los datos de tu comprobante para que podamos verificar la transacción.
              </p>

              <form onSubmit={handleConfirmar} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 24 }}>

                  <Field
                    label="N° de boleta o comprobante *"
                    placeholder="Ej: 123456789"
                    required
                    value={form.numeroBoleta}
                    onChange={v => setForm(p => ({ ...p, numeroBoleta: v }))}
                  />

                  <Field
                    label="Banco desde donde depositaste *"
                    placeholder="Ej: Banco de Chile, Santander…"
                    required
                    value={form.banco}
                    onChange={v => setForm(p => ({ ...p, banco: v }))}
                  />

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                    <Field
                      label="Monto depositado (CLP) *"
                      type="number"
                      placeholder="50000"
                      required
                      value={form.monto}
                      onChange={v => setForm(p => ({ ...p, monto: v }))}
                    />
                    <Field
                      label="Fecha de depósito *"
                      type="date"
                      required
                      value={form.fechaDeposito}
                      onChange={v => setForm(p => ({ ...p, fechaDeposito: v }))}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <label style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>
                      Comentario adicional (opcional)
                    </label>
                    <textarea
                      placeholder="Ej: Depósito realizado el martes por la mañana en sucursal Providencia"
                      rows={3}
                      value={form.comentario}
                      onChange={e => setForm(p => ({ ...p, comentario: e.target.value }))}
                      style={{
                        width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
                        borderRadius: 10, padding: '10px 14px', color: 'var(--text)',
                        fontFamily: 'var(--font-body)', fontSize: '.9rem',
                        outline: 'none', transition: 'border-color .2s', resize: 'vertical', minHeight: 80,
                      }}
                      onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                      onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                    />
                  </div>
                </div>

                {error && (
                  <div style={{ background: 'rgba(232,52,90,.1)', border: '1px solid rgba(232,52,90,.3)', borderRadius: 10, padding: '10px 14px', color: 'var(--accent)', fontSize: '.85rem' }}>
                    {error}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="button" onClick={() => setStep(1)} style={{ flex: '0 0 auto', padding: '13px 20px', background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '.9rem', cursor: 'pointer' }}>
                    ← Volver
                  </button>
                  <button type="submit" disabled={submitting} style={{
                    flex: 1, padding: 13, background: 'var(--accent)', border: 'none', color: '#fff',
                    borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600,
                    cursor: 'pointer', opacity: submitting ? .7 : 1, transition: 'opacity .2s',
                  }}>
                    {submitting ? 'Enviando confirmación…' : '✅ Confirmar depósito'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── PASO 3: Éxito ── */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              {/* Icono animado */}
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg,#10b981,#059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px', fontSize: '2rem',
                boxShadow: '0 0 48px rgba(16,185,129,.35)',
              }}>✅</div>

              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 800, letterSpacing: '-.03em', marginBottom: 10 }}>
                ¡Depósito confirmado!
              </h1>
              <p style={{ color: 'var(--muted)', fontSize: '.95rem', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 28px' }}>
                Hemos recibido la confirmación de tu depósito. Un administrador verificará la transacción y actualizará el estado de tu donación.
              </p>

              {/* N° seguimiento */}
              <div style={{
                display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
                background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 16, padding: '20px 36px', marginBottom: 32,
              }}>
                <span style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>
                  N° de seguimiento
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '.05em', color: 'var(--accent)' }}>
                  #{nroSeguimiento}
                </span>
                <span style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 4 }}>Guarda este número</span>
              </div>

              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/mis-donaciones')}
                  style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '11px 24px', borderRadius: 100, fontFamily: 'var(--font-body)', fontSize: '.875rem', fontWeight: 600, cursor: 'pointer' }}
                >
                  Ver mis donaciones
                </button>
                <button
                  onClick={() => navigate('/')}
                  style={{ background: 'none', border: '1px solid var(--border)', color: 'var(--muted)', padding: '11px 24px', borderRadius: 100, fontFamily: 'var(--font-body)', fontSize: '.875rem', cursor: 'pointer' }}
                >
                  Volver al inicio
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

function Field({ label, type = 'text', placeholder, required, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
      <label style={{ fontSize: '.72rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.07em' }}>{label}</label>
      <input
        type={type} placeholder={placeholder} required={required}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '.9rem', outline: 'none', transition: 'border-color .2s' }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}