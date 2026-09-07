# First Passport Engineering Specification

**Status:** Approved current engineering source of truth.  
**Date:** 2026-08-08  
**Implementation authorization:** Authorized only for the synthetic-only First Passport engineering phase under Decisions 1–11, limited to an isolated writing-only prototype using synthetic data. No legacy reuse, production integration, provider commitment, deployment, recruitment, or real-user testing is authorized. Stop at any genuine unresolved founder choice.  
**Sources:** Approved Passport Bible; approved Polaris Foundation; approved Passport Experience Foundation; approved First Passport Experience Definition.

## Purpose and boundary

This specification defines the narrowest system required to test whether a person will preserve one meaningful memory from a festival they physically attended, save it privately in the correct festival chapter, and later return in a separate session because the memory still matters.

The complete approved journey is:

**Create Passport → Choose Festival → Festival Chapter → Preserve Memory → Review and Save → Festival Chapter → Passport Home on return → Festival Chapter → Saved Memory**

The required saved memory may contain writing, one photo, voice, or an ordered combination of those contribution types. Editing, adding after save, contribution removal, and memory removal are required lifecycle controls but are tested separately. A participant does not have to use them for the complete core journey to pass.

### Explicit exclusions

Do not build Community Relive; Personal or Shared Relive; Shared From Afar; Festival Hearts or Heart Relics; stamps or collectibles; NFC; QR claiming; social feeds; followers; public profiles; likes, comments, reactions, rankings, friends, crews, messaging, invitations, or reminders; public or selected-person audiences; automated movies; automated cross-user pattern learning; AI rewriting; non-attendee discovery; `I Explored`, `Shared With Me`, or `I Dream Of`; video capture; precise live location; or multiple-memory onboarding.

Excluded capabilities must not exist as first-test navigation, schema dependencies, or premature abstractions.

### Readiness classification

- **Required before Cohort 1:** necessary to expose 5–10 closely observed participants safely to the complete journey.
- **Required before Cohort 2:** necessary before 15–25 mostly unmoderated participants and before using results as primary validation evidence.
- **Deferred/not required for this test:** excluded from the First Passport Experience or safely handled manually throughout the Founding 100 test.

---

## 1. Product behavior

### 1.1 Global behavior — required before Cohort 1

- Mobile-first, readable, keyboard-operable, screen-reader-compatible, and usable without audio.
- One obvious primary action per step. Polaris asks no more than one question at a time.
- Every memory is private. The interface never implies it is public or shared.
- Every upload and save has a visible state. A local preview or local draft is never presented as saved.
- The system never rewrites, embellishes, diagnoses, or manufactures the user’s meaning.
- Destructive actions require clear confirmation and accurate removal language.

### 1.2 Screen 1 — Create Passport

**Purpose:** Establish one persistent, account-owned Passport.

**User actions — required before Cohort 1**

- Enter a name or chosen Passport name.
- Complete the selected authentication method.

**System responses — required before Cohort 1**

- Validate required fields without discarding entered values.
- Create exactly one Passport owned by the authenticated account.
- Confirm: **Your Passport is ready.**
- Continue to Choose Festival.
- Route an existing user to sign-in or recovery rather than creating a duplicate Passport.

**Failure and recovery — required before Cohort 1**

- Authentication or network failure preserves recoverable form state and states whether anything was created.
- Ordinary account recovery works without founder intervention.

**Not decided by this specification**

- Whether creating a Passport requires acceptance of terms or a privacy notice, and the exact text, versioning, jurisdiction, age, and gating behavior.
- These are blocking legal/product decisions before Cohort 1 if counsel or the approved operating policy determines they are required.
- Research consent is never bundled into ordinary account creation. If research consent is required, it is obtained separately from product access and stored outside the core product schema unless a legal requirement dictates otherwise.

### 1.3 Screen 2 — Choose Festival

**Purpose:** Select one specific festival occurrence and truthfully establish `I Experienced`.

**Required before Cohort 1**

- Search or choose a festival occurrence distinguishable by name and occurrence/year.
- Explicitly confirm physical attendance.
- Show only the small test catalog; missing occurrences may be requested through a manual support path.
- Do not create a chapter before attendance confirmation.
- Create or reuse exactly one account-owned `I Experienced` chapter for the occurrence, then open it.

**Polaris language**

> Choose a festival you physically attended.

Attendance is a user declaration. GPS, NFC, QR, tickets, and external verification are excluded.

### 1.4 Screen 3 — Festival Chapter

**Purpose:** Stable home for the user’s private memories from one festival occurrence.

**Required before Cohort 1**

