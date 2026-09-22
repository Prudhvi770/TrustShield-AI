import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  BrainCircuit,
  Check,
  ChevronRight,
  CircleHelp,
  Clipboard,
  Clock3,
  Database,
  FileDown,
  FileText,
  History as HistoryIcon,
  LayoutDashboard,
  Library,
  Link2,
  Loader2,
  Menu,
  Network,
  Radar,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  SAMPLE_INPUT,
  type AnalysisResult,
  type DocumentItem,
  type EvidenceItem,
  type HistoryItem,
  type RiskLevel,
  type StatusResponse,
  type Verdict,
  type ViewName,
  documentStatusLabel,
  formatDate,
  getSessionId,
  riskTone,
} from "@/lib/trustshield";

const navItems: { label: string; icon: typeof LayoutDashboard; view: ViewName; path: string }[] = [
  { label: "Dashboard", icon: LayoutDashboard, view: "dashboard", path: "/" },
  { label: "History", icon: HistoryIcon, view: "history", path: "/history" },
  { label: "Evidence", icon: Library, view: "evidence", path: "/evidence" },
  { label: "Knowledge base", icon: Database, view: "knowledge", path: "/knowledge-base" },
  { label: "Reports", icon: FileText, view: "reports", path: "/reports" },
  { label: "Settings", icon: Settings2, view: "settings", path: "/settings" },
];

const defaultResult: AnalysisResult = {
  id: "",
  createdAt: new Date().toISOString(),
  inputType: "News",
  inputText: "",
  preprocessing: { rawText: "", sentences: [], tokens: [], normalized: [], lemmas: [] },
  nlp: {
    pos: [],
    ngrams: { unigrams: [], bigrams: [], trigrams: [] },
    entities: [],
    dependencies: [],
  },
  claims: [],
  risks: {
    fakeNews: 0,
    financialScam: 0,
    spam: 0,
    phishing: 0,
    urlRisk: "LOW",
    overall: "LOW",
    features: [],
  },
  semanticSimilarity: null,
  verdict: "UNVERIFIABLE",
  confidence: 0,
  summary: "",
  reasoning: "",
  qwen: null,
  llama: null,
  decision: { agreement: null, evidenceStatus: "INSUFFICIENT", explanation: "" },
  evidence: [],
  modelResults: [],
  demoMode: true,
};

function Meter({
  label,
  value,
  tone = "cobalt",
  suffix = "%",
}: {
  label: string;
  value: number;
  tone?: string;
  suffix?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-soft">{label}</span>
        <strong className="text-ink">
          {value}
          {suffix}
        </strong>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-panel-soft">
        <div
          className={`h-full rounded-full bg-${tone}`}
          style={{ width: `${Math.max(3, value)}%` }}
        />
      </div>
    </div>
  );
}

function SectionHeading({
  eyebrow,
  title,
  detail,
  action,
}: {
  eyebrow: string;
  title: string;
  detail?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <p className="ts-label mb-2">{eyebrow}</p>
        <h2 className="ts-display text-xl font-semibold text-ink">{title}</h2>
        {detail && <p className="mt-1 text-sm text-ink-soft">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

function Badge({ children, tone = "cyan" }: { children: React.ReactNode; tone?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-${tone}/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-${tone}`}
    >
      {children}
    </span>
  );
}

function Shell({ view, children }: { view: ViewName; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background text-ink">
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-line bg-panel px-4 py-5 transition-transform lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <Link to="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
            <span className="grid size-9 place-items-center rounded-lg bg-ink text-cyan">
              <ShieldCheck className="size-5" />
            </span>
            <span>
              <span className="ts-display block text-base font-bold">TrustShield</span>
              <span className="ts-label block text-[9px]">AI verification lab</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          >
            <X />
          </Button>
        </div>
        <div className="mb-3 px-2 ts-label">Workspace</div>
        <nav className="space-y-1">
          {navItems.map(({ label, icon: Icon, view: itemView, path }) => (
            <Link
              key={itemView}
              to={path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${view === itemView ? "bg-ink text-background" : "text-ink-soft hover:bg-panel-soft hover:text-ink"}`}
            >
              <Icon className="size-4" />
              {label}
              {itemView === "knowledge" && (
                <span className="ml-auto size-1.5 rounded-full bg-lime" />
              )}
            </Link>
          ))}
        </nav>
        <div className="mt-auto rounded-xl border border-line bg-panel-soft p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="ts-label">System status</span>
            <span className="size-2 rounded-full bg-lime" />
          </div>
          <p className="text-sm font-semibold text-ink">Demo Mode active</p>
          <p className="mt-1 text-xs leading-5 text-ink-soft">
            Lightweight NLP signals are running. Connect Qwen3-8B and trusted documents for grounded
            verification.
          </p>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-background/90 px-5 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setOpen(true)}
              aria-label="Open navigation"
            >
              <Menu />
            </Button>
            <div className="hidden items-center gap-2 text-xs text-ink-soft md:flex">
              <span>Workspace</span>
              <ChevronRight className="size-3" />
              <span className="font-semibold text-ink">
                {navItems.find((item) => item.view === view)?.label}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge tone="lime">
              <span className="size-1.5 rounded-full bg-lime" /> Demo Mode
            </Badge>
            <Button variant="outline" size="sm" className="hidden sm:inline-flex">
              <CircleHelp className="size-4" /> Docs
            </Button>
            <div className="grid size-8 place-items-center rounded-full bg-cyan text-xs font-bold text-ink">
              TS
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[1500px] px-5 py-7 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}

