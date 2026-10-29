# Implementation Plan: Expense Splitting Core

**Branch**: `001-expense-splitting-core` | **Date**: 2026-06-04 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-expense-splitting-core/spec.md`

## Summary

A web-based expense splitting application where a single authenticated user creates groups, adds members, records shared expenses with multiple split methods (Equal, Exact, Percentage), logs settlements between members, and views simplified debt suggestions. The backend exposes a RESTful API (Node.js + Express) backed by PostgreSQL, with JWT authentication and comprehensive audit logging.

## Technical Context

**Language/Version**: Node.js 20 LTS (TypeScript 5.x)

**Primary Dependencies**: Express.js, Prisma ORM, jsonwebtoken, bcrypt, zod (validation), pdfkit (export)

**Storage**: PostgreSQL 16

**Testing**: Jest (unit + integration), Supertest (API tests)

**Target Platform**: Linux server (Docker-ready)

**Project Type**: web-service (REST API + future frontend)

**Performance Goals**: Dashboard loads within 2 seconds for groups with up to 500 expenses

**Constraints**: All financial amounts stored as integer paisa (no floating point); balances must sum to zero invariant

**Scale/Scope**: Single user, 2–20 members per group, up to 500 expenses per group (v1)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Data Integrity | Amounts stored as integers (paisa); remainder assignment defined; atomic transactions; soft-delete with audit | ✅ PASS |
| II. Security & Privacy | JWT auth; bcrypt passwords; service-layer authorization; input validation via zod | ✅ PASS |
| III. API-First Design | RESTful API as sole interface; contracts defined before implementation; consistent error format; pagination planned | ✅ PASS |
| IV. Multi-User Correctness | Optimistic locking on shared resources; membership changes don't corrupt balances; payer/participant constraints enforced | ✅ PASS |
| V. Simplicity & Incremental Delivery | MVP scope: groups, expenses, settlements, balances; advanced features deferred; each story independently testable | ✅ PASS |

**Gate Result**: ALL PASS — proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-expense-splitting-core/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/          # Prisma schema + generated client
│   ├── services/        # Business logic (split engine, balance calculator, debt simplifier)
│   ├── api/
│   │   ├── routes/      # Express route handlers
│   │   ├── middleware/  # Auth, validation, error handling
│   │   └── validators/  # Zod schemas for request validation
│   ├── utils/           # Shared utilities (remainder distribution, etc.)
│   └── app.ts           # Express app setup
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── migrations/      # Reversible migrations
├── tests/
│   ├── unit/            # Business logic tests (split calculations, debt simplification)
│   └── integration/     # API endpoint tests (Supertest)
├── package.json
└── tsconfig.json
```

**Structure Decision**: Web application backend-only for v1. Frontend is out of scope per spec assumptions. Single `backend/` directory at repo root with standard Express/Prisma layout.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
