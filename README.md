# Splitwise

A web app for splitting shared expenses within a group, tracking who owes whom, and settling up. It works like Splitwise.

You create a group, add the people in it, record expenses (split equally, by exact amounts, or by percentage), and the app keeps running balances. It can also suggest the fewest payments needed to settle everyone.

## Features

- **Accounts**: register and log in with email and password. Uses JWT access and refresh tokens.
- **Groups**: create and rename groups. Each group belongs to the user who created it.
- **Members**: add, rename, and remove people in a group. Members are names only and do not need an account. You can only remove a member whose balance is zero.
- **Expenses**: record who paid and how the cost is split.
  - `EQUAL`: the total is divided evenly among the selected participants.
  - `EXACT`: you give each person's amount, and the amounts must add up to the total.
  - `PERCENTAGE`: you give each person's percentage, and the percentages must add up to 100.
  - Categories: Food, Transport, Accommodation, Entertainment, Utilities, Other. Other requires a short note.
- **Settlements**: record a payment from one member to another to reduce what they owe.
- **Balances**: shows who owes whom between each pair of members, plus each member's net balance.
- **Simplified debts**: suggests the smallest set of payments that settles the whole group.
- **Dashboard**: shows group totals, how much each member paid compared with their share, and a breakdown by category.
- **Audit log**: keeps the full before and after state of every change to an expense or settlement.
- **Export**: downloads the group ledger as plain text or PDF.
- **Safe concurrent edits**: expenses and settlements carry a version number, so a stale edit is rejected instead of silently overwriting someone else's change.

## Tech stack

| Layer    | Tech |
|----------|------|
| Backend  | Node.js 20, Express 5, TypeScript, Prisma 7 (with the `pg` adapter), Zod, JWT, bcrypt, PDFKit |
| Database | PostgreSQL 16 |
| Frontend | React 18, Vite 6, TypeScript, TanStack Query, React Router 6, Tailwind CSS, Axios |
| Tooling  | Jest + Supertest (backend), Vitest (frontend), ESLint, Prettier, Docker Compose |

## Project structure

```
.
├── docker-compose.yml        # Postgres + backend containers
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma     # Data model
│   │   └── migrations/       # SQL migrations
│   ├── prisma.config.ts      # Prisma CLI config (reads DATABASE_URL)
│   ├── src/
│   │   ├── server.ts         # Entry point, starts HTTP server
│   │   ├── app.ts            # Express app and route wiring
│   │   ├── config/           # Env validation, Prisma client
│   │   ├── api/
│   │   │   ├── routes/       # One router per resource
│   │   │   ├── middleware/   # Auth, group access, validation, errors
│   │   │   └── validators/   # Zod request schemas
│   │   ├── services/         # Business logic (split engine, balances, debt simplifier, ...)
│   │   └── utils/            # JWT, hashing, pagination, errors, version check
│   └── tests/                # Jest tests
└── frontend/
    ├── vite.config.ts        # Dev server on 5173, proxies /api to :3000
    └── src/
        ├── api/              # Axios client and per-resource API calls
        ├── hooks/            # TanStack Query hooks
        ├── contexts/         # Auth state
        ├── pages/            # Login, Register, Groups list, Group detail
        ├── components/       # Tabs (Dashboard, Members, Expenses, Balances, Settings) and UI parts
        └── utils/            # Currency/date formatting, form validation
```

## Prerequisites

- Node.js 20 or newer, and npm
- Docker and Docker Compose (the easiest way to run PostgreSQL)
- Or a local PostgreSQL 16 install instead of Docker

## Getting started

### Option A: Postgres in Docker, app on your machine (recommended for development)

1. Start the database.

   ```bash
   docker compose up -d db
   ```

   This starts Postgres on `localhost:5432` with user `postgres`, password `postgres`, and database `splitwise_dev`.

2. Set up and start the backend.

   ```bash
   cd backend
   cp .env.example .env      # defaults already point at the Docker database
   npm install
   npx prisma migrate deploy # create the tables
   npm run generate          # generate the Prisma client
   npm run dev               # http://localhost:3000
   ```

