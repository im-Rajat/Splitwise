import { useState } from 'react';
import { useExpenses, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../../hooks/useExpenses';
import { useMembers } from '../../hooks/useMembers';
import { ExpenseForm } from './ExpenseForm';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { EmptyState } from '../ui/EmptyState';
import { formatCurrency, formatDate } from '../../utils/format';
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest } from '../../types';

export function ExpensesTab({ groupId }: { groupId: string }) {
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useExpenses(groupId);
  const { data: members } = useMembers(groupId);
  const createExpense = useCreateExpense(groupId);
  const updateExpense = useUpdateExpense(groupId);
  const deleteExpense = useDeleteExpense(groupId);

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const expenses = data?.pages.flatMap((p) => p.data) || [];

  const handleCreate = (formData: CreateExpenseRequest) => {
    createExpense.mutate(formData, { onSuccess: () => setShowForm(false) });
  };

  const handleUpdate = (formData: CreateExpenseRequest) => {
    if (!editingExpense) return;
    updateExpense.mutate(
      { expenseId: editingExpense.id, data: formData as UpdateExpenseRequest },
      { onSuccess: () => setEditingExpense(null) },
    );
  };

  const handleDelete = () => {
    if (deleteId) deleteExpense.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(true)}>Add Expense</Button>
      </div>

      {expenses.length === 0 ? (
        <EmptyState title="No expenses yet" description="Add your first expense to start tracking." actionLabel="Add Expense" onAction={() => setShowForm(true)} />
      ) : (
        <div className="space-y-2">
          {expenses.map((exp) => (
            <div key={exp.id} className="p-3 bg-white rounded border flex items-center justify-between">
              <div>
                <p className="font-medium">{exp.description || 'No description'}</p>
                <p className="text-sm text-gray-500">{formatCurrency(exp.totalAmount)} · Paid by {exp.payer.displayName} · {formatDate(exp.createdAt)}</p>
                <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">{exp.category}</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={() => setEditingExpense(exp)}>Edit</Button>
                <Button size="sm" variant="danger" onClick={() => setDeleteId(exp.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {hasNextPage && (
            <div className="text-center pt-2">
              <Button variant="secondary" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>Load More</Button>
            </div>
          )}
        </div>
      )}

      {showForm && members && (
        <ExpenseForm groupId={groupId} members={members} onClose={() => setShowForm(false)} onSubmit={handleCreate} loading={createExpense.isPending} />
      )}

      {editingExpense && members && (
        <ExpenseForm groupId={groupId} members={members} expense={editingExpense} onClose={() => setEditingExpense(null)} onSubmit={handleUpdate} loading={updateExpense.isPending} />
      )}

      <ConfirmDialog isOpen={!!deleteId} onConfirm={handleDelete} onCancel={() => setDeleteId(null)} title="Delete Expense" message="This will remove the expense and revert balances. Continue?" confirmLabel="Delete" />
    </div>
  );
}
