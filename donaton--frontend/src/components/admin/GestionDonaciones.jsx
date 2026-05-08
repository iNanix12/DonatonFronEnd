import { useEffect, useState } from 'react'
import { adminDonaciones } from '../../services/adminApi'
import { Section, Table, Pager, Btn, Input } from './AdminUI'

const EMOJI = { 
  ALIMENTOS: '🍚', ROPA: '👕', DINERO: '💰', 
  INSUMOS_MEDICOS: '💊', INSUMOS_HIGIENE: '🧼',
  // snake_case por si Jackson devuelve así
  alimentos: '🍚', ropa: '👕', dinero: '💰',
}

// Normaliza el objeto sin importar si viene camelCase o snake_case
function normalizar(d) {
  return {
    id:            d.id,
    tipoRecurso:   d.tipoRecurso   || d.tipo_recurso,
    cantidad:      d.cantidad,
    unidadMedida:  d.unidadMedida  || d.unidad_medida,
    descripcion:   d.descripcion,
    fechaDonacion: d.fechaDonacion  || d.fecha_donacion,
    centroAcopioId:d.centroAcopioId || d.centro_acopio_id,
    observaciones: d.observaciones,
    donanteId:     d.donanteId      || d.donante_id,
  }
}

export default function GestionDonaciones() {
  const [data,     setData]     = useState({ content: [], totalPages: 0 })
  const [page,     setPage]     = useState(0)
  const [loading,  setLoading]  = useState(false)
  const [rut,      setRut]      = useState('')
  const [rutQuery, setRutQuery] = useState('')
  const [rawResp,  setRawResp]  = useState(null) // debug

  const cargar = (p = 0, rutFilter = '') => {
    setLoading(true)
    const call = rutFilter
      ? adminDonaciones.historialPorRut(rutFilter, p)
      : adminDonaciones.listarGlobal(p)
    call
      .then(d => {
        setRawResp(d) // debug
        // Normalizar content
        const normalized = {
          ...d,
          content: (d.content || []).map(normalizar),
        }
        setData(normalized)
        setPage(p)
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { cargar(0) }, [])

  const buscar  = () => { setRutQuery(rut); cargar(0, rut) }
  const limpiar = () => { setRut(''); setRutQuery(''); cargar(0) }

  const columns = [
    { 
      key: 'tipoRecurso', 
      label: 'Tipo', 
      render: r => (
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {EMOJI[r.tipoRecurso] || '📦'} {r.tipoRecurso}
        </span>
      )
    },
    { 
      key: 'cantidad', 
      label: 'Cantidad', 
      render: r => `${r.cantidad ?? '—'} ${r.unidadMedida ?? ''}` 
    },
    { key: 'descripcion',   label: 'Descripción',   wrap: true },
    { 
      key: 'fechaDonacion', 
      label: 'Fecha', 
      render: r => {
        if (!r.fechaDonacion) return '—'
        try { return new Date(r.fechaDonacion).toLocaleDateString('es-CL') }
        catch { return r.fechaDonacion }
      }
    },
    { key: 'centroAcopioId', label: 'Centro',       render: r => r.centroAcopioId ? `Centro #${r.centroAcopioId}` : '—' },
    { key: 'donanteId',      label: 'Donante ID',   render: r => r.donanteId ? `#${r.donanteId}` : '—' },
    { key: 'observaciones',  label: 'Observaciones', wrap: true, render: r => r.observaciones || '—' },
  ]

  return (
    <div>
      {/* Buscador por RUT */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 20, marginBottom: 24,
        display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap',
      }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <Input
            label="Filtrar por RUT del donante"
            value={rut}
            onChange={setRut}
            placeholder="12345678-9"
          />
        </div>
        <Btn onClick={buscar} style={{ marginBottom: 14 }}>Buscar</Btn>
        {rutQuery && (
          <Btn variant="ghost" onClick={limpiar} style={{ marginBottom: 14 }}>
            Limpiar
          </Btn>
        )}
      </div>

      {/* Debug temporal — muestra qué devuelve el backend */}
      {rawResp && (data.content || []).length === 0 && (
        <div style={{
          background: 'rgba(232,52,90,.08)', border: '1px solid rgba(232,52,90,.2)',
          borderRadius: 12, padding: 16, marginBottom: 20, fontSize: '.8rem',
        }}>
          <div style={{ color: 'var(--accent)', fontWeight: 600, marginBottom: 8 }}>
            Debug — respuesta del backend (abre consola para ver completo):
          </div>
          <div style={{ color: 'var(--muted)', fontFamily: 'monospace', overflowX: 'auto' }}>
            totalElements: {rawResp.totalElements} | 
            totalPages: {rawResp.totalPages} | 
            content.length: {(rawResp.content || []).length}
          </div>
          {(rawResp.content || []).length > 0 && (
            <div style={{ color: 'var(--muted)', fontFamily: 'monospace', marginTop: 8 }}>
              Campos del primer elemento: {Object.keys(rawResp.content[0]).join(', ')}
            </div>
          )}
        </div>
      )}

      <Section title={`💝 Historial${rutQuery ? ` — RUT: ${rutQuery}` : ' — Global'}`}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: 'var(--muted)' }}>
            Cargando...
          </div>
        ) : (
          <Table
            columns={columns}
            rows={data.content || []}
            emptyMsg="No hay donaciones registradas. Verifica que el backend devuelva datos."
          />
        )}
        <div style={{ padding: '12px 16px' }}>
          <Pager
            page={page}
            totalPages={data.totalPages || 0}
            onChange={p => cargar(p, rutQuery)}
          />
        </div>
      </Section>
    </div>
  )
}