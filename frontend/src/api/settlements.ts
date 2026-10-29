import { api } from './client';
import type { Settlement, CreateSettlementRequest, UpdateSettlementRequest, PaginatedResponse } from '../types';

export async function listSettlements(groupId: string, cursor?: string): Promise<PaginatedResponse<Settlement>> {
  const params: Record<string, string> = {};
  if (cursor) params.cursor = cursor;
  const res = await api.get(`/groups/${groupId}/settlements`, { params });
  return res.data;
}

export async function createSettlement(groupId: string, data: CreateSettlementRequest): Promise<Settlement> {
  const res = await api.post(`/groups/${groupId}/settlements`, data);
  return res.data;
}

export async function updateSettlement(groupId: string, settlementId: string, data: UpdateSettlementRequest): Promise<Settlement> {
  const res = await api.put(`/groups/${groupId}/settlements/${settlementId}`, data);
  return res.data;
}

export async function deleteSettlement(groupId: string, settlementId: string): Promise<void> {
  await api.delete(`/groups/${groupId}/settlements/${settlementId}`);
}