3. Start the frontend in a second terminal.

   ```bash
   cd frontend
   npm install
   npm run dev               # http://localhost:5173
   ```

4. Open http://localhost:5173 and register an account.

The Vite dev server forwards every `/api/*` request to `http://localhost:3000`, so you do not need to configure CORS or an API URL.

### Option B: backend and database both in Docker

```bash
docker compose up -d --build
```

The container does not run migrations on startup. Run them once from your machine against the exposed database port:

```bash
cd backend
npm install
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/splitwise_dev?schema=public" npx prisma migrate deploy
```

The API is then available at http://localhost:3000. The frontend is not part of Compose, so start it with `npm run dev` as in Option A, step 3.

To stop everything: `docker compose down`. Add `-v` to also delete the database volume.

## Configuration

### Backend (`backend/.env`)

| Variable             | Required | Default | Description |
|----------------------|----------|---------|-------------|
| `DATABASE_URL`       | yes      |         | PostgreSQL connection string |
| `JWT_SECRET`         | yes      |         | Secret used to sign access tokens (at least 8 characters) |
| `JWT_REFRESH_SECRET` | yes      |         | Secret used to sign refresh tokens (at least 8 characters) |
| `PORT`               | no       | `3000`  | HTTP port |

The server checks these at startup and exits with a clear error if any are missing or invalid.

Use long, random, separate secrets in any shared or production environment. The values in `docker-compose.yml` are for local development only.

### Frontend

The frontend calls `/api` on its own origin. In development, Vite proxies that path to the backend (see `frontend/vite.config.ts`). In production, serve the built frontend and the API behind the same host, or put a reverse proxy in front that routes `/api` to the backend.

## Scripts

### Backend (`cd backend`)

| Command                  | What it does |
|--------------------------|--------------|
| `npm run dev`            | Run the server with ts-node |
| `npm run build`          | Compile TypeScript to `dist/` |
| `npm start`              | Run the compiled server |
| `npm test`               | Run Jest tests |
| `npm run test:coverage`  | Run tests with a coverage report |
| `npm run lint`           | Lint `src/` and `tests/` |
| `npm run format`         | Format with Prettier |
| `npm run migrate`        | Create and apply a new migration in development (`prisma migrate dev`) |
| `npm run migrate:deploy` | Apply existing migrations (`prisma migrate deploy`) |
| `npm run generate`       | Regenerate the Prisma client after schema changes |

### Frontend (`cd frontend`)

| Command           | What it does |
|-------------------|--------------|
| `npm run dev`     | Start the Vite dev server on port 5173 |
| `npm run build`   | Type-check and build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint`    | Lint `src/` |
| `npm test`        | Run Vitest |

## Using the app

1. **Register** at `/register`, or **log in** at `/login`.
2. **Create a group** on the Groups page, for example "Goa Trip".
3. Open the group. It has five tabs:
   - **Members**: add everyone who shares costs. Names must be unique within the group.
   - **Expenses**: add an expense. Pick who paid, the amount, the category, and the split method.
     - The payer must be one of the participants.
     - With **Equal**, choose who shares the cost. If the amount does not divide evenly, the extra paisa go to the first people in the list.
     - With **Exact**, enter each person's amount. The amounts must add up to the total.
     - With **Percentage**, enter each person's percentage. The percentages must add up to 100. Rounding leftovers go to the people with the largest fractions.
   - **Balances**: see who owes whom, each member's net balance, and the simplified list of payments. Record a settlement here when someone pays someone back.
   - **Dashboard**: group totals, paid vs share per member, and spending by category.
   - **Settings**: rename the group, and export the ledger as PDF or plain text.
4. Edit or delete expenses and settlements as needed. Deleting is a soft delete: the record drops out of balances but stays in the audit log.
5. If two people edit the same record at once, the second save is rejected with a message asking you to reload and try again.

## Money and balances

- All amounts are **integers in paisa** (1 rupee = 100 paisa). For example, ₹250.50 is sent and stored as `25050`. The UI formats amounts as INR.
- A **positive** net balance means the member is owed money. A **negative** net balance means they owe money.
- **Pairwise balances** net out debts between each pair of members. If A owes B ₹100 and B owes A ₹30, the result is "A owes B ₹70".
- **Simplified debts** use a greedy min-cash-flow method: repeatedly match the largest debtor with the largest creditor. This keeps the number of payments small.

## API reference

Base URL: `http://localhost:3000/api`

