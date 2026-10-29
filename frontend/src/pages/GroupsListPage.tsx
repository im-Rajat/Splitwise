import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroups, useCreateGroup } from '../hooks/useGroups';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { EmptyState } from '../components/ui/EmptyState';
import { formatDate } from '../utils/format';

export function GroupsListPage() {
  const { data: groups, isLoading } = useGroups();
  const createGroup = useCreateGroup();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');

  const handleCreate = () => {
    if (!name.trim()) return;
    createGroup.mutate({ name: name.trim() }, {
      onSuccess: () => { setShowModal(false); setName(''); },
    });
  };

  if (isLoading) return <Spinner size="lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">My Groups</h2>
        <Button onClick={() => setShowModal(true)}>New Group</Button>
      </div>

      {!groups?.length ? (
        <EmptyState title="No groups yet" description="Create your first group to start splitting expenses." actionLabel="Create Group" onAction={() => setShowModal(true)} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((g) => (
            <div key={g.id} onClick={() => navigate(`/groups/${g.id}`)} className="p-4 bg-white rounded-lg shadow hover:shadow-md cursor-pointer transition-shadow border">
              <h3 className="font-semibold text-lg">{g.name}</h3>
              <p className="text-sm text-gray-500 mt-1">Created {formatDate(g.createdAt)}</p>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Create Group">
        <div className="space-y-4">
          <Input label="Group Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Goa Trip" required />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleCreate} loading={createGroup.isPending}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
