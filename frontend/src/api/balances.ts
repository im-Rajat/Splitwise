import { api } from './client';
import type { BalancesResponse, SimplifiedResponse } from '../types';

export async function getBalances(groupId: string): Promise<BalancesResponse> {
  const res = await api.get(`/groups/${groupId}/balances`);
  return res.data;
}

export async function getSimplifiedBalances(groupId: string): Promise<SimplifiedResponse> {
  const res = await api.get(`/groups/${groupId}/balances/simplified`);
  return res.data;
}
