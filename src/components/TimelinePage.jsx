export default function TimelinePage({ styles, memories }) {
  return (
    <>
      <p style={styles.pageNumber}>Passport Page 9</p>

      <h2 style={styles.bookTitle}>Festival Timeline</h2>

      <div style={styles.linkList}>
        {memories.length ? (
          memories.map((memory) => (
            <div key={memory.id} style={styles.timelineCard}>
              <strong>{memory.stamp_id || 'Festival Memory'}</strong>
              <p>{memory.note}</p>

              {memory.image_url && (
                <img
                  src={memory.image_url}
                  alt="Timeline Memory"
                  style={styles.memoryImage}
                />
              )}
            </div>
          ))
        ) : (
          <div style={styles.linkCard}>
            No timeline memories yet. Tap a sticker and save a photo or note.
          </div>
        )}
      </div>
    </>
  )
}
