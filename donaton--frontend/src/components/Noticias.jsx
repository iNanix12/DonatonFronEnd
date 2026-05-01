import { useEffect, useState } from 'react'
import { necesidades } from '../services/api'
import { useAuth } from '../context/AuthContext'

const tagStyles = {
  CRITICA:   { bg: 'rgba(232,52,90,.15)',   color: '#e8345a', label: 'Urgente' },
  ALTA:      { bg: 'rgba(255,107,53,.15)',  color: '#ff6b35', label: 'Alta prioridad' },
  MEDIA:     { bg: 'rgba(100,149,237,.15)', color: '#6495ed', label: 'Media prioridad' },
  TERREMOTO: { bg: 'rgba(232,52,90,.15)',   color: '#e8345a', label: 'Terremoto' },
  INCENDIO:  { bg: 'rgba(255,107,53,.15)',  color: '#ff6b35', label: 'Incendio' },
  INUNDACION:{ bg: 'rgba(100,149,237,.15)', color: '#6495ed', label: 'Inundación' },
}
const emojis = { ALIMENTO: '🍚', ROPA: '👕', INSUMOS_MEDICOS: '💊', INSUMOS_HIGIENE: '🧼', DINERO: '💰', OTRO: '📦' }

const ESTATICAS = [
  { id: 1, tag: 'TERREMOTO', emoji: '🏔️', titulo: 'Más de 1.200 familias reciben asistencia tras sismo 6.2 en Coquimbo', extracto: 'Nuestros centros de acopio respondieron en menos de 4 horas, distribuyendo alimentos, agua y frazadas a los sectores más afectados.', fecha: '28 abril 2026', region: 'Coquimbo' },
  { id: 2, tag: 'INCENDIO',  emoji: '🔥', titulo: 'Respuesta solidaria en Viña del Mar: 340 familias reubicadas',                extracto: '6 centros de acopio recibieron más de 4 toneladas de ropa y enseres básicos en 48 horas.',                                     fecha: '15 marzo 2026', region: 'Valparaíso' },
  { id: 3, tag: 'INUNDACION',emoji: '🌊', titulo: 'Desborde del Biobío: ayuda llega a Concepción en tiempo récord',              extracto: 'Sistema logístico de Donaton coordinó envíos a 8 comunas afectadas en menos de 6 horas desde la alerta.',                    fecha: '2 febrero 2026', region: 'Biobío' },
]

function NewsCard({ n, principal }) {
  const tag = tagStyles[n.tag || n.prioridad] || tagStyles.MEDIA
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 20, overflow: 'hidden', transition: 'all .3s', cursor: 'pointer',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.borderColor = 'rgba(232,52,90,.2)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--border)' }}
    >
      <div style={{
        width: '100%', aspectRatio: principal ? '16/8' : '16/10',
        background: 'var(--surface2)', display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: principal ? '4rem' : '3rem',
      }}>
        {n.emoji || emojis[n.tipoRecursoNecesario] || '📦'}
      </div>
      <div style={{ padding: 20 }}>
        <span style={{
          display: 'inline-block', fontSize: '.7rem', letterSpacing: '.08em',
          textTransform: 'uppercase', fontWeight: 600, padding: '4px 10px',
          borderRadius: 100, marginBottom: 12, background: tag.bg, color: tag.color,
        }}>{tag.label}</span>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, lineHeight: 1.3, marginBottom: 8, fontSize: principal ? '1.3rem' : '1rem' }}>
          {n.titulo}
        </div>
        <div style={{ fontSize: '.825rem', color: 'var(--muted)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {n.extracto || n.descripcion}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', fontSize: '.75rem', color: 'var(--muted)' }}>
          <span>{n.fecha || new Date(n.fechaReporte).toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          <span>📍 {n.region || n.zona || 'Chile'}</span>
        </div>
      </div>
    </div>
  )
}

export default function Noticias() {
  const { user }            = useAuth()
  const [items, setItems]   = useState(ESTATICAS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user) return
    setLoading(true)
    necesidades.listarUrgentes()
      .then(data => {
        if (!data?.length) return
        setItems(data.slice(0, 3).map((r, i) => ({
          id: r.id, tag: r.prioridad,
          emoji: emojis[r.tipoRecursoNecesario] || '📦',
          titulo: r.titulo, extracto: r.descripcion,
          zona: r.zonaAfectadaNombre || 'Chile', fecha: r.fechaReporte,
        })))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  const [principal, ...resto] = items

  return (
    <section id="noticias" style={{ padding: '0 5vw 100px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 80 }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
          <div>
            <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 16 }}>
              {user ? 'Necesidades urgentes en tiempo real' : 'Noticias'}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.1 }}>
              Ayuda en acción<br />a lo largo de Chile
            </h2>
          </div>
          <a href="#" style={{ color: 'var(--accent)', fontSize: '.875rem', textDecoration: 'none', fontWeight: 500 }}>Ver todas →</a>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--muted)', padding: 60 }}>Cargando...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 20 }}>
            <NewsCard n={principal} principal />
            {resto.map(n => <NewsCard key={n.id} n={n} principal={false} />)}
          </div>
        )}
      </div>
    </section>
  )
}