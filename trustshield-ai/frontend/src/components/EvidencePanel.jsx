import React, { useState } from 'react';
import { BookOpen, ExternalLink, FileText } from 'lucide-react';
export const EvidencePanel = ({ evidence }) => {
  const [selectedDoc, setSelectedDoc] = useState(evidence.length > 0 ? evidence[0] : null);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span>Retrieved Official Evidence (RAG Grounding)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Strictly retrieved from authentic regulatory repositories (RBI circulars, SEBI advisories, Gazette notices).
          </p>
        </div>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
          Hybrid BM25 + S-BERT Top {evidence.length}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* Document List */}
        <div className="lg:col-span-5 space-y-3">
          {evidence.map((chunk) => {
            const isSelected = selectedDoc?.chunk_id === chunk.chunk_id;
            return (
              <div
                key={chunk.chunk_id}
                onClick={() => setSelectedDoc(chunk)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-400 shadow-sm'
                    : 'bg-slate-50/50 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                  <span className="uppercase tracking-wider text-blue-800 font-mono">{chunk.document_id}</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-semibold">
                    {Math.round(chunk.combined_score * 100)}% Match
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">
                  {chunk.title}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span className="truncate max-w-[160px]">{chunk.organization}</span>
                  <span>{chunk.date}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Document Full View */}
        <div className="lg:col-span-7 bg-slate-50/60 rounded-xl border border-slate-200 p-5 flex flex-col justify-between">
          {selectedDoc ? (
            <div>
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-200">
                <div>
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 uppercase mb-1.5">
                    {selectedDoc.document_id}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {selectedDoc.title}
                  </h4>
                </div>

                {selectedDoc.source_url && (
                  <a
                    href={selectedDoc.source_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-300 transition shrink-0"
                    title="View authentic circular"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 my-3 text-[11px] text-slate-500 bg-white p-2.5 rounded-lg border border-slate-200">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Issuer</span>
                  <span className="font-medium text-slate-800 truncate block">{selectedDoc.organization}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">Date Published</span>
                  <span className="font-medium text-slate-800 block">{selectedDoc.date}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase">BM25 / Semantic</span>
                  <span className="font-medium text-slate-800 block">
                    {selectedDoc.bm25_score.toFixed(2)} / {selectedDoc.semantic_similarity.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-3">
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Official Certified Text Excerpt:
                </div>
                <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 leading-relaxed font-serif">
                  "{selectedDoc.text}"
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs py-8">
              <FileText className="w-8 h-8 mb-2 opacity-40" />
              <span>Select an evidence document on the left to inspect official text.</span>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-200/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Official circular verified in ChromaDB vector repository</span>
            <span className="text-emerald-600 font-semibold">Certified Ground Truth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
