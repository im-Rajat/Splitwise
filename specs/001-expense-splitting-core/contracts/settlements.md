# API Contracts: Settlements

**Base path**: `/api/groups/:groupId/settlements`
**Auth**: All endpoints require `Authorization: Bearer <token>` header.

## POST /api/groups/:groupId/settlements

Record a settlement payment between two members.

**Request**:
```json
{
  "payerId": "member-uuid-debtor",
  "payeeId": "member-uuid-creditor",
  "amount": 50000
}
```

**Validation**:
- `payerId`: valid member in group
- `payeeId`: valid member in group, ≠ payerId
- `amount`: integer > 0 (paisa); auto-capped at outstanding debt from payer to payee

**Response 201**:
```json
{
  "id": "uuid",
  "payer": { "id": "uuid", "displayName": "Priya" },
  "payee": { "id": "uuid", "displayName": "Rahul" },
  "amount": 50000,
  "amountCapped": false,
  "version": 1,
  "createdAt": "2026-06-04T10:00:00Z"
}
```

**Response 201** (amount was capped):
```json
{
  "id": "uuid",
  "payer": { "id": "uuid", "displayName": "Priya" },
  "payee": { "id": "uuid", "displayName": "Rahul" },
  "amount": 30000,
  "amountCapped": true,
  "originalAmount": 50000,
  "outstandingDebt": 30000,
  "version": 1,
  "createdAt": "2026-06-04T10:00:00Z"
}
```

**Response 422**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Payer and payee cannot be the same member"
  }
}
```

---

## GET /api/groups/:groupId/settlements

List settlements for a group.

**Query params**:
- `cursor` (optional): pagination cursor
- `limit` (optional): 1–100, default 20

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "payer": { "id": "uuid", "displayName": "Priya" },
      "payee": { "id": "uuid", "displayName": "Rahul" },
      "amount": 50000,
      "createdAt": "2026-06-04T10:00:00Z"
    }
  ],
  "nextCursor": "uuid-or-null"
}
```

---

## PUT /api/groups/:groupId/settlements/:settlementId

Update a settlement. Requires `version` for optimistic locking.

**Request**:
```json
{
  "payerId": "member-uuid-debtor",
  "payeeId": "member-uuid-creditor",
  "amount": 60000,
  "version": 1
}
```

**Response 200**: Updated settlement object (version incremented)

**Response 409** (version conflict):
```json
{
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Settlement was modified by another operation. Please refresh and try again.",
    "details": { "currentVersion": 2 }
  }
}
```

---

## DELETE /api/groups/:groupId/settlements/:settlementId

Soft-delete a settlement. Reverts balance impact.

**Response 204**: No content

**Response 404**: Settlement not found or already deleted
