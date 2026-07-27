import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { ADMIN_MODULES } from './adminModuleData.js'

const source = readFileSync(
  new URL('./AdminConsole.jsx', import.meta.url),
  'utf8'
)
const appSource = readFileSync(
  new URL('../../App.jsx', import.meta.url),
  'utf8'
)

test('Admin Console exposes all V1 placeholder modules', () => {
  const modules = [
    'Festivals',
    'Discoveries',
    'Collections',
    'Users',
    'Crews',
    'Passport Templates',
    'QR / NFC',
    'Broadcasts',
    'Analytics',
    'Moderation',
    'Settings',
  ]
  assert.deepEqual(ADMIN_MODULES, modules)
  assert.match(source, /No management tools configured yet/)
  assert.match(source, /RETURN TO BACKSTAGE/)
})

test('Backstage renders workflow identity and compact developer footer', () => {
  for (const label of [
    'EDM PASSPORT BACKSTAGE',
    'Festival Operations Center',
    'Signed in as:',
    'Development Environment',
    'Backstage V1',
    'Adventure Passport Branch',
  ]) {
    assert.match(source, new RegExp(label))
  }
  assert.doesNotMatch(source, /CURRENT ACTIVE USERS/)
  assert.doesNotMatch(source, /CURRENT FESTIVAL/)
  assert.doesNotMatch(source, /SYSTEM STATUS/)
})

test('unauthorized Admin Console renders Access Denied', () => {
  assert.match(source, /if \(!authorized\)/)
  assert.match(source, /ACCESS DENIED/)
  assert.match(source, /RETURN TO DASHBOARD/)
})

test('Admin module cards use accessible touch-sized buttons', () => {
  assert.match(source, /type="button"/)
  assert.match(source, /className="admin-console__module-card"/)
  assert.match(source, /aria-label=\{group\.label\}/)
})

test('Admin layout uses compact responsive grids without overflow', () => {
  const css = readFileSync(
    new URL('./adminConsole.css', import.meta.url),
    'utf8'
  )

  assert.match(
    css,
    /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/
  )
  assert.match(css, /@media \(max-width: 800px\)/)
  assert.match(
    css,
    /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/
  )
  assert.match(css, /@media \(max-width: 599px\)/)
  assert.match(css, /min-width:\s*0/)
  assert.match(css, /overflow-wrap:\s*anywhere/)
  assert.match(css, /min-height:\s*56px/)
  assert.match(css, /:focus-visible/)
})

test('five V1 management modules have real module screens', () => {
  for (const title of [
    'Festival Library',
    'Discovery Management',
    'Collection Management',
    'User Management',
    'Broadcast Management',
  ]) {
    assert.match(source, new RegExp(title))
  }
  assert.match(source, /getAdminModuleStatus\(module\)/)
  assert.match(source, /PREVIEW DRAFT/)
  assert.match(source, /NOT SENT/)
})

test('Backstage Home uses Continue Building and grouped workflows', () => {
  const moduleDataSource = readFileSync(
    new URL('./adminModuleData.js', import.meta.url),
    'utf8'
  )
  for (const label of [
    'CONTINUE BUILDING',
    'SELECT A FESTIVAL TO BEGIN',
    'OPEN FESTIVAL LIBRARY',
    'RESUME FESTIVAL',
    'VIEW ALL REQUIREMENTS',
    'FESTIVAL BUILDER',
    'OPERATIONS',
    'PLATFORM',
  ]) {
    assert.match(`${source}\n${moduleDataSource}`, new RegExp(label))
  }
  assert.doesNotMatch(source, /aria-label="Admin modules"/)
  assert.match(source, /workspaceFestivalId/)
  assert.doesNotMatch(source, /setSelectedFestivalId/)
})

test('permanent Backstage navigation returns to Home without clearing workspace selection', () => {
  assert.match(appSource, /adminHomeRequestToken/)
  assert.match(
    appSource,
    /setAdminHomeRequestToken\(\(token\) => token \+ 1\)/
  )
  assert.match(source, /homeRequestToken = 0/)
  assert.match(
    source,
    /moduleSelection\.homeRequestToken === homeRequestToken/
  )
  assert.doesNotMatch(
    source,
    /setWorkspaceFestivalId\(''\)/
  )
})

