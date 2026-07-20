# Foundation architecture

```mermaid
flowchart LR
  UI[React + TypeScript] -->|JSON CRUD| API[FastAPI routes]
  UI -->|SSE stream| API
  API --> Services[Application services]
  Services --> Repositories[SQLAlchemy repositories]
  Repositories --> SQLite[(SQLite)]
  Services --> Graph[LangGraph master orchestrator]
  Graph --> Checkpoints[(SQLite node checkpoints)]
  Graph --> Agents[Typed specialist agents]
  Agents --> Registry[Provider registry]
  Registry --> LM[LM Studio OpenAI-compatible API]
  Embed[Embedding service] --> LM
```

Routes validate and translate HTTP concerns only. Services own use-case sequencing, repositories isolate SQLAlchemy, and agents/workflows receive an `LLMProvider` rather than constructing provider clients. The embedding boundary uses the same OpenAI-compatible LM Studio server but is independent of chat generation.

The master graph owns routing and shared state. Its specialist nodes are requirement clarification, source analysis, logical model design, mapping and DQ generation, and validation. Blocking requirements or missing sources stop safely for human input. Validation may route through one bounded correction pass before persistence, preventing unbounded autonomous loops.

Each specialist has a versioned system prompt, typed Pydantic contract, declared identity, and provider-independent `LLMProvider` dependency. Structured responses are schema-validated and receive one JSON-repair attempt. If LM Studio times out or still returns invalid output, an evidence-labelled deterministic fallback keeps the local workflow usable without pretending that invented analysis came from the model.

Project, message, source profile, artifact, review, and latest workflow state are authoritative in SQLite. A separate SQLite LangGraph checkpointer saves every node transition under the project ID. Browser state is used only for transient composer, canvas interaction, and streaming presentation state.

Generated assets are also authoritative SQLite records. A workspace fetches the project's artifact list but does not select one automatically. The chat displays an asset summary only when records exist, and the relevant viewer is mounted only after the modeller explicitly opens an asset.

Source uploads are inspected before agent execution. CSV and JSON records are sampled, DDL is parsed, and modern Excel workbooks are opened read-only. Profiles record columns, inferred primitive types, null counts, small sample values, and evidence; agents never receive the entire binary file.

Artifact versions are immutable when edited: an edit creates the next type-specific version. Review state and canvas layout can be updated independently. Regeneration starts at the selected specialist and reruns only agents whose outputs depend on that artifact.

## Orchestration event contract

The streaming route mirrors `agent.started` and `agent.completed` events to the client with the specialist ID, confidence, and execution mode (`llm` or `fallback`). After `workflow.completed`, it streams a concise presenter response, persists the new workflow state and versioned assets, then emits `done`. Provider transport failures emit `error` and mark the project workflow as failed.
