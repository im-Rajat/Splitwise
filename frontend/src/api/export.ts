import { api } from './client';

export async function exportGroupJson(groupId: string): Promise<Blob> {
  const res = await api.get(`/groups/${groupId}/export`, { responseType: 'blob' });
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
