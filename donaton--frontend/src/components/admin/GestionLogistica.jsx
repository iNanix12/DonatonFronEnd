import { useEffect, useState } from 'react'
import { adminLogistica } from '../../services/adminApi'
import { Section, Table, Badge, Btn, Pager, Modal, Input, Select, EmptyState } from './AdminUI'

function ModalCentro({ onClose, onCreado }) {
  const [form, setForm] = useState({ nombre:'', direccion:'', region:'', comuna:'', latitud:'', longitud:'', capacidadMaximaKg:'', emailEncargado:'', nombreEncargado:'', telefono:'' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await adminLogistica.crearCentro({ ...form, latitud: parseFloat(form.latitud), longitud: parseFloat(form.longitud), capacidadMaximaKg: parseFloat(form.capacidadMaximaKg) })
      onCreado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Crear centro de acopio" onClose={onClose} width={540}>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Nombre"           value={form.nombre}           onChange={set('nombre')}           required />
          <Input label="Teléfono"         value={form.telefono}         onChange={set('telefono')} />
          <Input label="Dirección"        value={form.direccion}        onChange={set('direccion')}        required />
          <Input label="Región"           value={form.region}           onChange={set('region')}           required />
          <Input label="Comuna"           value={form.comuna}           onChange={set('comuna')}           required />
          <Input label="Capacidad máx kg" type="number" value={form.capacidadMaximaKg} onChange={set('capacidadMaximaKg')} required />
          <Input label="Latitud"          type="number" value={form.latitud}           onChange={set('latitud')} />
          <Input label="Longitud"         type="number" value={form.longitud}          onChange={set('longitud')} />
          <Input label="Nombre encargado" value={form.nombreEncargado}  onChange={set('nombreEncargado')} />
          <Input label="Email encargado"  type="email" value={form.emailEncargado}    onChange={set('emailEncargado')} />
        </div>
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? 'Creando...' : 'Crear centro'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

function ModalEnvio({ onClose, onCreado }) {
  const [form, setForm] = useState({ centroOrigenId:'1', destinoDescripcion:'', destinoDireccion:'', destinoRegion:'', destinoComuna:'', transportistaNombre:'', transportistaRut:'', patenteVehiculo:'', fechaPlanificada:'', observaciones:'' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      await adminLogistica.planificarEnvio({
        ...form,
        centroOrigenId: parseInt(form.centroOrigenId),
        detalles: [{ tipoRecurso: 'ALIMENTOS', cantidad: 0, unidadMedida: 'kg', descripcion: 'Ver observaciones' }],
      })
      onCreado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Planificar envío" onClose={onClose} width={540}>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="ID Centro origen"  type="number" value={form.centroOrigenId}       onChange={set('centroOrigenId')}       required />
          <Input label="Fecha planificada" type="date"   value={form.fechaPlanificada}      onChange={set('fechaPlanificada')}     required />
          <Input label="Destino"           value={form.destinoDescripcion}  onChange={set('destinoDescripcion')}  required />
          <Input label="Dirección destino" value={form.destinoDireccion}    onChange={set('destinoDireccion')}    required />
          <Input label="Región destino"    value={form.destinoRegion}       onChange={set('destinoRegion')}       required />
          <Input label="Comuna destino"    value={form.destinoComuna}       onChange={set('destinoComuna')}       required />
          <Input label="Transportista"     value={form.transportistaNombre} onChange={set('transportistaNombre')} required />
          <Input label="RUT transportista" value={form.transportistaRut}    onChange={set('transportistaRut')}    required />
          <Input label="Patente"           value={form.patenteVehiculo}     onChange={set('patenteVehiculo')}     required />
          <Input label="Observaciones"     value={form.observaciones}       onChange={set('observaciones')} />
        </div>
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? 'Creando...' : 'Planificar'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

function ModalAccionEnvio({ envio, accion, onClose, onActualizado }) {
  const [texto,   setTexto]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError('')
    try {
      if (accion === 'despachar') await adminLogistica.despachar(envio.id)
      if (accion === 'entregar')  await adminLogistica.confirmarEntrega(envio.id, texto)
      if (accion === 'cancelar')  await adminLogistica.cancelar(envio.id, texto)
      onActualizado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (accion === 'despachar') return (
    <Modal title="Despachar envío" onClose={onClose} width={400}>
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>¿Confirmar despacho de <strong style={{ color: 'var(--text)' }}>{envio.numeroSeguimiento}</strong>?</p>
      {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
        <Btn variant="warning" onClick={submit} disabled={loading}>{loading ? '...' : 'Despachar'}</Btn>
      </div>
    </Modal>
  )

  return (
    <Modal title={accion === 'entregar' ? 'Confirmar entrega' : 'Cancelar envío'} onClose={onClose} width={420}>
      <form onSubmit={submit}>
        <Input label={accion === 'entregar' ? 'Observaciones de entrega' : 'Motivo de cancelación'} value={texto} onChange={setTexto} required />
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Volver</Btn>
          <Btn variant={accion === 'cancelar' ? 'danger' : 'success'} disabled={loading}>
            {loading ? '...' : (accion === 'entregar' ? 'Confirmar entrega' : 'Cancelar envío')}
          </Btn>
        </div>
      </form>
    </Modal>
  )
}

export default function GestionLogistica() {
  const [centros,   setCentros]   = useState([])
  const [envios,    setEnvios]    = useState({ content: [], totalPages: 0 })
  const [pagEnvios, setPagEnvios] = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)

  const cargarCentros = () => adminLogistica.listarCentros().then(setCentros).catch(console.error)
  const cargarEnvios  = (p = 0) => adminLogistica.listarEnvios(p).then(d => { setEnvios(d); setPagEnvios(p) }).catch(console.error)

  useEffect(() => { Promise.all([cargarCentros(), cargarEnvios()]).finally(() => setLoading(false)) }, [])

  const colCentros = [
    { key: 'id',               label: 'ID' },
    { key: 'nombre',           label: 'Nombre' },
    { key: 'comuna',           label: 'Ubicación',  render: r => `${r.comuna}, ${r.region}` },
    { key: 'estado',           label: 'Estado',     render: r => <Badge estado={r.estado} /> },
    { key: 'capacidadMaximaKg',label: 'Cap. máx.',  render: r => `${r.capacidadMaximaKg} kg` },
    { key: 'nombreEncargado',  label: 'Encargado' },
  ]

  const colEnvios = [
    { key: 'numeroSeguimiento',  label: 'N° Seguimiento' },
    { key: 'destinoDescripcion', label: 'Destino',      wrap: true },
    { key: 'estado',             label: 'Estado',       render: r => <Badge estado={r.estado} /> },
    { key: 'fechaPlanificada',   label: 'Fecha',        render: r => r.fechaPlanificada ? new Date(r.fechaPlanificada).toLocaleDateString('es-CL') : '—' },
    { key: 'transportistaNombre',label: 'Transportista' },
    {
      key: 'acciones', label: 'Acciones',
      render: r => (
        <div style={{ display: 'flex', gap: 6 }}>
          {r.estado === 'PLANIFICADO'  && <Btn size="sm" variant="warning" onClick={() => setModal({ accion: 'despachar', envio: r })}>Despachar</Btn>}
          {r.estado === 'EN_TRANSITO'  && <Btn size="sm" variant="success" onClick={() => setModal({ accion: 'entregar',  envio: r })}>Entregar</Btn>}
          {(r.estado === 'PLANIFICADO' || r.estado === 'EN_TRANSITO') && (
            <Btn size="sm" variant="danger" onClick={() => setModal({ accion: 'cancelar', envio: r })}>Cancelar</Btn>
          )}
        </div>
      ),
    },
  ]

  if (loading) return <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>Cargando...</div>

  return (
    <div>
      <Section title="🏪 Centros de acopio" action={<Btn size="sm" onClick={() => setModal('centro')}>+ Nuevo centro</Btn>}>
        {centros.length === 0
          ? <EmptyState icon="🏪" title="Sin centros registrados" desc="Crea el primer centro de acopio" />
          : <Table columns={colCentros} rows={centros} />
        }
      </Section>

      <Section title="🚚 Gestión de envíos" action={<Btn size="sm" onClick={() => setModal('envio')}>+ Planificar envío</Btn>}>
        <Table columns={colEnvios} rows={envios.content || []} emptyMsg="Sin envíos registrados" />
        <div style={{ padding: '12px 16px' }}>
          <Pager page={pagEnvios} totalPages={envios.totalPages} onChange={p => cargarEnvios(p)} />
        </div>
      </Section>

      {modal === 'centro' && <ModalCentro onClose={() => setModal(null)} onCreado={() => { setModal(null); cargarCentros() }} />}
      {modal === 'envio'  && <ModalEnvio  onClose={() => setModal(null)} onCreado={() => { setModal(null); cargarEnvios() }} />}
      {modal?.accion && (
        <ModalAccionEnvio envio={modal.envio} accion={modal.accion}
          onClose={() => setModal(null)}
          onActualizado={() => { setModal(null); cargarEnvios(pagEnvios) }}
        />
      )}
    </div>
  )
}