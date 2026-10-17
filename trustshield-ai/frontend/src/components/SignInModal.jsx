import React, { useState } from 'react';
import { X, Shield, Lock, Mail, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';



export const SignInModal = ({ isOpen, onClose }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('analyst');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(fullName, email, password, role);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (demoRole) => {
    setError('');
    setLoading(true);
    try {
      await demoLogin(demoRole);
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#0F172A] flex items-center justify-center text-white shadow-sm">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {isRegister ? 'Create TrustShield Account' : 'Sign In to TrustShield AI'}
            </h2>
            <p className="text-xs text-slate-500">Official institutional verification console</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* 1-Click Demo Login Shortcuts */}
        <div className="mb-6 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
          <div className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>Instant Demo Access</span>
            <span className="text-[10px] font-normal text-blue-600">No signup needed</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemo('analyst')}
              disabled={loading}
              className="py-2 px-3 rounded-lg bg-white border border-blue-200 text-blue-800 text-xs font-bold hover:bg-blue-100/50 transition shadow-2xs flex items-center justify-center space-x-1"
            >
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Analyst Role</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('auditor')}
              disabled={loading}
              className="py-2 px-3 rounded-lg bg-white border border-blue-200 text-blue-800 text-xs font-bold hover:bg-blue-100/50 transition shadow-2xs flex items-center justify-center space-x-1"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              <span>Auditor Role</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Dr. Anand Sharma"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@trustshield.ai"
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="????????"
                className="w-full pl-9 pr-3.5 py-2 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              >
                <option value="analyst">Verification Analyst</option>
                <option value="auditor">Risk & Compliance Auditor</option>
                <option value="citizen">Citizen Fact-Checker</option>
              </select>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-bold hover:bg-slate-800 transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-xs text-slate-500">
          {isRegister ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-blue-600 font-bold hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              New to TrustShield?{' '}
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-blue-600 font-bold hover:underline"
              >
                Create an account
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
