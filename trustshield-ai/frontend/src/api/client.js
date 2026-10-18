// Automatically detect API base:
// 1. If VITE_API_BASE_URL is set in environment (Vercel / production), use that.
// 2. Otherwise default to '/api' (handled by FastAPI or Vercel rewrites).
// 3. If running locally on a dev port (e.g. 3000, 5173), automatically fall back to http://127.0.0.1:8000/api.
const getApiBase = () => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) {
    const custom = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '');
    return custom.endsWith('/api') ? custom : `${custom}/api`;
  }
  return '/api';
};

async function apiFetch(endpoint, options = {}) {
  const base = getApiBase();
  const url = `${base}${endpoint}`;
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    // If running on Vite dev server (e.g., 3000 or 5173) and local proxy failed, retry directly to 8000
    if (typeof window !== 'undefined' && window.location.port !== '8000' && !base.startsWith('http')) {
      try {
        const directUrl = `http://127.0.0.1:8000/api${endpoint}`;
        const directRes = await fetch(directUrl, options);
        return directRes;
      } catch {
        // Fall through
      }
    }
    throw new Error('Cannot connect to backend server. Please make sure the backend is running.');
  }
}

export async function analyzeText(text, url, inputType = 'News') {
  const token = localStorage.getItem('ts_token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await apiFetch('/analyze', {
    method: 'POST',
    headers,
    body: JSON.stringify({ text, url, input_type: inputType }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Verification failed. Backend returned an error.');
  }

  return res.json();
}

export async function fetchDataset() {
  const res = await apiFetch('/dataset');
  if (!res.ok) throw new Error('Failed to fetch dataset');
  return res.json();
}

export async function fetchHistory() {
  const res = await apiFetch('/history');
  if (!res.ok) throw new Error('Failed to fetch history');
  return res.json();
}

export async function deleteHistory(id) {
  const res = await apiFetch(`/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete history item');
}

export async function fetchDashboardData() {
  const res = await apiFetch('/analytics/dashboard');
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchEvidenceList() {
  const res = await apiFetch('/evidence');
  if (!res.ok) throw new Error('Failed to fetch evidence');
  return res.json();
}

export async function uploadCircularDocument(formData) {
  const res = await apiFetch('/upload-document', {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) throw new Error('Failed to upload document');
  return res.json();
}

export function getReportDownloadUrl(analysisId) {
  const base = getApiBase();
  return `${base}/report/${analysisId}`;
}

export function getCodeZipUrl() {
  const base = getApiBase();
  return `${base}/download-code`;
}
