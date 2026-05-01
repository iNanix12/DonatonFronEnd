const valores = [
  { icon: '🔍', title: 'Transparencia', desc: 'Cada donación es rastreable desde el origen hasta el destino final.' },
  { icon: '⚡', title: 'Rapidez',       desc: 'Respuesta coordinada en minutos ante cualquier emergencia.' },
  { icon: '🤝', title: 'Comunidad',     desc: 'Red de voluntarios y organizaciones en todo el territorio.' },
  { icon: '📊', title: 'Datos reales',  desc: 'Reportes de impacto verificados y actualizados en tiempo real.' },
]
const impacto = [
  { num: '4.8k', label: 'Familias beneficiadas', sub: 'desde 2023 a la fecha' },
  { num: '127t', label: 'Recursos distribuidos',  sub: 'alimentos, ropa e insumos' },
  { num: '38',   label: 'Centros de acopio',       sub: 'activos en Chile' },
  { num: '620',  label: 'Voluntarios activos',     sub: 'en todo el país' },
]

export default function QuienesSomos() {
  return (
    <section id="quienes" style={{ padding: '100px 5vw', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ height: 1, background: 'var(--border)', marginBottom: 80 }} />

        <div style={{ fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 600, marginBottom: 16 }}>
          Quiénes somos
        </div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 700, letterSpacing: '-.02em', lineHeight: 1.1 }}>
          Una red de solidaridad<br />construida por chilenos
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center', marginTop: 60 }}>
          <div>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.8, fontWeight: 300 }}>
              Donaton nació de la necesidad de dar orden y transparencia a la ayuda humanitaria en Chile. Cuando ocurre una emergencia, la voluntad de ayudar sobra — lo que falta es coordinación.
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.8, fontWeight: 300, marginTop: 16 }}>
              Nuestra plataforma conecta a donantes particulares y empresas con centros de acopio verificados, asegurando que cada recurso llegue exactamente donde más se necesita, con trazabilidad total.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 32 }}>
              {valores.map(({ icon, title, desc }) => (
                <div key={title} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: 20, transition: 'border-color .3s, transform .3s', cursor: 'default',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,52,90,.3)'; e.currentTarget.style.transform = 'translateY(-4px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ fontSize: '1.4rem', marginBottom: 10 }}>{icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '.95rem', fontWeight: 600, marginBottom: 4 }}>{title}</div>
                  <div style={{ fontSize: '.8rem', color: 'var(--muted)', lineHeight: 1.5 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(5rem,10vw,8rem)', fontWeight: 800, lineHeight: 1,
              background: 'linear-gradient(135deg, rgba(232,52,90,.3), rgba(255,107,53,.1))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: -20,
            }}>15</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {impacto.map(({ num, label, sub }) => (
                <div key={label} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 16, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
                  transition: 'all .3s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(232,52,90,.3)'; e.currentTarget.style.transform = 'translateX(8px)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'none' }}
                >
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--accent)', minWidth: 80 }}>{num}</div>
                  <div>
                    <div style={{ fontSize: '.875rem', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: 2 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}