- Show festival name, occurrence/year, and `I Experienced`.
- Show active memories owned by the signed-in account in one documented, consistent order.
- Empty state has one primary action: **Preserve a memory**.
- After save, show the new memory without refresh or a second save.
- Provide navigation to Passport Home.
- Open a saved memory.

Starting another memory after the core journey may be offered quietly but is not required for Cohort 1 or Cohort 2.

### 1.5 Screen 4 — Preserve Memory

**Purpose:** Capture one memory as an ordered collection of typed contributions.

**Opening Polaris prompt**

> What is one moment from **[Festival]** you never want to forget?

**Contribution types — required before Cohort 1**

1. **Writing:** non-whitespace user-authored text.
2. **Photo:** one active photo maximum per memory.
3. **Voice:** one or more audio contributions, subject to the approved duration, format, and size limits.

The first contribution may be any supported type. Each later contribution appends after existing active contributions. Arbitrary reordering is excluded.

**Enforceable one-photo rule**

- At every memory state—local draft, save request, database write, later addition, and edit—there may be at most one active contribution whose type is `photo`.
- The client disables adding another photo while one is active and offers replace or remove instead.
- The server/database rejects any command that would create more than one active photo for the same memory.
- Replacing a photo updates the existing photo contribution; it does not create a second active photo.
- Removed photo contributions do not count toward the maximum.

**Voice — required before implementation, with limits resolved first**

- Request microphone permission only after the user chooses voice.
- Clearly show start, recording, stop, playback, retry, and upload states.
- Preserve original audio when transcription is used.
- Transcript correction updates transcript text only, not original audio.
- Transcription failure does not destroy or prevent saving usable audio.

**Photo — required before implementation, with limits resolved first**

- Request camera/photo access only after the user chooses photo.
- Show preview, upload progress, retry, replace, and remove controls.
- Do not collect precise location metadata; apply the approved metadata-stripping rule.
- Reject files outside the approved, testable format, byte-size, dimension, and decoding limits with a recoverable message.

**Writing — required before Cohort 1**

- Preserve in-progress text in the selected local draft model.
- Never replace the user’s words with generated text.

**Optional Polaris follow-up**

After one valid contribution exists:

> What made that moment matter to you?

The user may answer, skip, or continue to review. Skipping never blocks completion.

### 1.6 Screen 5 — Review and Save

**Purpose:** Show exactly what will be stored, where, and with what privacy state before durable save.

**Required before Cohort 1**

- Show festival destination, `I Experienced`, all active contributions in stored order, usable preview/playback, **Private** status, and upload state.
- Allow return to capture, edit, or remove a contribution before save.
- Enable **Save memory** only when at least one valid contribution exists and every included media object has completed required validation and durable upload.
- One save command creates one logical memory. Retries are idempotent.
- Show success only after the database commit and media associations are durable and owner-correct.
- On success, open Festival Chapter and show the saved memory.
- On failure, remain on Review and Save, retain the local draft, explain the failure, and offer retry. Never show false success.

### 1.7 Screen 6 — Passport Home

**Purpose:** Let a returning authenticated user find the saved chapter in a separate session.

**Required before Cohort 1**

- Show Passport identity and only account-owned chapters.
- Make the recently created chapter immediately visible.
- Provide sign-out.
- In a fresh authenticated session, open Passport Home; opening the chapter shows the saved memory exactly as saved.
- A temporarily unavailable memory shows a recoverable error, not an empty state implying deletion.

### 1.8 Saved Memory view

**Required before Cohort 1**

- Display active contributions in stored order.
- Read writing, view photo, play audio, and view the transcript when present.
- Represent creation and last-updated times accurately.
- Return to chapter or home.

After the memory has been consumed, Polaris may ask:

> Does this still feel like a memory worth keeping?

Options: **Yes**, **Not sure**, **No**. The answer is validation data only and never changes, hides, or removes content.

**Required lifecycle controls, tested separately before Cohort 2**

- Add a contribution.
- Edit writing or transcript text.
- Replace the one photo.
- Remove a contribution.
- Remove the memory.

Optional continuation prompt after return:

> Is there anything you want to add now?

Options: **Add to this memory**, **Not today**. Neither option is required for core-journey completion.

### 1.9 Chosen draft model — local only

**Decision for this test:** Before final save, the draft exists only on the current supported device/browser and is labeled **Not yet saved to Passport**. There are no server-side draft memories or draft contributions.

**Required before Cohort 1**

- Store only the minimum local draft data needed to recover writing, contribution order, festival destination, and locally available media references supported by the platform.
- Clearly distinguish local draft, uploading, save failed, and durably saved.
- Recover the draft after refresh, accidental navigation, or short interruption on the same supported device/browser.
- Warn before leaving with unsaved work.
- Delete the matching local draft after confirmed durable save.
- Do not promise cross-device recovery.
- On sign-out, apply the approved local-draft handling rule; that rule is a blocking privacy decision before implementation.

