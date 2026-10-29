# Tasks: Frontend UI

**Input**: Design documents from `/specs/002-frontend-ui/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `frontend/src/` at repository root
- All paths relative to repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Vite + React + TypeScript project initialization with Tailwind CSS and core tooling

- [X] T001 Initialize Vite React-TS project with package.json, tsconfig.json, vite.config.ts in frontend/
- [X] T002 [P] Install production dependencies (react, react-dom, react-router-dom, @tanstack/react-query, axios, react-hot-toast) in frontend/package.json
- [X] T003 [P] Install dev dependencies (tailwindcss, postcss, autoprefixer, @types/react, vitest, @testing-library/react) in frontend/package.json
- [X] T004 [P] Configure Tailwind CSS with content paths and custom theme in frontend/tailwind.config.ts and frontend/postcss.config.js
- [X] T005 [P] Configure ESLint and Prettier for TypeScript + React in frontend/.eslintrc.cjs and frontend/.prettierrc
- [X] T006 Create base index.html with root div and viewport meta tag in frontend/index.html
- [X] T007 Create global CSS file importing Tailwind layers in frontend/src/index.css
- [X] T008 Create app entry point rendering React root in frontend/src/main.tsx

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types, utility functions, API client, auth context, and layout components that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Define all shared TypeScript interfaces (User, Group, Member, Expense, Settlement, Balance, Dashboard, ApiError, PaginatedResponse) in frontend/src/types/index.ts
- [X] T010 Implement currency formatting utility (paisa→₹ with Indian locale) and date formatting in frontend/src/utils/format.ts
- [X] T011 [P] Implement client-side validation helpers (exactSumCheck, percentageSumCheck, requiredField) in frontend/src/utils/validation.ts
- [X] T012 Create Axios API client instance with base URL, auth header interceptor, and 401 refresh+retry logic in frontend/src/api/client.ts
- [X] T013 Implement AuthContext provider with in-memory token storage, login/register/logout/refresh actions in frontend/src/contexts/AuthContext.tsx
- [X] T014 [P] Implement useAuth hook exporting context value in frontend/src/hooks/useAuth.ts
- [X] T015 [P] Create shared UI Button component (primary/secondary/danger/ghost variants, loading state) in frontend/src/components/ui/Button.tsx
- [X] T016 [P] Create shared UI Input component (label, error message, required indicator) in frontend/src/components/ui/Input.tsx
- [X] T017 [P] Create shared UI Modal component (overlay, close on escape/click-outside) in frontend/src/components/ui/Modal.tsx
- [X] T018 [P] Create shared UI Tabs component (horizontal tab bar with active indicator) in frontend/src/components/ui/Tabs.tsx
- [X] T019 [P] Create shared UI Spinner component in frontend/src/components/ui/Spinner.tsx
- [X] T020 [P] Create shared UI ConfirmDialog component in frontend/src/components/ui/ConfirmDialog.tsx
- [X] T021 [P] Create shared UI EmptyState component in frontend/src/components/ui/EmptyState.tsx
- [X] T022 Create AppLayout component (top nav with app name, user menu, logout, Outlet) in frontend/src/components/layout/AppLayout.tsx
- [X] T023 [P] Create AuthLayout component (centered card container for forms) in frontend/src/components/layout/AuthLayout.tsx
- [X] T024 Create App.tsx with React Router routes, QueryClientProvider, Toaster, and AuthContext wrapping in frontend/src/App.tsx
- [X] T025 Implement ProtectedRoute wrapper component that redirects to /login if unauthenticated in frontend/src/components/layout/ProtectedRoute.tsx

**Checkpoint**: Foundation ready — API client works with auth, shared UI components exist, routing configured with auth guards.

---

## Phase 3: User Story 1 - Authentication Flow (Priority: P1) 🎯 MVP

**Goal**: User can register, login, persist session across refresh, and logout

**Independent Test**: Register → login → refresh page (session persists) → logout → visit /groups (redirect to /login)

- [X] T026 [P] [US1] Implement auth API functions (register, login, refresh) in frontend/src/api/auth.ts
- [X] T027 [US1] Create LoginPage with email/password form, inline errors, and link to register in frontend/src/pages/LoginPage.tsx
- [X] T028 [US1] Create RegisterPage with name/email/password form, inline errors, and link to login in frontend/src/pages/RegisterPage.tsx
- [X] T029 [US1] Wire auth routes in App.tsx (/login, /register as public, /groups as protected default) in frontend/src/App.tsx

**Checkpoint**: Full auth flow works — register, login, session persists, logout redirects.

---

## Phase 4: User Story 2 - Group & Member Management (Priority: P1) 🎯 MVP

**Goal**: User can create groups, view group list, add/edit/delete members

**Independent Test**: Create group → add 3 members → rename one → delete one with zero balance

- [X] T030 [P] [US2] Implement group API functions (list, getById, create, update) in frontend/src/api/groups.ts
- [X] T031 [P] [US2] Implement member API functions (list, add, update, delete) in frontend/src/api/members.ts
- [X] T032 [P] [US2] Implement useGroups hook (useQuery for list, useMutation for create/update) in frontend/src/hooks/useGroups.ts
- [X] T033 [P] [US2] Implement useMembers hook (useQuery for list, useMutation for add/update/delete) in frontend/src/hooks/useMembers.ts
- [X] T034 [US2] Create GroupsListPage with group cards, "New Group" button, and empty state in frontend/src/pages/GroupsListPage.tsx
- [X] T035 [US2] Create GroupDetailPage with tab navigation (Dashboard, Members, Expenses, Balances, Settings) in frontend/src/pages/GroupDetailPage.tsx
- [X] T036 [US2] Create MembersTab component with member list, add form, edit inline, delete with confirmation in frontend/src/components/members/MembersTab.tsx

**Checkpoint**: Groups and members fully functional via UI. Group detail page navigable with tabs.

---

## Phase 5: User Story 3 - Add & View Expenses (Priority: P1) 🎯 MVP

**Goal**: User can add expenses with all 3 split methods, view expense list with pagination

**Independent Test**: Add ₹1000 equal split among 4 → view in list → add exact/percentage splits → verify validation

- [X] T037 [P] [US3] Implement expense API functions (list with cursor, getById, create) in frontend/src/api/expenses.ts
- [X] T038 [P] [US3] Implement useExpenses hook (useInfiniteQuery for paginated list, useMutation for create) in frontend/src/hooks/useExpenses.ts
- [X] T039 [US3] Create ExpenseForm modal with description, amount, payer select, split method radio, participant checkboxes, and dynamic split inputs in frontend/src/components/expenses/ExpenseForm.tsx
- [X] T040 [US3] Create ExpensesTab component with expense list, "Add Expense" button, load-more pagination in frontend/src/components/expenses/ExpensesTab.tsx

**Checkpoint**: Expenses creatable with all 3 split methods. Client-side validation prevents invalid submissions. Paginated list displays correctly.

---

## Phase 6: User Story 4 - View Balances & Settle Up (Priority: P1) 🎯 MVP

**Goal**: User views pairwise balances, simplified debts, and can record settlements

**Independent Test**: After expenses → view balances → simplify → settle up → balances reduce

- [X] T041 [P] [US4] Implement balance API functions (getPairwise, getSimplified) in frontend/src/api/balances.ts
- [X] T042 [P] [US4] Implement settlement API functions (list, create) in frontend/src/api/settlements.ts
- [X] T043 [P] [US4] Implement useBalances hook (useQuery for pairwise and simplified) in frontend/src/hooks/useBalances.ts
- [X] T044 [P] [US4] Implement useSettlements hook (useQuery for list, useMutation for create) in frontend/src/hooks/useSettlements.ts
- [X] T045 [US4] Create BalancesTab component with pairwise balance cards, member net summary, simplify toggle, settle-up button in frontend/src/components/balances/BalancesTab.tsx
- [X] T046 [US4] Create SettlementForm modal with payer/payee selects, amount input, validation in frontend/src/components/settlements/SettlementForm.tsx

**Checkpoint**: Full expense→balance→settle cycle works via UI. Simplified debts displayed. Auto-cap shown on overpayment.

---

## Phase 7: User Story 5 - Edit & Delete Expenses/Settlements (Priority: P2)

**Goal**: User can edit/delete expenses and settlements with optimistic locking

**Independent Test**: Edit expense amount → balances update → delete expense → balances revert → trigger conflict error on stale version

- [X] T047 [P] [US5] Extend expense API with update and delete functions in frontend/src/api/expenses.ts
- [X] T048 [P] [US5] Extend settlement API with update and delete functions in frontend/src/api/settlements.ts
- [X] T049 [US5] Extend useExpenses hook with update and delete mutations (invalidate balances + dashboard on success) in frontend/src/hooks/useExpenses.ts
- [X] T050 [US5] Extend useSettlements hook with update and delete mutations in frontend/src/hooks/useSettlements.ts
- [X] T051 [US5] Add edit and delete actions to ExpensesTab (edit opens pre-filled ExpenseForm, delete shows ConfirmDialog) in frontend/src/components/expenses/ExpensesTab.tsx
- [X] T052 [US5] Add edit and delete actions to settlement list in BalancesTab in frontend/src/components/balances/BalancesTab.tsx
- [X] T053 [US5] Handle 409 conflict responses (optimistic locking) with error toast and reload option in frontend/src/api/client.ts

**Checkpoint**: Full CRUD for expenses and settlements. Optimistic locking conflicts shown to user.

---

## Phase 8: User Story 6 - Dashboard Overview (Priority: P2)

**Goal**: Group opens to dashboard showing totals, member summaries, and category breakdown

**Independent Test**: After expenses in multiple categories → dashboard shows correct totals, per-member breakdown, category split

- [X] T054 [P] [US6] Implement dashboard API function (getDashboard) in frontend/src/api/dashboard.ts
- [X] T055 [P] [US6] Implement useDashboard hook (useQuery for dashboard data) in frontend/src/hooks/useDashboard.ts
- [X] T056 [US6] Create DashboardTab component with total expenditure card, member summary table, category breakdown list in frontend/src/components/dashboard/DashboardTab.tsx

**Checkpoint**: Dashboard is default tab showing accurate financial summaries. Net balances color-coded.

---

## Phase 9: User Story 7 - Export Ledger (Priority: P3)

**Goal**: User can download group ledger as text or PDF file

**Independent Test**: Click "Export as Text" → .txt downloads. Click "Export as PDF" → .pdf downloads.

- [X] T057 [P] [US7] Implement export API function (download as blob with format param) in frontend/src/api/exports.ts
- [X] T058 [US7] Create SettingsTab component with group rename, export buttons (text + PDF), and download trigger logic in frontend/src/components/groups/SettingsTab.tsx

**Checkpoint**: Both text and PDF exports download correctly from Settings tab.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, responsive refinements, and dev workflow

- [X] T059 Wire all tab components into GroupDetailPage (DashboardTab, MembersTab, ExpensesTab, BalancesTab, SettingsTab) in frontend/src/pages/GroupDetailPage.tsx
- [X] T060 [P] Add responsive styling to all pages (mobile menu, scrollable tabs, stacked forms on mobile) across frontend/src/components/
- [X] T061 [P] Configure Vite proxy for /api to localhost:3000 in frontend/vite.config.ts
- [X] T062 [P] Add npm scripts (dev, build, preview, lint, test) in frontend/package.json
- [X] T063 [P] Create .env.example with VITE_API_URL variable in frontend/.env.example
- [X] T064 Verify full end-to-end flow works (register → create group → add members → add expense → view balances → settle up → export) locally

---

## Dependencies

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundation) → Phase 3 (US1: Auth)
                                        → Phase 4 (US2: Groups) [requires US1]
                                        → Phase 5 (US3: Expenses) [requires US2]
                                        → Phase 6 (US4: Balances) [requires US3]
                                        → Phase 7 (US5: Edit/Delete) [requires US3 + US4]
                                        → Phase 8 (US6: Dashboard) [requires US2]
                                        → Phase 9 (US7: Export) [requires US2]
Phase 10 (Polish) → after all user story phases complete
```

