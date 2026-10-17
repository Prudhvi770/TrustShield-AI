import React, { useEffect, useState } from 'react';
import { Shield, Search, Trash2, ExternalLink } from 'lucide-react';
import { fetchHistory, deleteHistory, getReportDownloadUrl } from '../api/client';
export const History = ({ onSelectClaim }) => {
  const [historyList, setHistoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadHistory = () => {
    setLoading(true);
    fetchHistory()
      .then(data => setHistoryList(data))
      .catch(() => setHistoryList([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    await deleteHistory(id);
    setHistoryList(prev => prev.filter(item => item.analysis_id !== id));
  };

  const filtered = historyList.filter(item =>
    item.claim_excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.analysis_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header matching Screenshot 3 */}
      <div className="mb-8">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">ACTIVITY</div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Verification history</h1>
        <p className="text-sm text-slate-500 mt-1">
          Every claim you've checked, saved locally on this device.
        </p>
      </div>

      {historyList.length > 0 && (
        <div className="mb-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search past verification dossiers by claim keyword or audit ID..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
          />
        </div>
      )}

      {/* Main Container */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 text-sm">Loading verification history...</div>
      ) : filtered.length === 0 ? (
        /* Empty State matching Screenshot 3 */
        <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-16 text-center my-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-100">
            <Shield className="w-6 h-6 stroke-[1.7]" />
          </div>
          <div className="text-sm text-slate-600 font-medium">
            {historyList.length === 0 ? (
              <>
                No verifications yet.{' '}
                <button
                  onClick={() => onSelectClaim('')}
                  className="text-blue-600 font-bold hover:underline inline-block"
                >
                  Check your first claim
                </button>
              </>
            ) : (
              'No records match your search criteria.'
            )}
          </div>
        </div>
      ) : (
        /* Populated History Cards */
        <div className="space-y-3">
          {filtered.map((item) => {
            const isSupported = item.final_verdict === 'SUPPORTED';
            const isRefuted = item.final_verdict === 'REFUTED';
            const badgeColor = isSupported
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : isRefuted
              ? 'bg-red-50 text-red-700 border-red-200'
              : 'bg-amber-50 text-amber-700 border-amber-200';

            return (
              <div
                key={item.analysis_id}
                className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 hover:border-slate-300 transition shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
                    <span className="font-bold text-slate-700">#{item.analysis_id}</span>
                    <span>•</span>
                    <span>{item.timestamp}</span>
                    <span>•</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 uppercase text-[10px] font-bold">
                      {item.input_type}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                    "{item.claim_excerpt}"
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${badgeColor}`}>
                    {item.final_verdict} ({item.confidence}%)
                  </span>

                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                    item.overall_risk === 'HIGH'
                      ? 'bg-red-100 text-red-800'
                      : item.overall_risk === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {item.overall_risk}
                  </span>

                  <a
                    href={getReportDownloadUrl(item.analysis_id)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition"
                    title="Download PDF Dossier"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => handleDelete(item.analysis_id)}
                    className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 transition"
                    title="Delete verification record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
