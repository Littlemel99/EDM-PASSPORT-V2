import { useMemo, useState } from 'react'
import { getFestivalDiscoveries } from '../../festivals/festivalDiscoveries.js'
import { getFestivalCollections } from '../../collections/CollectionEngine.js'
import {
  BACKSTAGE_MODULE_GROUPS,
  createBroadcastDraft,
  filterAdminFestivals,
  filterCollectionsByFestival,
  filterDiscoveriesByFestival,
  getAdminModuleStatus,
  getFestivalAdminRecords,
  getFestivalLifecycleLabel,
  getFestivalPublishLabel,
  getFestivalWorkspaceTaskDashboard,
  getBackstageContinueBuilding,
  searchAdminFestivals,
  sortAdminFestivals,
  summarizeAdminFestivals,
} from './adminModuleData.js'
import {
  archiveCollectionDraft,
  createFestivalInformationInput,
  getPublishingPipelineReview,
  loadBackstageDrafts,
  mergeFestivalWithDrafts,
  restoreCollectionDraft,
  saveBackstageDraft,
  validateCollectionDraft,
  validateDiscoveryDraft,
  validateFestivalInformation,
} from './backstageDraftStore.js'
import './adminConsole.css'

export default function AdminConsole({
  authorized = false,
  raveName = '',
  festivals = [],
  adminUserId = '',
  homeRequestToken = 0,
  onReturnToDashboard,
}) {
  const [moduleSelection, setModuleSelection] = useState({
    name: '',
    homeRequestToken,
  })
  const [workspaceFestivalId, setWorkspaceFestivalId] = useState('')
  const [draftsByFestival, setDraftsByFestival] = useState({})
  const [workspaceResumeRequested, setWorkspaceResumeRequested] =
    useState(false)
  const [workspaceInitialTab, setWorkspaceInitialTab] =
    useState('overview')
  const baseFestivalRecords = useMemo(
    () =>
      getFestivalAdminRecords(
        festivals.map((festival) => {
          const festivalId = festival.id
          return {
            ...festival,
            discoveryCount:
              getFestivalDiscoveries(festivalId).filter(
                (discovery) => discovery.claimable !== false
              ).length,
            collectionCount: getFestivalCollections(festivalId).length,
          }
        })
      ),
    [festivals]
  )
  const festivalRecords = baseFestivalRecords.map((festival) =>
    mergeFestivalWithDrafts(festival, draftsByFestival[festival.id])
  )
  const workspaceFestival = festivalRecords.find(
    (festival) => festival.id === workspaceFestivalId
  ) || null
  const continueBuilding = getBackstageContinueBuilding(workspaceFestival)
  const activeModule =
    moduleSelection.homeRequestToken === homeRequestToken
      ? moduleSelection.name
      : ''
  const setActiveModule = (name) => {
    setModuleSelection({ name, homeRequestToken })
  }
  const selectWorkspaceFestival = (festivalId) => {
    setWorkspaceFestivalId(festivalId)
    if (!draftsByFestival[festivalId] && adminUserId) {
      setDraftsByFestival((current) => ({
        ...current,
        [festivalId]: loadBackstageDrafts(
          window.localStorage,
          adminUserId,
          festivalId
        ),
      }))
    }
  }
  const saveWorkspaceDraft = (festivalId, draftType, value) => {
    const saved = saveBackstageDraft(
      window.localStorage,
      adminUserId,
      festivalId,
      draftType,
      value
    )
    setDraftsByFestival((current) => ({
      ...current,
      [festivalId]: {
        information: null,
        discoveries: [],
        collections: [],
        ...current[festivalId],
        [draftType]: saved,
      },
    }))
  }

  const openFestivalModule = (tab = '', resume = false) => {
    setWorkspaceInitialTab(tab || 'overview')
    setWorkspaceResumeRequested(resume)
    setActiveModule('Festivals')
  }

  const openBackstageModule = (module) => {
    if (module === 'Festival Library') {
      openFestivalModule('overview', false)
      return
    }
    const workspaceTabs = {
      Schedule: 'schedule',
      'QR / NFC': 'qr-nfc',
      Analytics: 'analytics',
      Publishing: 'publishing',
    }
    if (workspaceTabs[module] && workspaceFestivalId) {
      openFestivalModule(workspaceTabs[module], true)
      return
    }
    setActiveModule(module)
  }

  if (!authorized) {
    return (
      <section className="admin-console" style={styles.console} aria-labelledby="admin-denied-title">
        <span style={styles.eyebrow}>EDM PASSPORT BACKSTAGE</span>
        <h1 id="admin-denied-title" style={styles.title}>ACCESS DENIED</h1>
        <p style={styles.copy}>
          This account does not have permission to use Backstage.
        </p>
        <button
          type="button"
          style={styles.primaryButton}
          onClick={onReturnToDashboard}
        >
          RETURN TO DASHBOARD
        </button>
      </section>
    )
  }

  if (activeModule) {
    return (
      <section className="admin-console" style={styles.console} aria-label="Backstage module">
        <span style={styles.eyebrow}>EDM PASSPORT BACKSTAGE</span>
        <AdminModule
          moduleName={activeModule}
          festivals={festivalRecords}
          onReturnToBackstage={() => setActiveModule('')}
          workspaceFestivalId={workspaceFestivalId}
          onSelectWorkspaceFestival={selectWorkspaceFestival}
          workspaceDrafts={draftsByFestival[workspaceFestivalId]}
          onSaveWorkspaceDraft={saveWorkspaceDraft}
          resumeWorkspace={workspaceResumeRequested}
          initialWorkspaceTab={workspaceInitialTab}
        />
        {activeModule !== 'Festivals' && (
          <button
            type="button"
            className="admin-console__return-button"
            onClick={() => setActiveModule('')}
          >
            RETURN TO BACKSTAGE
          </button>
        )}
      </section>
    )
  }

  return (
    <section className="admin-console" style={styles.console} aria-labelledby="admin-console-title">
      <header style={styles.header}>
        <span style={styles.eyebrow}>OPERATING CENTER</span>
        <h1 id="admin-console-title" style={styles.title}>
          EDM PASSPORT BACKSTAGE
        </h1>
        <p className="admin-console__subtitle">Festival Operations Center</p>
        <p style={styles.signedIn}>
          Signed in as: <strong>{raveName || 'Administrator'}</strong>
        </p>
      </header>

      <ContinueBuilding
        data={continueBuilding}
        onOpenLibrary={() => openFestivalModule('overview', false)}
        onResume={() => openFestivalModule('overview', true)}
      />

      <div className="admin-console__module-groups">
        {BACKSTAGE_MODULE_GROUPS.map((group) => (
          <section key={group.label}>
            <h2>{group.label}</h2>
            <nav className="admin-console__module-grid" aria-label={group.label}>
              {group.modules.map((module) => (
                <button
                  key={module}
                  type="button"
                  className="admin-console__module-card"
                  onClick={() => openBackstageModule(module)}
                >
                  <strong>{module}</strong>
                  <span>{getAdminModuleStatus(module)}</span>
                </button>
              ))}
            </nav>
          </section>
        ))}
      </div>

      <footer style={styles.statusBar}>
        <span>Development Environment</span>
        <span>Backstage V1</span>
        <span>Adventure Passport Branch</span>
      </footer>
    </section>
  )
}

