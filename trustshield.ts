export const SAMPLE_INPUT =
  "URGENT! RBI has announced a ₹50,000 scholarship for every college student. Apply now at https://example.com and submit your Aadhaar details.";

export type ViewName = "dashboard" | "history" | "evidence" | "knowledge" | "reports" | "settings";
export type Verdict = "SUPPORTED" | "REFUTED" | "UNVERIFIABLE";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type AnalysisResult = {
  id: string;
  createdAt: string;
  inputType: string;
  inputText: string;
  inputUrl?: string;
  preprocessing: {
    rawText: string;
    sentences: string[];
    tokens: string[];
    normalized: string[];
    lemmas: string[];
  };
  nlp: {
    pos: { word: string; tag: string }[];
    ngrams: { unigrams: string[]; bigrams: string[]; trigrams: string[] };
    entities: { text: string; type: string }[];
    dependencies: { subject: string; action: string; object: string }[];
  };
  claims: { id: string; text: string; type: string; entities: string[] }[];
  risks: {
    fakeNews: number;
    financialScam: number;
    spam: number;
    phishing: number;
    urlRisk: RiskLevel;
    overall: RiskLevel;
    features: { label: string; value: number; tone: string }[];
  };
  semanticSimilarity: number | null;
  verdict: Verdict;
  confidence: number;
  summary: string;
  reasoning: string;
  qwen: { verdict: Verdict; confidence: number; reasoning: string } | null;
  llama: {
    verdict: Verdict;
    confidence: number;
    reasoning: string;
    agreementWithQwen: boolean;
    issuesFound: string[];
  } | null;
  decision: {
    agreement: boolean | null;
    evidenceStatus: "SUPPORTING" | "CONTRADICTING" | "INSUFFICIENT";
    explanation: string;
  };
  evidence: {
    id: string;
    title: string;
    organization: string;
    sourceUrl?: string;
    pageNumber?: number;
    textChunk: string;
    similarityScore?: number;
    bm25Score?: number;
  }[];
  modelResults: { name: string; status: string; value: string; detail: string }[];
  demoMode: boolean;
};

export type HistoryItem = {
  id: string;
  created_at: string;
  input_type: string;
  input_text: string;
  verdict: string;
  overall_risk: string;
  confidence: number;
  summary: string | null;
};

export type DocumentItem = {
  id: string;
  title: string;
  organization: string | null;
  document_date: string | null;
  source_url: string | null;
  document_type: string;
  file_name: string | null;
  chunk_count: number;
  embedding_status: string;
  created_at: string;
};

export type EvidenceItem = {
  id: string;
  analysis_id: string;
  title: string;
  organization: string | null;
  source_url: string | null;
  page_number: number | null;
  text_chunk: string;
  similarity_score: number | null;
  bm25_score: number | null;
  created_at: string;
};

export type StatusResponse = {
  success: boolean;
  cloudDatabase: boolean;
  qwen: boolean;
  qwenModel: string;
  llama: boolean;
  llamaModel: string;
};

export const documentStatusLabel = (status: string): { label: string; tone: string } => {
  switch (status) {
    case "chunked":
      return { label: "Keyword-indexed", tone: "lime" };
    case "pending":
      return { label: "Pending", tone: "amber" };
    case "pdf_pending":
      return { label: "PDF extraction pending", tone: "amber" };
    case "extraction_failed":
      return { label: "Extraction failed", tone: "risk" };
    default:
      return { label: status, tone: "amber" };
  }
};

export const getSessionId = () => {
  if (typeof window === "undefined") return "server-preview";
  const existing = window.localStorage.getItem("trustshield-session");
  if (existing) return existing;
  const next = crypto.randomUUID();
  window.localStorage.setItem("trustshield-session", next);
  return next;
};

export const riskTone = (risk: RiskLevel | Verdict) => {
  if (risk === "HIGH" || risk === "REFUTED") return "risk";
  if (risk === "MEDIUM" || risk === "UNVERIFIABLE") return "amber";
  if (risk === "SUPPORTED" || risk === "LOW") return "lime";
  return "cyan";
};

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
