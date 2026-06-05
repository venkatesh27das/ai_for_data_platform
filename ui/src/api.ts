export type DocumentRecord = {
  id: string;
  file_name: string;
  file_type: string;
  checksum_sha256: string;
  storage_uri: string;
  size_bytes: number;
  status: string;
  created_at: string;
  updated_at: string;
};

export type UploadResponse = {
  document: DocumentRecord;
  duplicate: boolean;
};

export type ProcessingEvent = {
  id: string;
  processing_run_id: string;
  stage: string;
  status: string;
  message: string | null;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

export type StatusResponse = {
  document_id: string;
  status: string;
  message: string;
  available_projections: string[];
  unavailable_projections: string[];
  latest_run_id: string | null;
  events: ProcessingEvent[];
};

export type ProcessResponse = {
  document: DocumentRecord;
  status: string;
  message: string;
  processing_run_id: string | null;
};

export type ProjectionResponse = {
  document_id: string;
  status: "unavailable";
  message: string;
  required_phase: string;
  data: Record<string, unknown>;
};

export type ArtifactRecord = {
  id: string;
  processing_run_id: string | null;
  artifact_type: string;
  uri: string;
  media_type: string;
  metadata_json: Record<string, unknown>;
  created_at: string;
};

export type ArtifactsResponse = {
  document_id: string;
  status: "available" | "unavailable";
  message: string;
  artifacts: ArtifactRecord[];
};

export type ChunkRecord = {
  chunk_id: string;
  chunk_type: string;
  text: string;
  markdown: string | null;
  section_path_json: string[];
  page_numbers_json: number[];
  source_element_ids_json: string[];
  quality_score: number | null;
  metadata_json: Record<string, unknown>;
};

export type ChunksResponse = {
  document_id: string;
  status: "available" | "unavailable";
  message: string;
  chunks: ChunkRecord[];
};

export type SearchResponse = {
  status: string;
  required_phase: string | null;
  message: string;
  results: Record<string, unknown>[];
};

async function request<T>(apiBase: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiBase}${path}`, init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

export const api = {
  health(apiBase: string) {
    return request<{ status: string; app_env: string }>(apiBase, "/health");
  },
  ready(apiBase: string) {
    return request<{ status: string; database: string; details: string | null }>(apiBase, "/ready");
  },
  listDocuments(apiBase: string) {
    return request<DocumentRecord[]>(apiBase, "/api/v1/documents");
  },
  async upload(apiBase: string, file: File) {
    const form = new FormData();
    form.append("file", file);
    return request<UploadResponse>(apiBase, "/api/v1/documents/upload", {
      method: "POST",
      body: form,
    });
  },
  process(apiBase: string, documentId: string) {
    return request<ProcessResponse>(apiBase, `/api/v1/documents/${documentId}/process`, {
      method: "POST",
    });
  },
  status(apiBase: string, documentId: string) {
    return request<StatusResponse>(apiBase, `/api/v1/documents/${documentId}/status`);
  },
  artifacts(apiBase: string, documentId: string) {
    return request<ArtifactsResponse>(apiBase, `/api/v1/documents/${documentId}/artifacts`);
  },
  chunks(apiBase: string, documentId: string) {
    return request<ChunksResponse>(apiBase, `/api/v1/documents/${documentId}/chunks`);
  },
  extractions(apiBase: string, documentId: string) {
    return request<ProjectionResponse>(apiBase, `/api/v1/documents/${documentId}/extractions`);
  },
  graph(apiBase: string, documentId: string) {
    return request<ProjectionResponse>(apiBase, `/api/v1/documents/${documentId}/graph`);
  },
  vectorSearch(apiBase: string, query: string) {
    return request<SearchResponse>(apiBase, "/api/v1/search/vector", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit: 8 }),
    });
  },
};
