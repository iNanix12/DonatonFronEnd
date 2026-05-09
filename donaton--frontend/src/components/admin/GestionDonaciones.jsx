import { useEffect, useState } from 'react'
import { adminDonaciones, adminLogistica } from '../../services/adminApi'
import { Section, Table, Pager, Btn, Modal, Input, Select, Badge, EmptyState } from './AdminUI'

const EMOJI = {
  ALIMENTOS: '🍚', ROPA: '👕', DINERO: '💰',
  INSUMOS_MEDICOS: '💊', INSUMOS_HIGIENE: '🧼', OTRO: '📦',
}
const TIPOS_RECURSO = [
  { value: 'ALIMENTOS',       label: '🍚 Alimentos' },
  { value: 'ROPA',            label: '👕 Ropa' },
  { value: 'DINERO',          label: '💰 Dinero' },
  { value: 'INSUMOS_MEDICOS', label: '💊 Insumos médicos' },
  { value: 'INSUMOS_HIGIENE', label: '🧼 Insumos de higiene' },
  { value: 'OTRO',            label: '📦 Otro' },
]
const UNIDADES_POR_TIPO = {
  ALIMENTOS:       ['kg', 'g', 'unidades', 'cajas', 'bolsas'],
  ROPA:            ['unidades', 'bolsas'],
  DINERO:          ['CLP', 'USD'],
  INSUMOS_MEDICOS: ['unidades', 'cajas', 'kg'],
  INSUMOS_HIGIENE: ['unidades', 'cajas', 'kg'],
  OTRO:            ['unidades', 'kg'],
}

// ── Modal editar donante ──────────────────────────────────────────────────────
function ModalEditarDonante({ donante, onClose, onActualizado }) {
  const esParticular = donante.tipoDonante === 'PARTICULAR'
  const [form, setForm] = useState({
    email:          donante.email          || '',
    telefono:       donante.telefono       || '',
    direccion:      donante.direccion      || '',
    nombres:        donante.nombreVisible?.split(' ')[0] || '',
    apellidos:      donante.nombreVisible?.split(' ').slice(1).join(' ') || '',
    razonSocial:    donante.nombreVisible  || '',
    nombreContacto: donante.nombreContacto || '',
    giro:           donante.giro           || '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      const body = {
        tipoDonante: donante.tipoDonante,
        rut:         donante.rut,
        email:       form.email,
        telefono:    form.telefono,
        direccion:   form.direccion,
        ...(esParticular
          ? { nombres: form.nombres, apellidos: form.apellidos }
          : { razonSocial: form.razonSocial, nombreContacto: form.nombreContacto, giro: form.giro }
        ),
      }
      await adminDonaciones.actualizarDonante(donante.id, body)
      onActualizado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={`Editar donante — ${donante.rut}`} onClose={onClose} width={480}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20,
        background: esParticular ? 'rgba(100,149,237,.12)' : 'rgba(255,107,53,.12)',
        border: `1px solid ${esParticular ? 'rgba(100,149,237,.3)' : 'rgba(255,107,53,.3)'}`,
        borderRadius: 100, padding: '4px 12px', fontSize: '.78rem', fontWeight: 600,
        color: esParticular ? '#6495ed' : '#ff6b35',
      }}>
        {esParticular ? '👤 Particular' : '🏢 Empresa'}
      </div>

      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          {esParticular ? (
            <>
              <Input label="Nombres"   value={form.nombres}   onChange={set('nombres')}   required />
              <Input label="Apellidos" value={form.apellidos} onChange={set('apellidos')} required />
            </>
          ) : (
            <>
              <Input label="Razón social"    value={form.razonSocial}    onChange={set('razonSocial')}    required />
              <Input label="Nombre contacto" value={form.nombreContacto} onChange={set('nombreContacto')} required />
              <Input label="Giro"            value={form.giro}           onChange={set('giro')} />
            </>
          )}
          <Input label="Email"     type="email" value={form.email}     onChange={set('email')}     required />
          <Input label="Teléfono"  value={form.telefono}  onChange={set('telefono')} />
          <Input label="Dirección" value={form.direccion} onChange={set('direccion')} />
        </div>
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12, padding: '8px 12px', background: 'rgba(232,52,90,.08)', borderRadius: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? 'Guardando...' : 'Guardar cambios'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal confirmar eliminación donante ───────────────────────────────────────
function ModalEliminarDonante({ donante, onClose, onEliminado }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const confirmar = async () => {
    setLoading(true); setError('')
    try { await adminDonaciones.eliminarDonante(donante.id); onEliminado() }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Eliminar donante" onClose={onClose} width={420}>
      <p style={{ color: 'var(--muted)', marginBottom: 8 }}>
        ¿Eliminar al donante <strong style={{ color: 'var(--text)' }}>{donante.nombreVisible}</strong> (RUT: {donante.rut})?
      </p>
      <p style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 20 }}>
        Se eliminarán también todas sus donaciones. Esta acción no se puede deshacer.
      </p>
      {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="danger" onClick={confirmar} disabled={loading}>{loading ? '...' : 'Eliminar'}</Btn>
      </div>
    </Modal>
  )
}

