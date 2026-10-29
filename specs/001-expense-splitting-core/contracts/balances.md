# API Contracts: Balances & Dashboard

**Base path**: `/api/groups/:groupId`
**Auth**: All endpoints require `Authorization: Bearer <token>` header.

## GET /api/groups/:groupId/balances

Get pairwise balances for all members in the group.

**Response 200**:
```json
{
  "groupId": "uuid",
  "groupName": "Trip to Goa",
  "balances": [
    {
      "from": { "id": "uuid", "displayName": "Priya" },
      "to": { "id": "uuid", "displayName": "Rahul" },
      "amount": 25000
    },
    {
      "from": { "id": "uuid", "displayName": "Amit" },
      "to": { "id": "uuid", "displayName": "Rahul" },
      "amount": 15000
    }
  ],
  "memberSummaries": [
    { "id": "uuid", "displayName": "Rahul", "netBalance": 40000 },
    { "id": "uuid", "displayName": "Priya", "netBalance": -25000 },
    { "id": "uuid", "displayName": "Amit", "netBalance": -15000 }
  ]
}
```

**Note**: `amount` is always positive. `from` owes `to`. Net balances: positive = owed money (creditor), negative = owes money (debtor). Sum of all netBalance MUST = 0.

---

## GET /api/groups/:groupId/balances/simplified

Get simplified (minimized) debt suggestions. Display-only; does not modify actual balances.

**Response 200**:
```json
{
  "groupId": "uuid",
  "groupName": "Trip to Goa",
  "simplifiedTransactions": [
    {
      "from": { "id": "uuid", "displayName": "Priya" },
      "to": { "id": "uuid", "displayName": "Rahul" },
      "amount": 25000
    },
    {
      "from": { "id": "uuid", "displayName": "Amit" },
      "to": { "id": "uuid", "displayName": "Rahul" },
      "amount": 15000
    }
  ],
  "originalTransactionCount": 4,
  "simplifiedTransactionCount": 2,
  "reductionPercentage": 50
}
```

---

## GET /api/groups/:groupId/dashboard

Get dashboard summary for the group.

**Response 200**:
```json
{
  "groupId": "uuid",
  "groupName": "Trip to Goa",
  "totalExpenses": 500000,
  "totalSettlements": 150000,
  "expenseCount": 5,
  "settlementCount": 2,
  "memberSummaries": [
    {
      "id": "uuid",
      "displayName": "Rahul",
      "totalPaid": 300000,
      "totalShare": 166667,
      "netBalance": 133333
    },
    {
      "id": "uuid",
      "displayName": "Priya",
      "totalPaid": 100000,
      "totalShare": 166667,
      "netBalance": -66667
    },
    {
      "id": "uuid",
      "displayName": "Amit",
      "totalPaid": 100000,
      "totalShare": 166666,
      "netBalance": -66666
    }
  ],
  "categoryBreakdown": [
    { "category": "FOOD", "total": 200000, "count": 2 },
    { "category": "TRANSPORT", "total": 150000, "count": 2 },
    { "category": "ACCOMMODATION", "total": 150000, "count": 1 }
  ]
}
```

**Note**: All amounts in paisa. `totalPaid` = sum of expenses where member is payer. `totalShare` = sum of ExpenseShare amounts for member. `netBalance` = totalPaid - totalShare + settlements received - settlements made.

---

## GET /api/groups/:groupId/export

Export group ledger as text or PDF.

**Query params**:
- `format` (required): `text` or `pdf`

**Response 200** (format=text):
```
Content-Type: text/plain

--- Trip to Goa - Expense Ledger ---
Generated: 2026-06-04 10:00:00

Members: Rahul, Priya, Amit

== Expenses ==
1. 2026-06-01 | Dinner at restaurant | ₹1000.50 | Paid by: Rahul | Split: Equal
   Rahul: ₹333.50, Priya: ₹333.50, Amit: ₹333.50

...

== Settlements ==
1. 2026-06-03 | Priya → Rahul | ₹500.00

== Current Balances ==
Rahul: +₹400.00 (owed)
Priya: -₹250.00 (owes)
Amit: -₹150.00 (owes)
```

**Response 200** (format=pdf):
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="trip-to-goa-ledger.pdf"

[Binary PDF content]
```

**Response 422**:
```json
{
  "error": {
    "code": "INVALID_FORMAT",
    "message": "Format must be 'text' or 'pdf'"
  }
}
```
