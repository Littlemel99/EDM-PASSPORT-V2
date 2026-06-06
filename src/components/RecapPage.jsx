export default function RecapPage({
  styles,
  collectedIds,
  memories,
  families,
  activeStamp,
}) {
  return (
    <>
      <p style={styles.pageNumber}>Passport Page 10</p>

      <h2 style={styles.bookTitle}>EDC Recap</h2>

      <div style={styles.storyHero}>
        <h1 style={styles.rankTitle}>EDC Las Vegas 2026</h1>

        <p>Stamps Collected: {collectedIds.length}</p>
        <p>Memories Saved: {memories.length}</p>
        <p>Families Joined: {families.length}</p>
        <p>Favorite Stage: {activeStamp?.name || 'World Party Parade'}</p>
        <p>Timeline Entries: {memories.length}</p>
      </div>

      <div style={styles.linkList}>
        {memories.slice(0, 10).map((memory) => (
          <div key={memory.id} style={styles.timelineCard}>
            <strong>{memory.stamp_id}</strong>
            <p>{memory.note}</p>
          </div>
        ))}
      </div>
    </>
  )
}
