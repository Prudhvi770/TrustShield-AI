import os

fe_src = r"C:\Users\gatta\.gemini\antigravity\scratch\trustshield-ai\frontend\src"
verify_path = os.path.join(fe_src, "pages", "Verify.jsx")

with open(verify_path, "r", encoding="utf-8") as f:
    code = f.read()

# Add DatasetModal import if not present
if "DatasetModal" not in code:
    code = code.replace(
        "import { NLPPanel } from '../components/NLPPanel';",
        "import { NLPPanel } from '../components/NLPPanel';\nimport { DatasetModal } from '../components/DatasetModal';\nimport { Database } from 'lucide-react';"
    )

    # Add datasetModalOpen state
    code = code.replace(
        "const [activeInputTab, setActiveInputTab] = useState('text');",
        "const [activeInputTab, setActiveInputTab] = useState('text');\n  const [showDatasetModal, setShowDatasetModal] = useState(false);"
    )

    # Add button beside "Load Master Prompt Example"
    old_btn = """<button
                  type="button"
                  onClick={() => setInputText(MASTER_TEST_SAMPLE)}
                  className="text-xs text-blue-600 hover:underline font-semibold"
                >
                  Load Master Prompt Example
                </button>"""

    new_btns = """<div className="flex items-center space-x-3">
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
                </div>"""

    if old_btn in code:
        code = code.replace(old_btn, new_btns)

    # Add DatasetModal rendering before closing tag
    if "<DatasetModal" not in code:
        code = code.replace(
            "</div>\n  );\n};",
            """  <DatasetModal
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
};"""
        )

    with open(verify_path, "w", encoding="utf-8") as f:
        f.write(code)
    print("Updated Verify.jsx with DatasetModal integration")
else:
    print("Verify.jsx already has DatasetModal")
