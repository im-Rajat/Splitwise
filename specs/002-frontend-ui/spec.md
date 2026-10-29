# Feature Specification: Frontend UI

**Feature Branch**: `002-frontend-ui`

**Created**: 2026-06-05

**Status**: Draft

**Input**: User description: "The backend is already created, now I want to create the frontend also so I can run on my local"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authentication Flow (Priority: P1)

A user opens the app in their browser, sees a login/register form, creates an account or signs in, and is taken to their dashboard. JWT tokens are stored securely in memory with refresh token rotation so the session persists across page refreshes.

**Why this priority**: Without authentication, no other feature is accessible. This is the entry point to the entire application.

**Independent Test**: User can register, log in, refresh the page without losing session, and log out. Accessing protected pages without auth redirects to login.

**Acceptance Scenarios**:

1. **Given** an unauthenticated user, **When** they visit any protected page, **Then** they are redirected to the login screen
2. **Given** a new user, **When** they fill the registration form with valid details, **Then** an account is created and they are logged in automatically
3. **Given** a registered user, **When** they enter correct credentials, **Then** they see their group dashboard
4. **Given** a logged-in user, **When** they refresh the page, **Then** the session persists via token refresh
5. **Given** a logged-in user, **When** they click logout, **Then** tokens are cleared and they see the login screen

---

### User Story 2 - Group & Member Management (Priority: P1)

A user creates a new expense group (e.g., "Goa Trip"), adds members by display name, edits member names, and deletes members who have zero balance. The group list is the main navigation hub.

**Why this priority**: Groups are the container for all other features. Without group/member UI, expenses cannot be created.

**Independent Test**: User can create a group, add 3 members, rename one, delete one with zero balance, and see the group in their list.

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they click "New Group", **Then** a form appears to enter group name
2. **Given** a group exists, **When** the user adds a member by display name, **Then** the member appears in the group's member list
3. **Given** a member with zero balance, **When** the user deletes them, **Then** the member is removed
4. **Given** a member with non-zero balance, **When** the user tries to delete them, **Then** an error message explains they must settle first
5. **Given** multiple groups exist, **When** the user views their dashboard, **Then** all groups are listed with summary info

---

### User Story 3 - Add & View Expenses (Priority: P1)

A user adds an expense to a group by entering description, amount, payer, split method (equal/exact/percentage), and selecting participants. They can view all expenses in a list and see expense details.

**Why this priority**: Expense creation is the core value proposition—splitting costs among members.

**Independent Test**: User can add a ₹1000 expense split equally among 4 members, view it in the list, and see each member's share in the detail view.

**Acceptance Scenarios**:

1. **Given** a group with members, **When** the user clicks "Add Expense", **Then** a form shows fields for description, amount, payer, split method, and participants
2. **Given** the user selects "Equal" split, **When** they submit the expense, **Then** the amount is divided equally (with remainder handling) and the expense appears in the list
3. **Given** the user selects "Exact" split, **When** the entered shares don't sum to the total, **Then** a validation error is shown before submission
4. **Given** the user selects "Percentage" split, **When** percentages don't sum to 100, **Then** a validation error is shown
5. **Given** expenses exist, **When** the user views the expense list, **Then** expenses show description, amount, payer, and date

---

### User Story 4 - View Balances & Settle Up (Priority: P1)

A user views who owes whom in a group (pairwise balances) by navigating to the "Balances" tab within the group detail page, sees simplified payment suggestions, and records a settlement between two members. The group detail page uses a horizontal tab bar (Members / Expenses / Balances / Settings) to switch between sections without leaving the page.

**Why this priority**: Viewing balances and settling debts completes the core expense-splitting loop.

**Independent Test**: After adding expenses, user sees correct pairwise balances, views simplified suggestions, and can record a settlement that reduces the debt.

**Acceptance Scenarios**:

