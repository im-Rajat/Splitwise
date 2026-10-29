<!--
  Sync Impact Report
  Version change: 1.0.0 → 1.1.0
  Modified principles: None renamed
  Added sections: Frontend technology constraints under Technology Constraints
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ (Constitution Check compatible)
    - .specify/templates/spec-template.md ✅ (user stories structure unchanged)
    - .specify/templates/tasks-template.md ✅ (web app path convention already
      supports frontend/src/)
  Follow-up TODOs: None
-->

# Splitwise Constitution

## Core Principles

### I. Data Integrity (NON-NEGOTIABLE)

All financial calculations MUST produce mathematically correct results.
Expense splits MUST account for every cent with no rounding loss—remainder
cents MUST be deterministically assigned. Balances between users MUST always
sum to zero across the group. Database transactions MUST guarantee atomicity
for any operation that modifies balances or expense records. No expense
record may be silently deleted—soft-delete with audit trail is required.

### II. Security & Privacy

User authentication MUST use industry-standard mechanisms (bcrypt/argon2
for passwords, JWT or session tokens for access). Users MUST only access
their own data and groups they belong to—authorization checks are mandatory
at the service layer, not just the API layer. Sensitive fields (passwords,
tokens) MUST never appear in logs or API responses. All inputs MUST be
validated and sanitized at system boundaries to prevent injection attacks.
The frontend MUST NOT store tokens in localStorage—use httpOnly cookies or
in-memory storage with refresh token rotation.

### III. API-First Design

The backend MUST expose a RESTful API as the sole interface for all clients.
Every endpoint MUST have a clearly defined contract (request/response schema)
before implementation begins. API responses MUST use consistent error formats
with meaningful status codes. Pagination MUST be supported for all list
endpoints. Versioning strategy MUST be defined before the first public
release. The frontend MUST consume the backend exclusively through the
documented REST API—no direct database access or server-side rendering
that bypasses the API layer.

### IV. Multi-User Correctness

The system MUST handle concurrent modifications gracefully—optimistic locking
or equivalent conflict resolution is required for shared resources (groups,
expenses). Group membership changes MUST NOT corrupt existing balance
calculations. Every expense MUST be attributable to exactly one payer and
one or more participants. Settlement transactions MUST correctly reduce
outstanding balances between users.

### V. Simplicity & Incremental Delivery

Start with the minimal viable feature set: create groups, add expenses,
view balances, record settlements. Additional features (recurring expenses,
currency conversion, receipt images) MUST be deferred until core
functionality is stable and tested. YAGNI applies—do not build abstractions
for hypothetical future requirements. Each user story MUST be independently
deployable and testable. The frontend MUST be a thin client that delegates
all business logic to the backend API.

## Technology Constraints

### Backend (Implemented)

- **Runtime**: Node.js 20 LTS with TypeScript 5.x (strict mode)
- **Framework**: Express.js 4.x
- **ORM**: Prisma 7.x with PostgreSQL 16
- **Authentication**: JWT access tokens (15min) + refresh tokens (7 days)
- **Validation**: Zod at API boundaries
- **Testing**: Jest + ts-jest + Supertest

### Frontend

- **Framework**: React 18+ with TypeScript (strict mode)
- **Build Tool**: Vite for fast local development and optimized builds
- **Routing**: React Router for client-side navigation
- **State Management**: React Context or Zustand—avoid Redux unless
  complexity warrants it
- **HTTP Client**: Axios or fetch with a typed API client layer
- **Styling**: Tailwind CSS for utility-first rapid UI development
- **Testing**: Vitest + React Testing Library for component tests

### Shared

- **Database**: PostgreSQL for relational data integrity and ACID compliance
- **Code Style**: Linter and formatter MUST be configured from project
  initialization; CI MUST enforce lint checks
- **Monorepo Structure**: `backend/` and `frontend/` directories at
  repository root; each with independent package.json and build tooling

## Development Workflow

- All changes MUST go through feature branches and pull requests
- Each PR MUST include tests covering the new or changed behavior
- Financial calculation changes require explicit reviewer approval
- Database migrations MUST be reversible (up + down scripts)
- Commit messages MUST follow Conventional Commits format
  (`feat:`, `fix:`, `docs:`, `test:`, `chore:`)
- Frontend and backend MUST be runnable independently for local
  development (backend on port 3000, frontend on port 5173)

## Governance

This constitution supersedes all other development practices for the
Splitwise project. Amendments require:

1. A written proposal describing the change and rationale
2. Version bump following semantic versioning:
   - MAJOR: Principle removal or incompatible redefinition
   - MINOR: New principle or materially expanded guidance
   - PATCH: Clarifications and wording fixes
3. Update to this document with new version and amendment date

All code reviews MUST verify compliance with these principles.
Deviations MUST be documented and justified in the PR description.

**Version**: 1.1.0 | **Ratified**: 2026-06-04 | **Last Amended**: 2026-06-05
