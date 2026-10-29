import { useState } from 'react';
import { useBalances, useSimplifiedBalances } from '../../hooks/useBalances';
import { useSettlements, useCreateSettlement, useDeleteSettlement } from '../../hooks/useSettlements';
import { useMembers } from '../../hooks/useMembers';
import { SettlementForm } from './SettlementForm';
import { Button } from '../ui/Button';
import { Spinner } from '../ui/Spinner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatCurrency } from '../../utils/format';

export function BalancesTab({ groupId }: { groupId: string }) {
  const { data: balancesData, isLoading: balancesLoading } = useBalances(groupId);
  const { data: simplified } = useSimplifiedBalances(groupId);
  const { data: settlementsData, isLoading: settlementsLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useSettlements(groupId);
  const { data: members } = useMembers(groupId);
  const createSettlement = useCreateSettlement(groupId);
  const deleteSettlement = useDeleteSettlement(groupId);

  const [showForm, setShowForm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const settlements = settlementsData?.pages.flatMap((p) => p.data) || [];

  if (balancesLoading || settlementsLoading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Member Summaries */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Member Balances</h3>
        <div className="space-y-1">
          {balancesData?.memberSummaries.map((ms) => (
            <div key={ms.memberId} className="flex justify-between p-2 bg-white border rounded">
              <span>{ms.displayName}</span>
              <span className={ms.netBalance >= 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                {ms.netBalance >= 0 ? '+' : ''}{formatCurrency(ms.netBalance)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Simplified Transactions */}
      {simplified && simplified.simplifiedTransactions.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2">Suggested Settlements</h3>
          <p className="text-sm text-gray-500 mb-2">{simplified.reductionPercentage}% fewer transactions ({simplified.simplifiedTransactionCount} instead of {simplified.originalTransactionCount})</p>
          <div className="space-y-1">
            {simplified.simplifiedTransactions.map((t, i) => (
              <div key={i} className="p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <span className="font-medium">{t.from.displayName}</span> owes <span className="font-medium">{t.to.displayName}</span> {formatCurrency(t.amount)}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recorded Settlements */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Recorded Settlements</h3>
          <Button onClick={() => setShowForm(true)}>Record Settlement</Button>
        </div>
        {settlements.length === 0 ? (
          <p className="text-sm text-gray-500">No settlements recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {settlements.map((s) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-white border rounded">
                <span className="text-sm"><span className="font-medium">{s.payer.displayName}</span> paid <span className="font-medium">{s.payee.displayName}</span> {formatCurrency(s.amount)}</span>
                <Button size="sm" variant="danger" onClick={() => setDeleteId(s.id)}>Delete</Button>
              </div>
            ))}
            {hasNextPage && (
              <div className="text-center pt-2">
                <Button variant="secondary" onClick={() => fetchNextPage()} loading={isFetchingNextPage}>Load More</Button>
              </div>
            )}
          </div>
        )}
      </section>

      {showForm && members && (
        <SettlementForm members={members} onClose={() => setShowForm(false)} onSubmit={(data) => createSettlement.mutate(data, { onSuccess: () => setShowForm(false) })} loading={createSettlement.isPending} />
      )}

      <ConfirmDialog isOpen={!!deleteId} onConfirm={() => { if (deleteId) deleteSettlement.mutate(deleteId, { onSuccess: () => setDeleteId(null) }); }} onCancel={() => setDeleteId(null)} title="Delete Settlement" message="Remove this settlement record? Balances will be recalculated." confirmLabel="Delete" />
    </div>
  );
}
