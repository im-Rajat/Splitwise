# Research: Expense Splitting Core

**Feature**: 001-expense-splitting-core
**Date**: 2026-06-04
**Purpose**: Resolve technology choices and document best practices for implementation

## Technology Decisions

### 1. Backend Framework: Express.js + TypeScript

**Decision**: Express.js 4.x with TypeScript 5.x on Node.js 20 LTS

**Rationale**:
- Constitution allows "Node.js or Python with a well-supported web framework"
- Express is the most mature Node.js framework with extensive middleware ecosystem
- TypeScript adds type safety critical for financial calculations (compile-time checks on amount types)
- Huge community = easy to find solutions for edge cases

**Alternatives considered**:
- Fastify: Faster but smaller ecosystem; Express's performance is sufficient for v1 scale
- NestJS: Over-engineered for MVP scope; adds DI framework complexity not needed yet
- Python/FastAPI: Excellent but team familiarity assumed with Node.js ecosystem

### 2. ORM: Prisma

**Decision**: Prisma ORM with PostgreSQL connector

**Rationale**:
- Type-safe database queries generated from schema (catches schema drift at compile time)
- Built-in migration system with up/down support (satisfies constitution: reversible migrations)
- Declarative schema is readable and auditable
- Handles connection pooling out of the box

**Alternatives considered**:
- TypeORM: More flexible but weaker type safety; decorator-heavy API
- Knex.js: Query builder only; no schema management, more boilerplate
- Drizzle: Newer, less mature ecosystem; fewer production references

### 3. Financial Amount Representation: Integer Paisa

**Decision**: Store all amounts as integers representing paisa (1 ₹ = 100 paisa)

**Rationale**:
- Eliminates floating-point arithmetic errors entirely (Constitution Principle I)
- ₹1000.50 stored as `100050` (integer)
- All split calculations operate on integers; remainder distribution is trivial
- Display layer converts paisa → ₹ only at API response boundary

**Alternatives considered**:
- Decimal type in DB + decimal.js library: Adds complexity; PostgreSQL NUMERIC works but Prisma's Decimal type has quirks
- Floating point with rounding: Violates Constitution Principle I (data integrity)

### 4. Remainder Distribution Algorithm

**Decision**: First participant(s) in list receive extra paisa(s)

**Rationale**:
- Per clarification session: deterministic, simple, testable
- Algorithm: `base = floor(total / n)`, remainder = `total - (base * n)`, first `remainder` participants get `base + 1`
- Participant list order is the insertion order stored in DB

**Alternatives considered**:
- Payer absorbs: Less fair to payer
- Round-robin across expenses: Complex state tracking across expenses

### 5. Debt Simplification Algorithm

**Decision**: Net-balance greedy algorithm (min-cash-flow)

**Rationale**:
- Compute net balance for each member (sum of what they're owed minus what they owe)
- Separate into creditors (positive net) and debtors (negative net)
- Match largest debtor with largest creditor, transfer min of both, repeat
- Produces optimal or near-optimal result for small groups (2-20 members)
- O(n log n) sorting + O(n) matching = trivially fast for group sizes in scope

**Alternatives considered**:
- Graph-based min-cost flow: Optimal but overkill for ≤20 members
- Subset-sum NP-hard exact solution: Not needed for small groups
- No simplification: Functional but poor UX with many small transactions

### 6. Authentication: JWT with bcrypt

**Decision**: Stateless JWT access tokens + bcrypt password hashing

**Rationale**:
- Constitution mandates JWT-based stateless auth
- bcrypt with cost factor 12 for password hashing (argon2 is better but bcrypt is simpler to deploy)
- Short-lived access tokens (15 min) + refresh tokens (7 days) for session management
- No need for session store (stateless = simpler infrastructure)

**Alternatives considered**:
- Session cookies + Redis: Adds infrastructure dependency; not API-first friendly
- Argon2: Superior algorithm but requires native bindings; bcrypt is sufficient for single-user app

### 7. Validation: Zod

**Decision**: Zod for runtime request validation

**Rationale**:
- TypeScript-first schema validation with excellent type inference
- Composable schemas (reuse between create/update operations)
- Clear error messages for API consumers
- Works at system boundary (Constitution Principle II: validate at boundaries)

**Alternatives considered**:
- Joi: Well-established but weaker TypeScript integration
- class-validator: Decorator-based; doesn't compose well
- Manual validation: Error-prone and repetitive

### 8. PDF Export: pdfkit

**Decision**: pdfkit for PDF generation

**Rationale**:
- Pure JavaScript (no native dependencies, no headless browser needed)
- Streaming API = memory efficient for large ledgers
- Sufficient for tabular financial data (no complex layout needed)

**Alternatives considered**:
- Puppeteer/Playwright: Heavyweight; requires headless browser
- jsPDF: Browser-focused; less suitable for server-side
- LaTeX pipeline: Over-engineered for simple table output

## Best Practices

### Financial Calculation Safety

1. Never use `number` type for monetary amounts—always `bigint` or integer fields
2. All split calculations must have a sum-check assertion: `sum(shares) === total`
3. Balance recalculation should be idempotent (recompute from source transactions, not incremental deltas)
4. Use database transactions for any operation touching balances

### API Design Patterns

1. Consistent error response format: `{ error: { code: string, message: string, details?: object } }`
2. Pagination via cursor-based approach for list endpoints (more reliable than offset for concurrent writes)
3. Optimistic locking via `version` field on mutable resources (groups, expenses, settlements)
4. Soft-delete pattern: `deletedAt` timestamp field; queries filter `WHERE deletedAt IS NULL` by default

### Testing Strategy

1. Unit tests for split engine (all three methods + remainder cases)
2. Unit tests for debt simplification (verify net-balance invariant)
3. Integration tests for full API flows (create group → add expense → settle → verify balances)
4. Property-based testing for split calculations: `forAll(amount, participants) => sum(splits) === amount`
