# First Passport Founder Decision Record

**Status:** Approved consolidated founder decision record and current source of truth for Passport Decisions 1–11.  
**Provenance:** This consolidated record is the controlling authority for Passport Decisions 1–11. It is not represented as a verbatim transcript of every original proposal, correction, or approval message. Where original conversation provenance is unavailable, the approved consolidated decision text controls.
**Architecture implementation authorization:** Synthetic-only First Passport engineering phase authorized on 2026-08-11, limited to an isolated writing-only prototype with synthetic data.  
**Legacy assets:** All assets associated with `edm-passport` or `cdm-passport` remain isolated and unchanged until the authoritative inventory required by Decision 10 reconciles them; no reuse, remediation, or migration is authorized.  

## Current engineering authorization — Synthetic writing prototype

- Create and test a clean, isolated writing-only First Passport prototype using synthetic identity, festival, chapter, and memory data.
- Implement only the smallest approved journey: create a synthetic Passport, choose a fixed synthetic festival occurrence, create an `I Experienced` chapter, write a memory, review it, deliberately save it, return, and reopen the exact saved text.
- Session-only unfinished writing must remain visibly **“Not saved yet.”** A verified local synthetic save may persist only to prove the separate-session return journey.
- Dependency-free local implementation and local automated testing are permitted as reversible engineering choices; they do not select or approve the production stack.
- No legacy code, schema, data, configuration, credentials, infrastructure, or deployment may be reused or modified.
- No production integration, backend or provider commitment, external authentication, media, analytics, deployment, recruitment, or real-user testing is authorized.
- Engineering must stop before any unresolved founder choice is required.

This authorization changes the implementation status only. It does not alter Decisions 1–11 or authorize Cohort 1.

## Decision 1 — Authentication and account recovery

**Founder decision:** Approved  
**Decision date:** 2026-08-09  

### Approved scope

- Cohort 1 authentication will be Google-only.
- A person must authenticate before creating a Passport, festival chapter, memory, contribution, photo, or voice recording.
- Application ownership will use the stable authentication-provider subject ID, not an email address.
- Recovery must return the person to the same existing Passport account.
- No verified-email sign-in is approved for Cohort 1.
- No automatic account linking or silent account merging is approved.
- Ambiguous identity or recovery cases must fail closed.
- Additional authentication providers and account-linking behavior remain deferred until separately reviewed and approved.

### Still unresolved

- The manual support process for exceptional recovery cases.
- Exact session duration, revocation behavior, and recent-reauthentication window.
- Rate limits and user-facing recovery language.
- Any later provider expansion or account-linking rules.

### Classification

- Google-only for Cohort 1: founder-approved architectural/product decision.
- Stable subject ownership, same-account recovery, fail-closed ambiguity, and no silent merging: security requirements.
- Exceptional manual recovery procedure: unresolved legal/product/operational decision.
- Any second provider: deferred and not approved.

This decision does not authorize creation of a Supabase project, migrations, code changes, deployment, modification of any `edm-passport` or `cdm-passport` asset, or any implementation work.

## Decision 2 — Legal/privacy gate and Founding 100 research consent

**Founder decision:** Approved  
**Decision date:** 2026-08-09  

### Approved scope

- Cohort 1 is limited to adults aged 18 or older.
- Cohort 1 is limited to participants in the United States.
- A clear privacy notice and product terms are required before real-user testing.
- Permission to use First Passport and consent to Founding 100 research must remain separate.
- Founding 100 research consent is optional.
- Declining research consent must not prevent ordinary First Passport use.
- Researchers will not have routine access to private memories, photos, or voice recordings.
- Research will use interviews, voluntarily submitted feedback, and a minimal separately approved set of product events.
- Any specific private memory content shared with researchers requires separate, explicit participant permission.
- Required acceptance and consent records must preserve the applicable document version and timestamp without collecting unnecessary sensitive data.
- Qualified United States privacy/legal review is required before real-user testing.

### Still unresolved

- Final privacy notice, product terms, and research-consent language.
- Final participant-facing legal language implementing Decision 9's approved retention, purge, backup, and removal limits.
- Research-consent withdrawal mechanics and the treatment of information already used in completed research.
- The exact minimal product-event set available for research.
- Whether any additional federal or state legal obligations apply to the selected Cohort 1 operation.

### Classification

- Contributor rights, user control, editing and removal protections, honest privacy limitations, and separation of product permission from research consent: required by approved sources of truth.
- Versioned acceptance and consent records: security and architectural requirement.
- Adults 18+ and United States-only for Cohort 1: founder-approved product/legal operating boundaries.
- No routine researcher access to private memory content: founder-approved architectural/product boundary.
- Exact notices, terms, retention language, and legal obligations: unresolved legal matters requiring qualified review.
- Any assumption that a small beta is exempt from privacy obligations: rejected and not approved.

Founder approval establishes the intended Cohort 1 operating boundary. It does not establish legal compliance and does not replace qualified legal review.

This decision does not authorize creation of a Supabase project, migrations, code changes, deployment, modification of any `edm-passport` or `cdm-passport` asset, participant recruitment, real-user testing, or any implementation work.

## Decision 3 — Festival catalog, occurrence rules, and attendance claim

**Founder decision:** Approved with user-control clarification  
**Decision date:** 2026-08-10  

### Approved scope

- Passport will maintain a controlled festival catalog for Cohort 1.
- Users will select an existing dated festival occurrence and cannot create custom festival records during Cohort 1.
- Each occurrence will identify the festival, official start and end dates, city, state or region where applicable, country, and local IANA time zone.
- First Passport will initially support only `I Experienced`, which strictly means physical attendance.
- Attendance will be recorded honestly as user-asserted and must not be represented as verified by GPS, tickets, NFC, stamps, or any other proof system.
- One Passport may have only one active `I Experienced` chapter for the same festival occurrence.
- If a desired occurrence is missing, the user may request that Passport add it but may not create or alter catalog records directly.
- The one-active-chapter rule prevents duplicate active chapters; it does not restrict the user’s ability to edit, update, or remove their experience.

### Still unresolved

- Exact catalog and uniqueness behavior after a Decision 9 removal, purge, or later recreation.
- Rules for shared contributions, including what happens when a chapter owner or contributor edits or removes material.
- The catalog-administration, correction, dispute, and missing-festival request processes.
- The meaning and enforcement of “active” after removal, restoration, or recreation.
- Whether and how earlier removed chapters or retained audit records affect later chapter recreation.

### Classification

- `I Experienced` strictly meaning physical attendance: required by the approved Polaris Foundation.
- Festival chapters corresponding to festival experiences: required by approved sources of truth.
- Separate festival and dated-occurrence records, a Passport-controlled catalog, and one active chapter per occurrence: founder-approved product/architectural decisions.
- Attendance described as self-asserted rather than verified: security and truthfulness requirement.
- The user’s ability to edit, update, or remove their experience: approved user-control boundary consistent with the approved contributor protections.
- Removal, retention, backup, and restoration lifecycle: governed by Decision 9; catalog recreation, active-status, and shared-contribution rules remain unresolved.
- Custom festival creation during Cohort 1 and any claim that attendance is technically verified: excluded and not approved.