1. **Given** a group with expenses, **When** the user navigates to the "Balances" tab, **Then** pairwise balances are displayed showing who owes whom and how much
2. **Given** pairwise balances exist, **When** the user clicks "Simplify", **Then** optimized payment suggestions are shown with reduced transaction count
3. **Given** a balance exists, **When** the user clicks "Settle Up" and enters an amount, **Then** a settlement is recorded and balances update
4. **Given** a settlement exceeds the outstanding debt, **When** the user submits, **Then** the amount is auto-capped and user is informed

---

### User Story 5 - Edit & Delete Expenses/Settlements (Priority: P2)

A user edits an existing expense (change amount, split, participants) or deletes it. Same for settlements. Balances recalculate automatically.

**Why this priority**: Corrections are essential for real-world use but not blocking the initial demo flow.

**Independent Test**: User edits an expense amount, sees balances update, then deletes the expense and confirms balances revert.

**Acceptance Scenarios**:

1. **Given** an expense exists, **When** the user clicks "Edit", **Then** a pre-filled form appears with current values
2. **Given** the user changes the expense amount, **When** they save, **Then** the updated expense shows new values and balances recalculate
3. **Given** another user modified the expense, **When** the user submits an edit, **Then** a conflict error is shown (optimistic locking)
4. **Given** an expense exists, **When** the user clicks "Delete" and confirms, **Then** the expense is soft-deleted and balances revert

---

### User Story 6 - Dashboard Overview (Priority: P2)

A user views a group dashboard showing total expenses, per-member summaries (paid, owes, net), and category breakdown. The dashboard is the default tab shown when opening a group, giving immediate at-a-glance financial context.

**Why this priority**: Provides valuable at-a-glance information but all underlying data is already viewable via other screens.

**Independent Test**: After several expenses across categories, dashboard displays correct totals, member summaries, and category chart/breakdown.

**Acceptance Scenarios**:

1. **Given** a group with expenses, **When** the user views the dashboard, **Then** total group expenditure is displayed
2. **Given** multiple categories used, **When** viewing dashboard, **Then** a category breakdown is shown (list or chart)
3. **Given** multiple members, **When** viewing dashboard, **Then** each member's total paid, total owed, and net balance are shown

---

### User Story 7 - Export Ledger (Priority: P3)

A user exports the group ledger as a text file or PDF to share with members who don't have an account.

**Why this priority**: Nice-to-have sharing feature; not critical for local usage.

**Independent Test**: User clicks "Export as Text" and receives a formatted plain text download. User clicks "Export as PDF" and receives a PDF file.

**Acceptance Scenarios**:

1. **Given** a group with expenses, **When** the user clicks "Export as Text", **Then** a .txt file downloads with formatted expenses, settlements, and balances
2. **Given** a group with expenses, **When** the user clicks "Export as PDF", **Then** a .pdf file downloads with the same information

---

### Edge Cases