Every endpoint except `/auth/*` needs the header `Authorization: Bearer <accessToken>`. Group routes return `404` if the group does not exist and `403` if it belongs to another user.

### Auth

| Method | Path             | Body |
|--------|------------------|------|
| POST   | `/auth/register` | `{ email, password, name }` (password 8 to 128 characters) |
| POST   | `/auth/login`    | `{ email, password }` |
| POST   | `/auth/refresh`  | `{ refreshToken }` |

All three return `{ accessToken, refreshToken, expiresIn, user }`. Access tokens last 15 minutes and refresh tokens last 7 days.

### Groups

| Method | Path                | Notes |
|--------|---------------------|-------|
| POST   | `/groups`           | `{ name }` |
| GET    | `/groups`           | Paginated list of your groups |
| GET    | `/groups/:groupId`  | Group with its members |
| PATCH  | `/groups/:groupId`  | `{ name }` |

### Members

| Method | Path                                 | Notes |
|--------|--------------------------------------|-------|
| POST   | `/groups/:groupId/members`           | `{ displayName }` (1 to 50 characters, unique in the group) |
| PATCH  | `/groups/:groupId/members/:memberId` | `{ displayName }` |
| DELETE | `/groups/:groupId/members/:memberId` | Fails with `409 MEMBER_HAS_BALANCE` if the balance is not zero |

### Expenses

| Method | Path                                   | Notes |
|--------|----------------------------------------|-------|
| POST   | `/groups/:groupId/expenses`            | Create an expense (see body below) |
| GET    | `/groups/:groupId/expenses`            | Paginated list, newest first. Optional `category` filter |
| GET    | `/groups/:groupId/expenses/:expenseId` | One expense with its shares |
| PUT    | `/groups/:groupId/expenses/:expenseId` | Full replace. Same body as create, plus `version` |
| DELETE | `/groups/:groupId/expenses/:expenseId` | Soft delete |

Request body fields:

| Field            | Type       | Notes |
|------------------|------------|-------|
| `totalAmount`    | int        | In paisa, greater than 0 |
| `payerId`        | uuid       | Must be a member of the group and one of the participants |
| `category`       | enum       | `FOOD`, `TRANSPORT`, `ACCOMMODATION`, `ENTERTAINMENT`, `UTILITIES`, `OTHER` |
| `categoryNote`   | string     | Required when `category` is `OTHER` (max 100 characters) |
| `description`    | string     | Optional (max 200 characters) |
| `splitMethod`    | enum       | `EQUAL`, `EXACT`, `PERCENTAGE` |
| `participantIds` | uuid[]     | Required for `EQUAL` |
| `shares`         | object[]   | Required for `EXACT` (`{ memberId, amount }`) and `PERCENTAGE` (`{ memberId, percentage }`) |
| `version`        | int        | Required on `PUT`. Must match the current version |

### Settlements

| Method | Path                                         | Notes |
|--------|----------------------------------------------|-------|
| POST   | `/groups/:groupId/settlements`               | `{ payerId, payeeId, amount }`. Payer and payee must be different |
| GET    | `/groups/:groupId/settlements`               | Paginated list |
| GET    | `/groups/:groupId/settlements/:settlementId` | One settlement |
| PUT    | `/groups/:groupId/settlements/:settlementId` | `{ payerId, payeeId, amount, version }` |
| DELETE | `/groups/:groupId/settlements/:settlementId` | Soft delete |

### Balances, dashboard, audit log, export

