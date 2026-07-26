import { FestivalContextBar } from '../Festival/index.js'

export default function PassportProfileEditor({
  session,
  countries,
  saving,
  message,
  onChange,
  onSave,
  onCancel,
  activeFestival,
  activeFestivalProfile,
  activeFestivalBrand,
  activeFestivalDisplay,
  requiredSetup = false,
}) {
  return (
    <section style={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="passport-editor-title">
      <div style={styles.editor}>
        <FestivalContextBar
          activeFestival={activeFestival}
          activeFestivalProfile={activeFestivalProfile}
          activeFestivalBrand={activeFestivalBrand}
          activeFestivalDisplay={activeFestivalDisplay}
        />
        <span style={styles.eyebrow}>PASSPORT IDENTITY</span>
        <h2 id="passport-editor-title" style={styles.title}>
          {requiredSetup ? 'COMPLETE YOUR PASSPORT' : 'EDIT PASSPORT PROFILE'}
        </h2>
        {(requiredSetup || session.afterSaveSectionId) && (
          <p style={styles.required}>Passport Country and Rave Name are required before opening your festival passport.</p>
        )}

        <label style={styles.label} htmlFor="passport-editor-country">Passport Country</label>
        <select id="passport-editor-country" value={session.draft.country} onChange={(event) => onChange({ country: event.target.value })} style={styles.input}>
          <option value="">Select Country</option>
          {countries.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>

        <label style={styles.label} htmlFor="passport-editor-rave-name">Rave Name</label>
        <input id="passport-editor-rave-name" value={session.draft.raveName} onChange={(event) => onChange({ raveName: event.target.value })} style={styles.input} placeholder="Choose your rave name" />

        {message && <p style={styles.message}>{message}</p>}
        <div style={styles.actions}>
          <button type="button" style={styles.save} onClick={onSave} disabled={saving}>
            {saving ? 'SAVING…' : requiredSetup ? 'COMPLETE PASSPORT' : 'SAVE PROFILE'}
          </button>
          {!requiredSetup && (
            <button type="button" style={styles.cancel} onClick={onCancel} disabled={saving}>CANCEL</button>
          )}
        </div>
      </div>
    </section>
  )
}

const styles = {
  overlay: { minHeight: 'min(620px,82vh)', display: 'grid', placeItems: 'center', padding: 18, borderRadius: 24, color: '#fff', background: 'radial-gradient(circle at 50% 0,rgba(241,189,99,.12),transparent 38%),#090d0c' },
  editor: { width: 'min(460px,100%)', display: 'grid', gap: 10, padding: 22, borderRadius: 22, border: '1px solid rgba(241,189,99,.27)', background: '#111715', boxShadow: '0 30px 70px rgba(0,0,0,.42)' },
  eyebrow: { color: '#f1bd63', fontSize: 9, fontWeight: 900, letterSpacing: '.18em' }, title: { margin: '4px 0 5px', fontSize: 27 }, required: { margin: '0 0 10px', color: 'rgba(255,255,255,.68)', fontSize: 12, lineHeight: 1.5 }, label: { marginTop: 5, fontSize: 11, fontWeight: 900, letterSpacing: '.06em' },
  input: { width: '100%', boxSizing: 'border-box', minHeight: 46, padding: '11px 12px', borderRadius: 12, border: '1px solid rgba(255,255,255,.15)', color: '#fff', background: '#080c0b' }, message: { margin: '4px 0 0', color: '#cde7c9' }, actions: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 9, marginTop: 12 },
  save: { minHeight: 45, borderRadius: 12, border: '1px solid #f1bd63', color: '#171109', background: '#f1bd63', fontWeight: 900, cursor: 'pointer' }, cancel: { minHeight: 45, borderRadius: 12, border: '1px solid rgba(255,255,255,.18)', color: '#fff', background: '#171c1a', fontWeight: 900, cursor: 'pointer' },
}
