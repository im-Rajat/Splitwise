import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listSettlements, createSettlement, updateSettlement, deleteSettlement } from '../api/settlements';
import type { CreateSettlementRequest, UpdateSettlementRequest } from '../types';
import toast from 'react-hot-toast';

export function useSettlements(groupId: string) {
  return useInfiniteQuery({
    queryKey: ['groups', groupId, 'settlements'],
    queryFn: ({ pageParam }) => listSettlements(groupId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor ?? undefined : undefined,
  });
}

export function useCreateSettlement(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateSettlementRequest) => createSettlement(groupId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'settlements'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'balances'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'dashboard'] });
      toast.success('Settlement recorded');
    },
    onError: () => toast.error('Failed to record settlement'),
  });
}

export function useUpdateSettlement(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ settlementId, data }: { settlementId: string; data: UpdateSettlementRequest }) =>
      updateSettlement(groupId, settlementId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'settlements'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'balances'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'dashboard'] });
      toast.success('Settlement updated');
    },
    onError: () => toast.error('Failed to update settlement'),
  });
}

export function useDeleteSettlement(groupId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settlementId: string) => deleteSettlement(groupId, settlementId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'settlements'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'balances'] });
      qc.invalidateQueries({ queryKey: ['groups', groupId, 'dashboard'] });
      toast.success('Settlement deleted');
    },
    onError: () => toast.error('Failed to delete settlement'),
  });
}
