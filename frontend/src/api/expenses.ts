import { api } from './client';
import type { Expense, CreateExpenseRequest, UpdateExpenseRequest, PaginatedResponse } from '../types';

export async function listExpenses(groupId: string, cursor?: string): Promise<PaginatedResponse<Expense>> {
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  const res = await api.get(`/groups/${groupId}/expenses`, { params });
  return res.data;
}

export async function getExpense(groupId: string, expenseId: string): Promise<Expense> {
  const res = await api.get(`/groups/${groupId}/expenses/${expenseId}`);
  return res.data;
}

export async function createExpense(groupId: string, data: CreateExpenseRequest): Promise<Expense> {
  const res = await api.post(`/groups/${groupId}/expenses`, data);
  return res.data;
}

export async function updateExpense(groupId: string, expenseId: string, data: UpdateExpenseRequest): Promise<Expense> {
  const res = await api.put(`/groups/${groupId}/expenses/${expenseId}`, data);
  return res.data;
}

export async function deleteExpense(groupId: string, expenseId: string): Promise<void> {
  await api.delete(`/groups/${groupId}/expenses/${expenseId}`);
}