The uniqueness constraint governs duplicate active chapters only. It must not be used to deny ordinary editing, updating, or removal controls. Removal, purge, backup, restore-suppression, and content-free removal evidence are governed by Decision 9. Shared contributions, external exports, and later chapter recreation remain unresolved unless another approved source controls them.

This decision does not authorize creation of a Supabase project, migrations, code changes, deployment, modification of any `edm-passport` or `cdm-passport` asset, participant recruitment, real-user testing, or any implementation work.
## Decision 4 — Drafts, offline use, and shared-device privacy

**Founder decision:** Approved with active-session and failed-save protections  
**Decision date:** 2026-08-10  

### Approved scope

- Cohort 1 will use session-only unfinished work.
- Unfinished work will exist only in the currently open browser session. It will not be stored as a durable device draft or server-side draft.
- The creation flow will display **“Not saved yet”** throughout creation.
- The interface will warn users before leaving or refreshing when technically possible, without claiming that browsers can always prevent loss.
- A failed upload, failed save, or recoverable authentication interruption must not itself clear temporary work. The user must be allowed to retry when the active browser session still holds that work.
- Passport must not promise recovery after the browser, operating system, session, or device has already destroyed the temporary state.
- Photos and voice recordings will upload only when the user deliberately saves the memory.
- Cohort 1 testing will begin with short memories, and testers will be discouraged from creating long voice recordings.
- Testers will be personally warned that closing or refreshing may erase unfinished work.
- Every reported or observed draft-loss incident will be recorded and reviewed.
- Temporary work must be cleared after a verified successful save, explicit discard, or sign-out, subject to the separate failure protection above.
- Offline creation, persistent-device drafts, cross-device drafts, and “continue later” drafts are excluded from Cohort 1.

### Hard pause rule

Testing must pause before expanding the cohort if either condition occurs:

- Two or more participants lose meaningful unfinished work; or
- One participant loses unfinished work that is emotionally significant.

Testing may resume or expand only after a better draft system has been separately reviewed and approved.

### Quality judgment recorded with the decision

- Product quality: **6/10**
- Suitability for a small Founding 100 pilot: **8/10**
- Suitability for public launch: **4/10**

These ratings reflect different standards. Session-only drafts are a weak permanent experience but a proportionate temporary experiment for a small, controlled, zero-budget pilot.

### Preferred future upgrade

- Private server-side drafts are the preferred future upgrade if Cohort 1 evidence justifies expanding the architecture.
- This preference does not approve implementation, timing, cross-device behavior, retention rules, abandoned-draft cleanup, encryption design, storage limits, or any server-side draft data model.
- The upgrade requires a separate product, privacy, security, architecture, cost, and acceptance-test decision.

### Still unresolved

- Exact active-session duration and expiration behavior.
- Exact retry and reauthentication flow after an interrupted save.
- Technical definition and measurement method for draft-loss incidents.
- The exact evidence package and handoff process used under Decision 8's approved suspension and founder-only resumption authority.
- The detailed design and approval threshold for any future private server-side draft system.

### Classification

- Durable completed memories and honest save/failure states: required by approved sources of truth and security requirements.
- Session-only unfinished work and exclusion of offline, persistent-device, server-side, and cross-device drafts for Cohort 1: founder-approved product and architectural boundary.
- Visible unsaved status, leave warning when possible, shared-device cleanup, and preservation through recoverable failed saves: founder-approved security and truthful-UX requirements.
- Hard pause threshold: founder-approved Founding 100 safety and product-testing rule.
- Private server-side drafts as the preferred future upgrade: founder-approved direction only; deferred capability and not implementation authorization.
- Any assumption that unfinished work is recoverable after the active session has been destroyed: rejected and not approved.

This decision approves a narrow Cohort 1 experiment, not a public-launch-quality draft system. It does not authorize creation of a Supabase project, migrations, code changes, deployment, modification of any `edm-passport` or `cdm-passport` asset, participant recruitment, real-user testing, or any implementation work.

## Decision 5 — Photo and voice limits, privacy, and original-file handling

**Founder decision:** Approved with processing, metadata-verification, and failure-safe deletion clarifications  
**Decision date:** 2026-08-10  

### Approved scope

- Each memory may have a maximum of one active photo and one active voice recording.
- Photo and voice inputs are each limited to 10 MB.
- Voice recordings are limited to two minutes.
- Photos are normalized to a maximum 2048-pixel longest edge.
- EXIF, GPS, device, and other unnecessary metadata must be removed and the absence of prohibited metadata must be verified before the normalized photo is accepted as the retained copy.
- Only the verified normalized photo is retained as the durable photo asset.
- A temporary original must remain private and inaccessible during processing. It may be removed only after the normalized copy has been validated, durably stored, and attached to the correct user's memory.
- Client filenames must not be treated as meaningful application data.
- Exact photo and audio formats may be approved only after synthetic device-and-browser testing proves that the approved matrix can create, validate, store, retrieve, and replay them reliably.
- Video, transcription, audio analysis, and AI media processing are excluded.
- Photos and voice recordings upload only after deliberate **Save**.
- Failed media operations must retain retryable active-session material when technically possible and must never report false success.

### Save-state clarification

- Text and each media item require honest, separate processing and persistence statuses.
- Passport must not claim that the complete memory was saved when its expected photo or voice recording failed validation, processing, storage, or attachment.
- A media failure must not make successfully retained text disappear.
- The exact user-facing partial-failure and retry flow remains an implementation decision, but it must preserve truthfulness, ownership, and recoverable active-session material.

### Metadata-verification clarification

- Metadata stripping must be verified, not assumed from client-side resizing or encoding.
- The normalized photo must pass validation confirming that prohibited metadata is absent before Passport treats it as the retained copy.
- The location of normalization or verification—device, trusted server process, or both—remains unresolved.

### Failure-safe original deletion clarification

- Temporary originals must remain private and unavailable to ordinary users, other participants, public access, and unauthorized staff while processing is incomplete.
- The original may be deleted only after the normalized derivative is validated, durably stored, and attached to the correct owner's memory.
- If processing fails, Passport must not delete the only technically recoverable source merely to satisfy a premature cleanup rule.
- Exact cleanup timing and handling for failed or unattached originals remain unresolved and require a separate retention and operations decision.

### Quality judgment recorded with the decision

- Privacy and cost control: **9/10**
- Cohort 1 suitability: **8/10**
- Expressive freedom: **6/10**
- Public-launch suitability: **5/10**

These ratings reflect a strong privacy-and-cost boundary for a controlled pilot, not a mature public media system.

### Still unresolved

- Exact accepted photo and audio formats and MIME types.
- Whether normalization and verification run on the device, a trusted server process, or both.
- Exact implementation, verification, retry, and alert behavior for Decision 9's approved 24-hour temporary-upload cleanup, seven-day primary purge, and 30-day backup-expiry limits.
- Exact replacement workflow under Decision 9's approved seven-day purge requirement.
- Final participant-facing wording implementing Decision 9's approved backup and deletion limitations.
- Public-launch media limits.
- Exact partial-save status model, retry flow, and user-facing messages.
- Quarantine access, cleanup authority, and monitoring responsibility.

### Classification

