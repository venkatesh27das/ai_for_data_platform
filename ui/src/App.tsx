import {
  AlertCircle,
  CheckCircle2,
  Database,
  FileText,
  GitFork,
  Loader2,
  Play,
  RefreshCcw,
  Search,
  TableProperties,
  Upload,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

import { api, DocumentRecord, ProjectionResponse, SearchResponse, StatusResponse } from "./api";

type HealthState = "checking" | "ok" | "error";

const defaultApiBase = "http://localhost:8000";

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  return <span className={`pill ${normalized}`}>{status}</span>;
}

function EmptyPanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel">
      <div className="panel-title">{title}</div>
      <div className="empty">{children}</div>
    </section>
  );
}

function ProjectionPanel({
  icon,
  title,
  projection,
}: {
  icon: ReactNode;
  title: string;
  projection: ProjectionResponse | SearchResponse | null;
}) {
  return (
    <section className="panel">
      <div className="panel-title">
        <span className="title-icon">{icon}</span>
        {title}
      </div>
      {projection ? (
        <div className="projection">
          <div className="phase">{projection.required_phase}</div>
          <p>{projection.message}</p>
          {"data" in projection ? (
            <pre>{JSON.stringify(projection.data, null, 2)}</pre>
          ) : (
            <pre>{JSON.stringify(projection.results, null, 2)}</pre>
          )}
        </div>
      ) : (
        <div className="empty">Select a document.</div>
      )}
    </section>
  );
}

export default function App() {
  const [apiBase, setApiBase] = useState(defaultApiBase);
  const [health, setHealth] = useState<HealthState>("checking");
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [artifacts, setArtifacts] = useState<ProjectionResponse | null>(null);
  const [extractions, setExtractions] = useState<ProjectionResponse | null>(null);
  const [graph, setGraph] = useState<ProjectionResponse | null>(null);
  const [vector, setVector] = useState<SearchResponse | null>(null);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const selected = useMemo(
    () => documents.find((document) => document.id === selectedId) ?? null,
    [documents, selectedId],
  );

  async function refresh() {
    setBusy(true);
    setMessage("");
    try {
      const [healthResult, docs] = await Promise.all([api.health(apiBase), api.listDocuments(apiBase)]);
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
      const [nextStatus, nextArtifacts, nextExtractions, nextGraph] = await Promise.all([
        api.status(apiBase, documentId),
        api.artifacts(apiBase, documentId),
        api.extractions(apiBase, documentId),
        api.graph(apiBase, documentId),
      ]);
      setStatus(nextStatus);
      setArtifacts(nextArtifacts);
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
          <h1>DocIntel Console</h1>
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
            className="api-input"
            value={apiBase}
            onChange={(event) => setApiBase(event.target.value)}
            aria-label="API base URL"
          />
          <button onClick={refresh} title="Refresh" type="button">
            <RefreshCcw size={17} />
          </button>
          <label className="upload-button" title="Upload PDF or DOCX">
            <Upload size={17} />
            <input accept=".pdf,.docx" multiple onChange={uploadFiles} type="file" />
          </label>
          <button disabled={!selected} onClick={runSelected} title="Run" type="button">
            <Play size={17} />
          </button>
        </div>
      </header>

      {message && <div className="notice">{message}</div>}

      <section className="workspace">
        <aside className="document-list">
          <div className="section-head">
            <FileText size={17} />
            Documents
          </div>
          {documents.length === 0 ? (
            <div className="empty">No documents.</div>
          ) : (
            <div className="rows">
              {documents.map((document) => (
                <button
                  className={`doc-row ${selectedId === document.id ? "selected" : ""}`}
                  key={document.id}
                  onClick={() => setSelectedId(document.id)}
                  type="button"
                >
                  <span className="doc-name">{document.file_name}</span>
                  <span className="doc-meta">
                    {document.file_type.toUpperCase()} · {formatBytes(document.size_bytes)}
                  </span>
                  <StatusPill status={document.status} />
                </button>
              ))}
            </div>
          )}
        </aside>

        <section className="detail">
          {selected ? (
            <>
              <section className="summary">
                <div>
                  <div className="eyebrow">Selected</div>
                  <h2>{selected.file_name}</h2>
                  <div className="checksum">{selected.checksum_sha256}</div>
                </div>
                <StatusPill status={selected.status} />
              </section>

              <section className="status-grid">
                <div className="status-card">
                  <div className="metric-label">Registry</div>
                  <div className="metric-value">Available</div>
                </div>
                <div className="status-card">
                  <div className="metric-label">Canonical IR</div>
                  <div className="metric-value muted">Phase 2</div>
                </div>
                <div className="status-card">
                  <div className="metric-label">Vector Store</div>
                  <div className="metric-value muted">Phase 3</div>
                </div>
                <div className="status-card">
                  <div className="metric-label">Graph</div>
                  <div className="metric-value muted">Phase 5</div>
                </div>
              </section>

              {status && <div className="status-message">{status.message}</div>}

              <div className="projection-grid">
                <ProjectionPanel
                  icon={<Database size={17} />}
                  projection={artifacts}
                  title="Artifacts"
                />
                <ProjectionPanel
                  icon={<TableProperties size={17} />}
                  projection={extractions}
                  title="Structured"
                />
                <section className="panel">
                  <div className="panel-title">
                    <span className="title-icon">
                      <Search size={17} />
                    </span>
                    Vector Search
                  </div>
                  <div className="search-line">
                    <input
                      onChange={(event) => setQuery(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") void runVectorSearch();
                      }}
                      placeholder="semantic query"
                      value={query}
                    />
                    <button onClick={runVectorSearch} type="button">
                      <Search size={16} />
                    </button>
                  </div>
                  {vector ? (
                    <div className="projection">
                      <div className="phase">{vector.required_phase}</div>
                      <p>{vector.message}</p>
                      <pre>{JSON.stringify(vector.results, null, 2)}</pre>
                    </div>
                  ) : (
                    <div className="empty">No query.</div>
                  )}
                </section>
                <ProjectionPanel icon={<GitFork size={17} />} projection={graph} title="Graph" />
              </div>
            </>
          ) : (
            <EmptyPanel title="Document">No document selected.</EmptyPanel>
          )}
        </section>
      </section>
    </main>
  );
}
