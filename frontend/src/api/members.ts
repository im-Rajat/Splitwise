import { api } from './client';
import type { Member, AddMemberRequest } from '../types';

export async function listMembers(groupId: string): Promise<Member[]> {
  const res = await api.get(`/groups/${groupId}/members`);
  return res.data;
}

export async function addMember(groupId: string, data: AddMemberRequest): Promise<Member> {
  const res = await api.post(`/groups/${groupId}/members`, data);
  return res.data;
}

export async function updateMember(groupId: string, memberId: string, data: { displayName: string }): Promise<Member> {
  const res = await api.patch(`/groups/${groupId}/members/${memberId}`, data);
  return res.data;
}

export async function deleteMember(groupId: string, memberId: string): Promise<void> {
  await api.delete(`/groups/${groupId}/members/${memberId}`);
}
