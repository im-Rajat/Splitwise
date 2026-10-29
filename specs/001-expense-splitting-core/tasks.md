# Tasks: Expense Splitting Core

**Input**: Design documents from `/specs/001-expense-splitting-core/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Structure**: `backend/` at repository root (per plan.md)
- Prisma schema at `backend/prisma/schema.prisma`
- Source at `backend/src/`
- Tests at `backend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, tooling, and basic structure

- [X] T001 Initialize Node.js project with TypeScript in backend/package.json and backend/tsconfig.json
- [X] T002 [P] Install production dependencies (express, prisma, @prisma/client, jsonwebtoken, bcrypt, zod, pdfkit, uuid) in backend/package.json
- [X] T003 [P] Install dev dependencies (jest, ts-jest, supertest, @types/*, typescript, eslint, prettier) in backend/package.json
- [X] T004 [P] Configure ESLint and Prettier with TypeScript rules in backend/.eslintrc.json and backend/.prettierrc
- [X] T005 [P] Configure Jest with ts-jest preset in backend/jest.config.ts
- [X] T006 Create Express application entry point with middleware setup in backend/src/app.ts
- [X] T007 [P] Create environment configuration loader in backend/src/config/env.ts (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, PORT)
- [X] T008 [P] Create consistent error response helper and AppError class in backend/src/utils/errors.ts
- [X] T009 Create global error handling middleware in backend/src/api/middleware/errorHandler.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, auth infrastructure, and shared middleware that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T010 Define complete Prisma schema with all entities (User, Group, Member, Expense, ExpenseShare, Settlement, AuditLog) and enums in backend/prisma/schema.prisma
- [X] T011 Run initial Prisma migration to create database tables via backend/prisma/migrations/
- [X] T012 [P] Implement password hashing utility (bcrypt, cost factor 12) in backend/src/utils/auth.ts
- [X] T013 [P] Implement JWT token utilities (generate access/refresh tokens, verify, decode) in backend/src/utils/jwt.ts
- [X] T014 Implement authentication middleware (verify Bearer token, attach userId to request) in backend/src/api/middleware/auth.ts
- [X] T015 [P] Implement request validation middleware factory using zod in backend/src/api/middleware/validate.ts
- [X] T016 Implement auth service (register, login, refresh) in backend/src/services/authService.ts
- [X] T017 Implement auth routes (POST /register, POST /login, POST /refresh) in backend/src/api/routes/authRoutes.ts
- [X] T018 [P] Implement auth request validators (registerSchema, loginSchema, refreshSchema) in backend/src/api/validators/authValidators.ts
- [X] T019 [P] Implement audit log service (createEntry, getByEntity, getByGroup) in backend/src/services/auditLogService.ts
- [X] T020 Implement group ownership authorization helper (verify user owns group) in backend/src/api/middleware/authorize.ts

**Checkpoint**: Foundation ready — auth works, database schema deployed, audit logging available

---

## Phase 3: User Story 1 - Group & Member Management (Priority: P1) 🎯 MVP

**Goal**: User can create groups, add/edit/delete members with deletion guard for non-zero balances

**Independent Test**: Create a group, add 3 members, edit one name, delete member with zero balance (success), attempt delete with non-zero balance (blocked)

### Implementation for User Story 1

- [X] T021 [P] [US1] Implement group validators (createGroupSchema, updateGroupSchema) in backend/src/api/validators/groupValidators.ts
- [X] T022 [P] [US1] Implement member validators (addMemberSchema, updateMemberSchema) in backend/src/api/validators/memberValidators.ts
- [X] T023 [US1] Implement group service (create, list with pagination, getById, update) in backend/src/services/groupService.ts
- [X] T024 [US1] Implement member service (add, update displayName, delete with balance check) in backend/src/services/memberService.ts
- [X] T025 [US1] Implement balance calculation helper (compute net balance for a member) in backend/src/services/balanceService.ts
- [X] T026 [US1] Implement group routes (POST, GET list, GET :id, PATCH :id) in backend/src/api/routes/groupRoutes.ts
- [X] T027 [US1] Implement member routes (POST, PATCH :memberId, DELETE :memberId) on /api/groups/:groupId/members in backend/src/api/routes/memberRoutes.ts
- [X] T028 [US1] Register group and member routes in backend/src/app.ts

**Checkpoint**: Groups and members fully functional. Member deletion guard enforced.

---

## Phase 4: User Story 2 - Add Expense with Multiple Split Methods (Priority: P1) 🎯 MVP

**Goal**: User can add expenses with Equal, Exact, and Percentage splits; all balance calculations are mathematically correct

**Independent Test**: Add ₹1000 split equally among 4 (verify ₹250 each), add ₹900 by exact amounts, add ₹1000 by percentage. Verify remainder handling for odd amounts.

### Implementation for User Story 2

- [X] T029 [P] [US2] Implement split calculation engine (equal with remainder, exact validation, percentage conversion) in backend/src/services/splitEngine.ts
- [X] T030 [P] [US2] Implement expense validators (createExpenseSchema for EQUAL/EXACT/PERCENTAGE) in backend/src/api/validators/expenseValidators.ts
- [X] T031 [US2] Implement expense service (create with split calculation, list with pagination, getById) in backend/src/services/expenseService.ts
- [X] T032 [US2] Extend balance service with pairwise balance computation from expenses in backend/src/services/balanceService.ts
- [X] T033 [US2] Implement expense routes (POST, GET list, GET :expenseId) on /api/groups/:groupId/expenses in backend/src/api/routes/expenseRoutes.ts
- [X] T034 [US2] Register expense routes in backend/src/app.ts

**Checkpoint**: Expenses can be created with all 3 split methods. Balances compute correctly from expenses.

---

## Phase 5: User Story 4 - Settle Up Between Members (Priority: P1) 🎯 MVP

**Goal**: User can record settlements between members with auto-cap at outstanding debt. Settlements stored separately from expenses.

**Independent Test**: Add expenses, record settlement of ₹500, verify debt reduces. Attempt overpayment, verify auto-cap.

### Implementation for User Story 4

- [X] T035 [P] [US4] Implement settlement validators (createSettlementSchema, updateSettlementSchema) in backend/src/api/validators/settlementValidators.ts
- [X] T036 [US4] Implement settlement service (create with auto-cap, list, getById) in backend/src/services/settlementService.ts
- [X] T037 [US4] Extend balance service to include settlements in pairwise balance computation in backend/src/services/balanceService.ts
- [X] T038 [US4] Implement settlement routes (POST, GET list, GET :settlementId) on /api/groups/:groupId/settlements in backend/src/api/routes/settlementRoutes.ts
- [X] T039 [US4] Register settlement routes in backend/src/app.ts

**Checkpoint**: Full expense → settle up cycle works. Auto-cap prevents overpayment. Balances correctly reflect both expenses and settlements.

---

## Phase 6: User Story 3 - Edit/Delete Expenses & Settlements with Audit Log (Priority: P2)

**Goal**: User can edit or delete expenses/settlements with automatic balance recalculation and audit trail for every modification.

**Independent Test**: Edit expense amount, verify balances recalculate and audit log entry created. Delete expense, verify balances revert. Edit settlement via settlement-specific flow.

### Implementation for User Story 3

- [X] T040 [P] [US3] Implement optimistic locking check utility (version comparison) in backend/src/utils/versionCheck.ts
- [X] T041 [US3] Extend expense service with update (recalculate shares, version check, audit log) and soft-delete (revert balances, audit log) in backend/src/services/expenseService.ts
- [X] T042 [US3] Extend settlement service with update (version check, re-validate auto-cap, audit log) and soft-delete (audit log) in backend/src/services/settlementService.ts
- [X] T043 [US3] Add PUT and DELETE routes for expenses in backend/src/api/routes/expenseRoutes.ts
- [X] T044 [US3] Add PUT and DELETE routes for settlements in backend/src/api/routes/settlementRoutes.ts
- [X] T045 [US3] Implement audit log routes (GET /api/groups/:groupId/audit-log with filters) in backend/src/api/routes/auditLogRoutes.ts
- [X] T046 [US3] Implement audit log validators (query params: entityType, entityId, cursor, limit) in backend/src/api/validators/auditLogValidators.ts
- [X] T047 [US3] Register audit log routes in backend/src/app.ts

**Checkpoint**: Full CRUD for expenses and settlements with optimistic locking. Every modification produces an audit trail entry. Edit settlement opens settlement logic, not expense logic.

---

## Phase 7: User Story 5 - Debt Simplification Algorithm (Priority: P2)

**Goal**: System computes minimal transactions to settle all debts. Display-only suggestions that preserve net balance invariant.

**Independent Test**: Create 4-member group with cross-debts, call simplification endpoint, verify fewer transactions and net balances unchanged.

### Implementation for User Story 5

- [X] T048 [P] [US5] Implement debt simplification algorithm (net-balance greedy / min-cash-flow) in backend/src/services/debtSimplifier.ts
- [X] T049 [US5] Implement simplified balances endpoint logic in balance service (compute and format suggestions) in backend/src/services/balanceService.ts
- [X] T050 [US5] Implement GET /api/groups/:groupId/balances/simplified route in backend/src/api/routes/balanceRoutes.ts

**Checkpoint**: Debt simplification returns optimized payment suggestions. Net balance invariant verified. Transaction count reduced.

---

## Phase 8: User Story 6 - Dashboard and Reporting (Priority: P2)

**Goal**: User views dashboard with total expenses, individual shares, net balances, and category breakdown.

**Independent Test**: After several expenses and settlements, GET dashboard returns correct totals, per-member summaries, and category breakdown.

### Implementation for User Story 6

- [X] T051 [P] [US6] Implement dashboard service (aggregate totals, member summaries, category breakdown) in backend/src/services/dashboardService.ts
- [X] T052 [US6] Implement GET /api/groups/:groupId/dashboard route in backend/src/api/routes/dashboardRoutes.ts
- [X] T053 [US6] Implement GET /api/groups/:groupId/balances route (pairwise balances + member net summaries) in backend/src/api/routes/balanceRoutes.ts
- [X] T054 [US6] Register balance and dashboard routes in backend/src/app.ts

**Checkpoint**: Dashboard endpoint returns accurate financial summaries. Net balances across all members sum to zero.

---

## Phase 9: User Story 7 - Export Ledger (Priority: P3)

**Goal**: User can export group ledger as text or PDF to share with non-logged-in members.

**Independent Test**: Export as text returns formatted ledger. Export as PDF returns valid PDF binary.

### Implementation for User Story 7

- [X] T055 [P] [US7] Implement text export formatter (expenses, settlements, balances as plain text) in backend/src/services/exportService.ts
- [X] T056 [P] [US7] Implement PDF export formatter using pdfkit (tabular layout) in backend/src/services/exportService.ts
- [X] T057 [US7] Implement GET /api/groups/:groupId/export?format=text|pdf route in backend/src/api/routes/exportRoutes.ts
- [X] T058 [US7] Implement export validator (format query param) in backend/src/api/validators/exportValidators.ts
- [X] T059 [US7] Register export routes in backend/src/app.ts

**Checkpoint**: Text and PDF export produce complete ledger documents with all transactions and balances.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, server entry point, and documentation

- [X] T060 Create server entry point (listen on PORT, graceful shutdown) in backend/src/server.ts
- [X] T061 [P] Add npm scripts (dev, build, start, test, lint, migrate) in backend/package.json
- [X] T062 [P] Create .env.example with all required environment variables in backend/.env.example
- [X] T063 [P] Create Docker setup (Dockerfile for backend + docker-compose.yml with PostgreSQL) in backend/Dockerfile and docker-compose.yml
- [X] T064 Add cursor-based pagination utility (shared by all list endpoints) in backend/src/utils/pagination.ts
- [X] T065 Verify zero-sum balance invariant across all integration test scenarios in backend/tests/integration/

---

## Dependencies

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1: Groups) 
                                        → Phase 4 (US2: Expenses) [requires US1]
                                        → Phase 5 (US4: Settlements) [requires US2]
                                        → Phase 6 (US3: Edit/Delete) [requires US2, US4]
                                        → Phase 7 (US5: Simplification) [requires US4]
                                        → Phase 8 (US6: Dashboard) [requires US2, US4]
                                        → Phase 9 (US7: Export) [requires US6]
                                        → Phase 10 (Polish)
```

### Critical Path

```
T001 → T010 → T011 → T016 → T023 → T031 → T036 → T041
(setup)  (schema) (migrate) (auth)  (groups) (expenses) (settlements) (edit/delete)
```

## Parallel Execution Opportunities

### Within Phase 1 (after T001):
- T002, T003, T004, T005, T007, T008 can all run in parallel

### Within Phase 2 (after T011):
- T012, T013, T015, T018, T019 can all run in parallel

### Within Phase 3:
- T021, T022 can run in parallel (validators don't depend on each other)

### Within Phase 4:
- T029, T030 can run in parallel (split engine and validators are independent)

### Within Phase 6:
- T040 can run in parallel with other US3 tasks (utility doesn't depend on service logic)

### Across Phases (after Phase 5):
- Phase 7 (US5) and Phase 8 (US6) can run in parallel (independent features)

## Implementation Strategy

### MVP Scope (Phases 1–5)

The minimum viable product is complete after Phase 5:
- User authentication ✓
- Group and member management ✓
- Expense creation with 3 split methods ✓
- Settlement recording with auto-cap ✓
- Balance computation ✓

This delivers User Stories 1, 2, and 4 (all P1 priorities).

### Incremental Delivery

1. **Phase 1–2**: Infrastructure sprint (no user-facing features yet)
2. **Phase 3**: First testable increment (groups work end-to-end)
3. **Phase 4**: Core value (expenses can be added and split)
4. **Phase 5**: Complete cycle (settle up closes the loop)
5. **Phase 6–8**: Enhancement sprint (edit/delete, simplification, dashboard)
6. **Phase 9–10**: Polish sprint (export, Docker, cleanup)
