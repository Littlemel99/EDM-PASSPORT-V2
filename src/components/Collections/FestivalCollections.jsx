import { useState } from 'react'
import { isHiddenDiscovery } from '../../adventure/DiscoveryEngine.js'
import {
  calculateFestivalCollectionsProgress,
  getNextCollectionTarget,
} from '../../collections/CollectionEngine.js'
import CollectionDetail from './CollectionDetail.jsx'
import { PageIdentity } from '../Festival/index.js'

export default function FestivalCollections({
  festivalName,
  collections,
  discoveries,
  collectedIds,
  activeFestival,
  activeFestivalProfile,
  activeFestivalBrand,
  activeFestivalDisplay,
  contentState,
  adventureState,
}) {
  const [selectedCollectionId, setSelectedCollectionId] = useState(null)
  const visibleCollections =
    contentState?.eligibleCollections || collections
  const visibleDiscoveries =
    contentState?.eligibleDiscoveries || discoveries
  const adventureCollectionById = new Map(
    (adventureState?.collections || []).map((collection) => [
      collection.id,
      collection,
    ])
  )
  const selectedCollection = visibleCollections.find(
    (collection) => collection.id === selectedCollectionId
  )

  if (selectedCollection) {
    return (
      <>
        <PageIdentity
          pageName="COLLECTION"
          activeFestival={activeFestival}
          activeFestivalProfile={activeFestivalProfile}
          activeFestivalBrand={activeFestivalBrand}
          activeFestivalDisplay={activeFestivalDisplay}
        />
        <CollectionDetail
          collection={selectedCollection}
          discoveries={visibleDiscoveries}
          collectedIds={collectedIds}
          onBack={() => setSelectedCollectionId(null)}
        />
      </>
    )
  }

  if (contentState ? !contentState.canShowCollections : !visibleCollections.length) {
    return (
      <>
        <PageIdentity
          pageName="COLLECTIONS"
          activeFestival={activeFestival}
          activeFestivalProfile={activeFestivalProfile}
          activeFestivalBrand={activeFestivalBrand}
          activeFestivalDisplay={activeFestivalDisplay}
        />
        <section style={styles.emptyState}>
          <span style={styles.eyebrow}>COLLECTIONS</span>
          <h2 style={styles.emptyTitle}>{festivalName || 'Festival Edition'}</h2>
          <p style={styles.emptyText}>
            Collections are not yet available for this festival.
          </p>
        </section>
      </>
    )
  }

  const overall = calculateFestivalCollectionsProgress(
    visibleCollections,
    collectedIds
  )

  return (
    <>
      <PageIdentity
        pageName="COLLECTIONS"
        activeFestival={activeFestival}
        activeFestivalProfile={activeFestivalProfile}
        activeFestivalBrand={activeFestivalBrand}
        activeFestivalDisplay={activeFestivalDisplay}
      />
      <section style={styles.screen}>
        <header style={styles.hero}>
        <span style={styles.eyebrow}>COLLECTIBLE ALBUM</span>
        <h2 style={styles.title}>
          {String(festivalName || 'Festival').toUpperCase()} COLLECTIONS
        </h2>
        <div style={styles.overallGrid}>
          <OverallStat
            label="Collections Completed"
            value={`${overall.completedCount} / ${overall.totalCollections}`}
          />
          <OverallStat
            label="Discovery Coverage"
            value={`${overall.coveredCount} / ${overall.totalDiscoveryCount}`}
          />
          <OverallStat
            label="Overall Progress"
            value={`${overall.coveragePercent}%`}
          />
        </div>
        <ProgressBar percent={overall.coveragePercent} />
        </header>

        <div style={styles.collectionList}>
        {overall.collections.map(({ collection, ...progress }) => {
          const adventureCollection =
            adventureCollectionById.get(collection.id)
          const nextTarget = getNextCollectionTarget(
            collection,
            visibleDiscoveries,
            collectedIds
          )

          return (
            <article key={collection.id} style={styles.collectionCard}>
              <div style={styles.cardHeader}>
                <div>
                  <span style={styles.state}>
                    {adventureCollection?.state ||
                      (progress.complete ? 'COMPLETE' : 'IN PROGRESS')}
                  </span>
                  <h3 style={styles.collectionName}>{collection.name}</h3>
                </div>
                <strong style={styles.percent}>{progress.percent}%</strong>
              </div>
              <p style={styles.description}>{collection.description}</p>
              <div style={styles.progressLabel}>
                <span>
                  {progress.collectedCount} / {progress.totalCount} discovered
                </span>
                <span>
                  {nextTarget
                    ? `Next: ${isHiddenDiscovery(nextTarget) ? 'Mystery Discovery' : nextTarget.name}`
                    : 'Collection complete'}
                </span>
              </div>
              <ProgressBar percent={progress.percent} />
              <button
                type="button"
                style={styles.viewButton}
                onClick={() => setSelectedCollectionId(collection.id)}
              >
                VIEW COLLECTION
              </button>
            </article>
          )
        })}
        </div>
      </section>
    </>
  )
}

