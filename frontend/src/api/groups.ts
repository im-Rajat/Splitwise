import { api } from './client';
import type { Group, CreateGroupRequest } from '../types';

export async function listGroups(): Promise<Group[]> {
  const res = await api.get('/groups');
  return res.data.data;
}

export async function getGroup(groupId: string): Promise<Group> {
  const res = await api.get(`/groups/${groupId}`);
  return res.data;
}

export async function createGroup(data: CreateGroupRequest): Promise<Group> {
  const res = await api.post('/groups', data);
  return res.data;
}

export async function updateGroup(groupId: string, data: { name: string }): Promise<Group> {
  const res = await api.patch(`/groups/${groupId}`, data);
  return res.data;
}
