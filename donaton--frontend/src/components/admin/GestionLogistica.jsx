import { useEffect, useState } from 'react'
import { adminLogistica } from '../../services/adminApi'
import { Section, Table, Badge, Btn, Pager, Modal, Input, Select, EmptyState } from './AdminUI'
import { REGIONES_DATA } from '../../data/regiones'

// ── Modal crear/editar centro ─────────────────────────────────────────────────
function ModalCentro({ centro = null, onClose, onGuardado }) {
  const editando = centro !== null
  const [form, setForm] = useState({
    nombre:           centro?.nombre           || '',
    direccion:        centro?.direccion        || '',
    region:           centro?.region           || '',
    comuna:           centro?.comuna           || '',
    latitud:          centro?.latitud          || '',
    longitud:         centro?.longitud         || '',
    capacidadMaximaKg: centro?.capacidadMaximaKg || '',
    telefono:         centro?.telefono         || '',
    emailEncargado:   centro?.emailEncargado   || '',
    nombreEncargado:  centro?.nombreEncargado  || '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const set = k => v => setForm(f => ({ ...f, [k]: v }))
  const handleRegionChange = v => setForm(f => ({ ...f, region: v, comuna: '' }))
  const comunas = REGIONES_DATA.find(r => r.nombre === form.region)?.comunas || []

  const submit = async (e) => {
    e.preventDefault()
    if (!form.comuna) { setError('Selecciona una comuna'); return }
    setLoading(true); setError('')

    const body = {
      nombre:            form.nombre.trim(),
      direccion:         form.direccion.trim(),
      region:            form.region,
      comuna:            form.comuna,
      capacidadMaximaKg: form.capacidadMaximaKg ? parseInt(form.capacidadMaximaKg) : undefined,
    }
    if (form.telefono?.trim())        body.telefono        = form.telefono.trim()
    if (form.nombreEncargado?.trim()) body.nombreEncargado = form.nombreEncargado.trim()
    if (form.emailEncargado?.trim())  body.emailEncargado  = form.emailEncargado.trim()
    if (form.latitud !== '')          body.latitud         = parseFloat(form.latitud)
    if (form.longitud !== '')         body.longitud        = parseFloat(form.longitud)

    try {
      if (editando) {
        await adminLogistica.actualizarCentro(centro.id, body)
      } else {
        await adminLogistica.crearCentro(body)
      }
      onGuardado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title={editando ? `Editar centro — ${centro.nombre}` : 'Crear centro de acopio'} onClose={onClose} width={560}>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Input label="Nombre *"           value={form.nombre}            onChange={set('nombre')}           required placeholder="Centro Acopio Santiago" />
          <Input label="Teléfono"           value={form.telefono}          onChange={set('telefono')}          placeholder="+56222001122" />
          <Input label="Dirección *"        value={form.direccion}         onChange={set('direccion')}         required placeholder="Av. Libertador 100" />
          <Input label="Capacidad máx (kg)" type="number" value={form.capacidadMaximaKg} onChange={set('capacidadMaximaKg')} placeholder="5000" />

          <Select
            label="Región *"
            value={form.region}
            onChange={handleRegionChange}
            options={[{ value: '', label: '— Selecciona región —' }, ...REGIONES_DATA.map(r => ({ value: r.nombre, label: r.nombre }))]}
            required
          />
          <Select
            label="Comuna *"
            value={form.comuna}
            onChange={set('comuna')}
            options={comunas.map(c => ({ value: c, label: c }))}
            disabled={!form.region}
            required
          />

          <Input label="Nombre encargado"   value={form.nombreEncargado}   onChange={set('nombreEncargado')}   placeholder="Carlos Rojas" />
          <Input label="Email encargado"    type="email" value={form.emailEncargado}  onChange={set('emailEncargado')}  placeholder="enc@donaton.cl" />
          <Input label="Latitud"            type="number" value={form.latitud}   onChange={set('latitud')}   placeholder="-33.4372" />
          <Input label="Longitud"           type="number" value={form.longitud}  onChange={set('longitud')}  placeholder="-70.6506" />
        </div>

        {error && (
          <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12, padding: '8px 12px', background: 'rgba(232,52,90,.08)', borderRadius: 8, marginTop: 8 }}>
            ⚠️ {error}
          </div>
        )}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? (editando ? 'Guardando...' : 'Creando...') : (editando ? 'Guardar cambios' : 'Crear centro')}</Btn>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal eliminar centro ─────────────────────────────────────────────────────
function ModalEliminarCentro({ centro, onClose, onEliminado }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const confirmar = async () => {
    setLoading(true); setError('')
    try {
      await adminLogistica.eliminarCentro(centro.id)
      onEliminado()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <Modal title="Eliminar centro de acopio" onClose={onClose} width={420}>
      <p style={{ color: 'var(--muted)', marginBottom: 8 }}>
        ¿Eliminar permanentemente <strong style={{ color: 'var(--text)' }}>{centro.nombre}</strong>?
      </p>
      <p style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 20 }}>
        Se eliminará todo su inventario y el historial de envíos asociados.
      </p>
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

// ── Modal ver inventario ──────────────────────────────────────────────────────
function ModalInventario({ centro, onClose }) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminLogistica.obtenerCentro(centro.id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [centro.id])

  const EMOJI = {
    ALIMENTOS: '🍚', ROPA: '👕', DINERO: '💰',
    INSUMOS_MEDICOS: '💊', INSUMOS_HIGIENE: '🧼', OTRO: '📦',
  }

  const totalKg = data?.inventario?.reduce((acc, i) => {
    if (i.unidadMedida === 'kg') return acc + Number(i.cantidadDisponible)
    return acc
  }, 0) || 0

  const pctCapacidad = data?.capacidadMaximaKg
    ? Math.min(100, Math.round((totalKg / data.capacidadMaximaKg) * 100))
    : 0

  return (
    <Modal title={`Inventario — ${centro.nombre}`} onClose={onClose} width={500}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--muted)' }}>
          Cargando inventario...
        </div>
      ) : (
        <>
          {/* Cabecera del centro */}
          <div style={{
            background: 'var(--surface2)', borderRadius: 12,
            padding: '14px 18px', marginBottom: 20,
          }}>
            <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: 4 }}>
              {data?.direccion} · {data?.comuna}, {data?.region}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: '.82rem', color: 'var(--muted)' }}>Capacidad usada (kg)</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '.9rem', fontWeight: 700 }}>
                {totalKg.toLocaleString('es-CL')} / {data?.capacidadMaximaKg?.toLocaleString('es-CL') || '—'} kg
              </span>
            </div>
            {/* Barra de capacidad */}
            <div style={{ height: 6, background: 'var(--bg)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 3, transition: 'width .5s',
                width: `${pctCapacidad}%`,
                background: pctCapacidad > 80 ? '#e8345a' : pctCapacidad > 50 ? '#ffa735' : '#48c78e',
              }} />
            </div>
            <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>
              {pctCapacidad}% de capacidad
            </div>
          </div>

          {/* Items de inventario */}
          {!data?.inventario?.length ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
              <div style={{ fontWeight: 500, marginBottom: 4 }}>Sin inventario</div>
              <div style={{ fontSize: '.82rem' }}>Distribuye donaciones a este centro para ver el stock</div>
            </div>
          ) : (
            <div>
              <div style={{
                fontSize: '.75rem', color: 'var(--muted)', letterSpacing: '.08em',
                textTransform: 'uppercase', marginBottom: 10,
              }}>
                Stock actual
              </div>
              {data.inventario.map(item => {
                const pct = data.capacidadMaximaKg && item.unidadMedida === 'kg'
                  ? Math.min(100, (item.cantidadDisponible / data.capacidadMaximaKg) * 100)
                  : 0
                const color = item.cantidadDisponible === 0 ? '#e8345a'
                  : item.cantidadDisponible < 20 ? '#ffa735' : '#48c78e'

                return (
                  <div key={item.id} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 0', borderBottom: '1px solid var(--border)',
                  }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                      background: `${color}15`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem',
                    }}>
                      {EMOJI[item.tipoRecurso] || '📦'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: '.875rem', fontWeight: 500 }}>{item.tipoRecurso}</span>
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: '.95rem',
                          fontWeight: 700, color,
                        }}>
                          {Number(item.cantidadDisponible).toLocaleString('es-CL')} {item.unidadMedida}
                        </span>
                      </div>
                      {item.unidadMedida === 'kg' && (
                        <div style={{ height: 4, background: 'var(--surface2)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', width: `${pct}%`, background: color,
                            borderRadius: 2, transition: 'width .5s',
                          }} />
                        </div>
                      )}
                      {item.ultimaActualizacion && (
                        <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 4 }}>
                          Última actualización: {new Date(item.ultimaActualizacion).toLocaleDateString('es-CL', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Capacidad total */}
          <div style={{
            marginTop: 16, padding: '12px 16px',
            background: 'var(--surface2)', borderRadius: 10,
            display: 'flex', justifyContent: 'space-between',
            fontSize: '.82rem', color: 'var(--muted)',
          }}>
            <span>Encargado:</span>
            <strong style={{ color: 'var(--text)' }}>{data?.nombreEncargado || '—'}</strong>
          </div>
        </>
      )}
      <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end' }}>
        <Btn variant="ghost" onClick={onClose}>Cerrar</Btn>
      </div>
    </Modal>
  )
}

