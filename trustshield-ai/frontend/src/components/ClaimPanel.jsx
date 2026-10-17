import React from 'react';
import { FileCheck, Building2, Coins, Users, CheckCircle } from 'lucide-react';
export const ClaimPanel = ({ claims }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <FileCheck className="w-5 h-5 text-blue-600" />
            <span>Extracted Claims & Structured NLP Entities</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Decomposed factual assertions separated from opinions or non-claims.
          </p>
        </div>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg">
          {claims.length} {claims.length === 1 ? 'Claim' : 'Claims'} Isolated
        </span>
      </div>

      <div className="space-y-4 mt-5">
        {claims.map((claim, idx) => (
          <div key={claim.claim_id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Claim {idx + 1}
              </span>
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-100 text-blue-800">
                {claim.claim_type}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-900 mb-3">
              "{claim.claim_text}"
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-200/60 text-xs">
              <div className="flex items-center space-x-2 text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Issuer / Entity</div>
                  <div className="font-medium text-slate-800">{claim.organization || 'Unspecified'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-600">
                <Coins className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Stated Amount</div>
                  <div className="font-medium text-slate-800">{claim.amount || 'N/A'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-600">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Target Audience</div>
                  <div className="font-medium text-slate-800">{claim.target || 'General Public'}</div>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-slate-600">
                <CheckCircle className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Action Predicate</div>
                  <div className="font-medium text-slate-800">{claim.action || 'Announced'}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
