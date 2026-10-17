import React from 'react';
import { Sparkles } from 'lucide-react';
export const ExplainabilityPanel = ({ attributions }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <span>Explainable AI — Classifier Feature Explanation (SHAP/LIME)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Local feature importance values indicating tokens that drove elevated risk scores.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
          Classifier Attribution Only
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
        {attributions.map((attr, idx) => {
          const pct = Math.round(attr.importance * 100);
          return (
            <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-extrabold text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                  "{attr.token}"
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  attr.impact === 'HIGH'
                    ? 'bg-red-100 text-red-800'
                    : attr.impact === 'MEDIUM'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-800'
                }`}>
                  {attr.impact} INFLUENCE
                </span>
              </div>

              <div className="text-[11px] text-slate-500 mb-2 font-medium">
                Trigger Vector: <span className="text-slate-800">{attr.category}</span>
              </div>

              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex items-center">
                <div
                  className={`h-full rounded-full ${attr.impact === 'HIGH' ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
              <div className="text-[10px] text-right text-slate-400 font-mono mt-1">
                Importance Weight: {attr.importance.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
