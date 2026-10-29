# Data Model: Frontend UI

**Created**: 2026-06-05
**Feature**: [spec.md](spec.md)

## TypeScript Interfaces (matching backend API responses)

### Auth

```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}
```

### Group

```typescript
interface Group {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateGroupRequest {
  name: string;
}
```

### Member

```typescript
interface Member {
  id: string;
  groupId: string;
  displayName: string;
  createdAt: string;
}

interface AddMemberRequest {
  displayName: string;
}
```

### Expense

```typescript
type SplitMethod = 'EQUAL' | 'EXACT' | 'PERCENTAGE';
type Category = 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION' | 'ENTERTAINMENT' | 'SHOPPING' | 'UTILITIES' | 'OTHER';

interface ExpenseShare {
  memberId: string;
  amount: number; // paisa
}

interface Expense {
  id: string;
  groupId: string;
  description: string | null;
  totalAmount: number; // paisa
  splitMethod: SplitMethod;
  category: Category;
  payerId: string;
  payer: Member;
  shares: ExpenseShare[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateExpenseRequest {
  description?: string;
  totalAmount: number; // paisa (user enters rupees, UI converts)
  splitMethod: SplitMethod;
  category?: Category;
  payerId: string;
  splits: SplitInput[];
}

interface SplitInput {
  memberId: string;
  amount?: number;      // for EXACT (paisa)
  percentage?: number;  // for PERCENTAGE
}

interface UpdateExpenseRequest extends CreateExpenseRequest {
  version: number;
}
```

### Settlement

```typescript
interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  payeeId: string;
  payer: Member;
  payee: Member;
  amount: number; // paisa
  version: number;
  createdAt: string;
  updatedAt: string;
}

interface CreateSettlementRequest {
  payerId: string;
  payeeId: string;
  amount: number; // paisa
}

interface UpdateSettlementRequest extends CreateSettlementRequest {
  version: number;
}
```

### Balances

```typescript
interface PairwiseBalance {
  from: { id: string; displayName: string };
  to: { id: string; displayName: string };
  amount: number; // paisa
}

interface MemberSummary {
  memberId: string;
  displayName: string;
  netBalance: number; // paisa (positive = owed, negative = owes)
}

interface BalancesResponse {
  groupId: string;
  balances: PairwiseBalance[];
  memberSummaries: MemberSummary[];
}

interface SimplifiedTransaction {
  from: { id: string; displayName: string };
  to: { id: string; displayName: string };
  amount: number; // paisa
}

interface SimplifiedResponse {
  groupId: string;
  simplifiedTransactions: SimplifiedTransaction[];
  originalTransactionCount: number;
  simplifiedTransactionCount: number;
  reductionPercentage: number;
}
```

### Dashboard

```typescript
interface DashboardResponse {
  groupId: string;
  totalExpenses: number; // paisa
  expenseCount: number;
  memberSummaries: {
    memberId: string;
    displayName: string;
    totalPaid: number;
    totalOwed: number;
    netBalance: number;
  }[];
  categoryBreakdown: {
    category: Category;
    total: number; // paisa
    count: number;
  }[];
}
```

### Pagination

```typescript
interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}
```

### API Error

```typescript
interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { path: string; message: string }[];
  };
}
```

## State Management Model

### Auth State (React Context)

| Field | Type | Description |
|-------|------|-------------|
| user | `User \| null` | Current logged-in user |
| isAuthenticated | `boolean` | Whether user is logged in |
| isLoading | `boolean` | Initial auth check in progress |
| login | `(email, password) → Promise` | Login action |
| register | `(email, password, name) → Promise` | Register action |
| logout | `() → void` | Clear tokens + redirect |

### Server State (TanStack Query)

All server data managed via query keys:
- `['groups']` — list of user's groups
- `['groups', groupId]` — single group detail
- `['groups', groupId, 'members']` — members of a group
- `['groups', groupId, 'expenses']` — expenses with cursor pagination
- `['groups', groupId, 'settlements']` — settlements
- `['groups', groupId, 'balances']` — pairwise balances
- `['groups', groupId, 'balances', 'simplified']` — simplified debts
- `['groups', groupId, 'dashboard']` — dashboard data

### Local UI State (component-level)

- Active tab in GroupDetailPage
- Form field values
- Modal open/close states
- Toast notification queue
