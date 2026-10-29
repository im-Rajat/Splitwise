import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenses';
import type { CreateExpenseRequest, UpdateExpenseRequest } from '../types';
import toast from 'react-hot-toast';

export function useExpenses(groupId: string) {
  return useInfiniteQuery({
    queryKey: ['groups', groupId, 'expenses'],
    queryFn: ({ pageParam }) => listExpenses(groupId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined,
  });
}

export function useCreateExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => createExpense(groupId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'balances'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'dashboard'] });
      toast.success('Expense added');
    },
    onError: () => toast.error('Failed to add expense'),
  });
}

export function useUpdateExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ expenseId, data }: { expenseId: string; data: UpdateExpenseRequest }) =>
      updateExpense(groupId, expenseId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'balances'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'dashboard'] });
      toast.success('Expense updated');
    },
    onError: () => toast.error('Failed to update expense'),
  });
}

export function useDeleteExpense(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) => deleteExpense(groupId, expenseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'expenses'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'balances'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'dashboard'] });
      toast.success('Expense deleted');
    },
    onError: () => toast.error('Failed to delete expense'),
  });
}