test('festival-scoped management controls remain accessible at narrow widths', () => {
  const css = readFileSync(
    new URL('./adminConsole.css', import.meta.url),
    'utf8'
  )
  assert.match(source, /<FestivalFilter/)
  assert.match(source, /className="admin-console__record-button"/)
  assert.match(css, /\.admin-console__record-button[\s\S]*min-width:\s*0/)
  assert.match(css, /\.admin-console__record-button[\s\S]*min-height:\s*58px/)
  assert.match(css, /\.admin-console__form[\s\S]*min-width:\s*0/)
  assert.match(css, /overflow-wrap:\s*anywhere/)
})

test('Festival Library exposes operational filters, workspace, and summary', () => {
  for (const label of [
    'PRODUCTION FESTIVALS',
    'TEST / UNKNOWN FESTIVALS',
    'MANAGE',
    'RETURN TO LIBRARY',
    'FESTIVAL WORKSPACE',
    'Festival ID',
    'Edition ID',
    'Data source',
    'MISSING CONFIGURATION',
    'STATUS NOT SET',
  ]) {
    assert.match(source, new RegExp(label))
  }
})

test('Festival Management uses a responsive semantic table and mobile rows', () => {
  const css = readFileSync(
    new URL('./adminConsole.css', import.meta.url),
    'utf8'
  )
  assert.match(css, /container-type:\s*inline-size/)
  assert.match(source, /<table className="admin-console__festival-table">/)
  assert.match(source, /<th scope="col">Festival<\/th>/)
  assert.match(source, /<th scope="col">Action<\/th>/)
  assert.match(css, /@media \(min-width: 800px\)/)
  assert.match(css, /\.admin-console__festival-table-wrap[\s\S]*display:\s*none/)
  assert.match(css, /\.admin-console__festival-mobile-list[\s\S]*display:\s*grid/)
  assert.match(
    css,
    /@media \(min-width: 800px\)[\s\S]*\.admin-console__festival-table-wrap[\s\S]*display:\s*block[\s\S]*\.admin-console__festival-mobile-list[\s\S]*display:\s*none/
  )
  assert.doesNotMatch(
    css,
    /\.admin-console__festival-table-wrap[\s\S]*max-height:/
  )
  assert.match(source, /aria-pressed=\{filter === value\}/)
  assert.match(css, /\.admin-console__festival-table button[\s\S]*min-height:\s*44px/)
  assert.match(css, /\.admin-console__festival-row > button:focus-visible/)
  assert.match(appSource, /styles\.adminShell/)
  assert.match(appSource, /maxWidth:\s*1240/)
})

test('Festival rows keep readable terminology and configured counts', () => {
  for (const wording of [
    'STATUS NOT SET',
    'UPCOMING',
    'COMPLETED',
    'UNAVAILABLE',
    'configured',
  ]) {
    assert.match(
      `${source}\n${readFileSync(new URL('./adminModuleData.js', import.meta.url), 'utf8')}`,
      new RegExp(wording)
    )
  }
  assert.doesNotMatch(source, />UNKNOWN</)
  const css = readFileSync(
    new URL('./adminConsole.css', import.meta.url),
    'utf8'
  )
  assert.match(css, /\.admin-console__festival-row h2[\s\S]*overflow-wrap:\s*normal/)
  assert.match(css, /word-break:\s*normal/)
})

test('Festival Library exposes labeled search and compact table columns', () => {
  assert.match(source, /Search festivals/)
  assert.match(source, /placeholder="Name, location, or year"/)
  for (const column of [
    'Festival',
    'Year',
    'Lifecycle',
    'Publish Status',
    'Discoveries',
    'Collections',
    'Action',
  ]) {
    assert.match(source, new RegExp(`<th scope="col">${column}</th>`))
  }
  assert.match(source, /admin-console__festival-mobile-list/)
  assert.match(source, /MANAGE/)
  assert.match(source, /tabIndex="0"/)
  assert.match(source, /onClick=\{\(\) => onOpen\(festival\.id\)\}/)
  assert.match(source, /event\.key === 'Enter' \|\| event\.key === ' '/)
})

