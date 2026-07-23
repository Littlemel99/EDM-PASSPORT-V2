import { formatFestivalDates } from '../../festivals/index.js'

export default function FestivalEditionPage({ display, profile }) {
  return (
    <section style={styles.page}>
      <span style={styles.eyebrow}>FESTIVAL</span>
      <h2 style={styles.title}>{display?.brandName || profile?.name || 'Festival edition'}</h2>
      <p style={styles.edition}>{[display?.year, display?.editionName].filter(Boolean).join(' • ')}</p>
      {display?.themeName && <strong style={styles.theme}>{display.themeName}</strong>}
      {display?.location && <p style={styles.metadata}>{display.location}</p>}
      {display?.startDate && <p style={styles.metadata}>{formatFestivalDates(display.startDate, display.endDate)}</p>}
      {profile?.description && <p style={styles.description}>{profile.description}</p>}
      <section style={styles.panel}>
        <span style={styles.eyebrow}>STAGES</span>
        {profile?.stages?.length ? profile.stages.map((stage) => <div key={stage.id || stage.name} style={styles.stage}>{stage.name}</div>) : <p>No stage information is configured for this edition.</p>}
      </section>
      <section style={styles.map}>
        <span style={styles.eyebrow}>FESTIVAL MAP</span>
        {profile?.mapImage ? <img src={profile.mapImage} alt={`${display?.brandName || 'Festival'} map`} style={styles.mapImage} /> : <p>A verified festival map is not available yet.</p>}
      </section>
    </section>
  )
}

const styles = { page: { display: 'grid', gap: 13 }, eyebrow: { color: '#f1bd63', fontSize: 9, fontWeight: 900, letterSpacing: '.18em' }, title: { margin: '6px 0 0', fontSize: 34 }, edition: { margin: 0, color: 'rgba(255,255,255,.62)' }, theme: { color: '#f1bd63' }, metadata: { margin: 0, fontSize: 16 }, description: { color: 'rgba(255,255,255,.7)', lineHeight: 1.6 }, panel: { display: 'grid', gap: 8, padding: 17, borderRadius: 18, background: '#111715' }, stage: { padding: 10, borderBottom: '1px solid rgba(255,255,255,.08)' }, map: { minHeight: 140, display: 'grid', placeContent: 'center', textAlign: 'center', padding: 18, borderRadius: 18, border: '1px dashed rgba(241,189,99,.25)', color: 'rgba(255,255,255,.6)' }, mapImage: { width: '100%', borderRadius: 14 } }