- Private photo and voice handling, deliberate-save behavior, honest save/failure states, and one active photo per memory: required by approved sources of truth.
- Object-level ownership checks, file validation, prohibited-metadata verification, private temporary originals, and failure-safe deletion: security and privacy requirements.
- One active voice recording, two-minute and 10 MB limits, 10 MB photo input, 2048-pixel normalization, and retention of only the verified normalized photo: founder-approved Cohort 1 product and architectural boundaries.
- Exact supported formats and processing location: unresolved technical decisions requiring synthetic evidence and later approval where they materially change the architecture.
- Cohort 1 cleanup, replacement-purge, and backup-expiry limits: approved by Decision 9; exact implementation, verification, alerting, and participant-facing wording remain unresolved.
- Public-launch media limits: unresolved product, legal, operational, and architectural decision.
- Video, transcription, audio analysis, AI media processing, and any assumption that all device formats work: excluded and not approved.

This decision does not authorize creation of a Supabase project, migrations, code changes, deployment, modification of any `edm-passport` or `cdm-passport` asset, participant recruitment, real-user testing, or any implementation work.

## Decision 6 — Transcription and derived voice content

**Founder decision:** Approved with privacy-safe technical-monitoring clarification  
**Decision date:** 2026-08-10  

### Approved scope

- Cohort 1 will not transcribe voice recordings or generate captions, summaries, classifications, emotion analysis, topic analysis, searchable derived content, or any other interpretation of spoken content.
- Voice recordings will not be sent to outside transcription or AI providers.
- Voice recordings will not be used for AI training, model improvement, or research-content analysis.
- First Passport will not include dormant transcription infrastructure, speculative processing hooks, transcript fields, background transcription jobs, or unused transcription-provider integrations.
- User-written text remains an independent contribution and must never be labeled, represented, or treated as a transcript of a voice recording.
- Researchers receive no routine access to private voice content under Decision 2. Any separately proposed access to specific content would require the explicit permission and review already required by that decision.
- Any future transcription or derived voice-processing capability requires separate product, privacy, security, accessibility, legal, vendor, retention, deletion, cost, architecture, and synthetic-testing review and explicit founder approval.
- Accessibility for voice memories must be reconsidered before any broader or public launch.

### Privacy-safe technical-monitoring clarification

- Prohibiting voice-content analysis does not prohibit privacy-safe technical monitoring necessary to operate the voice feature.
- Permitted technical monitoring is limited to operational signals such as upload success or failure, file size, duration, processing status, attachment status, playback success or failure, and deletion status.
- Technical monitoring must not capture, transcribe, interpret, classify, summarize, expose, or otherwise derive meaning from the recording's spoken content.
- Operational logs and monitoring must not contain playable audio, audio payloads, signed media links, transcript fragments, or other content-derived data.
- Permission to collect a technical signal does not automatically approve its retention period, staff visibility, analytics use, or vendor destination. Those boundaries remain subject to the later logging, retention, staff-access, and incident decisions.

### Accessibility limitation

- Allowing audio without captions creates a real accessibility gap.
- That limitation is accepted only for a small, controlled Cohort 1 and is not acceptable as an unquestioned permanent or mature public-product boundary.
- A participant may independently add text, but that text is not an accessibility-equivalent transcript and must not be presented as one.

### Quality judgment recorded with the decision

- Cohort 1 suitability: **9/10**

The decision sharply limits cost, sensitive derived data, vendor exposure, deletion complexity, and accuracy failures while First Passport tests whether people value preserving voice memories. Its material weakness is the unresolved accessibility gap.

### Still unresolved

- The accessibility approach required before broader or public launch.
- Exact operational telemetry fields, retention periods, staff visibility, alerting, and approved monitoring destinations.
- Whether and how a participant may separately authorize use of a specific voice recording for research or support under later-approved procedures.
- Any future transcription provider, consent model, accuracy standard, correction process, deletion and backup behavior, security controls, cost boundary, and acceptance tests.

### Classification

- Private voice recordings as permitted contributions: required by approved sources of truth.
- Exclusion of transcription from First Passport: already established by the approved first-experience boundary and reinforced by Decision 5.
- No derived transcript, summary, classification, emotion analysis, searchable voice content, outside processing, AI training, model improvement, or research-content analysis: founder-approved Cohort 1 product, privacy, and security boundary.
- User-written text remaining independent from voice: founder-approved architectural and truthful-UX requirement.
- Privacy-safe technical monitoring limited to non-content operational signals: founder-approved operational boundary; exact telemetry, retention, access, and monitoring design remain unresolved.
- Accessibility solution for broader launch: unresolved product and accessibility decision.
- Dormant transcription infrastructure and any future transcription capability: excluded and not approved.

This decision does not authorize creation of a Supabase project, migrations, code changes, deployment, monitoring configuration, vendor integration, modification of any `edm-passport` or `cdm-passport` asset, participant recruitment, real-user testing, or any implementation work.

## Decision 7 — Transactional saving, retries, and failure states

**Founder decision:** Approved with owner-authorized verification clarification  
**Decision date:** 2026-08-10  

### Approved scope

- Save, append, edit, replace, and removal operations must use narrow, server-controlled commands.
- Every deliberate operation must carry a unique idempotency key.
- Retrying the same operation must not create duplicate memories, contributions, attachments, replacements, or removals.
- Ownership, contribution structure, contribution ordering, and required media state must be validated server-side.
- Related database changes must commit transactionally.
- Media must use a private staged lifecycle because stored files and database records cannot participate in one atomic transaction.
- Passport may display success only after the authoritative result passes owner-authorized read-after-write verification.
- Successfully retained text may enter an owner-only incomplete-save state when expected media fails.
- An incomplete save must never be presented as a completely saved memory.
- Stale edits must produce an explicit conflict instead of silently overwriting newer work.
- Critical privacy, ownership, corruption, meaningful-loss, or false-success incidents must immediately suspend real-user testing.
- Testing may resume only after the cause and scope are established, repairs are verified, participant disclosure is considered, and the founder explicitly approves resumption.

### Owner-authorized verification clarification

- Read-after-write verification must use the same owner-authorized access path used by the product, not privileged administrator or service-role access.
- Verification must confirm that the authoritative database record, contribution order, and media attachment references are accessible to the correct owner.
- Privileged server access proving that a record exists does not prove that the owner can retrieve it and cannot satisfy the success-verification requirement.
- Media must separately reach its required verified state before the interface reports the memory as completely saved.
- Owner-authorized database verification does not replace media validation, processing, durable-storage, attachment, or state verification required by Decisions 5 and 7.

### Incomplete-save boundary

- If text is durably retained but expected media fails, Passport may preserve the memory as an owner-only incomplete save requiring attention.
- This state exists only after the user deliberately presses **Save** and is not approval for a general server-side draft system.
- The state must identify that the operation is incomplete without falsely representing failed media as saved.
- Safe retry must be available when the required recoverable material still exists.
- Passport must not promise recovery when the original session material no longer exists.
- Retention and cleanup behavior for abandoned incomplete saves remains unresolved.

### Immediate testing-suspension conditions

Real-user testing must stop immediately after any confirmed incident involving:

- Meaningful data loss.
- Wrong-account attachment.
- Cross-account access.
- Public exposure of private media.
- Silent contribution-order corruption.
- A false-success save.
- Any equivalent privacy, ownership, or integrity failure discovered during incident review.

