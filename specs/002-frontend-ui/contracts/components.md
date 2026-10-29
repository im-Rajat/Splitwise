# Component Contracts

## Shared UI Components (`src/components/ui/`)

### Button
- Props: `variant` (primary|secondary|danger|ghost), `size` (sm|md|lg), `loading`, `disabled`, `onClick`, `type`, `children`
- Renders: Tailwind-styled button with loading spinner overlay when `loading=true`

### Input
- Props: `label`, `type`, `placeholder`, `value`, `onChange`, `error` (inline error string), `required`
- Renders: Label + input field + error message below in red

### Modal
- Props: `isOpen`, `onClose`, `title`, `children`
- Renders: Overlay + centered card with title, close X, and content slot
- Behavior: Close on overlay click, close on Escape key

### Tabs
- Props: `tabs` (array of {id, label}), `activeTab`, `onChange`
- Renders: Horizontal tab bar with active indicator underline
- Responsive: Scrollable on mobile if tabs overflow

### Spinner
- Props: `size` (sm|md|lg)
- Renders: Animated loading spinner (Tailwind animate-spin)

### ConfirmDialog
- Props: `isOpen`, `onConfirm`, `onCancel`, `title`, `message`, `confirmLabel`, `variant`
- Renders: Modal with message, Cancel button, and Confirm button (danger variant for deletes)

### EmptyState
- Props: `icon`, `title`, `description`, `actionLabel`, `onAction`
- Renders: Centered message with optional CTA button

---

## Layout Components (`src/components/layout/`)

### AppLayout
- Renders: Top nav bar (app name, user menu with logout) + main content area via `<Outlet />`
- Responsive: Hamburger menu on mobile

### AuthLayout
- Renders: Centered card container for login/register forms (no nav bar)

---

## Feature Components (high-level)

### ExpenseForm (modal)
- Props: `groupId`, `members`, `onClose`, `expense?` (for edit mode)
- Fields: description, amount (₹ input → converts to paisa), payer (select), split method (radio), participant selection
- Dynamic: Shows exact amount inputs or percentage inputs based on split method
- Validation: Inline errors (exact sum ≠ total, percentage ≠ 100, amount ≤ 0)
- Submit: POST or PUT depending on edit mode

### SettlementForm (modal)
- Props: `groupId`, `members`, `onClose`, `defaultPayer?`, `defaultPayee?`
- Fields: payer (select), payee (select), amount (₹)
- Validation: payer ≠ payee, amount > 0
- Submit: POST /api/groups/:id/settlements

### BalanceCard
- Props: `from`, `to`, `amount`
- Renders: "From owes To: ₹amount" with color coding (red for owing)

### MemberSummaryRow
- Props: `name`, `totalPaid`, `totalOwed`, `netBalance`
- Renders: Table row with formatted amounts, green/red net balance
