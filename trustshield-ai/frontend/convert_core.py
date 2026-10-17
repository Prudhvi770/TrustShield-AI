import os

fe_src = r"C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\frontend\src"

# 1. main.jsx
main_jsx = """import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
"""

# 2. App.jsx
app_jsx = """import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { SignInModal } from './components/SignInModal';
import { Verify } from './pages/Verify';
import { History } from './pages/History';
import { Dashboard } from './pages/Dashboard';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { SignInPage } from './pages/SignInPage';

export const AppContent = () => {
  const [activeTab, setActiveTab] = useState('verify');
  const [showSignInModal, setShowSignInModal] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      {/* Top Institutional Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSignIn={() => setShowSignInModal(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'verify' && <Verify />}
        {activeTab === 'history' && (
          <History
            onSelectClaim={() => {
              setActiveTab('verify');
            }}
          />
        )}
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'knowledge' && <KnowledgeBase />}
        {activeTab === 'signin' && (
          <SignInPage onSuccess={() => setActiveTab('verify')} />
        )}
      </main>

      {/* Global Auth Modal */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />

      {/* Institutional Footer */}
      <Footer />
    </div>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
"""

# 3. api/client.js
client_js = """const API_BASE = '/api';

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
    throw new Error(errorData.detail || 'Verification failed');
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
"""

# 4. context/AuthContext.jsx
auth_context_jsx = """import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('ts_token'));

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem('ts_token');
          setToken(null);
          setUser(null);
        });
    }
  }, [token]);

  const login = async (email, pass) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('ts_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (name, email, pass, role = 'analyst') => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ full_name: name, email, password: pass, role })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Registration failed');
    }
    const data = await res.json();
    localStorage.setItem('ts_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const demoLogin = async (demoRole) => {
    const email = demoRole === 'analyst' ? 'analyst@trustshield.ai' : 'auditor@trustshield.ai';
    const password = demoRole === 'analyst' ? 'trustshield123' : 'audit2026';
    await login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('ts_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      demoLogin,
      logout,
      isAuthenticated: !!token
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
"""

with open(os.path.join(fe_src, "main.jsx"), "w", encoding="utf-8") as f:
    f.write(main_jsx)
with open(os.path.join(fe_src, "App.jsx"), "w", encoding="utf-8") as f:
    f.write(app_jsx)
with open(os.path.join(fe_src, "api", "client.js"), "w", encoding="utf-8") as f:
    f.write(client_js)
with open(os.path.join(fe_src, "context", "AuthContext.jsx"), "w", encoding="utf-8") as f:
    f.write(auth_context_jsx)

print("Wrote main.jsx, App.jsx, client.js, and AuthContext.jsx")
