import os

kb_path = r"C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\frontend\src\pages\KnowledgeBase.jsx"
with open(kb_path, "r", encoding="utf-8") as f:
    code = f.read()

if "fetchDataset" not in code:
    code = code.replace(
        "import { fetchEvidenceList, uploadCircularDocument } from '../api/client';",
        "import { fetchEvidenceList, uploadCircularDocument, fetchDataset } from '../api/client';"
    )
    code = code.replace(
        "const [documents, setDocuments] = useState([]);",
        "const [documents, setDocuments] = useState([]);\n  const [datasetCases, setDatasetCases] = useState([]);"
    )
    code = code.replace(
        "fetchEvidenceList()\n      .then(data => setDocuments(data))\n      .catch(() => setDocuments([]))\n      .finally(() => setLoading(false));",
        "fetchEvidenceList()\n      .then(data => setDocuments(data))\n      .catch(() => setDocuments([]))\n      .finally(() => setLoading(false));\n    fetchDataset().then(d => setDatasetCases(d)).catch(() => {});"
    )
    
    # Add a section for dataset cases below the uploaded circulars
    dataset_section = """
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
};"""
    code = code.replace("    </div>\n  );\n};", dataset_section)
    with open(kb_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Updated KnowledgeBase.jsx with Dataset cases")
else:
    print("KnowledgeBase.jsx already updated")
