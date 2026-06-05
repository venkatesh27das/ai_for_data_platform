import {
  ArrowRight,
  Box,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Circle,
  ClipboardList,
  Database,
  File,
  FileText,
  Home,
  Info,
  Link2,
  Loader2,
  Play,
  RefreshCcw,
  Search,
  Settings,
  TableProperties,
  UploadCloud,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, DragEvent, ReactNode } from "react";

import {
  api,
  ChunksResponse,
  DocumentRecord,
  ExtractionsResponse,
  GraphResponse,
  SearchResponse,
  StatusResponse,
} from "./api";

type HealthState = "checking" | "ok" | "error";
type View = "home" | "documents" | "query" | "settings";
type AssetView = "vector" | "graph" | "table";

const defaultApiBase = "http://localhost:8000";

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function documentKind(document: DocumentRecord) {
  const kind = document.file_type || document.file_name.split(".").pop() || "file";
  return kind.toUpperCase();
}

function documentStatusLabel(status: string) {
  const normalized = status.toLowerCase();
  if (["succeeded", "partial"].includes(normalized)) return "Processed";
  if (["running", "retryable", "requires_review"].includes(normalized)) return "Processing";
  if (normalized === "failed") return "Failed";
  return "Queued";
}

function statusTone(status: string) {
  const normalized = status.toLowerCase();
  if (["processed", "succeeded", "partial", "available"].includes(normalized)) return "good";
  if (["failed", "unavailable"].includes(normalized)) return "bad";
  if (["queued", "pending"].includes(normalized)) return "queued";
  return "active";
}

function scoreText(value: unknown, fallback = 0.88) {
  if (typeof value === "number") return value.toFixed(2);
  return fallback.toFixed(2);
}

function resultText(result: Record<string, unknown>) {
  return String(result.text ?? result.source_text ?? result.canonical_name ?? result.name ?? "");
}

function resultPage(result: Record<string, unknown>) {
  const pages = result.page_numbers;
  if (Array.isArray(pages) && pages.length > 0) return `Page ${pages.join(", ")}`;
  if (typeof result.page_number === "number") return `Page ${result.page_number}`;
  return "Evidence";
}

function nodeLabel(node: Record<string, unknown>) {
  const props = (node.properties ?? {}) as Record<string, unknown>;
  return String(props.name ?? props.canonical_name ?? node.label ?? node.id ?? "Entity");
}

function StatusPill({ status }: { status: string }) {
  const label = documentStatusLabel(status);
  return (
    <span className={`status-pill ${statusTone(label)}`}>
      <Circle size={9} fill="currentColor" />
      {label}
    </span>
  );
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button className="primary-button" disabled={disabled} onClick={onClick} type="button">
      {children}
    </button>
  );
}

function DocumentIcon({ kind }: { kind: string }) {
  const isDocx = kind.toLowerCase() === "docx";
  return (
    <span className={`document-icon ${isDocx ? "docx" : "pdf"}`}>
      <FileText size={18} />
    </span>
  );
}

function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: number | string }) {
  return (
    <section className="stat-tile">
      <span>{icon}</span>
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function SelectChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <button className="select-chip" type="button">
      {icon}
      {label}
      <ChevronDown size={14} />
    </button>
  );
}

function GraphPreview({
  document,
  graph,
  extractions,
}: {
  document: DocumentRecord | null;
  graph: GraphResponse | null;
  extractions: ExtractionsResponse | null;
}) {
  const graphNodes = graph?.nodes ?? [];
  const entityNames =
    graphNodes.length > 0
      ? graphNodes.slice(0, 4).map((node) => nodeLabel(node))
      : (extractions?.entities ?? []).slice(0, 4).map((entity) => entity.canonical_name);
  const center = document?.file_name.split(".")[0].slice(0, 28) ?? "Document";
  const satellites = entityNames.length > 0 ? entityNames : ["Vector Store", "Entities", "Fields"];

  return (
    <div className="graph-canvas" aria-label="Graph preview">
      <div className="graph-line vertical" />
      <div className="graph-line left" />
      <div className="graph-line right" />
      <div className="graph-node center">{center}</div>
      {satellites.slice(0, 4).map((label, index) => (
        <div className={`graph-node satellite s${index + 1}`} key={`${label}-${index}`}>
          {label}
        </div>
      ))}
    </div>
  );
}

