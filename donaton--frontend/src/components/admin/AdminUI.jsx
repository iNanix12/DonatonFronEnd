export function Badge({ estado }) {
  const map = {
    ACTIVO:      { bg: 'rgba(72,199,142,.15)',  color: '#48c78e', label: 'Activo' },
    ACTIVA:      { bg: 'rgba(72,199,142,.15)',  color: '#48c78e', label: 'Activa' },
    CERRADA:     { bg: 'rgba(136,136,152,.15)', color: '#888898', label: 'Cerrada' },
    PLANIFICADO: { bg: 'rgba(100,149,237,.15)', color: '#6495ed', label: 'Planificado' },
    EN_TRANSITO: { bg: 'rgba(255,167,53,.15)',  color: '#ffa735', label: 'En tránsito' },
    ENTREGADO:   { bg: 'rgba(72,199,142,.15)',  color: '#48c78e', label: 'Entregado' },
    CANCELADO:   { bg: 'rgba(232,52,90,.15)',   color: '#e8345a', label: 'Cancelado' },
    PENDIENTE:   { bg: 'rgba(255,167,53,.15)',  color: '#ffa735', label: 'Pendiente' },
    EN_PROCESO:  { bg: 'rgba(100,149,237,.15)', color: '#6495ed', label: 'En proceso' },
    ATENDIDO:    { bg: 'rgba(72,199,142,.15)',  color: '#48c78e', label: 'Atendido' },
    CRITICA:     { bg: 'rgba(232,52,90,.15)',   color: '#e8345a', label: 'Crítica' },
    ALTA:        { bg: 'rgba(255,107,53,.15)',  color: '#ff6b35', label: 'Alta' },
    MEDIA:       { bg: 'rgba(255,167,53,.15)',  color: '#ffa735', label: 'Media' },
    BAJA:        { bg: 'rgba(136,136,152,.15)', color: '#888898', label: 'Baja' },
    CONFIRMADA:  { bg: 'rgba(72,199,142,.15)',  color: '#48c78e', label: 'Confirmada' },
    PLANIFICADA: { bg: 'rgba(100,149,237,.15)', color: '#6495ed', label: 'Planificada' },
    INUNDACION:  { bg: 'rgba(100,149,237,.15)', color: '#6495ed', label: 'Inundación' },
    INCENDIO:    { bg: 'rgba(255,107,53,.15)',  color: '#ff6b35', label: 'Incendio' },
    TERREMOTO:   { bg: 'rgba(232,52,90,.15)',   color: '#e8345a', label: 'Terremoto' },
  }
  const s = map[estado] || { bg: 'rgba(136,136,152,.15)', color: '#888898', label: estado }
  return (
    <span style={{
      background: s.bg, color: s.color, padding: '3px 10px',
      borderRadius: 100, fontSize: '.72rem', fontWeight: 600,
      letterSpacing: '.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>{s.label}</span>
  )
}

export function MetricCard({ icon, label, value, sub, color = 'var(--accent)' }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 16, padding: '20px 24px',
      display: 'flex', alignItems: 'center', gap: 16,
      transition: 'border-color .2s, transform .2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 12, flexShrink: 0,
        background: `${color}18`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '1.3rem',
      }}>{icon}</div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value ?? '—'}</div>
        <div style={{ fontSize: '.8rem', fontWeight: 500, color: 'var(--text)', marginTop: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  )
}