Queued background server save is excluded. If offline, the user may continue only within proven local platform limits; final save requires connectivity and explicit user action.

### 1.10 Contribution lifecycle

- A memory contains an ordered sequence of typed contributions.
- `position` is assigned on creation and remains stable. New contributions append after the highest existing position.
- Editing retains contribution identity, position, and `created_at`; updates the current content/media reference and `last_updated`.
- No immutable contribution-version history is stored.
- Concurrent stale edits are rejected with refresh/retry; automatic merge is excluded.
- Removal marks the contribution removed with `removed_at`; active neighbors retain their positions.
- If the last active contribution is removed, ask whether the user intends to remove the memory.
- Memory removal hides it and its contributions from ordinary access, records `removed_at`, and excludes it from active-memory metrics.
- The product does not promise immediate erasure from backups unless the approved retention policy supports that promise.

---

## 2. Technical architecture

### 2.1 Minimum architecture

**Required before Cohort 1**

- Mobile-first web client for the six screens and supporting dialogs.
- Authentication service with persistent unique identity, secure session, sign-out, and recovery.
- Relational database for account ownership, festivals, chapters, saved memories, contributions, storage metadata, return-value responses, analytics, and staff-access audit.
- Private object storage for photo and voice; no public bucket URLs.
- Server-side authorization for every private read and write.
- Analytics sink separated from memory content.
- Operational logging that excludes private writing, transcripts, photos, and audio.

**Required before Cohort 2**

- Transcription adapter if transcription is retained for Cohort 2; audio remains usable without it.
- Automated monitoring for authorization anomalies, repeated save failures, missing object references, and integrity failures.

The known React/Vite/Supabase codebase may fit this shape, but this draft does not approve the stack. Repository and deployment inspection comes first.

### 2.2 Save and durability boundaries

**Required before Cohort 1**

- Text-only save creates the saved memory and its contributions atomically.
- Media uploads first enter a private temporary location, pass the approved validation, and are then atomically associated with the memory/contribution records. Orphaned temporary objects are cleaned up.
- A memory cannot become `saved` while an active media contribution references a missing, temporary, failed, or unvalidated object.
- Idempotency keys protect memory creation, contribution creation, and retryable save commands.
- Referential constraints prevent cross-owner chapter, memory, contribution, or object relationships.
- After a confirmed save, a read-after-write integrity check verifies record presence, contribution order, and media association before success is shown.

### 2.3 Session persistence

**Required before Cohort 1**

- Secure, expiring, refreshable authentication session appropriate to the selected platform.
- Sign-out invalidates the local authenticated session and blocks private cached views.
- Return acceptance uses a genuinely separate authenticated session, not back navigation.
- Authenticated server state and local unsaved draft state are visibly distinct.

### 2.4 Failure, recovery, backup, and restore

**Required before Cohort 1**

- Recoverable errors for authentication, festival loading, local-draft recovery, upload, save, playback, edit conflict, and removal.
- Failures never convert a local draft into a claimed saved memory.
- User-visible error references may map to diagnostic logs without copying content.

**Required before Cohort 2 — one explicit deadline**

- Production backup configuration and one documented end-to-end restore rehearsal must both be completed and passed before the first Cohort 2 participant is invited.
- The rehearsal must restore representative account, chapter, memory, ordered contribution, and private-media records into an isolated environment and verify ownership and integrity.
- Backup recovery does not erase or downgrade a recorded data-loss incident.

No separate or earlier backup deadline is implied elsewhere in this specification.

### 2.5 Existing repository disposition

The application repository was not available for inspection when this draft was written. No specific component is approved for reuse, replacement, or removal.

| Area | Candidate disposition | Required evidence |
| --- | --- | --- |
| Authentication/Supabase setup | Reuse only if it passes ownership, session, recovery, and isolation tests | Two-account negative tests and recovery test |
| Passport/profile shell | Reuse or simplify | No public-profile or social assumptions |
| Festival data/navigation | Reuse selectively | Occurrence/year plus `I Experienced` only |
| Existing state providers | Reuse only if persistence has one clear authority | No duplicate or conflicting save paths |
| Family/crew systems | Remove from routes and dependencies | No access or schema dependency |
| Stamps/adventure/discovery/QR/NFC | Exclude; remove if coupled to core | No navigation, trigger, or onboarding effect |
| Public-profile/social behavior | Remove or quarantine | Cannot expose memories |
| Media components | Reuse only after limits and private-media tests are approved | Upload, validation, retry, playback, removal |

