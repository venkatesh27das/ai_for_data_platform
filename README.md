# AI Data Modelling Assistant MVP

The first runnable foundation of a local-first, chat-driven data modelling assistant. It provides a screenshot-aligned React interface, a FastAPI/SQLite API, provider-independent LLM and embedding boundaries, and a LangGraph master orchestrator that coordinates specialist modelling agents.

## What works now

- Create a project from the Home scenario composer.
- Stream agent progress and the final LM Studio response from `gemma-4-12b-qat` over SSE.
- Persist projects and both sides of the conversation in SQLite.
- Persist generated artifacts separately from chat and open viewers only from generated-asset cards.
- Reopen a project from Home or Projects and continue its conversation.
- Search, filter, duplicate, and delete projects.
- Configure and test LM Studio, OpenAI, Anthropic, or a custom provider preset. The Anthropic transport is a deliberate placeholder in this iteration.
- Call `nomic-embed-text` through a minimal embedding service boundary (retrieval is not built yet).
- Run five typed specialists: requirements, source analysis, model design, mappings/DQ, and validation.
- Route deterministically through clarification, generation, bounded rework, persistence, and presentation.
- Generate and version source analysis, logical model, mapping, DQ, and validation assets.
- Fall back to conservative, evidence-labelled DDL analysis if a local structured-model call times out or returns invalid JSON.
- Checkpoint every LangGraph node to a dedicated SQLite database for durable recovery.
- Parse and profile CSV, JSON, DDL/SQL, XLSX, and XLSM source files on the backend.
- Approve assets, request changes, edit JSON as a new version, browse history, and run dependency-aware targeted regeneration.
- Zoom, inspect, select, drag, and persist entity positions on the logical-model canvas.
- Create a typed, budgeted execution plan before specialist work begins.
- Select versioned skills and allow-listed tools, record observations, and react to validation.
- Interrupt for modeller approval before any configured MCP tool runs, then resume durably.
- Inspect the plan, tool calls, decisions, and approval state directly in the workspace.

The logical-model viewer renders persisted structured artifact payloads and remains closed until a modeller selects an available asset. Retrieval, live database introspection, legacy `.xls` parsing, and export generation remain deferred.

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

The complete flow is: enter a scenario and attach source files on Home → submit → the backend profiles the files → specialists analyse and generate assets → select an asset card to review or edit it → optionally regenerate that asset → reopen the persisted project from Projects.

## Autonomous agent workflow

```mermaid
flowchart TD
  P[Master planner] --> A{Manifest or action approval?}
  A -->|yes| H[Human approval interrupt]
  A -->|no| D[Authoritative plan dispatcher]
  H -->|approved| D
  D -->|tool action| T[Allow-listed tool executor]
  T --> O{Observation}
  O -->|success| D
  O -->|recoverable failure and budget remains| P
  O -->|budget exhausted| R[Human review]
  D -->|ready specialist step| S[Typed specialist agent]
  S -->|completed| D
  S -->|clarification needed| R
  S -->|validation defect| P
  D -->|plan complete| V[Persist versioned assets]
  V --> X[Present response]
```

The planner and every specialist have versioned prompts and typed Pydantic contracts. Versioned JSON skill manifests bind capabilities to one agent, an explicit tool allow-list, and approval policy. The plan is executable and authoritative: only dependency-ready steps run. The supervisor validates every model-selected skill/tool combination, enforces plan iteration and tool-call budgets, and sends failed observations or validation defects back to the planner for bounded replanning.

Built-in tools currently expose persisted source profiles and workflow context. MCP uses the official stable Python SDK with Streamable HTTP; servers and fully qualified tools must be explicitly configured in `MCP_SERVERS_JSON` and `MCP_TOOL_ALLOWLIST`. MCP plans always require human approval, advertised input schemas are validated before execution, and MCP error responses are recorded as failed observations. Configure only trusted local or authenticated servers.

`WORKFLOW_CHECKPOINT_PATH` controls the node-level LangGraph checkpoint database. A project's latest domain state is also stored with the project, while checkpoints retain execution progress for recovery and audit. Targeted regeneration uses explicit artifact markers internally and skips unchanged upstream agents.

The Settings **Tool calling enabled** toggle controls application tool execution. Local defaults enable bounded tools. MCP remains disabled until at least one server and one fully qualified allow-listed tool are provided through environment configuration.

### Performance and recovery runtime

Workflow execution is independent of the browser's SSE connection. Every request receives a durable run ID, persists ordered events, continues if the browser disconnects, and can be replayed on reconnect. A page reopened during generation automatically follows the project's active run. The Stop button cancels the backend task rather than only closing the browser stream.

Client idempotency keys prevent duplicate submissions, while a database-backed project lease and an in-process project lock serialize conflicting runs. External tool operations use stable request fingerprints so completed results can be reused safely after checkpoint resume. Standard full-model requests use a deterministic bounded plan and structured presenter, saving two LLM calls; regeneration, recovery, and external-capability requests still use the reactive planner.

The backend reuses one pooled HTTP client and one SQLite LangGraph checkpointer for its application lifetime. SQLite uses WAL and a busy timeout. Provider calls are protected by a configurable concurrency semaphore and circuit breaker. Specialist results are cached by provider, model, prompt version, input, and output schema; fallback results are never cached. MCP schemas also use a bounded TTL cache, and explicitly marked read-only tool calls can execute concurrently.

After pulling these changes, apply migration `0006` before launching:

```bash
cd backend
uv run alembic upgrade head
```

## Verification

```bash
make test
make lint
```

Or run checks independently:

```bash
cd backend
uv run python -m pytest
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
  app/agents/          typed specialists and versioned prompts
  app/orchestration/   LangGraph state and master graph
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