Resumption requires documented cause and scope, verified repairs, consideration of participant notification or disclosure, and explicit founder approval.

### Quality judgment recorded with the decision

- Necessity of the requirement for Cohort 1: **10/10**
- The architecture itself is not rated 10/10 or treated as complete while retention, cleanup, incident-disclosure, conflict-resolution, and recovery behavior remain unresolved.

The distinction matters: reliable, idempotent, owner-verifiable saving is mandatory. The current design establishes that requirement and its safety boundaries but does not yet settle every operational and product rule needed for a finished architecture.

### Still unresolved

- Exact implementation, warning, purge-verification, retry, and alert behavior for Decision 9's approved seven-day incomplete-save limit and 24-hour temporary-upload cleanup limit.
- Exact conflict-resolution experience.
- Exact retry and error messages.
- Participant notification requirements after an incident.
- Recovery handling when the original session material no longer exists.
- Operational evidence and documentation required before the founder may approve testing resumption.

### Classification

- Durable saves, correct ownership and ordering, honest failures, and later owner retrieval: required by approved sources of truth.
- Idempotency, transactional database writes, server-side ownership validation, owner-authorized read-after-write verification, and verified media state before complete success: security and architectural requirements.
- Narrow server-controlled save, append, edit, replace, and removal commands; optimistic conflict handling; and the owner-only incomplete-save state: founder-approved Cohort 1 architectural and product boundaries.
- Preservation of successfully retained text after media failure and prohibition on false complete-save status: already established by approved Decision 5 and reinforced here.
- Immediate testing suspension and founder-controlled resumption after critical incidents: founder-approved security and testing boundary.
- Incomplete-save and temporary-media time limits: approved by Decision 9; exact implementation, warning, purge-verification, retry, and alert behavior remain unresolved.
- Conflict UX, retry messaging, incident disclosure, and destroyed-session recovery: unresolved and not approved.
- Any assumption that database records and stored file bytes can commit atomically together, that privileged access proves owner access, or that the unfinished architecture is perfect: rejected and not approved.

This decision approves the mandatory saving architecture boundary but does not authorize creation of a Supabase project, migrations, code changes, deployment, modification of any `edm-passport` or `cdm-passport` asset, participant recruitment, real-user testing, or any implementation work.

## Decision 8 — Staff access, operational logging, and incident authority

**Founder decision:** Approved with support-access, emergency-access, and suspension-authority clarifications  
**Decision date:** 2026-08-11  

### Approved scope

- Every privileged person must use an individually named account protected by multi-factor authentication; shared staff credentials are prohibited.
- Privileged access must follow least privilege and role-based authorization. Email-address exceptions are prohibited.
- One named technical incident owner and one backup delegate must be assigned before real-user testing.
- A qualified privacy/legal owner must be designated before real-user testing; this role may be filled by qualified external counsel.
- One person may initially hold multiple roles, but every privileged action must still occur under a named role, approved purpose, and corresponding permission boundary.
- The technical incident owner may immediately suspend real-user testing when a critical security, privacy, ownership, corruption, meaningful-data-loss, or false-success incident is detected or reasonably suspected. The founder may also suspend testing.
- The founder remains the only authority who may approve resumption after cause and scope are established, repairs are verified through synthetic and owner-authorized paths, participant disclosure is considered, and privacy/legal review is completed where required.
- Routine staff access to private memory text, photos, voice recordings, or private media locations is prohibited.
- Support, research, festival-catalog, analytics, and technical-operation permissions must remain separate even when one person holds several roles.
- Researchers may access only information covered by separate research consent and receive no routine access to private memories or media under Decision 2.
- Festival-catalog administrators and analytics readers receive no access to private memories, media, authentication records, or private storage locations.
- Service-role, database-owner, migration, storage-administrator, and equivalent privileged credentials must never be exposed to the browser.
- Operational logging must be content-free and allowlisted. It may cover authentication failures, authorization denials, save and media-processing failures, cleanup and playback failures, backup failures, deployment health, and unusual privileged access without capturing private contribution content, secrets, signed links, request bodies, or unnecessary direct identifiers.
- A written and tested incident runbook is required before real-user testing.
- No broad administrator dashboard or routine content-browsing tool will be created for Cohort 1.

### Ordinary support-access clarification

- Ordinary support access to private content always requires the participant's explicit, specific permission.
- Permission must identify the reported problem and the type of content support may access.
- General terms acceptance, Founding 100 research consent, or a vague support request is insufficient.
- Access must be purpose-bound, minimum-necessary, auditable, and limited to the specific reported problem.
- Access expires when the investigation ends or at a short limit that must be approved in a later decision, whichever occurs first.
- Support permission does not authorize research reuse, and research permission does not authorize support access.

### Emergency-access clarification

- Emergency access cannot be used for routine support, curiosity, convenience, product research, or general administration.
- It is permitted only when reasonably necessary to contain or investigate an active security, privacy, ownership, corruption, or meaningful-data-loss incident and obtaining prior participant permission is impractical.
- Emergency access requires documented justification, minimum-necessary access, and an audit record created before access or atomically with it when advance recording is technically impossible.
- Every emergency-access event requires later privacy/legal review.
- Whether affected participants must be notified remains governed by later-approved incident-notification rules and qualified legal review.

### Audit boundary

An exceptional content-access audit record may contain the actor and role, approved purpose, target record type and internal pseudonymous identifier, support-ticket or incident reference, action and result, timestamp, and authorization source.

It must not contain memory text, photos, recordings, playable media, original filenames, private object paths, signed links, authentication tokens, cookies, secrets, request bodies, or email addresses where a pseudonymous identifier is sufficient.

### Incident authority and process

The written incident runbook must cover:

1. Detection and immediate testing suspension by the technical incident owner or founder.
2. Credential containment and access revocation.
3. Evidence preservation without unnecessary copying or exposure of private content.
4. Scope and affected-participant assessment.
5. Repair or restoration.
6. Synthetic and owner-authorized verification.
7. Privacy/legal review and participant-notification decisions.
8. Founder approval before testing resumes.
9. Post-incident review.

The founder may not resume testing merely because the interface appears to work again.

### Quality judgment recorded with the decision

- Necessity of the control: **10/10**.
- Completeness of the current operating design: approximately **8/10**.

The control is mandatory, but the operating design is not complete until people are assigned, the incident runbook is tested, and the unresolved access, retention, and notification rules are approved.

### Still unresolved

- Who fills each role and whether any external providers are required.
- Audit-log protection, access, integrity controls, and retention.
- Operational-log retention, staff visibility, vendors, and alert routing.
- The short maximum expiration period for ordinary support access.
- Exact emergency-access implementation and credential procedure.
- Participant-notification rules after incidents or emergency access.
- Applicable legal definitions, duties, response periods, and notification obligations.
- Exact written authorization and permission-capture interfaces.

### Classification

