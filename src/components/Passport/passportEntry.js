export function createPassportEditorSession({
  country = '',
  raveName = '',
  bookOpen = false,
  pageIndex = null,
  afterSaveSectionId = null,
  authenticatedWelcome = false,
} = {}) {
  return {
    original: { country, raveName },
    draft: { country, raveName },
    origin: { bookOpen: Boolean(bookOpen), pageIndex },
    afterSaveSectionId,
    authenticatedWelcome: Boolean(authenticatedWelcome),
  }
}

export function updatePassportEditorDraft(session, changes = {}) {
  return { ...session, draft: { ...session.draft, ...changes } }
}

export function cancelPassportEditor(session) {
  return { values: { ...session.original }, origin: { ...session.origin } }
}

export function completePassportEditor(session) {
  return { values: { ...session.draft }, origin: { ...session.origin } }
}

export function isPassportContentInteractive(isEditing) {
  return !isEditing
}

export function getPassportPresentationMode({ isEditingPassport = false, bookOpen = false } = {}) {
  if (isEditingPassport) return 'editor'
  return bookOpen ? 'passport' : 'dashboard'
}

export function isPassportProfileComplete({ country, raveName } = {}) {
  return Boolean(String(country || '').trim() && String(raveName || '').trim())
}

export function getOpenPassportIntent(profile) {
  return isPassportProfileComplete(profile) ? 'journey' : 'setup'
}

export function getPassportEditorDestination(session, saved = false) {
  if (saved && session?.afterSaveSectionId) {
    return { bookOpen: true, pageIndex: null, sectionId: session.afterSaveSectionId }
  }
  return { ...session.origin, sectionId: null }
}
