import { useState } from 'react'

export default function AuthModal({ initialTab, onClose }) {
  const [tab, setTab] = useState(initialTab)
  const [form, setForm] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    const url = `http://localhost:9090/auth/${tab === 'login' ? 'login' : 'register'}`
    const body = tab === 'login'
      ? { username: form.username, password: form.password }
      : { username: form.username, password: form.password,
          nombreCompleto: form.nombreCompleto, email: form.email, rut: form.rut }

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (res.ok) {
        if (tab === 'login') localStorage.setItem('token', data.token)
        onClose()
      } else {
        alert(data.mensaje || data.error || 'Error al procesar')
      }
    } catch {
      alert('No se pudo conectar con el servidor')
    }
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 40, width: '90%', maxWidth: 420,
        position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, background: 'none',
          border: 'none', color: 'var(--muted)', fontSize: '1.4rem', cursor: 'pointer'
        }}>×</button>

        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700 }}>
          {tab === 'login' ? 'Bienvenido de vuelta' : 'Únete a Donaton'}
        </h2>
        <p style={{ color: 'var(--muted)', fontSize: '.875rem', margin: '8px 0 28px' }}>
          {tab === 'login' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta y empieza a ayudar'}
        </p>

        <div style={{
          display: 'flex', gap: 4, marginBottom: 32,
          background: 'var(--bg)', borderRadius: 10, padding: 4
        }}>
          {['login', 'register'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: 9, border: 'none', borderRadius: 8,
              fontFamily: 'var(--font-body)', fontSize: '.875rem', cursor: 'pointer',
              background: tab === t ? 'var(--accent)' : 'none',
              color: tab === t ? '#fff' : 'var(--muted)',
              fontWeight: tab === t ? 500 : 400, transition: 'all .2s'
            }}>
              {t === 'login' ? 'Iniciar sesión' : 'Registrarse'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <>
              <Field label="Nombre completo" type="text" placeholder="Juan Pérez"
                onChange={v => setForm(f => ({ ...f, nombreCompleto: v }))} />
              <Field label="RUT" type="text" placeholder="12345678-9"
                onChange={v => setForm(f => ({ ...f, rut: v }))} />
              <Field label="Email" type="email" placeholder="tu@correo.cl"
                onChange={v => setForm(f => ({ ...f, email: v }))} />
            </>
          )}
          <Field label="Usuario" type="text" placeholder="Tu nombre de usuario"
            onChange={v => setForm(f => ({ ...f, username: v }))} />
          <Field label="Contraseña" type="password" placeholder="••••••••"
            onChange={v => setForm(f => ({ ...f, password: v }))} />
          <button type="submit" style={{
            width: '100%', padding: 13, marginTop: 8,
            background: 'var(--accent)', border: 'none', color: '#fff',
            borderRadius: 12, fontFamily: 'var(--font-body)',
            fontSize: '1rem', fontWeight: 500, cursor: 'pointer'
          }}>
            {tab === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, type, placeholder, onChange }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{
        display: 'block', fontSize: '.8rem', color: 'var(--muted)',
        marginBottom: 6, letterSpacing: '.05em', textTransform: 'uppercase'
      }}>{label}</label>
      <input type={type} placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '11px 14px', color: 'var(--text)',
          fontFamily: 'var(--font-body)', fontSize: '.9rem', outline: 'none'
        }} />
    </div>
  )
}