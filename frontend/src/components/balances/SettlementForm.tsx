import { useState, type FormEvent } from 'react';
import type { Member, CreateSettlementRequest } from '../../types';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface SettlementFormProps {
  members: Member[];
  onClose: () => void;
  onSubmit: (data: CreateSettlementRequest) => void;
  loading?: boolean;
}

export function SettlementForm({ members, onClose, onSubmit, loading }: SettlementFormProps) {
  const [payerId, setPayerId] = useState(members[0]?.id || '');
  const [payeeId, setPayeeId] = useState(members[1]?.id || '');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const amountPaisa = Math.round(parseFloat(amount || '0') * 100);
    if (amountPaisa <= 0) { setError('Amount must be greater than 0'); return; }
    if (payerId === payeeId) { setError('Payer and payee must be different'); return; }
    onSubmit({ payerId, payeeId, amount: amountPaisa });
  };

  return (
    <Modal isOpen onClose={onClose} title="Record Settlement">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Who paid</label>
          <select value={payerId} onChange={(e) => setPayerId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
            {members.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Paid to</label>
          <select value={payeeId} onChange={(e) => setPayeeId(e.target.value)} className="w-full border rounded-md px-3 py-2 text-sm">
            {members.map((m) => <option key={m.id} value={m.id}>{m.displayName}</option>)}
          </select>
        </div>
        <Input label="Amount (₹)" type="number" step="0.01" min="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>Record</Button>
        </div>
      </form>
    </Modal>
  );
}
