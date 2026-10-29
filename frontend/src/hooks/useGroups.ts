import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listGroups, createGroup, updateGroup } from '../api/groups';
import type { CreateGroupRequest } from '../types';
import toast from 'react-hot-toast';

export function useGroups() {
  return useQuery({ queryKey: ['groups'], queryFn: listGroups });
}

export function useCreateGroup() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateGroupRequest) => createGroup(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created');
    },
    onError: () => toast.error('Failed to create group'),
  });
}

export function useUpdateGroup(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string }) => updateGroup(groupId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group updated');
    },
    onError: () => toast.error('Failed to update group'),
  });
}
