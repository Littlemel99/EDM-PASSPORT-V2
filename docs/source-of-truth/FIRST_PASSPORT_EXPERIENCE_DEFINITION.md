# First Passport Experience Definition

**Status:** Approved first-experience definition and current source of truth.
**Approval status:** Approved
**Purpose:** Define the narrowest real-user test of Passport’s central value.

## 1. The question this version must answer

> **Will someone preserve one meaningful memory from a festival they physically attended, save it in Passport, and return later because that memory still matters?**

This is not a test of whether people like the Passport concept, its artwork, or its future possibilities. It tests actual behavior:

1. Did they create a Passport?
2. Did they preserve a meaningful memory?
3. Did they save it in the correct festival chapter?
4. Did they return?
5. When they returned, did the memory still feel valuable enough to revisit or continue?

If those behaviors do not occur, expanding Passport would be unjustified.

---

## 2. Product boundary

### Included

The first version includes only:

- One personal Passport
- Physically attended festivals
- One festival chapter per selected festival occurrence
- One memory during the required first-session journey
- Voice, writing, or one photo as the initial contribution
- An ordered collection of contributions inside that memory
- Private saving
- Returning to the saved memory
- Continuing, editing, or removing the memory
- Minimal Polaris guidance
- Basic Founding 100 research and measurement
- An optional second-memory or second-chapter action made available only after the core first-memory journey has been completed

### Explicitly excluded

The first version does not include:

- Community Relive
- Personal or shared Relive creation
- Shared From Afar
- Festival Hearts
- Stamps or collectibles
- NFC
- QR claiming
- Social feeds
- Followers or following
- Public profiles
- Likes, comments, reactions, or rankings
- Friend or crew features
- Messaging
- Automated movie or highlight-reel creation
- Automated cross-user pattern learning
- AI rewriting of the person’s memory
- Festival discovery for non-attendees
- `I Explored`, `Shared With Me`, or `I Dream Of`
- Multiple privacy audiences
- Video capture
- Prompts or requirements to create multiple memories during initial onboarding

The initial experience tests one memory only. After that core loop is complete, Passport may quietly allow a participant to create another memory in the same chapter or add another physically attended festival. This is necessary to observe voluntary repeat creation.

Passport must not prompt, reward, pressure, or coach participants into doing so during the primary measurement window. Second-memory and second-chapter behavior is secondary evidence, not part of completing the first experience.

Excluded features must not merely be hidden navigation items. They should not be built into the first test.

---

## 3. Experience principles

The first experience must obey these rules:

1. **Memory comes first.** Passport does not begin by asking users to collect, claim, or earn anything.
2. **Attendance must be truthful.** The chosen festival must be one the person physically attended.
3. **The user’s voice remains theirs.** Polaris may guide but must not rewrite, embellish, diagnose, or manufacture meaning.
4. **One meaningful question at a time.**
5. **Concrete details come before emotional interpretation.**
6. **Saving must be easy.** A person must be able to save an incomplete memory and return later.
7. **The memory is private by default.**
8. **The user controls additions, editing, and removal.**
9. **Uploading something does not give Passport ownership of it.**
10. **The experience must work under imperfect conditions.** The initial test should tolerate interruptions, weak connectivity, noise, and short attention spans where technically practical.
11. **Original history must not be silently rewritten.** Additions and edits must behave predictably and be represented honestly.
12. **Research intervention must not be mistaken for product retention.**

---

## 4. Exact user journey

### Step 1: Invitation

A Founding 100 participant receives a direct invitation containing a link to Passport.

The invitation says:

> Create your Passport and preserve one festival memory you never want to lose.

It must not advertise social networking, collectibles, Relive, or future features.

### Step 2: Create Passport

The person opens Passport and creates an account using the simplest reliable identity method available.

Required:

- Name or chosen Passport name
- Email or equivalent login identity
- Agreement to the minimum terms and privacy notice

Passport then confirms:

> Your Passport is ready. Let’s begin with one festival you experienced.

No profile biography, country, avatar, interests, genres, friend finding, or customization is required.

### Step 3: Choose a physically attended festival