- No routine staff browsing of private content; individually named accounts; MFA; least privilege; no shared credentials; content-free allowlisted logs; and no browser exposure of privileged credentials: approved security and privacy requirements.
- Separate support, research, catalog, analytics, and technical roles: founder-approved architectural and operational boundary.
- Immediate suspension authority for the technical incident owner and founder-only resumption authority: founder-approved incident-governance boundary.
- Explicit, problem-specific participant permission for ordinary support-content access: founder-approved privacy requirement.
- Incident-only, justified, minimum-necessary, audited emergency access with later privacy/legal review: founder-approved emergency boundary.
- A named technical incident owner, backup delegate, qualified privacy/legal owner, and written tested runbook before real-user testing: approved operational gates.
- Exact role assignments, retention periods, emergency implementation, participant notification, and legal obligations: unresolved and require separate approval or qualified legal review.
- A broad Cohort 1 administrator dashboard, routine content-browsing tools, curiosity access, and emergency access used as a support shortcut: excluded and not approved.

This decision does not authorize creation of a Supabase project, migrations, code changes, deployment, modification of any `edm-passport` or `cdm-passport` asset, participant recruitment, real-user testing, or any implementation work.

## Decision 9 — Removal, retention, backups, and restoration

**Founder decision:** Approved with removal-verification, restore-suppression, media-authorization, and confirmation clarifications  
**Decision date:** 2026-08-11  

### Approved scope

- After an owner-authorized removal succeeds, the affected contribution, memory, or account must be suppressed immediately from all ordinary product, owner, support, analytics, search, and playback paths.
- Removal commands must be idempotent. Account deletion requires recent reauthentication.
- Passport must report removal failure honestly and must not treat an expired, closed, or unavailable interface as evidence that removal succeeded.
- Removed contribution content, removed memories, replaced media, and deleted-account content must be purged from active primary storage within seven days.
- Failed, rejected, abandoned, and unattached temporary uploads must be purged within 24 hours unless attached to an owner-only incomplete save that remains eligible for retry.
- Owner-only incomplete saves may remain recoverable for no more than seven days after the last failed save attempt. Participants must be clearly warned that the recovery period is temporary and that expiration removes the text, temporary media, and content-bearing recovery material.
- Cohort 1 will provide no participant-facing restoration or undo-deletion feature.
- Backups must be encrypted, access-restricted, and expire so removed content remains in immutable backups for no more than 30 days after removal.
- Backups must not be searched or restored merely to recover content a participant deliberately removed.
- Backup access and restoration require named authorization and content-free audit evidence.
- A synthetic restoration rehearsal must succeed in an isolated environment before real-user testing and must not overwrite production.
- Provisional Cohort 1 recovery targets are a 24-hour recovery point objective and a 72-hour recovery time objective, subject to verified platform capability and truthful participant disclosure.
- Content-free removal evidence may be retained for one year, subject to qualified privacy/legal review.
- Any legal exception to scheduled purge requires a documented legal basis confirmed by the qualified privacy/legal owner, minimum-necessary audited access, and accurate participant-facing disclosure where required.

### Authoritative removal-verification clarification

- Passport must not display successful removal until the authoritative owner-authorized access path confirms that the material is suppressed.
- Verification must confirm that no new media authorization can be issued and that the required purge job has been durably scheduled.
- Interface disappearance, client-side state, an expired session, or an unavailable page is not proof of removal.
- A verified immediate suppression does not permit Passport to claim that primary purge or backup expiry has already completed. Those later lifecycle stages require their own status and evidence.

### Restore-suppression clarification

- Passport must maintain an authoritative, content-free removal register independently enough that restoring an older backup cannot also roll deletion knowledge back to the backup's older state.
- Before any restored environment becomes accessible, it must reconcile against the authoritative removal register.
- The reconciliation must suppress every removed account, memory, contribution, and media object, including removals that occurred after the restored backup was created.
- A restoration that cannot complete this reconciliation must remain isolated and inaccessible.

### Media-authorization clarification

- Once removal succeeds, Passport must deny all new media authorizations immediately.
- Cohort 1 media access must use short-lived authorizations with a maximum lifetime approved before testing.
- Previously issued authorizations may remain usable only until that approved expiration; this limitation must be disclosed accurately.
- Permanent, public, or broadly reusable media links are prohibited.
- “As quickly as technically possible” is not an approved substitute for a measured authorization lifetime and verified denial of new access.

### Irreversible-removal confirmation clarification

- The absence of a user-facing restore or undo feature requires a clear warning before irreversible removal.
- The warning must identify exactly what will be removed and communicate that Passport does not offer participant-facing recovery during Cohort 1.
- Account deletion requires stronger confirmation than removal of one contribution.
- The precise interface, wording, and interaction design remain unresolved, but the confirmation requirement itself is approved and mandatory.

### Backup and restoration requirements before testing

- Automated backup operation, last-success status, and backup-failure monitoring must be verified.
- A named restore owner and backup delegate must be assigned.
- The isolated rehearsal must verify account ownership, chapter relationships, contribution order, media checksums and availability, owner isolation, application compatibility, and removal-register reconciliation.
- Expired-backup deletion must be verified against the selected provider's actual behavior.
- If the selected platform cannot prove 30-day backup expiry, isolated restoration, removal suppression, or the stated RPO/RTO, Passport must revise its promises or stop before real-user testing.

### Hard stop conditions

Real-user testing must stop immediately if:

- Passport falsely reports successful removal.
- Removed content returns to ordinary access or a restore resurrects it.
- New media authorization can be issued after removal.
- Previously issued media access outlives the approved expiration.
- Content remains in active primary storage beyond the approved purge deadline without a documented legal exception.
- Backup access occurs without authorization or audit evidence.
- A restore cannot preserve owner isolation, contribution integrity, or authoritative removal suppression.
- Actual backup, expiry, deletion, or recovery capability is weaker than Passport's participant-facing promise.

Under Decision 8, the technical incident owner may suspend testing immediately. Only the founder may authorize resumption after root cause, scope, repair, technical verification, and qualified privacy/legal review are complete.

### Quality judgment recorded with the decision

- Cohort 1 suitability: **8/10**

The policy is defensible for a controlled pilot, but approval of numerical deadlines does not prove the platform can meet them. The design remains conditional on operational evidence and is not a mature public-product durability standard.

### Still unresolved

- Exact short expiration period for media authorizations.
- Exact irreversible-removal warning, confirmation interaction, and account-deletion confirmation method.
- Exact purge-job implementation, verification, retry, and alert behavior.
- Exact removal-register architecture, replication, protection, retention, and disaster-recovery design.
- Exact incomplete-save reminder interface.
- Exact provider backup behavior and whether a zero-cost platform can satisfy the approved limits and rehearsal requirements.
- Exact audit-log protection and retention beyond the approved content-free removal evidence.
- Exact legal-hold definitions, participant-notification duties, and jurisdiction-specific obligations.
- Public-launch retention, deletion, authorization, RPO, RTO, and restoration standards.

### Classification

- Immediate suppression, honest failure, idempotent owner-authorized removal, recent reauthentication for account deletion, and no false instant-backup-erasure promise: approved product, security, and truthful-UX requirements.
- Owner-path removal verification, durable purge scheduling, denial of new media authorization, authoritative restore reconciliation, and inaccessible failed restores: approved security and architectural requirements.
- Seven-day primary purge, 24-hour temporary-upload cleanup, seven-day incomplete-save recovery, 30-day backup expiry, and no Cohort 1 participant-facing restoration: founder-approved Cohort 1 product and operational boundaries.
- Short-lived media authorization: approved hard boundary; exact expiration remains unresolved and must be approved before testing.
- Explicit irreversible-removal warning and stronger account-deletion confirmation: approved requirements; exact interface remains unresolved.
- Synthetic isolated restore rehearsal, backup monitoring, named restore responsibility, provisional 24-hour RPO, and provisional 72-hour RTO: approved pre-test requirements subject to platform evidence.
- One-year content-free removal evidence: founder-approved recommendation subject to qualified privacy/legal review.
- Assuming the selected provider automatically satisfies backup expiry, removal suppression, restoration, or recovery promises: rejected and not approved.

