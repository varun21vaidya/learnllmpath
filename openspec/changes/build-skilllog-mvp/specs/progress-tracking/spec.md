## Purpose

Persists each user's per-item completion state server-side so progress survives devices and sessions.

## ADDED Requirements

### Requirement: Toggle item completion
A signed-in user SHALL be able to mark any roadmap item complete or incomplete, and the change SHALL persist to the database within one request.

#### Scenario: Check an item
- **WHEN** a signed-in user clicks a roadmap item checkbox
- **THEN** the item is stored as completed for that user and UI reflects completion immediately (optimistic with rollback on failure)

#### Scenario: Uncheck an item
- **WHEN** a signed-in user unchecks a previously completed item
- **THEN** the completion record is removed and UI reflects the change after persistence

### Requirement: Progress isolation
Progress data SHALL be private per user: queries SHALL be scoped to the session user via row-level security such that no user can read or write another user's progress.

#### Scenario: Cross-user access blocked
- **WHEN** a signed-in user sends a crafted request referencing another user's item progress
- **THEN** the database rejects the operation and no other user's data is exposed

### Requirement: State sync on load
When a signed-in user loads the roadmap, item states SHALL reflect their persisted completions exactly.

#### Scenario: Reload shows saved state
- **WHEN** a user completes 3 items, logs out, signs back in from another browser, and opens the roadmap
- **THEN** the same 3 items render as completed and all others as not completed

### Requirement: Anonymous state is ephemeral
For anonymous visitors, checkbox controls SHALL NOT appear; content stays read-only.

#### Scenario: No checkboxes when anonymous
- **WHEN** roadmap renders without a session
- **THEN** no interactive check controls are shown