The person searches for or selects a festival.

They must choose:

- Festival name
- Festival location
- Festival year or exact occurrence

Passport asks:

> Were you physically there at this festival?

Options:

- **Yes, I attended**
- **No**

Only **Yes, I attended** creates an `I Experienced` chapter.

If the person selects **No**, Passport explains:

> This first test is only for festivals you physically attended.

The person must select another festival or leave the experience. Passport must not quietly create an attendance record.

### Step 4: Create the festival chapter

After attendance confirmation, Passport creates a private festival chapter showing:

- Festival name
- Location
- Date or year
- `I Experienced`
- Empty memory state

The chapter offers one clear action:

> Preserve one memory

### Step 5: Polaris opens the memory

Polaris asks:

> What is one moment from **[Festival]** you never want to forget?

The person chooses one initial contribution type:

- **Speak it**
- **Write it**
- **Add a photo**

The three methods are equal. None is positioned as the correct or premium method.

### Step 6: Capture the first contribution

#### Voice

The person can:

- Start recording
- Stop recording
- Listen back
- Record again before saving
- Add the recording to the memory

Polaris does not interrupt during recording.

#### Writing

The person receives an open writing field.

Polaris does not provide a rigid form or demand polished storytelling.

#### Photo

The person can:

- Upload or take one photo
- Review it
- Replace it before saving
- Add it to the memory

A photo is allowed to be the only contribution in a saved memory.

Passport may offer, but must not require:

> What should this photo help you remember?

The person may respond using voice or writing or skip the question. Otherwise, photo would not honestly be an independent contribution type.

### Step 7: Optional Polaris follow-up

After the first contribution, Polaris may ask one optional follow-up:

> What made that moment matter to you?

Options:

- **Answer now**
- **Save and finish later**

If the person answers, the answer becomes another typed contribution in the same memory. It does not become a special fixed “follow-up field.”

The person can answer using:

- Voice
- Writing

Polaris must not ask a chain of emotional questions. One opening question and one optional meaning question are the maximum during the first session.

### Step 8: Review and save

The person sees:

- The correct festival chapter
- The ordered contributions currently in the memory
- The privacy status: **Private**
- A save control

Passport states:

> This memory will be saved privately inside your **[Festival]** chapter. You can return, continue, edit, or remove it later.

The person selects:

> Save memory

The system confirms:

> Saved to your **[Festival]** chapter.

The system must not show success until the memory and every included contribution have been durably saved.

### Step 9: Immediate chapter view

The person lands inside the festival chapter and sees the completed memory exactly as saved.

Available actions:

- Play, read, or view its contributions
- Continue memory
- Edit a contribution
- Remove a contribution
- Remove the entire memory
- Return to Passport

There is no publishing prompt, sharing prompt, reward animation, streak, score, or suggestion to create another memory.

### Step 10: Return later

Return must be measured through three separate conditions:

#### A. Unprompted return

The participant returns without receiving a Passport reminder or personal researcher outreach during the defined measurement window.

This is the strongest retention evidence.

#### B. Automated-reminder return

The participant returns after receiving one standardized product-generated reminder.

The reminder should be neutral:

> Your **[Festival]** memory is still in your Passport. Return when you’re ready to revisit it.

This measures whether the product can create a return when using a consistent, scalable reminder.

#### C. Personal-researcher-prompted return

A researcher personally contacts the participant and asks or reminds them to return.

This may help complete an interview or diagnose a problem, but it does **not** count as product retention. It must be recorded separately and excluded from unprompted and automated-reminder retention rates.

Recommended measurement intervals:

- First return window: 3–7 days after saving
- Later return window: 14–30 days after saving

Participants should be assigned to return conditions before the return window begins. Researchers must not improvise reminders based on who appears likely to return.

### Step 11: Revisit

After login, Passport takes the person to their Passport Home, where the recently created festival chapter is immediately visible.

When the person opens the chapter, the memory must appear exactly as previously saved.

Only after the person has had the opportunity to view, read, or hear it, Passport asks:

> Does this still feel like a memory worth keeping?

Options:

- **Yes**
- **Not sure**
- **No**

