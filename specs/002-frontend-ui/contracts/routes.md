# Frontend Route Contracts

## Public Routes (no auth required)

### GET /login → LoginPage

**Purpose**: User authentication form
**Renders**: Email input, password input, submit button, link to register
**On success**: Redirect to /groups
**On error**: Inline error message below form

### GET /register → RegisterPage

**Purpose**: User registration form
**Renders**: Name input, email input, password input, confirm password, submit button, link to login
**On success**: Auto-login + redirect to /groups
**On error**: Inline error message below form

---

## Protected Routes (redirect to /login if unauthenticated)

### GET /groups → GroupsListPage

**Purpose**: Main landing page showing all user's groups
**Data**: `useQuery(['groups'])` → GET /api/groups
**Renders**: 
- List of group cards (name, member count, creation date)
- "New Group" button → opens create group modal
- Empty state if no groups
**Actions**: Click group card → navigate to /groups/:id

### GET /groups/:id → GroupDetailPage

**Purpose**: Single group view with tab navigation
**Data**: `useQuery(['groups', id])` → GET /api/groups/:id
**Renders**:
- Group name header with settings gear icon
- Horizontal tab bar: Dashboard | Members | Expenses | Balances | Settings
- Active tab content below
**Default tab**: Dashboard (or read from ?tab= query param)
**Tab switching**: Updates URL query param `?tab=members` without page reload

---

## Tab Content Contracts (within GroupDetailPage)

### Tab: Dashboard (default)

**Data**: `useQuery(['groups', id, 'dashboard'])` → GET /api/groups/:id/dashboard
**Renders**:
- Total expenditure card (₹ formatted)
- Member summary table (name, paid, owed, net — color-coded)
- Category breakdown list (category name, total, count)

### Tab: Members

**Data**: `useQuery(['groups', id, 'members'])` → GET /api/groups/:id/members
**Renders**:
- Member list (display name, join date)
- "Add Member" button → inline form or modal
- Edit icon per member → inline rename
- Delete icon per member → confirmation dialog
**Mutations**:
- `useMutation` POST /api/groups/:id/members → invalidate `['groups', id, 'members']`
- `useMutation` PATCH /api/groups/:id/members/:memberId
- `useMutation` DELETE /api/groups/:id/members/:memberId

### Tab: Expenses

**Data**: `useQuery(['groups', id, 'expenses'])` → GET /api/groups/:id/expenses (paginated)
**Renders**:
- Expense list (description, amount ₹, payer name, date, category badge)
- "Add Expense" button → opens expense form modal
- Pagination (load more button using cursor)
- Per-expense: Edit icon, Delete icon
**Mutations**:
- `useMutation` POST /api/groups/:id/expenses → invalidate expenses + balances + dashboard
- `useMutation` PUT /api/groups/:id/expenses/:expenseId
- `useMutation` DELETE /api/groups/:id/expenses/:expenseId

### Tab: Balances

**Data**: 
- `useQuery(['groups', id, 'balances'])` → GET /api/groups/:id/balances
- `useQuery(['groups', id, 'balances', 'simplified'])` → GET /api/groups/:id/balances/simplified (on click)
**Renders**:
- Pairwise balance cards: "A owes B: ₹500" (color-coded)
- Member net summary: "+₹200 (owed)" or "-₹300 (owes)"
- "Simplify Debts" toggle/button → shows simplified transactions
- "Settle Up" button per balance → opens settlement form modal
- Settlement history list (payer → payee, amount, date)
**Mutations**:
- `useMutation` POST /api/groups/:id/settlements → invalidate balances + settlements + dashboard

### Tab: Settings

**Renders**:
- Group name (editable)
- "Export as Text" button → triggers download
- "Export as PDF" button → triggers download
- Danger zone: future delete group option
**Actions**:
- PATCH /api/groups/:id (rename)
- GET /api/groups/:id/export?format=text → download .txt
- GET /api/groups/:id/export?format=pdf → download .pdf