- What happens when the JWT access token expires mid-session? The app silently refreshes via the refresh token; if that fails, redirect to login.
- What happens when the backend is unreachable? Show a user-friendly error toast and allow retry.
- What happens when the user has no groups? Show an empty state with a prominent "Create Group" call-to-action.
- What happens when an expense form has invalid data? Show inline validation errors before allowing submission.
- What happens on mobile-width screens? The UI must be responsive and usable on screens down to 375px wide.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a registration form (email, password, name) that calls POST /api/auth/register
- **FR-002**: System MUST provide a login form (email, password) that calls POST /api/auth/login
- **FR-003**: System MUST store access tokens in memory (not localStorage) and use refresh token rotation via POST /api/auth/refresh
- **FR-004**: System MUST redirect unauthenticated users to the login page for all protected routes
- **FR-005**: System MUST display a list of the user's groups fetched from GET /api/groups
- **FR-006**: System MUST provide a form to create groups (POST /api/groups) and add members (POST /api/groups/:id/members)
- **FR-007**: System MUST provide an expense creation form supporting Equal, Exact, and Percentage split methods
- **FR-008**: System MUST perform client-side validation (exact shares sum, percentage sum = 100) before API submission
- **FR-008a**: System MUST display all monetary amounts in ₹ format with Indian locale comma separators and 2 decimal places (e.g., ₹1,000.50), converting from backend paisa integers (divide by 100)
- **FR-009**: System MUST display expense lists with pagination (cursor-based, matching backend)
- **FR-010**: System MUST display pairwise balances from GET /api/groups/:id/balances
- **FR-011**: System MUST display simplified debt suggestions from GET /api/groups/:id/balances/simplified
- **FR-012**: System MUST provide a settlement form (payer, payee, amount) calling POST /api/groups/:id/settlements
- **FR-013**: System MUST allow editing expenses and settlements with pre-filled forms (PUT endpoints)
- **FR-014**: System MUST allow deleting expenses and settlements with confirmation dialog (DELETE endpoints)
- **FR-015**: System MUST handle optimistic locking conflicts by showing an error and offering to reload
- **FR-016**: System MUST display the group dashboard (totals, member summaries, category breakdown) from GET /api/groups/:id/dashboard
- **FR-017**: System MUST trigger file downloads for text/PDF export from GET /api/groups/:id/export?format=text|pdf
- **FR-018**: System MUST show loading spinners during API calls, toast notifications for success (auto-dismiss after 4s, bottom-right) and persistent error toasts with dismiss button. Form validation errors MUST be shown inline below the relevant field.
- **FR-019**: System MUST be responsive and usable on screens from 375px to 1920px wide
- **FR-020**: System MUST provide a logout action that clears tokens and redirects to login
- **FR-021**: System MUST cache server data client-side using TanStack Query with automatic background refetch on tab focus and stale-time-based invalidation

### Key Entities

- **Page/Route**: A distinct screen in the SPA mapped to a URL path (login, groups list, group detail)
- **Group Detail Tabs**: Horizontal tab bar within the group page — Dashboard (default), Members, Expenses, Balances, Settings — allowing in-page section switching
- **API Client**: A typed service layer that encapsulates all HTTP calls to the backend with auth header injection and token refresh logic
- **Query Cache**: TanStack Query cache layer that manages server state — caching responses, deduplicating requests, and auto-refetching stale data
- **Auth Context**: Global state holding current user info and token management functions
- **Group View**: Composite view combining members, expenses, settlements, and balances for a single group via tabs

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the full flow (register → create group → add members → add expense → view balances → settle up) in under 5 minutes on first use
- **SC-002**: All pages render correctly on viewport widths from 375px to 1920px
- **SC-003**: Page transitions complete in under 300ms (no full-page reloads)
- **SC-004**: Users receive feedback (loading spinner or error message) within 200ms of any action
- **SC-005**: Session persists across page refresh without requiring re-login (until refresh token expires)
- **SC-006**: 100% of backend API endpoints are consumable through the frontend UI
- **SC-007**: Users can understand their balance status (who owes whom) within 5 seconds of viewing the balances screen

## Assumptions

- The backend API is already fully implemented and running on localhost:3000
- Target users have a modern browser (Chrome, Firefox, Safari, Edge — latest 2 versions)
- Mobile native app is out of scope — responsive web only
- Real-time updates (WebSocket) are out of scope for v1; manual refresh is acceptable
- Internationalization (i18n) is out of scope for v1; UI will be in English with ₹ (INR) currency
- No offline support required — active internet connection assumed
- The backend CORS is already configured to allow frontend origin (localhost:5173)

## Clarifications

### Session 2026-06-05

- Q: What navigation layout should the group detail page use? → A: Tab bar within group page (Members / Expenses / Balances / Settings)
- Q: What state management approach for server data? → A: TanStack Query (React Query) for caching with automatic refetch
- Q: How should amounts be displayed to users? → A: ₹1,000.50 format (Indian locale with comma separators, 2 decimal places, paisa→rupees conversion)
- Q: Where should the group dashboard summary appear in the tab layout? → A: Dashboard is the default landing view when a group is opened (first tab)
- Q: How should error notifications and success feedback be presented? → A: Toast notifications (bottom-right, auto-dismiss success after 4s, persistent errors with dismiss button)
