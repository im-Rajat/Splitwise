# API Contracts: Expenses

**Base path**: `/api/groups/:groupId/expenses`
**Auth**: All endpoints require `Authorization: Bearer <token>` header.

## POST /api/groups/:groupId/expenses

Add a new expense to the group.

**Request**:
```json
{
  "description": "Dinner at restaurant",
  "totalAmount": 100050,
  "category": "FOOD",
  "categoryNote": null,
  "splitMethod": "EQUAL",
  "payerId": "member-uuid",
  "participantIds": ["member-uuid-1", "member-uuid-2", "member-uuid-3"]
}
```

For **EXACT** split:
```json
{
  "description": "Hotel booking",
  "totalAmount": 900000,
  "category": "ACCOMMODATION",
  "splitMethod": "EXACT",
  "payerId": "member-uuid",
  "shares": [
    { "memberId": "member-uuid-1", "amount": 400000 },
    { "memberId": "member-uuid-2", "amount": 300000 },
    { "memberId": "member-uuid-3", "amount": 200000 }
  ]
}
```

For **PERCENTAGE** split:
```json
{
  "description": "Cab ride",
  "totalAmount": 100000,
  "category": "TRANSPORT",
  "splitMethod": "PERCENTAGE",
  "payerId": "member-uuid",
  "shares": [
    { "memberId": "member-uuid-1", "percentage": 50 },
    { "memberId": "member-uuid-2", "percentage": 30 },
    { "memberId": "member-uuid-3", "percentage": 20 }
  ]
}
```

**Validation**:
- `totalAmount`: integer > 0 (paisa)
- `category`: one of FOOD, TRANSPORT, ACCOMMODATION, ENTERTAINMENT, UTILITIES, OTHER
- `categoryNote`: required when category = OTHER, max 100 chars
- `splitMethod`: one of EQUAL, EXACT, PERCENTAGE
- `payerId`: must be a valid member in the group
- `participantIds` (EQUAL): non-empty array, all must be valid members, payer must be included
- `shares` (EXACT): amounts must sum to totalAmount; all memberIds valid
- `shares` (PERCENTAGE): percentages must sum to 100; all memberIds valid

**Response 201**:
```json
{
  "id": "uuid",
  "description": "Dinner at restaurant",
  "totalAmount": 100050,
  "category": "FOOD",
  "splitMethod": "EQUAL",
  "payerId": "member-uuid",
  "shares": [
    { "memberId": "member-uuid-1", "displayName": "Rahul", "amount": 33350 },
    { "memberId": "member-uuid-2", "displayName": "Priya", "amount": 33350 },
    { "memberId": "member-uuid-3", "displayName": "Amit", "amount": 33350 }
  ],
  "version": 1,
  "createdAt": "2026-06-04T10:00:00Z"
}
```

**Response 422** (validation failure):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Exact amounts must sum to total amount",
    "details": {
      "totalAmount": 900000,
      "sharesSum": 850000
    }
  }
}
```

---

## GET /api/groups/:groupId/expenses

List expenses for a group.

**Query params**:
- `cursor` (optional): pagination cursor
- `limit` (optional): 1–100, default 20
- `category` (optional): filter by category

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "description": "Dinner at restaurant",
      "totalAmount": 100050,
      "category": "FOOD",
      "splitMethod": "EQUAL",
      "payer": { "id": "uuid", "displayName": "Rahul" },
      "participantCount": 3,
      "createdAt": "2026-06-04T10:00:00Z"
    }
  ],
  "nextCursor": "uuid-or-null"
}
```

---

## GET /api/groups/:groupId/expenses/:expenseId

Get full expense details including shares.

**Response 200**:
```json
{
  "id": "uuid",
  "description": "Dinner at restaurant",
  "totalAmount": 100050,
  "category": "FOOD",
  "categoryNote": null,
  "splitMethod": "EQUAL",
  "payer": { "id": "uuid", "displayName": "Rahul" },
  "shares": [
    { "memberId": "uuid", "displayName": "Rahul", "amount": 33350 },
    { "memberId": "uuid", "displayName": "Priya", "amount": 33350 },
    { "memberId": "uuid", "displayName": "Amit", "amount": 33350 }
  ],
  "version": 1,
  "createdAt": "2026-06-04T10:00:00Z",
  "updatedAt": "2026-06-04T10:00:00Z"
}
```

---

## PUT /api/groups/:groupId/expenses/:expenseId

Update an existing expense. Requires `version` for optimistic locking.

**Request**: Same as POST body + `version` field:
```json
{
  "description": "Dinner at restaurant (updated)",
  "totalAmount": 120000,
  "category": "FOOD",
  "splitMethod": "EQUAL",
  "payerId": "member-uuid",
  "participantIds": ["member-uuid-1", "member-uuid-2", "member-uuid-3"],
  "version": 1
}
```

**Response 200**: Updated expense object (version incremented)

**Response 409** (version conflict):
```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Expense was modified by another operation. Please refresh and try again.",
    "details": { "currentVersion": 2 }
  }
}
```

---

## DELETE /api/groups/:groupId/expenses/:expenseId

Soft-delete an expense. Reverts all balance impacts.

**Response 204**: No content

**Response 404**: Expense not found or already deleted
