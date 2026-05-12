import { useEffect, useState } from 'react'
import { adminNecesidades, adminLogistica } from '../../services/adminApi'
import { Section, Table, Badge, Btn, Pager, Modal, Input, Select, EmptyState } from './AdminUI'
import { REGIONES_DATA } from '../../data/regiones'

const TIPOS_RECURSO = [
  { value: 'ALIMENTO',        label: '🍚 Alimentos' },
  { value: 'ROPA',            label: '👕 Ropa' },
  { value: 'INSUMOS_MEDICOS', label: '💊 Insumos médicos' },
  { value: 'INSUMOS_HIGIENE', label: '🧼 Insumos de higiene' },
  { value: 'OTRO',            label: '📦 Otro' },
]
const PRIORIDADES = [
  { value: 'CRITICA', label: '🔴 Crítica' },
  { value: 'ALTA',    label: '🟠 Alta' },
  { value: 'MEDIA',   label: '🟡 Media' },
  { value: 'BAJA',    label: '⚪ Baja' },
]
const ESTADOS_REPORTE = [
  { value: 'PENDIENTE',             label: 'Pendiente' },
  { value: 'EN_GESTION',            label: 'En gestión' },
  { value: 'PARCIALMENTE_ATENDIDA', label: 'Parcialmente atendida' },
  { value: 'ATENDIDA',              label: 'Atendida' },
]
const TIPOS_EMERGENCIA = [
  { value: 'TERREMOTO',         label: '🏔 Terremoto' },
  { value: 'INCENDIO',          label: '🔥 Incendio' },
  { value: 'INUNDACION',        label: '🌊 Inundación' },
  { value: 'ALUVION',           label: '⛰ Aluvión' },
  { value: 'ERUPCION_VOLCANICA',label: '🌋 Erupción volcánica' },
  { value: 'SEQUIA',            label: '☀️ Sequía' },
  { value: 'ACCIDENTE_MASIVO',  label: '🚨 Accidente masivo' },
  { value: 'OTRO',              label: '📌 Otro' },
]
const EMOJIS = { ALIMENTO: '🍚', ROPA: '👕', INSUMOS_MEDICOS: '💊', INSUMOS_HIGIENE: '🧼', OTRO: '📦' }

