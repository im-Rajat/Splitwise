# API Contracts: Audit Log

**Base path**: `/api/groups/:groupId/audit-log`
**Auth**: All endpoints require `Authorization: Bearer <token>` header.

## GET /api/groups/:groupId/audit-log

List audit log entries for a group (covers expenses and settlements).

**Query params**:
- `cursor` (optional): pagination cursor
- `limit` (optional): 1–100, default 20
- `entityType` (optional): filter by `EXPENSE` or `SETTLEMENT`
- `entityId` (optional): filter by specific entity UUID

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "entityType": "EXPENSE",
      "entityId": "expense-uuid",
      "action": "UPDATED",
      "previousState": {
        "totalAmount": 100000,
        "splitMethod": "EQUAL",
        "participantIds": ["uuid-1", "uuid-2"]
      },
      "newState": {
        "totalAmount": 120000,
        "splitMethod": "EQUAL",
        "participantIds": ["uuid-1", "uuid-2", "uuid-3"]
      },
      "userId": "user-uuid",
      "createdAt": "2026-06-04T11:00:00Z"
    },
    {
      "id": "uuid",
      "entityType": "SETTLEMENT",
      "entityId": "settlement-uuid",
      "action": "CREATED",
      "previousState": null,
      "newState": {
        "payerId": "member-uuid",
        "payeeId": "member-uuid",
        "amount": 50000
      },
      "userId": "user-uuid",
      "createdAt": "2026-06-04T10:30:00Z"
    }
  ],
  "nextCursor": "uuid-or-null"
}
```

**Note**: Audit log is read-only. No POST/PUT/DELETE endpoints. Entries are created automatically by the system when expenses or settlements are modified.