| Method | Path                                    | Notes |
|--------|-----------------------------------------|-------|
| GET    | `/groups/:groupId/balances`             | Pairwise balances and per-member net balance |
| GET    | `/groups/:groupId/balances/simplified`  | Suggested payments, with before and after transaction counts |
| GET    | `/groups/:groupId/dashboard`            | Totals, per-member paid vs share, category breakdown |
| GET    | `/groups/:groupId/audit-log`            | Optional filters: `entityType` (`EXPENSE` or `SETTLEMENT`), `entityId` |
| GET    | `/groups/:groupId/export?format=text`   | Ledger as plain text |
| GET    | `/groups/:groupId/export?format=pdf`    | Ledger as a PDF download |

### Pagination

List endpoints accept `limit` (1 to 100, default 20) and `cursor`. They return:

```json
{ "data": [ ... ], "nextCursor": "uuid-or-null" }
```

To get the next page, pass `nextCursor` back as `cursor`. A `null` cursor means there are no more pages.

### Errors

Every error uses the same shape:

```json
{ "error": { "code": "VERSION_CONFLICT", "message": "...", "details": { } } }
```

| Status | Typical codes |
|--------|---------------|
| 401    | `UNAUTHORIZED` (missing, invalid, or expired token) |
| 403    | `FORBIDDEN` (group belongs to another user) |
| 404    | `GROUP_NOT_FOUND`, `MEMBER_NOT_FOUND`, `EXPENSE_NOT_FOUND`, `SETTLEMENT_NOT_FOUND` |
| 409    | `EMAIL_ALREADY_EXISTS`, `DUPLICATE_MEMBER_NAME`, `MEMBER_HAS_BALANCE`, `VERSION_CONFLICT` |
| 422    | `VALIDATION_ERROR` (with per-field `details`) |
| 500    | `INTERNAL_ERROR` |

### Example with curl

```bash
API=http://localhost:3000/api

# Register and capture the access token
TOKEN=$(curl -s -X POST $API/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"asha@example.com","password":"password123","name":"Asha"}' | jq -r .accessToken)

AUTH="Authorization: Bearer $TOKEN"

# Create a group
GROUP=$(curl -s -X POST $API/groups -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"name":"Goa Trip"}' | jq -r .id)

# Add two members
A=$(curl -s -X POST $API/groups/$GROUP/members -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"displayName":"Asha"}' | jq -r .id)
B=$(curl -s -X POST $API/groups/$GROUP/members -H "$AUTH" -H 'Content-Type: application/json' \
  -d '{"displayName":"Ravi"}' | jq -r .id)

# Asha pays ₹1,200 for dinner, split equally
curl -s -X POST $API/groups/$GROUP/expenses -H "$AUTH" -H 'Content-Type: application/json' \
  -d "{\"totalAmount\":120000,\"category\":\"FOOD\",\"description\":\"Dinner\",\"splitMethod\":\"EQUAL\",\"payerId\":\"$A\",\"participantIds\":[\"$A\",\"$B\"]}"

# Ravi now owes Asha ₹600
curl -s $API/groups/$GROUP/balances -H "$AUTH" | jq
```

## Data model

- **User**: an account (email, password hash, name). Owns groups and writes audit log entries.
- **Group**: belongs to one user and has members, expenses, and settlements.
- **Member**: a named person in a group, unique by name within that group.
- **Expense**: total amount, payer, category, split method, `version`, and `deletedAt` for soft delete.
- **ExpenseShare**: one member's portion of an expense, in paisa.
- **Settlement**: a payment from one member to another, with `version` and `deletedAt`.
- **AuditLog**: entity type and ID, action (`CREATED`, `UPDATED`, `DELETED`), previous and new state as JSON, and the user who made the change.

See `backend/prisma/schema.prisma` for the full schema.

## Testing

```bash
cd backend && npm test
cd frontend && npm test
```

The backend integration tests in `backend/tests/integration/api.test.ts` are placeholders for now. They do not yet set up a test database.

## Limitations

- Groups have a single owner. Members are labels, not user accounts, so the group cannot be shared with other users.
- Tokens are kept in memory in the browser, so refreshing the page logs you out.
- The currency is fixed to INR.
- The frontend is not containerized.
