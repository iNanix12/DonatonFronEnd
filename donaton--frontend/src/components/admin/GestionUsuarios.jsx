import { useEffect, useState } from 'react'
import { adminUsuarios } from '../../services/adminApi'
import { Section, Table, Badge, Btn, Modal, Input, Select, EmptyState } from './AdminUI'

const ROLES = [
  { value: 'ROLE_USER',  label: '👤 Donante' },
  { value: 'ROLE_ADMIN', label: '⚙️ Administrador' },
]

function ModalEditar({ usuario, onClose, onActualizado }) {
  const [form, setForm] = useState({
    nombreCompleto: usuario.nombreCompleto || '',
    email:          usuario.email || '',
    rut:            usuario.rut || '',
    rol:            usuario.rol || 'ROLE_USER',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await adminUsuarios.actualizar(usuario.id, form)
      onActualizado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={`Editar usuario — ${usuario.username}`} onClose={onClose} width={460}>
      <form onSubmit={submit}>
        <Input label="Nombre completo" value={form.nombreCompleto} onChange={set('nombreCompleto')} required />
        <Input label="Email" type="email" value={form.email} onChange={set('email')} required />
        <Input label="RUT" value={form.rut} onChange={set('rut')} />
        <Select label="Rol" value={form.rol} onChange={set('rol')} options={ROLES} required />
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

function ModalPassword({ usuario, onClose }) {
  const [pwd,     setPwd]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [ok,      setOk]      = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await adminUsuarios.cambiarPassword(usuario.id, pwd)
      setOk(true)
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={`Cambiar contraseña — ${usuario.username}`} onClose={onClose} width={400}>
      {ok ? (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>✅</div>
          <div style={{ color: '#48c78e', fontWeight: 600 }}>Contraseña actualizada</div>
          <Btn variant="ghost" onClick={onClose} style={{ marginTop: 16 }}>Cerrar</Btn>
        </div>
      ) : (
        <form onSubmit={submit}>
          <Input label="Nueva contraseña" type="password" value={pwd} onChange={setPwd} required />
          {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn disabled={loading || pwd.length < 6}>{loading ? '...' : 'Cambiar'}</Btn>
          </div>
        </form>
      )}
    </Modal>
  )
}

function ModalEliminar({ usuario, onClose, onEliminado }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const confirmar = async () => {
    setLoading(true); setError('')
    try {
      await adminUsuarios.eliminar(usuario.id)
      onEliminado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Eliminar usuario" onClose={onClose} width={400}>
      <div style={{ marginBottom: 20 }}>
        <p style={{ color: 'var(--muted)', marginBottom: 8 }}>
          ¿Eliminar permanentemente al usuario
          <strong style={{ color: 'var(--text)' }}> {usuario.username}</strong>?
        </p>
        <p style={{ color: '#e8345a', fontSize: '.85rem' }}>
          Esta acción no se puede deshacer. Considera desactivarlo en su lugar.
        </p>
      </div>
      {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="danger" onClick={confirmar} disabled={loading}>
          {loading ? '...' : 'Eliminar'}
        </Btn>
      </div>
    </Modal>
  )
}

export default function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const cargar = () => {
    setLoading(true)
    adminUsuarios.listar()
      .then(setUsuarios)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar() }, [])

  const toggleActivo = async (u) => {
    await adminUsuarios.toggleActivo(u.id).catch(console.error)
    cargar()
  }

  const filtrados = usuarios.filter(u =>
    u.username?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.nombreCompleto?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.email?.toLowerCase().includes(busqueda.toLowerCase()) ||
    u.rut?.includes(busqueda)
  )

  const admins  = filtrados.filter(u => u.rol === 'ROLE_ADMIN').length
  const activos = filtrados.filter(u => u.activo).length

  const columns = [
    {
      key: 'avatar', label: '',
      render: u => (
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: u.rol === 'ROLE_ADMIN'
            ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
            : 'linear-gradient(135deg, #6495ed, #48c78e)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '.75rem', fontWeight: 700, color: '#fff', flexShrink: 0,
        }}>
          {u.nombreCompleto?.charAt(0).toUpperCase() || u.username?.charAt(0).toUpperCase()}
        </div>
      ),
    },
    {
      key: 'username', label: 'Usuario',
      render: u => (
        <div>
          <div style={{ fontWeight: 500 }}>{u.username}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{u.email}</div>
        </div>
      ),
    },
    { key: 'nombreCompleto', label: 'Nombre completo' },
    { key: 'rut',            label: 'RUT', render: u => u.rut || '—' },
    { key: 'rol',            label: 'Rol', render: u => <Badge estado={u.rol === 'ROLE_ADMIN' ? 'ACTIVO' : 'PLANIFICADO'} /> },
    { key: 'activo',         label: 'Estado', render: u => <Badge estado={u.activo ? 'ACTIVA' : 'CERRADA'} /> },
    {
      key: 'ultimoLogin', label: 'Último login',
      render: u => u.ultimoLogin
        ? new Date(u.ultimoLogin).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
        : '—',
    },
    {
      key: 'acciones', label: 'Acciones',
      render: u => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn size="sm" variant="ghost"    onClick={() => setModal({ tipo: 'editar',   usuario: u })}>Editar</Btn>
          <Btn size="sm" variant="warning"  onClick={() => setModal({ tipo: 'password', usuario: u })}>🔑</Btn>
          <Btn size="sm" variant={u.activo ? 'danger' : 'success'} onClick={() => toggleActivo(u)}>
            {u.activo ? 'Desactivar' : 'Activar'}
          </Btn>
          <Btn size="sm" variant="danger"   onClick={() => setModal({ tipo: 'eliminar', usuario: u })}>🗑</Btn>
        </div>
      ),
    },
  ]

  return (
    <div>
      {/* Métricas rápidas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: '👥', label: 'Total usuarios',    value: usuarios.length,  color: '#6495ed' },
          { icon: '✅', label: 'Activos',            value: activos,          color: '#48c78e' },
          { icon: '⚙️', label: 'Administradores',    value: admins,           color: '#e8345a' },
          { icon: '👤', label: 'Donantes',           value: usuarios.length - admins, color: '#ffa735' },
        ].map(({ icon, label, value, color }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 14, padding: '16px 20px',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>{icon}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      <Section
        title="👥 Gestión de usuarios"
        action={
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              placeholder="Buscar por nombre, email, RUT..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '6px 12px', color: 'var(--text)',
                fontFamily: 'var(--font-body)', fontSize: '.85rem', outline: 'none', width: 240,
              }}
            />
            <Btn size="sm" variant="ghost" onClick={cargar}>↺ Refrescar</Btn>
          </div>
        }
      >
        {loading
          ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Cargando usuarios...</div>
          : filtrados.length === 0
            ? <EmptyState icon="👥" title="Sin usuarios" desc={busqueda ? 'No coincide con la búsqueda' : 'No hay usuarios registrados'} />
            : <Table columns={columns} rows={filtrados} />
        }
      </Section>

      {modal?.tipo === 'editar'    && <ModalEditar    usuario={modal.usuario} onClose={() => setModal(null)} onActualizado={() => { setModal(null); cargar() }} />}
      {modal?.tipo === 'password'  && <ModalPassword  usuario={modal.usuario} onClose={() => setModal(null)} />}
      {modal?.tipo === 'eliminar'  && <ModalEliminar  usuario={modal.usuario} onClose={() => setModal(null)} onEliminado={() => { setModal(null); cargar() }} />}
    </div>
  )
}