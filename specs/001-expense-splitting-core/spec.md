# Feature Specification: Expense Splitting Core

**Feature Branch**: `001-expense-splitting-core`

**Created**: 2026-06-04

**Status**: Draft

**Input**: User description: "Multi-user expense splitting application with group management, multiple split methods, settlement engine, debt simplification, and dashboard reporting."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Single User Creates Group and Adds Members (Priority: P1)

A logged-in user creates a new group (e.g., "Trip to Goa"), adds members by display name, and the system generates a unique backend ID for each member. The user can edit member display names later. Members with non-zero balances cannot be deleted from the group.

**Why this priority**: Groups and members are the foundational data structure—nothing else (expenses, settlements, balances) can exist without them.

**Independent Test**: Create a group, add 3 members, verify each has a unique ID, edit one name, attempt to delete a member with zero balance (succeeds) and one with non-zero balance (blocked).

**Acceptance Scenarios**:

1. **Given** a logged-in user, **When** they create a group with name "Trip to Goa", **Then** the group is created and visible in their dashboard.
2. **Given** an existing group, **When** the user adds a member "Rahul", **Then** a unique backend ID is generated and the member appears in the group roster.
3. **Given** a member with display name "Rahul", **When** the user edits it to "Rahul S.", **Then** the display name updates across all views.
4. **Given** a member with ₹0 balance, **When** the user deletes them, **Then** the member is removed from the group.
5. **Given** a member with non-zero balance, **When** the user attempts deletion, **Then** the system blocks the action with a clear error message.

---

### User Story 2 - Add Expense with Multiple Split Methods (Priority: P1)

A user adds an expense to a group specifying total amount (₹), payer, participants, category, and split method. The system supports Equal split, Exact Amounts, and Percentage-based splits. After adding, individual balances update immediately.

**Why this priority**: Expense creation is the core value proposition—without it, the app has no purpose. Multiple split methods are essential for real-world usability.

**Independent Test**: Add an expense of ₹1000 split equally among 4 members, verify each owes ₹250. Add a ₹900 expense split by exact amounts (₹300, ₹300, ₹300), verify balances. Add a ₹1000 expense split by percentage (50%, 30%, 20%), verify amounts.

**Acceptance Scenarios**:

1. **Given** a group with 4 members, **When** a user adds an expense of ₹1000 paid by Member A split equally, **Then** each of the other 3 members owes ₹250 to Member A.
2. **Given** a group with 3 members, **When** a user adds ₹900 split by exact amounts (₹400, ₹300, ₹200), **Then** balances reflect exact specified amounts.
3. **Given** a group with 3 members, **When** a user adds ₹1000 split by percentage (50%, 30%, 20%), **Then** balances reflect ₹500, ₹300, ₹200 respectively.
4. **Given** an expense being added, **When** percentages do not sum to 100% or exact amounts do not sum to total, **Then** the system rejects with a validation error.
5. **Given** an expense being added, **When** equal split results in remainder cents, **Then** remainder is deterministically assigned (no rounding loss).

---

### User Story 3 - Edit and Delete Expenses with Audit Log (Priority: P2)

A user can edit an existing expense (change amount, payer, participants, split method) or delete it. Every modification generates a log entry recording what changed, when, and by whom.

**Why this priority**: Users make mistakes—edit/delete is essential for usability, but the app delivers value even without it initially.

**Independent Test**: Add an expense, edit its amount, verify balances recalculate and a log entry is created. Delete an expense, verify balances revert and a log entry is created.

**Acceptance Scenarios**:

1. **Given** an existing expense of ₹1000, **When** the user edits the amount to ₹1200, **Then** all affected balances recalculate and a modification log entry is created.
2. **Given** an existing expense, **When** the user deletes it, **Then** all associated balance impacts revert and a deletion log entry is recorded.
3. **Given** an expense modification, **When** the log is viewed, **Then** it shows previous values, new values, timestamp, and the user who made the change.

---

### User Story 4 - Settle Up Between Members (Priority: P1)

Immediately after adding an expense (or at any time), the user can perform a "Settle Up" action which opens a dedicated settlement dialog. The user logs a payment from one member to another with a specific amount (₹). Settlements are strictly separate from expenses—they only reduce debt, never increase it.

**Why this priority**: Without settlements, debts only accumulate. Settling up is critical to the core loop of expense management.