function VectorMatches({
  chunks,
  vector,
}: {
  chunks: ChunksResponse | null;
  vector: SearchResponse | null;
}) {
  const vectorResults = vector?.results ?? [];
  const matches =
    vectorResults.length > 0
      ? vectorResults.slice(0, 3).map((result, index) => ({
          id: String(result.chunk_id ?? result.point_id ?? index),
          text: resultText(result),
          page: resultPage(result),
          score: scoreText(result.score, 0.92 - index * 0.04),
        }))
      : (chunks?.chunks ?? []).slice(0, 3).map((chunk, index) => ({
          id: chunk.chunk_id,
          text: chunk.text,
          page:
            chunk.page_numbers_json.length > 0
              ? `Page ${chunk.page_numbers_json.join(", ")}`
              : "Chunk",
          score: scoreText(chunk.quality_score, 0.92 - index * 0.04),
        }));

  if (matches.length === 0) return <EmptyState>No vector chunks are available yet.</EmptyState>;

  return (
    <div className="match-list">
      {matches.map((match) => (
        <article className="match-row" key={match.id}>
          <Circle size={6} fill="currentColor" />
          <div>
            <p>{match.text}</p>
            <span>{match.page}</span>
          </div>
          <strong>{match.score}</strong>
        </article>
      ))}
    </div>
  );
}

