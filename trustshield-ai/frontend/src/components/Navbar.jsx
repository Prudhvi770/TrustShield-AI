import React, { useState } from 'react';
import { Shield, History, LayoutDashboard, Database, Globe, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';



export const Navbar = ({ activeTab, setActiveTab, openSignIn }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [lang] = useState('English');
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('verify')}>
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center shadow-sm text-white">
            <Shield className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight tracking-tight text-[#0F172A]">TrustShield AI</div>
            <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase">Verification Platform</div>
          </div>
        </div>

        {/* Primary Navigation Pills */}
        <nav className="hidden md:flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('verify')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'verify'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Verify</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'history'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'dashboard'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('knowledge')}
            className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'knowledge'
                ? 'bg-blue-50 text-blue-700 font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Knowledge Base</span>
          </button>
        </nav>

        {/* Right Section: Language + Sign In / User Profile */}
        <div className="flex items-center space-x-3">
          <div className="relative hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">
            <Globe className="w-4 h-4 text-slate-400" />
            <span>{lang}</span>
          </div>

          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0F172A] text-white text-sm font-medium hover:bg-slate-800 transition shadow-sm"
              >
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate">{user.full_name}</span>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-xs font-semibold text-slate-900">{user.full_name}</div>
                    <div className="text-[11px] text-slate-500 truncate">{user.email}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-800 uppercase">
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={() => { logout(); setShowUserMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={openSignIn}
              className="flex items-center space-x-2 px-4 py-1.5 rounded-lg bg-[#0F172A] text-white text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm"
            >
              <LogIn className="w-4 h-4 text-slate-200" />
              <span>Sign in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