**Independent Test**: After adding expenses, open Settle Up, record a payment of ₹500 from Member B to Member A, verify Member B's debt to Member A decreases by ₹500.

**Acceptance Scenarios**:

1. **Given** Member B owes ₹1000 to Member A, **When** a settlement of ₹500 from B to A is recorded, **Then** B's outstanding debt to A becomes ₹500.
2. **Given** the Settle Up dialog, **When** the user submits without selecting payer, payee, or entering amount, **Then** validation errors appear for required fields.
3. **Given** a recorded settlement, **When** the user edits it, **Then** the settlement dialog (not expense dialog) opens.
4. **Given** a settlement, **When** the system processes it, **Then** it is stored as a distinct record type from expenses.

---

### User Story 5 - Debt Simplification Algorithm (Priority: P2)

The system runs a background algorithm that optimizes peer-to-peer transactions to minimize the total number of transfers needed to settle all group debts. For example, if A owes B ₹100 and B owes C ₹100, the simplified result is A owes C ₹100 directly.

**Why this priority**: Adds significant user value by reducing real-world payment friction, but the app is functional without it.

**Independent Test**: Create a scenario with 4 members and multiple cross-debts, run simplification, verify the number of transactions is minimized while all net balances remain correct.

**Acceptance Scenarios**:

1. **Given** A owes B ₹100 and B owes C ₹100, **When** simplification runs, **Then** the system suggests A pays C ₹100 directly (1 transaction instead of 2).
2. **Given** a complex group with N members and multiple debts, **When** simplification runs, **Then** net balances for all members remain identical before and after.
3. **Given** simplified debts, **When** displayed to the user, **Then** each suggested transaction shows payer, payee, and amount clearly.

---

### User Story 6 - Dashboard and Reporting (Priority: P2)

The user views a dashboard showing total group expenses, each member's individual share, and net balances (who owes whom). This provides an at-a-glance overview of the group's financial state.

**Why this priority**: Essential for usability and transparency, but the core add/settle workflow functions without it.

**Independent Test**: After adding several expenses and settlements, view dashboard, verify total matches sum of expenses, individual shares are accurate, and net balances reflect all transactions.

**Acceptance Scenarios**:

1. **Given** a group with 5 expenses totaling ₹5000, **When** the dashboard loads, **Then** it displays "Total Expenses: ₹5000".
2. **Given** a group, **When** the dashboard loads, **Then** each member's total share (amount they owe or are owed) is displayed.
3. **Given** expenses and settlements in a group, **When** the dashboard loads, **Then** net balances for each member are shown (positive = owed money, negative = owes money).

---

### User Story 7 - Export Ledger for Non-Logged-In Members (Priority: P3)

The logged-in user can export the group's ledger (expenses, settlements, balances) as text or PDF to share with group members who don't have accounts.

**Why this priority**: Nice-to-have for sharing with non-app users, but not required for the core workflow.

**Independent Test**: Create a group with expenses and settlements, export as text, verify output contains all transactions and current balances in a readable format.

**Acceptance Scenarios**:

1. **Given** a group with expenses and settlements, **When** the user exports as text, **Then** a formatted text document is generated with all transactions and balances.
2. **Given** a group, **When** the user exports as PDF, **Then** a PDF file is generated with the complete ledger.
3. **Given** an exported document, **When** reviewed, **Then** it contains group name, member names, all expenses, all settlements, and final balances.

---

### Edge Cases

