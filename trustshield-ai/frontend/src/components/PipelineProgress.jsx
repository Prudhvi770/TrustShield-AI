import React from 'react';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';





export const PipelineProgress = ({ steps, currentStepIndex }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          <span>Live Verification Pipeline Execution</span>
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
          Step {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {steps.map((step) => {
          const isDone = step.status === 'done';
          const isRunning = step.status === 'running';

          return (
            <div
              key={step.id}
              className={`p-3 rounded-xl border flex items-center space-x-2.5 transition-all ${
                isDone
                  ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                  : isRunning
                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-sm ring-2 ring-blue-500/20'
                  : 'bg-slate-50 border-slate-100 text-slate-400'
              }`}
            >
              {isDone ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : isRunning ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
              )}
              <span className="text-xs font-semibold truncate">{step.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
