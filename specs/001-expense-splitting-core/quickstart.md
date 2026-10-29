# Quickstart Validation Guide: Expense Splitting Core

**Feature**: 001-expense-splitting-core
**Purpose**: Runnable scenarios to validate the feature works end-to-end

## Prerequisites

- Node.js 20 LTS installed
- PostgreSQL 16 running (local or Docker)
- Database created: `splitwise_dev`
- Environment variables configured (see below)

### Environment Setup

```bash
# .env file at backend/ root
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/splitwise_dev"
JWT_SECRET="dev-secret-change-in-production"
JWT_REFRESH_SECRET="dev-refresh-secret-change-in-production"
PORT=3000
```

### Install & Migrate

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Server should start on `http://localhost:3000`.

---

## Validation Scenarios

### Scenario 1: User Registration & Authentication

**Goal**: Verify auth flow works end-to-end.

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure123","name":"Test User"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secure123"}'
# → Save accessToken from response
```

**Expected**: Registration returns 201 with user object. Login returns 200 with accessToken and refreshToken.

---

### Scenario 2: Create Group & Add Members

**Goal**: Verify group/member CRUD and deletion guard.

```bash
TOKEN="<accessToken from login>"

# Create group
curl -X POST http://localhost:3000/api/groups \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Trip to Goa"}'
# → Save groupId

# Add members
curl -X POST http://localhost:3000/api/groups/$GROUP_ID/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Rahul"}'

curl -X POST http://localhost:3000/api/groups/$GROUP_ID/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Priya"}'

curl -X POST http://localhost:3000/api/groups/$GROUP_ID/members \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Amit"}'
# → Save all 3 member IDs
```

**Expected**: Group created with 201. Each member returns 201 with unique UUID.

---

### Scenario 3: Add Expense (Equal Split)

**Goal**: Verify equal split with remainder handling.

```bash
# Add expense: ₹1000.01 (100001 paisa) split equally among 3
curl -X POST http://localhost:3000/api/groups/$GROUP_ID/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dinner",
    "totalAmount": 100001,
    "category": "FOOD",
    "splitMethod": "EQUAL",
    "payerId": "'$RAHUL_ID'",
    "participantIds": ["'$RAHUL_ID'", "'$PRIYA_ID'", "'$AMIT_ID'"]
  }'
```

**Expected**: Returns 201. Shares: Rahul 33334, Priya 33334, Amit 33333 (first two get +1 paisa remainder). Sum = 100001 ✓

---

### Scenario 4: Add Expense (Exact Amounts)

**Goal**: Verify exact split validation.

```bash
# Valid: amounts sum to total
curl -X POST http://localhost:3000/api/groups/$GROUP_ID/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Hotel",
    "totalAmount": 900000,
    "category": "ACCOMMODATION",
    "splitMethod": "EXACT",
    "payerId": "'$RAHUL_ID'",
    "shares": [
      {"memberId": "'$RAHUL_ID'", "amount": 400000},
      {"memberId": "'$PRIYA_ID'", "amount": 300000},
      {"memberId": "'$AMIT_ID'", "amount": 200000}
    ]
  }'

# Invalid: amounts don't sum to total (should fail)
curl -X POST http://localhost:3000/api/groups/$GROUP_ID/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Bad split",
    "totalAmount": 900000,
    "category": "FOOD",
    "splitMethod": "EXACT",
    "payerId": "'$RAHUL_ID'",
    "shares": [
      {"memberId": "'$RAHUL_ID'", "amount": 400000},
      {"memberId": "'$PRIYA_ID'", "amount": 300000}
    ]
  }'
```

**Expected**: First returns 201 with correct shares. Second returns 422 with VALIDATION_ERROR.

---

### Scenario 5: Settle Up & Auto-Cap

**Goal**: Verify settlement creation and overpayment capping.

```bash
# Check balances first
curl http://localhost:3000/api/groups/$GROUP_ID/balances \
  -H "Authorization: Bearer $TOKEN"

# Record settlement (within debt)
curl -X POST http://localhost:3000/api/groups/$GROUP_ID/settlements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payerId": "'$PRIYA_ID'",
    "payeeId": "'$RAHUL_ID'",
    "amount": 50000
  }'

# Record overpayment (should be auto-capped)
curl -X POST http://localhost:3000/api/groups/$GROUP_ID/settlements \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "payerId": "'$AMIT_ID'",
    "payeeId": "'$RAHUL_ID'",
    "amount": 9999999
  }'
```

**Expected**: First settlement: 201 with `amountCapped: false`. Second: 201 with `amountCapped: true` and amount reduced to actual outstanding debt.

---

### Scenario 6: Debt Simplification

**Goal**: Verify simplified debts are display-only and mathematically correct.

```bash
curl http://localhost:3000/api/groups/$GROUP_ID/balances/simplified \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: Returns suggested transactions. Sum of all member net balances = 0. `simplifiedTransactionCount` ≤ `originalTransactionCount`.

---

### Scenario 7: Dashboard

**Goal**: Verify dashboard totals are accurate.

```bash
curl http://localhost:3000/api/groups/$GROUP_ID/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: `totalExpenses` = sum of all expense amounts. Each member's `netBalance` values sum to 0. Category breakdown matches added expenses.

---

### Scenario 8: Edit Expense & Audit Log

**Goal**: Verify edit triggers balance recalculation and audit entry.

```bash
# Edit expense (get expenseId from scenario 3)
curl -X PUT http://localhost:3000/api/groups/$GROUP_ID/expenses/$EXPENSE_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Dinner (updated)",
    "totalAmount": 120000,
    "category": "FOOD",
    "splitMethod": "EQUAL",
    "payerId": "'$RAHUL_ID'",
    "participantIds": ["'$RAHUL_ID'", "'$PRIYA_ID'", "'$AMIT_ID'"],
    "version": 1
  }'

# Check audit log
curl "http://localhost:3000/api/groups/$GROUP_ID/audit-log?entityId=$EXPENSE_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: Edit returns 200 with version=2 and new shares. Audit log shows UPDATED entry with previousState and newState.

---

### Scenario 9: Member Deletion Guard

**Goal**: Verify members with non-zero balance cannot be deleted.

```bash
# Try to delete member with balance (should fail)
curl -X DELETE http://localhost:3000/api/groups/$GROUP_ID/members/$AMIT_ID \
  -H "Authorization: Bearer $TOKEN"
```

**Expected**: Returns 409 with MEMBER_HAS_BALANCE error.

---

### Scenario 10: Export

**Goal**: Verify text and PDF export.

```bash
# Text export
curl "http://localhost:3000/api/groups/$GROUP_ID/export?format=text" \
  -H "Authorization: Bearer $TOKEN"

# PDF export
curl "http://localhost:3000/api/groups/$GROUP_ID/export?format=pdf" \
  -H "Authorization: Bearer $TOKEN" \
  -o ledger.pdf
```

**Expected**: Text returns readable plain text with all transactions. PDF downloads as valid PDF file.

---

## Invariant Checks (Run After All Scenarios)

After executing all scenarios, verify these invariants hold:

1. **Balance zero-sum**: `GET /balances` → sum of all `memberSummaries[].netBalance` = 0
2. **Share completeness**: For every expense, sum of shares = totalAmount
3. **Audit completeness**: Every expense/settlement modification has a corresponding audit log entry
4. **Soft-delete integrity**: Deleted expenses/settlements don't affect balance calculations
