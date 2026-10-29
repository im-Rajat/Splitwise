import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listMembers, addMember, updateMember, deleteMember } from '../api/members';
import type { AddMemberRequest } from '../types';
import toast from 'react-hot-toast';

export function useMembers(groupId: string) {
  return useQuery({ queryKey: ['groups', groupId, 'members'], queryFn: () => listMembers(groupId) });
}

export function useAddMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: AddMemberRequest) => addMember(groupId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
      toast.success('Member added');
    },
    onError: () => toast.error('Failed to add member'),
  });
}

export function useUpdateMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, displayName }: { memberId: string; displayName: string }) =>
      updateMember(groupId, memberId, { displayName }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
      toast.success('Member updated');
    },
    onError: () => toast.error('Failed to update member'),
  });
}

export function useDeleteMember(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => deleteMember(groupId, memberId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'members'] });
      toast.success('Member removed');
    },
    onError: () => toast.error('Cannot delete member with non-zero balance'),
  });
}
