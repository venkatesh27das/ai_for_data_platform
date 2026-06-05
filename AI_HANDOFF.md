# AI Handoff

Last updated: 2026-06-05

## Current State

The repository implements Phase 0 through Phase 6 of the local document
intelligence roadmap.

Completed capabilities:

- Repository scaffold, FastAPI health/readiness, SQLAlchemy session, Alembic,
  Docker Compose, Makefile, structured logging, and tests.
- PDF/DOCX upload, local filesystem storage, checksum duplicate detection,
  document registry, processing runs, and processing events.
- Docling parsing into Canonical Document IR, normalized JSON/Markdown
  artifacts, table artifacts, persisted pages/elements, and status endpoints.
- Layout-aware chunking, LM Studio embedding adapter, Qdrant upsert/search,
  rebuild command, and evidence-bearing vector results.
- Generic structured extraction with deterministic regex extraction first,
  optional Gemma structured-output enrichment through LM Studio, persisted
  fields/entities/relationships/events/claims/obligations, and extraction API/CLI.
- Exact-match entity resolution, alias persistence, local graph projection,
  optional Neo4j projection, graph rebuild, graph API, and graph search.
- Feature-flagged OCR fallback with an isolated olmOCR HTTP adapter. Clean
  documents still process through Docling. Low-text or scanned PDF pages are
  marked retryable when OCR is disabled and can be reprocessed after enabling
  `OCR_PROVIDER=olmocr` and `OLMOCR_ENABLED=true`.
- React `Doc Test Lab` UI for upload/process, document asset exploration,
  vector/graph/table preview, and query workspace.

## Important Files

- `AGENTS.md`: durable project instructions and phase plan.
- `README.md`: user-facing setup, commands, limitations, and roadmap.
- `.env.example`: local configuration template.
- `src/docintel/services/processing.py`: synchronous processing orchestration.
- `src/docintel/services/parsing/docling_parser.py`: default PDF/DOCX parser.
- `src/docintel/services/parsing/ocr_fallback.py`: OCR-required detection and merge logic.
- `src/docintel/services/parsing/olmocr_parser.py`: isolated olmOCR HTTP adapter.
- `src/docintel/services/vector_projection.py`: chunk/vector projection and search.
- `src/docintel/services/extraction/generic.py`: generic structured extraction.
- `src/docintel/services/graph/projection.py`: entity resolution and graph projection.
- `ui/src/App.tsx`, `ui/src/styles.css`, `ui/src/api.ts`: Doc Test Lab UI.

## Local Runtime Notes

Preferred stack:

- PostgreSQL, Redis, Qdrant, Neo4j, and MinIO via Docker Compose.
- LM Studio on host at `http://localhost:1234/v1`.
- Optional olmOCR as an independent service at `OLMOCR_BASE_URL`.

Useful commands:

```bash
make services-up
make install
make migrate
make api
make ui-dev
make ui-build
```

If PostgreSQL is unavailable during local smoke testing, the API has been run
successfully with:

```bash
PYTHONPATH=src DATABASE_URL=sqlite+pysqlite:///data/dev.sqlite \
  .venv/bin/uvicorn docintel.main:create_app --factory --host 0.0.0.0 --port 8000
```

This SQLite mode is only a temporary local workaround. PostgreSQL remains the
intended primary metadata and extraction store.

## Validation Status

Latest successful validation used the existing virtual environment directly:

```bash
.venv/bin/ruff format .
.venv/bin/ruff check .
PYTHONPATH=src .venv/bin/mypy
PYTHONPATH=src .venv/bin/pytest
npm run build  # from ui/
```

Observed result:

- Ruff format/check passed.
- Mypy passed for 59 source files.
- Pytest passed: 14 tests.
- UI production build passed.

Known validation caveat:

- `make lint`, `make typecheck`, and `make test` call `uv run`. In an offline
  environment, `uv run` may try to resolve `hatchling` from PyPI and fail on DNS.
  Use `.venv/bin/...` commands when dependencies are already installed and
  network is unavailable.

## Known Limitations

- Processing is synchronous through API/CLI; Celery task graph is scaffolded but
  not yet the main execution path.
- LM Studio, Qdrant, Neo4j, and olmOCR are local external services. Missing
  services should produce partial/retryable states rather than corrupting stored
  results.
- The Neo4j Python driver may not be installed. Local graph records remain
  available from PostgreSQL; live Neo4j projection is optional.
- OCR fallback expects the independent olmOCR service to expose `POST /ocr`.
  The app accepts either full Canonical IR JSON or page-level text/Markdown.
- Domain-specific extraction profiles and ontology draft approval are not yet
  implemented.
- Review queue/UI is not yet implemented beyond the current test-lab surface.

## Current Worktree Notes

There are many uncommitted changes spanning phases 4 through 6 and the UI
revamp. Do not revert unrelated files. `data/dev.sqlite` is a local scratch
database and should not be committed.

## Recommended Next Phase

Start Phase 7: domain profiles and ontology drafts.

Suggested first vertical slice:

1. Add versioned extraction profile models and repository tables if missing.
2. Create starter profile definitions for `contract_v1`, `invoice_v1`, and
   `policy_document_v1`.
3. Implement read-only profile loading and validation.
4. Add an API/CLI path to list approved profiles.
5. Keep generic extraction stable and do not let draft profiles mutate the
   active ontology automatically.
