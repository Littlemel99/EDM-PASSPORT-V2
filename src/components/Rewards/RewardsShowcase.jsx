export default function RewardsShowcase({
  styles,
  completionRewards,
  unlockedCompletionRewards,
}) {
  return (
    <div style={styles.completionRewardsCard}>
      <strong>Festival Completion Rewards</strong>
      <small>
        {unlockedCompletionRewards.length} / {completionRewards.length} rewards unlocked
      </small>

      <div style={styles.completionRewardList}>
        {completionRewards.map((reward) => (
          <div
            key={reward.id}
            style={
              reward.unlocked
                ? styles.completionRewardUnlocked
                : styles.completionRewardLocked
            }
          >
            <div>
              <strong>
                {reward.unlocked ? '🏆 ' : '🔒 '}
                {reward.title}
              </strong>
              <small>{reward.description}</small>
            </div>

            <div style={styles.rewardProgressBlock}>
              <small>
                {reward.collected}/{reward.total}
              </small>

              <div style={styles.rewardProgressTrack}>
                <div
                  style={{
                    ...styles.rewardProgressFill,
                    width: `${reward.percent}%`,
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