The answer is research data. It must not alter, hide, or delete the memory.

### Step 12: Continue or leave intact

The person may:

- Leave the memory unchanged
- Add a voice, writing, or photo contribution
- Edit an existing contribution
- Remove an individual contribution
- Remove the entire memory

Passport may ask:

> Is there anything you want to add now?

Options:

- **Add to this memory**
- **Not today**

Returning and choosing **Not today** can still be a meaningful return. Continued editing is not required to prove value.

### Step 13: Optional repeat creation

After the participant has completed the first-memory journey, Passport may make these ordinary controls available without prompting:

- **Add another memory** inside the existing festival chapter
- **Add another attended festival** to the Passport

These actions must not appear as part of onboarding completion, a reward, a push notification, or a Polaris prompt during the primary test.

Any second memory or second chapter must be initiated voluntarily. This behavior is secondary evidence of repeatable value and does not change the one-memory boundary of the required first experience.

---

## 5. Minimum screens required

The first version requires six core screens:

| ScreenRequired purpose  |                                                                                                    |
| ----------------------- | -------------------------------------------------------------------------------------------------- |
| **1. Create Passport**  | Establish a persistent personal account and accept the minimum terms and privacy notice.           |
| **2. Choose Festival**  | Select a festival occurrence and explicitly confirm physical attendance.                           |
| **3. Festival Chapter** | Show the correct `I Experienced` chapter and the memories stored within it.                        |
| **4. Preserve Memory**  | Ask the Polaris opening question and capture typed contributions through voice, writing, or photo. |
| **5. Review and Save**  | Show the ordered contributions, destination chapter, private status, and save action.              |
| **6. Passport Home**    | Let the person find, reopen, and optionally add attended-festival chapters across later sessions.  |

Authentication recovery, consent details, upload status, editing, and removal confirmation may appear as supporting dialogs or utility views. They do not justify additional product areas.

### Complete navigation flow

**Create Passport → Choose Festival → Festival Chapter → Preserve Memory → Review and Save → Festival Chapter → Passport Home on return → Festival Chapter → Saved Memory**

From the saved memory, the person may:

- View, read, or play its contributions
- Continue the memory
- Edit a contribution
- Remove a contribution
- Remove the entire memory
- Return to the Festival Chapter
- Return to Passport Home

If the person already has an account, sign-in bypasses Passport creation and returns them to Passport Home.

---

## 6. Polaris behavior

### What Polaris asks

#### Initial capture

> What is one moment from **[Festival]** you never want to forget?

#### Optional meaning question

> What made that moment matter to you?

#### Return visit

> Does this still feel like a memory worth keeping?

#### Optional continuation

> Is there anything you want to add now?

### What Polaris must not ask

Polaris must not:

- Ask several questions at once
- Begin with abstract questions such as “What did the festival mean to your identity?”
- Assume the experience was happy, healing, transformative, or positive
- Call the person “family,” “rave family,” or another intimate term without basis
- Claim to understand how the person feels
- Pressure the person to disclose emotional or private details
- Suggest answers
- Rewrite the memory into more dramatic language
- Judge the quality or importance of the memory
- Push the person to publish or share
- Compare the person’s memory with other users
- Infer relationships, mental state, substance use, or sensitive personal information

### Polaris timing

| MomentPolaris action                  |                                                              |
| ------------------------------------- | ------------------------------------------------------------ |
| Before festival selection             | None                                                         |
| After attendance confirmation         | Invite the person to preserve one memory                     |
| At memory creation                    | Ask one concrete opening question                            |
| After the first contribution          | Offer one optional meaning question                          |
| After saving                          | Confirm where the memory was saved                           |
| On return, after access to the memory | Ask whether it still feels worth keeping                     |
| After revisiting                      | Offer an optional continuation                               |
| During optional repeat creation       | Do not prompt the person to create another memory or chapter |

For the first test, Polaris can be a carefully scripted interface. It does not require generative AI.

### Claim being tested

Unless a comparison condition is deliberately added before the later cohorts, this test does **not** establish that Polaris improves completion, memory quality, or emotional meaning compared with an unguided experience.

