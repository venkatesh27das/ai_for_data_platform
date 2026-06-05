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

export type StatusResponse = {
  document_id: string;
  status: string;
  message: string;
  available_projections: string[];
  unavailable_projections: string[];
};

export type ProcessResponse = {
  document: DocumentRecord;
  status: string;
  message: string;
};

export type ProjectionResponse = {
  document_id: string;
  status: "unavailable";
  message: string;
  required_phase: string;
  data: Record<string, unknown>;
};

export type SearchResponse = {
  status: string;
  required_phase: string;
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
    return request<ProjectionResponse>(apiBase, `/api/v1/documents/${documentId}/artifacts`);
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
