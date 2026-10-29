# API Contracts: Groups & Members

**Base path**: `/api/groups`
**Auth**: All endpoints require `Authorization: Bearer <token>` header.

## POST /api/groups

Create a new group.

**Request**:
```json
{
  "name": "Trip to Goa"
}
```

**Validation**:
- `name`: non-empty, max 100 chars

**Response 201**:
```json
{
  "id": "uuid",
  "name": "Trip to Goa",
  "createdAt": "2026-06-04T10:00:00Z",
  "members": []
}
```

---

## GET /api/groups

List all groups for the authenticated user.

**Query params**:
- `cursor` (optional): pagination cursor (UUID of last item)
- `limit` (optional): 1–100, default 20

**Response 200**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Trip to Goa",
      "memberCount": 4,
      "createdAt": "2026-06-04T10:00:00Z"
    }
  ],
  "nextCursor": "uuid-or-null"
}
```

---

## GET /api/groups/:groupId

Get group details with members.

**Response 200**:
```json
{
  "id": "uuid",
  "name": "Trip to Goa",
  "createdAt": "2026-06-04T10:00:00Z",
  "members": [
    {
      "id": "uuid",
      "displayName": "Rahul",
      "createdAt": "2026-06-04T10:00:00Z"
    }
  ]
}
```

**Response 404**:
```json
{
  "error": {
    "code": "GROUP_NOT_FOUND",
    "message": "Group not found"
  }
}
```

---

## PATCH /api/groups/:groupId

Update group name.

**Request**:
```json
{
  "name": "Trip to Manali"
}
```

**Response 200**: Updated group object (same as GET response)

---

## POST /api/groups/:groupId/members

Add a member to a group.

**Request**:
```json
{
  "displayName": "Rahul"
}
```

**Validation**:
- `displayName`: non-empty, max 50 chars
- Must be unique within the group

**Response 201**:
```json
{
  "id": "uuid",
  "displayName": "Rahul",
  "groupId": "uuid",
  "createdAt": "2026-06-04T10:00:00Z"
}
```

**Response 409** (duplicate name):
```json
{
  "error": {
    "code": "DUPLICATE_MEMBER_NAME",
    "message": "A member with this name already exists in the group"
  }
}
```

---

## PATCH /api/groups/:groupId/members/:memberId

Edit member display name.

**Request**:
```json
{
  "displayName": "Rahul S."
}
```

**Response 200**: Updated member object

---

## DELETE /api/groups/:groupId/members/:memberId

Remove a member from the group. Blocked if member has non-zero balance.

**Response 204**: No content (success)

**Response 409** (non-zero balance):
```json
{
  "error": {
    "code": "MEMBER_HAS_BALANCE",
    "message": "Cannot delete member with non-zero balance. Current balance: ₹150.00"
  }
}
```
