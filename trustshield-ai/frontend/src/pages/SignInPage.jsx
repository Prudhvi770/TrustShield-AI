import React, { useState } from 'react';
import { Shield, Lock, Mail, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';



export const SignInPage = ({ onSuccess }) => {
  const { login, register, demoLogin } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('analyst');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
      onSuccess();
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
      onSuccess();
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 sm:p-10 shadow-xl border border-slate-200">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#0F172A] flex items-center justify-center text-white mx-auto mb-3 shadow-md">
            <Shield className="w-7 h-7 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isRegister ? 'Join TrustShield AI' : 'Sign In to TrustShield AI'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional claim verification and risk intelligence portal
          </p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* 1-Click Demo Shortcut */}
        <div className="mb-6 p-4 bg-blue-50/80 border border-blue-200 rounded-2xl">
          <div className="text-xs font-bold text-blue-950 uppercase tracking-wider mb-2.5 flex items-center justify-between">
            <span>Instant Evaluation Login</span>
            <span className="text-[11px] font-medium text-blue-700">Click to Test</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleDemo('analyst')}
              disabled={loading}
              className="py-2.5 px-3 rounded-xl bg-white border border-blue-300 text-blue-900 text-xs font-bold hover:bg-blue-50 transition shadow-2xs flex items-center justify-center space-x-1.5"
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Analyst Mode</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemo('auditor')}
              disabled={loading}
              className="py-2.5 px-3 rounded-xl bg-white border border-blue-300 text-blue-900 text-xs font-bold hover:bg-blue-50 transition shadow-2xs flex items-center justify-center space-x-1.5"
            >
              <Shield className="w-4 h-4 text-blue-600" />
              <span>Auditor Mode</span>
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
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@trustshield.ai"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="????????"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Designated Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
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
            className="w-full mt-2 py-3 px-4 rounded-xl bg-[#0F172A] text-white text-sm font-bold hover:bg-slate-800 transition flex items-center justify-center space-x-2 shadow-sm disabled:opacity-50"
          >
            <span>{isRegister ? 'Register Account' : 'Sign In to Console'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          {isRegister ? (
            <span>
              Already registered?{' '}
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
              Need institutional access?{' '}
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
