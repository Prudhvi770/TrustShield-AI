import React, { useState } from 'react';
import { 
  FileText, Link2, Image, ArrowRight, ShieldCheck, Sparkles, 
  Globe2, Target, AlertCircle, RefreshCw, FileUp
} from 'lucide-react';
import { analyzeText, getReportDownloadUrl } from '../api/client';
import { PipelineProgress } from '../components/PipelineProgress';
import { FinalVerdictCard } from '../components/FinalVerdictCard';
import { MultiLLMPanel } from '../components/MultiLLMPanel';
import { ClaimPanel } from '../components/ClaimPanel';
import { EvidencePanel } from '../components/EvidencePanel';
import { RiskCards } from '../components/RiskCards';
import { ExplainabilityPanel } from '../components/ExplainabilityPanel';
import { NLPPanel } from '../components/NLPPanel';
import { DatasetModal } from '../components/DatasetModal';
import { Database } from 'lucide-react';

const MASTER_TEST_SAMPLE = "URGENT! RBI has announced a ₹50,000 scholarship for every college student. Apply now at https://example.com and submit your Aadhaar details.";

const PIPELINE_STAGES = [
  { id: '1', name: 'Input Normalization' },
  { id: '2', name: 'POS & N-Grams' },
  { id: '3', name: 'NER & Syntax' },
  { id: '4', name: 'Claim Extraction' },
  { id: '5', name: 'Multi-Risk Models' },
  { id: '6', name: 'BM25 + S-BERT' },
  { id: '7', name: 'RAG Context Build' },
  { id: '8', name: 'Qwen3-8B Primary' },
  { id: '9', name: 'Llama 3.1 Review' },
  { id: '10', name: 'Decision Engine' },
];

