export default function ArtistCollections({
  styles,
  artistCollections,
  unlockedArtistCollections,
}) {
  return (
    <div style={styles.artistCollectionsCard}>
      <strong>Artist Collections</strong>
      <small>
        {unlockedArtistCollections.length} / {artistCollections.length} artist rewards unlocked
      </small>

      <div style={styles.completionRewardList}>
        {artistCollections.map((artist) => (
          <div
            key={artist.id}
            style={
              artist.unlocked
                ? styles.artistCollectionUnlocked
                : styles.artistCollectionLocked
            }
          >
            <div>
              <strong>
                {artist.unlocked ? '🎧 ' : '🎵 '}
                {artist.name}
              </strong>
              <small>{artist.description}</small>
              <small>Reward: {artist.reward}</small>
            </div>

            <div style={styles.rewardProgressBlock}>
              <small>
                {artist.collected}/{artist.total}
              </small>

              <div style={styles.rewardProgressTrack}>
                <div
                  style={{
                    ...styles.artistProgressFill,
                    width: `${artist.percent}%`,
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
