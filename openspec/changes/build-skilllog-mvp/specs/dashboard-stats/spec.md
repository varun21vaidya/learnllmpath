## Purpose

Shows users their progress at a glance: completion percentages per pillar, overall bar, and stats including estimated hours remaining.

## ADDED Requirements

### Requirement: Progress dashboard
A signed-in user SHALL see a dashboard with overall completion percentage, per-pillar completion percentages, and completed/total item counts.

#### Scenario: Dashboard math
- **WHEN** a user with 9 of 45 items complete opens the dashboard
- **THEN** overall shows 20% and each pillar shows its own correct percentage

#### Scenario: Empty dashboard
- **WHEN** a new user with zero completions opens the dashboard
- **THEN** all percentages show 0% without errors

### Requirement: Estimated hours remaining
The dashboard SHALL compute remaining estimated hours from item lengths (excluding non-numeric "read"/"docs"/"Udemy" entries or counting them with a declared convention) based on the user's incomplete items.

#### Scenario: Hours calculation
- **WHEN** a user completes some timed items and views the dashboard
- **THEN** remaining hours equal total source hours minus completed timed hours, with untimed types handled by the documented convention

### Requirement: Streak view
The dashboard SHALL display a streak view computed from days on which the user completed at least one item: current streak (consecutive days ending today or yesterday) and longest streak.

#### Scenario: Current streak increments
- **WHEN** a user completes an item today after completing one yesterday
- **THEN** current streak shows 2

#### Scenario: Streak breaks
- **WHEN** a user's last completion was 3+ days ago
- **THEN** current streak resets to 0 while longest streak persists

### Requirement: Anonymous stats handling
Dashboard/stats pages SHALL require sign-in; anonymous visitors SHALL be redirected to sign-in.

#### Scenario: Anonymous dashboard redirect
- **WHEN** an anonymous visitor opens /dashboard
- **THEN** they are redirected to the sign-in flow