Before implementation, record repository path, machine, branch, commit, working-tree status, deployment target, schema/migrations, environment configuration, and test commands. Filenames and visual similarity are not evidence of safe reuse.

---

## 3. Data model

All identifiers are opaque. Mutable records include `created_at` and `last_updated` where applicable. The schema contains no invitations, reminders, return assignments, participant pseudonyms, interview records, research consent, or immutable contribution versions.

### 3.1 Core entities

#### `accounts`

- `id`
- `auth_provider_subject` (unique)
- `login_identity_normalized` (unique where applicable)
- `status` (`active`, `locked`, `removed`)
- `created_at`
- `last_signed_in_at`

#### `passports`

- `id`
- `owner_account_id` (unique FK → accounts)
- `display_name`
- `status`
- `created_at`
- `last_updated`

Exactly one active Passport per account.

#### `festival_occurrences`

- `id`
- `festival_name`
- `occurrence_label` or `year`
- `starts_on` nullable
- `ends_on` nullable
- `location_label` nullable
- `status`

The minimum data required to classify a return correctly is the stable `festival_occurrence_id`, occurrence label/year, and the account-owned chapter relationship. Exact date/timezone fields are required only if the approved return window is calculated from festival dates.

#### `festival_chapters`

- `id`
- `owner_account_id`
- `passport_id`
- `festival_occurrence_id`
- `relationship_type` fixed to `experienced`
- `attendance_confirmed_at`
- `status`
- `created_at`
- `last_updated`

Unique active constraint: `(owner_account_id, festival_occurrence_id, relationship_type)`.

#### `memories`

- `id`
- `owner_account_id`
- `festival_chapter_id`
- `status` (`saved`, `removed`)
- `saved_at`
- `last_updated`
- `removed_at` nullable

There is no server-side `draft` or `saving` memory state. No public title, sharing state, engagement count, or generated summary is required.

#### `contributions`

- `id`
- `owner_account_id`
- `memory_id`
- `type` (`writing`, `photo`, `voice`)
- `position` (stable integer within memory)
- `text_content` nullable for writing
- `storage_object_id` nullable for photo or voice
- `transcript_text` nullable for voice
- `transcript_status` nullable (`not_requested`, `pending`, `complete`, `failed`, `corrected`)
- `status` (`active`, `removed`)
- `created_at`
- `last_updated`
- `removed_at` nullable

Constraints:

- Unique `(memory_id, position)`.
- Contribution owner equals memory owner.
- Required content fields match contribution type.
- At most one active `photo` contribution per memory, enforced server-side/database-side as well as in the client.
- An active media contribution references one attached, validated storage object owned by the same account.

#### `storage_objects`

- `id`
- `owner_account_id`
- `bucket_key` (unique and non-guessable)
- `media_type` (`photo`, `voice`)
- `mime_type`
- `byte_size`
- `checksum`
- `upload_status` (`temporary`, `validated`, `attached`, `quarantined`, `removed`)
- `created_at`
- `validated_at` nullable
- `removed_at` nullable

Public URLs are not stored. Access is short-lived and owner-authorized.

#### `return_value_responses`

- `id`
- `account_id`
- `memory_id`
- `answer` (`yes`, `not_sure`, `no`)
- `answered_at`

This record has no deletion or visibility side effect.

#### `analytics_events`

- `id`
- `account_id` nullable before identity exists
- `session_id`
- `event_name`
- `occurred_at_client`
- `received_at_server`
- Relevant `festival_occurrence_id`, `chapter_id`, `memory_id`, or `contribution_id` only when needed
- Allowlisted properties containing no contribution content

#### `staff_access_audit`

- `id`
- `staff_identity`
- `purpose_code`
- `request_reference`
- `affected_account_id`
- `affected_record_type`
- `affected_record_id`
- `action`
- `accessed_at`
- `user_authorized_at` nullable

### 3.2 Relationships

- Account 1—1 Passport.
- Passport 1—many Festival Chapters.
- Festival Occurrence 1—many account-owned Festival Chapters.
- Festival Chapter 1—many Memories.
- Memory 1—many ordered Contributions.
- Photo or voice Contribution references one private Storage Object.
- Ownership is repeated on sensitive rows and constrained for consistency.

### 3.3 Manual research records — deferred from product schema

Recruitment, invitations, eligibility, return-condition assignment, reminder administration, participant pseudonyms, interviews, observations, and researcher follow-up are maintained manually outside the core product database for the Founding 100 test.

The manual research register must contain enough data to classify each observed return as:

- unprompted;
- after one standardized automated reminder, if that condition is used; or
- after personal researcher contact.

The register must record assignment before the applicable return window, contact time, return window, and intervention status. It must not contain memory content. Researcher-prompted return is never counted as product retention.

---

## 4. Privacy and security

