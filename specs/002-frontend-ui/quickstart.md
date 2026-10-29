# Quickstart: Frontend UI Validation Guide

**Purpose**: Run the frontend locally and validate end-to-end feature correctness

## Prerequisites

- Node.js 20+ installed
- Backend running on http://localhost:3000 (see `backend/` README)
- PostgreSQL running with migrations applied

## Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on http://localhost:5173

## Validation Scenarios

### Scenario 1: Authentication Flow (US1)

1. Open http://localhost:5173 → should redirect to /login
2. Click "Register" link → navigate to /register
3. Fill: name="Test User", email="test@example.com", password="password123"
4. Submit → should auto-login and redirect to /groups
5. Refresh page → session persists (no redirect to login)
6. Click user menu → Logout → redirects to /login
7. Visit http://localhost:5173/groups directly → redirects to /login

**Expected**: All 7 steps pass without error toasts

### Scenario 2: Group & Member Management (US2)

1. Login → see empty state with "Create Group" CTA
2. Click "New Group" → enter "Goa Trip" → submit
3. Group appears in list → click to open
4. Navigate to Members tab → click "Add Member"
5. Add: "Alice", "Bob", "Charlie" (3 members)
6. Edit "Charlie" → rename to "Charles" → verify update
7. Delete "Charles" (zero balance) → member removed

**Expected**: 3 members created, 1 renamed, 1 deleted. No errors.

### Scenario 3: Add Expense with Equal Split (US3)

1. Open "Goa Trip" → Expenses tab → "Add Expense"
2. Fill: description="Dinner", amount=₹1000, payer=Alice, split=Equal, select all
3. Submit → expense appears in list showing "₹1,000.00 | Alice | Equal"
4. Verify shares: Alice=₹500.00, Bob=₹500.00 (2 members after deletion)

**Expected**: Expense created, amounts formatted correctly in ₹

### Scenario 4: Exact & Percentage Split Validation (US3)

1. Add Expense → amount=₹900, split=Exact
2. Enter Alice=₹500, Bob=₹300 (sum=800 ≠ 900) → inline error shown
3. Fix to Alice=₹500, Bob=₹400 → submit succeeds
4. Add Expense → amount=₹1000, split=Percentage
5. Enter Alice=60%, Bob=30% (sum=90 ≠ 100) → inline error shown
6. Fix to Alice=60%, Bob=40% → submit succeeds

**Expected**: Validation prevents bad submissions, corrected forms submit successfully

### Scenario 5: Balances & Settle Up (US4)

1. Open "Goa Trip" → Balances tab
2. Verify pairwise balances displayed (Bob owes Alice)
3. Click "Simplify Debts" → simplified view shows fewer transactions
4. Click "Settle Up" on Bob→Alice balance → settlement form opens
5. Enter amount=₹200 → submit → balance reduces
6. Enter amount exceeding debt → auto-capped and user informed

**Expected**: Balances display correctly, settlements reduce debt, auto-cap works

### Scenario 6: Edit & Delete Expense (US5)

1. Expenses tab → click Edit on first expense
2. Change amount from ₹1000 to ₹1200 → save
3. Verify expense shows ₹1,200.00 and balances update
4. Click Delete on expense → confirmation dialog → confirm
5. Verify expense removed and balances revert

**Expected**: Edit updates values + balances, delete reverts balances

### Scenario 7: Dashboard Overview (US6)

1. Open "Goa Trip" → Dashboard tab (default)
2. Verify total expenditure displayed
3. Verify member summary table (Alice, Bob — paid, owed, net)
4. Verify category breakdown (if categories used)

**Expected**: Dashboard aggregates match sum of individual expenses

### Scenario 8: Export Ledger (US7)

1. Settings tab → click "Export as Text"
2. Verify .txt file downloads with expenses, settlements, balances
3. Click "Export as PDF"
4. Verify .pdf file downloads (open to check formatting)

**Expected**: Both files download successfully with correct content

## Responsive Check

- Resize browser to 375px width → verify all pages usable
- Check tab bar scrolls on narrow screens
- Check forms remain usable on mobile width
- Check modals don't overflow viewport

## Error Handling Check

- Stop backend → try any action → verify error toast appears
- Restart backend → retry action → verify success
