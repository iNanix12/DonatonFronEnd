import { useEffect, useState } from 'react'
import { adminNecesidades, adminLogistica, adminDonaciones } from '../../services/adminApi'
import { MetricCard, Badge, EmptyState, Section, Btn } from './AdminUI'

export default function Dashboard({ onNavigate }) {
  const [resumen,  setResumen]  = useState(null)
  const [urgentes, setUrgentes] = useState([])
  const [envios,   setEnvios]   = useState([])
  const [donacs,   setDonacs]   = useState([])
  const [loading,  setLoading]  = useState(true)

  useEffect(() => {
    Promise.all([
      adminNecesidades.resumen(),
      adminNecesidades.listarUrgentes(),
      adminLogistica.listarEnvios(0, 5),
      adminDonaciones.listarGlobal(0, 5),
    ]).then(([res, urg, env, don]) => {
      setResumen(res)
      setUrgentes(urg || [])
      setEnvios(env?.content || [])
      setDonacs(don?.content || [])
    }).catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--muted)' }}>
      Cargando dashboard...
    </div>
  )

  const prioColor = { CRITICA: '#e8345a', ALTA: '#ff6b35', MEDIA: '#ffa735', BAJA: '#888898' }
  const EMOJI = { ALIMENTOS: '🍚', ROPA: '👕', DINERO: '💰', INSUMOS_MEDICOS: '💊', INSUMOS_HIGIENE: '🧼' }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <MetricCard icon="📋" label="Reportes urgentes"   value={urgentes.length}                 color="#e8345a" />
        <MetricCard icon="🗺️" label="Zonas activas"       value={resumen?.totalZonasActivas}       color="#6495ed" />
        <MetricCard icon="📦" label="Total asignaciones"  value={resumen?.totalAsignaciones}       color="#ffa735" />
        <MetricCard icon="✅" label="Asignaciones conf."  value={resumen?.asignacionesConfirmadas} color="#48c78e" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <Section title="🚨 Reportes urgentes" action={<Btn variant="ghost" size="sm" onClick={() => onNavigate('necesidades')}>Ver todos</Btn>}>
          {urgentes.length === 0
            ? <EmptyState icon="✅" title="Sin reportes urgentes" />
            : urgentes.slice(0, 5).map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: prioColor[r.prioridad] || '#888', boxShadow: `0 0 8px ${prioColor[r.prioridad] || '#888'}` }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.titulo}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2 }}>{r.tipoRecursoNecesario} · {r.cantidadRequerida} {r.unidadMedida}</div>
                </div>
                <Badge estado={r.prioridad} />
              </div>
            ))
          }
        </Section>

        <Section title="🚚 Últimos envíos" action={<Btn variant="ghost" size="sm" onClick={() => onNavigate('logistica')}>Ver todos</Btn>}>
          {envios.length === 0
            ? <EmptyState icon="📭" title="Sin envíos registrados" />
            : envios.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '.85rem', fontWeight: 500 }}>{e.numeroSeguimiento}</div>
                  <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.destinoDescripcion}</div>
                </div>
                <Badge estado={e.estado} />
              </div>
            ))
          }
        </Section>
      </div>

      <Section title="💝 Últimas donaciones" action={<Btn variant="ghost" size="sm" onClick={() => onNavigate('donaciones')}>Ver todas</Btn>}>
        {donacs.length === 0
          ? <EmptyState icon="📭" title="Sin donaciones registradas" />
          : donacs.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: 'rgba(232,52,90,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>
                {EMOJI[d.tipoRecurso] || '📦'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '.85rem', fontWeight: 500 }}>{d.tipoRecurso}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 1 }}>{d.descripcion}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '.95rem', fontWeight: 700, color: 'var(--accent)' }}>{d.cantidad} {d.unidadMedida}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 1 }}>
                  {d.fechaDonacion ? new Date(d.fechaDonacion).toLocaleDateString('es-CL') : ''}
                </div>
              </div>
            </div>
          ))
        }
      </Section>
    </div>
  )
}