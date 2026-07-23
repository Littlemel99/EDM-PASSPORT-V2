import DiscoveryCard from './DiscoveryCard.jsx'
import { getDiscoveryCardPresentation } from './discoveryCardTheme.js'

export default function DiscoveryCardDetail({ discovery, collected, onBack, onOpenClaim }) {
  const view = getDiscoveryCardPresentation(discovery, { collected, variant: 'detail' })
  return (
    <section style={styles.screen}>
      <button type="button" className="discovery-card-detail__back" style={styles.back} onClick={onBack}>BACK</button>
      <DiscoveryCard discovery={discovery} collected={collected} variant="detail" />
      <p style={styles.claim}>{view.claimMessage}</p>
      {!view.achievement && !collected && onOpenClaim && (
        <button type="button" className="discovery-card-detail__claim" style={styles.claimButton} onClick={() => onOpenClaim(discovery)}>OPEN CLAIM VERIFICATION</button>
      )}
    </section>
  )
}

const styles = { screen: { display: 'grid', gap: 14 }, back: { justifySelf: 'start', padding: '9px 13px', borderRadius: 999, border: '1px solid #735c35', color: '#f1bd63', background: '#17120b', cursor: 'pointer' }, claim: { margin: 0, color: 'rgba(255,255,255,.7)', lineHeight: 1.5 }, claimButton: { padding: 13, borderRadius: 14, border: '1px solid #9b7539', color: '#fff9eb', background: '#241b10', fontWeight: 900, cursor: 'pointer' } }
