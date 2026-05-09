import { useEffect, useState } from 'react'
import { Section, Table, Badge, Btn, Pager, Modal, Input, Select, EmptyState } from './AdminUI'
import { adminNecesidades, adminLogistica } from '../../services/adminApi'
import { REGIONES_DATA } from '../../data/regiones'

const TIPOS_RECURSO   = [{ value:'ALIMENTO',label:'🍚 Alimentos'},{ value:'ROPA',label:'👕 Ropa'},{ value:'INSUMOS_MEDICOS',label:'💊 Insumos médicos'},{ value:'INSUMOS_HIGIENE',label:'🧼 Higiene'},{ value:'OTRO',label:'📦 Otro'}]
const PRIORIDADES     = [{ value:'CRITICA',label:'🔴 Crítica'},{ value:'ALTA',label:'🟠 Alta'},{ value:'MEDIA',label:'🟡 Media'},{ value:'BAJA',label:'⚪ Baja'}]
const ESTADOS_REPORTE = [{ value:'PENDIENTE',label:'Pendiente'},{ value:'EN_PROCESO',label:'En proceso'},{ value:'ATENDIDO',label:'Atendido'}]
const TIPOS_EMERGENCIA= [{ value:'INUNDACION',label:'Inundación'},{ value:'INCENDIO',label:'Incendio'},{ value:'TERREMOTO',label:'Terremoto'},{ value:'OTRO',label:'Otro'}]




