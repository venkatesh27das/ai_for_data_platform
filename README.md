# Local Document Intelligence

Local Document Intelligence is a Mac-first application for processing PDF and DOCX files into reusable document intelligence assets. The full roadmap includes vector search assets, structured extraction records, and knowledge graph projections generated from one canonical document representation.

Phase 0 is intentionally small: it provides the repository scaffold, local service definitions, configuration, logging, database migration plumbing, and a FastAPI app with `/health` and `/ready`.

## Architecture

```mermaid
flowchart LR
    A["Upload PDF/DOCX"] --> B["Document Registry (PostgreSQL)"]
    B --> C["Processing Pipeline"]
    C --> D["Canonical Document IR"]
    D --> E["Vector Projection (Qdrant)"]
    D --> F["Structured Extraction (PostgreSQL)"]
    D --> G["Graph Projection (Neo4j)"]
    C --> H["Artifacts (Filesystem / MinIO adapter later)"]
    I["LM Studio on host"] -. "later phases" .-> C
    J["olmOCR service"] -. "optional later phase" .-> C
```

## Prerequisites

- macOS, preferably Apple Silicon
- Python 3.11
- Homebrew
- Docker Desktop
- Git
- `uv`
- LM Studio for later model-backed phases

Install `uv` if needed:

```bash
brew install uv
```

## LM Studio

LM Studio runs on the host machine, outside Docker. Phase 0 does not call LM Studio. Before later phases, start the LM Studio OpenAI-compatible server on port `1234` and set:

```bash
LM_STUDIO_LLM_MODEL=<set-your-loaded-gemma-4-model-id>
LM_STUDIO_VLM_MODEL=<set-your-loaded-gemma-4-model-id>
LM_STUDIO_EMBEDDING_MODEL=<set-your-loaded-nomic-embedding-model-id>
```

## Configuration

Create local configuration from the example:

```bash
cp .env.example .env
```

Never commit `.env`. The default local service ports are:

| Service | Port |
|---|---:|
| FastAPI | 8000 |
| PostgreSQL | 5432 |
| Redis | 6379 |
| Qdrant REST | 6333 |
| Qdrant gRPC | 6334 |
| Neo4j Browser | 7474 |
| Neo4j Bolt | 7687 |
| MinIO API | 9000 |
| MinIO Console | 9001 |
| LM Studio | 1234 |

## Docker Compose

Start local persistence services:

```bash
make services-up
```

Stop them:

```bash
make services-down
```

Validate the compose file:

```bash
docker compose config
```

## Bootstrap

Run the full Phase 0 bootstrap:

```bash
make bootstrap
```

This verifies local prerequisites, creates `.env` only if missing, starts Docker Compose services, installs dependencies with `uv`, runs Alembic migrations, and prints next commands.

## API

Start FastAPI locally:

```bash
make api
```

Check liveness:

```bash
curl http://localhost:8000/health
```

Check readiness, including the configured database:

```bash
curl http://localhost:8000/ready
```

OpenAPI docs are available at:

```text
http://localhost:8000/docs
```

## Worker

The worker entry point is scaffolded for later processing tasks:

```bash
make worker
```

Phase 0 only includes a simple `docintel.ping` task.

## CLI

The CLI is minimal in Phase 0:

```bash
uv run docintel health
```

Ingestion, processing, vector search, graph search, and rebuild commands begin in later phases.

## Tests And Checks

```bash
make format
make lint
make typecheck
make test
```

Integration tests that require Docker services should use the `integration` marker. Live local model tests should use the `live_model` marker.

## Current Limitations

- No upload endpoint yet.
- No document parsing, Docling adapter, OCR fallback, chunking, embeddings, extraction, entity resolution, or graph projection yet.
- MinIO is available in Docker Compose, but Phase 0 uses local filesystem directories only.
- olmOCR is optional and independently configured. It is not installed into this Python environment.

## Roadmap

1. Phase 1: ingestion and document registry.
2. Phase 2: Docling parsing and canonical document IR.
3. Phase 3: layout-aware chunking and Qdrant.
4. Phase 4: generic structured extraction.
5. Phase 5: entity resolution and Neo4j projection.
6. Phase 6: OCR fallback through an isolated olmOCR adapter.
7. Phase 7: domain profiles and ontology drafts.
8. Phase 8: lightweight Streamlit review UI.

## Troubleshooting

- If `make bootstrap` cannot find `uv`, run `brew install uv`.
- If Docker commands fail, start Docker Desktop and wait until it reports ready.
- If `/ready` returns `503`, check that PostgreSQL is running and `DATABASE_URL` matches `.env`.
- If migrations fail, run `docker compose ps` and confirm the `postgres` service is healthy.
- If a later model-backed command fails, confirm LM Studio is running on `http://localhost:1234/v1` with the configured local model IDs.
