import React from 'react';
import { Newspaper, DollarSign, MailWarning, Fingerprint, Link2, ShieldAlert } from 'lucide-react';
export const RiskCards = ({ riskScores }) => {
  const getRiskColor = (score) => {
    if (score >= 70) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-emerald-600 bg-emerald-50 border-emerald-200';
  };

  const getBarColor = (score) => {
    if (score >= 70) return 'bg-red-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="pb-4 border-b border-slate-100">
        <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
          <ShieldAlert className="w-5 h-5 text-blue-600" />
          <span>Multi-Signal Machine Learning Risk Classifiers</span>
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Specialized transformer and heuristic models assessing distinct fraud vectors.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        {/* 1. Fake News */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-center justify-between mb-2">
            <Newspaper className="w-4 h-4 text-slate-500" />
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRiskColor(riskScores.fake_news_risk)}`}>
              {riskScores.fake_news_risk}%
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900">BERT / RoBERTa</div>
          <div className="text-[11px] text-slate-500 mb-2.5">Fake News Classifier</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getBarColor(riskScores.fake_news_risk)}`} style={{ width: `${riskScores.fake_news_risk}%` }}></div>
          </div>
        </div>

        {/* 2. Financial Scam */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRiskColor(riskScores.financial_scam_risk)}`}>
              {riskScores.financial_scam_risk}%
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900">FinBERT</div>
          <div className="text-[11px] text-slate-500 mb-2.5">Financial Scam Detector</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getBarColor(riskScores.financial_scam_risk)}`} style={{ width: `${riskScores.financial_scam_risk}%` }}></div>
          </div>
        </div>

        {/* 3. Spam Classifier */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-center justify-between mb-2">
            <MailWarning className="w-4 h-4 text-slate-500" />
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRiskColor(riskScores.spam_risk)}`}>
              {riskScores.spam_risk}%
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900">TF-IDF + N-grams</div>
          <div className="text-[11px] text-slate-500 mb-2.5">Spam Risk Model</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getBarColor(riskScores.spam_risk)}`} style={{ width: `${riskScores.spam_risk}%` }}></div>
          </div>
        </div>

        {/* 4. Phishing Detector */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-center justify-between mb-2">
            <Fingerprint className="w-4 h-4 text-slate-500" />
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${getRiskColor(riskScores.phishing_risk)}`}>
              {riskScores.phishing_risk}%
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900">Phishing Detector</div>
          <div className="text-[11px] text-slate-500 mb-2.5">Credential & Urgency</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getBarColor(riskScores.phishing_risk)}`} style={{ width: `${riskScores.phishing_risk}%` }}></div>
          </div>
        </div>

        {/* 5. URL Risk */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-center justify-between mb-2">
            <Link2 className="w-4 h-4 text-slate-500" />
            <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
              riskScores.url_risk === 'HIGH'
                ? 'text-red-600 bg-red-50 border-red-200'
                : riskScores.url_risk === 'MEDIUM'
                ? 'text-amber-600 bg-amber-50 border-amber-200'
                : 'text-emerald-600 bg-emerald-50 border-emerald-200'
            }`}>
              {riskScores.url_risk} ({riskScores.url_risk_score}%)
            </span>
          </div>
          <div className="text-xs font-bold text-slate-900">URL Analyzer</div>
          <div className="text-[11px] text-slate-500 mb-2.5">Entropy & Spoofing</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${getBarColor(riskScores.url_risk_score)}`} style={{ width: `${riskScores.url_risk_score}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
