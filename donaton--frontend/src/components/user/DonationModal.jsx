import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/* ─── Tipos que existen en el backend (RecursoDonado.TipoRecurso) ─── */
const TIPOS = [
  { value: 'ALIMENTOS',       icon: '🥫', label: 'Alimentos',       hint: 'Conservas, granos, lácteos…' },
  { value: 'ROPA',            icon: '👕', label: 'Ropa',            hint: 'Prendas en buen estado' },
  { value: 'INSUMOS_MEDICOS', icon: '💊', label: 'Insumos médicos', hint: 'Medicamentos, insumos clínicos' },
  { value: 'INSUMOS_HIGIENE', icon: '🧴', label: 'Higiene',         hint: 'Artículos de aseo personal' },
  { value: 'DINERO',          icon: '💰', label: 'Dinero',          hint: 'Depósito bancario en efectivo' },
  { value: 'OTRO',            icon: '📦', label: 'Otro',            hint: 'Herramientas, muebles…' },
]

const UNIDADES_POR_TIPO = {
  ALIMENTOS:       ['kg', 'litros', 'cajas', 'bolsas', 'unidades'],
  ROPA:            ['unidades', 'bolsas', 'cajas'],
  INSUMOS_MEDICOS: ['unidades', 'cajas', 'kg'],
  INSUMOS_HIGIENE: ['unidades', 'cajas', 'litros'],
  DINERO:          ['CLP'],
  OTRO:            ['unidades', 'kg', 'cajas', 'metros'],
}