// ── Modal Zona (crear / editar) ───────────────────────────────────────────────
function ModalZona({ zona = null, onClose, onGuardado }) {
  const editando = zona !== null
  const [form, setForm] = useState({
    nombre:              zona?.nombre              || '',
    descripcion:         zona?.descripcion         || '',
    region:              zona?.region              || '',
    comuna:              zona?.comuna              || '',
    tipoEmergencia:      zona?.tipoEmergencia      || 'INUNDACION',
    personasAfectadas:   zona?.personasAfectadas   || '',
    coordinadorNombre:   zona?.coordinadorNombre   || '',
    coordinadorTelefono: zona?.coordinadorTelefono || '',
    latitud:             zona?.latitud             || '',
    longitud:            zona?.longitud            || '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))
  const handleRegion = v => setForm(f => ({ ...f, region: v, comuna: editando ? f.comuna : '' }))
  const comunas = REGIONES_DATA.find(r => r.nombre === form.region)?.comunas || []

  const submit = async (e) => {
    e.preventDefault()
    if (!form.comuna) { setError('Selecciona una comuna'); return }
    setLoading(true); setError('')
    const body = {
      nombre: form.nombre.trim(), descripcion: form.descripcion.trim(),
      region: form.region, comuna: form.comuna,
      tipoEmergencia: form.tipoEmergencia,
      ...(form.personasAfectadas   ? { personasAfectadas:   parseInt(form.personasAfectadas) }  : {}),
      ...(form.coordinadorNombre   ? { coordinadorNombre:   form.coordinadorNombre.trim() }      : {}),
      ...(form.coordinadorTelefono ? { coordinadorTelefono: form.coordinadorTelefono.trim() }    : {}),
      ...(form.latitud             ? { latitud:  parseFloat(form.latitud) }                      : {}),
      ...(form.longitud            ? { longitud: parseFloat(form.longitud) }                     : {}),
    }
    try {
      editando
        ? await adminNecesidades.actualizarZona(zona.id, body)
        : await adminNecesidades.crearZona(body)
      onGuardado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={editando ? `Editar zona — ${zona.nombre}` : 'Crear zona afectada'} onClose={onClose} width={540}>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Nombre *"           value={form.nombre}              onChange={set('nombre')}              required />
          <Select label="Tipo emergencia *" value={form.tipoEmergencia}      onChange={set('tipoEmergencia')}      options={TIPOS_EMERGENCIA} required />
          <Select label="Región *"          value={form.region}              onChange={handleRegion}
            options={[{ value:'', label:'— Selecciona región —' }, ...REGIONES_DATA.map(r => ({ value: r.nombre, label: r.nombre }))]} required />
          <Select label="Comuna *"          value={form.comuna}              onChange={set('comuna')}
            options={comunas.map(c => ({ value: c, label: c }))} disabled={!form.region} required />
          <Input label="Personas afectadas" type="number" value={form.personasAfectadas}   onChange={set('personasAfectadas')}   placeholder="0" />
          <Input label="Coordinador"        value={form.coordinadorNombre}   onChange={set('coordinadorNombre')}   placeholder="Nombre del coordinador" />
          <Input label="Tel. coordinador"   value={form.coordinadorTelefono} onChange={set('coordinadorTelefono')} placeholder="+56912345678" />
          <Input label="Dirección referencia" value={form.direccionReferencia || ''} onChange={set('direccionReferencia')} />
          <Input label="Latitud"  type="number" value={form.latitud}  onChange={set('latitud')}  placeholder="-33.4601" />
          <Input label="Longitud" type="number" value={form.longitud} onChange={set('longitud')} placeholder="-70.7803" />
        </div>
        <Input label="Descripción" value={form.descripcion} onChange={set('descripcion')} />
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', padding: '8px 12px', background: 'rgba(232,52,90,.08)', borderRadius: 8, marginTop: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear zona'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal Reporte (crear / editar) ────────────────────────────────────────────
function ModalReporte({ reporte = null, zonas, onClose, onGuardado }) {
  const editando = reporte !== null
  const [form, setForm] = useState({
    zonaAfectadaId:       reporte?.zonaAfectadaId          || '',
    titulo:               reporte?.titulo                  || '',
    descripcion:          reporte?.descripcion             || '',
    tipoRecursoNecesario: reporte?.tipoRecursoNecesario    || 'ALIMENTO',
    cantidadRequerida:    reporte?.cantidadRequerida       || '',
    unidadMedida:         reporte?.unidadMedida            || 'kg',
    prioridad:            reporte?.prioridad               || 'ALTA',
    reportadoPor:         reporte?.reportadoPor            || '',
    telefonoContacto:     reporte?.telefonoContacto        || '',
    observaciones:        reporte?.observaciones           || '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))
  const opcionesZona = [
    { value: '', label: '— Selecciona zona —' },
    ...zonas.map(z => ({ value: String(z.id), label: `${z.nombre} (${z.comuna})` })),
  ]

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    const body = {
      ...form,
      zonaAfectadaId:    parseInt(form.zonaAfectadaId),
      cantidadRequerida: parseFloat(form.cantidadRequerida),
    }
    try {
      editando
        ? await adminNecesidades.actualizarReporte(reporte.id, body)
        : await adminNecesidades.crearReporte(body)
      onGuardado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={editando ? `Editar reporte #${reporte.id}` : 'Crear reporte de necesidad'} onClose={onClose} width={540}>
      <form onSubmit={submit}>
        <Select label="Zona afectada *" value={String(form.zonaAfectadaId)} onChange={set('zonaAfectadaId')} options={opcionesZona} required />
        <Input  label="Título *"        value={form.titulo}       onChange={set('titulo')}       required />
        <Input  label="Descripción *"   value={form.descripcion}  onChange={set('descripcion')}  required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Select label="Tipo recurso *"  value={form.tipoRecursoNecesario} onChange={set('tipoRecursoNecesario')} options={TIPOS_RECURSO} required />
          <Select label="Prioridad *"     value={form.prioridad}             onChange={set('prioridad')}             options={PRIORIDADES}   required />
          <Input  label="Cantidad *"      type="number" value={form.cantidadRequerida} onChange={set('cantidadRequerida')} required />
          <Input  label="Unidad *"        value={form.unidadMedida}          onChange={set('unidadMedida')}          required />
          <Input  label="Reportado por *" value={form.reportadoPor}          onChange={set('reportadoPor')}          required />
          <Input  label="Tel. contacto"   value={form.telefonoContacto}      onChange={set('telefonoContacto')} />
        </div>
        <Input label="Observaciones" value={form.observaciones} onChange={set('observaciones')} />
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', padding: '8px 12px', background: 'rgba(232,52,90,.08)', borderRadius: 8, marginTop: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear reporte'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal actualizar estado ───────────────────────────────────────────────────
function ModalEstado({ reporte, onClose, onActualizado }) {
  const [nuevoEstado,   setNuevoEstado]   = useState(reporte.estado || 'PENDIENTE')
  const [observaciones, setObservaciones] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try { await adminNecesidades.actualizarEstado(reporte.id, nuevoEstado, observaciones); onActualizado() }
    catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={`Actualizar estado — Reporte #${reporte.id}`} onClose={onClose} width={420}>
      <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginBottom: 20 }}>{reporte.titulo}</p>
      <form onSubmit={submit}>
        <Select label="Nuevo estado *" value={nuevoEstado} onChange={setNuevoEstado} options={ESTADOS_REPORTE} required />
        <Input  label="Observaciones"  value={observaciones} onChange={setObservaciones} />
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? '...' : 'Actualizar'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal asignación con inventario real ──────────────────────────────────────
function ModalAsignacion({ reporte, onClose, onCreado }) {
  const [inventario,  setInventario]  = useState([])
  const [centros,     setCentros]     = useState([])
  const [centroId,    setCentroId]    = useState('')
  const [itemSel,     setItemSel]     = useState(null)
  const [form, setForm] = useState({ cantidadAsignada: '', unidadMedida: '', asignadoPor: 'admin', observaciones: '' })
  const [loading,     setLoading]     = useState(false)
  const [loadingInv,  setLoadingInv]  = useState(false)
  const [error,       setError]       = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    adminLogistica.listarCentros().then(lista => {
      const arr = Array.isArray(lista) ? lista : []
      setCentros(arr)
      if (arr.length > 0) { setCentroId(String(arr[0].id)); cargarInventario(arr[0].id) }
    }).catch(console.error)
  }, [])

  const cargarInventario = (id) => {
    setLoadingInv(true); setItemSel(null)
    setForm(f => ({ ...f, unidadMedida: '', cantidadAsignada: '' }))
    adminLogistica.obtenerCentro(id)
      .then(centro => {
        const inv = centro.inventario || []
        setInventario(inv)
        const match = inv.find(i =>
          i.tipoRecurso === reporte.tipoRecursoNecesario ||
          i.tipoRecurso?.replace(/S$/, '') === reporte.tipoRecursoNecesario?.replace(/S$/, '')
        )
        if (match) { setItemSel(match); setForm(f => ({ ...f, unidadMedida: match.unidadMedida })) }
      })
      .catch(console.error)
      .finally(() => setLoadingInv(false))
  }

  const handleCentro = (id) => { setCentroId(id); cargarInventario(parseInt(id)) }
  const seleccionar  = (item) => { setItemSel(item); setForm(f => ({ ...f, unidadMedida: item.unidadMedida })) }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.cantidadAsignada || parseFloat(form.cantidadAsignada) <= 0) { setError('Ingresa una cantidad válida'); return }
    if (itemSel && parseFloat(form.cantidadAsignada) > itemSel.cantidadDisponible) { setError(`Stock insuficiente. Disponible: ${itemSel.cantidadDisponible} ${itemSel.unidadMedida}`); return }
    setLoading(true); setError('')
    try {
      await adminNecesidades.crearAsignacion({
        reporteNecesidadId: reporte.id,
        cantidadAsignada:   parseFloat(form.cantidadAsignada),
        unidadMedida:       form.unidadMedida,
        asignadoPor:        form.asignadoPor,
        observaciones:      form.observaciones,
      })
      onCreado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const opcionCentros  = centros.map(c => ({ value: String(c.id), label: `${c.nombre} (${c.comuna})` }))
  const stockColor     = itemSel ? (itemSel.cantidadDisponible === 0 ? '#e8345a' : itemSel.cantidadDisponible < 20 ? '#ffa735' : '#48c78e') : 'var(--muted)'

  return (
    <Modal title={`Asignar recursos — Reporte #${reporte.id}`} onClose={onClose} width={500}>
      <div style={{ background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: '.875rem' }}>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>{reporte.titulo}</div>
        <div style={{ color: 'var(--muted)' }}>Necesita: <strong style={{ color: 'var(--text)' }}>{reporte.cantidadRequerida} {reporte.unidadMedida}</strong> de <strong style={{ color: 'var(--text)' }}>{reporte.tipoRecursoNecesario}</strong></div>
      </div>
      <form onSubmit={submit}>
        {centros.length > 0 && <Select label="Centro de acopio origen *" value={centroId} onChange={handleCentro} options={opcionCentros} required />}

        {loadingInv ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '16px 0', fontSize: '.85rem' }}>Cargando inventario...</div>
        ) : inventario.length === 0 ? (
          <div style={{ background: 'rgba(232,52,90,.08)', border: '1px solid rgba(232,52,90,.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 14, fontSize: '.85rem', color: '#e8345a' }}>
            ⚠️ Este centro no tiene inventario registrado
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 8, letterSpacing: '.05em', textTransform: 'uppercase' }}>Selecciona un recurso del inventario</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {inventario.map(item => {
                const sel   = itemSel?.id === item.id
                const sinStock = item.cantidadDisponible === 0
                const color = sinStock ? '#e8345a' : item.cantidadDisponible < 20 ? '#ffa735' : '#48c78e'
                return (
                  <div key={item.id} onClick={() => !sinStock && seleccionar(item)} style={{
                    padding: '10px 14px', borderRadius: 10,
                    border: `1px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                    background: sel ? 'rgba(232,52,90,.08)' : 'var(--bg)',
                    cursor: sinStock ? 'not-allowed' : 'pointer',
                    opacity: sinStock ? .5 : 1, transition: 'all .15s',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '1.1rem' }}>{EMOJIS[item.tipoRecurso] || '📦'}</span>
                      <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{item.tipoRecurso}</span>
                      {sel && <span style={{ marginLeft: 'auto', color: 'var(--accent)' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '.82rem', color, fontWeight: 600 }}>
                      {Number(item.cantidadDisponible).toLocaleString('es-CL')} {item.unidadMedida}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {itemSel && (
          <div style={{ background: `${stockColor}12`, border: `1px solid ${stockColor}33`, borderRadius: 10, padding: '10px 14px', marginBottom: 14, display: 'flex', justifyContent: 'space-between', fontSize: '.85rem' }}>
            <span style={{ color: 'var(--muted)' }}>Stock disponible:</span>
            <strong style={{ color: stockColor }}>{Number(itemSel.cantidadDisponible).toLocaleString('es-CL')} {itemSel.unidadMedida}</strong>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Cantidad *" type="number" value={form.cantidadAsignada} onChange={set('cantidadAsignada')} required />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 5, letterSpacing: '.05em', textTransform: 'uppercase' }}>Unidad medida</div>
            <div style={{ padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: itemSel ? 'var(--text)' : 'var(--muted)', fontSize: '.875rem' }}>
              {form.unidadMedida || '— selecciona un recurso —'}
            </div>
          </div>
        </div>
        <Input label="Asignado por *" value={form.asignadoPor} onChange={set('asignadoPor')} required />
        <Input label="Observaciones"  value={form.observaciones} onChange={set('observaciones')} />

        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', padding: '8px 12px', background: 'rgba(232,52,90,.08)', borderRadius: 8, marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading || !itemSel || !form.cantidadAsignada}>{loading ? '...' : 'Asignar recursos'}</Btn>
        </div>
      </form>
    </Modal>
  )
}



// ── Componente principal ──────────────────────────────────────────────────────
export default function GestionNecesidades() {
  const [activeTab, setActiveTab] = useState('reportes')
  const [zonas,    setZonas]    = useState([])
  const [reportes, setReportes] = useState({ content: [], totalPages: 0 })
  const [pagRep,   setPagRep]   = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)

  const cargarZonas    = () => adminNecesidades.listarZonas().then(setZonas).catch(console.error)
  const cargarReportes = (p = 0) => adminNecesidades.listarReportes(p).then(d => { setReportes(d); setPagRep(p) }).catch(console.error)

  useEffect(() => {
    Promise.all([cargarZonas(), cargarReportes()]).finally(() => setLoading(false))
  }, [])

  const eliminarZona = async (id) => {
    if (!confirm('¿Eliminar esta zona y todos sus reportes?')) return
    await adminNecesidades.eliminarZona(id).catch(e => alert(e.message))
    cargarZonas()
  }

  const eliminarReporte = async (id) => {
    if (!confirm('¿Eliminar este reporte?')) return
    await adminNecesidades.eliminarReporte(id).catch(e => alert(e.message))
    cargarReportes(pagRep)
  }

  const Tab = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: '8px 20px', border: 'none', borderRadius: 8, cursor: 'pointer',
      fontFamily: 'var(--font-body)', fontSize: '.875rem',
      background: activeTab === id ? 'var(--accent)' : 'transparent',
      color: activeTab === id ? '#fff' : 'var(--muted)',
      fontWeight: activeTab === id ? 600 : 400, transition: 'all .15s',
    }}>{label}</button>
  )

  const colZonas = [
    { key: 'id',             label: 'ID' },
    { key: 'nombre',         label: 'Zona',      render: r => <div><div style={{ fontWeight: 500 }}>{r.nombre}</div><div style={{ fontSize: '.75rem', color: 'var(--muted)' }}>{r.comuna}, {r.region}</div></div> },
    { key: 'tipoEmergencia', label: 'Tipo',      render: r => <Badge estado={r.tipoEmergencia} /> },
    { key: 'estado',         label: 'Estado',    render: r => <Badge estado={r.estado} /> },
    { key: 'personasAfectadas', label: 'Afectados', render: r => r.personasAfectadas ? r.personasAfectadas.toLocaleString('es-CL') : '—' },
    { key: 'totalReportes',  label: 'Reportes',  render: r => `${r.reportesPendientes || 0} pend. / ${r.totalReportes || 0} total` },
    {
      key: 'acciones', label: 'Acciones',
      render: r => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Btn size="sm" variant="ghost"  onClick={() => setModal({ tipo: 'editarZona', zona: r })}>✏️ Editar</Btn>
          {r.estado === 'ACTIVA' && <Btn size="sm" variant="warning" onClick={() => adminNecesidades.cerrarZona(r.id).then(cargarZonas)}>Cerrar</Btn>}
          <Btn size="sm" variant="danger" onClick={() => eliminarZona(r.id)}>🗑</Btn>
        </div>
      ),
    },
  ]

  const colReportes = [
    { key: 'id',    label: 'ID' },
    { key: 'titulo', label: 'Título', wrap: true },
    { key: 'tipoRecursoNecesario', label: 'Recurso' },
    { key: 'cantidadRequerida', label: 'Cantidad', render: r => `${r.cantidadRequerida} ${r.unidadMedida}` },
    { key: 'prioridad', label: 'Prioridad', render: r => <Badge estado={r.prioridad} /> },
    { key: 'estado',    label: 'Estado',    render: r => <Badge estado={r.estado} /> },
    {
      key: 'acciones', label: 'Acciones',
      render: r => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Btn size="sm" variant="ghost"   onClick={() => setModal({ tipo: 'editarReporte', reporte: r })}>✏️</Btn>
          <Btn size="sm" variant="ghost"   onClick={() => setModal({ tipo: 'estado',        reporte: r })}>Estado</Btn>
          <Btn size="sm" variant="success" onClick={() => setModal({ tipo: 'asignar',       reporte: r })}>Asignar</Btn>
          <Btn size="sm" variant="danger"  onClick={() => eliminarReporte(r.id)}>🗑</Btn>
        </div>
      ),
    },
  ]

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Cargando...</div>

  return (
    <div>
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 4, width: 'fit-content' }}>
        <Tab id="reportes" label="📋 Reportes" />
        <Tab id="zonas"    label="🗺️ Zonas afectadas" />
      </div>

      {/* ── Tab Zonas ── */}
      {activeTab === 'zonas' && (
        <Section title="🗺️ Zonas afectadas" action={<Btn size="sm" onClick={() => setModal({ tipo: 'nuevaZona' })}>+ Nueva zona</Btn>}>
          {zonas.length === 0 ? <EmptyState icon="🗺️" title="Sin zonas registradas" /> : <Table columns={colZonas} rows={zonas} />}
        </Section>
      )}

      {/* ── Tab Reportes ── */}
      {activeTab === 'reportes' && (
        <Section title="📋 Reportes de necesidad" action={<Btn size="sm" onClick={() => setModal({ tipo: 'nuevoReporte' })}>+ Nuevo reporte</Btn>}>
          <Table columns={colReportes} rows={reportes.content || []} emptyMsg="Sin reportes" />
          <div style={{ padding: '12px 16px' }}>
            <Pager page={pagRep} totalPages={reportes.totalPages} onChange={cargarReportes} />
          </div>
        </Section>
      )}

      {/* Modales */}
      {modal?.tipo === 'nuevaZona'     && <ModalZona     onClose={() => setModal(null)} onGuardado={() => { setModal(null); cargarZonas() }} zonas={zonas} />}
      {modal?.tipo === 'editarZona'    && <ModalZona     zona={modal.zona}       onClose={() => setModal(null)} onGuardado={() => { setModal(null); cargarZonas() }} />}
      {modal?.tipo === 'nuevoReporte'  && <ModalReporte  zonas={zonas}            onClose={() => setModal(null)} onGuardado={() => { setModal(null); cargarReportes() }} />}
      {modal?.tipo === 'editarReporte' && <ModalReporte  reporte={modal.reporte} zonas={zonas} onClose={() => setModal(null)} onGuardado={() => { setModal(null); cargarReportes(pagRep) }} />}
      {modal?.tipo === 'estado'        && <ModalEstado   reporte={modal.reporte} onClose={() => setModal(null)} onActualizado={() => { setModal(null); cargarReportes(pagRep) }} />}
      {modal?.tipo === 'asignar'       && <ModalAsignacion reporte={modal.reporte} onClose={() => setModal(null)} onCreado={() => { setModal(null); cargarReportes(pagRep) }} />}
    </div>
  )
}