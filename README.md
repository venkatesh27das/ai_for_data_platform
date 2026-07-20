# AI Data Modelling Assistant MVP

The first runnable foundation of a local-first, chat-driven data modelling assistant. It provides a screenshot-aligned React interface, a FastAPI/SQLite API, provider-independent LLM and embedding boundaries, and a small LangGraph workflow that sends scenarios to LM Studio and streams responses back to the workspace.

## What works now

- Create a project from the Home scenario composer.
- Stream an LM Studio response from `gemma-4-12b-qat` over SSE.
- Persist projects and both sides of the conversation in SQLite.
- Persist generated artifacts separately from chat and open viewers only from generated-asset cards.
- Reopen a project from Home or Projects and continue its conversation.
- Search, filter, duplicate, and delete projects.
- Configure and test LM Studio, OpenAI, Anthropic, or a custom provider preset. The Anthropic transport is a deliberate placeholder in this iteration.
- Call `nomic-embed-text` through a minimal embedding service boundary (retrieval is not built yet).
- Exercise the initial LangGraph state path with mocked requirement-stage nodes.

The logical-model viewer now renders persisted structured artifact payloads and remains closed until a modeller selects an available asset. Automatic artifact generation, source upload, mappings, DQ rules, model operations, full agent implementations, and export generation are intentionally deferred.

## Prerequisites

- Python 3.12 or newer
- [`uv`](https://docs.astral.sh/uv/)
- Node.js 20 or newer and npm
- LM Studio running its local server on `http://localhost:1234`
- In LM Studio, load:
  - chat model: `gemma-4-12b-qat`
  - embedding model: `nomic-embed-text`

## First-time setup

From the repository root:

```bash
cp .env.example .env
make install
```

The defaults already target the supplied LM Studio models. Edit `.env` only if your URL or model identifiers differ.

Apply the database migration:

```bash
make migrate
```

## Launch locally

Start the backend in one terminal:

```bash
make backend
```

Start the frontend in a second terminal:

```bash
make frontend
```

Open [http://localhost:5173](http://localhost:5173). API documentation is available at [http://localhost:8000/docs](http://localhost:8000/docs).

To create or refresh the durable showcase project:

```bash
make seed-example
```

Open **SAP Sales Order Analytics — Example** from Projects. It includes a realistic modelling conversation plus source assessment, logical model, source-to-target mappings, DQ rules, and validation findings. Each viewer opens only when its generated-asset button is selected.

The complete flow is: enter a scenario on Home → submit → the project workspace opens → LM Studio streams its clarification response → reopen the saved project from Projects.

## Verification

```bash
make test
make lint
```

Or run checks independently:

```bash
cd backend
uv run pytest
uv run ruff check .
uv run mypy app

cd ../frontend
npm test -- --run
npm run lint
npm run build
```

## Repository layout

```text
backend/
  alembic/             SQLite migrations
  app/api/             thin FastAPI routes
  app/repositories/    persistence boundaries
  app/services/        application workflows
  app/llm/             provider and embedding abstractions/adapters
  app/orchestration/   LangGraph state and initial graph
  tests/
frontend/
  src/components/      reusable chat, artefact, and common UI
  src/features/        Home, Projects, Workspace, and Settings routes
  src/services/        typed API and SSE client
  src/types/           shared frontend contracts
docs/
  architecture.md
```

Configuration is environment-driven. API keys are stored only by the backend, are excluded from Git, and are represented to the frontend only as `api_key_configured: true|false` after saving.
