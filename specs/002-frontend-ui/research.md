# Research: Frontend UI

**Created**: 2026-06-05
**Feature**: [spec.md](spec.md) | [plan.md](plan.md)

## 1. React + Vite + TypeScript Project Setup

**Decision**: Use Vite's React-TS template (`npm create vite@latest frontend -- --template react-ts`)

**Rationale**: Vite provides instant HMR, fast cold starts, and native TypeScript support. The react-ts template includes proper tsconfig with strict mode. Aligns with constitution's "Build Tool: Vite" mandate.

**Alternatives considered**:
- Create React App (deprecated, slow builds, no ESM)
- Next.js (SSR/SSG overkill for thin client SPA against existing API)

---

## 2. TanStack Query for Server State

**Decision**: Use `@tanstack/react-query` v5 for all server data fetching and caching

**Rationale**: Provides automatic caching, deduplication, background refetching on window focus, loading/error states, and mutation support with cache invalidation — eliminating 80% of data-fetching boilerplate. Clarified and confirmed by user.

**Key patterns**:
- `useQuery` for reads (groups, expenses, balances, dashboard)
- `useMutation` with `onSuccess` → `queryClient.invalidateQueries` for writes
- `staleTime: 30_000` (30s) to avoid excessive refetching
- `refetchOnWindowFocus: true` (default) for fresh data on tab return

**Alternatives considered**:
- SWR (similar but less mature mutation support)
- Zustand (manual cache management, more boilerplate)
- Plain useEffect (no caching, re-fetches on every mount)

---

## 3. In-Memory JWT Token Storage

**Decision**: Store access token in a module-scoped variable (closure), refresh token via httpOnly cookie or in-memory with rotation

**Rationale**: Constitution mandates "MUST NOT store tokens in localStorage". In-memory prevents XSS token theft. Refresh flow: on 401, call /api/auth/refresh → get new access token → retry original request.

**Implementation pattern**:
```
let accessToken: string | null = null;

// Axios request interceptor: attach Authorization header
// Axios response interceptor: on 401, call refresh, retry queue
```

**Alternatives considered**:
- httpOnly cookie (requires backend changes to set cookie instead of JSON response — out of scope)
- sessionStorage (still vulnerable to XSS)
- localStorage (explicitly forbidden by constitution)

---

## 4. React Router v6 Route Structure

**Decision**: Use React Router v6 with layout routes for auth vs protected sections

**Rationale**: React Router v6 supports nested layouts, outlet-based rendering, and loader patterns. Tab navigation within GroupDetailPage uses URL search params or nested routes for bookmarkability.

**Route map**:
```
/login          → LoginPage (public)
/register       → RegisterPage (public)
/groups         → GroupsListPage (protected, default redirect)
/groups/:id     → GroupDetailPage (protected, tab=dashboard default)
/groups/:id?tab=members|expenses|balances|settings
```

**Alternatives considered**:
- TanStack Router (newer, less ecosystem support)
- Wouter (too minimal for nested layouts)

---

## 5. Tailwind CSS Configuration

**Decision**: Tailwind CSS v3 with default config + custom theme for brand colors

**Rationale**: Constitution mandates "Tailwind CSS for utility-first rapid UI development". Works seamlessly with Vite via PostCSS. No component library needed — compose from utilities.

**Key setup**:
- `tailwind.config.ts` with content paths to `./src/**/*.{ts,tsx}`
- Custom colors for positive balance (green), negative balance (red), neutral (gray)
- Responsive breakpoints: sm(640), md(768), lg(1024), xl(1280)

**Alternatives considered**:
- CSS Modules (more boilerplate, less consistent)
- Styled-components (runtime overhead, not utility-first)
- shadcn/ui (uses Tailwind but adds Radix dependency — YAGNI for now)

---

## 6. Toast Notification Library

**Decision**: Use `react-hot-toast` for toast notifications

**Rationale**: Lightweight (~5KB), great defaults, supports success/error/loading states, customizable positioning and duration. Matches FR-018 requirements (auto-dismiss 4s success, persistent errors).

**Configuration**:
- Position: bottom-right
- Success duration: 4000ms
- Error duration: Infinity (manual dismiss)
- Style: Tailwind-compatible custom styling

**Alternatives considered**:
- react-toastify (larger bundle, more features than needed)
- Custom implementation (YAGNI — library does exactly what's needed)
- Sonner (good but newer, less battle-tested)

---

## 7. Currency Formatting (Paisa → Rupees)

**Decision**: Use `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })` with paisa÷100

**Rationale**: Native browser API, no library needed, handles Indian comma grouping (₹1,00,000.50) correctly. Single utility function used across all components.

**Implementation**:
```typescript
export function formatCurrency(paisa: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(paisa / 100);
}
```

**Alternatives considered**:
- Manual string formatting (error-prone, doesn't handle locale)
- currency.js (unnecessary dependency for simple division + format)

---

## 8. Form Handling

**Decision**: Use controlled components with local state + custom validation helpers (no form library)

**Rationale**: Constitution principle V (Simplicity) — the forms are straightforward (login, expense, settlement). A form library adds complexity for ~5 forms. Validation is simple (sum checks, required fields).

**Alternatives considered**:
- React Hook Form (powerful but overkill for 5 simple forms)
- Formik (heavier, declining popularity)
- Zod + React Hook Form (backend already validates — client validation is UX-only)