test('Festival Workspace exposes scoped management tabs and honest states', () => {
  for (const label of [
    'Overview',
    'Discoveries',
    'Collections',
    'QR / NFC',
    'Schedule',
    'Publishing',
    'Analytics',
    'Settings',
    'BACKEND REQUIRED',
    'Tomorrowland Schedule Builder',
    'ANALYTICS BACKEND REQUIRED',
  ]) {
    assert.match(source, new RegExp(label.replace('/', '\\/')))
  }
  assert.match(source, /festivalIdOverride=\{festival\.id\}/)
  assert.match(source, /aria-current=\{activeTab === id/)
  assert.match(source, /onReturnToBackstage/)
  assert.doesNotMatch(source, /setSelectedFestivalId/)
})

test('Tomorrowland builders are honest local drafts with no publish action', () => {
  for (const label of [
    'Festival Information',
    'Tomorrowland Discovery Builder',
    'Tomorrowland Collection Builder',
    'LOCAL DRAFT',
    'NOT SYNCED',
    'READY FOR LOCAL TESTING',
    'NOT READY FOR LOCAL TESTING',
    'NOT READY FOR PRODUCTION',
    'SAVE LOCAL DRAFT',
  ]) {
    assert.match(source, new RegExp(label))
  }
  assert.doesNotMatch(source, />PUBLISH<\/button>/)
  assert.match(appSource, /adminUserId=\{user\.id\}/)
  assert.doesNotMatch(
    readFileSync(
      new URL('../../festivals/festivalDiscoveries.js', import.meta.url),
      'utf8'
    ),
    /backstageDraft/
  )
})

test('Tomorrowland collection builder exposes scoped ordered drafts and reversible archive', () => {
  for (const label of [
    'Required discovery drafts',
    'Optional discovery drafts',
    'MOVE UP',
    'MOVE DOWN',
    'Badge reward',
    'Passport stamp reward',
    'Hidden unlock description',
    'ACTIVE COLLECTIONS',
    'ARCHIVED COLLECTIONS',
    'RESTORE',
    'LOCAL DRAFT · NOT SYNCED',
  ]) {
    assert.match(source, new RegExp(label.replace('/', '\\/')))
  }
  assert.match(
    source,
    /draft\.festivalId === festivalId/
  )
  assert.match(source, /archiveCollectionDraft/)
  assert.match(source, /restoreCollectionDraft/)
})

test('Tomorrowland Schedule Builder exposes scoped drafts and lifecycle actions', () => {
  for (const label of [
    'Tomorrowland Schedule Builder',
    'Default timezone',
    'Performer or activity',
    'Stage or location',
    'Linked discovery',
    'Linked collection',
    'ACTIVE SCHEDULE ITEMS',
    'ARCHIVED SCHEDULE ITEMS',
    'EDIT / PREVIEW',
    'DUPLICATE',
    'ARCHIVE',
    'RESTORE',
    'LOCAL DRAFT · NOT SYNCED',
  ]) {
    assert.match(source, new RegExp(label.replace('/', '\\/')))
  }
  assert.match(source, /draft\.festivalId === festival\.id/)
  assert.match(source, /validateScheduleDraft/)
  assert.match(source, /duplicateScheduleDraft/)
  assert.match(source, /ScheduleTimeField/)
  assert.match(source, /AM or PM/)
  assert.doesNotMatch(source, /type="time"/)
  assert.match(source, /Local Schedule Drafts/)
  assert.match(source, /Repository Schedule Items/)
})

test('Publishing Pipeline exposes honest review states and safe navigation only', () => {
  for (const label of [
    'Publishing Pipeline',
    'Repository discoveries',
    'Local draft discoveries',
    'Repository collections',
    'Local draft collections',
    'Repository schedule items',
    'Local draft schedule items',
    'UNSYNCED LOCAL DRAFTS',
    'SECURE PERSISTENCE',
    'PUBLISHING BACKEND',
    'LOCAL TESTING BLOCKERS',
    'PRODUCTION BLOCKERS',
    'Festival Information Changes',
    'Discovery Drafts',
    'Collection Drafts',
    'Schedule Drafts',
    'REVIEW FESTIVAL INFORMATION',
    'REVIEW DISCOVERIES',
    'REVIEW COLLECTIONS',
    'REVIEW SCHEDULE',
    'RETURN TO OVERVIEW',
    'RETURN TO LIBRARY',
    'RETURN TO BACKSTAGE',
  ]) {
    assert.match(source, new RegExp(label))
  }
  assert.doesNotMatch(source, />\s*PUBLISH\s*</)
  assert.doesNotMatch(source, />\s*SYNC\s*</)
  assert.match(source, /onOpenTab\('settings'\)/)
  assert.match(source, /onOpenTab\('discoveries'\)/)
  assert.match(source, /onOpenTab\('collections'\)/)
  assert.match(source, /onOpenTab\('overview'\)/)
})

test('Festival Workspace Overview exposes real status and quick navigation', () => {
  const overviewSource = `${source}\n${readFileSync(
    new URL('./adminModuleData.js', import.meta.url),
    'utf8'
  )}`
  for (const label of [
    'Festival Task Dashboard',
    'FESTIVAL READY',
    'CURRENT MILESTONE',
    'NEXT REQUIRED TASK',
    'CONTINUE',
    'BLOCKING ISSUES',
    'TESTING BLOCKERS',
    'PRODUCTION BLOCKERS',
    'BUILDER STEPS',
    'BACKEND SERVICES',
    'READINESS CHECKLIST',
    'EXPAND ALL',
    'COLLAPSE ALL',
    'MISSING CONFIGURATION',
    'VIEW FULL CHECKLIST',
    'OPEN DISCOVERIES',
    'OPEN COLLECTIONS',
    'OPEN SCHEDULE',
    'OPEN PUBLISHING',
    'OPEN ANALYTICS',
    'RETURN TO LIBRARY',
    'RETURN TO BACKSTAGE',
  ]) {
    assert.match(overviewSource, new RegExp(label.replace('/', '\\/')))
  }
  assert.match(source, /onClick=\{\(\) => onOpenTab\(tab\)\}/)
  assert.match(
    source,
    /onClick=\{\(\) => onOpenTab\(dashboard\.primaryTask\.tab\)\}/
  )
  assert.match(source, /key=\{`\$\{festival\.id\}-\$\{group\.label\}-\$\{checklistMode\}`\}/)
  assert.match(source, /festival\.dateLabel \|\| 'Dates not provided'/)
  assert.match(source, /festival\.timezone \|\| 'Timezone not provided'/)
  for (const fakeMetric of [
    'Revenue',
    'Engagement',
    'Last sync',
    'Health percentage',
    'Recently Completed Work',
    'Estimated Time',
  ]) {
    assert.doesNotMatch(source, new RegExp(fakeMetric, 'i'))
  }
  assert.match(source, /PREVIOUS STEP/)
  assert.match(source, /NEXT STEP/)
  assert.match(source, /builderTabOrder/)
})

test('Festival Library omits the redundant global Backstage return', () => {
  assert.match(source, /activeModule !== 'Festivals'/)
  assert.match(source, /RETURN TO LIBRARY/)
  assert.match(source, /RETURN TO BACKSTAGE/)
})

test('Festival summary uses compact status chips', () => {
  const css = readFileSync(
    new URL('./adminConsole.css', import.meta.url),
    'utf8'
  )
  assert.match(source, /FestivalStatusChip/)
  assert.match(css, /\.admin-console__festival-status-chip/)
  assert.match(css, /border-radius:\s*999px/)
})
