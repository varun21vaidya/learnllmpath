## Purpose

Serves the full LLM/Agentic-AI roadmap as structured, publicly readable content with exact verified resource links, so visitors can browse the learning path without an account.

## ADDED Requirements

### Requirement: Roadmap is publicly readable
The system SHALL render the complete roadmap (all 10 pillars with their sections and items) to any visitor without requiring authentication.

#### Scenario: Anonymous visitor opens homepage
- **WHEN** a visitor without a session loads the site
- **THEN** all 10 pillars and their items are visible with titles, resource names, lengths, and badges

### Requirement: Structured content model
The system SHALL store roadmap content as structured data derived from `LLM_Agentic_AI_Roadmap_Tracker.md`, preserving pillar order (1–10), item order within pillars, subtopic names, resource names, lengths, [KEY] markers, gap-fill callouts, the 17-week suggested sequence, and portfolio projects.

#### Scenario: Content matches source file
- **WHEN** the roadmap data is generated from the source markdown
- **THEN** it contains exactly 10 pillars, every source item appears once with its resource name and length, and no [KEY] marker or gap-fill callout text is lost

### Requirement: Exact resource links open in new tab
Every resource entry SHALL carry a verified exact URL; video resources SHALL link directly to the specific video (YouTube watch URL), and every resource link SHALL open in a new browser tab (`target="_blank"` with `rel="noopener noreferrer"`).

#### Scenario: User clicks a video resource
- **WHEN** a logged-in or anonymous user clicks a video resource link
- **THEN** the exact target video page opens in a new tab at the correct video ID

#### Scenario: Resource type without deep-link
- **WHEN** a resource is a paid course (e.g., Udemy) that cannot be deep-linked to a specific video
- **THEN** it links to the course/search page and displays a visible type indicator distinguishing it from direct videos

### Requirement: Verified links
All resource URLs SHALL be verified reachable at build time of the content data; any resource where no confident exact URL exists SHALL be flagged in the data for manual review rather than silently guessed.

#### Scenario: Link verification pass
- **WHEN** the content data build runs its verification step
- **THEN** every URL returns HTTP 200 (or platform-equivalent success) and unverified entries are listed in a report instead of shipped as guesses

### Requirement: Badges and callouts rendered
[KEY] items SHALL display a distinct badge and each gap-fill callout SHALL render as a visually distinct callout block adjacent to its section.

#### Scenario: KEY item rendering
- **WHEN** a pillar section containing a [KEY] item renders
- **THEN** that item shows the key badge and callouts show styled highlight blocks with their full text

### Requirement: Sequence and portfolio pages
The system SHALL render the suggested 17-week sequence table and portfolio projects list as navigable views linked from the main navigation.

#### Scenario: Visitor opens sequence view
- **WHEN** any visitor selects "Sequence" navigation
- **THEN** the week-by-week plan renders with phase focus and linked resources