function ModalZona({ onClose, onCreado }) {
  const [form, setForm] = useState({ 
    nombre: '', descripcion: '', region: '', comuna: '', 
    latitud: '', longitud: '', tipoEmergencia: 'INUNDACION' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  // Lógica de cascada: Región -> Comuna
  const handleRegionChange = (nuevaRegion) => {
    setForm(f => ({ 
      ...f, 
      region: nuevaRegion, 
      comuna: '' // Limpiamos la comuna al cambiar de región
    }))
  }

  // Obtenemos la lista de comunas basada en la región seleccionada
  const comunasDisponibles = REGIONES_DATA.find(r => r.nombre === form.region)?.comunas || []

  const submit = async (e) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  if (!form.comuna) {
    setError('Debes seleccionar una comuna')
    setLoading(false)
    return
  }

  const body = {
    nombre:         form.nombre.trim(),
    descripcion:    form.descripcion.trim(),
    region:         form.region,
    comuna:         form.comuna,
    tipoEmergencia: form.tipoEmergencia,
  }

  if (form.latitud !== '')  body.latitud  = parseFloat(form.latitud)
  if (form.longitud !== '') body.longitud = parseFloat(form.longitud)

  try {
    await adminNecesidades.crearZona(body)
    onCreado()
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}

  return (
    <Modal title="Crear zona afectada" onClose={onClose} width={500}>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Nombre" value={form.nombre} onChange={set('nombre')} required />
          <Select label="Tipo emergencia" value={form.tipoEmergencia} onChange={set('tipoEmergencia')} options={TIPOS_EMERGENCIA} required />
          
          {/* SELECT DE REGIÓN */}
          <Select 
            label="Región" 
            value={form.region} 
            onChange={handleRegionChange} 
            options={REGIONES_DATA.map(r => ({ label: r.nombre, value: r.nombre }))}
            required 
          />

          {/* SELECT DE COMUNA */}
          <Select 
            label="Comuna" 
            value={form.comuna} 
            onChange={set('comuna')} 
            options={comunasDisponibles.map(c => ({ label: c, value: c }))}
            disabled={!form.region} // Bloqueado hasta elegir región
            required 
          />

          <Input label="Latitud" type="number" value={form.latitud} onChange={set('latitud')} />
          <Input label="Longitud" type="number" value={form.longitud} onChange={set('longitud')} />
        </div>
        <Input label="Descripción" value={form.descripcion} onChange={set('descripcion')} required />
        
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12 }}>{error}</div>}
        
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
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
  const [inventario, setInventario] = useState([])   // items del centro
  const [centros,    setCentros]    = useState([])
  const [centroId,   setCentroId]   = useState('1')
  const [itemSel,    setItemSel]    = useState(null)  // item de inventario seleccionado
  const [form, setForm] = useState({
    cantidadAsignada: '',
    unidadMedida: '',
    asignadoPor: 'admin',
    observaciones: '',
  })
  const [loading,     setLoading]     = useState(false)
  const [loadingInv,  setLoadingInv]  = useState(false)
  const [error,       setError]       = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))

  // Cargar centros al abrir
  useEffect(() => {
    adminLogistica.listarCentros()
      .then(lista => {
        const arr = Array.isArray(lista) ? lista : []
        setCentros(arr)
        if (arr.length > 0) {
          setCentroId(String(arr[0].id))
          cargarInventario(arr[0].id)
        }
      })
      .catch(console.error)
  }, [])

  const cargarInventario = (id) => {
    setLoadingInv(true)
    setItemSel(null)
    setForm(f => ({ ...f, unidadMedida: '', cantidadAsignada: '' }))
    adminLogistica.obtenerCentro(id)
      .then(centro => {
        const inv = centro.inventario || []
        setInventario(inv)
        // Pre-seleccionar el item que coincide con el tipo del reporte
        const match = inv.find(i =>
          i.tipoRecurso === reporte.tipoRecursoNecesario ||
          // compatibilidad ALIMENTO vs ALIMENTOS
          i.tipoRecurso?.replace(/S$/, '') === reporte.tipoRecursoNecesario?.replace(/S$/, '')
        )
        if (match) seleccionarItem(match)
      })
      .catch(console.error)
      .finally(() => setLoadingInv(false))
  }

  const seleccionarItem = (item) => {
    setItemSel(item)
    setForm(f => ({ ...f, unidadMedida: item.unidadMedida }))
  }

  const handleCentroChange = (id) => {
    setCentroId(id)
    cargarInventario(parseInt(id))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (!form.cantidadAsignada || parseFloat(form.cantidadAsignada) <= 0) {
      setError('Ingresa una cantidad válida'); return
    }
    if (itemSel && parseFloat(form.cantidadAsignada) > itemSel.cantidadDisponible) {
      setError(`Stock insuficiente. Disponible: ${itemSel.cantidadDisponible} ${itemSel.unidadMedida}`); return
    }
    setLoading(true); setError('')
    try {
      await adminNecesidades.crearAsignacion({
        reporteNecesidadId:   reporte.id,
        tipoRecurso:          itemSel?.tipoRecurso || reporte.tipoRecursoNecesario,
        cantidadAsignada:     parseFloat(form.cantidadAsignada),
        unidadMedida:         form.unidadMedida,
        centroAcopioIdOrigen: parseInt(centroId),
        asignadoPor:          form.asignadoPor,
        observaciones:        form.observaciones,
      })
      onCreado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  const opcionCentros = centros.map(c => ({ value: String(c.id), label: `${c.nombre} (${c.comuna})` }))
  const stockColor = itemSel
    ? itemSel.cantidadDisponible === 0 ? '#e8345a'
      : itemSel.cantidadDisponible < 20 ? '#ffa735' : '#48c78e'
    : 'var(--muted)'

  return (
    <Modal title={`Asignar recursos — Reporte #${reporte.id}`} onClose={onClose} width={500}>
      {/* Info del reporte */}
      <div style={{
        background: 'var(--surface2)', borderRadius: 10, padding: '12px 16px',
        marginBottom: 20, fontSize: '.875rem',
      }}>
        <div style={{ fontWeight: 500, marginBottom: 4 }}>{reporte.titulo}</div>
        <div style={{ color: 'var(--muted)' }}>
          Necesita: <strong style={{ color: 'var(--text)' }}>
            {reporte.cantidadRequerida} {reporte.unidadMedida}
          </strong> de <strong style={{ color: 'var(--text)' }}>{reporte.tipoRecursoNecesario}</strong>
        </div>
      </div>

      <form onSubmit={submit}>
        {/* Selector de centro */}
        {centros.length > 0 && (
          <Select
            label="Centro de acopio origen"
            value={centroId}
            onChange={handleCentroChange}
            options={opcionCentros}
            required
          />
        )}

        {/* Inventario disponible en el centro */}
        {loadingInv ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '16px 0', fontSize: '.85rem' }}>
            Cargando inventario...
          </div>
        ) : inventario.length === 0 ? (
          <div style={{
            background: 'rgba(232,52,90,.08)', border: '1px solid rgba(232,52,90,.2)',
            borderRadius: 10, padding: '12px 16px', marginBottom: 14,
            fontSize: '.85rem', color: '#e8345a',
          }}>
            ⚠️ Este centro no tiene inventario registrado
          </div>
        ) : (
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 8, letterSpacing: '.05em', textTransform: 'uppercase' }}>
              Inventario disponible — selecciona un recurso
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
              {inventario.map(item => {
                const seleccionado = itemSel?.id === item.id
                const sinStock = item.cantidadDisponible === 0
                const stockBajo = item.cantidadDisponible < 20
                const color = sinStock ? '#e8345a' : stockBajo ? '#ffa735' : '#48c78e'
                const EMOJIS = { ALIMENTOS: '🍚', ROPA: '👕', DINERO: '💰', INSUMOS_MEDICOS: '💊', INSUMOS_HIGIENE: '🧼', OTRO: '📦' }

                return (
                  <div
                    key={item.id}
                    onClick={() => !sinStock && seleccionarItem(item)}
                    style={{
                      padding: '10px 14px', borderRadius: 10,
                      border: `1px solid ${seleccionado ? 'var(--accent)' : 'var(--border)'}`,
                      background: seleccionado ? 'rgba(232,52,90,.08)' : 'var(--bg)',
                      cursor: sinStock ? 'not-allowed' : 'pointer',
                      opacity: sinStock ? .5 : 1,
                      transition: 'all .15s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: '1.1rem' }}>{EMOJIS[item.tipoRecurso] || '📦'}</span>
                      <span style={{ fontSize: '.82rem', fontWeight: 600 }}>{item.tipoRecurso}</span>
                      {seleccionado && <span style={{ marginLeft: 'auto', color: 'var(--accent)', fontSize: '.8rem' }}>✓</span>}
                    </div>
                    <div style={{ fontSize: '.82rem', color, fontWeight: 600 }}>
                      {Number(item.cantidadDisponible).toLocaleString('es-CL')} {item.unidadMedida}
                    </div>
                    {sinStock && <div style={{ fontSize: '.72rem', color: '#e8345a', marginTop: 2 }}>Sin stock</div>}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Stock disponible del item seleccionado */}
        {itemSel && (
          <div style={{
            background: `${stockColor}12`, border: `1px solid ${stockColor}33`,
            borderRadius: 10, padding: '10px 14px', marginBottom: 14,
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: '.85rem',
          }}>
            <span style={{ color: 'var(--muted)' }}>Stock disponible en este centro:</span>
            <strong style={{ color: stockColor, fontFamily: 'var(--font-display)', fontSize: '1rem' }}>
              {Number(itemSel.cantidadDisponible).toLocaleString('es-CL')} {itemSel.unidadMedida}
            </strong>
          </div>
        )}

        {/* Campos de cantidad y unidad */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input
            label="Cantidad a asignar"
            type="number"
            value={form.cantidadAsignada}
            onChange={set('cantidadAsignada')}
            placeholder="0"
            required
          />
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: '.78rem', color: 'var(--muted)', marginBottom: 5, letterSpacing: '.05em', textTransform: 'uppercase' }}>
              Unidad medida
            </div>
            <div style={{
              padding: '9px 12px', background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 8, color: itemSel ? 'var(--text)' : 'var(--muted)',
              fontSize: '.875rem',
            }}>
              {form.unidadMedida || '— selecciona un recurso —'}
            </div>
          </div>
        </div>

        <Input label="Asignado por" value={form.asignadoPor} onChange={set('asignadoPor')} required />
        <Input label="Observaciones (opcional)" value={form.observaciones} onChange={set('observaciones')} />

        {error && (
          <div style={{
            color: '#e8345a', fontSize: '.85rem', marginBottom: 12,
            padding: '8px 12px', background: 'rgba(232,52,90,.08)', borderRadius: 8,
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading || !itemSel || !form.cantidadAsignada}>
            {loading ? '...' : 'Asignar recursos'}
          </Btn>
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