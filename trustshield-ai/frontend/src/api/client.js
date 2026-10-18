// Automatically detect API base:
// When served on port 8000 (FastAPI), use relative '/api'
// When running in Vite dev server (3000, 5173), try '/api' proxy, with automatic fallback to http://127.0.0.1:8000/api
const getApiBase = () => {
  return '/api';
};

async function apiFetch(endpoint, options = {}) {
  const url = `${getApiBase()}${endpoint}`;
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    // If running on Vite dev server (e.g., 3000 or 5173) and local proxy failed, retry directly to 8000
    if (typeof window !== 'undefined' && window.location.port !== '8000') {
      try {
        const directUrl = `http://127.0.0.1:8000/api${endpoint}`;
        const directRes = await fetch(directUrl, options);
        return directRes;
      } catch {
        // Fall through
      }
    }
    throw new Error('Cannot connect to backend server. Please make sure the backend is running at http://127.0.0.1:8000 (Run start.bat in the project folder).');
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
  if (typeof window !== 'undefined' && window.location.port !== '8000' && window.location.port !== '') {
    return `http://127.0.0.1:8000/api/report/${analysisId}`;
  }
  return `/api/report/${analysisId}`;
}

export function getCodeZipUrl() {
  if (typeof window !== 'undefined' && window.location.port !== '8000' && window.location.port !== '') {
    return 'http://127.0.0.1:8000/api/download-code';
  }
  return '/api/download-code';
}
