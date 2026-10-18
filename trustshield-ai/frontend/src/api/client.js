const API_BASE = '/api';

export async function analyzeText(text, url, inputType = 'News') {
  const token = localStorage.getItem('ts_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, url, input_type: inputType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Verification failed. Please check backend connection.');
  }

  return res.json();
}

export async function fetchDataset() {
  const res = await fetch(`${API_BASE}/dataset`);
  if (!res.ok) throw new Error('Failed to fetch dataset');
  return res.json();
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/history`);
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function deleteHistory(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete history item');
}

export async function fetchDashboardData() {
  const res = await fetch(`${API_BASE}/analytics/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchEvidenceList() {
  const res = await fetch(`${API_BASE}/evidence`);
  if (!res.ok) throw new Error('Failed to fetch evidence');
  return res.json();
}

export async function uploadCircularDocument(formData) {
  const res = await fetch(`${API_BASE}/upload-document`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return res.json();
}

export function getReportDownloadUrl(analysisId) {
  return `${API_BASE}/report/${analysisId}`;
}

export function getCodeZipUrl() {
  return `${API_BASE}/download-code`;
}
