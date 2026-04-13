export function Footer() {
  return (
    <footer style={{ background: '#fff', borderTop: '1px solid #e0e0e0', padding: '24px 0', marginTop: 'auto' }}>
      <div className="gs-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 15, color: '#111' }}>
          gym<span style={{ color: '#4C6FD9' }}>score</span>
        </span>
        <div style={{ display: 'flex', gap: 16 }}>
          <a href="/admin" style={{ fontSize: 13, fontWeight: 700, color: 'var(--gs-muted)', textDecoration: 'none' }}>Mesa de Control</a>
          <span style={{ fontSize: 13, color: '#999' }}>
            © {new Date().getFullYear()} · Resultados en directo
          </span>
        </div>
      </div>
    </footer>
  )
}
