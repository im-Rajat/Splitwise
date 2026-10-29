import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getGroup } from '../api/groups';
import { Tabs } from '../components/ui/Tabs';
import { Spinner } from '../components/ui/Spinner';
import { MembersTab } from '../components/members/MembersTab';
import { ExpensesTab } from '../components/expenses/ExpensesTab';
import { BalancesTab } from '../components/balances/BalancesTab';
import { DashboardTab } from '../components/dashboard/DashboardTab';
import { SettingsTab } from '../components/groups/SettingsTab';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'members', label: 'Members' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'balances', label: 'Balances' },
  { id: 'settings', label: 'Settings' },
];

export function GroupDetailPage() {
  const { groupId } = useParams<{ groupId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const { data: group, isLoading } = useQuery({
    queryKey: ['groups', groupId],
    queryFn: () => getGroup(groupId!),
    enabled: !!groupId,
  });

  if (isLoading || !group) return <Spinner size="lg" />;

  const handleTabChange = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">{group.name}</h2>
      <Tabs tabs={tabs} activeTab={activeTab} onChange={handleTabChange} />
      <div className="mt-4">
        {activeTab === 'dashboard' && <DashboardTab groupId={groupId!} />}
        {activeTab === 'members' && <MembersTab groupId={groupId!} />}
        {activeTab === 'expenses' && <ExpensesTab groupId={groupId!} />}
        {activeTab === 'balances' && <BalancesTab groupId={groupId!} />}
        {activeTab === 'settings' && <SettingsTab groupId={groupId!} />}
      </div>
    </div>
  );
}
