export default function StickerStoryPage({
  styles,
  activeStamp,
  memories,
  memoryNote,
  setMemoryNote,
  memoryPhotoFile,
  setMemoryPhotoFile,
  handleSaveMemory,
  memorySaving,
  memoryMessage,
  Stamp,
}) {
  return (
    <>
      <p style={styles.pageNumber}>Passport Page 7</p>

      <h2 style={styles.bookTitle}>Sticker Story</h2>

      <div style={styles.storyHero}>
        <p style={styles.labelDark}>Selected Sticker</p>

        <h1 style={styles.rankTitle}>{activeStamp.name}</h1>

        <p>{activeStamp.location}</p>

        <Stamp stamp={activeStamp} collected />

        <p>
          {
            memories.filter(
              (memory) => memory.stamp_id === activeStamp.id
            ).length
          } memories saved
        </p>
      </div>

      <textarea
        style={styles.memoryBox}
        placeholder="Write your EDC memory..."
        value={memoryNote}
        onChange={(event) => setMemoryNote(event.target.value)}
      />

      <label style={styles.uploadButton}>
        {memoryPhotoFile ? memoryPhotoFile.name : 'UPLOAD PHOTO'}

        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(event) =>
            setMemoryPhotoFile(event.target.files?.[0] || null)
          }
        />
      </label>

      <button
        style={styles.mainButton}
        onClick={handleSaveMemory}
        disabled={memorySaving}
      >
        {memorySaving ? 'SAVING...' : 'SAVE MEMORY'}
      </button>

      {memoryMessage && (
        <p style={styles.successText}>{memoryMessage}</p>
      )}

      <div style={styles.linkList}>
        {memories
          .filter(
            (memory) => memory.stamp_id === activeStamp.id
          )
          .map((memory) => (
            <div key={memory.id} style={styles.linkCard}>
              <strong>
                {memory.stamp_id || 'Festival Memory'}
              </strong>

              <p>{memory.note}</p>

              {memory.image_url && (
                <img
                  src={memory.image_url}
                  alt="Memory"
                  style={styles.memoryImage}
                />
              )}
            </div>
          ))}
      </div>
    </>
  )
}