### Parallel Execution Opportunities

**Within Phase 2** (after T009 types are defined):
- T010, T011 (utilities) — parallel
- T015-T021 (UI components) — all parallel
- T022, T023 (layouts) — parallel

**Within Phase 4** (after foundation):
- T030, T031 (API functions) — parallel
- T032, T033 (hooks) — parallel

**Within Phase 6** (after expenses):
- T041, T042 (API functions) — parallel
- T043, T044 (hooks) — parallel

**Within Phase 7** (edit/delete):
- T047, T048 (API extensions) — parallel

---

## Implementation Strategy

### MVP Scope (Phase 1–6)
Delivers the full core loop: register → create group → add members → add expense → view balances → settle up. This is independently deployable and demonstrates all primary functionality.

### Incremental Additions (Phase 7–9)
- Phase 7 adds edit/delete (corrections workflow)
- Phase 8 adds dashboard (at-a-glance summaries)
- Phase 9 adds export (sharing capability)

### Key Architecture Decisions
- **TanStack Query** manages all server state — no manual loading/error state management
- **In-memory tokens** — access token in closure, refresh on 401 via Axios interceptor
- **Tab-based navigation** — single GroupDetailPage with ?tab= query param
- **No form library** — controlled components with custom validation helpers (YAGNI)
- **Tailwind CSS only** — no component library, compose from utilities