/* ════════════════════════════════════════════════════════════════════ */
export default function DonationModal({ donante, user, onClose, onSuccess }) {
  const navigate = useNavigate()

  const [step,    setStep]    = useState(1)   // 1=tipo, 2=detalle, 3=revisión, 4=éxito
  const [tipo,    setTipo]    = useState(null)
  const [form,    setForm]    = useState({ cantidad: '', unidadMedida: '', descripcion: '', centroAcopioId: '', observaciones: '' })
  const [centros, setCentros] = useState([])
  const [sending, setSending] = useState(false)
  const [error,   setError]   = useState(null)
  const [result,  setResult]  = useState(null)

  /* Cargar centros de acopio */
  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch('http://localhost:9090/api/logistica/centros', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const arr = Array.isArray(data) ? data : (data.content ?? [])
        setCentros(arr)
        if (arr.length) setForm(f => ({ ...f, centroAcopioId: arr[0].id }))
      })
      .catch(() => {})
  }, [])

  /* Actualizar unidad al cambiar tipo */
  useEffect(() => {
    if (tipo) {
      const unidades = UNIDADES_POR_TIPO[tipo] ?? ['unidades']
      setForm(f => ({ ...f, unidadMedida: unidades[0] }))
    }
  }, [tipo])

  /* ── Submits ── */
  const handleSubmit = async () => {
    setSending(true); setError(null)
    try {
      const token = localStorage.getItem('token')
      const body = {
        tipoDonante:    donante.tipoDonante,
        rut:            donante.rut,
        email:          donante.email,
        ...(donante.tipoDonante === 'PARTICULAR'
          ? { nombres: donante.nombreVisible?.split(' ')[0] ?? '', apellidos: donante.nombreVisible?.split(' ').slice(1).join(' ') ?? '' }
          : { razonSocial: donante.nombreVisible ?? '', nombreContacto: donante.nombreContacto ?? '' }),
        tipoRecurso:    tipo,
        cantidad:       parseFloat(form.cantidad),
        unidadMedida:   form.unidadMedida,
        descripcion:    form.descripcion || null,
        observaciones:  'PENDIENTE - Pendiente de revisión por administrador',
        centroAcopioId: form.centroAcopioId ? Number(form.centroAcopioId) : null,
      }

      const res  = await fetch('http://localhost:9090/api/donaciones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || data.mensaje || 'Error al registrar donación')

      setResult(data)
      setStep(4)
      if (onSuccess) onSuccess(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  const tipoMeta = TIPOS.find(t => t.value === tipo)
  const unidades = UNIDADES_POR_TIPO[tipo] ?? ['unidades']
  const esEsDinero = tipo === 'DINERO'

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: 'rgba(0,0,0,.82)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 24, padding: '36px 32px', width: '100%', maxWidth: 520,
        position: 'relative', animation: 'modalIn .25s ease',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>

        {/* Progress bar (pasos 1-3) */}
        {step < 4 && (
          <div style={{ display: 'flex', gap: 4, marginBottom: 28 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{ flex: 1, height: 3, borderRadius: 2, background: step >= s ? 'var(--accent)' : 'var(--surface2)', transition: 'background .3s' }} />
            ))}
          </div>
        )}

        {/* ── PASO 1: Seleccionar tipo ── */}
        {step === 1 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>
              ❤️ Hacer una donación
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginBottom: 24 }}>
              ¿Qué tipo de recurso quieres donar?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TIPOS.map(t => (
                <button key={t.value} onClick={() => { setTipo(t.value); setStep(2) }} style={{
                  padding: '14px 12px', borderRadius: 14, cursor: 'pointer', textAlign: 'left',
                  border: '1px solid var(--border)', background: 'var(--bg)',
                  color: 'var(--text)', fontFamily: 'var(--font-body)', transition: 'all .2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'rgba(232,52,90,.06)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--bg)' }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 4 }}>{t.icon}</div>
                  <div style={{ fontSize: '.875rem', fontWeight: 500, marginBottom: 2 }}>{t.label}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{t.hint}</div>
                  {t.value === 'DINERO' && (
                    <div style={{ marginTop: 6, fontSize: '.68rem', color: 'var(--accent)', fontWeight: 600 }}>
                      Requiere confirmar depósito
                    </div>
                  )}
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── PASO 2: Detalles ── */}
        {step === 2 && (
          <>
            <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: '.8rem', padding: 0, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 4 }}>
              ← Cambiar tipo
            </button>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>
              {tipoMeta?.icon} {tipoMeta?.label}
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginBottom: 24 }}>
              {esEsDinero
                ? 'Ingresa el monto. Luego recibirás las instrucciones de depósito.'
                : 'Completa los detalles de tu donación.'}
            </p>

            {esEsDinero && (
              <div style={{ background: 'rgba(232,52,90,.08)', border: '1px solid rgba(232,52,90,.18)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: '.8rem', color: 'var(--text)', lineHeight: 1.5 }}>
                💡 Las donaciones en dinero requieren depósito bancario. Después de registrarla, te llevaremos a la página de instrucciones de pago.
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <MField label={esEsDinero ? 'Monto (CLP) *' : 'Cantidad *'} type="number" placeholder={esEsDinero ? '50000' : '10'} required
                  value={form.cantidad} onChange={v => setForm(f => ({ ...f, cantidad: v }))} />
                <div>
                  <label style={lbl}>Unidad *</label>
                  {esEsDinero ? (
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', fontSize: '.9rem', color: 'var(--muted)' }}>CLP</div>
                  ) : (
                    <select value={form.unidadMedida} onChange={e => setForm(f => ({ ...f, unidadMedida: e.target.value }))}
                      style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '.9rem', outline: 'none', cursor: 'pointer' }}>
                      {unidades.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label style={lbl}>Descripción {!esEsDinero && '(opcional)'}</label>
                <textarea
                  placeholder={esEsDinero ? 'Ej: Aporte para campaña de alimentos julio 2025' : 'Estado, marca, info relevante…'}
                  rows={3} value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '.9rem', outline: 'none', transition: 'border-color .2s', resize: 'vertical', minHeight: 80 }}
                  onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
                />
              </div>

              {centros.length > 0 && !esEsDinero && (
                <div>
                  <label style={lbl}>Centro de acopio destino</label>
                  <select value={form.centroAcopioId ?? ''} onChange={e => setForm(f => ({ ...f, centroAcopioId: e.target.value }))}
                    style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '.9rem', outline: 'none', cursor: 'pointer' }}>
                    <option value="">Sin asignar</option>
                    {centros.map(c => <option key={c.id} value={c.id}>{c.nombre}{c.region ? ` — ${c.region}` : ''}</option>)}
                  </select>
                </div>
              )}
            </div>

            <button onClick={() => form.cantidad && setStep(3)} disabled={!form.cantidad} style={{ width: '100%', padding: 13, marginTop: 20, background: 'var(--accent)', border: 'none', color: '#fff', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600, cursor: form.cantidad ? 'pointer' : 'not-allowed', opacity: form.cantidad ? 1 : .5, transition: 'opacity .2s' }}>
              Revisar donación →
            </button>
          </>
        )}

        {/* ── PASO 3: Revisión y confirmación ── */}
        {step === 3 && (
          <>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, marginBottom: 4 }}>
              Revisa tu donación
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginBottom: 20 }}>
              Confirma los detalles antes de registrar.
            </p>

            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: 20, marginBottom: 20 }}>
              {[
                ['Donante',     donante.nombreVisible],
                ['RUT',         donante.rut],
                ['Tipo',        `${tipoMeta?.icon} ${tipoMeta?.label}`],
                ['Cantidad',    `${form.cantidad} ${form.unidadMedida}`],
                ...(form.descripcion ? [['Descripción', form.descripcion]] : []),
                ...(form.centroAcopioId && centros.length ? [['Centro', centros.find(c => String(c.id) === String(form.centroAcopioId))?.nombre ?? `#${form.centroAcopioId}`]] : []),
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '.78rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0 }}>{k}</span>
                  <span style={{ fontSize: '.9rem', fontWeight: 500, textAlign: 'right' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Aviso estado PENDIENTE */}
            <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 12, padding: '12px 16px', marginBottom: 20, display: 'flex', gap: 8, fontSize: '.8rem', color: 'var(--text)', lineHeight: 1.5 }}>
              <span style={{ flexShrink: 0 }}>⏳</span>
              <span>Tu donación quedará en estado <strong>Pendiente</strong> hasta ser aprobada por un administrador.{esEsDinero ? ' También deberás confirmar el depósito bancario.' : ''}</span>
            </div>

            {error && (
              <div style={{ background: 'rgba(232,52,90,.1)', border: '1px solid rgba(232,52,90,.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 14, color: 'var(--accent)', fontSize: '.85rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(2)} style={{ flex: '0 0 auto', padding: '12px 18px', background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--muted)', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '.9rem', cursor: 'pointer' }}>
                ← Editar
              </button>
              <button onClick={handleSubmit} disabled={sending} style={{ flex: 1, padding: 12, background: 'var(--accent)', border: 'none', color: '#fff', borderRadius: 12, fontFamily: 'var(--font-body)', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', opacity: sending ? .7 : 1, transition: 'opacity .2s' }}>
                {sending ? 'Registrando…' : (esEsDinero ? '💰 Registrar y ver instrucciones' : '✅ Confirmar donación')}
              </button>
            </div>
          </>
        )}

        {/* ── PASO 4: Éxito ── */}
        {step === 4 && (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: 12 }}>🎉</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, marginBottom: 8 }}>
              ¡Donación registrada!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: '.9rem', lineHeight: 1.6, marginBottom: 24 }}>
              Gracias <strong style={{ color: 'var(--text)' }}>{donante.nombreVisible}</strong>. Tu donación quedó en estado{' '}
              <strong style={{ color: '#f59e0b' }}>Pendiente de aprobación</strong>.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {esEsDinero ? (
                <button onClick={() => { onClose(); navigate('/confirmar-deposito', { state: { donacion: result } }) }}
                  style={{ background: 'var(--accent)', border: 'none', color: '#fff', padding: '12px 24px', borderRadius: 100, fontFamily: 'var(--font-body)', fontSize: '.9rem', fontWeight: 600, cursor: 'pointer' }}>
                  🏦 Ver instrucciones de depósito
                </button>
              ) : null}
              <button onClick={onClose}
                style={{ background: esEsDinero ? 'none' : 'var(--accent)', border: esEsDinero ? '1px solid var(--border)' : 'none', color: esEsDinero ? 'var(--muted)' : '#fff', padding: '12px 24px', borderRadius: 100, fontFamily: 'var(--font-body)', fontSize: '.9rem', fontWeight: esEsDinero ? 400 : 600, cursor: 'pointer' }}>
                {esEsDinero ? 'Cerrar' : '✓ Listo'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const lbl = {
  display: 'block', fontSize: '.72rem', color: 'var(--muted)',
  textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 6,
}

function MField({ label, type = 'text', placeholder, required, value, onChange }) {
  return (
    <div>
      <label style={lbl}>{label}</label>
      <input type={type} placeholder={placeholder} required={required} value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        style={{ width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '10px 14px', color: 'var(--text)', fontFamily: 'var(--font-body)', fontSize: '.9rem', outline: 'none', transition: 'border-color .2s' }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e  => (e.target.style.borderColor = 'var(--border)')}
      />
    </div>
  )
}