import { useEffect, useState } from 'react'
import { adminNecesidades } from '../../services/adminApi'
import { Section, Table, Badge, Btn, Pager, Modal, Input, Select, EmptyState } from './AdminUI'

const TIPOS_RECURSO   = [{ value:'ALIMENTO',label:'🍚 Alimentos'},{ value:'ROPA',label:'👕 Ropa'},{ value:'INSUMOS_MEDICOS',label:'💊 Insumos médicos'},{ value:'INSUMOS_HIGIENE',label:'🧼 Higiene'},{ value:'OTRO',label:'📦 Otro'}]
const PRIORIDADES     = [{ value:'CRITICA',label:'🔴 Crítica'},{ value:'ALTA',label:'🟠 Alta'},{ value:'MEDIA',label:'🟡 Media'},{ value:'BAJA',label:'⚪ Baja'}]
const ESTADOS_REPORTE = [{ value:'PENDIENTE',label:'Pendiente'},{ value:'EN_PROCESO',label:'En proceso'},{ value:'ATENDIDO',label:'Atendido'}]
const TIPOS_EMERGENCIA= [{ value:'INUNDACION',label:'Inundación'},{ value:'INCENDIO',label:'Incendio'},{ value:'TERREMOTO',label:'Terremoto'},{ value:'OTRO',label:'Otro'}]

