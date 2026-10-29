import { useQuery } from '@tanstack/react-query';
import { getDashboard } from '../api/dashboard';

export function useDashboard(groupId: string) {
  return useQuery({ queryKey: ['groups', groupId, 'dashboard'], queryFn: () => getDashboard(groupId) });
}