function OverallStat({ label, value }) {
  return (
    <div style={styles.overallStat}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  )
}

function ProgressBar({ percent }) {
  return (
    <div style={styles.progressTrack}>
      <div style={{ ...styles.progressFill, width: `${percent}%` }} />
    </div>
  )
}

const styles = {
  pageNumber: {
    margin: '0 0 10px',
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
  },
  screen: {
    display: 'grid',
    gap: 18,
  },
  hero: {
    padding: 22,
    borderRadius: 25,
    color: '#f7fff9',
    background:
      'radial-gradient(circle at 90% 0%, rgba(120,255,214,0.13), transparent 34%), linear-gradient(145deg, #132b25, #080e12)',
    border: '1px solid rgba(120,255,214,0.22)',
  },
  eyebrow: {
    color: '#78ffd6',
    fontSize: 9,
    fontWeight: 900,
    letterSpacing: '0.2em',
  },
  title: {
    margin: '9px 0 20px',
    fontSize: 30,
    lineHeight: 0.98,
    letterSpacing: '-0.045em',
  },
  overallGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 8,
    marginBottom: 16,
  },
  overallStat: {
    minHeight: 68,
    padding: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: 6,
    borderRadius: 13,
    background: 'rgba(255,255,255,0.045)',
    border: '1px solid rgba(255,255,255,0.06)',
    fontSize: 9,
  },
  progressTrack: {
    height: 9,
    overflow: 'hidden',
    borderRadius: 999,
    background: 'rgba(255,255,255,0.09)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    background: 'linear-gradient(90deg, #63e6be, #b4ffdf)',
    boxShadow: '0 0 18px rgba(120,255,214,0.38)',
  },
  collectionList: {
    display: 'grid',
    gap: 13,
  },
  collectionCard: {
    padding: 18,
    borderRadius: 22,
    color: '#f7fff9',
    background: 'linear-gradient(145deg, #121f1d, #090e12)',
    border: '1px solid rgba(120,255,214,0.16)',
    boxShadow: '0 16px 34px rgba(0,0,0,0.23)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 14,
  },
  state: {
    color: '#78ffd6',
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: '0.16em',
  },
  collectionName: {
    margin: '6px 0 0',
    fontSize: 23,
    letterSpacing: '-0.035em',
  },
  percent: {
    fontSize: 25,
  },
  description: {
    margin: '11px 0 16px',
    color: 'rgba(240,255,248,0.64)',
    fontSize: 13,
    lineHeight: 1.5,
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 8,
    color: 'rgba(240,255,248,0.58)',
    fontSize: 10,
  },
  viewButton: {
    width: '100%',
    marginTop: 15,
    padding: '11px 13px',
    borderRadius: 13,
    border: '1px solid rgba(120,255,214,0.22)',
    color: '#caffef',
    background: 'rgba(120,255,214,0.06)',
    fontSize: 10,
    fontWeight: 900,
    letterSpacing: '0.12em',
    cursor: 'pointer',
  },
  emptyState: {
    padding: 24,
    borderRadius: 24,
    color: '#f7fff9',
    background: 'linear-gradient(145deg, #121f1d, #090e12)',
    border: '1px solid rgba(120,255,214,0.16)',
  },
  emptyTitle: {
    margin: '10px 0 8px',
    fontSize: 28,
  },
  emptyText: {
    margin: 0,
    color: 'rgba(240,255,248,0.65)',
    lineHeight: 1.5,
  },
}
