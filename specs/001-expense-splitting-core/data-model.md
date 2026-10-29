# Data Model: Expense Splitting Core

**Feature**: 001-expense-splitting-core
**Date**: 2026-06-04
**Storage**: PostgreSQL 16 via Prisma ORM
**Amount representation**: All monetary values stored as `Int` (paisa; 1 ₹ = 100 paisa)

## Entities

### User

The single authenticated account holder who manages all groups.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique user identifier |
| email | String | UNIQUE, NOT NULL | Login credential |
| passwordHash | String | NOT NULL | bcrypt hash (never exposed in API) |
| name | String | NOT NULL | Display name |
| createdAt | DateTime | NOT NULL, default now | Account creation timestamp |
| updatedAt | DateTime | NOT NULL, auto-update | Last modification timestamp |

### Group

A named collection of members for tracking shared expenses.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique group identifier |
| name | String | NOT NULL, max 100 chars | Group display name |
| userId | UUID | FK → User.id, NOT NULL | Owner (the logged-in user) |
| createdAt | DateTime | NOT NULL, default now | Creation timestamp |
| updatedAt | DateTime | NOT NULL, auto-update | Last modification timestamp |

**Relationships**: User 1:N Group

### Member

A participant within a group. May or may not correspond to a real user account.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique backend ID (opaque) |
| displayName | String | NOT NULL, max 50 chars | Editable display name |
| groupId | UUID | FK → Group.id, NOT NULL | Parent group |
| createdAt | DateTime | NOT NULL, default now | When added to group |
| updatedAt | DateTime | NOT NULL, auto-update | Last name edit timestamp |

**Relationships**: Group 1:N Member
**Validation rules**: Cannot delete if net balance ≠ 0 (enforced at service layer)
**Unique constraint**: (groupId, displayName) — no duplicate names within a group

### Expense

A financial record that increases group debt.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique expense identifier |
| groupId | UUID | FK → Group.id, NOT NULL | Parent group |
| description | String | max 200 chars, optional | What the expense is for |
| totalAmount | Int | NOT NULL, > 0 | Total in paisa |
| category | Enum | NOT NULL | One of: FOOD, TRANSPORT, ACCOMMODATION, ENTERTAINMENT, UTILITIES, OTHER |
| categoryNote | String | max 100 chars, optional | Freeform note when category = OTHER |
| splitMethod | Enum | NOT NULL | One of: EQUAL, EXACT, PERCENTAGE |
| payerId | UUID | FK → Member.id, NOT NULL | Who paid |
| version | Int | NOT NULL, default 1 | Optimistic locking version |
| deletedAt | DateTime | nullable | Soft-delete timestamp (null = active) |
| createdAt | DateTime | NOT NULL, default now | Creation timestamp |
| updatedAt | DateTime | NOT NULL, auto-update | Last modification timestamp |

**Relationships**: Group 1:N Expense, Member (payer) 1:N Expense

### ExpenseShare

The calculated share for each participant in an expense.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique share record |
| expenseId | UUID | FK → Expense.id, NOT NULL | Parent expense |
| memberId | UUID | FK → Member.id, NOT NULL | Participant |
| amount | Int | NOT NULL, > 0 | Share amount in paisa |
| createdAt | DateTime | NOT NULL, default now | Creation timestamp |

**Relationships**: Expense 1:N ExpenseShare, Member 1:N ExpenseShare
**Unique constraint**: (expenseId, memberId) — one share per participant per expense
**Validation rules**:
- Sum of all ExpenseShare.amount for an expense MUST equal Expense.totalAmount
- Payer MUST appear as a participant (have an ExpenseShare record)

### Settlement

A financial record that decreases group debt. Strictly separate from Expense.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique settlement identifier |
| groupId | UUID | FK → Group.id, NOT NULL | Parent group |
| payerId | UUID | FK → Member.id, NOT NULL | Who is paying (reducing their debt) |
| payeeId | UUID | FK → Member.id, NOT NULL | Who receives payment |
| amount | Int | NOT NULL, > 0 | Settlement amount in paisa |
| version | Int | NOT NULL, default 1 | Optimistic locking version |
| deletedAt | DateTime | nullable | Soft-delete timestamp |
| createdAt | DateTime | NOT NULL, default now | Creation timestamp |
| updatedAt | DateTime | NOT NULL, auto-update | Last modification timestamp |

**Relationships**: Group 1:N Settlement, Member (payer) 1:N Settlement, Member (payee) 1:N Settlement
**Validation rules**:
- payerId ≠ payeeId (cannot settle with yourself)
- amount auto-capped at outstanding debt between payer→payee (service layer)

### AuditLog

Immutable log of every modification to expenses or settlements.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique log entry |
| entityType | Enum | NOT NULL | EXPENSE or SETTLEMENT |
| entityId | UUID | NOT NULL | ID of modified expense/settlement |
| action | Enum | NOT NULL | CREATED, UPDATED, DELETED |
| previousState | JSON | nullable | Snapshot before change (null for CREATED) |
| newState | JSON | nullable | Snapshot after change (null for DELETED) |
| userId | UUID | FK → User.id, NOT NULL | Who made the change |
| createdAt | DateTime | NOT NULL, default now | When the change occurred |

**Relationships**: User 1:N AuditLog
**Note**: This table is append-only. No updates or deletes permitted.

## Enums

```
Category: FOOD | TRANSPORT | ACCOMMODATION | ENTERTAINMENT | UTILITIES | OTHER
SplitMethod: EQUAL | EXACT | PERCENTAGE
AuditEntityType: EXPENSE | SETTLEMENT
AuditAction: CREATED | UPDATED | DELETED
```

## Derived Data (Computed, Not Stored)

### Balance (per member pair)

Net amount between two members, computed from expenses and settlements:

```
balance(A→B) = sum(A's shares in expenses paid by B) 
             - sum(B's shares in expenses paid by A) 
             - sum(settlements from A to B) 
             + sum(settlements from B to A)
```

If `balance(A→B) > 0`, A owes B that amount. Balances are always recomputed from source data (not cached) to ensure correctness.

### Net Balance (per member)

Sum of all pairwise balances for a member:
- Positive = member is owed money (net creditor)
- Negative = member owes money (net debtor)
- All net balances in a group MUST sum to 0 (invariant)

### Simplified Debts (display-only)

Output of debt simplification algorithm. Not persisted—computed on demand from net balances.

## State Transitions

### Expense Lifecycle
```
[Created] → [Active] → [Updated]* → [Soft-Deleted]
                                         ↓
                                    (AuditLog entry at each transition)
```

### Settlement Lifecycle
```
[Created] → [Active] → [Updated]* → [Soft-Deleted]
                                         ↓
                                    (AuditLog entry at each transition)
```

### Member Deletion Guard
```
[Active Member] → check net balance
  ├── balance = 0 → [Deleted] (hard delete, member removed)
  └── balance ≠ 0 → [Blocked] (error returned, no change)
```

## Indexes

| Table | Index | Purpose |
|-------|-------|---------|
| Expense | (groupId, deletedAt) | List active expenses per group |
| ExpenseShare | (expenseId) | Fetch shares for an expense |
| ExpenseShare | (memberId) | Compute member's total involvement |
| Settlement | (groupId, deletedAt) | List active settlements per group |
| Settlement | (payerId, payeeId) | Pairwise balance computation |
| AuditLog | (entityType, entityId) | History for a specific entity |
| Member | (groupId) | List members per group |