function StructuredTable({ extractions }: { extractions: ExtractionsResponse | null }) {
  const fields = extractions?.fields ?? [];
  if (fields.length === 0) return <EmptyState>No structured fields are available yet.</EmptyState>;

  return (
    <table className="structured-table">
      <thead>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {fields.slice(0, 8).map((field) => (
          <tr key={field.id}>
            <td>{humanize(field.field_name)}</td>
            <td>{field.value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function App() {
  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [health, setHealth] = useState<HealthState>("checking");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [chunks, setChunks] = useState<ChunksResponse | null>(null);
  const [extractions, setExtractions] = useState<ExtractionsResponse | null>(null);
  const [graph, setGraph] = useState<GraphResponse | null>(null);
  const [vector, setVector] = useState<SearchResponse | null>(null);
  const [graphSearch, setGraphSearch] = useState<SearchResponse | null>(null);
  const [view, setView] = useState<View>("home");
  const [assetView, setAssetView] = useState<AssetView>("vector");
  const [query, setQuery] = useState("");
  const [processingOptions, setProcessingOptions] = useState({
    vectors: true,
    graph: true,
    table: true,
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const selected = useMemo(
    () => documents.find((document) => document.id === selectedId) ?? null,
    [documents, selectedId],
  );

  const ready = health === "ok";
  const topScore = vector?.results[0]?.score;
  const pageCount = useMemo(() => {
    const pages = new Set<number>();
    for (const chunk of chunks?.chunks ?? []) {
      for (const page of chunk.page_numbers_json) pages.add(page);
    }
    return pages.size || "-";
  }, [chunks]);
  const answerText =
    vector?.results.length && query.trim()
      ? `The strongest matching evidence for "${query.trim()}" is shown below. Review the cited chunks, graph context, and structured fields before treating it as a final answer.`
      : "Run a query to combine vector matches, graph context, and structured fields.";

  async function refresh() {
    setBusy(true);
    setMessage("");
    try {
      const [readyResult, docs] = await Promise.all([api.ready(apiBase), api.listDocuments(apiBase)]);
      setHealth(readyResult.status === "ready" ? "ok" : "error");
      setDocuments(docs);
      if (!selectedId && docs.length > 0) setSelectedId(docs[0].id);
    } catch (error) {
      setHealth("error");
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadDocumentAssets(documentId: string) {
    setBusy(true);
    setMessage("");
    try {
      const [nextStatus, nextChunks, nextExtractions, nextGraph] = await Promise.all([
        api.status(apiBase, documentId),
        api.chunks(apiBase, documentId),
        api.extractions(apiBase, documentId),
        api.graph(apiBase, documentId),
      ]);
      setStatus(nextStatus);
      setChunks(nextChunks);
      setExtractions(nextExtractions);
      setGraph(nextGraph);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Document asset request failed");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFileList(files: File[]) {
    if (files.length === 0) return;
    setBusy(true);
    setMessage("");
    try {
      let lastUploaded: DocumentRecord | null = null;
      for (const file of files) {
        const result = await api.upload(apiBase, file);
        lastUploaded = result.document;
      }
      await refresh();
      if (lastUploaded) {
        setSelectedId(lastUploaded.id);
        await loadDocumentAssets(lastUploaded.id);
      }
      setMessage(`${files.length} file${files.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    await uploadFileList(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  async function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    await uploadFileList(Array.from(event.dataTransfer.files ?? []));
  }

  async function runSelected() {
    if (!selected) {
      setMessage("Upload or select a document first.");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const result = await api.process(apiBase, selected.id);
      setMessage(result.message);
      await refresh();
      await loadDocumentAssets(selected.id);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Process request failed");
    } finally {
      setBusy(false);
    }
  }

  async function runQuery() {
    if (!query.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      const [nextVector, nextGraph] = await Promise.all([
        api.vectorSearch(apiBase, query.trim()),
        api.graphSearch(apiBase, query.trim()),
      ]);
      setVector(nextVector);
      setGraphSearch(nextGraph);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Query failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (selectedId) void loadDocumentAssets(selectedId);
  }, [selectedId]);

  return (
    <main className="lab-shell">
      <aside className="sidebar">
        <div className="sidebar-spacer" />
        {[
          ["home", <Home size={22} />, "Home"],
          ["documents", <FileText size={22} />, "Documents"],
          ["query", <Search size={22} />, "Query"],
          ["settings", <Settings size={22} />, "Settings"],
        ].map(([key, icon, label]) => (
          <button
            className={`nav-item ${view === key ? "active" : ""}`}
            key={String(key)}
            onClick={() => setView(key as View)}
            type="button"
          >
            {icon}
            {label}
          </button>
        ))}
      </aside>

      <section className="main-column">
        <header className="lab-header">
          <h1>Doc Test Lab</h1>
          <div className="header-actions">
            {busy && (
              <span className="working-label">
                <Loader2 size={16} /> Working
              </span>
            )}
            <span className={`ready-pill ${ready ? "ok" : "error"}`}>
              <Circle size={9} fill="currentColor" />
              {ready ? "Local System Ready" : "System Not Ready"}
            </span>
          </div>
        </header>

        {message && (
          <div className="message-bar">
            <Info size={16} />
            {message}
          </div>
        )}

        <section className="content">
          {view === "home" && (
            <>
              <h2>Upload & Process</h2>
              <section className="upload-grid">
                <label
                  className="drop-zone"
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={handleDrop}
                >
                  <UploadCloud size={58} />
                  <strong>Drag and drop a file here</strong>
                  <span>Upload PDF or DOCX</span>
                  <span className="choose-button">Choose File</span>
                  <input accept=".pdf,.docx" multiple onChange={uploadFiles} type="file" />
                </label>

                <section className="options-panel">
                  <h3>Processing Options</h3>
                  {[
                    ["vectors", "Create vector store"],
                    ["graph", "Build graph"],
                    ["table", "Create structured table"],
                  ].map(([key, label]) => (
                    <label className="check-row" key={key}>
                      <input
                        checked={processingOptions[key as keyof typeof processingOptions]}
                        onChange={(event) =>
                          setProcessingOptions((current) => ({
                            ...current,
                            [key]: event.target.checked,
                          }))
                        }
                        type="checkbox"
                      />
                      {label}
                    </label>
                  ))}
                  <div className="panel-rule" />
                  <PrimaryButton disabled={busy} onClick={runSelected}>
                    <Play size={18} fill="currentColor" />
                    Start Processing
                  </PrimaryButton>
                </section>
              </section>

              <section className="documents-section">
                <h2>Documents</h2>
                <div className="document-table-wrap">
                  <table className="document-table">
                    <thead>
                      <tr>
                        <th>Document</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th>Updated</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents.map((document) => (
                        <tr key={document.id}>
                          <td>
                            <button
                              className="document-name-button"
                              onClick={() => {
                                setSelectedId(document.id);
                                setView("documents");
                              }}
                              type="button"
                            >
                              <DocumentIcon kind={documentKind(document)} />
                              {document.file_name}
                            </button>
                          </td>
                          <td>{documentKind(document)}</td>
                          <td>
                            <StatusPill status={document.status} />
                          </td>
                          <td>{formatDate(document.updated_at)}</td>
                          <td>
                            <button
                              className="open-button"
                              onClick={() => {
                                setSelectedId(document.id);
                                setView("documents");
                              }}
                              type="button"
                            >
                              Open
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {documents.length === 0 && <EmptyState>No documents uploaded yet.</EmptyState>}
                  <div className="table-note">
                    <Info size={16} />
                    Select a document to explore assets and query results.
                  </div>
                </div>
              </section>
            </>
          )}

          {view === "documents" && (
            <>
              <div className="detail-topline">
                <button className="breadcrumb" onClick={() => setView("home")} type="button">
                  <ChevronLeft size={18} />
                  Documents
                </button>
                <span>/</span>
                <strong>{selected?.file_name ?? "Select a document"}</strong>
                {selected && <StatusPill status={selected.status} />}
              </div>

              <section className="query-card compact">
                <label>Ask this document</label>
                <div className="query-line">
                  <input
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void runQuery();
                    }}
                    placeholder="What is the invoice amount?"
                    value={query}
                  />
                  <PrimaryButton disabled={busy || !query.trim()} onClick={runQuery}>
                    <Play size={18} fill="currentColor" />
                    Run Query
                  </PrimaryButton>
                </div>
              </section>

              <nav className="asset-tabs">
                {[
                  ["vector", "Vector Store"],
                  ["graph", "Graph"],
                  ["table", "Structured Table"],
                ].map(([key, label]) => (
                  <button
                    className={assetView === key ? "active" : ""}
                    key={key}
                    onClick={() => setAssetView(key as AssetView)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </nav>

              <section className="asset-grid">
                <article className={`asset-card ${assetView === "vector" ? "featured" : ""}`}>
                  <header>
                    <h3>
                      <Database size={22} />
                      Vector Store
                    </h3>
                    <span className="mini-badge">Top Matches</span>
                  </header>
                  <VectorMatches chunks={chunks} vector={vector} />
                  <button className="link-button" onClick={() => setView("query")} type="button">
                    View all matches <ArrowRight size={16} />
                  </button>
                </article>

                <article className={`asset-card ${assetView === "graph" ? "featured" : ""}`}>
                  <header>
                    <h3>
                      <Link2 size={22} />
                      Graph Preview
                    </h3>
                  </header>
                  <GraphPreview document={selected} extractions={extractions} graph={graph} />
                  <button className="link-button" onClick={() => setView("query")} type="button">
                    Open full graph <ArrowRight size={16} />
                  </button>
                </article>

                <article className={`asset-card ${assetView === "table" ? "featured" : ""}`}>
                  <header>
                    <h3>
                      <TableProperties size={22} />
                      Structured Table
                    </h3>
                  </header>
                  <StructuredTable extractions={extractions} />
                  <button className="link-button" onClick={() => setView("query")} type="button">
                    View full table <ArrowRight size={16} />
                  </button>
                </article>
              </section>

              <section className="stats-row">
                <StatTile
                  icon={<File size={22} />}
                  label="Pages"
                  value={pageCount}
                />
                <StatTile icon={<Box size={22} />} label="Chunks" value={chunks?.chunks.length ?? 0} />
                <StatTile
                  icon={<Users size={22} />}
                  label="Entities"
                  value={extractions?.entities.length ?? 0}
                />
                <StatTile
                  icon={<Link2 size={22} />}
                  label="Relationships"
                  value={extractions?.relationships.length ?? graph?.edges.length ?? 0}
                />
              </section>
            </>
          )}

          {view === "query" && (
            <>
              <section className="query-card">
                <label>Query Workspace</label>
                <div className="query-line">
                  <input
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") void runQuery();
                    }}
                    placeholder="What are the payment terms in vendor_contract.docx?"
                    value={query}
                  />
                  <PrimaryButton disabled={busy || !query.trim()} onClick={runQuery}>
                    <Play size={18} fill="currentColor" />
                    Run Query
                  </PrimaryButton>
                </div>
                <div className="query-filters">
                  <SelectChip icon={<ClipboardList size={15} />} label="Scope: All Documents" />
                  <SelectChip icon={<Settings size={15} />} label="Source: Vector + Graph + Table" />
                  <SelectChip
                    icon={<FileText size={15} />}
                    label={`Document: ${selected?.file_name ?? "Any"}`}
                  />
                </div>
              </section>

              <section className="query-metrics">
                <StatTile
                  icon={<Database size={24} />}
                  label="Answer Source"
                  value={`${vector?.results.length ?? 0} sources found`}
                />
                <StatTile icon={<Search size={24} />} label="Top Match Score" value={scoreText(topScore, 0)} />
                <StatTile
                  icon={<Users size={24} />}
                  label="Entities Found"
                  value={graphSearch?.results.length ?? extractions?.entities.length ?? 0}
                />
                <StatTile
                  icon={<Link2 size={24} />}
                  label="Relationships Found"
                  value={extractions?.relationships.length ?? graph?.edges.length ?? 0}
                />
              </section>

              <section className="query-results-grid">
                <article className="answer-panel">
                  <h3>Answer</h3>
                  <p>{answerText}</p>

                  <h4>Citations</h4>
                  <div className="citation-list">
                    {(vector?.results ?? []).slice(0, 3).map((result, index) => (
                      <div className="citation-row" key={`${result.point_id ?? index}`}>
                        <FileText size={16} />
                        {resultPage(result)} · {String(result.file_name ?? "Vector result")}
                      </div>
                    ))}
                    {!vector?.results.length && (
                      <div className="citation-row muted">
                        <FileText size={16} />
                        No citations yet
                      </div>
                    )}
                  </div>

                  <h4>Top Matches</h4>
                  <VectorMatches chunks={chunks} vector={vector} />
                </article>

                <div className="side-stack">
                  <article className="asset-card graph-context">
                    <h3>Graph Context</h3>
                    <GraphPreview document={selected} extractions={extractions} graph={graph} />
                  </article>
                  <article className="asset-card">
                    <h3>Structured Result</h3>
                    <StructuredTable extractions={extractions} />
                  </article>
                </div>
              </section>

              <section className="trace-panel">
                <h3>Query Trace</h3>
                <div className="trace-steps">
                  {[
                    "Search vector store",
                    "Read graph context",
                    "Read structured table",
                    "Generate final answer",
                  ].map((step, index) => (
                    <div className="trace-step" key={step}>
                      <strong>{index + 1}</strong>
                      <span>{step}</span>
                      <CheckCircle2 size={18} fill="currentColor" />
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {view === "settings" && (
            <section className="settings-panel">
              <h2>Settings</h2>
              <label>
                API Base URL
                <input onChange={(event) => setApiBase(event.target.value)} value={apiBase} />
              </label>
              <PrimaryButton disabled={busy} onClick={refresh}>
                <RefreshCcw size={18} />
                Refresh Connection
              </PrimaryButton>
              <p>
                The test app uses the local FastAPI service for uploads, processing, vector search,
                graph projection, and structured extraction previews.
              </p>
            </section>
          )}
        </section>
      </section>
    </main>
  );
}
