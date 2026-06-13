export default function RecapPage({
  styles,
  collectedIds,
  memories,
  families,
  activeStamp,
  onOpenStamps,
  onOpenMemories,
  onOpenTimeline,
}) {
  return (
    <>
      <p style={styles.pageNumber}>Passport Page 10</p>

      <h2 style={styles.bookTitle}>EDC Recap</h2>

      <div style={styles.linkList}>
        <button type="button" style={styles.linkCard} onClick={onOpenStamps}>
          <strong>Stamps Collected</strong>
          <small>{collectedIds.length} collected</small>
          <small>Tap to open your stamp collection.</small>
        </button>

        <button type="button" style={styles.linkCard} onClick={onOpenMemories}>
          <strong>Memories Saved</strong>
          <small>{memories.length} memories</small>
          <small>Tap to open Festival Memory Cards.</small>
        </button>

        <button type="button" style={styles.linkCard} onClick={onOpenTimeline}>
          <strong>Festival Timeline</strong>
          <small>{memories.length} timeline entries</small>
          <small>Tap to open your festival timeline.</small>
        </button>

        <div style={styles.linkCard}>
          <strong>Families Joined</strong>
          <small>{families.length} family groups</small>
        </div>

        <div style={styles.linkCard}>
          <strong>Favorite Stage</strong>
          <small>{activeStamp?.name || 'World Party Parade'}</small>
        </div>
      </div>

      <div style={styles.linkList}>
        {memories.slice(0, 10).map((memory) => (
          <button key={memory.id} type="button" style={styles.timelineCard} onClick={onOpenMemories}>
            <strong>{memory.stamp_id}</strong>
            <p>{memory.note}</p>
          </button>
        ))}
      </div>
    </>
  )
}