export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled = false, style: extraStyle = {} }) {
  const variants = {
    primary: { background: 'var(--accent)', color: '#fff', border: 'none' },
    ghost:   { background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)' },
    danger:  { background: 'rgba(232,52,90,.15)', color: '#e8345a', border: '1px solid rgba(232,52,90,.3)' },
    success: { background: 'rgba(72,199,142,.15)', color: '#48c78e', border: '1px solid rgba(72,199,142,.3)' },
    warning: { background: 'rgba(255,167,53,.15)', color: '#ffa735', border: '1px solid rgba(255,167,53,.3)' },
  }
  const sizes = {
    sm: { padding: '5px 12px', fontSize: '.78rem', borderRadius: 8 },
    md: { padding: '8px 18px', fontSize: '.875rem', borderRadius: 10 },
    lg: { padding: '12px 24px', fontSize: '1rem', borderRadius: 12 },
  }
  return (
    <button onClick={onClick} disabled={disabled} style={{
      ...variants[variant], ...sizes[size],
      fontFamily: 'var(--font-body)', fontWeight: 500,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? .5 : 1,
      transition: 'all .2s', whiteSpace: 'nowrap', ...extraStyle,
    }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.opacity = '.8' }}
      onMouseLeave={e => { if (!disabled) e.currentTarget.style.opacity = '1' }}
    >{children}</button>
  )
}

export function Input({ label, value, onChange, type = 'text', placeholder = '', required = false }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '.78rem', color: 'var(--muted)', marginBottom: 5, letterSpacing: '.05em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: 'var(--accent)', marginLeft: 3 }}>*</span>}
      </label>
      <input type={type} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} required={required}
        style={{
          width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '9px 12px', color: 'var(--text)',
          fontFamily: 'var(--font-body)', fontSize: '.875rem', outline: 'none', transition: 'border-color .2s',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      />
    </div>
  )
}

export function Select({ label, value, onChange, options = [], required = false }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: 'block', fontSize: '.78rem', color: 'var(--muted)', marginBottom: 5, letterSpacing: '.05em', textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: 'var(--accent)', marginLeft: 3 }}>*</span>}
      </label>
      <select value={value} onChange={e => onChange(e.target.value)} required={required}
        style={{
          width: '100%', background: 'var(--bg)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '9px 12px', color: 'var(--text)',
          fontFamily: 'var(--font-body)', fontSize: '.875rem', outline: 'none', cursor: 'pointer',
        }}
        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
        onBlur={e => e.target.style.borderColor = 'var(--border)'}
      >
        {options.map(({ value: v, label: l }) => (
          <option key={v} value={v} style={{ background: 'var(--surface)' }}>{l}</option>
        ))}
      </select>
    </div>
  )
}

export function Modal({ title, onClose, children, width = 480 }) {
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 20, padding: 32, width: '100%', maxWidth: width,
        maxHeight: '90vh', overflowY: 'auto', position: 'relative',
        animation: 'modalIn .25s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Table({ columns, rows, emptyMsg = 'Sin datos' }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border)' }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '10px 14px', textAlign: 'left', color: 'var(--muted)',
                fontWeight: 500, fontSize: '.75rem', letterSpacing: '.06em',
                textTransform: 'uppercase', whiteSpace: 'nowrap',
              }}>{col.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td colSpan={columns.length} style={{ padding: '32px 14px', textAlign: 'center', color: 'var(--muted)' }}>{emptyMsg}</td></tr>
          ) : rows.map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid var(--border)', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px 14px', color: 'var(--text)', whiteSpace: col.wrap ? 'normal' : 'nowrap' }}>
                  {col.render ? col.render(row) : row[col.key] ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function Pager({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 12 }}>
      <Btn variant="ghost" size="sm" disabled={page === 0} onClick={() => onChange(page - 1)}>← Ant</Btn>
      <span style={{ fontSize: '.85rem', color: 'var(--muted)' }}>Pág {page + 1} / {totalPages}</span>
      <Btn variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => onChange(page + 1)}>Sig →</Btn>
    </div>
  )
}

export function Section({ title, action, children }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 700 }}>{title}</h3>
        {action}
      </div>
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}

export function EmptyState({ icon = '📭', title, desc }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--muted)' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>{title}</div>
      {desc && <div style={{ fontSize: '.85rem' }}>{desc}</div>}
    </div>
  )
}