function Pipeline({ active }: { active: number }) {
  const items = [
    "Input",
    "Preprocess",
    "NLP analysis",
    "Claims",
    "Risk detection",
    "Retrieval",
    "RAG",
    "Qwen3-8B",
    "Verification",
  ];
  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {items.map((item, index) => (
        <div key={item} className="flex min-w-max items-center gap-2">
          <div
            className={`flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold ${index < active ? "border-lime/40 bg-lime/10 text-ink" : index === active ? "border-cyan bg-cyan/15 text-ink" : "border-line bg-panel text-ink-soft"}`}
          >
            <span
              className={`grid size-5 place-items-center rounded-full text-[10px] ${index < active ? "bg-lime text-ink" : index === active ? "bg-cyan text-ink" : "bg-panel-soft"}`}
            >
              {index < active ? <Check className="size-3" /> : index + 1}
            </span>
            {item}
          </div>
          {index < items.length - 1 && <span className="text-line">→</span>}
        </div>
      ))}
    </div>
  );
}

function AnalysisView({
  result,
  setResult,
}: {
  result: AnalysisResult;
  setResult: (result: AnalysisResult) => void;
}) {
  const [inputType, setInputType] = useState("News");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("Tokens");
  const sessionId = getSessionId();
  const runAnalysis = async () => {
    if (text.trim().length < 5) {
      toast.error("Paste at least a sentence to analyze.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, inputType, text, url }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Analysis failed");
      setResult(payload.result);
      toast.success("Analysis complete", {
        description: "Signals, claims, and the verification boundary are ready.",
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };
  const loadSample = () => setText(SAMPLE_INPUT);
  return (
    <>
      <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2">
            <span className="ts-label">Analysis workspace</span>
            <span className="text-line">/</span>
            <span className="text-xs text-ink-soft">Evidence-grounded risk detection</span>
          </div>
          <h1 className="ts-display max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
            See what a message is really asking you to trust.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-ink-soft md:text-base">
            Decompose claims, inspect risk signals, and keep the line between model output and
            verified evidence visible.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadSample}>
            <Sparkles className="size-4 text-cyan" /> Load sample
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setText("");
              setUrl("");
              setResult(defaultResult);
            }}
          >
            <RefreshCw className="size-4" /> Reset
          </Button>
        </div>
      </div>
      <div className="mb-6">
        <Pipeline active={loading ? 5 : result.id ? 8 : 0} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="ts-panel rounded-xl p-5 md:p-7">
          <SectionHeading
            eyebrow="01 / Input"
            title="Analyze content"
            detail="Choose the source type and paste the content you want to inspect."
            action={
              <Badge tone="cyan">
                <Activity className="size-3" /> Live endpoint
              </Badge>
            }
          />
          <div className="grid gap-4 md:grid-cols-[180px_1fr]">
            <label className="space-y-2">
              <span className="ts-label">Input type</span>
              <select
                value={inputType}
                onChange={(event) => setInputType(event.target.value)}
                className="h-11 w-full rounded-lg border border-line bg-panel-soft px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-cyan"
              >
                <option>News</option>
                <option>SMS</option>
                <option>WhatsApp</option>
                <option>Email</option>
                <option>Telegram</option>
                <option>Social media</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="ts-label">Optional URL</span>
              <div className="relative">
                <Link2 className="absolute left-3 top-3.5 size-4 text-ink-soft" />
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  placeholder="https://source-or-link.example"
                  className="h-11 w-full rounded-lg border border-line bg-panel-soft pl-10 pr-3 text-sm text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-cyan"
                />
              </div>
            </label>
          </div>
          <label className="mt-4 block space-y-2">
            <span className="ts-label">Content to verify</span>
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="Paste a news story, message, email, or social post..."
              className="min-h-56 w-full resize-y rounded-lg border border-line bg-panel-soft p-4 text-sm leading-6 text-ink outline-none placeholder:text-ink-soft/60 focus:ring-2 focus:ring-cyan"
            />
            <span className="flex justify-between text-xs text-ink-soft">
              <span>{text.length.toLocaleString()} / 25,000 characters</span>
              <span>Suspicious terms are preserved for detection</span>
            </span>
          </label>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-5">
            <p className="flex items-center gap-2 text-xs text-ink-soft">
              <ShieldCheck className="size-4 text-lime" /> Input is processed in your private
              session.
            </p>
            <Button size="lg" onClick={runAnalysis} disabled={loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Radar className="size-4" />}
              {loading ? "Running pipeline..." : "Analyze content"}
              <ArrowUpRight className="size-4" />
            </Button>
          </div>
        </section>
        <aside className="space-y-6">
          <div className="ts-panel ts-grid rounded-xl p-5">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="ts-label">Run status</p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  {result.id ? "Analysis ready" : loading ? "Processing input" : "Awaiting input"}
                </p>
              </div>
              <span
                className={`grid size-10 place-items-center rounded-xl ${result.id ? "bg-lime/20 text-lime" : "bg-cyan/20 text-cyan"}`}
              >
                {loading ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : result.id ? (
                  <Check className="size-5" />
                ) : (
                  <Radar className="size-5" />
                )}
              </span>
            </div>
            <div className="space-y-3">
              {[
                "Text preprocessing",
                "NLP analysis",
                "Claim extraction",
                "Risk signals",
                "Evidence retrieval",
                "Qwen3-8B reasoning",
                "Llama 3.1 8B review",
                "Decision engine",
              ].map((step, index) => (
                <div key={step} className="flex items-center gap-3 text-sm">
                  <span
                    className={`grid size-5 place-items-center rounded-full text-[10px] ${result.id || (loading && index < 4) ? "bg-lime text-ink" : loading && index === 4 ? "bg-cyan text-ink" : "bg-panel-soft text-ink-soft"}`}
                  >
                    {result.id || (loading && index < 4) ? (
                      <Check className="size-3" />
                    ) : loading && index === 4 ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      index + 1
                    )}
                  </span>
                  <span
                    className={result.id || (loading && index < 4) ? "text-ink" : "text-ink-soft"}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-amber/30 bg-amber/10 p-5">
            <div className="mb-2 flex items-center gap-2 text-amber">
              <AlertTriangle className="size-4" />
              <span className="ts-label text-amber">Boundary notice</span>
            </div>
            <p className="text-sm leading-6 text-ink">
              Demo signals are not truth decisions. Without indexed trusted evidence, a configured
              Qwen3-8B endpoint, and an independent Llama 3.1 8B review, claims remain{" "}
              <strong>UNVERIFIABLE</strong>.
            </p>
          </div>
        </aside>
      </div>
      {result.id && <Results result={result} tab={tab} setTab={setTab} />}
    </>
  );
}

function Results({
  result,
  tab,
  setTab,
}: {
  result: AnalysisResult;
  tab: string;
  setTab: (tab: string) => void;
}) {
  const riskCards = [
    { label: "Fake news", value: result.risks.fakeNews, tone: "risk" },
    { label: "Financial scam", value: result.risks.financialScam, tone: "amber" },
    { label: "Spam", value: result.risks.spam, tone: "cobalt" },
    { label: "Phishing", value: result.risks.phishing, tone: "risk" },
  ];
  const tabs = ["Tokens", "POS tags", "N-grams", "NER", "Dependencies", "Claims"];
  return (
    <div className="mt-6 space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="ts-panel rounded-xl p-5 md:p-7">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="ts-label">Verification result</p>
              <div className="mt-3 flex items-center gap-3">
                <span
                  className={`grid size-11 place-items-center rounded-xl bg-${riskTone(result.verdict)}/15 text-${riskTone(result.verdict)}`}
                >
                  <ShieldCheck className="size-6" />
                </span>
                <h2 className="ts-display text-3xl font-semibold text-ink">{result.verdict}</h2>
              </div>
            </div>
            <div className="text-right">
              <p className="ts-label">Confidence</p>
              <p className="ts-display mt-2 text-3xl font-semibold text-ink">
                {result.confidence}
                <span className="text-lg text-ink-soft">%</span>
              </p>
            </div>
          </div>
          <div className="mt-7 rounded-lg bg-panel-soft p-4">
            <div className="mb-2 flex items-center gap-2">
              <BrainCircuit className="size-4 text-cyan" />
              <span className="ts-label">Reasoning boundary</span>
            </div>
            <p className="text-sm leading-6 text-ink">{result.reasoning}</p>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Badge tone={riskTone(result.risks.overall)}>
              Overall risk: {result.risks.overall}
            </Badge>
            <Badge tone={result.qwen ? "lime" : "amber"}>
              {result.qwen ? "Qwen3-8B reasoned" : "Qwen3-8B unavailable"}
            </Badge>
            <Badge tone={result.llama ? "lime" : "amber"}>
              {result.llama ? "Llama 3.1 8B reviewed" : "Llama 3.1 8B unavailable"}
            </Badge>
            {result.decision.agreement !== null && (
              <Badge tone={result.decision.agreement ? "lime" : "amber"}>
                {result.decision.agreement ? "Models agree" : "Models disagreed"}
              </Badge>
            )}
            <Badge tone="cyan">No evidence fabricated</Badge>
          </div>
        </section>
        <section className="ts-panel rounded-xl p-5 md:p-7">
          <SectionHeading
            eyebrow="Risk overview"
            title="Signal profile"
            detail="Supporting signals, not a final truth label."
          />
          <div className="space-y-5">
            {riskCards.map((card) => (
              <Meter key={card.label} label={card.label} value={card.value} tone={card.tone} />
            ))}
            <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
              <span className="text-ink-soft">URL risk</span>
              <Badge tone={riskTone(result.risks.urlRisk)}>{result.risks.urlRisk}</Badge>
            </div>
          </div>
        </section>
      </div>
      <section className="ts-panel rounded-xl p-5 md:p-7">
        <SectionHeading
          eyebrow="Claim extraction"
          title="Claims in context"
          detail="Claims are separated from classifier signals and model reasoning."
        />
        <div className="space-y-3">
          {result.claims.map((claim, index) => (
            <div
              key={claim.id}
              className="flex gap-4 rounded-lg border border-line bg-panel-soft p-4"
            >
              <span className="ts-display text-sm font-semibold text-cyan">0{index + 1}</span>
              <div className="min-w-0">
                <p className="text-sm font-semibold leading-6 text-ink">{claim.text}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge tone={claim.type === "VERIFIABLE CLAIM" ? "cobalt" : "amber"}>
                    {claim.type}
                  </Badge>
                  {claim.entities.slice(0, 4).map((entity) => (
                    <span
                      key={entity}
                      className="rounded bg-panel px-2 py-1 text-[11px] text-ink-soft"
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="ts-panel rounded-xl p-5 md:p-7">
        <SectionHeading
          eyebrow="Multi-LLM verification"
          title="Primary model + independent reviewer"
          detail="Llama 3.1 8B does not blindly agree with Qwen3-8B — it re-checks the same evidence and flags unsupported reasoning."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-line bg-panel-soft p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="ts-label">Primary model · Qwen3-8B</span>
              {result.qwen ? (
                <Badge tone={riskTone(result.qwen.verdict)}>{result.qwen.verdict}</Badge>
              ) : (
                <Badge tone="amber">Unavailable</Badge>
              )}
            </div>
            {result.qwen ? (
              <>
                <p className="text-sm text-ink-soft">Confidence: {result.qwen.confidence}%</p>
                <p className="mt-2 text-sm leading-6 text-ink">{result.qwen.reasoning}</p>
              </>
            ) : (
              <p className="text-sm leading-6 text-ink-soft">
                Configure QWEN_API_URL / QWEN_API_KEY to enable the primary reasoning model.
              </p>
            )}
          </div>
          <div className="rounded-lg border border-line bg-panel-soft p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="ts-label">Independent reviewer · Llama 3.1 8B</span>
              {result.llama ? (
                <Badge tone={riskTone(result.llama.verdict)}>{result.llama.verdict}</Badge>
              ) : (
                <Badge tone="amber">Unavailable</Badge>
              )}
            </div>
            {result.llama ? (
              <>
                <p className="text-sm text-ink-soft">Confidence: {result.llama.confidence}%</p>
                <p className="mt-2 text-sm leading-6 text-ink">{result.llama.reasoning}</p>
                {result.llama.issuesFound.length > 0 && (
                  <ul className="mt-3 space-y-1 text-xs text-amber">
                    {result.llama.issuesFound.map((issue) => (
                      <li key={issue}>⚠ {issue}</li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <p className="text-sm leading-6 text-ink-soft">
                Configure LLAMA_API_URL / LLAMA_API_KEY to enable the independent second-LLM review.
                Without it, the decision engine falls back to Qwen3-8B alone.
              </p>
            )}
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-dashed border-line p-4">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="ts-label">Decision engine</span>
            {result.decision.agreement !== null && (
              <Badge tone={result.decision.agreement ? "lime" : "amber"}>
                {result.decision.agreement ? "Model agreement" : "Model disagreement"}
              </Badge>
            )}
            <Badge
              tone={riskTone(result.decision.evidenceStatus === "INSUFFICIENT" ? "MEDIUM" : "LOW")}
            >
              Evidence: {result.decision.evidenceStatus}
            </Badge>
          </div>
          <p className="text-sm leading-6 text-ink-soft">
            {result.decision.explanation ||
              "Waiting on both models — the decision engine only overrides an agreed verdict when the trusted evidence layer doesn't back it."}
          </p>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="ts-panel rounded-xl p-5 md:p-7">
          <SectionHeading
            eyebrow="NLP analysis"
            title="Inspect the pipeline"
            detail="Structured output from the lightweight preprocessing and NLP layer."
          />
          <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
            {tabs.map((item) => (
              <Button
                key={item}
                variant="ghost"
                size="sm"
                className={`shrink-0 rounded-b-none ${tab === item ? "border-b-2 border-cyan text-ink" : "text-ink-soft"}`}
                onClick={() => setTab(item)}
              >
                {item}
              </Button>
            ))}
          </div>
          <NlpTab tab={tab} result={result} />
        </section>
        <section className="ts-panel rounded-xl p-5 md:p-7">
          <SectionHeading
            eyebrow="Model outputs"
            title="What each module knows"
            detail="Classifier explanations are distinct from Qwen3-8B and Llama 3.1 8B reasoning."
          />
          <div className="space-y-3">
            {result.modelResults.map((model) => (
              <div
                key={model.name}
                className="flex items-center justify-between gap-4 rounded-lg border border-line bg-panel-soft p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`grid size-8 shrink-0 place-items-center rounded-lg ${model.status === "unavailable" ? "bg-amber/15 text-amber" : "bg-cyan/15 text-cyan"}`}
                  >
                    {model.status === "unavailable" ? (
                      <AlertTriangle className="size-4" />
                    ) : (
                      <BarChart3 className="size-4" />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{model.name}</p>
                    <p className="truncate text-xs text-ink-soft">{model.detail}</p>
                  </div>
                </div>
                <strong className="shrink-0 text-sm text-ink">{model.value}</strong>
              </div>
            ))}
            <div className="mt-5 rounded-lg border border-dashed border-line p-4">
              <div className="mb-2 flex items-center gap-2">
                <Sparkles className="size-4 text-cyan" />
                <span className="ts-label">Explainable AI</span>
              </div>
              <p className="text-sm leading-6 text-ink-soft">
                Feature influence below belongs to the lightweight risk detector. It does not
                explain Qwen3-8B.
              </p>
              <div className="mt-4 space-y-3">
                {result.risks.features.map((feature) => (
                  <Meter
                    key={feature.label}
                    label={`“${feature.label}”`}
                    value={feature.value}
                    tone={feature.tone}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <section className="ts-panel rounded-xl p-5 md:p-7">
        <SectionHeading
          eyebrow="Trusted retrieval"
          title="Evidence ledger"
          detail={
            result.evidence.length
              ? "Retrieved chunks used in the reasoning context."
              : "No trusted evidence retrieved. Upload official documents to enable grounded retrieval."
          }
          action={
            <Badge tone={result.evidence.length ? "lime" : "amber"}>
              {result.evidence.length ? `${result.evidence.length} sources` : "0 sources"}
            </Badge>
          }
        />
        {result.evidence.length ? (
          result.evidence.map((item) => (
            <div key={item.id} className="border-t border-line py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs text-ink-soft">
                    {item.organization} ·{" "}
                    {item.pageNumber ? `Page ${item.pageNumber}` : "Page not supplied"}
                  </p>
                </div>
                <Badge tone="lime">{Math.round((item.similarityScore ?? 0) * 100)}% match</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{item.textChunk}</p>
            </div>
          ))
        ) : (
          <div className="grid place-items-center rounded-lg border border-dashed border-line bg-panel-soft px-6 py-12 text-center">
            <Search className="mb-3 size-7 text-ink-soft" />
            <p className="text-sm font-semibold text-ink">No evidence was invented</p>
            <p className="mt-1 max-w-md text-xs leading-5 text-ink-soft">
              TrustShield will only show evidence chunks that exist in your indexed knowledge base.
            </p>
          </div>
        )}
      </section>
      <section className="rounded-xl bg-ink p-5 text-background md:p-7">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div>
            <p className="ts-label text-cyan">Human-readable summary</p>
            <p className="mt-3 max-w-3xl text-base leading-7">{result.summary}</p>
          </div>
          <DownloadReport result={result} />
        </div>
      </section>
    </div>
  );
}

function NlpTab({ tab, result }: { tab: string; result: AnalysisResult }) {
  if (tab === "Tokens")
    return (
      <div className="ts-scrollbar max-h-52 overflow-auto">
        <div className="flex flex-wrap gap-2">
          {result.preprocessing.tokens.map((token, index) => (
            <span
              key={`${token}-${index}`}
              className="rounded bg-panel-soft px-2 py-1 text-xs text-ink"
            >
              {token}
            </span>
          ))}
        </div>
      </div>
    );
  if (tab === "POS tags")
    return (
      <DataTable
        headers={["Word", "POS"]}
        rows={result.nlp.pos.map((item) => [item.word, item.tag])}
      />
    );
  if (tab === "N-grams")
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Object.entries(result.nlp.ngrams).map(([label, values]) => (
          <div key={label}>
            <p className="ts-label mb-2">{label}</p>
            <div className="space-y-2">
              {values.map((value) => (
                <p key={value} className="rounded bg-panel-soft px-3 py-2 text-xs text-ink">
                  {value}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  if (tab === "NER")
    return (
      <DataTable
        headers={["Entity", "Type"]}
        rows={result.nlp.entities.map((item) => [item.text, item.type])}
      />
    );
  if (tab === "Dependencies")
    return (
      <DataTable
        headers={["Subject", "Action", "Object"]}
        rows={result.nlp.dependencies.map((item) => [item.subject, item.action, item.object])}
      />
    );
  return (
    <div className="space-y-3">
      {result.claims.map((claim, index) => (
        <div key={claim.id} className="rounded bg-panel-soft p-3">
          <span className="ts-label">Claim {index + 1}</span>
          <p className="mt-1 text-sm text-ink">{claim.text}</p>
        </div>
      ))}
    </div>
  );
}
function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="ts-scrollbar max-h-60 overflow-auto rounded-lg border border-line">
      <table className="w-full text-left text-xs">
        <thead className="sticky top-0 bg-panel-soft text-ink-soft">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-2 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-t border-line">
              <>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-3 py-2 text-ink">
                    {cell}
                  </td>
                ))}
              </>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function DownloadReport({ result }: { result: AnalysisResult }) {
  const download = () => {
    const lines = [
      `TRUSTSHIELD AI VERIFICATION REPORT`,
      `Generated: ${formatDate(result.createdAt)}`,
      ``,
      `INPUT (${result.inputType})`,
      result.inputText,
      ``,
      `VERDICT: ${result.verdict}`,
      `CONFIDENCE: ${result.confidence}%`,
      `OVERALL RISK: ${result.risks.overall}`,
      ``,
      `SUMMARY`,
      result.summary,
      ``,
      `CLAIMS`,
      ...result.claims.map((claim, index) => `${index + 1}. ${claim.text} [${claim.type}]`),
      ``,
      `RISK SCORES`,
      `Fake news: ${result.risks.fakeNews}%`,
      `Financial scam: ${result.risks.financialScam}%`,
      `Spam: ${result.risks.spam}%`,
      `Phishing: ${result.risks.phishing}%`,
      `URL: ${result.risks.urlRisk}`,
      ``,
      `EVIDENCE`,
      result.evidence.length
        ? result.evidence.map((item) => `${item.title} — ${item.textChunk}`).join("\n")
        : "No trusted evidence retrieved.",
      ``,
      `QWEN3-8B (PRIMARY MODEL)`,
      result.qwen
        ? `Verdict: ${result.qwen.verdict}\nConfidence: ${result.qwen.confidence}%\nReasoning: ${result.qwen.reasoning}`
        : "Not configured.",
      ``,
      `LLAMA 3.1 8B (INDEPENDENT REVIEWER)`,
      result.llama
        ? `Verdict: ${result.llama.verdict}\nConfidence: ${result.llama.confidence}%\nAgreement with Qwen: ${result.llama.agreementWithQwen ? "YES" : "NO"}\nReview: ${result.llama.reasoning}${result.llama.issuesFound.length ? `\nIssues found: ${result.llama.issuesFound.join("; ")}` : ""}`
        : "Not configured.",
      ``,
      `DECISION ENGINE`,
      `Agreement: ${result.decision.agreement === null ? "N/A" : result.decision.agreement ? "YES" : "NO"}`,
      `Evidence status: ${result.decision.evidenceStatus}`,
      result.decision.explanation,
      ``,
      `MODEL BOUNDARY`,
      result.reasoning,
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `trustshield-report-${result.id || "latest"}.txt`;
    anchor.click();
    URL.revokeObjectURL(href);
    toast.success("Report downloaded");
  };
  return (
    <Button variant="secondary" onClick={download}>
      <FileDown className="size-4" /> Download report
    </Button>
  );
}

function HistoryView({ result }: { result: AnalysisResult }) {
  const sessionId = getSessionId();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    fetch(`/api/history?sessionId=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((payload) => setHistory(payload.items ?? []))
      .catch(() => toast.error("Could not load history"))
      .finally(() => setLoading(false));
  };

  useEffect(load, [sessionId]);

  const toggleView = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const response = await fetch(
        `/api/analysis/${id}?sessionId=${encodeURIComponent(sessionId)}`,
      );
      const payload = await response.json();
      if (!response.ok || !payload.success)
        throw new Error(payload.error || "Could not load analysis");
      setDetail(payload);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load analysis");
    } finally {
      setDetailLoading(false);
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(
        `/api/history/${id}?sessionId=${encodeURIComponent(sessionId)}`,
        { method: "DELETE" },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Delete failed");
      setHistory((current) => current.filter((item) => item.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
        setDetail(null);
      }
      toast.success("Analysis deleted");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PageIntro
        eyebrow="Review trail"
        title="Analysis history"
        detail="Every run is stored against this private browser session."
      />
      <div className="ts-panel overflow-hidden rounded-xl">
        <div className="hidden grid-cols-[1fr_120px_120px_100px_140px] gap-4 border-b border-line bg-panel-soft px-5 py-3 ts-label md:grid">
          <span>Analysis</span>
          <span>Input</span>
          <span>Verdict</span>
          <span>Risk</span>
          <span>Actions</span>
        </div>
        {loading ? (
          <div className="grid place-items-center px-6 py-10 text-sm text-ink-soft">
            <Loader2 className="mr-2 size-4 animate-spin" /> Loading history…
          </div>
        ) : history.length ? (
          history.map((item) => (
            <div key={item.id}>
              <div className="grid gap-2 border-b border-line px-5 py-4 md:grid-cols-[1fr_120px_120px_100px_140px] md:items-center">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{item.input_text}</p>
                  <p className="mt-1 text-xs text-ink-soft">
                    {formatDate(item.created_at)} · {item.id.slice(0, 8)}
                  </p>
                </div>
                <span className="text-xs text-ink-soft">{item.input_type}</span>
                <Badge tone={riskTone(item.verdict as Verdict)}>{item.verdict}</Badge>
                <Badge tone={riskTone(item.overall_risk as RiskLevel)}>{item.overall_risk}</Badge>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => toggleView(item.id)}>
                    {expandedId === item.id ? "Hide" : "View"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={deletingId === item.id}
                    onClick={() => remove(item.id)}
                    aria-label="Delete analysis"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Trash2 className="size-4 text-risk" />
                    )}
                  </Button>
                </div>
              </div>
              {expandedId === item.id && (
                <div className="border-b border-line bg-panel-soft px-5 py-4">
                  {detailLoading ? (
                    <p className="flex items-center gap-2 text-sm text-ink-soft">
                      <Loader2 className="size-4 animate-spin" /> Loading full analysis…
                    </p>
                  ) : detail ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="ts-label">Summary</p>
                        <p className="mt-1 text-sm leading-6 text-ink">
                          {String(
                            (detail["analysis"] as Record<string, unknown> | undefined)?.[
                              "summary"
                            ] ?? "—",
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="ts-label">
                          Claims ({(detail["claims"] as unknown[] | undefined)?.length ?? 0})
                        </p>
                        <div className="mt-1 space-y-1">
                          {((detail["claims"] as { claim_text: string }[] | undefined) ?? []).map(
                            (claim, index) => (
                              <p key={index} className="text-xs text-ink-soft">
                                {claim.claim_text}
                              </p>
                            ),
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="ts-label">
                          Evidence ({(detail["evidence"] as unknown[] | undefined)?.length ?? 0})
                        </p>
                        <div className="mt-1 space-y-1">
                          {((detail["evidence"] as { title: string }[] | undefined) ?? []).map(
                            (evidenceItem, index) => (
                              <p key={index} className="text-xs text-ink-soft">
                                {evidenceItem.title}
                              </p>
                            ),
                          )}
                          {!(detail["evidence"] as unknown[] | undefined)?.length && (
                            <p className="text-xs text-ink-soft">
                              No trusted evidence was retrieved for this run.
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="ts-label">Model results</p>
                        <div className="mt-1 space-y-1">
                          {(
                            (detail["models"] as
                              { model_name: string; status: string }[] | undefined) ?? []
                          ).map((model, index) => (
                            <p key={index} className="text-xs text-ink-soft">
                              {model.model_name}: {model.status}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-ink-soft">Could not load this analysis.</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <EmptyState
            icon={HistoryIcon}
            title="No analyses yet"
            detail="Run your first analysis from the dashboard to create a review trail."
          />
        )}
      </div>
      {result.id && (
        <p className="mt-3 text-xs text-ink-soft">
          Tip: the current unsaved analysis on the dashboard doesn't appear here until you run it —
          history reflects saved runs only.
        </p>
      )}
    </>
  );
}

function EvidenceView() {
  const sessionId = getSessionId();
  const [items, setItems] = useState<EvidenceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/evidence?sessionId=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((payload) => setItems(payload.items ?? []))
      .catch(() => toast.error("Could not load evidence"))
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <>
      <PageIntro
        eyebrow="Source ledger"
        title="Evidence"
        detail="Only indexed source chunks appear here. Nothing is fabricated for a demo."
      />
      {loading ? (
        <div className="grid place-items-center px-6 py-10 text-sm text-ink-soft">
          <Loader2 className="mr-2 size-4 animate-spin" /> Loading evidence…
        </div>
      ) : items.length ? (
        <div className="ts-panel divide-y divide-line rounded-xl">
          {items.map((item) => (
            <div key={item.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs text-ink-soft">
                    {item.organization ?? "Unknown organization"} ·{" "}
                    {item.page_number ? `Page ${item.page_number}` : "Page not supplied"} ·{" "}
                    {formatDate(item.created_at)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Badge tone="lime">
                    {Math.round((item.similarity_score ?? 0) * 100)}% overlap
                  </Badge>
                  <Badge tone="cobalt">BM25 {(item.bm25_score ?? 0).toFixed(2)}</Badge>
                </div>
              </div>
              <p className="mt-3 text-sm leading-6 text-ink-soft">{item.text_chunk}</p>
              {item.source_url && (
                <a
                  href={item.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-cyan hover:underline"
                >
                  View source <ArrowUpRight className="size-3" />
                </a>
              )}
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Search}
          title="Evidence retrieval is waiting"
          detail="Analyze a claim after uploading trusted source documents to populate this ledger."
        />
      )}
    </>
  );
}

function KnowledgeBaseView() {
  const sessionId = getSessionId();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [organization, setOrganization] = useState("");
  const [title, setTitle] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadDocuments = () => {
    setLoadingDocs(true);
    fetch(`/api/documents?sessionId=${encodeURIComponent(sessionId)}`)
      .then((response) => response.json())
      .then((payload) => setDocuments(payload.items ?? []))
      .catch(() => toast.error("Could not load documents"))
      .finally(() => setLoadingDocs(false));
  };

  useEffect(loadDocuments, [sessionId]);

  const upload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append("file", file);
    form.append("sessionId", sessionId);
    if (organization.trim()) form.append("organization", organization.trim());
    if (title.trim()) form.append("title", title.trim());
    try {
      const response = await fetch("/api/upload-document", { method: "POST", body: form });
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error);
      toast.success(payload.message);
      setTitle("");
      loadDocuments();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const remove = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(
        `/api/documents/${id}?sessionId=${encodeURIComponent(sessionId)}`,
        { method: "DELETE" },
      );
      const payload = await response.json();
      if (!response.ok || !payload.success) throw new Error(payload.error || "Delete failed");
      setDocuments((current) => current.filter((doc) => doc.id !== id));
      toast.success("Document removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <PageIntro
        eyebrow="Admin workspace"
        title="Knowledge base"
        detail="Stage trusted PDF, TXT, and DOCX sources for extraction, chunking, and keyword indexing."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="ts-panel rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="ts-label">Indexed sources</p>
              <h2 className="ts-display mt-2 text-xl font-semibold text-ink">
                Your trusted library
              </h2>
            </div>
            <Badge
              tone={documents.some((doc) => doc.embedding_status === "chunked") ? "lime" : "amber"}
            >
              {documents.length} document(s)
            </Badge>
          </div>
          {loadingDocs ? (
            <div className="grid place-items-center px-6 py-10 text-sm text-ink-soft">
              <Loader2 className="mr-2 size-4 animate-spin" /> Loading library…
            </div>
          ) : documents.length ? (
            <div className="mt-4 divide-y divide-line">
              {documents.map((doc) => {
                const status = documentStatusLabel(doc.embedding_status);
                return (
                  <div key={doc.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{doc.title}</p>
                      <p className="mt-1 text-xs text-ink-soft">
                        {doc.organization ?? "No organization set"} · {doc.chunk_count} chunk(s) ·{" "}
                        {formatDate(doc.created_at)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge tone={status.tone}>{status.label}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={deletingId === doc.id}
                        onClick={() => remove(doc.id)}
                        aria-label="Remove document"
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4 text-risk" />
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No documents indexed"
              detail="Upload official circulars, notifications, or scheme documents below. TXT and DOCX are chunked and keyword-indexed immediately; PDF text extraction isn't wired up yet."
            />
          )}
        </div>
        <div className="ts-panel rounded-xl p-6">
          <UploadCloud className="size-7 text-cyan" />
          <h2 className="ts-display mt-4 text-lg font-semibold text-ink">Add trusted document</h2>
          <p className="mt-2 text-sm leading-6 text-ink-soft">
            Files are limited to 10 MB. No uploaded file is executed.
          </p>
          <div className="mt-4 space-y-3">
            <label className="block space-y-1">
              <span className="ts-label">Organization (optional)</span>
              <input
                value={organization}
                onChange={(event) => setOrganization(event.target.value)}
                placeholder="RBI, SEBI, Government of India…"
                className="h-10 w-full rounded-lg border border-line bg-panel-soft px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-cyan"
              />
            </label>
            <label className="block space-y-1">
              <span className="ts-label">Title override (optional)</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Defaults to the file name"
                className="h-10 w-full rounded-lg border border-line bg-panel-soft px-3 text-sm text-ink outline-none focus:ring-2 focus:ring-cyan"
              />
            </label>
          </div>
          <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-cyan bg-cyan/10 px-4 py-3 text-sm font-semibold text-ink hover:bg-cyan/15">
            {uploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <UploadCloud className="size-4" />
            )}{" "}
            {uploading ? "Staging..." : "Choose file"}
            <input type="file" accept=".txt,.pdf,.docx" className="hidden" onChange={upload} />
          </label>
        </div>
      </div>
    </>
  );
}

function ReportsView({ result }: { result: AnalysisResult }) {
  return (
    <>
      <PageIntro
        eyebrow="Exports"
        title="Reports"
        detail="Download the latest verification report from the analysis workspace."
      />
      {result.id ? (
        <div className="ts-panel flex flex-col justify-between gap-5 rounded-xl p-6 md:flex-row md:items-center">
          <div>
            <p className="ts-label">Latest report</p>
            <h2 className="ts-display mt-2 text-xl font-semibold text-ink">
              {result.verdict} · {result.risks.overall} risk
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              {formatDate(result.createdAt)} · {result.claims.length} claim(s)
            </p>
          </div>
          <DownloadReport result={result} />
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="No report ready"
          detail="Run an analysis to generate a downloadable verification report."
        />
      )}
    </>
  );
}

function SettingsView() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  useEffect(() => {
    fetch("/api/status")
      .then((response) => response.json())
      .then(setStatus)
      .catch(() => undefined);
  }, []);
  return (
    <>
      <PageIntro
        eyebrow="Configuration"
        title="Settings"
        detail="Model and pipeline status for this academic demonstration."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="ts-panel rounded-xl p-6">
          <p className="ts-label">Generation model</p>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="ts-display text-xl font-semibold text-ink">
              {status?.qwenModel ?? "Qwen3-8B"}
            </h2>
            <Badge tone={status?.qwen ? "lime" : "amber"}>
              {status?.qwen ? "Connected" : "Unavailable"}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            {status?.qwen
              ? "Qwen3-8B is configured and will reason over retrieved evidence for claim verification."
              : "Model unavailable — configure QWEN_API_URL and QWEN_API_KEY to enable evidence-grounded reasoning and natural-language summaries."}
          </p>
        </div>
        <div className="ts-panel rounded-xl p-6">
          <p className="ts-label">Independent reviewer</p>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="ts-display text-xl font-semibold text-ink">
              {status?.llamaModel ?? "Llama 3.1 8B"}
            </h2>
            <Badge tone={status?.llama ? "lime" : "amber"}>
              {status?.llama ? "Connected" : "Unavailable"}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            {status?.llama
              ? "Llama 3.1 8B is configured and independently reviews Qwen3-8B's verdict against the same retrieved evidence before the decision engine finalizes a verdict."
              : "Reviewer unavailable — configure LLAMA_API_URL and LLAMA_API_KEY to enable the independent second-LLM review. Without it, the decision engine falls back to Qwen3-8B's verdict alone."}
          </p>
        </div>
        <div className="ts-panel rounded-xl p-6">
          <p className="ts-label">Retrieval stack</p>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="ts-display text-xl font-semibold text-ink">BM25 + keyword overlap</h2>
            <Badge tone={status?.cloudDatabase ? "lime" : "amber"}>
              {status?.cloudDatabase ? "Active" : "Waiting"}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            Trusted documents are chunked and keyword-indexed on upload. Vector/semantic search will
            use Sentence-BERT once it is connected — until then similarity is a bounded
            token-overlap proxy, and BM25 is the primary retrieval signal.
          </p>
        </div>
        <div className="ts-panel rounded-xl p-6">
          <p className="ts-label">Cloud database</p>
          <div className="mt-3 flex items-center justify-between">
            <h2 className="ts-display text-xl font-semibold text-ink">MySQL</h2>
            <Badge tone={status?.cloudDatabase ? "lime" : "amber"}>
              {status?.cloudDatabase ? "Connected" : "Not connected"}
            </Badge>
          </div>
          <p className="mt-3 text-sm leading-6 text-ink-soft">
            Stores analyses, claims, risk scores, evidence, and the trusted-document knowledge base,
            scoped per browser session.
          </p>
        </div>
      </div>
    </>
  );
}

function SimpleView({
  view,
  result,
}: {
  view: Exclude<ViewName, "dashboard">;
  result: AnalysisResult;
}) {
  if (view === "history") return <HistoryView result={result} />;
  if (view === "evidence") return <EvidenceView />;
  if (view === "knowledge") return <KnowledgeBaseView />;
  if (view === "reports") return <ReportsView result={result} />;
  return <SettingsView />;
}
function PageIntro({ eyebrow, title, detail }: { eyebrow: string; title: string; detail: string }) {
  return (
    <div className="mb-8">
      <p className="ts-label mb-2">{eyebrow}</p>
      <h1 className="ts-display text-4xl font-semibold tracking-tight text-ink">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-soft">{detail}</p>
    </div>
  );
}
function EmptyState({
  icon: Icon,
  title,
  detail,
}: {
  icon: typeof Search;
  title: string;
  detail: string;
}) {
  return (
    <div className="grid min-h-64 place-items-center px-6 py-10 text-center">
      <Icon className="mb-3 size-8 text-ink-soft" />
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mt-1 max-w-sm text-xs leading-5 text-ink-soft">{detail}</p>
    </div>
  );
}

export function TrustShieldApp({ view }: { view: ViewName }) {
  const [result, setResult] = useState<AnalysisResult>(defaultResult);
  const navigate = useNavigate();
  return (
    <Shell view={view}>
      {view === "dashboard" ? (
        <AnalysisView result={result} setResult={setResult} />
      ) : (
        <SimpleView view={view} result={result} />
      )}
      {view !== "dashboard" && (
        <div className="mt-8">
          <Button variant="outline" onClick={() => navigate({ to: "/" })}>
            <LayoutDashboard className="size-4" /> Back to dashboard
          </Button>
        </div>
      )}
    </Shell>
  );
}
