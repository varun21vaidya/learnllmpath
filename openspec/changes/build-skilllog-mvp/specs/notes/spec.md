## Purpose

Lets each user keep private notes attached to roadmap resources for later reference.

## ADDED Requirements

### Requirement: Create and edit notes
A signed-in user SHALL be able to create a note on any roadmap item and edit it later; notes SHALL be plain text with length capped (e.g., ≤5000 chars) and sanitized before storage/rendering.

#### Scenario: Save a note
- **WHEN** a signed-in user types a note on an item and saves
- **THEN** the note persists and renders back unchanged for that user

#### Scenario: Edit existing note
- **WHEN** a signed-in user edits a saved note and saves again
- **THEN** only the latest version remains retrievable

### Requirement: Notes are private
Notes SHALL be visible only to their author via row-level security; they SHALL never appear in responses to other users or anonymous visitors.

#### Scenario: Other user cannot read note
- **WHEN** user B requests user A's note by item ID
- **THEN** the response contains no note data from user A

### Requirement: Delete notes
A signed-in user SHALL be able to delete their own note.

#### Scenario: Delete own note
- **WHEN** a signed-in user deletes their note
- **THEN** it is removed from storage and no longer rendered
