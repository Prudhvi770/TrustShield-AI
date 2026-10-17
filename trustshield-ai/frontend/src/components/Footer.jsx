import React from 'react';
import { Shield } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-sm text-slate-500 gap-4">
        <div className="flex items-center space-x-2">
          <Shield className="w-4 h-4 text-slate-400" />
          <span>TrustShield AI ? Independent verification for a safer information ecosystem.</span>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <a href="#methodology" className="hover:text-slate-800 transition">Methodology</a>
          <a href="#privacy" className="hover:text-slate-800 transition">Privacy</a>
          <a href="#contact" className="hover:text-slate-800 transition">Contact</a>
        </div>
      </div>
    </footer>
  );
};