// ── Modal nueva donación (2 pasos) ────────────────────────────────────────────
function ModalNuevaDonacion({ centros, onClose, onCreado }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    tipoDonante: 'PARTICULAR',
    rut: '', email: '', telefono: '', direccion: '',
    nombres: '', apellidos: '',
    razonSocial: '', nombreContacto: '', giro: '',
    tipoRecurso: 'ALIMENTOS', cantidad: '',
    unidadMedida: 'kg', descripcion: '',
    centroAcopioId: centros[0]?.id || 1, observaciones: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = k => v => setForm(f => {
    const next = { ...f, [k]: v }
    if (k === 'tipoRecurso') next.unidadMedida = UNIDADES_POR_TIPO[v]?.[0] || 'unidades'
    return next
  })

  const unidades    = (UNIDADES_POR_TIPO[form.tipoRecurso] || ['unidades']).map(u => ({ value: u, label: u }))
  const opcionCentros = centros.map(c => ({ value: String(c.id), label: `${c.nombre} (${c.comuna})` }))

  const submit = async (e) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setLoading(true); setError('')
    try {
      await adminDonaciones.registrar({
        ...form,
        centroAcopioId: parseInt(form.centroAcopioId),
        cantidad: parseFloat(form.cantidad),
      })
      onCreado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Registrar nueva donación" onClose={onClose} width={540}>
      {/* Stepper */}
      <div style={{ display: 'flex', marginBottom: 28, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
        {[['1', 'Datos del donante'], ['2', 'Recurso donado']].map(([n, label], i) => (
          <div key={n} style={{
            flex: 1, padding: '10px 16px', textAlign: 'center',
            background: step === i + 1 ? 'var(--accent)' : 'var(--bg)',
            color: step === i + 1 ? '#fff' : 'var(--muted)',
            fontSize: '.82rem', fontWeight: step === i + 1 ? 600 : 400,
            borderRight: i === 0 ? '1px solid var(--border)' : 'none',
          }}>
            <span style={{ opacity: .7, marginRight: 6 }}>{n}.</span>{label}
          </div>
        ))}
      </div>

      <form onSubmit={submit}>
        {step === 1 && (
          <>
            <Select label="Tipo de donante" value={form.tipoDonante} onChange={set('tipoDonante')}
              options={[{ value: 'PARTICULAR', label: '👤 Particular' }, { value: 'EMPRESA', label: '🏢 Empresa' }]} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Input label="RUT *"    value={form.rut}    onChange={set('rut')}    placeholder="12345678-9" required />
              <Input label="Email *"  type="email" value={form.email}  onChange={set('email')}  required />
              <Input label="Teléfono" value={form.telefono} onChange={set('telefono')} placeholder="+56912345678" />
              <Input label="Dirección" value={form.direccion} onChange={set('direccion')} />
            </div>
            {form.tipoDonante === 'PARTICULAR' ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                <Input label="Nombres *"   value={form.nombres}   onChange={set('nombres')}   required />
                <Input label="Apellidos *" value={form.apellidos} onChange={set('apellidos')} required />
              </div>
            ) : (
              <>
                <Input label="Razón social *"    value={form.razonSocial}    onChange={set('razonSocial')}    required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
                  <Input label="Nombre contacto *" value={form.nombreContacto} onChange={set('nombreContacto')} required />
                  <Input label="Giro"              value={form.giro}           onChange={set('giro')} />
                </div>
              </>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <Select label="Tipo de recurso *" value={form.tipoRecurso} onChange={set('tipoRecurso')} options={TIPOS_RECURSO} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
              <Input label="Cantidad *" type="number" value={form.cantidad} onChange={set('cantidad')} placeholder="0.00" required />
              <Select label="Unidad *" value={form.unidadMedida} onChange={set('unidadMedida')} options={unidades} required />
            </div>
            <Input label="Descripción" value={form.descripcion} onChange={set('descripcion')} />
            {centros.length > 0 && (
              <Select label="Centro de acopio destino *" value={String(form.centroAcopioId)}
                onChange={v => set('centroAcopioId')(parseInt(v))} options={opcionCentros} required />
            )}
            <Input label="Observaciones" value={form.observaciones} onChange={set('observaciones')} />
          </>
        )}

        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12, padding: '8px 12px', background: 'rgba(232,52,90,.08)', borderRadius: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'space-between', marginTop: 12 }}>
          <div>{step === 2 && <Btn variant="ghost" onClick={() => setStep(1)}>← Volver</Btn>}</div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
            <Btn disabled={loading}>
              {step === 1 ? 'Siguiente →' : loading ? 'Registrando...' : 'Registrar donación'}
            </Btn>
          </div>
        </div>
      </form>
    </Modal>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function GestionDonaciones() {
  const [activeTab, setActiveTab] = useState('recursos')   // 'recursos' | 'donantes'

  // Recursos
  const [data,     setData]     = useState({ content: [], totalPages: 0 })
  const [page,     setPage]     = useState(0)
  const [loadingR, setLoadingR] = useState(false)
  const [rut,      setRut]      = useState('')
  const [rutQuery, setRutQuery] = useState('')

  // Donantes
  const [donantes,  setDonantes]  = useState([])
  const [loadingD,  setLoadingD]  = useState(false)
  const [busqueda,  setBusqueda]  = useState('')

  // Compartido
  const [centros, setCentros] = useState([])
  const [modal,   setModal]   = useState(null)

  const cargarRecursos = (p = 0, rutFilter = '') => {
    setLoadingR(true)
    const call = rutFilter
      ? adminDonaciones.historialPorRut(rutFilter, p)
      : adminDonaciones.listarGlobal(p)
    call.then(d => { setData(d); setPage(p) })
        .catch(console.error)
        .finally(() => setLoadingR(false))
  }

  const cargarDonantes = () => {
    setLoadingD(true)
    adminDonaciones.listarDonantes()
      .then(setDonantes)
      .catch(console.error)
      .finally(() => setLoadingD(false))
  }

  useEffect(() => {
    cargarRecursos(0)
    cargarDonantes()
    adminLogistica.listarCentros()
      .then(lista => setCentros(Array.isArray(lista) ? lista : []))
      .catch(console.error)
  }, [])

  const buscar  = () => { setRutQuery(rut); cargarRecursos(0, rut) }
  const limpiar = () => { setRut(''); setRutQuery(''); cargarRecursos(0) }

  const eliminarRecurso = async (id) => {
    if (!confirm('¿Eliminar este registro de donación?')) return
    await adminDonaciones.eliminarRecurso(id).catch(console.error)
    cargarRecursos(page, rutQuery)
  }

  const donantesFiltrados = donantes.filter(d =>
    d.rut?.includes(busqueda) ||
    d.nombreVisible?.toLowerCase().includes(busqueda.toLowerCase()) ||
    d.email?.toLowerCase().includes(busqueda.toLowerCase())
  )

  // ── Columnas recursos ─────────────────────────────────────────────────
  const colRecursos = [
    {
      key: 'tipoRecurso', label: 'Tipo',
      render: r => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '1rem' }}>{EMOJI[r.tipoRecurso] || '📦'}</span>
          {r.tipoRecurso}
        </span>
      ),
    },
    { key: 'cantidad',    label: 'Cantidad',    render: r => `${r.cantidad ?? '—'} ${r.unidadMedida ?? ''}` },
    { key: 'descripcion', label: 'Descripción', wrap: true },
    { key: 'donanteRut',  label: 'RUT donante', render: r => r.donanteRut || '—' },
    { key: 'donanteTipo', label: 'Tipo',        render: r => r.donanteTipo
        ? <Badge estado={r.donanteTipo === 'PARTICULAR' ? 'PLANIFICADO' : 'EN_PROCESO'} />
        : '—'
    },
    { key: 'fechaDonacion', label: 'Fecha', render: r => {
        if (!r.fechaDonacion) return '—'
        try { return new Date(r.fechaDonacion).toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' }) }
        catch { return String(r.fechaDonacion) }
    }},
    { key: 'centroAcopioId', label: 'Centro', render: r => r.centroAcopioId ? `Centro #${r.centroAcopioId}` : '—' },
    {
      key: 'acciones', label: 'Acciones',
      render: r => (
        <Btn size="sm" variant="danger" onClick={() => eliminarRecurso(r.id)}>🗑 Eliminar</Btn>
      ),
    },
  ]

  // ── Columnas donantes ─────────────────────────────────────────────────
  const colDonantes = [
    { key: 'id', label: 'ID' },
    {
      key: 'nombreVisible', label: 'Nombre',
      render: d => (
        <div>
          <div style={{ fontWeight: 500 }}>{d.nombreVisible}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{d.email}</div>
        </div>
      ),
    },
    { key: 'rut',         label: 'RUT' },
    { key: 'tipoDonante', label: 'Tipo', render: d => (
      <Badge estado={d.tipoDonante === 'PARTICULAR' ? 'PLANIFICADO' : 'EN_PROCESO'} />
    )},
    { key: 'fechaRegistro', label: 'Registro', render: d =>
      d.fechaRegistro ? new Date(d.fechaRegistro).toLocaleDateString('es-CL') : '—'
    },
    {
      key: 'acciones', label: 'Acciones',
      render: d => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn size="sm" variant="ghost"  onClick={() => setModal({ tipo: 'editarDonante', donante: d })}>✏️ Editar</Btn>
          <Btn size="sm" variant="danger" onClick={() => setModal({ tipo: 'eliminarDonante', donante: d })}>🗑</Btn>
        </div>
      ),
    },
  ]

  // ── Tabs ──────────────────────────────────────────────────────────────
  const Tab = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: '8px 20px', border: 'none', borderRadius: 8, cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontSize: '.875rem',
      background: activeTab === id ? 'var(--accent)' : 'transparent',
      color: activeTab === id ? '#fff' : 'var(--muted)',
      fontWeight: activeTab === id ? 600 : 400, transition: 'all .15s',
    }}>{label}</button>
  )

  return (
    <div>
      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 24,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 12, padding: 4, width: 'fit-content',
      }}>
        <Tab id="recursos" label="💝 Donaciones" />
        <Tab id="donantes" label="👥 Donantes" />
      </div>

      {/* ── Tab Recursos ── */}
      {activeTab === 'recursos' && (
        <>
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 16, padding: 20, marginBottom: 24,
            display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap',
          }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <Input label="Filtrar por RUT del donante" value={rut} onChange={setRut} placeholder="12345678-9" />
            </div>
            <Btn onClick={buscar} style={{ marginBottom: 14 }}>Buscar</Btn>
            {rutQuery && <Btn variant="ghost" onClick={limpiar} style={{ marginBottom: 14 }}>Limpiar</Btn>}
          </div>

          <Section
            title={`Historial${rutQuery ? ` — RUT: ${rutQuery}` : ' — Global'}`}
            action={<Btn size="sm" onClick={() => setModal({ tipo: 'nueva' })}>+ Nueva donación</Btn>}
          >
            {loadingR
              ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Cargando...</div>
              : <Table columns={colRecursos} rows={data.content || []} emptyMsg="No hay donaciones registradas" />
            }
            <div style={{ padding: '12px 16px' }}>
              <Pager page={page} totalPages={data.totalPages || 0} onChange={p => cargarRecursos(p, rutQuery)} />
            </div>
          </Section>
        </>
      )}

      {/* ── Tab Donantes ── */}
      {activeTab === 'donantes' && (
        <Section
          title={`👥 Donantes registrados (${donantesFiltrados.length})`}
          action={
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                placeholder="Buscar por nombre, RUT o email..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                style={{
                  background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 8, padding: '6px 12px', color: 'var(--text)',
                  fontFamily: 'var(--font-body)', fontSize: '.85rem', outline: 'none', width: 240,
                }}
              />
              <Btn size="sm" variant="ghost" onClick={cargarDonantes}>↺</Btn>
            </div>
          }
        >
          {loadingD
            ? <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Cargando...</div>
            : donantesFiltrados.length === 0
              ? <EmptyState icon="👥" title="Sin donantes" desc={busqueda ? 'No coincide con la búsqueda' : 'No hay donantes registrados'} />
              : <Table columns={colDonantes} rows={donantesFiltrados} />
          }
        </Section>
      )}

      {/* Modales */}
      {modal?.tipo === 'nueva' && (
        <ModalNuevaDonacion
          centros={centros}
          onClose={() => setModal(null)}
          onCreado={() => { setModal(null); cargarRecursos(0, rutQuery) }}
        />
      )}
      {modal?.tipo === 'editarDonante' && (
        <ModalEditarDonante
          donante={modal.donante}
          onClose={() => setModal(null)}
          onActualizado={() => { setModal(null); cargarDonantes() }}
        />
      )}
      {modal?.tipo === 'eliminarDonante' && (
        <ModalEliminarDonante
          donante={modal.donante}
          onClose={() => setModal(null)}
          onEliminado={() => { setModal(null); cargarDonantes() }}
        />
      )}
    </div>
  )
}