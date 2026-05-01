const cols = [
  { title: 'Plataforma',    links: ['Cómo donar', 'Centros de acopio', 'Seguimiento de envío', 'Panel administrador'] },
  { title: 'Organización',  links: ['Quiénes somos', 'Noticias', 'Voluntariado', 'Contacto'] },
  { title: 'Legal',         links: ['Privacidad', 'Términos de uso', 'Política de datos'] },
]

export default function Footer() {
  return (
    <footer style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '60px 5vw 32px', position: 'relative', zIndex: 1 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 60, marginBottom: 48 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '.75rem', fontWeight: 800, color: '#fff' }}>D</div>
              Donaton<span style={{ color: 'var(--accent)' }}>.</span>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: '.875rem', lineHeight: 1.7, marginTop: 12, maxWidth: 260, fontWeight: 300 }}>
              Red solidaria que conecta donantes con centros de acopio en todo Chile. Transparencia, rapidez y coordinación ante cada emergencia.
            </p>
          </div>
          {cols.map(({ title, links }) => (
            <div key={title}>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '.875rem', fontWeight: 600, marginBottom: 16 }}>{title}</h4>
              <ul style={{ listStyle: 'none' }}>
                {links.map(link => (
                  <li key={link} style={{ marginBottom: 10 }}>
                    <a href="#" style={{ color: 'var(--muted)', textDecoration: 'none', fontSize: '.875rem', transition: 'color .2s' }}
                      onMouseEnter={e => e.target.style.color = 'var(--text)'}
                      onMouseLeave={e => e.target.style.color = 'var(--muted)'}
                    >{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, borderTop: '1px solid var(--border)', fontSize: '.8rem', color: 'var(--muted)' }}>
          <span>© 2026 Donaton — Hecho con ❤️ en Chile</span>
          <div style={{ display: 'flex', gap: 12 }}>
            {['in', 'tw', 'ig'].map(s => (
              <a key={s} href="#" style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--surface2)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', textDecoration: 'none', fontSize: '.8rem', transition: 'all .2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
              >{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}