Without a comparison condition, the test may establish only:

- Whether participants understand Polaris’s questions
- Whether the questions are useful for beginning or continuing a memory
- Whether the questions feel unnecessary, intrusive, confusing, or uncomfortable
- Whether the questions contribute to abandonment
- Whether participants can complete the experience with Polaris present

Any stronger claim would exceed the evidence.

### Optional small comparison condition

After Cohort 1 establishes that the basic experience works, the team may lock a small comparison into later cohorts:

- **Guided condition:** The approved Polaris opening question and optional meaning question
- **Minimal condition:** A neutral instruction such as “Preserve a memory from this festival,” with no meaning follow-up

The two conditions must otherwise use the same capture, saving, privacy, and return experience.

The comparison may examine:

- Memory-start rate
- Memory-save rate
- Abandonment
- Reported usefulness
- Comprehension
- Discomfort
- Willingness to create another memory

If sample size is too small for reliable causal conclusions, results must be treated as directional evidence only.

---

## 7. Information that must be saved

### Passport record

- Unique Passport ID
- Login identity
- Display name
- Passport creation timestamp
- Minimum accepted terms version
- Minimum accepted privacy version
- Account status

### Festival chapter record

- Unique chapter ID
- Passport ID
- Festival name
- Festival location
- Festival occurrence, date, or year
- Experience category: `I Experienced`
- Explicit physical-attendance confirmation
- Chapter creation timestamp
- Chapter last-updated timestamp

### Memory record

Each memory is a container for an ordered collection of typed contributions.

The memory record must include:

- Unique memory ID
- Chapter ID
- Memory creation timestamp
- Memory last-updated timestamp
- Privacy status: private
- Memory status:
  - Active
  - Removed
- Optional removal timestamp
- Ordered contribution references

A memory does not have one permanent “capture method.” Its contribution types may differ over time.

### Contribution record

Each voice recording, written passage, or photo is a separate contribution.

Each contribution must include:

- Unique contribution ID
- Memory ID
- Contribution type:
  - Voice
  - Writing
  - Photo
- Contribution order
- Original creation timestamp
- Current version timestamp
- Original content or secure file reference
- Current content or secure file reference
- Contribution status:
  - Active
  - Removed
- Optional removal timestamp
- Source context where relevant:
  - Initial response
  - Optional Polaris response
  - Later addition
- Version history or an equivalent auditable edit record sufficient to prevent silent rewriting

### Ordering

Contributions appear in the order they were originally added.

A later addition receives the next position in the memory. It must not silently replace or reorder earlier contributions.

Editing a contribution does not move it to the end of the memory. Its original position remains unchanged.

### Additions

When a person continues a memory:

- A new contribution record is created.
- It receives its own creation timestamp.
- It is added after existing active contributions.
- It may use voice, writing, or photo regardless of the original contribution type.
- The memory’s last-updated timestamp changes.
- Existing contributions remain intact unless separately edited or removed.

### Edits

When a person edits a contribution:

- The existing contribution retains its identity and position.
- The current version changes.
- The original creation timestamp remains unchanged.
- The current version timestamp updates.
- The edit must not be represented as if it were the original untouched content.
- The system must retain enough version information to diagnose disputes, restoration problems, or silent data corruption during the test.

The user-facing interface does not need to display a complex revision history in the first version. It must, however, communicate that the contribution was edited and show the appropriate updated timestamp.

### Timestamps

The interface should distinguish:

- **Created:** When the contribution was first saved
- **Edited:** When an existing contribution was last changed
- **Added:** When a later contribution joined the memory
- **Removed:** When a contribution or memory was removed

Timestamps must describe actual events. Editing must not overwrite the original creation timestamp.

### Contribution removal

When an individual contribution is removed:

- That contribution disappears from ordinary user access.
- The remaining contributions keep their established order.
- The system must not renumber or present the remaining contributions as though the removed contribution never existed in the underlying audit record.
- The contribution receives a removal status and timestamp.
- Backup, recovery, security, and legal-retention limitations must be disclosed accurately.

If the removed contribution was the only active contribution, Passport must ask whether the person intends to remove the entire memory.

