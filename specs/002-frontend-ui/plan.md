# Implementation Plan: Frontend UI

**Branch**: `002-frontend-ui` | **Date**: 2026-06-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-frontend-ui/spec.md`

## Summary

Build a React SPA frontend at `frontend/` that consumes the existing Express.js backend API (running on localhost:3000). The frontend provides authentication, group/member CRUD, expense splitting with 3 methods, balance viewing with debt simplification, settlements, dashboard overview, and ledger export. Uses Vite + TypeScript + Tailwind CSS + TanStack Query + React Router with in-memory JWT storage and tab-based group navigation.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode) with React 18+

**Primary Dependencies**: React, React Router v6, TanStack Query v5, Axios, Tailwind CSS, react-hot-toast

**Storage**: N/A (thin client — all data on backend via REST API)

**Testing**: Vitest + React Testing Library

**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge — latest 2 versions), responsive 375px–1920px

**Project Type**: Single-page web application (SPA)

**Performance Goals**: Page transitions <300ms, feedback within 200ms, no full-page reloads

**Constraints**: No localStorage for tokens, no offline support, no i18n, no WebSocket

**Scale/Scope**: ~10 pages/views, ~15 components, 1 API client layer, 5 group detail tabs

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Data Integrity | ✅ PASS | Frontend is thin client — all calculations done on backend. Display only converts paisa→rupees (÷100) |
| II. Security & Privacy | ✅ PASS | Tokens stored in memory (not localStorage), refresh rotation via /api/auth/refresh, no secrets in frontend |
| III. API-First Design | ✅ PASS | Frontend consumes backend exclusively via documented REST API through typed API client |
| IV. Multi-User Correctness | ✅ PASS | Optimistic locking conflicts handled via version check errors + reload offer |
| V. Simplicity & Incremental | ✅ PASS | Thin client, no business logic duplication, YAGNI (no offline, no i18n, no WebSocket) |

**Gate Result**: ✅ ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/002-frontend-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (UI state model)
├── quickstart.md        # Phase 1 output (validation guide)
└── contracts/           # Phase 1 output (page routes & component contracts)
```

### Source Code (repository root)

```text
frontend/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Router + providers setup
│   ├── api/
│   │   ├── client.ts              # Axios instance with interceptors
│   │   ├── auth.ts                # Auth API calls
│   │   ├── groups.ts              # Group API calls
│   │   ├── members.ts            # Member API calls
│   │   ├── expenses.ts           # Expense API calls
│   │   ├── settlements.ts        # Settlement API calls
│   │   ├── balances.ts           # Balance API calls
│   │   ├── dashboard.ts          # Dashboard API calls
│   │   └── exports.ts            # Export API calls
│   ├── hooks/
│   │   ├── useAuth.ts            # Auth context hook
│   │   ├── useGroups.ts          # TanStack Query hooks for groups
│   │   ├── useMembers.ts         # TanStack Query hooks for members
│   │   ├── useExpenses.ts        # TanStack Query hooks for expenses
│   │   ├── useSettlements.ts     # TanStack Query hooks for settlements
│   │   ├── useBalances.ts        # TanStack Query hooks for balances
│   │   └── useDashboard.ts       # TanStack Query hooks for dashboard
│   ├── contexts/
│   │   └── AuthContext.tsx        # Auth provider + token management
│   ├── components/
│   │   ├── ui/                    # Shared UI primitives (Button, Input, Modal, Toast, Spinner, Tabs)
│   │   ├── layout/               # Layout shells (AppLayout, AuthLayout)
│   │   ├── groups/               # Group-specific components
│   │   ├── members/              # Member-specific components
│   │   ├── expenses/             # Expense-specific components
│   │   ├── settlements/          # Settlement-specific components
│   │   ├── balances/             # Balance-specific components
│   │   └── dashboard/            # Dashboard-specific components
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── GroupsListPage.tsx
│   │   └── GroupDetailPage.tsx    # Tab container (Dashboard, Members, Expenses, Balances, Settings)
│   ├── utils/
│   │   ├── format.ts             # Currency formatting (paisa→₹), date formatting
│   │   └── validation.ts         # Client-side form validation helpers
│   └── types/
│       └── index.ts              # Shared TypeScript interfaces matching backend responses
└── tests/
    └── components/               # Component tests with React Testing Library
```

**Structure Decision**: Web application structure with `frontend/` at repository root alongside existing `backend/`. Independent package.json and tooling per constitution's monorepo mandate.

## Complexity Tracking

No constitution violations — no entries needed.
