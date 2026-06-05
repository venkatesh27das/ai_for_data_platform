import {
  AlertCircle,
  Boxes,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  GitFork,
  Layers3,
  Loader2,
  Play,
  RefreshCcw,
  Search,
  TableProperties,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

import {
  api,
  ArtifactRecord,
  ArtifactsResponse,
  ChunksResponse,
  DocumentRecord,
  ProjectionResponse,
  SearchResponse,
  StatusResponse,
} from "./api";

type HealthState = "checking" | "ok" | "error";
type AssetTab = "overview" | "artifacts" | "chunks" | "search" | "trace";

const defaultApiBase = "http://localhost:8000";

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function shortId(value: string) {
  return value.slice(0, 8);
}

function humanize(value: string) {
  return value.replace(/_/g, " ");
}

function fileNameFromUri(value: string) {
  const parts = value.split("/");
  return parts[parts.length - 1] ?? value;
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  return <span className={`pill ${normalized}`}>{status}</span>;
}

function EmptyState({ children }: { children: ReactNode }) {
  return <div className="empty-state">{children}</div>;
}

function MetricCard({
  icon,
  label,
  value,
  state,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  state?: "good" | "muted" | "warn";
}) {
  return (
    <section className={`metric-card ${state ?? ""}`}>
      <span className="metric-icon">{icon}</span>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function ArtifactList({ artifacts }: { artifacts: ArtifactsResponse | null }) {
  if (!artifacts || artifacts.artifacts.length === 0) {
    return <EmptyState>No artifacts are available for this document.</EmptyState>;
  }

  const grouped = artifacts.artifacts.reduce<Record<string, ArtifactRecord[]>>((groups, artifact) => {
    groups[artifact.artifact_type] = [...(groups[artifact.artifact_type] ?? []), artifact];
    return groups;
  }, {});

  return (
    <div className="asset-groups">
      {Object.entries(grouped).map(([type, records]) => (
        <section className="asset-group" key={type}>
          <div className="group-head">
            <strong>{humanize(type)}</strong>
            <span>{records.length}</span>
          </div>
          <div className="asset-rows">
            {records.map((artifact) => (
              <div className="asset-row" key={artifact.id}>
                <div>
                  <strong>{fileNameFromUri(artifact.uri)}</strong>
                  <span>{artifact.media_type}</span>
                </div>
                <code>{artifact.uri}</code>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ChunkExplorer({ chunks }: { chunks: ChunksResponse | null }) {
  if (!chunks || chunks.chunks.length === 0) {
    return <EmptyState>No chunks have been generated yet.</EmptyState>;
  }

  return (
    <div className="chunk-list">
      {chunks.chunks.map((chunk) => (
        <article className="chunk-card" key={chunk.chunk_id}>
          <header>
            <div>
              <strong>{chunk.chunk_id}</strong>
              <span>{chunk.chunk_type}</span>
            </div>
            <div className="page-list">
              {chunk.page_numbers_json.map((page) => (
                <span key={page}>p.{page}</span>
              ))}
            </div>
          </header>
          {chunk.section_path_json.length > 0 && (
            <div className="section-path">{chunk.section_path_json.join(" / ")}</div>
          )}
          <p>{chunk.text}</p>
          <footer>
            <span>{chunk.source_element_ids_json.length} source element(s)</span>
            {chunk.quality_score !== null && <span>quality {chunk.quality_score}</span>}
          </footer>
        </article>
      ))}
    </div>
  );
}

function ProjectionNotice({ projection }: { projection: ProjectionResponse | null }) {
  if (!projection) return null;
  return (
    <section className="notice-panel">
      <div>
        <strong>{projection.required_phase}</strong>
        <p>{projection.message}</p>
      </div>
    </section>
  );
}

export default function App() {
  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [health, setHealth] = useState<HealthState>("checking");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [artifacts, setArtifacts] = useState<ArtifactsResponse | null>(null);
  const [chunks, setChunks] = useState<ChunksResponse | null>(null);
  const [extractions, setExtractions] = useState<ProjectionResponse | null>(null);
  const [graph, setGraph] = useState<ProjectionResponse | null>(null);
  const [vector, setVector] = useState<SearchResponse | null>(null);
  const [activeTab, setActiveTab] = useState<AssetTab>("overview");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const selected = useMemo(
    () => documents.find((document) => document.id === selectedId) ?? null,
    [documents, selectedId],
  );

  const available = new Set(status?.available_projections ?? []);
  const unavailable = new Set(status?.unavailable_projections ?? []);

  async function refresh() {
    setBusy(true);
    setMessage("");
    try {
      const [healthResult, docs] = await Promise.all([
        api.health(apiBase),
        api.listDocuments(apiBase),
      ]);
      setHealth(healthResult.status === "ok" ? "ok" : "error");
      setDocuments(docs);
      if (!selectedId && docs.length > 0) setSelectedId(docs[0].id);
    } catch (error) {
      setHealth("error");
      setMessage(error instanceof Error ? error.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }

  async function loadProjection(documentId: string) {
    setBusy(true);
    setMessage("");
    try {
      const [nextStatus, nextArtifacts, nextChunks, nextExtractions, nextGraph] =
        await Promise.all([
          api.status(apiBase, documentId),
          api.artifacts(apiBase, documentId),
          api.chunks(apiBase, documentId),
          api.extractions(apiBase, documentId),
          api.graph(apiBase, documentId),
        ]);
      setStatus(nextStatus);
      setArtifacts(nextArtifacts);
      setChunks(nextChunks);
      setExtractions(nextExtractions);
      setGraph(nextGraph);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Projection request failed");
    } finally {
      setBusy(false);
    }
  }

  async function uploadFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
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
        await loadProjection(lastUploaded.id);
      }
      setMessage(`${files.length} file${files.length === 1 ? "" : "s"} uploaded.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed");
    } finally {
      event.target.value = "";
      setBusy(false);
    }
  }

  async function runSelected() {
    if (!selected) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await api.process(apiBase, selected.id);
      setMessage(result.message);
      await refresh();
      await loadProjection(selected.id);
      setActiveTab("overview");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Process request failed");
    } finally {
      setBusy(false);
    }
  }

  async function runVectorSearch() {
    if (!query.trim()) return;
    setBusy(true);
    setMessage("");
    try {
      setVector(await api.vectorSearch(apiBase, query.trim()));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Vector search failed");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    if (selectedId) void loadProjection(selectedId);
  }, [selectedId]);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <h1>DocIntel</h1>
          <div className="subline">
            <span className={`health ${health}`}>
              {health === "ok" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              API {health}
            </span>
            {busy && (
              <span className="loading">
                <Loader2 size={16} /> Working
              </span>
            )}
          </div>
        </div>
        <div className="top-actions">
          <input
            aria-label="API base URL"
            className="api-input"
            onChange={(event) => setApiBase(event.target.value)}
            value={apiBase}
          />
          <button onClick={refresh} title="Refresh" type="button">
            <RefreshCcw size={17} />
          </button>
          <label className="upload-button" title="Upload PDF or DOCX">
            <Upload size={17} />
            <input accept=".pdf,.docx" multiple onChange={uploadFiles} type="file" />
          </label>
          <button disabled={!selected || busy} onClick={runSelected} title="Run" type="button">
            <Play size={17} />
          </button>
        </div>
      </header>

      {message && <div className="toast">{message}</div>}

      <section className="workspace">
        <aside className="document-rail">
          <div className="rail-head">
            <div>
              <strong>Documents</strong>
              <span>{documents.length} total</span>
            </div>
          </div>
          {documents.length === 0 ? (
            <EmptyState>No documents uploaded.</EmptyState>
          ) : (
            <div className="document-rows">
              {documents.map((document) => (
                <button
                  className={`doc-row ${selectedId === document.id ? "selected" : ""}`}
                  key={document.id}
                  onClick={() => {
                    setSelectedId(document.id);
                    setActiveTab("overview");
                  }}
                  type="button"
                >
                  <span className="doc-name">{document.file_name}</span>
                  <span className="doc-meta">
                    {document.file_type.toUpperCase()} · {formatBytes(document.size_bytes)} ·{" "}
                    {shortId(document.id)}
                  </span>
                  <StatusPill status={document.status} />
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="detail">
          {!selected ? (
            <section className="empty-document">
              <FileText size={28} />
              <strong>No document selected</strong>
            </section>
          ) : (
            <>
              <section className="document-header">
                <div>
                  <span className="eyebrow">Selected document</span>
                  <h2>{selected.file_name}</h2>
                  <div className="doc-id">{selected.checksum_sha256}</div>
                </div>
                <StatusPill status={selected.status} />
              </section>

              <section className="metric-grid">
                <MetricCard
                  icon={<Database size={18} />}
                  label="Artifacts"
                  state={artifacts?.status === "available" ? "good" : "muted"}
                  value={`${artifacts?.artifacts.length ?? 0}`}
                />
                <MetricCard
                  icon={<Boxes size={18} />}
                  label="Chunks"
                  state={chunks?.status === "available" ? "good" : "muted"}
                  value={`${chunks?.chunks.length ?? 0}`}
                />
                <MetricCard
                  icon={<Search size={18} />}
                  label="Vector Store"
                  state={available.has("vector_store") ? "good" : "warn"}
                  value={available.has("vector_store") ? "Indexed" : "Pending"}
                />
                <MetricCard
                  icon={<GitFork size={18} />}
                  label="Graph"
                  state={unavailable.has("graph") ? "muted" : "good"}
                  value={unavailable.has("graph") ? "Later" : "Ready"}
                />
              </section>

              <nav className="tabs" aria-label="Asset views">
                {[
                  ["overview", "Overview", <Layers3 size={16} />],
                  ["artifacts", "Artifacts", <Database size={16} />],
                  ["chunks", "Chunks", <Boxes size={16} />],
                  ["search", "Search", <Search size={16} />],
                  ["trace", "Trace", <Clock3 size={16} />],
                ].map(([tab, label, icon]) => (
                  <button
                    className={activeTab === tab ? "active" : ""}
                    key={tab as string}
                    onClick={() => setActiveTab(tab as AssetTab)}
                    type="button"
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </nav>

              <section className="tab-surface">
                {activeTab === "overview" && (
                  <div className="overview-grid">
                    <section className="insight-panel">
                      <h3>Projection Status</h3>
                      <div className="projection-list">
                        {(status?.available_projections ?? []).map((item) => (
                          <span className="projection-chip available" key={item}>
                            {humanize(item)}
                          </span>
                        ))}
                        {(status?.unavailable_projections ?? []).map((item) => (
                          <span className="projection-chip pending" key={item}>
                            {humanize(item)}
                          </span>
                        ))}
                      </div>
                    </section>
                    <section className="insight-panel">
                      <h3>Structured Extraction</h3>
                      <ProjectionNotice projection={extractions} />
                    </section>
                    <section className="insight-panel">
                      <h3>Graph</h3>
                      <ProjectionNotice projection={graph} />
                    </section>
                  </div>
                )}

                {activeTab === "artifacts" && <ArtifactList artifacts={artifacts} />}

                {activeTab === "chunks" && <ChunkExplorer chunks={chunks} />}

                {activeTab === "search" && (
                  <section className="search-panel">
                    <div className="search-line">
                      <input
                        onChange={(event) => setQuery(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") void runVectorSearch();
                        }}
                        placeholder="Search generated chunk vectors"
                        value={query}
                      />
                      <button onClick={runVectorSearch} type="button">
                        <Search size={16} />
                      </button>
                    </div>
                    {vector ? (
                      <div className="result-list">
                        <div className={`search-status ${vector.status}`}>
                          <strong>{vector.status}</strong>
                          <span>{vector.message}</span>
                        </div>
                        {vector.results.map((result, index) => (
                          <article className="result-card" key={`${result.point_id}-${index}`}>
                            <header>
                              <strong>{String(result.chunk_id ?? result.point_id ?? "Result")}</strong>
                              <span>{Number(result.score ?? 0).toFixed(3)}</span>
                            </header>
                            <p>{String(result.text ?? "")}</p>
                            <footer>
                              <span>{String(result.file_name ?? "")}</span>
                              <span>{JSON.stringify(result.page_numbers ?? [])}</span>
                            </footer>
                          </article>
                        ))}
                      </div>
                    ) : (
                      <EmptyState>No search has been run.</EmptyState>
                    )}
                  </section>
                )}

                {activeTab === "trace" && (
                  <div className="trace-list">
                    {(status?.events ?? []).length === 0 ? (
                      <EmptyState>No processing events yet.</EmptyState>
                    ) : (
                      status?.events.map((event) => (
                        <article className="trace-row" key={event.id}>
                          <div>
                            <strong>{humanize(event.stage)}</strong>
                            <span>{event.message}</span>
                          </div>
                          <div>
                            <StatusPill status={event.status} />
                            <time>{formatDate(event.created_at)}</time>
                          </div>
                        </article>
                      ))
                    )}
                  </div>
                )}
              </section>
            </>
          )}
        </section>
      </section>
    </main>
  );
}
