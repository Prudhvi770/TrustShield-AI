import React from 'react';
import { ShieldAlert, ShieldCheck, ShieldQuestion, Download, AlertTriangle, FileText } from 'lucide-react';
export const FinalVerdictCard = ({
  decision,
  evidenceConsistency,
  summary,
  recommendedAction,
  analysisId,
  onDownloadReport
}) => {
  const isSupported = decision.final_verdict === 'SUPPORTED';
  const isRefuted = decision.final_verdict === 'REFUTED';
  const isUnverifiable = decision.final_verdict === 'UNVERIFIABLE';

  const verdictBg = isSupported
    ? 'bg-emerald-50 border-emerald-200'
    : isRefuted
    ? 'bg-red-50 border-red-200'
    : 'bg-amber-50 border-amber-200';

  const verdictBadgeColor = isSupported
    ? 'bg-emerald-600 text-white ring-emerald-600/20'
    : isRefuted
    ? 'bg-red-600 text-white ring-red-600/20'
    : 'bg-amber-500 text-white ring-amber-500/20';

  const riskBadgeColor = decision.risk_level === 'HIGH'
    ? 'bg-red-100 text-red-800 border-red-200'
    : decision.risk_level === 'MEDIUM'
    ? 'bg-amber-100 text-amber-800 border-amber-200'
    : 'bg-emerald-100 text-emerald-800 border-emerald-200';

  return (
    <div className={`rounded-2xl border ${verdictBg} p-6 sm:p-8 shadow-md mb-8 transition-all`}>
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200/60">
        <div className="flex items-center space-x-3">
          {isSupported && <ShieldCheck className="w-8 h-8 text-emerald-600" />}
          {isRefuted && <ShieldAlert className="w-8 h-8 text-red-600" />}
          {isUnverifiable && <ShieldQuestion className="w-8 h-8 text-amber-600" />}
          <div>
            <div className="text-xs font-bold tracking-wider text-slate-500 uppercase">Final Determination</div>
            <div className="text-xs text-slate-400">Audit Dossier #{analysisId}</div>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onDownloadReport}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 hover:border-slate-400 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Official PDF Report</span>
          </button>
        </div>
      </div>

      {/* Primary Verdict Hero */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 my-6 items-center">
        <div className="md:col-span-2">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Final Verdict</div>
          <div className="flex items-center space-x-3">
            <span className={`text-2xl sm:text-3xl font-extrabold tracking-tight px-4 py-1.5 rounded-xl ring-4 shadow-sm ${verdictBadgeColor}`}>
              {decision.final_verdict}
            </span>
          </div>
          <p className="text-xs text-slate-600 mt-2 font-medium">
            {decision.decision_case}
          </p>
        </div>

        <div className="bg-white/90 p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Confidence Score</div>
          <div className="text-2xl font-black text-slate-900 mt-0.5">{decision.confidence}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${decision.confidence}%` }}></div>
          </div>
        </div>

        <div className="bg-white/90 p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase">Overall Digital Risk</div>
          <div className="mt-1">
            <span className={`inline-block px-3 py-0.5 rounded-full text-xs font-bold border ${riskBadgeColor}`}>
              {decision.risk_level} RISK
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Evidence: <strong className="text-slate-700">{evidenceConsistency.evidence_status}</strong>
          </div>
        </div>
      </div>

      {/* Explanation & Action Box */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 mb-1.5">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>Why is this verified as {decision.final_verdict}?</span>
          </h4>
          <p className="text-sm text-slate-700 leading-relaxed">{summary}</p>
        </div>

        {recommendedAction && (
          <div className="pt-3 border-t border-slate-100 flex items-start space-x-2.5 text-xs text-slate-600">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Recommended Action: </strong>
              <span>{recommendedAction}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
