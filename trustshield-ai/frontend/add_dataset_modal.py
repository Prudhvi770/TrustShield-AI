import os

fe_src = r"C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\frontend\src"

# DatasetModal.jsx
ds_modal = """import React, { useEffect, useState } from 'react';
import { X, Database, ArrowRight, Search, CheckCircle, ShieldAlert, ShieldQuestion } from 'lucide-react';
import { fetchDataset } from '../api/client';

export const DatasetModal = ({ isOpen, onClose, onSelectSample }) => {
  const [dataset, setDataset] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetchDataset()
        .then(data => setDataset(data))
        .catch(() => setDataset([]))
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = dataset.filter(item => 
    item.claim_text?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Official Verification Dataset</h2>
              <p className="text-xs text-slate-500">Benchmark cases cross-referenced with authentic regulatory circulars</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="my-4 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search dataset by keyword, category, or circular..."
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
          />
        </div>

        {/* List of Dataset Cases */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading verified claims dataset...</div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">No matching dataset records found.</div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelectSample(item.claim_text, item.url, item.input_type);
                  onClose();
                }}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-blue-50/40 hover:border-blue-300 cursor-pointer transition flex flex-col justify-between group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                      {item.id}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.category}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    item.ground_truth_verdict === 'SUPPORTED'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : item.ground_truth_verdict === 'REFUTED'
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {item.ground_truth_verdict}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed font-medium mb-2">
                  "{item.claim_text}"
                </p>

                <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200/60">
                  <span className="truncate max-w-[320px] font-serif text-slate-600">
                    Ref: {item.official_circular}
                  </span>
                  <span className="text-blue-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center space-x-1">
                    <span>Load Case</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
"""

with open(os.path.join(fe_src, "components", "DatasetModal.jsx"), "w", encoding="utf-8") as f:
    f.write(ds_modal)
print("Created DatasetModal.jsx")