### Memory removal

When the entire memory is removed:

- The memory and all its contributions disappear from ordinary user access.
- The memory receives a removal status and timestamp.
- It must no longer count as an active saved memory in product metrics.
- The system must not claim immediate physical erasure from every backup if that is not technically true.
- Any recovery window or permanent-removal process must be stated accurately.

### Research events

- Invitation date
- Assigned return condition
- Passport creation started
- Passport created
- Festival selection started
- Attendance confirmed
- Memory creation started
- Initial contribution type selected
- Contribution added
- Memory save attempted
- Memory saved
- Save failure or abandonment point
- Session ended
- Later session started
- Chapter reopened
- Memory viewed, played, or read
- Return source:
  - Unprompted
  - Automated reminder
  - Personal researcher prompt
- Return-value answer
- Contribution added later
- Contribution edited
- Contribution removed
- Memory removed
- Optional second memory started
- Optional second memory saved
- Optional second festival chapter created
- Staff intervention required
- Follow-up interview completed

Research events must measure behavior without analyzing memory contents across users.

### What should not be collected

Do not collect unless strictly required:

- Contacts
- Precise live location
- Social accounts
- Follower relationships
- Music preferences
- Demographic profiles
- Browsing behavior outside Passport
- Emotional classifications
- Automated personality or sentiment scores
- Cross-user memory patterns

---

## 8. Privacy, rights, access, and control

For this first test:

- Every memory is private.
- Ordinary access is limited to the creator.
- The person retains whatever ownership and legal rights they already hold.
- Uploading content does not give the person ownership of material belonging to someone else.
- Passport receives only the permissions clearly required to store and display the contribution back to its creator.
- The person can add, edit, or remove contributions and remove the complete memory.
- Removing content removes it from ordinary access, subject to accurately disclosed backup, security, recovery, and legal limitations.
- Research consent and product consent must not be treated as the same permission.

### Authorized staff access

Absolute claims that no staff member can ever access memory content should not be made unless the technical system actually guarantees that.

Staff access must instead follow these restrictions:

- Access is limited to specifically authorized personnel.
- Access is permitted only for a documented purpose such as investigating a user-reported failure, responding to a security incident, fulfilling a valid removal or access request, or conducting research for which the participant gave separate permission.
- Access must be limited to the minimum information necessary.
- Access must not be used for curiosity, casual review, marketing, entertainment, or unrelated product analysis.
- Where technically practical, access must be logged with the staff identity, time, affected record, and stated purpose.
- Researchers must not inspect memory content merely because a participant is part of the Founding 100.
- Reviewing a participant’s memory during an interview requires separate, specific permission.
- Any support access that materially affects the test must be recorded.

The first test does not need public, selected-person, or Community visibility controls because nothing can be shared.

---

## 9. What can be handled manually during Founding 100

Manual work is acceptable where it tests the central behavior without pretending the product is more automated than it is.

### May be manual

- Recruiting participants
- Sending initial invitation links
- Confirming participant eligibility
- Maintaining the initial festival list
- Adding a missing festival after a request
- Correcting festival metadata
- Assigning participants to return conditions
- Sending personal research follow-ups when clearly classified as research intervention
- Scheduling interviews
- Conducting interviews
- Recording research observations
- Reviewing funnel data
- Helping recover an account
- Responding to upload failures
- Moving a memory to the correct chapter after a confirmed support request
- Processing a participant’s deletion request
- Categorizing reported usability problems
- Tracking participants in a private research system

### Must not be faked manually

The following must work in the product itself:

- Creating a Passport
- Logging back in during a later session
- Creating the correct festival chapter
- Recording or uploading the chosen contribution type
- Saving the memory and its ordered contributions
- Persisting the memory across sessions
- Reopening it later
- Adding, editing, or removing contributions
- Removing the complete memory
- Keeping one user’s memories inaccessible to another user

If staff must manually save, reconstruct, or display the memory for normal use, the product has failed the test.

A purpose-limited support correction may diagnose a defect, but the affected participant must be marked as having required intervention and cannot be counted as an independent core-loop completion.

### Manual follow-up boundaries

