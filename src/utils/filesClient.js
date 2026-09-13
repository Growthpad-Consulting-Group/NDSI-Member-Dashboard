// Client-safe helpers for listing uploaded documents.
// These call the /api/files-list endpoint instead of using the
// server-only ImageKit SDK (which cannot run in the browser).

export const fetchFilesByPrefix = async (prefix = '/') => {
  const token = localStorage.getItem('custom_auth_token');
  const res = await fetch(`/api/files-list?prefix=${encodeURIComponent(prefix)}&t=${Date.now()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load files');
  return data.files || [];
};

export const fetchSubfolders = async (prefix = '/') => {
  const token = localStorage.getItem('custom_auth_token');
  const res = await fetch(`/api/files-list?prefix=${encodeURIComponent(prefix)}&folders=1&t=${Date.now()}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load folders');
  return data.folders || [];
};