This decision does not authorize creation of a Supabase project, migrations, code changes, deployment, backup configuration, platform selection, modification of any `edm-passport` or `cdm-passport` asset, participant recruitment, real-user testing, or any implementation work.

## Decision 10 — Deployment environments, secrets, and release integrity

**Founder decision:** Approved with verified legacy-environment identification and data-safe rollback/containment clarifications  
**Decision date:** 2026-08-11  

### Approved scope

- First Passport must use fully isolated non-production and production environments.
- The environments must use separate backends, storage, credentials, OAuth configuration, domains, and data.
- Only synthetic accounts, festival occurrences, writing, photos, voice recordings, and approved test fixtures may exist outside production. Production participant or legacy data must never be copied into development, preview, test, restore-rehearsal, or other non-production environments.
- First Passport must not reuse a legacy repository, deployment, backend, storage system, user base, domain configuration, environment variable, credential, or OAuth configuration merely for convenience.
- Required configuration must be explicitly declared per environment. Missing, malformed, conflicting, unexpected, or ambiguous configuration must fail closed. Hardcoded fallback projects, URLs, identifiers, domains, or credentials are prohibited.
- Privileged secrets must remain server-only and outside source control, browser bundles, logs, analytics, screenshots, support records, decision records, and test fixtures. Production and non-production credentials must be different.
- Application origins, OAuth redirects, sign-out returns, and authorized domains must use explicit environment-specific allowlists. Wildcard production redirects and implicit preview access to production authentication are prohibited.
- Every production release must be reproducible from a committed lockfile, gated by the required tests and approval, traceable to an exact reviewed Git commit, and identifiable in the live application through a non-secret release identifier.
- Production schema changes must be versioned and reviewed. Unrecorded console changes are prohibited except during a documented emergency.
- Security-header and private-cache protections must be tested against the actual application before production; generic untested values are not approved merely by category.
- No selected platform, provider, framework, free tier, domain, branch mapping, CI/CD system, or migration tool is approved by this decision.

### Verified legacy-environment identification clarification

- The prior proposal's reference to `cdm-passport` is not accepted as the complete or verified identifier for the legacy environment.
- Existing records identify an audited archive named `edm-passport-audit.zip` with archive root `edm-passport/`, while other architecture records separately refer to a protected `cdm-passport` environment. Passport must not assume these names identify the same asset, nor may it silently replace one name with the other.
- Before any First Passport environment is created or connected, a verified legacy-isolation inventory must record every relevant legacy repository and branch, deployed application and deployment project, backend project, database, storage location, user set, domain, OAuth application, environment-variable set, and privileged credential set.
- Each inventoried asset must have an exact provider identifier or other authoritative identifier, its purpose, its environment classification, its relationship to `edm-passport` or `cdm-passport`, and an explicit isolation disposition.
- Until that inventory reconciles the names and identifiers, both `edm-passport` and `cdm-passport` references are treated as potentially distinct legacy assets that remain isolated, unchanged, and unavailable for First Passport reuse.
- A filename, local folder name, repository nickname, or remembered project label is not sufficient evidence of a backend, deployment, storage, or credential boundary.
- Any unknown, ambiguous, or unverified legacy connection is a hard stop. Implementation must not proceed by guessing.

### Data-safe rollback and containment clarification

- Application rollback and database recovery are separate operations. Rolling back application code must never automatically reverse a database migration or restore an older database backup.
- A previous application release is a valid rollback target only when it is verified as compatible with the current schema, authoritative removal register, ownership controls, contribution ordering, media state, and approved retention rules.
- A reverse database migration is permitted only when its effect on saved memories, contribution order, media attachments, ownership, removal markers, audit evidence, and other durable state has been reviewed and tested with synthetic data.
- If reversal could cause or cannot rule out further data loss, corruption, cross-account exposure, resurrection of removed content, or loss of authoritative removal evidence, Passport must not perform the reversal.
- In that case, Passport must contain the deployment: disable the affected feature or release, suspend real-user testing when required, revoke affected access, preserve content-free evidence, keep unsafe environments inaccessible, and communicate an honest outage or unavailable state.
- Recovery may proceed only through a verified process that preserves the authoritative removal register and all approved privacy, ownership, ordering, and durability boundaries.
- The technical incident owner may initiate containment and suspend testing immediately. Only the founder may authorize resumption after cause, scope, repair, owner-path verification, recovery verification, and required privacy/legal review are complete.
- Availability is subordinate to data integrity. Passport must accept downtime rather than perform an unsafe rollback.

### Release and deployment evidence

Every production deployment record must identify:

- Repository, branch, and exact commit.
- Build command, runtime version, committed lockfile state, and environment designation.
- Deployment identifier and time.
- Required test-gate results.
- Approving technical role.
- Applicable database migration versions and compatibility assessment.
- Verified rollback target or documented containment plan when no safe rollback exists.

Before real-user testing, synthetic verification must prove environment isolation, fail-closed configuration, OAuth/domain allowlists, release-to-commit traceability, secret boundaries, schema-change recording, application/schema compatibility, containment behavior, and restoration without removal resurrection.

### Hard stop conditions

Implementation or real-user testing must stop if:

- A legacy asset or connection remains unidentified, ambiguous, or capable of being reused accidentally.
- Any non-production system can access production participant data or production privileged credentials.
- A build or application silently uses fallback or ambiguous configuration.
- A preview or local origin can authenticate against production without explicit authorization.
- A production release cannot be matched to an exact reviewed commit.
- A privileged secret reaches a browser, repository, log, screenshot, support record, or other unauthorized location.
- Production schema changes occur without a versioned record.
- A rollback or reverse migration could cause data loss, corruption, ownership failure, or resurrection of removed content.
- The selected platform cannot substantiate an approved environment, security, backup, removal, recovery, logging, or deployment promise.

### Quality judgment recorded with the decision

- Necessity: **10/10**
- Decision quality: **9/10**
- Actual readiness: **Unproven** until the selected platform and deployment workflow pass synthetic testing.

The decision is strong enough to govern provider selection and architecture work, but it is not evidence that any provider or workflow satisfies the requirements.

### Still unresolved

- The authoritative legacy-isolation inventory and reconciliation of `edm-passport` and `cdm-passport` references.
- Final frontend, backend, storage, hosting, authentication, and deployment providers.
- Whether any free tier can satisfy the approved controls.
- Exact production, non-production, preview, and isolated-restore topology.
- Production and non-production domains and branch-to-environment mapping.
- CI/CD system, release gates, approval mechanism, deployment owner, and backup delegate.
- Runtime and supported dependency versions.
- Exact security-header and cache-control values.
- Secret-storage system, access assignments, rotation intervals, and emergency rotation procedure.
- Database migration, compatibility-checking, containment, and verified recovery tooling.
- Preview retention and access policy.
- Minimum monthly operating budget.

