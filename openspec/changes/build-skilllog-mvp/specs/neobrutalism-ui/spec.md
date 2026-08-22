## Purpose

Defines skilllog's neobrutalism visual system — bold borders, vivid accents, hard offset shadows, raw high contrast — applied consistently across every page and component.

## ADDED Requirements

### Requirement: Neobrutalist design tokens
The UI SHALL use a token set enforcing: thick solid borders (2–4px), hard offset shadows (no blur), a warm light background, vivid accent palette, high-contrast near-black text, and bold display typography; raw hex values outside tokens SHALL NOT appear in components.

#### Scenario: Visual consistency check
- **WHEN** any page renders
- **THEN** all bordered elements use token border widths/shadows and colors resolve from the defined palette

### Requirement: Core component kit
Buttons, inputs, cards, badges ([KEY], resource type), checkboxes, callouts (gap-fill), progress bars, nav, and modals SHALL exist as shared neobrutalist-styled components reused across pages rather than page-local styles.

#### Scenario: Component reuse
- **WHEN** roadmap cards, dashboard bars, and note editors render
- **THEN** they are composed from the shared component kit with consistent styling

### Requirement: Interaction feedback
Interactive elements SHALL give visible pressed/hover states via shadow-offset translation consistent with neobrutalism.

#### Scenario: Button press
- **WHEN** a user hovers then presses a primary button
- **THEN** hover shifts the shadow offset and press collapses it toward the surface

### Requirement: Responsive layout
All pages SHALL be usable from 360px mobile width to desktop: single-column stacking on small screens, multi-column pillar/dashboard layouts on large screens.

#### Scenario: Mobile viewport
- **WHEN** any page is viewed at 360px width
- **THEN** content stacks in one column, no horizontal scroll, controls remain reachable

### Requirement: Accessibility baseline
Interactive elements SHALL be keyboard-reachable with visible focus indicators meeting contrast requirements; color alone SHALL NOT convey state (badges include text labels).

#### Scenario: Keyboard navigation
- **WHEN** a user tabs through the roadmap
- **THEN** every checkbox, link, and button shows a visible focus ring and is operable by keyboard
