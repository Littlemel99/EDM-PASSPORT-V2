import './passportPrimaryActions.css'

export default function PassportPrimaryActions({ onOpenPassport, onEditPassport }) {
  return (
    <section className="passport-primary-actions" aria-label="Passport actions">
      <button type="button" className="passport-primary-actions__open" aria-label="Open festival passport" onClick={onOpenPassport}>
        OPEN PASSPORT
      </button>
      <button type="button" className="passport-primary-actions__edit" onClick={onEditPassport}>
        EDIT PASSPORT PROFILE
      </button>
    </section>
  )
}
