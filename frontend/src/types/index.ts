// Auth
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

// Group
export interface Group {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupRequest {
  name: string;
}

// Member
export interface Member {
  id: string;
  groupId: string;
  displayName: string;
  createdAt: string;
}

export interface AddMemberRequest {
  displayName: string;
}

// Expense
export type SplitMethod = 'EQUAL' | 'EXACT' | 'PERCENTAGE';
export type Category = 'FOOD' | 'TRANSPORT' | 'ACCOMMODATION' | 'ENTERTAINMENT' | 'SHOPPING' | 'UTILITIES' | 'OTHER';

export interface ExpenseShare {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  groupId: string;
  description: string | null;
  totalAmount: number;
  splitMethod: SplitMethod;
  category: Category;
  payerId: string;
  payer: Member;
  shares: ExpenseShare[];
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface SplitInput {
  memberId: string;
  amount?: number;
  percentage?: number;
}

export interface CreateExpenseRequest {
  description?: string;
  totalAmount: number;
  splitMethod: SplitMethod;
  category?: Category;
  payerId: string;
  splits: SplitInput[];
}

export interface UpdateExpenseRequest extends CreateExpenseRequest {
  version: number;
}

// Settlement
export interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  payeeId: string;
  payer: Member;
  payee: Member;
  amount: number;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettlementRequest {
  payerId: string;
  payeeId: string;
  amount: number;
}

export interface UpdateSettlementRequest extends CreateSettlementRequest {
  version: number;
}

// Balances
export interface PairwiseBalance {
  from: { id: string; displayName: string };
  to: { id: string; displayName: string };
  amount: number;
}

export interface MemberSummary {
  memberId: string;
  displayName: string;
  netBalance: number;
}

export interface BalancesResponse {
  groupId: string;
  balances: PairwiseBalance[];
  memberSummaries: MemberSummary[];
}

export interface SimplifiedTransaction {
  from: { id: string; displayName: string };
  to: { id: string; displayName: string };
  amount: number;
}

export interface SimplifiedResponse {
  groupId: string;
  simplifiedTransactions: SimplifiedTransaction[];
  originalTransactionCount: number;
  simplifiedTransactionCount: number;
  reductionPercentage: number;
}

// Dashboard
export interface DashboardResponse {
  groupId: string;
  totalExpenses: number;
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
    total: number;
    count: number;
  }[];
}

// Pagination
export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
}

// API Error
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { path: string; message: string }[];
  };
}
