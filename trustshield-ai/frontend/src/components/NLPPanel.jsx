import React, { useState } from 'react';
import { Layers } from 'lucide-react';
export const NLPPanel = ({ nlp, preprocessing }) => {
  const [activeTab, setActiveTab] = useState('pos');

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <span>Deep Natural Language Processing Explorer</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Inspect linguistic primitives: POS tags, n-grams, named entities, and syntactic dependencies.
          </p>
        </div>

        {/* NLP Sub-tabs */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab('pos')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'pos' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            POS Tags
          </button>
          <button
            onClick={() => setActiveTab('ngrams')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ngrams' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            N-Grams
          </button>
          <button
            onClick={() => setActiveTab('ner')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'ner' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            NER Entities
          </button>
          <button
            onClick={() => setActiveTab('dep')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'dep' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dependency & SVO
          </button>
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-3 py-1.5 rounded-lg transition ${
              activeTab === 'tokens' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tokens
          </button>
        </div>
      </div>

      <div className="mt-6">
        {/* Tab 1: POS Tags Table */}
        {activeTab === 'pos' && (
          <div>
            <div className="text-xs text-slate-500 mb-3">
              Word-level Part-of-Speech tagging and lemmatization mapping (spaCy/NLTK):
            </div>
            <div className="max-h-72 overflow-y-auto custom-scrollbar border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="p-3">WORD / TOKEN</th>
                    <th className="p-3">POS TAG</th>
                    <th className="p-3">LEMMA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {nlp.pos_tags.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70">
                      <td className="p-3 font-semibold font-mono text-slate-900">{item.word}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          {item.pos}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600 font-mono">{item.lemma}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: N-Grams */}
        {activeTab === 'ngrams' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Unigrams */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Unigrams</h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {nlp.ngrams.unigrams.map((u, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-mono text-slate-800 font-medium truncate max-w-[140px]">{u.phrase}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">×{u.frequency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bigrams */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Bigrams</h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {nlp.ngrams.bigrams.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-mono text-slate-800 font-medium truncate max-w-[140px]">{b.phrase}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">×{b.frequency}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Trigrams */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Trigrams</h4>
              <div className="space-y-1.5 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {nlp.ngrams.trigrams.map((t, i) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white p-2 rounded-lg border border-slate-200">
                    <span className="font-mono text-slate-800 font-medium truncate max-w-[140px]">{t.phrase}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">×{t.frequency}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: NER */}
        {activeTab === 'ner' && (
          <div>
            <div className="text-xs text-slate-500 mb-3">Named Entity Recognition tags:</div>
            <div className="flex flex-wrap gap-2.5 p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              {nlp.entities.map((ent, idx) => {
                let color = 'bg-blue-100 text-blue-800 border-blue-200';
                if (ent.label === 'MONEY') color = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                if (ent.label === 'ORGANIZATION') color = 'bg-purple-100 text-purple-800 border-purple-200';
                if (ent.label === 'PRODUCT') color = 'bg-amber-100 text-amber-800 border-amber-200';
                if (ent.label === 'GPE') color = 'bg-teal-100 text-teal-800 border-teal-200';

                return (
                  <div key={idx} className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-2 ${color}`}>
                    <span className="font-bold">{ent.entity}</span>
                    <span className="text-[10px] uppercase opacity-75 font-mono px-1 rounded bg-white/50">{ent.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Dependency & SVO */}
        {activeTab === 'dep' && (
          <div className="space-y-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Subject - Verb - Object (SVO) Relations</h4>
              {nlp.svo_triples.map((svo, i) => (
                <div key={i} className="p-3 bg-white rounded-lg border border-slate-200 flex flex-wrap items-center gap-3 text-xs">
                  <span className="px-2 py-1 rounded bg-blue-50 border border-blue-200 font-bold text-blue-900">
                    Subject: {svo.subject}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="px-2 py-1 rounded bg-amber-50 border border-amber-200 font-bold text-amber-900">
                    Action: {svo.action}
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="px-2 py-1 rounded bg-emerald-50 border border-emerald-200 font-bold text-emerald-900">
                    Object: {svo.object}
                  </span>
                </div>
              ))}
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Syntactic Dependency Graph</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {nlp.dependency_edges.map((edge, i) => (
                  <div key={i} className="p-2 bg-white rounded border border-slate-200 text-xs flex items-center justify-between">
                    <span className="font-mono text-slate-800 font-semibold">{edge.source}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      -- {edge.relation} --
                    </span>
                    <span className="font-mono text-slate-800 font-semibold">{edge.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Tokens */}
        {activeTab === 'tokens' && (
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Token Stream ({preprocessing.tokens.length} tokens):</h4>
              <div className="flex flex-wrap gap-1.5">
                {preprocessing.tokens.map((tok, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-white border border-slate-200 text-xs font-mono text-slate-800">
                    {tok}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Lemmatized Stream:</h4>
              <div className="flex flex-wrap gap-1.5">
                {preprocessing.lemmatized_tokens.map((lem, i) => (
                  <span key={i} className="px-2 py-1 rounded bg-white border border-slate-200 text-xs font-mono text-slate-600">
                    {lem}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