export const Verify = () => {
  const [activeInputTab, setActiveInputTab] = useState('text');
  const [showDatasetModal, setShowDatasetModal] = useState(false);
  const [inputText, setInputText] = useState(MASTER_TEST_SAMPLE);
  const [inputUrl, setInputUrl] = useState('https://example.com');
  const [inputType, setInputType] = useState('News');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const handleVerify = async () => {
    if (!inputText.trim() && activeInputTab !== 'url') return;
    setError('');
    setLoading(true);
    setCurrentStepIndex(0);

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < PIPELINE_STAGES.length - 1 ? prev + 1 : prev));
    }, 280);

    try {
      const textToVerify = activeInputTab === 'url' ? `Suspicious URL verification request for ${inputUrl}` : inputText;
      const res = await analyzeText(textToVerify, inputUrl, inputType);
      clearInterval(interval);
      setCurrentStepIndex(PIPELINE_STAGES.length);
      setResult(res);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || 'Verification failed. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setInputUrl('');
    setResult(null);
    setError('');
  };

  const downloadReport = () => {
    if (!result) return;
    window.open(getReportDownloadUrl(result.analysis_id), '_blank');
  };

  const pipelineSteps = PIPELINE_STAGES.map((s, idx) => ({
    ...s,
    status: (idx < currentStepIndex ? 'done' : idx === currentStepIndex ? 'running' : 'pending'),
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Tagline Badge */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-white text-emerald-800 text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live cross-referencing with official sources</span>
        </div>
      </div>

      {/* Hero Headline */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0F172A] tracking-tight mb-4 leading-tight">
          Verify Every Claim.<br />Protect Every Citizen.
        </h1>
        <p className="text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
          TrustShield AI checks financial news, government scheme claims, and phishing messages
          against official RBI and government sources — with plain-language, explainable results in seconds.
        </p>
      </div>

      {/* Primary Verification Input Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 sm:p-3 mb-10">
        {/* Input Selector Tabs */}
        <div className="flex items-center border-b border-slate-100 px-3 pt-2">
          <button
            onClick={() => setActiveInputTab('text')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-bold transition ${
              activeInputTab === 'text'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste text</span>
          </button>

          <button
            onClick={() => setActiveInputTab('url')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-bold transition ${
              activeInputTab === 'url'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Check URL</span>
          </button>

          <button
            onClick={() => setActiveInputTab('image')}
            className={`flex items-center space-x-2 px-5 py-3 border-b-2 text-xs font-bold transition ${
              activeInputTab === 'image'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Upload image</span>
          </button>
        </div>

        {/* Input Form Body */}
        <div className="p-4 sm:p-5">
          {activeInputTab === 'text' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Input Channel:</span>
                  <select
                    value={inputType}
                    onChange={(e) => setInputType(e.target.value)}
                    className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700"
                  >
                    <option value="News">News Article</option>
                    <option value="SMS">SMS Message</option>
                    <option value="WhatsApp">WhatsApp Forward</option>
                    <option value="Email">Email</option>
                    <option value="Telegram">Telegram Post</option>
                    <option value="Social Media">Social Media</option>
                  </select>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowDatasetModal(true)}
                    className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold hover:bg-blue-100 transition"
                  >
                    <Database className="w-3.5 h-3.5" />
                    <span>Select from Dataset (8 Cases)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputText(MASTER_TEST_SAMPLE)}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                  >
                    Default Example
                  </button>
                </div>
              </div>

              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste a WhatsApp forward, SMS, or news claim here — e.g. 'Govt is giving ₹5000 under PM Kisan, verify KYC at bit.ly/...'"
                className="w-full p-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600 text-sm text-slate-900 leading-relaxed resize-none"
              />

              <div className="mt-3 flex items-center space-x-2">
                <Link2 className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="Optional: Include accompanying link to evaluate URL risk (e.g. https://example.com)"
                  className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}

          {activeInputTab === 'url' && (
            <div className="py-4">
              <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Suspicious Link / Website URL</label>
              <div className="relative">
                <Link2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com/rbi-scholarship-login"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                TrustShield will analyze domain age, SSL certificate, entropy, subdomains, and official registrar records.
              </p>
            </div>
          )}

          {activeInputTab === 'image' && (
            <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
              <FileUp className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <div className="text-sm font-bold text-slate-800">Upload screenshot of message or poster</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Supports PNG, JPG, or PDF captures of WhatsApp forwards, emails, and circulars. OCR extracts text automatically.
              </p>
              <button
                type="button"
                onClick={() => {
                  setInputText(MASTER_TEST_SAMPLE);
                  setActiveInputTab('text');
                }}
                className="mt-4 px-4 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Use sample message text instead
              </button>
            </div>
          )}

          {/* Card Footer Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400" />
              <span>Your input is analyzed privately. We do not store personal data.</span>
            </div>

            <div className="flex items-center space-x-2">
              {(inputText || result) && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
                >
                  Clear
                </button>
              )}

              <button
                type="button"
                onClick={handleVerify}
                disabled={loading}
                className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-[#5B6B8A] hover:bg-[#495772] text-white text-sm font-bold transition shadow-sm disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4" />
                )}
                <span>{loading ? 'Verifying...' : 'Verify Now'}</span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm mb-8 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Live Pipeline Execution Progress */}
      {loading && (
        <PipelineProgress steps={pipelineSteps} currentStepIndex={currentStepIndex} />
      )}

      {/* Result Presentation Section */}
      {result && (
        <div className="space-y-2 animate-in fade-in duration-300">
          {/* Prominent Final Verdict Banner */}
          <FinalVerdictCard
            decision={result.decision}
            evidenceConsistency={result.evidence_consistency}
            summary={result.summary}
            recommendedAction={result.recommended_action}
            analysisId={result.analysis_id}
            onDownloadReport={downloadReport}
          />

          {/* Two-LLM Dual Review Panel */}
          <MultiLLMPanel
            qwen={result.qwen_result}
            llama={result.llama_review}
            agreement={result.decision.agreement}
          />

          {/* Extracted Claims Panel */}
          <ClaimPanel claims={result.claims} />

          {/* Retrieved Evidence Panel */}
          <EvidencePanel evidence={result.evidence} />

          {/* 5 Risk Classifiers */}
          <RiskCards riskScores={result.risk_scores} />

          {/* Explainable AI / SHAP Attribution */}
          <ExplainabilityPanel attributions={result.explainability} />

          {/* Deep NLP Tabs */}
          <NLPPanel nlp={result.nlp} preprocessing={result.preprocessing} />
        </div>
      )}

      {/* 4 Feature Highlight Cards (from Screenshot 2) */}
      {!result && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 mb-16">
            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center space-x-4 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Building2Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Trusted by RBI circular data</div>
                <div className="text-xs text-slate-500 mt-0.5">Cross-referenced directly with official repository indices.</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center space-x-4 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Explainable AI verdicts</div>
                <div className="text-xs text-slate-500 mt-0.5">SHAP & LIME token attribution for full model transparency.</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center space-x-4 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <Globe2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Multilingual support</div>
                <div className="text-xs text-slate-500 mt-0.5">Processes Indian regional messaging and script variations.</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200 flex items-center space-x-4 shadow-2xs">
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900">Real-time phishing detection</div>
                <div className="text-xs text-slate-500 mt-0.5">Evaluates urgency patterns, Aadhaar harvesting, and domain entropy.</div>
              </div>
            </div>
          </div>

          {/* How It Works Section */}
          <div className="text-center my-16 border-t border-slate-200 pt-16">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">HOW IT WORKS</div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Three checks. One clear verdict.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10 text-left">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-bold mb-4">
                  01
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Hybrid Evidence Retrieval</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Extracts claims and searches official RBI circulars, SEBI advisories, and Gazette notices using BM25 and Sentence-BERT.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center text-xs font-bold mb-4">
                  02
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Dual-LLM Cross Examination</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Qwen3-8B performs primary claim verification, which is then independently audited by Llama 3.1 8B for hallucinations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold mb-4">
                  03
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1.5">Evidence-First Decision Engine</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Official evidence has absolute priority. If evidence is insufficient, the system safely outputs UNVERIFIABLE.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
      <DatasetModal
        isOpen={showDatasetModal}
        onClose={() => setShowDatasetModal(false)}
        onSelectSample={(text, url, type) => {
          setInputText(text);
          if (url) setInputUrl(url);
          if (type) setInputType(type);
        }}
      />
    </div>
  );
};

const Building2Icon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/><path d="M10 6h4"/><path d="M10 10h4"/><path d="M10 14h4"/><path d="M10 18h4"/>
  </svg>
);