### 4.1 Rights and permissions — required before Cohort 1

- Contributors retain whatever ownership and legal rights they already hold.
- Uploading does not grant ownership of material belonging to someone else.
- Passport receives only the permissions clearly granted and necessary to store and show the contribution back to its creator in this test.
- Research participation does not grant staff permission to inspect memory content.

### 4.2 Default-private enforcement — required before Cohort 1

- Every product query requires an authenticated account and owner match.
- Server/database rules deny cross-account reads and writes by default.
- Private media requires short-lived authorization after owner verification.
- Client-supplied owner IDs are never trusted as authority.
- Analytics, logs, crash reports, previews, support tools, and caches do not create secondary access paths.
- Test fixtures use synthetic content.

### 4.3 Authorized staff access

**Required before Cohort 1 if any content-capable staff access exists; otherwise content-capable staff access remains disabled.**

- Limit access to a documented user-reported failure, security incident, valid access/removal request, or research review backed by separate specific permission.
- Use least information necessary.
- Audit staff identity, time, record, purpose, action, and user authorization when applicable.
- Staff may not inspect content for curiosity, marketing, entertainment, or unrelated analysis.
- Staff intervention that saves, reconstructs, or exposes a memory disqualifies independent completion.

**Moving a memory between chapters**

- Staff has no general authority to move a memory.
- A move is allowed only after explicit user authorization identifying the memory and destination chapter.
- The move must be ownership-validated, atomic, and audited with previous chapter, destination chapter, staff identity, reason, and authorization reference.
- The participant is excluded from independent core-journey completion and the move is recorded as staff intervention.

### 4.4 Removal, retention, and disclosure

**Required before Cohort 1**

- Successful removal hides content from ordinary user access immediately.
- Removal commands are idempotent and audits exclude memory content.
- User-facing language accurately describes backup/recovery delay and any legal or security exceptions.

Exact retention duration, recovery window, permanent-erasure schedule, undo behavior, and legal exceptions are blocking open decisions before Cohort 1 removal controls are exposed. If unresolved, lifecycle removal testing must occur only with synthetic accounts and the control must not be offered to participants until Cohort 2.

### 4.5 Security controls

**Required before Cohort 1**

- Automated owner-policy tests for every sensitive table and storage path.
- Two-account cross-access negative tests.
- Secrets outside source control.
- TLS in transit and provider-supported encryption at rest.
- Rate limiting or equivalent abuse controls for authentication, recovery, uploads, and media access.
- Approved, testable media validation limits.
- No private content in analytics or ordinary logs.
- Dependency and deployment-configuration review.

**Required before Cohort 2**

- Passed backup/restore rehearsal under the single deadline in §2.4.
- Operational alerts and documented incident/stop-test runbook.
- Content-capable staff tooling, if enabled, passes role, purpose, and audit tests.

---

## 5. Analytics and validation

### 5.1 Product events

**Required before Cohort 1**

- `passport_creation_started`
- `passport_created`
- `festival_selection_started`
- `attendance_confirmed`
- `festival_chapter_created`
- `memory_creation_started`
- `initial_contribution_type_selected`
- `contribution_added`
- `media_upload_started`
- `media_upload_succeeded`
- `media_upload_failed`
- `memory_save_attempted`
- `memory_saved`
- `memory_save_failed`
- `session_ended`
- `later_session_started`
- `passport_home_viewed`
- `festival_chapter_reopened`
- `memory_opened`
- `memory_consumed` with mode (`read`, `view`, `played`)
- `return_value_answered`
- `staff_intervention_required`
- `polaris_prompt_shown`
- `polaris_prompt_answered`
- `polaris_prompt_skipped`
- `draft_recovered`

**Required before Cohort 2 lifecycle testing**

- `contribution_edit_started`
- `contribution_edited`
- `contribution_removed`
- `memory_removed`
- `edit_conflict_detected`

Invitation, assignment, reminder, interview, pseudonym, and return-source records remain manual. They are not product analytics events required for this test.

Events never contain contribution content, transcript text, sentiment, personality classification, or cross-user patterns.

### 5.2 Required funnel and outcomes

Report separately:

- Recruited manually → Passport created.
- Passport created → chapter created.
- Chapter created → capture started.
- Capture started → memory saved.
- Saved → later-session chapter reopened.
- Reopened → memory consumed.
- Revisited → worth keeping response.
- Optional: revisited → added or intentionally edited.
- Optional: core completed → voluntary second creation.

Return rates remain separate: unprompted; after one standardized reminder; after personal researcher contact. Manual records and product timestamps are reconciled without placing research administration in the product schema.

### 5.3 Provisional hypotheses

For eligible participants who create a Passport:

- ≥70% create a chapter.
- ≥60% save one memory.
- 100% of observed saved memories persist complete, usable, ordered, and in the correct account/chapter.
- ≥40% of savers return within 14 days unprompted or after one standardized reminder.
- ≥25% return unprompted.
- ≥70% of revisitors answer worth keeping.
- ≥20% of revisitors voluntarily add to or edit the memory; this is a secondary measure, not core completion.
- 0 confirmed cross-account exposures.
- 0 confirmed loss of a successfully saved memory or contribution.
- ≤10% require staff intervention to complete the core loop.

These are Cohort 1 hypotheses, not final pass criteria. Lock exact denominators, eligibility, windows, and thresholds before Cohort 2. Do not revise them after results to manufacture success.

### 5.4 Cohorts and gates

- **Cohort 1:** 5–10, closely observed; validate usability, trust, instrumentation, private ownership, save durability, and return retrieval.
- **Cohort 2:** 15–25, mostly unmoderated; use locked thresholds and preassigned manual return conditions.
- **Later cohort, if authorized:** 30–50, unmoderated; compare no reminder with one standardized reminder using the same locked definitions.

Expansion requires thresholds met across at least two unmoderated cohorts, 100% observed persistence, no unresolved loss/corruption/privacy problem, separately classified return evidence, completion without staff, and evidence of value beyond camera rolls/notes/social media. Passing never authorizes an excluded feature.

### 5.5 Test-stopping conditions

Immediately stop new participant activity upon confirmed:

1. Loss or corruption of any successfully saved memory or contribution; or
2. Cross-account access or exposure of private memory content.

Preserve evidence, determine scope and cause, notify affected participants when required, correct the defect, verify the correction, and explicitly authorize or reject resumption. Restore success does not cancel the incident.

---

## 6. Acceptance tests

### 6.1 Core screen acceptance — required before Cohort 1

#### Create Passport

- A new user creates one persistent account-owned Passport and reaches Choose Festival without staff help.
- Duplicate/invalid identity has a recoverable path and creates no duplicate Passport.
- Existing sign-in reaches Passport Home.
- No research-consent acceptance is required for ordinary account creation.
- Any terms/privacy gate exists only if separately approved; its absence or presence must match that decision exactly.

#### Choose Festival

- A specific occurrence is selected and physical attendance is explicitly confirmed.
- No chapter exists before confirmation.
- Confirmation creates or reuses exactly one owner-correct `I Experienced` chapter.

#### Festival Chapter

- Correct festival, occurrence, and relationship display.
- Empty state starts memory capture.
- Successful save appears immediately and remains after a fresh authenticated session.
- Only the owner’s active memories appear.

#### Preserve Memory

- Writing, photo, and voice are each independently valid first-contribution paths after their limits are approved.
- At most one active photo exists per memory in client state and persisted data; a direct second-photo request is rejected.
- Voice remains savable if transcription fails; transcript correction leaves audio unchanged.
- Contributions append deterministically.
- Polaris follow-up can be skipped.
- Same-device/browser interruption recovers a draft labeled **Not yet saved to Passport**.
- Offline state never claims durable save.

#### Review and Save

- Preview matches contribution types, order, destination, and private state.
- Save is blocked until included media has passed the approved validation and is durably uploaded.
- Retry creates one memory without duplicate contributions.
- Failure retains the local draft and never shows false success.
- Success returns to the chapter with the memory visible.

#### Passport Home and return

- End the original session; authenticate in a new session; land at Home.
- The saved chapter is immediately findable.
- Opening it retrieves complete text and media, correct order/types, and accurate timestamps.
- The manual return condition and product return timestamps can classify the return without research fields in the core schema.

#### Saved Memory

- Writing can be read, photo viewed, audio played, and transcript viewed when present.
- Worth-keeping response never changes content or visibility.
- Returning to chapter/home works.

### 6.2 Separate lifecycle acceptance — required before Cohort 2

- Add appends without altering existing contribution identities or positions.
- Edit retains `id`, `position`, and `created_at`; updates content and `last_updated`; no immutable version row is created.
- A stale concurrent edit is rejected rather than silently overwriting.
- Photo replacement retains the photo contribution identity and does not create two active photos.
- Contribution removal hides it, records removal, and preserves neighboring positions.
- Removing the last active contribution prompts for memory removal.
- Memory removal hides it from ordinary access and active metrics.
- These actions are not required for a participant’s core-journey pass.

### 6.3 Privacy and security acceptance — required before Cohort 1

