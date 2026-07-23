import DiscoveryCard from './DiscoveryCard.jsx'

export default function DiscoveryCardGrid({ discoveries, collectedIds = [], onOpen, variant = 'grid' }) {
  const collectedSet = new Set(collectedIds)
  return (
    <div style={styles.grid}>
      {discoveries.map((discovery) => (
        <DiscoveryCard key={discovery.id} discovery={discovery} collected={collectedSet.has(discovery.id)} variant={variant} onOpen={onOpen} />
      ))}
    </div>
  )
}

const styles = { grid: { display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 12 } }
