export default function PassportNavigation({ sections, activeSectionId, onSelect }) {
  return (
    <nav aria-label="Passport sections" style={styles.nav}>
      {sections.map((section) => {
        const active = section.id === activeSectionId
        return (
          <button
            key={section.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            style={active ? styles.active : styles.button}
            onClick={() => onSelect(section)}
          >
            {section.label}
          </button>
        )
      })}
    </nav>
  )
}

const base = { flex: '1 0 auto', minHeight: 40, padding: '9px 13px', borderRadius: 999, fontSize: 10, fontWeight: 900, letterSpacing: '.08em', cursor: 'pointer' }
const styles = {
  nav: { display: 'flex', gap: 7, overflowX: 'auto', padding: '3px 2px 12px', WebkitOverflowScrolling: 'touch' },
  button: { ...base, color: 'rgba(255,255,255,.68)', border: '1px solid rgba(255,255,255,.1)', background: 'rgba(8,13,14,.76)' },
  active: { ...base, color: '#171109', border: '1px solid #f1bd63', background: '#f1bd63', boxShadow: '0 0 16px rgba(241,189,99,.25)' },
}
