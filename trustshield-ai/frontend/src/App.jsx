import React, { useState } from 'react';
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