- Account A cannot list, fetch, infer, edit, remove, or obtain media access for Account B’s records through UI or direct requests.
- Guessing identifiers yields no content.
- Media authorization expires and is owner-scoped.
- Unauthorized staff access fails.
- If content-capable staff access is enabled, authorized access creates a complete audit record.
- A staff chapter move fails without explicit user authorization; an authorized move is atomic, audited, and flags the participant as intervened/non-independent.
- Analytics and ordinary logs contain no contribution content.
- Sign-out prevents reopening private cached screens.

### 6.4 Failure and recovery acceptance

**Required before Cohort 1**

- Test offline transition, weak/failed upload, refresh during local draft, expired session, failed database commit, orphan cleanup, playback failure, service restart, and retry.
- UI always distinguishes local unsaved draft, uploading, failed save, and durably saved.
- Saved content remains retrievable after ordinary service restart.
- Any confirmed loss/corruption or cross-account exposure invokes the stop-test protocol.

**Required before Cohort 2**

- Passed backup/restore rehearsal verifies restored account, chapter, ordered contributions, media checksum, and owner isolation.

### 6.5 Complete journey acceptance — required before Cohort 1

The journey passes only when an eligible participant, without staff intervention:

1. Creates a Passport.
2. Selects and confirms a physically attended festival occurrence.
3. Creates the correct `I Experienced` chapter.
4. Creates one memory using writing, one photo, voice, or an ordered combination.
5. Reviews and durably saves it privately.
6. Ends the session.
7. Returns in a separate authenticated session.
8. Finds the chapter from Passport Home.
9. Opens and consumes the exact saved memory.

The participant may leave the memory unchanged. Editing, adding, contribution removal, and memory removal are excluded from core completion and pass through their separate lifecycle tests.

Completion proves functional passage through the loop, not retention value. Retention requires separately classified return evidence.

---

## 7. Implementation sequence

Implementation may proceed only within the synthetic-only authorization boundary stated above.

1. **Repository audit — before Cohort 1:** verify machine, path, branch, commit, working-tree status, routes, state management, auth, database, storage, deployments, tests, and excluded-feature coupling. Produce reuse/replace/remove decisions.
2. **Resolve Cohort 1 blockers:** authentication; legal/privacy gating; research separation; supported devices; local-draft handling; retention language; photo/voice/transcription limits; initial festival catalog; staff access; Cohort 1 analytics definitions.
3. **Threat and data-flow review — before Cohort 1:** map private content through local draft, upload, database, storage, cache, logs, analytics, staff access, and removal.
4. **Schema and authorization — before Cohort 1:** core entities only; ownership and one-photo constraints; private storage policies; idempotency; two-account isolation tests.
5. **Authentication and Passport shell — before Cohort 1:** create, sign-in, recovery, sign-out, session, Create Passport, Passport Home.
6. **Festival selection and chapter — before Cohort 1:** small catalog, attendance confirmation, unique `I Experienced` chapter.
7. **Writing vertical slice — before Cohort 1:** local draft → review → durable private save → chapter → separate-session return → view.
8. **Photo path — before Cohort 1:** only after testable limits are approved; private validation/upload/retry/playback-equivalent viewing and one-photo enforcement.
9. **Voice path — before Cohort 1:** only after testable limits are approved; record/play/upload and non-destructive transcription behavior.
10. **Recovery and Polaris — before Cohort 1:** same-device local draft recovery, unsaved warning, weak-service states, minimal prompts, skip behavior.
11. **Analytics and operational readiness — before Cohort 1:** event allowlist, manual research reconciliation, no-content logging, incident stop authority.
12. **Core automated acceptance — before Cohort 1:** end-to-end journey, two-account adversarial tests, media failure, idempotency, persistence, stop-test drill.
13. **Cohort 1:** 5–10 closely observed participants; fix usability/instrumentation issues; lock Cohort 2 definitions.
14. **Lifecycle controls — before Cohort 2:** add, edit, replace photo, remove contribution, remove memory, conflict tests, retention wording.
15. **Backup and operational expansion — before Cohort 2:** configure production backup and pass the single required restore rehearsal; enable monitoring and any audited staff tools.
16. **Cohort 2:** only after every Cohort 2 requirement and locked threshold is satisfied.

Deferred/not required for this test: research-administration product features; server-side drafts; cross-device drafts; queued background saves; arbitrary contribution reorder; immutable edit history; participant-facing invitations/reminders; all explicitly excluded capabilities.

---

## 8. Open questions and assumptions

These are not approved product decisions. A blocking question must be resolved before the implementation or cohort named.

### 8.1 Blocking before Cohort 1 architecture or launch