Personal outreach may be used for research, support, or interviews. It must not count as product retention.

Returns must remain classified as:

- Unprompted
- Automated-reminder prompted
- Personal-researcher prompted

If a participant receives personal outreach before returning, that return cannot later be reclassified as unprompted or automated-reminder retention.

Repeated personal pressure contaminates the result and should not be used to manufacture a successful return rate.

---

## 10. Testing structure

Do not release this immediately to 100 people. That would waste participants on obvious defects.

Use staged cohorts.

### Cohort 1: Usability and baseline

- 5–10 participants
- Moderated or closely observed
- Goal: Find blocking usability, comprehension, trust, and technical problems
- Establish baseline behavior and realistic ranges for later thresholds
- Test whether the measurement events are recorded correctly
- Verify that return-source classification works
- Verify memory persistence across separate sessions
- Do not use this cohort as primary retention evidence

The initial numerical targets in this document are provisional hypotheses during Cohort 1.

After Cohort 1:

1. Review observed behavior and defects.
2. Correct blocking product or measurement problems.
3. Define the exact denominators and measurement windows.
4. Set and document the final pass, warning, and failure thresholds.
5. Lock those thresholds before Cohort 2 begins.

Thresholds must not be changed after seeing Cohort 2 or Cohort 3 results merely to make the outcome look successful. A change after locking requires a documented methodological reason and invalidates direct comparison with earlier results where applicable.

### Cohort 2: Core behavior

- 15–25 participants
- Mostly unmoderated
- Participants assigned to unprompted or automated-reminder conditions
- Personal researcher outreach allowed only after the relevant product-retention window closes, except for safety, privacy, or serious technical support
- Goal: Measure creation, saving, persistence, prompted return, unprompted return, and subjective value
- Use the thresholds locked after Cohort 1

### Cohort 3: Stronger validation

- 30–50 participants
- Unmoderated
- Preassigned return conditions:
  - No reminder during the defined window
  - One standardized automated reminder
- Personal researcher outreach excluded until the retention window ends, except for safety, privacy, or serious technical support
- Goal: Determine whether return behavior survives beyond moderation and founder intervention
- Use the same locked definitions and thresholds unless a documented protocol change creates a formally separate test

The product must earn access to each larger cohort by passing the previous cohort’s technical, trust, and usability gates.

---

## 11. Success measurements

### Primary outcome

The primary outcome is:

> A participant independently saves a meaningful memory from a physically attended festival and later returns in a separate session to view, hear, or continue it.

A personal-researcher-prompted return does not satisfy the retention part of this outcome.

### Funnel measurements

| MeasurementWhat it reveals                         |                                                                  |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| Invitation → Passport created                      | Whether the initial promise is understandable and compelling     |
| Passport created → Festival chapter created        | Whether users understand the attended-festival model             |
| Chapter created → Memory capture started           | Whether the product creates enough motivation to reflect         |
| Capture started → Memory saved                     | Whether capture and saving are usable                            |
| Memory saved → Chapter reopened in a later session | Whether the saved memory creates return value                    |
| Reopened → Memory consumed                         | Whether users revisit it rather than merely landing on the page  |
| Revisited → “Worth keeping”                        | Whether the memory retains subjective value                      |
| Revisited → Continued                              | Whether Passport supports an evolving memory                     |
| First memory completed → Voluntary second creation | Whether the value may be repeatable rather than one-time novelty |

### Separate return measurements

The results must report these independently:

| Return typeRetention interpretation     |                                                                   |
| --------------------------------------- | ----------------------------------------------------------------- |
| **Unprompted return**                   | Strongest evidence of natural product pull                        |
| **Automated-reminder return**           | Evidence that a scalable product reminder can reactivate the user |
| **Personal-researcher-prompted return** | Research participation only; not product retention                |

A combined “total return” number may be reported for operational context, but it must never replace the three separate rates.

### Provisional threshold hypotheses

These figures are not final acceptance criteria during Cohort 1. They are starting hypotheses to be evaluated against observed baseline behavior.

Among eligible, unmoderated participants who create a Passport:

- At least **70%** create a festival chapter.
- At least **60%** save one memory.
- **100%** of observed saved memories remain accessible, complete, correctly ordered, and attached to the correct account and chapter on later-session verification.
- At least **40%** of memory savers return within 14 days through either:
  - Unprompted return, or
  - One standardized automated reminder
- At least **25%** return unprompted during the defined window.
- At least **70%** of those who revisit say the memory is still worth keeping.
- At least **20%** of those who revisit add to or intentionally edit the memory.
- No confirmed cross-account exposure is acceptable.
- No confirmed loss of a successfully saved memory or contribution is acceptable.
- No more than **10%** of participants should require staff intervention to complete the core loop.

The continuation rate is secondary. A person can value a complete memory without adding to it.

After Cohort 1, final thresholds must be locked before later cohorts. The locked version becomes the actual decision standard.

### Persistence requirement

Persistence is tested across separate authenticated sessions.

A memory passes persistence verification only if:

- It can be reopened after the original session ends.
- All active contributions remain present.
- Contribution types remain correct.
- Contribution order remains correct.
- Content remains complete and usable.
- Creation and edit timestamps remain accurate.
- The memory remains attached to the correct festival chapter.
- The memory remains accessible only through the correct account.

Cross-device persistence is not part of this definition unless the test protocol explicitly includes more than one device. If cross-device testing is added, it must be named as a separate technical requirement and measured separately.

### Stop-test conditions

The test must stop new participant activity when either of these is confirmed:

- Loss or corruption of a successfully saved memory or contribution
- Cross-account access or exposure of private memory content

The team must:

1. Stop affected testing.
2. Preserve relevant logs and evidence.
3. Determine the scope and cause.
4. Inform affected participants when required and appropriate.
5. Correct the defect.
6. Verify the correction.
7. Decide explicitly whether and how testing can resume.

A later recovery from backup does not erase the fact that data loss occurred.

### Qualitative evidence

During follow-up interviews, ask:

1. What did you expect Passport to do?
2. Why did you choose that memory?
3. Did saving it here feel different from leaving it in your camera roll, notes, or social media?
4. What made you return—or not return?
5. Did the memory feel more valuable when you revisited it?
6. Was anything Polaris asked useful, uncomfortable, confusing, or unnecessary?
7. Would you preserve another festival memory without being asked by the research team?
8. What would you use instead if Passport did not exist?

The strongest qualitative evidence is not “I like this.” It is:

- “I remembered something I had forgotten.”
- “I added more because the first version felt incomplete.”
- “I wanted to do another festival.”
- “This gave the memory a place it did not have before.”
- A participant independently returns without prompting.
- A participant voluntarily creates another memory or attended-festival chapter.

---

## 12. Failure measurements

The first experience is failing if any of these patterns occur.

### Value failure

- People create Passports but do not preserve memories.
- Participants say their camera roll, notes, or social media already solves the problem adequately.
- Users save only because a researcher is watching.
- Meaningful return occurs only after personal researcher outreach.
- Automated reminders produce visits but no actual memory viewing.
- Revisited memories feel trivial, unnecessary, or embarrassing.
- Participants show no voluntary interest in another memory or attended-festival chapter.

### Conversation failure

- Polaris feels intrusive, artificial, repetitive, or emotionally manipulative.
- Participants do not understand what kind of memory to preserve.
- The optional meaning question causes abandonment.
- Users feel Passport is trying to manufacture emotional significance.
- Participants consistently skip Polaris because it adds no value.
- The team claims Polaris improved outcomes without a valid comparison condition.

### Product failure

- Users select the wrong festival occurrence.
- They misunderstand `I Experienced` and record festivals they did not physically attend.
- Voice, writing, or photo uploads fail.
- Contributions disappear, become corrupted, change order, or save in the wrong chapter.
- Returning users cannot find the memory.
- Edits silently overwrite creation history.
- Removal behaves differently from what Passport represents.
- Account recovery regularly requires founder involvement.
- Staff must regularly repair normal user actions.

### Trust failure

