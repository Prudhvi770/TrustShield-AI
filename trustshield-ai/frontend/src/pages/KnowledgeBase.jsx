import React, { useState, useEffect } from 'react';
import { Database, UploadCloud, FileText, CheckCircle2, Building, ExternalLink, Calendar } from 'lucide-react';
import { fetchEvidenceList, uploadCircularDocument, fetchDataset } from '../api/client';

export const KnowledgeBase = () => {
  const [documents, setDocuments] = useState([]);
  const [datasetCases, setDatasetCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('Reserve Bank of India (RBI)');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const loadDocs = () => {
    fetchEvidenceList()
      .then(data => setDocuments(data))
      .catch(() => setDocuments([]))
      .finally(() => setLoading(false));
    fetchDataset().then(d => setDatasetCases(d)).catch(() => {});
  };

  useEffect(() => {
    loadDocs();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;
    setUploading(true);
    setMessage('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title);
      fd.append('organization', organization);
      await uploadCircularDocument(fd);
      setMessage('Document successfully ingested, chunked, and embedded into vector store!');
      setTitle('');
      setFile(null);
      loadDocs();
    } catch (err) {
      setMessage('Upload error: ' + (err.message || 'Unknown error'));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">OFFICIAL GROUND TRUTH</div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Knowledge Base & Circular Repository</h1>
        <p className="text-sm text-slate-500 mt-1 max-w-xl">
          Upload authentic regulatory advisories, gazettes, and RBI circulars. Chunks are embedded with Sentence-BERT and indexed via BM25 & ChromaDB.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm mb-10">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <UploadCloud className="w-5 h-5 text-blue-600" />
          <span>Ingest New Verified Circular (PDF / TXT / DOCX)</span>
        </h3>

        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            {message}
          </div>
        )}

        <form onSubmit={handleUpload} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Circular Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Master Direction on Digital Payment Fraud Prevention"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Issuing Regulatory Authority</label>
            <select
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              <option value="Reserve Bank of India (RBI)">Reserve Bank of India (RBI)</option>
              <option value="Securities and Exchange Board of India (SEBI)">Securities and Exchange Board of India (SEBI)</option>
              <option value="Press Information Bureau (Govt of India)">Press Information Bureau (Govt of India)</option>
              <option value="Ministry of Education (Govt of India)">Ministry of Education (Govt of India)</option>
              <option value="National Cyber Crime Reporting Portal">National Cyber Crime Reporting Portal</option>
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Document File (PDF / TXT)</label>
            <input
              type="file"
              required
              accept=".pdf,.txt,.docx"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="w-full p-2 rounded-xl border border-slate-300 text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="px-6 py-2.5 rounded-xl bg-[#0F172A] text-white text-xs font-bold hover:bg-slate-800 transition shadow-sm disabled:opacity-50"
            >
              {uploading ? 'Chunking & Embedding...' : 'Ingest & Index Document'}
            </button>
          </div>
        </form>
      </div>

      {/* Indexed Document List */}
      <div>
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
          <Database className="w-5 h-5 text-blue-600" />
          <span>Currently Indexed Official Ground Truth Documents</span>
        </h3>

        <div className="space-y-3">
          {documents.map((doc, idx) => (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 p-5 hover:border-slate-300 transition shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded font-mono text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                  {doc.document_id}
                </span>
                <span className="text-xs text-slate-500">{doc.date}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 mb-1.5">{doc.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed font-serif line-clamp-2 mb-3">
                "{doc.text}"
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
                <span className="font-medium text-slate-700">Issuer: {doc.organization}</span>
                <span className="text-emerald-600 font-bold flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Vector Embedded</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dataset Benchmark Records Section */}
      <div className="mt-10 pt-8 border-t border-slate-200">
        <h3 className="text-base font-bold text-slate-900 mb-2 flex items-center space-x-2">
          <Database className="w-5 h-5 text-emerald-600" />
          <span>Pre-Loaded Claim Verification Benchmark Dataset ({datasetCases.length} Cases)</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Curated training and evaluation dataset cross-referencing real-world misinformation with official circulars.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {datasetCases.map((item) => (
            <div key={item.id} className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                  {item.id} • {item.input_type}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  item.ground_truth_verdict === 'SUPPORTED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : item.ground_truth_verdict === 'REFUTED'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {item.ground_truth_verdict}
                </span>
              </div>
              <div className="text-xs font-bold text-slate-900 mb-1">{item.category}</div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium mb-2">"{item.claim_text}"</p>
              <div className="text-[11px] text-slate-400 font-serif border-t border-slate-100 pt-1.5 truncate">
                Ref: {item.official_circular}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
