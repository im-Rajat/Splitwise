import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getGroup } from '../../api/groups';
import { useUpdateGroup } from '../../hooks/useGroups';
import { exportGroup, downloadBlob, ExportFormat } from '../../api/export';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Spinner } from '../ui/Spinner';
import toast from 'react-hot-toast';

export function SettingsTab({ groupId }: { groupId: string }) {
  const { data: group, isLoading } = useQuery({ queryKey: ['groups', groupId], queryFn: () => getGroup(groupId) });
  const updateGroup = useUpdateGroup(groupId);
  const qc = useQueryClient();

  const [name, setName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  // Tracks which export is running so only that button shows a spinner.
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  const handleRename = () => {
    if (!name.trim()) return;
    updateGroup.mutate({ name: name.trim() }, {
      onSuccess: () => {
        setIsEditing(false);
        qc.invalidateQueries({ queryKey: ['groups', groupId] });
      },
    });
  };

  const handleExport = async (format: ExportFormat) => {
    setExportingFormat(format);
    try {
      const blob = await exportGroup(groupId, format);
      const extension = format === 'pdf' ? 'pdf' : 'txt';
      downloadBlob(blob, `${group?.name || 'group'}-ledger.${extension}`);
      toast.success('Export downloaded');
    } catch {
      toast.error('Export failed');
    } finally {
      setExportingFormat(null);
    }
  };

  if (isLoading || !group) return <Spinner />;

  return (
    <div className="space-y-6 max-w-md">
      <section>
        <h3 className="text-lg font-semibold mb-2">Group Name</h3>
        {isEditing ? (
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} />
            <Button onClick={handleRename} loading={updateGroup.isPending}>Save</Button>
            <Button variant="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-gray-800">{group.name}</span>
            <Button size="sm" variant="ghost" onClick={() => { setName(group.name); setIsEditing(true); }}>Rename</Button>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-2">Export</h3>
        <p className="text-sm text-gray-500 mb-2">Download the group ledger: expenses, settlements and current balances.</p>
        <div className="flex gap-2">
          <Button
            onClick={() => handleExport('pdf')}
            loading={exportingFormat === 'pdf'}
            disabled={exportingFormat !== null}
          >
            Export PDF
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleExport('text')}
            loading={exportingFormat === 'text'}
            disabled={exportingFormat !== null}
          >
            Export text
          </Button>
        </div>
      </section>
    </div>
  );
}
