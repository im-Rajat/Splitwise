import { useState } from 'react';
import { useMembers, useAddMember, useUpdateMember, useDeleteMember } from '../../hooks/useMembers';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { formatDate } from '../../utils/format';

export function MembersTab({ groupId }: { groupId: string }) {
  const { data: members, isLoading } = useMembers(groupId);
  const addMember = useAddMember(groupId);
  const updateMember = useUpdateMember(groupId);
  const deleteMember = useDeleteMember(groupId);

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    addMember.mutate({ displayName: newName.trim() }, { onSuccess: () => setNewName('') });
  };

  const handleUpdate = (memberId: string) => {
    if (!editName.trim()) return;
    updateMember.mutate({ memberId, displayName: editName.trim() }, { onSuccess: () => setEditingId(null) });
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteMember.mutate(deleteId, { onSuccess: () => setDeleteId(null) });
    }
  };

  if (isLoading) return <Spinner />;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input placeholder="Member name" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <Button onClick={handleAdd} loading={addMember.isPending}>Add</Button>
      </div>

      <div className="space-y-2">
        {members?.map((m) => (
          <div key={m.id} className="flex items-center justify-between p-3 bg-white rounded border">
            {editingId === m.id ? (
              <div className="flex gap-2 flex-1">
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                <Button size="sm" onClick={() => handleUpdate(m.id)}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
              </div>
            ) : (
              <>
                <div>
                  <span className="font-medium">{m.displayName}</span>
                  <span className="text-xs text-gray-500 ml-2">Joined {formatDate(m.createdAt)}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => { setEditingId(m.id); setEditName(m.displayName); }}>Edit</Button>
                  <Button size="sm" variant="danger" onClick={() => setDeleteId(m.id)}>Delete</Button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
        title="Delete Member"
        message="Are you sure? Members with non-zero balances cannot be deleted."
        confirmLabel="Delete"
      />
    </div>
  );
}
