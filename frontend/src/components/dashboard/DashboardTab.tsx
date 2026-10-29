import { useDashboard } from '../../hooks/useDashboard';
import { Spinner } from '../ui/Spinner';
import { formatCurrency } from '../../utils/format';

export function DashboardTab({ groupId }: { groupId: string }) {
  const { data, isLoading } = useDashboard(groupId);

  if (isLoading || !data) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg border">
          <p className="text-sm text-gray-500">Total Expenses</p>
          <p className="text-2xl font-bold">{formatCurrency(data.totalExpenses)}</p>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <p className="text-sm text-gray-500">Number of Expenses</p>
          <p className="text-2xl font-bold">{data.expenseCount}</p>
        </div>
      </div>

      {/* Member Summary */}
      <section>
        <h3 className="text-lg font-semibold mb-2">Members</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-right p-2">Paid</th>
                <th className="text-right p-2">Owes</th>
                <th className="text-right p-2">Net</th>
              </tr>
            </thead>
            <tbody>
              {data.memberSummaries.map((ms) => (
                <tr key={ms.memberId} className="border-t">
                  <td className="p-2">{ms.displayName}</td>
                  <td className="p-2 text-right">{formatCurrency(ms.totalPaid)}</td>
                  <td className="p-2 text-right">{formatCurrency(ms.totalOwed)}</td>
                  <td className={`p-2 text-right font-medium ${ms.netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {ms.netBalance >= 0 ? '+' : ''}{formatCurrency(ms.netBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Category Breakdown */}
      {data.categoryBreakdown.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-2">By Category</h3>
          <div className="space-y-2">
            {data.categoryBreakdown.map((cat) => (
              <div key={cat.category} className="flex justify-between items-center p-2 bg-white border rounded">
                <div>
                  <span className="text-sm font-medium">{cat.category}</span>
                  <span className="text-xs text-gray-500 ml-2">({cat.count} expenses)</span>
                </div>
                <span className="font-medium">{formatCurrency(cat.total)}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