- Participants are unsure who can access their memory.
- Private memories are accessible to another user.
- A successfully saved memory or contribution is lost.
- Removal does not work as represented.
- Staff access content without authorization or a documented purpose.
- Researchers access content without the participant’s required permission.
- Users believe Passport owns their uploads.

Confirmed data loss or cross-account exposure stops the test until the cause is understood, corrected, and verified.

---

## 13. What must be proven before expansion

Passport must prove all of the following before adding Relive, Shared From Afar, collectibles, or social systems.

### 1. The memory problem is real

People must demonstrate that meaningful festival memories need a better home than a camera roll, notes app, or social post.

### 2. People will do the work

Participants must actually speak, write, or choose a meaningful photo. Saying the concept sounds good is worthless without creation behavior.

### 3. Festival chapters make sense

Users must understand why the memory belongs inside a specific festival chapter and be able to find it later.

### 4. Polaris is usable and appropriate

Without a comparison condition, the test must show only that Polaris is understandable, useful enough to support capture, and does not create unacceptable discomfort or abandonment.

Passport may claim that Polaris improves outcomes only if a properly defined comparison provides sufficient evidence.
### 5. Persistence creates value

The memory must survive accurately across separate sessions and remain accessible through the correct account.

Cross-device persistence is required only if cross-device use is explicitly added to the protocol.

### 6. Return behavior exists

A meaningful portion of users must return unprompted or after one automated reminder.

Personal researcher outreach must not be used as evidence of product retention.

### 7. The memory retains meaning

On return, users must still regard the memory as worth keeping.

### 8. Continuation is useful but not mandatory

Some users should naturally add to memories. Others should be satisfied leaving a complete memory untouched. Both behaviors are valid.

### 9. Trust is strong enough for personal material

Users must understand the privacy model, believe it, and feel in control of additions, editing, and removal.

### 10. Repeat creation shows some natural demand

After completing the required one-memory experience, some participants should voluntarily create another memory or another physically attended festival chapter without a research prompt.

This is secondary evidence gathered after the core test. It does not convert multiple-memory creation into a requirement of initial onboarding.

It is the cleanest early evidence that Passport may provide repeatable value rather than one-time novelty.

---

## 14. Expansion gate

Passport should not expand merely because provisional or locked numerical thresholds are narrowly met.

Expansion requires:

- Final thresholds locked before the later cohorts
- Core thresholds met across at least two unmoderated cohorts
- **100% observed persistence** for successfully saved memories in the tested sessions
- No unresolved data-loss, corruption, access-control, or serious privacy problems
- Separate evidence for unprompted and automated-reminder return
- Personal-researcher-prompted returns excluded from product-retention claims
- Participants describing a distinct advantage over camera rolls, notes, and social media
- Some voluntary creation of a second memory or second attended-festival chapter after the initial experience
- Polaris shown to be understandable, useful, and acceptably comfortable—or shown to improve outcomes through a defined comparison condition
- Core completion possible without staff intervention
- A documented decision identifying exactly which next assumption will be tested

Even after passing, Passport should add only one new value layer at a time.

The next feature must be chosen from evidence. Passing this test does not automatically justify Community Relive, Shared From Afar, Festival Hearts, stamps, NFC, QR, feeds, or automated movie creation.

---

## 15. Final definition

The narrowest First Passport experience is:

> A private personal Passport in which someone selects one festival they physically attended, creates one memory as an ordered collection of voice, written, or photo contributions, saves it inside that festival’s `I Experienced` chapter, and later returns in a separate session to revisit, continue, edit, or remove it.

After completing that core journey, the participant may voluntarily create another memory or attended-festival chapter. That repeat action is measured as secondary evidence and is not part of the required initial experience.

Direct assessment: **9.5/10 as a validation design**. The corrected version separates product retention from researcher intervention, defines the memory model properly, creates hard stop conditions for data loss and privacy exposure, and prevents unsupported claims about Polaris.

The largest remaining risk is still return value. Saving a memory proves that the workflow can be completed. It does not prove Passport deserves an ongoing place in someone’s life. Unprompted return and voluntary repeat creation are the strongest early evidence that it might.

**This approved First Passport Experience Definition replaces all earlier drafts and is the current source of truth.**
