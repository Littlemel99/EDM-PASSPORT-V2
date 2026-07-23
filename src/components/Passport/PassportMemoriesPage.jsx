import { getFestivalScopedMemories } from './passportSections.js'

export default function PassportMemoriesPage({ memories, discoveries, activeDiscovery, note, onNoteChange, photoFile, onPhotoChange, onSave, saving, message, onPreview, onCopyShare, previewId, onClosePreview, onDownload }) {
  const scopedMemories = getFestivalScopedMemories(memories, discoveries)
  const discoveryById = new Map(discoveries.map((discovery) => [discovery.id, discovery]))
  const previewMemory = scopedMemories.find((memory) => memory.id === previewId)
  const previewDiscovery = previewMemory ? discoveryById.get(previewMemory.stamp_id) : null

  return (
    <section style={styles.page}>
      <header>
        <span style={styles.eyebrow}>MEMORIES</span>
        <h2 style={styles.title}>Festival memories</h2>
        <p style={styles.supporting}>Notes, photos, timeline entries, and share cards from this edition.</p>
      </header>

      <section style={styles.panel}>
        <span style={styles.eyebrow}>ADD TO YOUR STORY</span>
        <strong>{activeDiscovery?.name || 'Select a discovery from the album'}</strong>
        <textarea style={styles.textarea} placeholder="Write your festival memory..." value={note} onChange={(event) => onNoteChange(event.target.value)} />
        <label style={styles.upload}>
          {photoFile ? photoFile.name : 'ADD PHOTO'}
          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(event) => onPhotoChange(event.target.files?.[0] || null)} />
        </label>
        <button type="button" style={styles.action} onClick={onSave} disabled={saving || !activeDiscovery}>{saving ? 'SAVING…' : 'SAVE MEMORY'}</button>
        {message && <p style={styles.message}>{message}</p>}
      </section>

      <section style={styles.list}>
        <span style={styles.eyebrow}>SAVED MEMORIES</span>
        {scopedMemories.length ? scopedMemories.map((memory) => {
          const discovery = discoveryById.get(memory.stamp_id)
          return (
            <article key={memory.id} style={styles.card}>
              <div style={styles.cardHeader}>
                <strong>{discovery?.name || 'Festival Memory'}</strong>
                <time>{memory.created_at ? new Date(memory.created_at).toLocaleDateString() : 'Date unavailable'}</time>
              </div>
              {memory.note && <p style={styles.note}>{memory.note}</p>}
              {memory.image_url && <img src={memory.image_url} alt={`Memory from ${discovery?.name || 'the festival'}`} style={styles.image} />}
              <div style={styles.actions}>
                <button type="button" style={styles.action} onClick={() => onPreview(memory.id)}>PREVIEW CARD</button>
                <button type="button" style={styles.secondary} onClick={() => onCopyShare(memory)}>COPY SHARE TEXT</button>
              </div>
            </article>
          )
        }) : <p style={styles.empty}>No memories saved for this festival edition yet.</p>}
      </section>

      {previewMemory && (
        <div style={styles.overlay} role="dialog" aria-modal="true" aria-label="Memory card preview">
          <article style={styles.preview}>
            <span style={styles.eyebrow}>MEMORY CARD</span>
            <h3>{previewDiscovery?.name || 'Festival Memory'}</h3>
            {previewMemory.image_url && <img src={previewMemory.image_url} alt={`Memory from ${previewDiscovery?.name || 'the festival'}`} style={styles.image} />}
            {previewMemory.note && <p style={styles.note}>{previewMemory.note}</p>}
            <button type="button" style={styles.action} onClick={() => onDownload(previewMemory)}>DOWNLOAD</button>
            <button type="button" style={styles.secondary} onClick={() => onCopyShare(previewMemory)}>COPY SHARE TEXT</button>
            <button type="button" style={styles.secondary} onClick={onClosePreview}>CLOSE PREVIEW</button>
          </article>
        </div>
      )}
    </section>
  )
}

const styles = {
  page: { display: 'grid', gap: 18 }, eyebrow: { color: '#f1bd63', fontSize: 9, fontWeight: 900, letterSpacing: '.18em' }, title: { margin: '7px 0 3px', fontSize: 32 }, supporting: { margin: 0, color: 'rgba(255,255,255,.62)', lineHeight: 1.5 },
  panel: { display: 'grid', gap: 10, padding: 16, borderRadius: 18, background: '#111715', border: '1px solid rgba(241,189,99,.13)' }, textarea: { minHeight: 95, resize: 'vertical', padding: 12, borderRadius: 12, color: '#fff', background: '#080c0b', border: '1px solid rgba(255,255,255,.12)' }, upload: { padding: 11, textAlign: 'center', borderRadius: 12, border: '1px dashed rgba(241,189,99,.35)', cursor: 'pointer' },
  action: { padding: 11, borderRadius: 12, border: '1px solid #9b7539', color: '#171109', background: '#f1bd63', fontWeight: 900, cursor: 'pointer' }, secondary: { padding: 11, borderRadius: 12, border: '1px solid rgba(255,255,255,.16)', color: '#fff', background: '#101514', fontWeight: 900, cursor: 'pointer' }, message: { margin: 0, color: '#cde7c9' },
  list: { display: 'grid', gap: 11 }, card: { display: 'grid', gap: 10, padding: 15, borderRadius: 17, background: '#101514', border: '1px solid rgba(255,255,255,.09)' }, cardHeader: { display: 'flex', justifyContent: 'space-between', gap: 10, color: 'rgba(255,255,255,.65)' }, note: { margin: 0, lineHeight: 1.55 }, image: { width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 13 }, actions: { display: 'flex', flexWrap: 'wrap', gap: 8 }, empty: { padding: 18, borderRadius: 16, color: 'rgba(255,255,255,.6)', background: '#101514' },
  overlay: { position: 'fixed', inset: 0, zIndex: 80, display: 'grid', placeItems: 'center', padding: 18, background: 'rgba(0,0,0,.78)' }, preview: { width: 'min(430px,100%)', maxHeight: '88vh', overflowY: 'auto', display: 'grid', gap: 12, padding: 20, borderRadius: 20, color: '#fff', background: '#101514', border: '1px solid rgba(241,189,99,.3)' },
}
