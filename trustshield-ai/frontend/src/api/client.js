// Robust API client with auto-fallback for local development and production
async function apiFetch(endpoint, options = {}) {
  // If served directly from FastAPI (port 8000):
  if (typeof window !== 'undefined' && window.location.port === '8000') {
    try {
      const res = await fetch(`/api${endpoint}`, options);
      return res;
    } catch (e) {
      // Fall through
    }
  }

  // If served from Vite dev server (port 3000, 5173, etc.):
  // 1. Try relative /api (in case Vite proxy is active)
  try {
    const res = await fetch(`/api${endpoint}`, options);
    if (res.ok) return res;
  } catch (e) {
    // Proxy failed, try direct connection to backend
  }

  // 2. Fallback: call FastAPI directly on port 8000 (CORS is enabled)
  try {
    const directRes = await fetch(`http://127.0.0.1:8000/api${endpoint}`, options);
    return directRes;
  } catch (e) {
    throw new Error('Cannot connect to backend server at http://127.0.0.1:8000. Please start the backend by running start.bat in the project folder.');
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
