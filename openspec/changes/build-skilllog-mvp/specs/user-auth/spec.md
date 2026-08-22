## Purpose

Authenticates users via Google OAuth or email/password, maintains secure sessions, and gates progress/notes actions behind login while keeping content public.

## ADDED Requirements

### Requirement: Google OAuth sign-in
The system SHALL support sign-in with Google OAuth 2.0 and SHALL create a user record on first successful Google sign-in.

#### Scenario: First-time Google sign-in
- **WHEN** a visitor completes Google OAuth consent for an email with no existing account
- **THEN** an account is created for that email and the visitor lands on the dashboard signed in

#### Scenario: Returning Google sign-in
- **WHEN** a returning user signs in with Google using the same email
- **THEN** they are signed into their existing account with prior progress intact

### Requirement: Email/password accounts
The system SHALL support email/password sign-up and sign-in; passwords SHALL be stored only as bcrypt hashes with per-user salt and SHALL never be logged or returned by any API.

#### Scenario: Password sign-up
- **WHEN** a visitor submits a valid unused email and a password meeting the minimum policy (≥8 chars)
- **THEN** an account is created with a bcrypt hash and the user is signed in

#### Scenario: Duplicate email sign-up rejected
- **WHEN** a visitor signs up with an email that already has a password account
- **THEN** sign-up fails with a generic error that does not reveal account existence beyond standard behavior

#### Scenario: Wrong password rejected
- **WHEN** a user submits valid email with incorrect password
- **THEN** sign-in fails with a generic invalid-credentials error and no timing or enumeration hints

### Requirement: Secure sessions
Sessions SHALL use HTTP-only, Secure, SameSite=Lax cookies; session tokens SHALL be invalidated server-side on logout; auth secrets SHALL come exclusively from environment variables.

#### Scenario: Session cookie flags
- **WHEN** a session cookie is set
- **THEN** it carries HttpOnly, Secure, SameSite=Lax attributes

#### Scenario: Logout invalidates session
- **WHEN** a signed-in user clicks logout
- **THEN** the server destroys the session, the cookie is cleared, and the old token is rejected on next request

### Requirement: Auth-gated mutations
Checking/unchecking items and creating/editing/deleting notes SHALL require an authenticated session; anonymous attempts SHALL be rejected with 401 and the UI SHALL prompt sign-in.

#### Scenario: Anonymous check attempt
- **WHEN** an anonymous visitor attempts to toggle a roadmap item
- **THEN** the API rejects with 401 and the UI shows the sign-in prompt instead of toggling

### Requirement: CSRF and OAuth hardening
Auth flows SHALL use state/nonce protection (PKCE where available); callback mismatches SHALL fail closed.

#### Scenario: OAuth state mismatch
- **WHEN** an OAuth callback arrives with invalid or missing state
- **THEN** authentication is refused and the user sees an error, not a signed-in session
