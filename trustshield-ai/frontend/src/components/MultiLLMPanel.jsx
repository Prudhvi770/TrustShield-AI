import React from 'react';
import { Bot, CheckCircle, AlertCircle } from 'lucide-react';
export const MultiLLMPanel = ({ qwen, llama, agreement }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span>Multi-LLM Dual Verification Architecture</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Primary reasoning model cross-examined by an independent reviewer model.
          </p>
        </div>

        {/* Agreement Pill */}
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
          agreement
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {agreement ? (
            <>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>MODELS IN FULL AGREEMENT</span>
            </>
          ) : (
            <>
              <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              <span>DISAGREEMENT ARBITRATED BY EVIDENCE</span>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Model 1: Qwen3-8B */}
        <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center text-xs font-black">
                Q3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Primary Reasoning Model</h4>
                <div className="text-[11px] text-slate-500 font-mono">Qwen3-8B (RAG Grounded)</div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">
                {qwen.verdict}
              </span>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{qwen.confidence}% Confidence</div>
            </div>
          </div>

          <div className="space-y-3 mt-4 text-xs">
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Model Reasoning:</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{qwen.reasoning}</p>
            </div>

            {qwen.evidence_summary && (
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600">
                <strong className="text-slate-800">Evidence Synthesis: </strong>
                {qwen.evidence_summary}
              </div>
            )}

            {qwen.warnings && qwen.warnings.length > 0 && (
              <div className="flex items-start space-x-1.5 text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200 text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>{qwen.warnings.join(', ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Model 2: Llama 3.1 8B */}
        <div className="rounded-xl border border-slate-200 p-5 bg-slate-50/50 hover:bg-slate-50 transition">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
                L3
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Independent Reviewer Model</h4>
                <div className="text-[11px] text-slate-500 font-mono">Llama 3.1 8B (Adversarial Auditor)</div>
              </div>
            </div>

            <div className="text-right">
              <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold bg-slate-900 text-white">
                {llama.review_verdict}
              </span>
              <div className="text-[11px] font-semibold text-slate-500 mt-0.5">{llama.confidence}% Confidence</div>
            </div>
          </div>

          <div className="space-y-3 mt-4 text-xs">
            <div>
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Reviewer Critique:</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{llama.review_reasoning}</p>
            </div>

            <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-center justify-between">
              <span>Agreement with Primary Model:</span>
              <strong className={llama.agreement_with_qwen ? 'text-emerald-600' : 'text-amber-600'}>
                {llama.agreement_with_qwen ? '✓ AGREE' : '✕ DISAGREE'}
              </strong>
            </div>

            {llama.issues_found && llama.issues_found.length > 0 ? (
              <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[11px]">
                <strong className="block font-bold mb-0.5">Issues / Hallucinations Detected:</strong>
                <ul className="list-disc list-inside space-y-0.5">
                  {llama.issues_found.map((iss, i) => <li key={i}>{iss}</li>)}
                </ul>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 flex items-center space-x-1">
                <CheckCircle className="w-3 h-3 text-emerald-500" />
                <span>Zero hallucinations or unauthorized source citations identified.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