function ModalZona({ onClose, onCreado }) {
  const [form, setForm] = useState({ nombre:'', descripcion:'', region:'', comuna:'', latitud:'', longitud:'', tipoEmergencia:'INUNDACION' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await adminNecesidades.crearZona({ ...form, latitud: parseFloat(form.latitud), longitud: parseFloat(form.longitud) })
      onCreado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Crear zona afectada" onClose={onClose} width={500}>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Nombre"           value={form.nombre}          onChange={set('nombre')}          required />
          <Select label="Tipo emergencia" value={form.tipoEmergencia}  onChange={set('tipoEmergencia')}  options={TIPOS_EMERGENCIA} required />
          <Input label="Región"           value={form.region}          onChange={set('region')}          required />
          <Input label="Comuna"           value={form.comuna}          onChange={set('comuna')}          required />
          <Input label="Latitud"  type="number" value={form.latitud}   onChange={set('latitud')} />
          <Input label="Longitud" type="number" value={form.longitud}  onChange={set('longitud')} />
        </div>
        <Input label="Descripción" value={form.descripcion} onChange={set('descripcion')} required />
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? 'Creando...' : 'Crear zona'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

function ModalReporte({ zonas, onClose, onCreado }) {
  const [form, setForm] = useState({ zonaAfectadaId:'', titulo:'', descripcion:'', tipoRecursoNecesario:'ALIMENTO', cantidadEstimada:'', unidadMedida:'kg', prioridad:'ALTA', reportadoPor:'' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))
  const opcionesZona = [{ value:'', label:'Seleccionar zona...' }, ...zonas.map(z => ({ value: String(z.id), label: `${z.nombre} (${z.comuna})` }))]

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await adminNecesidades.crearReporte({ ...form, zonaAfectadaId: parseInt(form.zonaAfectadaId), cantidadEstimada: parseFloat(form.cantidadEstimada) })
      onCreado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Crear reporte de necesidad" onClose={onClose} width={520}>
      <form onSubmit={submit}>
        <Select label="Zona afectada" value={form.zonaAfectadaId} onChange={set('zonaAfectadaId')} options={opcionesZona} required />
        <Input  label="Título"        value={form.titulo}         onChange={set('titulo')}         required />
        <Input  label="Descripción"   value={form.descripcion}    onChange={set('descripcion')}    required />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Select label="Tipo recurso" value={form.tipoRecursoNecesario} onChange={set('tipoRecursoNecesario')} options={TIPOS_RECURSO} required />
          <Select label="Prioridad"    value={form.prioridad}            onChange={set('prioridad')}            options={PRIORIDADES}   required />
          <Input  label="Cantidad"     type="number" value={form.cantidadEstimada} onChange={set('cantidadEstimada')} required />
          <Input  label="Unidad"       value={form.unidadMedida}         onChange={set('unidadMedida')}         required />
        </div>
        <Input label="Reportado por" value={form.reportadoPor} onChange={set('reportadoPor')} required />
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? 'Creando...' : 'Crear reporte'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

function ModalEstadoReporte({ reporte, onClose, onActualizado }) {
  const [nuevoEstado,   setNuevoEstado]   = useState(reporte.estado)
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
        <Select label="Nuevo estado"           value={nuevoEstado}   onChange={setNuevoEstado}   options={ESTADOS_REPORTE} required />
        <Input  label="Observaciones (opcional)" value={observaciones} onChange={setObservaciones} />
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? '...' : 'Actualizar'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

function ModalAsignacion({ reporte, onClose, onCreado }) {
  const [form, setForm] = useState({ cantidadAsignada:'', unidadMedida:'kg', centroAcopioIdOrigen:'1', asignadoPor:'admin', observaciones:'' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await adminNecesidades.crearAsignacion({
        reporteNecesidadId: reporte.id,
        tipoRecurso: reporte.tipoRecursoNecesario,
        cantidadAsignada: parseFloat(form.cantidadAsignada),
        unidadMedida: form.unidadMedida,
        centroAcopioIdOrigen: parseInt(form.centroAcopioIdOrigen),
        asignadoPor: form.asignadoPor,
        observaciones: form.observaciones,
      })
      onCreado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={`Asignar recursos — Reporte #${reporte.id}`} onClose={onClose} width={440}>
      <p style={{ color: 'var(--muted)', fontSize: '.875rem', marginBottom: 20 }}>
        {reporte.titulo} · Necesita: <strong style={{ color: 'var(--text)' }}>{reporte.cantidadRequerida} {reporte.unidadMedida}</strong>
      </p>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Cantidad"           type="number" value={form.cantidadAsignada}     onChange={set('cantidadAsignada')}     required />
          <Input label="Unidad medida"      value={form.unidadMedida}         onChange={set('unidadMedida')}         required />
          <Input label="ID Centro origen"   type="number" value={form.centroAcopioIdOrigen} onChange={set('centroAcopioIdOrigen')} required />
          <Input label="Asignado por"       value={form.asignadoPor}          onChange={set('asignadoPor')}          required />
        </div>
        <Input label="Observaciones" value={form.observaciones} onChange={set('observaciones')} />
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? '...' : 'Asignar recursos'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

export default function GestionNecesidades() {
  const [zonas,    setZonas]    = useState([])
  const [reportes, setReportes] = useState({ content: [], totalPages: 0 })
  const [pagRep,   setPagRep]   = useState(0)
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null)

  const cargarZonas    = () => adminNecesidades.listarZonas().then(setZonas).catch(console.error)
  const cargarReportes = (p = 0) => adminNecesidades.listarReportes(p).then(d => { setReportes(d); setPagRep(p) }).catch(console.error)

  useEffect(() => { Promise.all([cargarZonas(), cargarReportes()]).finally(() => setLoading(false)) }, [])

  const cerrarZona = async (id) => {
    if (!confirm('¿Cerrar esta zona afectada?')) return
    await adminNecesidades.cerrarZona(id).catch(console.error)
    cargarZonas()
  }

  const colZonas = [
    { key: 'id',             label: 'ID' },
    { key: 'nombre',         label: 'Nombre' },
    { key: 'tipoEmergencia', label: 'Tipo',       render: r => <Badge estado={r.tipoEmergencia} /> },
    { key: 'comuna',         label: 'Ubicación',  render: r => `${r.comuna}, ${r.region}` },
    { key: 'estado',         label: 'Estado',     render: r => <Badge estado={r.estado} /> },
    { key: 'acciones',       label: 'Acciones',   render: r => r.estado === 'ACTIVA' && <Btn size="sm" variant="danger" onClick={() => cerrarZona(r.id)}>Cerrar</Btn> },
  ]

  const colReportes = [
    { key: 'id',                   label: 'ID' },
    { key: 'titulo',               label: 'Título',    wrap: true },
    { key: 'tipoRecursoNecesario', label: 'Recurso' },
    { key: 'cantidadRequerida',    label: 'Cantidad',  render: r => `${r.cantidadRequerida} ${r.unidadMedida}` },
    { key: 'prioridad',            label: 'Prioridad', render: r => <Badge estado={r.prioridad} /> },
    { key: 'estado',               label: 'Estado',    render: r => <Badge estado={r.estado} /> },
    {
      key: 'acciones', label: 'Acciones',
      render: r => (
        <div style={{ display: 'flex', gap: 6 }}>
          <Btn size="sm" variant="ghost"   onClick={() => setModal({ tipo: 'estado',  reporte: r })}>Estado</Btn>
          <Btn size="sm" variant="success" onClick={() => setModal({ tipo: 'asignar', reporte: r })}>Asignar</Btn>
        </div>
      ),
    },
  ]

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Cargando...</div>

  return (
    <div>
      <Section title="🗺️ Zonas afectadas" action={<Btn size="sm" onClick={() => setModal({ tipo: 'zona' })}>+ Nueva zona</Btn>}>
        {zonas.length === 0 ? <EmptyState icon="🗺️" title="Sin zonas registradas" /> : <Table columns={colZonas} rows={zonas} />}
      </Section>

      <Section title="📋 Reportes de necesidad" action={<Btn size="sm" onClick={() => setModal({ tipo: 'reporte' })}>+ Nuevo reporte</Btn>}>
        <Table columns={colReportes} rows={reportes.content || []} emptyMsg="Sin reportes" />
        <div style={{ padding: '12px 16px' }}>
          <Pager page={pagRep} totalPages={reportes.totalPages} onChange={cargarReportes} />
        </div>
      </Section>

      {modal?.tipo === 'zona'    && <ModalZona     onClose={() => setModal(null)} onCreado={() => { setModal(null); cargarZonas() }} />}
      {modal?.tipo === 'reporte' && <ModalReporte  zonas={zonas} onClose={() => setModal(null)} onCreado={() => { setModal(null); cargarReportes() }} />}
      {modal?.tipo === 'estado'  && <ModalEstadoReporte reporte={modal.reporte} onClose={() => setModal(null)} onActualizado={() => { setModal(null); cargarReportes(pagRep) }} />}
      {modal?.tipo === 'asignar' && <ModalAsignacion    reporte={modal.reporte} onClose={() => setModal(null)} onCreado={() => { setModal(null); cargarReportes(pagRep) }} />}
    </div>
  )
}