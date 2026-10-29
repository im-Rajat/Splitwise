import { api } from './client';
import type { DashboardResponse } from '../types';

export async function getDashboard(groupId: string): Promise<DashboardResponse> {
  const res = await api.get(`/groups/${groupId}/dashboard`);
  return res.data;
}
