## Purpose

Validates learning after each pillar with generated MCQ quizzes; passing unlocks tracking of the next pillar and best scores persist to the dashboard.

## ADDED Requirements

### Requirement: Per-pillar quizzes
Each of the 10 pillars SHALL have one quiz of 8–12 multiple-choice questions (4 options each) generated from that pillar's roadmap content, covering its [KEY] concepts and gap-fill warnings.

#### Scenario: Quiz exists per pillar
- **WHEN** any pillar page is opened by a signed-in user
- **THEN** a "Take quiz" entry point for exactly that pillar is available with 8–12 questions

### Requirement: Instant feedback with explanations
Selecting an answer SHALL immediately show correct/incorrect state plus a short explanation referencing the source resource.

#### Scenario: Answer feedback
- **WHEN** user selects an option
- **THEN** the chosen option renders right/wrong styling, the correct option is revealed, and an explanation with a link back to the related resource displays

### Requirement: Pass gate on next pillar
A signed-in user SHALL score at least 70% on a pillar's quiz before the next pillar's items become checkable; until passed, the next pillar renders read-only with a visible lock notice. Public anonymous viewing SHALL remain ungated (read-only already).

#### Scenario: Gate blocks checking
- **WHEN** a signed-in user who has not passed Pillar 1's quiz attempts to check an item in Pillar 2
- **THEN** the attempt is rejected server-side and the UI shows the lock notice with a link to the pending quiz

#### Scenario: Passing unlocks
- **WHEN** the user scores ≥70% on Pillar 1's quiz
- **THEN** Pillar 2's checkboxes become enabled immediately without re-login

### Requirement: Best score persistence
The system SHALL persist each user's best score per quiz; retaking a quiz SHALL update the stored score only when it improves.

#### Scenario: Retake with lower score
- **WHEN** a user scoring 90% retakes and scores 60%
- **THEN** stored best remains 90% and both attempts' pass/fail outcomes are respected for gating

### Requirement: Dashboard integration
The dashboard SHALL display best quiz scores per pillar alongside completion percentage.

#### Scenario: Dashboard shows scores
- **WHEN** a signed-in user opens the dashboard after passing two quizzes
- **THEN** those pillars show their best scores and unpassed quizzes show as not yet passed

### Requirement: Server-side validation
Quiz grading SHALL occur server-side; the client SHALL NOT receive correct answers before submission of each question response, and gate checks SHALL be enforced in mutation handlers, not only in UI.

#### Scenario: Crafted bypass rejected
- **WHEN** a signed-in user submits a forged toggle action for a gated pillar without passing
- **THEN** the server rejects the mutation regardless of UI state