- What happens when an expense is split equally among participants and the amount doesn't divide evenly? (Extra paisa(s) are assigned to the first participant(s) in the list order.)
- What happens when a user tries to settle more than the outstanding debt? (System auto-caps the settlement at the outstanding amount and proceeds; user is informed of the adjustment.)
- What happens when all debts in a group are settled to zero? (Dashboard shows ₹0 balances, settle up action is still available but shows "All settled!")
- What happens when a member is added to a group after expenses exist? (New member starts with ₹0 balance, existing expenses are not retroactively modified.)
- What happens when the only payer in an expense is removed from participants? (Validation prevents this—payer must remain a participant or the expense becomes invalid.)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow a single user to register and log in with credentials.
- **FR-002**: System MUST allow the logged-in user to create groups with a name.
- **FR-003**: System MUST generate a unique backend ID for each member added to a group.
- **FR-004**: System MUST allow editing of member display names.
- **FR-005**: System MUST block deletion of any member with a non-zero balance.
- **FR-006**: System MUST support adding expenses with: total amount (₹), payer, participants, and category (predefined list: Food, Transport, Accommodation, Entertainment, Utilities, Other — "Other" allows a freeform note).
- **FR-007**: System MUST support three split methods: Equal, Exact Amounts, and Percentages.
- **FR-008**: System MUST validate that exact amounts sum to the total and percentages sum to 100%.
- **FR-009**: System MUST handle remainder cents in equal splits by assigning extra paisa(s) to the first participant(s) in the list (deterministic, zero rounding loss).
- **FR-010**: System MUST allow editing existing expenses with full recalculation of affected balances.
- **FR-011**: System MUST allow deletion of expenses with reversion of balance impacts.
- **FR-012**: System MUST create an audit log entry for every expense or settlement modification or deletion.
- **FR-013**: System MUST provide a "Settle Up" action that opens a dedicated settlement dialog.
- **FR-014**: Settlement dialog MUST require payer, payee, and amount (₹).
- **FR-015**: Settlements MUST be stored as a distinct data type from expenses.
- **FR-016**: Editing a settlement MUST open the settlement dialog, never the expense dialog.
- **FR-017**: System MUST run a debt simplification algorithm to minimize the number of peer-to-peer transactions and display results as suggestions (read-only; actual balances are not modified).
- **FR-018**: Debt simplification MUST preserve net balances for all members (mathematical invariant). Simplified view is a display layer over unchanged source-of-truth pairwise balances.
- **FR-019**: System MUST display a dashboard with total group expenses, individual shares, and net balances.
- **FR-020**: System MUST provide export functionality in text and PDF formats for sharing ledgers.
- **FR-021**: System MUST enforce that balances across all members in a group sum to zero at all times.

### Key Entities

- **User**: The single authenticated account holder who manages all groups. Has credentials and a profile.
- **Group**: A named collection of members for tracking shared expenses. Created and managed by the User.
- **Member**: A participant within a group. Has a unique backend ID and display name. May or may not have a user account.
- **Expense**: A financial record that increases group debt. Has amount (₹), payer (one Member), participants (one or more Members), category, split method, and timestamp.
- **Settlement**: A financial record that decreases group debt. Has payer (Member), payee (Member), amount (₹), and timestamp. Strictly separate from Expense.
- **Balance**: The net amount owed between any two members in a group. Derived from expenses and settlements.
- **AuditLog**: A record of every modification to expenses or settlements. Contains previous state, new state, timestamp, and actor.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can create a group and add their first expense in under 2 minutes.
- **SC-002**: Equal splits across any number of participants produce mathematically exact results (zero rounding loss verified by sum check).
- **SC-003**: Net balances across all group members sum to exactly ₹0 after any operation (expense, settlement, edit, delete).
- **SC-004**: Debt simplification reduces transaction count by at least 30% for groups with 4+ members and 3+ cross-debts.
- **SC-005**: Dashboard loads and displays accurate totals within 2 seconds for groups with up to 500 expenses.
- **SC-006**: Every expense/settlement modification generates an audit log entry within the same operation (no eventual consistency delay).
- **SC-007**: Export produces a complete, readable document containing all transactions and current balances.

## Clarifications

### Session 2026-06-04

- Q: How are remainder cents assigned in equal splits? → A: First participant(s) in the list receive the extra paisa(s).
- Q: What happens when a settlement exceeds outstanding debt? → A: Auto-cap at outstanding amount (accept submission, reduce to what's owed).
- Q: Does the audit log cover settlement modifications too? → A: Yes, audit log covers both expense and settlement modifications.
- Q: Are expense categories predefined or freeform? → A: Predefined list (Food, Transport, Accommodation, Entertainment, Utilities, Other) with "Other" allowing a note.
- Q: Is debt simplification display-only or does it modify actual balances? → A: Display-only suggestions; actual pairwise balances remain unchanged.

## Assumptions

- The application has a single logged-in user who manages groups on behalf of all members (members themselves do not log in independently).
- All amounts are in Indian Rupees (₹) with paisa precision (2 decimal places).
- The debt simplification algorithm runs on-demand or when balances are viewed, not as a real-time streaming process.
- Group sizes are expected to be small (2–20 members) for the initial version.
- Export functionality targets text and PDF only; other formats (CSV, Excel) are out of scope for v1.
- The application is a web-based service (API + frontend) but the spec is agnostic to specific frontend framework.
- Member IDs are system-generated and opaque; members do not need to create their own accounts.