### Classification

- Fully isolated production and non-production environments; synthetic data only outside production; fail-closed configuration; environment-specific credentials and OAuth allowlists; server-only privileged secrets; commit-traceable gated releases; and versioned schema changes: approved architecture and security requirements.
- Verified inventory of every legacy repository, deployment, backend, storage system, domain, OAuth application, configuration set, user set, and privileged credential set: approved pre-implementation gate.
- Treating `edm-passport` and `cdm-passport` as potentially distinct until authoritatively reconciled: approved safety boundary.
- Containment instead of unsafe application rollback, reverse migration, or database restoration: approved durability and incident-response boundary.
- Provider, stack, topology, tooling, domains, budget, and staff assignments: unresolved and not approved.
- Reusing a shared backend for development and real participants, assuming a remembered legacy name is authoritative, or assuming a prior provider remains approved: rejected.

This decision does not authorize creation of a Supabase project, environment, repository, deployment, domain, credential, migration, code change, backup configuration, platform selection, modification of any `edm-passport` or `cdm-passport` asset, participant recruitment, real-user testing, or other implementation work.
## Decision 11 — Supported devices, browser scope, and accessibility

**Founder decision:** Approved with synthetic-development, authentication-neutrality, and audio-accessibility clarifications  
**Decision date:** 2026-08-11  

### 1. What is being proposed

First Passport must define exactly where the Cohort 1 experience is required to work.

“Mobile-first” is too vague. It does not identify:

-  Which phones are supported. 
-  Which browsers are tested. 
-  Whether desktop or Android must work. 
-  What happens when camera or microphone access is unavailable. 
-  Which accessibility requirements are mandatory. 
-  Whether installing an app is required. 
-  What level of weak-network behavior is acceptable. 

The proposed Cohort 1 boundary is:

-  First Passport is a browser-based experience. 
-  Participant creation, capture, saving, and return are officially supported on **iPhone using Safari**. 
-  No App Store installation, home-screen installation, or native application is required. 
-  Android, iPad, desktop browsers, embedded browsers, and alternative iPhone browsers are outside the supported Cohort 1 evidence boundary unless separately tested and approved. 
-  Unsupported environments must receive honest guidance rather than silently failing. 
-  Accessibility is part of acceptance—not deferred polish. 
-  Writing remains the complete non-voice alternative. 
-  The final supported-device matrix must be named and pass synthetic testing before real-user testing. 

This decision does not select the exact minimum iPhone model or iOS versions. Those must be determined using the actual devices available to Cohort 1 and verified before recruitment.

### 2. Why First Passport needs this decision

Attempting to support every platform with no budget and no engineering team would be weak scope control.

The predictable result would be:

-  Camera capture behaving differently across browsers. 
-  Voice recordings that cannot be played after upload. 
-  The approved authentication method returning to the wrong browser or losing state. 
-  Safari terminating an interrupted capture. 
-  A participant believing work was saved when the browser discarded it. 
-  Large text breaking the save flow. 
-  Voice-only controls excluding people who cannot or do not want to speak. 
-  Researchers manually rescuing participants and falsely counting the experience as successful. 

Cohort 1 is not supposed to prove universal compatibility. It is supposed to prove that one clearly defined experience works reliably enough to test its value.

### 3. Supported platform boundary

#### Official Cohort 1 platform

Approve:

-  iPhone hardware. 
-  Safari as the participant browser. 
-  Browser-based access through the finalized production domain. 
-  Portrait orientation as the required primary layout. 
-  Landscape orientation must remain usable enough to recover, rotate back, or continue without losing work. 
-  No required installation. 
-  No dependency on push notifications. 
-  No dependency on background processing continuing after Safari is closed. 
-  No assumption that a browser tab will remain alive indefinitely. 

The experience must remain complete when opened directly from the production URL. Adding the site to the home screen may be tested later, but it cannot be required or counted as the ordinary Cohort 1 path.

#### Outside the supported evidence boundary

Unless separately approved:

-  Native iOS application. 
-  Android. 
-  iPad-specific layouts. 
-  Desktop creation and capture. 
-  Chrome, Firefox, Edge, or other browsers as supported participant environments. 
-  Embedded browsers inside social-media, email, or messaging applications. 
-  Cross-device draft continuation. 
-  Offline final saving. 
-  Background uploads after the browser closes. 

Passport may display on an unapproved platform. That does not make the platform supported, and results from it cannot be mixed into Cohort 1 reliability evidence.

### 4. Exact test matrix requirement

Before real-user testing, Passport must record:

-  Minimum supported iPhone model or hardware capability. 
-  Every supported iOS major version. 
-  Safari version associated with each tested operating system. 
-  Screen-size range. 
-  At least one oldest-supported configuration. 
-  At least one current target configuration. 
-  Whether testing uses physical devices or simulation. 
-  Which capture, authentication, interruption, accessibility, and return tests passed on each configuration. 

A simulator alone is insufficient for:

-  Camera permission and capture. 
-  Microphone permission and recording. 
-  Audio playback. 
-  File selection. 
-  Browser termination. 
-  Screen locking. 
-  Weak-network interruption. 
-  Google OAuth return. 
-  VoiceOver and physical touch behavior. 

At least the oldest-supported and primary-current configurations must be tested on physical devices.

The matrix must be frozen before Cohort 1 begins. Operating-system or browser updates during testing require a documented compatibility check before the updated configuration is treated as supported.

### 5. Unsupported-environment behavior

Passport must not pretend an untested environment is supported.

When the environment is known to be outside the approved matrix:

-  The participant receives a plain-language notice before beginning memory creation. 
-  The notice identifies the supported route: iPhone Safari. 
-  Existing saved memories must not be hidden merely because the current environment is unsupported when safe read-only access remains possible. 
-  Passport must not delete or corrupt local work merely because support status changes. 
-  Unsupported-browser analytics must remain content-free. 
-  Researchers must record the participant as platform-ineligible rather than coaching them through failures and counting the journey as successful. 

Browser detection is imperfect. Therefore Passport must use both:

-  Capability checks for required behavior. 
-  A maintained supported-platform policy. 

A user-agent string alone is not reliable proof that capture, playback, storage, or authentication works.

### 6. Permissions and alternative paths

Camera and microphone permission must be requested only when the participant deliberately chooses the related feature.

Passport must:

-  Explain why the permission is needed before triggering the browser prompt. 
-  Handle denial without trapping the participant. 
-  Allow writing without camera or microphone permission. 
-  Permit photo selection from the existing library when supported, rather than requiring live camera capture. 
-  Preserve existing local text when photo or voice permission is denied. 
-  Never treat permission denial as research withdrawal or product failure. 
-  Never repeatedly pressure the participant to enable a denied permission. 
-  Provide a clear route to continue without that media type. 

Voice is an optional contribution method, not an accessibility requirement imposed on the participant. A person must be able to complete the entire First Passport journey using writing alone.

Photo is also optional. Refusing photo access cannot prevent saving a valid written or voice memory.

### 7. Accessibility boundary

Cohort 1 should adopt **WCAG 2.2 Level AA as its design and acceptance target** for the approved journey.

