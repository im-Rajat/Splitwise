import { useState, type FormEvent } from 'react';
import type { Member, Expense, SplitMethod, CreateExpenseRequest, Category } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { exactSumCheck, percentageSumCheck } from '../../utils/validation';

interface ExpenseFormProps {
  groupId: string;
  members: Member[];
  onClose: () => void;
  onSubmit: (data: CreateExpenseRequest) => void;
  loading?: boolean;
  expense?: Expense;
}

const categories: Category[] = ['FOOD', 'TRANSPORT', 'ACCOMMODATION', 'ENTERTAINMENT', 'SHOPPING', 'UTILITIES', 'OTHER'];

export function ExpenseForm({ members, onClose, onSubmit, loading, expense }: ExpenseFormProps) {
  const [description, setDescription] = useState(expense?.description || '');
  const [amount, setAmount] = useState(expense ? (expense.totalAmount / 100).toString() : '');
  const [payerId, setPayerId] = useState(expense?.payerId || (members[0]?.id || ''));
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(expense?.splitMethod || 'EQUAL');
  const [category, setCategory] = useState<Category>(expense?.category || 'OTHER');
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    expense ? expense.shares.map((s) => s.memberId) : members.map((m) => m.id),
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>(
    expense?.splitMethod === 'EXACT'
      ? Object.fromEntries(expense.shares.map((s) => [s.memberId, (s.amount / 100).toString()]))
      : {},
  );
  const [percentages, setPercentages] = useState<Record<string, string>>(
    expense?.splitMethod === 'PERCENTAGE'
      ? Object.fromEntries(expense.shares.map((s) => [s.memberId, ((s.amount / expense.totalAmount) * 100).toString()]))
      : {},
  );
  const [error, setError] = useState('');

  const totalPaisa = Math.round(parseFloat(amount || '0') * 100);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (totalPaisa <= 0) { setError('Amount must be greater than 0'); return; }
    if (selectedMembers.length === 0) { setError('Select at least one participant'); return; }

    if (splitMethod === 'EXACT') {
      const shares = selectedMembers.map((id) => Math.round(parseFloat(exactAmounts[id] || '0') * 100));
      if (!exactSumCheck(shares, totalPaisa)) { setError('Exact amounts must sum to total'); return; }
    }

    if (splitMethod === 'PERCENTAGE') {
      const percs = selectedMembers.map((id) => parseFloat(percentages[id] || '0'));
      if (!percentageSumCheck(percs)) { setError('Percentages must sum to 100'); return; }
    }

    const splits = selectedMembers.map((memberId) => ({
      memberId,
      ...(splitMethod === 'EXACT' ? { amount: Math.round(parseFloat(exactAmounts[memberId] || '0') * 100) } : {}),
      ...(splitMethod === 'PERCENTAGE' ? { percentage: parseFloat(percentages[memberId] || '0') } : {}),
    }));

    onSubmit({
      description: description || undefined,
      totalAmount: totalPaisa,
      splitMethod,
      category,
      payerId,
      splits,
      ...(expense ? { version: expense.version } : {}),
    } as CreateExpenseRequest);
  };

  const toggleMember = (id: string) => {
    setSelectedMembers((prev) => prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]);
  };

  return (
    <Modal isOpen onClose={onClose} title={expense ? 'Edit Expense' : 'Add Expense'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Input label="Description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Dinner" />
        <Input label="Amount (₹)" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paid by</label>
          <select value={payerId} onChange={(e) => setPayerId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
            {members.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value as Category)} className="w-full border rounded-md px-3 py-2 text-sm">
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Split Method</label>
          <div className="flex gap-4">
            {(['EQUAL', 'EXACT', 'PERCENTAGE'] as SplitMethod[]).map((method) => (
              <label key={method} className="flex items-center gap-1 text-sm">
                <input type="radio" name="splitMethod" value={method} checked={splitMethod === method} onChange={() => setSplitMethod(method)} />
                {method}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Participants</label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-2">
                <input type="checkbox" checked={selectedMembers.includes(m.id)} onChange={() => toggleMember(m.id)} />
                <span className="text-sm flex-1">{m.displayName}</span>
                {splitMethod === 'EXACT' && selectedMembers.includes(m.id) && (
                  <input type="number" step="0.01" placeholder="₹" className="w-24 border rounded px-2 py-1 text-sm"
                    value={exactAmounts[m.id] || ''} onChange={(e) => setExactAmounts({ ...exactAmounts, [m.id]: e.target.value })} />
                )}
                {splitMethod === 'PERCENTAGE' && selectedMembers.includes(m.id) && (
                  <input type="number" step="0.01" placeholder="%" className="w-24 border rounded px-2 py-1 text-sm"
                    value={percentages[m.id] || ''} onChange={(e) => setPercentages({ ...percentages, [m.id]: e.target.value })} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{expense ? 'Save' : 'Add Expense'}</Button>
        </div>
      </form>
    </Modal>
  );
}