// ── Modal planificar envío ────────────────────────────────────────────────────
function ModalEnvio({ centros, onClose, onCreado }) {
  const [form, setForm] = useState({
    centroOrigenId: centros[0]?.id || '',
    destinoDescripcion: '', destinoDireccion: '',
    destinoRegion: '', destinoComuna: '',
    transportistaNombre: '', transportistaRut: '',
    patenteVehiculo: '', fechaPlanificada: '', observaciones: '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const set = k => v => setForm(f => ({ ...f, [k]: v }))
  const handleRegionChange = v => setForm(f => ({ ...f, destinoRegion: v, destinoComuna: '' }))
  const comunas = REGIONES_DATA.find(r => r.nombre === form.destinoRegion)?.comunas || []

  const submit = async (e) => {
    e.preventDefault()
    if (!form.destinoComuna) { setError('Selecciona una comuna destino'); return }
    setLoading(true); setError('')
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

  const opcionCentros = centros.map(c => ({ value: String(c.id), label: `${c.nombre} (${c.comuna})` }))

  return (
    <Modal title="Planificar envío" onClose={onClose} width={560}>
      <form onSubmit={submit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <Select label="Centro origen *"    value={String(form.centroOrigenId)} onChange={v => set('centroOrigenId')(parseInt(v))} options={opcionCentros} required />
          <Input  label="Fecha planificada *" type="date" value={form.fechaPlanificada} onChange={set('fechaPlanificada')} required />
          <Input  label="Destino *"          value={form.destinoDescripcion}  onChange={set('destinoDescripcion')}  required placeholder="Refugio Los Pinos" />
          <Input  label="Dirección destino *" value={form.destinoDireccion}   onChange={set('destinoDireccion')}    required placeholder="Calle Los Pinos 45" />
          <Select label="Región destino *"   value={form.destinoRegion}       onChange={handleRegionChange}
            options={[{ value: '', label: '— Selecciona región —' }, ...REGIONES_DATA.map(r => ({ value: r.nombre, label: r.nombre }))]} required />
          <Select label="Comuna destino *"   value={form.destinoComuna}       onChange={set('destinoComuna')}
            options={comunas.map(c => ({ value: c, label: c }))} disabled={!form.destinoRegion} required />
          <Input  label="Transportista *"    value={form.transportistaNombre} onChange={set('transportistaNombre')} required />
          <Input  label="RUT transportista *" value={form.transportistaRut}   onChange={set('transportistaRut')}    required placeholder="12345678-9" />
          <Input  label="Patente *"          value={form.patenteVehiculo}     onChange={set('patenteVehiculo')}     required placeholder="AAZZ11" />
          <Input  label="Observaciones"      value={form.observaciones}       onChange={set('observaciones')} />
        </div>
        {error && <div style={{ color: '#e8345a', fontSize: '.85rem', marginBottom: 12, padding: '8px 12px', background: 'rgba(232,52,90,.08)', borderRadius: 8, marginTop: 8 }}>⚠️ {error}</div>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
          <Btn variant="ghost" onClick={onClose}>Cancelar</Btn>
          <Btn disabled={loading}>{loading ? 'Planificando...' : 'Planificar envío'}</Btn>
        </div>
      </form>
    </Modal>
  )
}

// ── Modal acción sobre envío ──────────────────────────────────────────────────
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
      <p style={{ color: 'var(--muted)', marginBottom: 20 }}>
        ¿Confirmar despacho de <strong style={{ color: 'var(--text)' }}>{envio.numeroSeguimiento}</strong>?
      </p>
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
            {loading ? '...' : accion === 'entregar' ? 'Confirmar entrega' : 'Cancelar envío'}
          </Btn>
        </div>
      </form>
    </Modal>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function GestionLogistica() {
  const [centros,   setCentros]   = useState([])
  const [envios,    setEnvios]    = useState({ content: [], totalPages: 0 })
  const [pagEnvios, setPagEnvios] = useState(0)
  const [loading,   setLoading]   = useState(true)
  const [modal,     setModal]     = useState(null)

  const cargarCentros = () =>
    adminLogistica.listarCentros().then(setCentros).catch(console.error)

  const cargarEnvios = (p = 0) =>
    adminLogistica.listarEnvios(p)
      .then(d => { setEnvios(d); setPagEnvios(p) })
      .catch(console.error)

  useEffect(() => {
    Promise.all([cargarCentros(), cargarEnvios()]).finally(() => setLoading(false))
  }, [])

  const toggleEstado = async (centro) => {
    await adminLogistica.toggleEstado(centro.id).catch(console.error)
    cargarCentros()
  }

  const colCentros = [
    { key: 'id',    label: 'ID' },
    {
      key: 'nombre', label: 'Centro',
      render: r => (
        <div>
          <div style={{ fontWeight: 500 }}>{r.nombre}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 1 }}>{r.direccion}</div>
        </div>
      ),
    },
    { key: 'comuna',           label: 'Ubicación',   render: r => `${r.comuna || '—'}, ${r.region || '—'}` },
    { key: 'estado',           label: 'Estado',      render: r => <Badge estado={r.estado} /> },
    { key: 'capacidadMaximaKg',label: 'Cap. máx.',   render: r => r.capacidadMaximaKg ? `${r.capacidadMaximaKg.toLocaleString('es-CL')} kg` : '—' },
    { key: 'nombreEncargado',  label: 'Encargado',   render: r => r.nombreEncargado || '—' },
    {
      key: 'acciones', label: 'Acciones',
      render: r => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <Btn size="sm" variant="ghost"
            onClick={() => setModal({ tipo: 'inventario', centro: r })}>
            📦 Inventario
          </Btn>
          <Btn size="sm" variant="ghost"
            onClick={() => setModal({ tipo: 'editarCentro', centro: r })}>
            ✏️ Editar
          </Btn>
          <Btn size="sm" variant={r.estado === 'ACTIVO' ? 'warning' : 'success'}
            onClick={() => toggleEstado(r)}>
            {r.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}
          </Btn>
          <Btn size="sm" variant="danger"
            onClick={() => setModal({ tipo: 'eliminarCentro', centro: r })}>
            🗑
          </Btn>
        </div>
      ),
    },
  ]

  const colEnvios = [
    { key: 'numeroSeguimiento',  label: 'N° Seguimiento' },
    { key: 'destinoDescripcion', label: 'Destino',      wrap: true },
    { key: 'estado',             label: 'Estado',       render: r => <Badge estado={r.estado} /> },
    {
      key: 'fechaPlanificada', label: 'Fecha',
      render: r => r.fechaPlanificada
        ? new Date(r.fechaPlanificada).toLocaleDateString('es-CL')
        : '—',
    },
    { key: 'transportistaNombre', label: 'Transportista' },
    {
      key: 'acciones', label: 'Acciones',
      render: r => (
        <div style={{ display: 'flex', gap: 6 }}>
          {r.estado === 'PLANIFICADO' && (
            <Btn size="sm" variant="warning" onClick={() => setModal({ accion: 'despachar', envio: r })}>
              Despachar
            </Btn>
          )}
          {r.estado === 'EN_TRANSITO' && (
            <Btn size="sm" variant="success" onClick={() => setModal({ accion: 'entregar', envio: r })}>
              Entregar
            </Btn>
          )}
          {(r.estado === 'PLANIFICADO' || r.estado === 'EN_TRANSITO') && (
            <Btn size="sm" variant="danger" onClick={() => setModal({ accion: 'cancelar', envio: r })}>
              Cancelar
            </Btn>
          )}
        </div>
      ),
    },
  ]

  if (loading) return (
    <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
      Cargando...
    </div>
  )

  return (
    <div>
      {/* Centros de acopio */}
      <Section
        title="🏪 Centros de acopio"
        action={<Btn size="sm" onClick={() => setModal({ tipo: 'nuevoCentro' })}>+ Nuevo centro</Btn>}
      >
        {centros.length === 0
          ? <EmptyState icon="🏪" title="Sin centros registrados" desc="Crea el primer centro de acopio" />
          : <Table columns={colCentros} rows={centros} />
        }
      </Section>

      {/* Envíos */}
      <Section
        title="🚚 Gestión de envíos"
        action={<Btn size="sm" onClick={() => setModal({ tipo: 'nuevoEnvio' })}>+ Planificar envío</Btn>}
      >
        <Table columns={colEnvios} rows={envios.content || []} emptyMsg="Sin envíos registrados" />
        <div style={{ padding: '12px 16px' }}>
          <Pager page={pagEnvios} totalPages={envios.totalPages} onChange={cargarEnvios} />
        </div>
      </Section>

      {/* Modales */}
      {modal?.tipo === 'nuevoCentro' && (
        <ModalCentro
          onClose={() => setModal(null)}
          onGuardado={() => { setModal(null); cargarCentros() }}
        />
      )}
      {modal?.tipo === 'editarCentro' && (
        <ModalCentro
          centro={modal.centro}
          onClose={() => setModal(null)}
          onGuardado={() => { setModal(null); cargarCentros() }}
        />
      )}
      {modal?.tipo === 'inventario' && (
        <ModalInventario
          centro={modal.centro}
          onClose={() => setModal(null)}
        />
      )}
      {modal?.tipo === 'eliminarCentro' && (
        <ModalEliminarCentro
          centro={modal.centro}
          onClose={() => setModal(null)}
          onEliminado={() => { setModal(null); cargarCentros() }}
        />
      )}
      {modal?.tipo === 'nuevoEnvio' && (
        <ModalEnvio
          centros={centros}
          onClose={() => setModal(null)}
          onCreado={() => { setModal(null); cargarEnvios() }}
        />
      )}
      {modal?.accion && (
        <ModalAccionEnvio
          envio={modal.envio}
          accion={modal.accion}
          onClose={() => setModal(null)}
          onActualizado={() => { setModal(null); cargarEnvios(pagEnvios) }}
        />
      )}
    </div>
  )
}