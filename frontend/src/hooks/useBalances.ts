import { useQuery } from '@tanstack/react-query';
import { getBalances, getSimplifiedBalances } from '../api/balances';

export function useBalances(groupId: string) {
  return useQuery({ queryKey: ['groups', groupId, 'balances'], queryFn: () => getBalances(groupId) });
}

export function useSimplifiedBalances(groupId: string) {
  return useQuery({ queryKey: ['groups', groupId, 'balances', 'simplified'], queryFn: () => getSimplifiedBalances(groupId) });
}
