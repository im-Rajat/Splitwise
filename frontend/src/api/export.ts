import { api } from './client';

export type ExportFormat = 'text' | 'pdf';

export async function exportGroup(groupId: string, format: ExportFormat): Promise<Blob> {
  const res = await api.get(`/groups/${groupId}/export`, {
    params: { format },
    responseType: 'blob',
  });
  return res.data;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