That does not permit Passport to claim formal conformance before the experience is tested and its applicable requirements are documented.

At minimum, the supported journey must verify:

-  VoiceOver labels, roles, values, and reading order. 
-  Visible and logical focus behavior. 
-  External-keyboard operation for interactive controls. 
-  Sufficient color contrast. 
-  Meaning that does not depend on color alone. 
-  Support for increased text size without hiding essential controls. 
-  Touch targets large enough for reliable use. 
-  Reduced-motion behavior. 
-  No required flashing or unnecessary animation. 
-  Clear headings, field labels, instructions, and errors. 
-  Errors associated with the relevant field or operation. 
-  Save status announced accessibly. 
-  Recording status and elapsed time communicated without vision alone. 
-  Playback controls labeled and operable. 
-  A non-voice completion route. 
-  Captions or transcripts are not falsely promised when transcription remains excluded. 

WCAG 2.2 AA applies to the complete product interface and Passport-authored content. Passport must not claim full WCAG 2.2 AA conformance for a journey containing prerecorded audio-only contributions unless the applicable media-alternative requirements are satisfied or a qualified accessibility review documents why a criterion does not apply. The method for making participant voice contributions accessible remains unresolved and must be settled before any formal conformance claim.
-  Authentication and irreversible-removal confirmation remain accessible. 
-  Time limits do not silently destroy work. 

Automated accessibility scans are useful but insufficient. The final journey requires manual VoiceOver, keyboard, text-resizing, contrast, and reduced-motion testing.

### 8. Network, interruption, and lifecycle behavior

The supported platform must be tested under:

-  Stable Wi-Fi. 
-  Stable cellular service. 
-  Throttled or unstable service. 
-  Connection loss before upload. 
-  Connection loss during upload. 
-  Connection loss after the server commits but before confirmation returns. 
-  Safari moving to the background. 
-  Screen lock. 
-  Incoming interruption during voice capture. 
-  Tab reload. 
-  Browser termination. 
-  Authentication expiration. 
-  Return through a fresh Safari session. 

The approved local-draft rules from Decision 4 and verified-save rules from Decision 7 remain controlling.

Passport must not claim:

-  Offline final saving. 
-  Guaranteed background upload. 
-  Recovery after browser data is cleared. 
-  Cross-device unsaved-draft recovery. 
-  Complete save when media verification has not finished. 

### 9. Analytics and evidence integrity

Platform evidence must record only the minimum information needed to diagnose compatibility:

-  Approved platform classification. 
-  Coarse device or capability class. 
-  Operating-system major version. 
-  Browser family and relevant major version. 
-  Permission outcome. 
-  Capture, playback, upload, save, and return result. 
-  Content-free error category. 

It must not record:

-  Memory text. 
-  Audio or photo contents. 
-  Filenames or media paths. 
-  Detailed fingerprinting attributes unrelated to compatibility. 
-  Persistent device fingerprints. 
-  Browsing history or unrelated installed capabilities. 

A participant who requires staff intervention to complete a broken platform flow does not count as independent completion.

### 10. Direct recommendation

Approve this Cohort 1 boundary:

-  iPhone Safari is the only officially supported participant creation-and-return platform. 
-  First Passport remains browser-based with no installation requirement. 
-  The exact hardware, iOS, Safari, and screen-size matrix must be frozen and verified before recruitment. 
-  Physical-device testing is mandatory for capture, interruption, OAuth, playback, and accessibility. 
-  Unsupported environments receive honest guidance and are excluded from success evidence. 
-  Writing provides the complete non-voice and no-media route. 
-  Camera and microphone permission are optional, contextual, and non-blocking. 
-  WCAG 2.2 Level AA is the design and acceptance target for the approved journey. 
-  Manual VoiceOver and accessibility testing is required. 
-  Weak-network, interrupted-capture, browser-termination, and fresh-session return behavior must pass the approved synthetic tests. 
-  No universal mobile, Android, desktop, offline, native-app, or cross-device-draft claim is approved. 

This control is **10/10 necessary**.

The decision quality is approximately **9/10** because it sharply limits scope while preserving an accessible complete journey. Actual readiness remains **unproven** until the exact device matrix and physical-device tests pass.

### 11. Hard stop conditions

Synthetic development may continue on unsupported or not-yet-finalized configurations. Production integration, recruitment, and real-user testing cannot begin until the supported matrix is named and passes the required physical-device tests.

Production integration, recruitment, or real-user testing must stop if:

-  The supported device matrix has not been named and tested. 
-  A supported configuration loses or corrupts a participant’s work. 
-  Voice or photo failure destroys valid text. 
-  Passport reports a complete save after an interrupted or unverified upload. 
-  The approved authentication method cannot reliably return participants to the correct Passport while preserving expected state on every supported configuration. If Google authentication is selected, its Safari return flow must pass this requirement. 
-  Voice captured on a supported device cannot be retrieved and played back. 
-  A participant cannot complete the journey without voice or photo permission. 
-  Essential controls are unusable with VoiceOver, increased text size, or the approved keyboard path. 
-  An unsupported platform is knowingly counted as supported evidence. 
-  Staff intervention disguises a platform failure as independent completion. 

The technical incident owner may suspend testing immediately. Only the founder may authorize resumption.

### 12. Still unresolved

-  Exact minimum iPhone model. 
-  Exact supported iOS and Safari versions. 
-  Exact physical-device inventory. 
-  Whether read-only desktop access will be supported. 
-  Exact unsupported-browser notice. 
-  Exact accessibility test cases and audit owner. 
-  Whether external accessibility review is required. 
-  Maximum local interruption and draft-retention behavior already dependent on Decision 4. 
-  Exact network-throttling profiles. 
-  Whether later cohorts add Android, desktop, iPad, alternative browsers, or a native application. 

### 13. Decision classification

| Element | Classification |
| --- | --- |
| iPhone Safari as the only Cohort 1 supported participant platform                                  | Product and validation recommendation requiring founder approval |
| Browser-based experience with no required installation                                             | Architectural/product boundary requiring founder approval        |
| Frozen device/browser matrix before recruitment                                                    | Testing requirement                                              |
| Physical-device capture, OAuth, interruption, playback, and return testing                         | Reliability requirement                                          |
| Writing-only complete journey                                                                      | Approved product requirement and accessibility boundary          |
| Optional, contextual camera and microphone permission                                              | Privacy/accessibility requirement                                |
| WCAG 2.2 Level AA design and acceptance target                                                     | Accessibility recommendation requiring founder approval          |
| Manual VoiceOver and accessibility verification                                                    | Acceptance requirement                                           |
| Honest unsupported-environment handling                                                            | Product-integrity requirement                                    |
| Android, native applications, broad desktop support, offline final saving, and cross-device drafts | Excluded from Cohort 1                                           |
| Exact supported models, versions, test inventory, and audit ownership                              | Still unresolved                                                 |
| Claiming broad “mobile support” without a tested matrix                                            | Rejected as unprovable                                           |

This decision does not authorize creation of a project, environment, repository, deployment, domain, credential, migration, code change, backup configuration, platform selection, modification of any `edm-passport` or `cdm-passport` asset, participant recruitment, real-user testing, or other implementation work.