function ContinueBuilding({ data, onOpenLibrary, onResume }) {
  if (!data) {
    return (
      <section className="admin-console__continue-building" aria-labelledby="continue-building-title">
        <span>CONTINUE BUILDING</span>
        <h2 id="continue-building-title">SELECT A FESTIVAL TO BEGIN</h2>
        <button type="button" onClick={onOpenLibrary}>
          OPEN FESTIVAL LIBRARY
        </button>
      </section>
    )
  }

  return (
    <section className="admin-console__continue-building" aria-labelledby="continue-building-title">
      <span>CONTINUE BUILDING</span>
      <header>
        <div>
          <h2 id="continue-building-title">{data.festivalName}</h2>
          <p>
            {data.year || 'Edition not provided'} ·{' '}
            {getFestivalLifecycleLabel(data.lifecycle)} ·{' '}
            {data.location || 'Location not provided'}
          </p>
        </div>
        <strong>{data.progressPercent}% configured</strong>
      </header>
      <div
        className="admin-console__continue-progress"
        role="progressbar"
        aria-label="Festival configuration progress"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={data.progressPercent}
      >
        <span style={{ width: `${data.progressPercent}%` }} />
      </div>
      <div className="admin-console__continue-categories">
        {data.categories.map((category) => (
          <span key={category.id}>
            <strong>{category.label}</strong>
            <small>{category.status}</small>
          </span>
        ))}
      </div>
      <p className="admin-console__next-action">
        <span>NEXT RECOMMENDED ACTION</span>
        <strong>{data.nextAction}</strong>
      </p>
      <div className="admin-console__continue-requirements">
        <strong>{data.totalMissingItems} missing items</strong>
        <ul>
          {data.missingItems.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </div>
      <div className="admin-console__continue-actions">
        <button type="button" onClick={onResume}>RESUME FESTIVAL</button>
        <button type="button" onClick={onResume}>VIEW ALL REQUIREMENTS</button>
      </div>
    </section>
  )
}

function AdminModule({
  moduleName,
  festivals,
  onReturnToBackstage,
  workspaceFestivalId,
  onSelectWorkspaceFestival,
  workspaceDrafts,
  onSaveWorkspaceDraft,
  resumeWorkspace,
  initialWorkspaceTab,
}) {
  if (moduleName === 'Festivals') {
    return (
      <FestivalManagement
        festivals={festivals}
        onReturnToBackstage={onReturnToBackstage}
        workspaceFestivalId={workspaceFestivalId}
        onSelectWorkspaceFestival={onSelectWorkspaceFestival}
        workspaceDrafts={workspaceDrafts}
        onSaveWorkspaceDraft={onSaveWorkspaceDraft}
        resumeWorkspace={resumeWorkspace}
        initialWorkspaceTab={initialWorkspaceTab}
      />
    )
  }
  if (moduleName === 'Discoveries') {
    return <DiscoveryManagement festivals={festivals} />
  }
  if (moduleName === 'Collections') {
    return <CollectionManagement festivals={festivals} />
  }
  if (moduleName === 'Users') {
    return <UserManagement />
  }
  if (moduleName === 'Broadcasts') {
    return <BroadcastManagement festivals={festivals} />
  }
  return (
    <>
      <h1 id="admin-module-title" style={styles.title}>
        {moduleName} Management
      </h1>
      <p style={styles.copy}>No management tools configured yet.</p>
    </>
  )
}

function FestivalManagement({
  festivals,
  onReturnToBackstage,
  workspaceFestivalId,
  onSelectWorkspaceFestival,
  workspaceDrafts,
  onSaveWorkspaceDraft,
  resumeWorkspace,
  initialWorkspaceTab,
}) {
  const [workspaceOpen, setWorkspaceOpen] = useState(
    Boolean(resumeWorkspace && workspaceFestivalId)
  )
  const [filter, setFilter] = useState('production')
  const [search, setSearch] = useState('')
  const [workspaceTab, setWorkspaceTab] = useState(
    initialWorkspaceTab || 'overview'
  )
  const selected = festivals.find(
    (festival) => festival.id === workspaceFestivalId
  )
  const visibleFestivals = sortAdminFestivals(
    searchAdminFestivals(
      filterAdminFestivals(festivals, filter),
      search
    )
  )
  const summary = summarizeAdminFestivals(festivals)

  return (
    <>
      {workspaceOpen && selected ? (
        <FestivalWorkspace
          festival={selected}
          festivals={festivals}
          activeTab={workspaceTab}
          onSelectTab={setWorkspaceTab}
          onReturn={() => {
            setWorkspaceOpen(false)
            setWorkspaceTab('overview')
          }}
          onReturnToBackstage={onReturnToBackstage}
          drafts={workspaceDrafts}
          onSaveDraft={onSaveWorkspaceDraft}
        />
      ) : (
        <>
          <ModuleHeader
            title="Festival Library"
            status="READY"
            copy="Select a festival edition to open its management workspace."
          />
          <section className="admin-console__festival-summary" aria-label="Festival summary">
            <FestivalStatusChip label="LIVE" value={summary.live} />
            <FestivalStatusChip label="UPCOMING" value={summary.upcoming} />
            <FestivalStatusChip label="COMPLETED" value={summary.completed} />
            <FestivalStatusChip label="STATUS NOT SET" value={summary.draftOrUnknown} />
          </section>
          <div className="admin-console__festival-controls">
            <label>
              Search festivals
              <input
                type="search"
                value={search}
                placeholder="Name, location, or year"
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
            <div className="admin-console__festival-filters" role="group" aria-label="Festival data filter">
              {[
                ['production', 'PRODUCTION FESTIVALS'],
                ['test', 'TEST / UNKNOWN FESTIVALS'],
                ['all', 'ALL'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="admin-console__festival-overview">
            <FestivalAdminTable
              festivals={visibleFestivals}
              onOpen={(festivalId) => {
                onSelectWorkspaceFestival(festivalId)
                setWorkspaceTab('overview')
                setWorkspaceOpen(true)
              }}
            />
            <div className="admin-console__festival-mobile-list">
              {visibleFestivals.map((festival) => (
                <FestivalAdminRow
                  key={festival.id}
                  festival={festival}
                  onClick={() => {
                    onSelectWorkspaceFestival(festival.id)
                    setWorkspaceTab('overview')
                    setWorkspaceOpen(true)
                  }}
                />
              ))}
            </div>
            {!visibleFestivals.length && <EmptyState copy="No festivals match this search and filter." />}
          </div>
        </>
      )}
    </>
  )
}

function FestivalAdminTable({ festivals, onOpen }) {
  return (
    <div className="admin-console__festival-table-wrap">
      <table className="admin-console__festival-table">
        <thead>
          <tr>
            <th scope="col">Festival</th>
            <th scope="col">Year</th>
            <th scope="col">Lifecycle</th>
            <th scope="col">Publish Status</th>
            <th scope="col">Discoveries</th>
            <th scope="col">Collections</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {festivals.map((festival) => (
            <tr
              key={festival.id}
              tabIndex="0"
              aria-label={`Manage ${festival.name}`}
              onClick={() => onOpen(festival.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  onOpen(festival.id)
                }
              }}
            >
              <td>
                <strong>{festival.name}</strong>
              </td>
              <td>{festival.year || '—'}</td>
              <td><Badge>{getFestivalLifecycleLabel(festival.lifecycle)}</Badge></td>
              <td><Badge>{getFestivalPublishLabel(festival.published)}</Badge></td>
              <td>{festival.discoveryCount} configured</td>
              <td>{festival.collectionCount} configured</td>
              <td>
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    onOpen(festival.id)
                  }}
                >
                  MANAGE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FestivalAdminRow({ festival, onClick }) {
  return (
    <article className="admin-console__festival-row">
      <header>
        <div>
          <h2>{festival.name}</h2>
          {festival.year && <p className="admin-console__festival-year">{festival.year}</p>}
        </div>
        <div className="admin-console__festival-badges">
          <Badge>{getFestivalLifecycleLabel(festival.lifecycle)}</Badge>
          <Badge>{getFestivalPublishLabel(festival.published)}</Badge>
        </div>
      </header>
      <dl>
        <Definition label="Location" value={festival.location || 'Not provided'} />
        <Definition label="Dates" value={festival.dateLabel || 'Not provided'} />
        <Definition label="Discoveries" value={`${festival.discoveryCount} configured`} />
        <Definition label="Collections" value={`${festival.collectionCount} configured`} />
      </dl>
      <button type="button" onClick={onClick}>MANAGE</button>
    </article>
  )
}

function Badge({ children }) {
  return <span className="admin-console__badge">{children}</span>
}

function FestivalStatusChip({ label, value }) {
  return (
    <span className="admin-console__festival-status-chip">
      <strong>{label}</strong>
      <b>{value}</b>
    </span>
  )
}

const FESTIVAL_WORKSPACE_TABS = [
  ['overview', 'Overview'],
  ['discoveries', 'Discoveries'],
  ['collections', 'Collections'],
  ['qr-nfc', 'QR / NFC'],
  ['schedule', 'Schedule'],
  ['publishing', 'Publishing'],
  ['analytics', 'Analytics'],
  ['settings', 'Settings'],
]

function FestivalWorkspace({
  festival,
  festivals,
  activeTab,
  onSelectTab,
  onReturn,
  onReturnToBackstage,
  drafts,
  onSaveDraft,
}) {
  const builderTabOrder = [
    'settings',
    'discoveries',
    'collections',
    'schedule',
    'publishing',
  ]
  const builderIndex = builderTabOrder.indexOf(activeTab)
  const previousBuilderTab =
    builderIndex > 0 ? builderTabOrder[builderIndex - 1] : null
  const nextBuilderTab =
    activeTab === 'overview'
      ? builderTabOrder[0]
      : builderIndex >= 0 && builderIndex < builderTabOrder.length - 1
        ? builderTabOrder[builderIndex + 1]
        : null
  return (
    <section className="admin-console__workspace" aria-labelledby="festival-workspace-title">
      <header className="admin-console__workspace-header">
        <div>
          <span>FESTIVAL WORKSPACE</span>
          <h1 id="festival-workspace-title">{festival.name}</h1>
          <p>
            {festival.year || 'Edition not provided'} ·{' '}
            {festival.location || 'Location not provided'}
          </p>
          <p>
            {festival.dateLabel || 'Dates not provided'} ·{' '}
            {festival.timezone || 'Timezone not provided'}
          </p>
        </div>
        <div className="admin-console__workspace-status">
          <Badge>{getFestivalLifecycleLabel(festival.lifecycle)}</Badge>
          <Badge>
            {festival.publishStatus || getFestivalPublishLabel(festival.published)}
          </Badge>
        </div>
        <div className="admin-console__workspace-actions">
          <button type="button" onClick={onReturn}>RETURN TO LIBRARY</button>
          <button type="button" onClick={onReturnToBackstage}>RETURN TO BACKSTAGE</button>
        </div>
      </header>
      <nav className="admin-console__workspace-tabs" aria-label="Festival workspace">
        {FESTIVAL_WORKSPACE_TABS.map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-current={activeTab === id ? 'page' : undefined}
            onClick={() => onSelectTab(id)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className="admin-console__workspace-content">
        {activeTab === 'overview' && (
          <WorkspaceOverview
            festival={festival}
            onOpenTab={onSelectTab}
            onReturnToLibrary={onReturn}
            onReturnToBackstage={onReturnToBackstage}
          />
        )}
        {activeTab === 'discoveries' && (
          <DiscoveryManagement
            festivals={festivals}
            festivalIdOverride={festival.id}
            draftMode={festival.id === 'tomorrowland-2026'}
            drafts={drafts?.discoveries || []}
            onSaveDrafts={(value) =>
              onSaveDraft(festival.id, 'discoveries', value)
            }
          />
        )}
        {activeTab === 'collections' && (
          <CollectionManagement
            festivals={festivals}
            festivalIdOverride={festival.id}
            draftMode={festival.id === 'tomorrowland-2026'}
            drafts={drafts?.collections || []}
            discoveryDrafts={drafts?.discoveries || []}
            onSaveDrafts={(value) =>
              onSaveDraft(festival.id, 'collections', value)
            }
          />
        )}
        {activeTab === 'qr-nfc' && (
          <WorkspaceState
            title="QR / NFC"
            status="BACKEND REQUIRED"
            copy="Secure QR and NFC management is not configured. No client-side issuance controls are available."
          />
        )}
        {activeTab === 'schedule' && (
          <WorkspaceState
            title="Schedule"
            status="READ ONLY"
            copy="SCHEDULE NOT CONFIGURED"
          />
        )}
        {activeTab === 'publishing' && (
          <PublishingWorkspace
            festival={festival}
            drafts={drafts}
            onOpenTab={onSelectTab}
            onReturnToLibrary={onReturn}
            onReturnToBackstage={onReturnToBackstage}
          />
        )}
        {activeTab === 'analytics' && (
          <WorkspaceState
            title="Analytics"
            status="BACKEND REQUIRED"
            copy="ANALYTICS BACKEND REQUIRED"
          />
        )}
        {activeTab === 'settings' && (
          <FestivalInformationWorkspace
            festival={festival}
            draft={drafts?.information}
            onSave={(value) =>
              onSaveDraft(festival.id, 'information', value)
            }
          />
        )}
      </div>
      {(previousBuilderTab || nextBuilderTab) && (
        <nav
          className="admin-console__builder-step-navigation"
          aria-label="Builder step navigation"
        >
          {previousBuilderTab && (
            <button
              type="button"
              onClick={() => onSelectTab(previousBuilderTab)}
            >
              PREVIOUS STEP
            </button>
          )}
          {nextBuilderTab && (
            <button type="button" onClick={() => onSelectTab(nextBuilderTab)}>
              NEXT STEP
            </button>
          )}
        </nav>
      )}
    </section>
  )
}

function WorkspaceOverview({
  festival,
  onOpenTab,
  onReturnToLibrary,
  onReturnToBackstage,
}) {
  const dashboard = getFestivalWorkspaceTaskDashboard(festival)
  const [checklistMode, setChecklistMode] = useState('default')
  const checklistGroups = [
    {
      label: 'Festival Information',
      items: ['Name', 'Location', 'Start date', 'End date', 'Timezone', 'Lifecycle'],
    },
    {
      label: 'Content',
      items: ['At least one discovery', 'At least one collection', 'Schedule configured'],
    },
    { label: 'Deployment', items: ['Publish status'] },
    {
      label: 'Backend',
      items: ['QR / NFC backend available', 'Analytics backend available'],
    },
  ].map((group) => ({
    ...group,
    items: dashboard.checklist.filter((item) => group.items.includes(item.label)),
  }))

  return (
    <section className="admin-console__overview" aria-labelledby="workspace-overview-title">
      <h2 id="workspace-overview-title">Festival Task Dashboard</h2>

      <section className="admin-console__readiness-card" aria-labelledby="festival-readiness-title">
        <header>
          <div>
            <span>FESTIVAL PROJECT</span>
            <h3 id="festival-readiness-title">{festival.name}</h3>
            <p>
              {getFestivalLifecycleLabel(festival.lifecycle)} ·{' '}
              {festival.location || 'Location not provided'} ·{' '}
              {festival.dateLabel || 'Dates not provided'} ·{' '}
              {festival.publishStatus ||
                getFestivalPublishLabel(festival.published)}
            </p>
          </div>
          <div>
            <strong>{dashboard.progressPercent}%</strong>
            <span>FESTIVAL READY</span>
          </div>
        </header>
        <div
          className="admin-console__readiness-progress"
          role="progressbar"
          aria-label="Festival readiness"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={dashboard.progressPercent}
        >
          <span style={{ width: `${dashboard.progressPercent}%` }} />
        </div>
        <dl>
          <Definition label="Complete" value={dashboard.completeCount} />
          <Definition label="Remaining" value={dashboard.missingCount} />
          <Definition
            label="Backend Required"
            value={dashboard.backendRequiredCount}
          />
        </dl>
      </section>

      <section className="admin-console__next-actions" aria-labelledby="workspace-next-actions-title">
        <div className="admin-console__milestone">
          <span>CURRENT MILESTONE</span>
          <strong>{dashboard.milestone}</strong>
        </div>
        <h3 id="workspace-next-actions-title">NEXT REQUIRED TASK</h3>
        {dashboard.primaryTask ? (
          <>
            <strong>{dashboard.primaryTask.label}</strong>
            <button
              className="admin-console__continue-task"
              type="button"
              onClick={() => onOpenTab(dashboard.primaryTask.tab)}
            >
              CONTINUE
            </button>
          </>
        ) : (
          <strong>{dashboard.state}</strong>
        )}
        {dashboard.secondaryTasks.length > 0 && (
          <div className="admin-console__secondary-tasks">
            {dashboard.secondaryTasks.map((task) => (
              <button
                key={task.checklistLabel}
                type="button"
                onClick={() => onOpenTab(task.tab)}
              >
                <span>{task.label}</span>
                <small>OPEN</small>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="admin-console__blockers" aria-labelledby="workspace-blockers-title">
        <h3 id="workspace-blockers-title">BLOCKING ISSUES</h3>
        <div>
          <article>
            <strong>
              {dashboard.readyForTesting
                ? 'READY FOR TESTING'
                : 'NOT READY FOR TESTING'}
            </strong>
            <span>TESTING BLOCKERS</span>
            {dashboard.testingBlockers.length ? (
              <ul>
                {dashboard.testingBlockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            ) : (
              <p>No testing blockers.</p>
            )}
          </article>
          <article>
            <strong>
              {dashboard.readyForProduction
                ? 'READY FOR PRODUCTION'
                : 'NOT READY FOR PRODUCTION'}
            </strong>
            <span>PRODUCTION BLOCKERS</span>
            {dashboard.productionBlockers.length ? (
              <ul>
                {dashboard.productionBlockers.map((blocker) => (
                  <li key={blocker}>{blocker}</li>
                ))}
              </ul>
            ) : (
              <p>No production blockers.</p>
            )}
          </article>
        </div>
      </section>

      <section className="admin-console__configuration-summary" aria-labelledby="configuration-summary-title">
        <h3 id="configuration-summary-title">BUILDER STEPS</h3>
        <div>
          {dashboard.builderSteps.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenTab(item.tab)}
            >
              <span>
                {item.label}
                {item.repositoryCount !== null && (
                  <small>
                    Repository: {item.repositoryCount} · Local drafts:{' '}
                    {item.localDraftCount}
                  </small>
                )}
              </span>
              <strong>{item.status}</strong>
            </button>
          ))}
        </div>
        <h3>BACKEND SERVICES</h3>
        <div>
          {dashboard.backendServices.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onOpenTab(item.tab)}
            >
              <span>{item.label}</span>
              <strong>{item.status}</strong>
            </button>
          ))}
        </div>
      </section>

      <section
        className="admin-console__overview-section"
        id="workspace-readiness-checklist"
        tabIndex="-1"
      >
        <h3>READINESS CHECKLIST</h3>
        <div className="admin-console__checklist-controls">
          <button type="button" onClick={() => setChecklistMode('expanded')}>
            EXPAND ALL
          </button>
          <button type="button" onClick={() => setChecklistMode('collapsed')}>
            COLLAPSE ALL
          </button>
        </div>
        <div className="admin-console__checklist-groups">
          {checklistGroups.map((group) => {
            const hasUnresolved = group.items.some(
              (item) => item.status !== 'COMPLETE'
            )
            return (
              <details
                key={`${festival.id}-${group.label}-${checklistMode}`}
                open={
                  checklistMode === 'expanded' ||
                  (checklistMode === 'default' && hasUnresolved)
                }
              >
                <summary>{group.label}</summary>
                <ul className="admin-console__checklist">
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <strong>{item.status}</strong>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )
          })}
        </div>
      </section>

      <section className="admin-console__overview-section">
        <h3>MISSING CONFIGURATION</h3>
        {dashboard.missingConfiguration.length ? (
          <ul className="admin-console__missing-list">
            {dashboard.missingConfiguration.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : (
          <strong>READY FOR REVIEW</strong>
        )}
        <a
          className="admin-console__checklist-link"
          href="#workspace-readiness-checklist"
        >
          VIEW FULL CHECKLIST
        </a>
      </section>

      <nav className="admin-console__overview-actions" aria-label="Workspace quick navigation">
        {[
          ['discoveries', 'OPEN DISCOVERIES'],
          ['collections', 'OPEN COLLECTIONS'],
          ['qr-nfc', 'OPEN QR / NFC'],
          ['schedule', 'OPEN SCHEDULE'],
          ['publishing', 'OPEN PUBLISHING'],
          ['analytics', 'OPEN ANALYTICS'],
        ].map(([tab, label]) => (
          <button key={tab} type="button" onClick={() => onOpenTab(tab)}>
            {label}
          </button>
        ))}
        <button type="button" onClick={onReturnToLibrary}>
          RETURN TO LIBRARY
        </button>
        <button type="button" onClick={onReturnToBackstage}>
          RETURN TO BACKSTAGE
        </button>
      </nav>
    </section>
  )
}

function PublishingWorkspace({
  festival,
  drafts,
  onOpenTab,
  onReturnToLibrary,
  onReturnToBackstage,
}) {
  const review = getPublishingPipelineReview(festival, drafts)
  return (
    <section className="admin-console__workspace-panel admin-console__publishing-review">
      <ModuleHeader
        title="Publishing Pipeline"
        status="READ ONLY"
        copy="Publishing changes require a verified secure persistence contract. No Publish action is available."
      />
      <div className="admin-console__draft-flags">
        <Badge>LOCAL DRAFT MODE: {review.backend.localDraftMode}</Badge>
        {review.hasUnsyncedDrafts && <Badge>UNSYNCED LOCAL DRAFTS</Badge>}
        <Badge>BACKEND REQUIRED</Badge>
      </div>
      <dl className="admin-console__publishing-summary">
        <Definition label="Festival" value={review.festival.name} />
        <Definition label="Edition year" value={review.festival.year || 'Not provided'} />
        <Definition label="Lifecycle" value={getFestivalLifecycleLabel(review.festival.lifecycle)} />
        <Definition
          label="Publish status"
          value={review.festival.publishStatus}
        />
        <Definition
          label="Repository discoveries"
          value={review.counts.repositoryDiscoveries}
        />
        <Definition
          label="Local draft discoveries"
          value={review.counts.localDiscoveries}
        />
        <Definition
          label="Repository collections"
          value={review.counts.repositoryCollections}
        />
        <Definition
          label="Local draft collections"
          value={review.counts.localCollections}
        />
        <Definition label="SECURE PERSISTENCE" value="NOT AVAILABLE" />
        <Definition label="PUBLISHING BACKEND" value="NOT AVAILABLE" />
      </dl>
      <div className="admin-console__publishing-readiness">
        <section>
          <h2>{review.readyForLocalTesting ? 'READY FOR LOCAL TESTING' : 'NOT READY FOR LOCAL TESTING'}</h2>
          <h3>LOCAL TESTING BLOCKERS</h3>
          {review.localTestingBlockers.length ? (
            <ul>{review.localTestingBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>
          ) : <p>No local testing blockers.</p>}
        </section>
        <section>
          <h2>{review.readyForProduction ? 'READY FOR PRODUCTION' : 'NOT READY FOR PRODUCTION'}</h2>
          <h3>PRODUCTION BLOCKERS</h3>
          {review.productionBlockers.length ? (
            <ul>{review.productionBlockers.map((blocker) => <li key={blocker}>{blocker}</li>)}</ul>
          ) : <p>No production blockers.</p>}
        </section>
      </div>
      <section className="admin-console__publishing-changes">
        <h2>CHANGE REVIEW</h2>
        <article>
          <h3>Festival Information Changes</h3>
          <Badge>LOCAL DRAFT · NOT SYNCED</Badge>
          {review.informationChanges.length ? (
            <dl>
              {review.informationChanges.map((change) => (
                <Definition
                  key={change.field}
                  label={change.label}
                  value={`${change.repositoryValue || 'Not provided'} → ${change.localValue || 'Not provided'}`}
                />
              ))}
            </dl>
          ) : <p>No local festival information changes.</p>}
        </article>
        <article>
          <h3>Discovery Drafts</h3>
          {review.discoveryDrafts.length ? review.discoveryDrafts.map((draft) => (
            <div className="admin-console__review-record" key={draft.id}>
              <strong>{draft.title}</strong>
              <span>{draft.status} · {draft.active ? 'ACTIVE' : 'INACTIVE'}</span>
              <span>{draft.xp} XP · {draft.claimMethod}</span>
            </div>
          )) : <p>No valid active discovery drafts.</p>}
        </article>
        <article>
          <h3>Collection Drafts</h3>
          {review.collectionDrafts.length ? review.collectionDrafts.map((draft) => (
            <div className="admin-console__review-record" key={draft.id}>
              <strong>{draft.name}</strong>
              <span>{draft.status}</span>
              <span>{draft.requiredCount} required · {draft.optionalCount} optional · {draft.xp} XP</span>
            </div>
          )) : <p>No valid active collection drafts.</p>}
        </article>
      </section>
      <nav className="admin-console__publishing-actions" aria-label="Publishing review actions">
        <button type="button" onClick={() => onOpenTab('settings')}>REVIEW FESTIVAL INFORMATION</button>
        <button type="button" onClick={() => onOpenTab('discoveries')}>REVIEW DISCOVERIES</button>
        <button type="button" onClick={() => onOpenTab('collections')}>REVIEW COLLECTIONS</button>
        <button type="button" onClick={() => onOpenTab('overview')}>RETURN TO OVERVIEW</button>
        <button type="button" onClick={onReturnToLibrary}>RETURN TO LIBRARY</button>
        <button type="button" onClick={onReturnToBackstage}>RETURN TO BACKSTAGE</button>
      </nav>
    </section>
  )
}

function FestivalInformationWorkspace({ festival, draft, onSave }) {
  const [input, setInput] = useState(() =>
    draft || createFestivalInformationInput(festival)
  )
  const [errors, setErrors] = useState({})
  const [saved, setSaved] = useState(Boolean(draft))
  const update = (field, value) => {
    setInput((current) => ({ ...current, [field]: value }))
    setSaved(false)
  }
  const submit = (event) => {
    event.preventDefault()
    const result = validateFestivalInformation(input)
    setErrors(result.errors)
    if (!result.valid) return
    onSave(input)
    setSaved(true)
  }

  return (
    <section className="admin-console__workspace-panel">
      <ModuleHeader
        title="Festival Information"
        status="LOCAL DRAFT"
        copy="Changes are stored only in this browser for the authenticated Backstage account."
      />
      <div className="admin-console__draft-flags">
        <Badge>LOCAL DRAFT</Badge>
        <Badge>NOT SYNCED</Badge>
      </div>
      <dl>
        <Definition label="Festival ID" value={festival.id} />
        <Definition label="Edition ID" value={festival.editionId || festival.id} />
        <Definition label="Data source" value={festival.dataSource || 'Not provided'} />
      </dl>
      <form className="admin-console__builder-form" onSubmit={submit}>
        <BuilderField label="Festival name" required error={errors.name}>
          <input value={input.name} onChange={(event) => update('name', event.target.value)} />
        </BuilderField>
        <BuilderField label="Edition year" required error={errors.year}>
          <input type="number" value={input.year} onChange={(event) => update('year', event.target.value)} />
        </BuilderField>
        <BuilderField label="Location" required error={errors.location}>
          <input value={input.location} onChange={(event) => update('location', event.target.value)} />
        </BuilderField>
        <BuilderField label="Start date" required error={errors.startDate}>
          <input type="date" value={input.startDate} onChange={(event) => update('startDate', event.target.value)} />
        </BuilderField>
        <BuilderField label="End date" required error={errors.endDate}>
          <input type="date" value={input.endDate} onChange={(event) => update('endDate', event.target.value)} />
        </BuilderField>
        <BuilderField label="Timezone" required error={errors.timezone}>
          <input value={input.timezone} onChange={(event) => update('timezone', event.target.value)} />
        </BuilderField>
        <BuilderField label="Description">
          <textarea rows="3" value={input.description} onChange={(event) => update('description', event.target.value)} />
        </BuilderField>
        <BuilderField label="Website" error={errors.website}>
          <input type="url" value={input.website} onChange={(event) => update('website', event.target.value)} />
        </BuilderField>
        <BuilderField label="Artwork reference">
          <input value={input.artwork} onChange={(event) => update('artwork', event.target.value)} />
        </BuilderField>
        <BuilderField label="Publish status" required error={errors.publishStatus}>
          <select value={input.publishStatus} onChange={(event) => update('publishStatus', event.target.value)}>
            {['DRAFT', 'TESTING', 'PUBLISHED', 'ARCHIVED'].map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </BuilderField>
        <button className="admin-console__primary-button" type="submit">
          SAVE LOCAL DRAFT
        </button>
      </form>
      {saved && <p className="admin-console__local-save-status">LOCAL DRAFT SAVED · NOT SYNCED</p>}
    </section>
  )
}

function BuilderField({ label, required = false, error = '', children }) {
  return (
    <label>
      <span>{label}{required ? ' *' : ''}</span>
      {children}
      {error && <small role="alert">{error}</small>}
    </label>
  )
}

function WorkspaceState({ title, status, copy }) {
  return (
    <section className="admin-console__workspace-panel">
      <ModuleHeader title={title} status={status} copy={copy} />
    </section>
  )
}

function DiscoveryManagement({
  festivals,
  festivalIdOverride = '',
  draftMode = false,
  drafts = [],
  onSaveDrafts,
}) {
  const [festivalId, setFestivalId] = useState(
    festivalIdOverride || festivals[0]?.id || ''
  )
  const resolvedFestivalId = festivalIdOverride || festivalId
  const [selectedId, setSelectedId] = useState('')
  const discoveries = filterDiscoveriesByFestival(
    getFestivalDiscoveries(),
    resolvedFestivalId
  )
  const selected = discoveries.find((discovery) => discovery.id === selectedId)
  if (draftMode) {
    return (
      <DiscoveryDraftBuilder
        festivalId={resolvedFestivalId}
        repositoryDiscoveries={discoveries}
        drafts={drafts}
        onSaveDrafts={onSaveDrafts}
      />
    )
  }

  return (
    <>
      <ModuleHeader
        title="Discovery Management"
        status="READ ONLY"
        copy="Catalog records are strictly filtered by their owning festival edition."
      />
      {!festivalIdOverride && (
        <FestivalFilter
          festivals={festivals}
          value={festivalId}
          onChange={(value) => {
            setFestivalId(value)
            setSelectedId('')
          }}
        />
      )}
      {selected ? (
        <DetailPanel title={selected.name} onClose={() => setSelectedId('')}>
          <Definition label="Festival ID" value={selected.festivalId} />
          <Definition label="Location" value={selected.location || 'Not configured'} />
          <Definition label="Rarity" value={selected.rarity || 'Not configured'} />
          <Definition label="Category" value={selected.category || 'Not configured'} />
          <Definition
            label="Claim method"
            value={selected.claimMethods?.length ? selected.claimMethods.join(', ') : 'Unconfigured'}
          />
          <Definition
            label="Status"
            value={selected.claimable === false ? 'Achievement only' : 'Catalogued'}
          />
        </DetailPanel>
      ) : (
        <div className="admin-console__record-list">
          {discoveries.map((discovery) => (
            <RecordButton
              key={discovery.id}
              title={discovery.name}
              meta={`${discovery.rarity || 'Unknown rarity'} • ${discovery.category || 'Uncategorized'}`}
              status={discovery.claimable === false ? 'ACHIEVEMENT' : 'CATALOGUED'}
              onClick={() => setSelectedId(discovery.id)}
            />
          ))}
          {!discoveries.length && <EmptyState copy="No discoveries are configured for this festival." />}
        </div>
      )}
    </>
  )
}

function CollectionManagement({
  festivals,
  festivalIdOverride = '',
  draftMode = false,
  drafts = [],
  discoveryDrafts = [],
  onSaveDrafts,
}) {
  const [festivalId, setFestivalId] = useState(
    festivalIdOverride || festivals[0]?.id || ''
  )
  const resolvedFestivalId = festivalIdOverride || festivalId
  const [selectedId, setSelectedId] = useState('')
  const collections = filterCollectionsByFestival(
    festivals.flatMap((festival) => getFestivalCollections(festival.id)),
    resolvedFestivalId
  )
  const selected = collections.find((collection) => collection.id === selectedId)
  if (draftMode) {
    return (
      <CollectionDraftBuilder
        festivalId={resolvedFestivalId}
        repositoryCollections={collections}
        discoveryDrafts={discoveryDrafts}
        drafts={drafts}
        onSaveDrafts={onSaveDrafts}
      />
    )
  }

  return (
    <>
      <ModuleHeader
        title="Collection Management"
        status="READ ONLY"
        copy="Collection membership is displayed from the configured festival catalog. Cross-festival references are rejected by the collection engine."
      />
      {!festivalIdOverride && (
        <FestivalFilter
          festivals={festivals}
          value={festivalId}
          onChange={(value) => {
            setFestivalId(value)
            setSelectedId('')
          }}
        />
      )}
      {selected ? (
        <DetailPanel title={selected.name} onClose={() => setSelectedId('')}>
          <Definition label="Festival ID" value={selected.festivalId} />
          <Definition label="Discoveries required" value={selected.discoveryIds.length} />
          <Definition label="Included discoveries" value={selected.discoveryIds.join(', ') || 'None'} />
          <Definition label="Reward" value={selected.reward || 'No configured reward'} />
          <Definition label="Publishing" value={selected.published ? 'Published' : 'Draft'} />
        </DetailPanel>
      ) : (
        <div className="admin-console__record-list">
          {collections.map((collection) => (
            <RecordButton
              key={collection.id}
              title={collection.name}
              meta={`${collection.discoveryIds.length} discoveries required`}
              status={collection.published ? 'PUBLISHED' : 'DRAFT'}
              onClick={() => setSelectedId(collection.id)}
            />
          ))}
          {!collections.length && <EmptyState copy="No collections are configured for this festival." />}
        </div>
      )}
    </>
  )
}

const EMPTY_DISCOVERY_DRAFT = {
  id: '',
  originalId: '',
  title: '',
  description: '',
  location: '',
  latitude: '',
  longitude: '',
  category: '',
  rarity: '',
  claimMethod: '',
  xp: '0',
  hidden: false,
  active: true,
  image: '',
}

function createDraftId(prefix, title) {
  const slug = String(title || 'draft')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return `${prefix}-${slug}-${Date.now()}`
}

function DiscoveryDraftBuilder({
  festivalId,
  repositoryDiscoveries,
  drafts,
  onSaveDrafts,
}) {
  const [input, setInput] = useState(EMPTY_DISCOVERY_DRAFT)
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(null)
  const update = (field, value) =>
    setInput((current) => ({ ...current, [field]: value }))
  const save = (event) => {
    event.preventDefault()
    const candidate = {
      ...input,
      id: input.id || createDraftId('tomorrowland', input.title),
      festivalId,
      xp: Number(input.xp),
      sourceType: 'backstage-local-draft',
      unsynced: true,
    }
    const validation = validateDiscoveryDraft(candidate, drafts, festivalId)
    setErrors(validation.errors)
    if (!validation.valid) return
    const next = input.originalId
      ? drafts.map((draft) =>
          draft.id === input.originalId ? candidate : draft
        )
      : [...drafts, candidate]
    onSaveDrafts(next)
    setInput(EMPTY_DISCOVERY_DRAFT)
    setPreview(candidate)
  }
  const edit = (draft) =>
    setInput({
      ...EMPTY_DISCOVERY_DRAFT,
      ...draft,
      originalId: draft.id,
      xp: String(draft.xp),
    })

  return (
    <section className="admin-console__draft-builder">
      <ModuleHeader
        title="Tomorrowland Discovery Builder"
        status="LOCAL DRAFT"
        copy="Drafts are festival-scoped, stored locally, and never supplied to attendee Radar."
      />
      <div className="admin-console__draft-flags">
        <Badge>LOCAL DRAFT</Badge><Badge>NOT SYNCED</Badge>
      </div>
      <p>Repository discoveries: {repositoryDiscoveries.length}</p>
      <p>Local draft discoveries: {drafts.filter((draft) => !draft.archived).length}</p>
      <div className="admin-console__builder-layout">
        <form className="admin-console__builder-form" onSubmit={save}>
          <BuilderField label="Title" required error={errors.title}>
            <input value={input.title} onChange={(event) => update('title', event.target.value)} />
          </BuilderField>
          <BuilderField label="Description">
            <textarea rows="3" value={input.description} onChange={(event) => update('description', event.target.value)} />
          </BuilderField>
          <BuilderField label="Location name" required error={errors.location}>
            <input value={input.location} onChange={(event) => update('location', event.target.value)} />
          </BuilderField>
          <BuilderField label="Latitude" error={errors.latitude}>
            <input type="number" step="any" value={input.latitude} onChange={(event) => update('latitude', event.target.value)} />
          </BuilderField>
          <BuilderField label="Longitude" error={errors.longitude}>
            <input type="number" step="any" value={input.longitude} onChange={(event) => update('longitude', event.target.value)} />
          </BuilderField>
          <BuilderField label="Category" required error={errors.category}>
            <select value={input.category} onChange={(event) => update('category', event.target.value)}>
              <option value="">Select category</option>
              {['stage', 'experience', 'community', 'art', 'landmark', 'event', 'journey'].map((value) => <option key={value}>{value}</option>)}
            </select>
          </BuilderField>
          <BuilderField label="Rarity" required error={errors.rarity}>
            <select value={input.rarity} onChange={(event) => update('rarity', event.target.value)}>
              <option value="">Select rarity</option>
              {['common', 'uncommon', 'rare', 'epic', 'legendary'].map((value) => <option key={value}>{value}</option>)}
            </select>
          </BuilderField>
          <BuilderField label="Claim method" required error={errors.claimMethod}>
            <select value={input.claimMethod} onChange={(event) => update('claimMethod', event.target.value)}>
              <option value="">Select claim method</option>
              {['gps', 'qr', 'nfc', 'admin-test'].map((value) => <option key={value}>{value}</option>)}
            </select>
          </BuilderField>
          <BuilderField label="XP reward" required error={errors.xp}>
            <input type="number" min="0" value={input.xp} onChange={(event) => update('xp', event.target.value)} />
          </BuilderField>
          <BuilderField label="Optional image reference">
            <input value={input.image} onChange={(event) => update('image', event.target.value)} />
          </BuilderField>
          <label><input type="checkbox" checked={input.hidden} onChange={(event) => update('hidden', event.target.checked)} /> Hidden until discovered</label>
          <label><input type="checkbox" checked={input.active} onChange={(event) => update('active', event.target.checked)} /> Active</label>
          <button className="admin-console__primary-button" type="submit">SAVE LOCAL DRAFT</button>
        </form>
        <aside className="admin-console__draft-preview">
          <h2>PREVIEW</h2>
          {preview ? (
            <>
              <strong>{preview.title}</strong>
              <p>{preview.description || 'No description provided.'}</p>
              <p>{preview.location} · {preview.rarity} · {preview.category}</p>
            </>
          ) : <p>Save or select a draft to preview it.</p>}
          <div className="admin-console__draft-list">
            {drafts.map((draft) => (
              <article key={draft.id}>
                <strong>{draft.title}</strong>
                <span>{draft.archived ? 'ARCHIVED' : 'LOCAL DRAFT · NOT SYNCED'}</span>
                <button type="button" onClick={() => { edit(draft); setPreview(draft) }}>EDIT / PREVIEW</button>
                <button type="button" onClick={() => onSaveDrafts(drafts.map((item) => item.id === draft.id ? { ...item, archived: true } : item))}>ARCHIVE</button>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}

const EMPTY_COLLECTION_DRAFT = {
  id: '',
  originalId: '',
  name: '',
  description: '',
  requiredDiscoveryIds: [],
  optionalDiscoveryIds: [],
  completionRequirement: 'all-required',
  xp: '0',
  badgeReward: '',
  passportStampReward: '',
  hiddenUnlockDescription: '',
  active: true,
}

function normalizeCollectionDraft(draft = {}) {
  return {
    ...EMPTY_COLLECTION_DRAFT,
    ...draft,
    requiredDiscoveryIds: Array.isArray(draft.requiredDiscoveryIds)
      ? [...draft.requiredDiscoveryIds]
      : Array.isArray(draft.discoveryIds)
        ? [...draft.discoveryIds]
        : [],
    optionalDiscoveryIds: Array.isArray(draft.optionalDiscoveryIds)
      ? [...draft.optionalDiscoveryIds]
      : [],
    originalId: draft.id || '',
    xp: String(draft.xp ?? 0),
  }
}

function CollectionDraftBuilder({
  festivalId,
  repositoryCollections,
  discoveryDrafts,
  drafts,
  onSaveDrafts,
}) {
  const [input, setInput] = useState(EMPTY_COLLECTION_DRAFT)
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(null)
  const activeDiscoveries = discoveryDrafts.filter(
    (draft) => !draft.archived && draft.festivalId === festivalId
  )
  const activeDrafts = drafts.filter((draft) => !draft.archived)
  const archivedDrafts = drafts.filter((draft) => draft.archived)
  const discoveryById = new Map(
    activeDiscoveries.map((discovery) => [discovery.id, discovery])
  )
  const update = (field, value) =>
    setInput((current) => ({ ...current, [field]: value }))
  const selectDiscovery = (listName, discoveryId, selected) => {
    const otherList =
      listName === 'requiredDiscoveryIds'
        ? 'optionalDiscoveryIds'
        : 'requiredDiscoveryIds'
    setInput((current) => ({
      ...current,
      [listName]: selected
        ? [...current[listName], discoveryId]
        : current[listName].filter((id) => id !== discoveryId),
      [otherList]: selected
        ? current[otherList].filter((id) => id !== discoveryId)
        : current[otherList],
    }))
  }
  const moveDiscovery = (listName, discoveryId, direction) => {
    setInput((current) => {
      const next = [...current[listName]]
      const index = next.indexOf(discoveryId)
      const destination = index + direction
      if (index < 0 || destination < 0 || destination >= next.length) {
        return current
      }
      ;[next[index], next[destination]] = [next[destination], next[index]]
      return { ...current, [listName]: next }
    })
  }
  const editDraft = (draft) => {
    setInput(normalizeCollectionDraft(draft))
    setErrors({})
    setPreview(draft)
  }
  const save = (event) => {
    event.preventDefault()
    const candidate = {
      ...input,
      id: input.id || createDraftId('tomorrowland-collection', input.name),
      festivalId,
      xp: Number(input.xp),
      sourceType: 'backstage-local-draft',
      unsynced: true,
      archived: false,
    }
    const validation = validateCollectionDraft(
      candidate,
      discoveryDrafts,
      festivalId
    )
    setErrors(validation.errors)
    if (!validation.valid) return
    const next = input.originalId
      ? drafts.map((draft) =>
          draft.id === input.originalId ? candidate : draft
        )
      : [...drafts, candidate]
    onSaveDrafts(next)
    setInput({ ...EMPTY_COLLECTION_DRAFT })
    setPreview(candidate)
  }

  const renderSelectedDiscoveries = (listName, label) => (
    <ol
      className="admin-console__selected-discoveries"
      aria-label={`${label} discovery order`}
      aria-live="polite"
    >
      {input[listName].map((discoveryId, index) => (
        <li key={discoveryId}>
          <span>
            {index + 1}. {discoveryById.get(discoveryId)?.title || discoveryId}
          </span>
          <div>
            <button
              type="button"
              onClick={() => moveDiscovery(listName, discoveryId, -1)}
              disabled={index === 0}
              aria-label={`Move ${discoveryById.get(discoveryId)?.title || discoveryId} up`}
            >
              MOVE UP
            </button>
            <button
              type="button"
              onClick={() => moveDiscovery(listName, discoveryId, 1)}
              disabled={index === input[listName].length - 1}
              aria-label={`Move ${discoveryById.get(discoveryId)?.title || discoveryId} down`}
            >
              MOVE DOWN
            </button>
            <button
              type="button"
              onClick={() => selectDiscovery(listName, discoveryId, false)}
              aria-label={`Remove ${discoveryById.get(discoveryId)?.title || discoveryId} from ${label.toLowerCase()}`}
            >
              REMOVE
            </button>
          </div>
        </li>
      ))}
    </ol>
  )

  const previewIds = preview
    ? normalizeCollectionDraft(preview)
    : null

  return (
    <section className="admin-console__draft-builder">
      <ModuleHeader title="Tomorrowland Collection Builder" status="LOCAL DRAFT" copy="Collections may reference only valid Tomorrowland discovery drafts." />
      <div className="admin-console__draft-flags"><Badge>LOCAL DRAFT</Badge><Badge>NOT SYNCED</Badge></div>
      <p>Repository collections: {repositoryCollections.length}</p>
      <p>Local draft collections: {activeDrafts.length}</p>
      <div className="admin-console__builder-layout">
        <form className="admin-console__builder-form" onSubmit={save}>
          <BuilderField label="Collection name" required error={errors.name}>
            <input value={input.name} onChange={(event) => update('name', event.target.value)} />
          </BuilderField>
          <BuilderField label="Description">
            <textarea rows="3" value={input.description} onChange={(event) => update('description', event.target.value)} />
          </BuilderField>
          <fieldset>
            <legend>Required discovery drafts *</legend>
            {activeDiscoveries.map((discovery) => (
              <label key={discovery.id}>
                <input
                  type="checkbox"
                  checked={input.requiredDiscoveryIds.includes(discovery.id)}
                  onChange={(event) =>
                    selectDiscovery(
                      'requiredDiscoveryIds',
                      discovery.id,
                      event.target.checked
                    )
                  }
                />
                {discovery.title}
              </label>
            ))}
            {!activeDiscoveries.length && <p>No Tomorrowland discovery drafts are available yet.</p>}
            {renderSelectedDiscoveries('requiredDiscoveryIds', 'Required')}
            {errors.requiredDiscoveryIds && <small role="alert">{errors.requiredDiscoveryIds}</small>}
            {errors.discoveryIds && <small role="alert">{errors.discoveryIds}</small>}
          </fieldset>
          <fieldset>
            <legend>Optional discovery drafts</legend>
            {activeDiscoveries.map((discovery) => (
              <label key={discovery.id}>
                <input
                  type="checkbox"
                  checked={input.optionalDiscoveryIds.includes(discovery.id)}
                  onChange={(event) =>
                    selectDiscovery(
                      'optionalDiscoveryIds',
                      discovery.id,
                      event.target.checked
                    )
                  }
                />
                {discovery.title}
              </label>
            ))}
            {renderSelectedDiscoveries('optionalDiscoveryIds', 'Optional')}
          </fieldset>
          <BuilderField label="Completion requirement" required error={errors.completionRequirement}>
            <select value={input.completionRequirement} onChange={(event) => update('completionRequirement', event.target.value)}>
              <option value="all-required">Collect all required discoveries</option>
            </select>
          </BuilderField>
          <BuilderField label="XP reward" required error={errors.xp}>
            <input type="number" min="0" value={input.xp} onChange={(event) => update('xp', event.target.value)} />
          </BuilderField>
          <BuilderField label="Badge reward">
            <input value={input.badgeReward} onChange={(event) => update('badgeReward', event.target.value)} />
          </BuilderField>
          <BuilderField label="Passport stamp reward">
            <input value={input.passportStampReward} onChange={(event) => update('passportStampReward', event.target.value)} />
          </BuilderField>
          <BuilderField label="Hidden unlock description">
            <textarea rows="3" value={input.hiddenUnlockDescription} onChange={(event) => update('hiddenUnlockDescription', event.target.value)} />
          </BuilderField>
          <BuilderField label="Status">
            <select value={input.active ? 'active' : 'inactive'} onChange={(event) => update('active', event.target.value === 'active')}>
              <option value="active">ACTIVE</option>
              <option value="inactive">INACTIVE</option>
            </select>
          </BuilderField>
          <button className="admin-console__primary-button" type="submit">SAVE LOCAL DRAFT</button>
        </form>
        <aside className="admin-console__draft-preview">
          <h2>PREVIEW</h2>
          {preview && previewIds ? (
            <div className="admin-console__collection-preview">
              <strong>{preview.name}</strong>
              <p>{preview.description || 'No description provided.'}</p>
              <dl>
                <dt>Required discoveries</dt>
                <dd>{previewIds.requiredDiscoveryIds.map((id) => discoveryById.get(id)?.title || id).join(', ') || 'None'}</dd>
                <dt>Optional discoveries</dt>
                <dd>{previewIds.optionalDiscoveryIds.map((id) => discoveryById.get(id)?.title || id).join(', ') || 'None'}</dd>
                <dt>Completion requirement</dt>
                <dd>{preview.completionRequirement === 'all-required' ? 'Collect all required discoveries' : preview.completionRequirement}</dd>
                <dt>XP reward</dt><dd>{preview.xp}</dd>
                <dt>Badge reward</dt><dd>{preview.badgeReward || 'Not provided'}</dd>
                <dt>Passport stamp reward</dt><dd>{preview.passportStampReward || 'Not provided'}</dd>
                <dt>Hidden unlock description</dt><dd>{preview.hiddenUnlockDescription || 'Not provided'}</dd>
                <dt>Status</dt><dd>{preview.active ? 'ACTIVE' : 'INACTIVE'}</dd>
              </dl>
              <Badge>LOCAL DRAFT · NOT SYNCED</Badge>
            </div>
          ) : <p>Save or select a draft to preview it.</p>}
          <h3>ACTIVE COLLECTIONS</h3>
          <div className="admin-console__draft-list">
            {activeDrafts.map((draft) => (
              <article key={draft.id}>
                <strong>{draft.name}</strong>
                <span>LOCAL DRAFT · NOT SYNCED</span>
                <button type="button" onClick={() => editDraft(draft)}>EDIT / PREVIEW</button>
                <button type="button" aria-label={`Archive ${draft.name}`} onClick={() => onSaveDrafts(archiveCollectionDraft(drafts, draft.id))}>ARCHIVE</button>
              </article>
            ))}
            {!activeDrafts.length && <p>No active collection drafts.</p>}
          </div>
          <h3>ARCHIVED COLLECTIONS</h3>
          <div className="admin-console__draft-list">
            {archivedDrafts.map((draft) => (
              <article key={draft.id}>
                <strong>{draft.name}</strong>
                <span>ARCHIVED · LOCAL DRAFT · NOT SYNCED</span>
                <button type="button" onClick={() => { setPreview(draft) }}>PREVIEW</button>
                <button type="button" aria-label={`Restore ${draft.name}`} onClick={() => onSaveDrafts(restoreCollectionDraft(drafts, draft.id))}>RESTORE</button>
              </article>
            ))}
            {!archivedDrafts.length && <p>No archived collection drafts.</p>}
          </div>
        </aside>
      </div>
    </section>
  )
}

function UserManagement() {
  return (
    <>
      <ModuleHeader
        title="User Management"
        status="BACKEND REQUIRED"
        copy="A secure server-side admin endpoint is required to list or search users. The browser client does not receive privileged server credentials or private authentication records."
      />
      <EmptyState copy="User management is unavailable until the secure admin backend is configured." />
    </>
  )
}

function BroadcastManagement({ festivals }) {
  const [input, setInput] = useState({
    title: '',
    message: '',
    festivalId: festivals[0]?.id || '',
    audience: 'all-users',
  })
  const [draft, setDraft] = useState(null)

  const update = (field, value) =>
    setInput((current) => ({ ...current, [field]: value }))

  return (
    <>
      <ModuleHeader
        title="Broadcast Management"
        status="READY"
        copy="Prepare and preview a local draft. No notification is sent and no server record is created."
      />
      <form
        className="admin-console__form"
        onSubmit={(event) => {
          event.preventDefault()
          setDraft(createBroadcastDraft(input))
        }}
      >
        <label>
          Title
          <input required value={input.title} onChange={(event) => update('title', event.target.value)} />
        </label>
        <label>
          Message
          <textarea required rows="4" value={input.message} onChange={(event) => update('message', event.target.value)} />
        </label>
        <label>
          Target festival
          <select required value={input.festivalId} onChange={(event) => update('festivalId', event.target.value)}>
            <option value="">Select festival</option>
            {festivals.map((festival) => (
              <option key={festival.id} value={festival.id}>{festival.name}</option>
            ))}
          </select>
        </label>
        <label>
          Target audience
          <select value={input.audience} onChange={(event) => update('audience', event.target.value)}>
            <option value="all-users">All users</option>
            <option value="festival-attendees">Festival attendees</option>
            <option value="active-journey-users">Active journey users</option>
          </select>
        </label>
        <button className="admin-console__primary-button" type="submit">
          PREVIEW DRAFT
        </button>
      </form>
      {draft && (
        <aside className="admin-console__broadcast-preview" aria-label="Broadcast preview">
          <span>NOT SENT</span>
          <h2>{draft.title}</h2>
          <p>{draft.message}</p>
          <dl>
            <Definition label="Festival" value={festivals.find((festival) => festival.id === draft.festivalId)?.name || draft.festivalId} />
            <Definition label="Audience" value={draft.audience.replaceAll('-', ' ')} />
          </dl>
        </aside>
      )}
    </>
  )
}

function ModuleHeader({ title, status, copy }) {
  return (
    <header className="admin-console__module-header">
      <span>{status}</span>
      <h1 id="admin-module-title">{title}</h1>
      <p>{copy}</p>
    </header>
  )
}

function FestivalFilter({ festivals, value, onChange }) {
  return (
    <label className="admin-console__filter">
      Festival
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Select festival</option>
        {festivals.map((festival) => (
          <option key={festival.id} value={festival.id}>{festival.name}</option>
        ))}
      </select>
    </label>
  )
}

function RecordButton({ title, meta, status, onClick }) {
  return (
    <button type="button" className="admin-console__record-button" onClick={onClick}>
      <span>
        <strong>{title}</strong>
        <small>{meta}</small>
      </span>
      <em>{status}</em>
    </button>
  )
}

function DetailPanel({ title, backLabel = 'BACK TO LIST', onClose, children }) {
  return (
    <article className="admin-console__detail">
      <header>
        <h2>{title}</h2>
        {onClose && (
          <button type="button" onClick={onClose}>{backLabel}</button>
        )}
      </header>
      <dl>{children}</dl>
    </article>
  )
}

function Definition({ label, value }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{String(value)}</dd>
    </div>
  )
}

function EmptyState({ copy }) {
  return <p className="admin-console__empty">{copy}</p>
}

const styles = {
  console: {
    width: '100%',
    boxSizing: 'border-box',
    padding: 'clamp(16px, 4vw, 28px)',
    border: '1px solid rgba(241,189,99,.35)',
    borderRadius: 22,
    color: '#f8fbff',
    background:
      'linear-gradient(150deg, rgba(8,13,13,.98), rgba(18,15,12,.98))',
  },
  header: { marginBottom: 20 },
  eyebrow: {
    display: 'block',
    marginBottom: 7,
    color: '#f1bd63',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: '.16em',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(25px, 7vw, 42px)',
    lineHeight: 1,
  },
  signedIn: { margin: '12px 0 0', color: 'rgba(255,255,255,.76)' },
  copy: { fontSize: 16, lineHeight: 1.55, color: 'rgba(255,255,255,.76)' },
  statusBar: {
    marginTop: 20,
    paddingTop: 14,
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px 16px',
    borderTop: '1px solid rgba(255,255,255,.12)',
    color: 'rgba(255,255,255,.58)',
    fontSize: 11,
    fontWeight: 800,
  },
  primaryButton: {
    width: '100%',
    minHeight: 48,
    padding: 13,
    border: 0,
    borderRadius: 14,
    color: '#171109',
    background: '#f1bd63',
    fontWeight: 900,
  },
  secondaryButton: {
    width: '100%',
    minHeight: 48,
    padding: 13,
    border: '1px solid rgba(241,189,99,.5)',
    borderRadius: 14,
    color: '#fff',
    background: 'rgba(241,189,99,.1)',
    fontWeight: 900,
  },
}