1. **Authentication:** email magic link, password, Google, or another method?
2. **Legal/privacy gating:** Are terms or a privacy notice legally/product-required before account creation? If so, what exact text, version, jurisdiction, age rule, acceptance evidence, and withdrawal behavior apply? This specification does not approve a gate.
3. **Research consent:** Is separate consent required for Founding 100 research, what exactly does it cover, where is it stored, and how is withdrawal handled? It must not be bundled into account creation.
4. **Retention/removal:** What are the recovery window, backup retention, permanent-erasure schedule, undo behavior, and legal/security exceptions?
5. **Staff model:** Which roles exist, who approves access, how long are audits retained, and who owns incidents? Content-capable access stays disabled until resolved.
6. **Production stack:** Does the current React/Vite/Supabase/Vercel architecture remain after inspection?
7. **Supported devices/browsers:** Is iPhone/Safari the only Cohort 1 target?
8. **Local-draft privacy:** Storage mechanism, expiry, local-media capability, encryption expectation, sign-out behavior, shared-device warning, and maximum supported interruption.
9. **Festival catalog:** Exact occurrences and the minimum dates/timezone needed for correct return-window analysis.

### 8.2 Blocking before photo implementation

10. **Accepted formats:** Exact allowlist, such as JPEG/PNG/HEIC; no format is approved by this draft.
11. **Maximum encoded bytes:** Exact client and server limit.
12. **Maximum pixel dimensions and decompressed image size:** Exact limits guarding memory/resource exhaustion.
13. **Decoding test:** Which server-side decoder must successfully parse the full file before attachment?
14. **Metadata rule:** Which EXIF/location fields are stripped, whether originals are retained, and how failure to strip is handled.
15. **Transformation:** Whether compression/resizing occurs and the measurable output-quality rule.

Until all six photo questions have numeric or enumerated answers and automated boundary tests, photo implementation and participant photo upload are blocked. Terms such as “safe,” “appropriate,” and “valid image” are not acceptance criteria.

### 8.3 Blocking before voice implementation

16. **Accepted recording/container/codecs:** Exact allowlist supported by target devices and server playback.
17. **Maximum duration and encoded bytes:** Exact numeric limits enforced client- and server-side.
18. **Decoding/duration verification:** Which server-side parser verifies full decodability and claimed duration?
19. **Recording interruption:** Approved behavior for calls, screen lock, permission denial, and browser termination.
20. **Transcription:** Provider, languages, disclosure/consent, cost ceiling, provider retention, maximum latency, confidence/error display, and whether Cohort 1 requires it.
21. **Audio integrity test:** Approved checksum and post-upload playback verification rule.

Until these voice questions have enumerated/numeric answers and automated boundary tests, voice implementation and participant recording are blocked. “Byte-valid,” “safe,” and “supported audio” are not acceptance criteria.

### 8.4 Blocking before Cohort 2

22. **Return protocol:** Exact window, manual assignment ratios, reminder channel/copy, and contact rules.
23. **Final measures:** Eligibility, denominators, event definitions, and thresholds locked after Cohort 1.
24. **Lifecycle removal:** Approved retention language and participant-facing consequences.
25. **Accessibility target:** Exact conformance level and assistive-technology matrix.
26. **Operational ownership:** Named authority for incident stop, notification, restore, and resumption.

### 8.5 Explicit assumptions in this draft

- One active Passport per account.
- One active `I Experienced` chapter per account per festival occurrence.
- One active photo maximum per memory, including later additions.
- Contribution order is append order; arbitrary reorder is excluded.
- Original voice audio is retained when a transcript exists.
- Edits update the existing contribution; immutable version history is excluded.
- Drafts are local, same-device/browser only, and never presented as saved.
- Product content remains private; there is no sharing control.
- Research operations remain manual and outside the product schema.

### 8.6 Founding 100 manual boundary

**May remain manual throughout this test:** recruitment, invitations, eligibility, separate research consent, participant pseudonyms, return-condition assignment, reminders, interviews, observations, funnel review, missing-festival intake and catalog maintenance, researcher follow-up, account-recovery assistance, upload-failure support, deletion-request handling, staff authorization capture, and private research tracking.

**Must work in the product before Cohort 1:** account creation and later login; correct chapter creation; writing/photo/voice capture after their limits are approved; ordered durable private save; separate-session reopening; default-private isolation; accurate local-draft state; core analytics; and stop-test enforcement.

**Must work in the product before Cohort 2:** separately tested contribution add/edit/removal, memory removal, stale-edit rejection, approved retention behavior, backup/restore rehearsal, expanded monitoring, and audited content-capable staff access if enabled.

If staff saves, reconstructs, exposes, or relocates a participant memory, the product did not independently complete the journey. The intervention is recorded and that participant is excluded from independent-completion evidence.

---

## Approval record

This specification was reviewed against the four approved foundations for contradiction, silent invention, excess scope, privacy gaps, measurement contamination, and untestable criteria.

**Approval status: Approved.**
