# CODEX.md — AI Data Modelling Assistant MVP

## 1. Purpose

Build a local-first, chat-driven **AI Data Modelling Assistant MVP** that allows a data modeller to:

1. Create or reopen a modelling project.
2. Describe an analytical data-modelling scenario in natural language.
3. Upload source metadata and, optionally, sample data.
4. Answer a small number of blocking clarification questions.
5. Generate a dimensional logical data model.
6. Review the generated model visually.
7. Generate and review source-to-target mappings.
8. Generate and review basic data-quality rules.
9. Refine the generated assets using natural-language instructions.
10. Preserve project, conversation, workflow, decision and model state.
11. Export model assets as JSON, CSV, Mermaid and Markdown.
12. Run primarily against local LLMs served by LM Studio, while retaining configurable support for OpenAI, Anthropic Claude and future providers.

The MVP must validate the following experience:

> Describe → Clarify → Analyse → Generate → Visualise → Refine → Validate → Export

---

## 2. Core Product Principles

### 2.1 Chat-first, not chat-only

The conversation is the primary control surface. Structured modelling artefacts appear contextually beside the conversation.

Do not design the experience as a traditional data-modelling platform with a chatbot added to it.

### 2.2 Artefacts are the system of record

The chat transcript is not the authoritative representation of the model.

The following must be stored as structured artefacts:

- Modelling brief
- Source schemas
- Source profiles
- Logical model
- Entities
- Attributes
- Relationships
- Source-to-target mappings
- Data-quality rules
- Decisions
- Validation findings
- Model operations
- Model versions

### 2.3 Bounded autonomy

Agents may autonomously:

- Analyse source metadata
- Select relevant source objects
- Propose a dimensional model
- Generate mappings
- Generate DQ rules
- Validate outputs
- Re-plan after tool or validation results
- Apply reversible, low-risk changes

Agents must request human input for:

- Ambiguous business objective
- Fact grain
- Business-key conflicts
- Authoritative-source conflicts
- Major entity reuse decisions
- Destructive model changes
- Final approval and export readiness

### 2.4 Structured operations, not full regeneration

Natural-language refinements must be translated into explicit model operations.

Examples:

- `RENAME_ENTITY`
- `ADD_ATTRIBUTE`
- `REMOVE_ATTRIBUTE`
- `CHANGE_DATA_TYPE`
- `SET_PRIMARY_KEY`
- `ADD_RELATIONSHIP`
- `CHANGE_CARDINALITY`
- `CHANGE_FACT_GRAIN`
- `ACCEPT_MAPPING`
- `REJECT_MAPPING`
- `UPDATE_MAPPING`
- `ADD_DQ_RULE`
- `REMOVE_DQ_RULE`

Do not regenerate the complete model for every small change.

### 2.5 Provider-independent LLM integration

Application code must not directly depend on LM Studio, OpenAI or Anthropic SDK calls inside agents.

All model calls must go through an internal model-provider interface.

---

## 3. MVP Scope

### 3.1 Supported modelling pattern

The first MVP supports:

- Analytical use cases
- Dimensional modelling
- One central fact table
- Supporting dimensions
- Natural and surrogate key suggestions
- Basic cardinality and relationship inference
- Source-to-target mapping
- Basic data-quality-rule generation

### 3.2 Supported source inputs

Required:

- Source metadata CSV
- Source metadata JSON
- SQL DDL text or file

Optional where practical:

- CSV sample data
- SQLite database
- Excel metadata workbook

### 3.3 Supported export formats

- Logical-model JSON
- Source-to-target mapping CSV
- DQ-rule CSV
- Mermaid ER diagram
- Modelling-summary Markdown
- Optional SQL DDL

### 3.4 Explicitly out of scope

Do not implement in the first MVP:

- Data Vault
- Canonical modelling and survivorship
- Operational normalized modelling
- Enterprise MDM
- Direct SAP connectivity
- Production database writeback
- Full MCP ecosystem
- Full A2A mesh
- Multi-tenancy
- Enterprise RBAC
- Unity Catalog or Purview publishing
- Automated pipeline generation
- Collaborative simultaneous editing
- Enterprise-scale 30,000-attribute retrieval
- Production deployment automation
- Complete enterprise lineage extraction

Create extension interfaces where appropriate, but do not build these features now.

---

## 4. Recommended Technology Stack

## 4.1 Frontend

- React
- TypeScript
- Vite
- React Router
- TanStack Query
- Zustand for local UI state
- React Flow for the model canvas
- TanStack Table or AG Grid Community for mappings and DQ grids
- Tailwind CSS
- Radix UI or shadcn/ui
- Server-Sent Events for agent-run streaming
- Vitest
- React Testing Library
- Playwright for end-to-end tests

## 4.2 Backend

- Python 3.12+
- FastAPI
- Pydantic v2
- SQLAlchemy 2
- Alembic
- LangGraph as the default orchestration runtime
- LangChain model integrations only where useful
- httpx for external provider calls
- pandas and pyarrow for source-file parsing and profiling
- NetworkX for graph validation if useful
- Structured logging with structlog
- pytest
- Ruff
- mypy

## 4.3 Persistence

Start with:

- SQLite for the first local MVP
- SQLAlchemy models that remain portable to PostgreSQL
- Local filesystem object storage under a configurable application data directory

Prepare for:

- PostgreSQL
- pgvector
- S3-compatible object storage

## 4.4 LLM providers

Required:

- LM Studio through OpenAI-compatible endpoints

Supported through configuration:

- OpenAI API
- Anthropic Claude API
- Any OpenAI-compatible provider
- Future adapters such as Azure OpenAI, Google Gemini or Ollama

## 4.5 Agent interoperability

MVP default:

- Internal LangGraph nodes and Python calls

Demonstration capability:

- One remotely invokable validation agent using an A2A-style contract

Future:

- Full A2A discovery, agent cards and task lifecycle
- MCP-based enterprise tools

---

## 5. Monorepo Structure

Use a monorepo.

```text
ai-data-modelling-assistant/
├── CODEX.md
├── README.md
├── .env.example
├── docker-compose.yml
├── Makefile
├── docs/
│   ├── architecture.md
│   ├── api.md
│   ├── agent-contracts.md
│   └── sample-scenarios/
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   ├── artefacts/
│   │   │   ├── model-canvas/
│   │   │   ├── mappings/
│   │   │   ├── dq-rules/
│   │   │   └── common/
│   │   ├── features/
│   │   │   ├── home/
│   │   │   ├── projects/
│   │   │   ├── workspace/
│   │   │   └── settings/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   └── tests/
├── backend/
│   ├── pyproject.toml
│   ├── alembic.ini
│   ├── app/
│   │   ├── main.py
│   │   ├── config.py
│   │   ├── api/
│   │   │   ├── projects.py
│   │   │   ├── conversations.py
│   │   │   ├── sources.py
│   │   │   ├── artefacts.py
│   │   │   ├── decisions.py
│   │   │   ├── runs.py
│   │   │   └── exports.py
│   │   ├── agents/
│   │   │   ├── requirement_agent.py
│   │   │   ├── source_analysis_agent.py
│   │   │   ├── model_design_agent.py
│   │   │   ├── mapping_dq_agent.py
│   │   │   └── validation_agent.py
│   │   ├── orchestration/
│   │   │   ├── graph.py
│   │   │   ├── state.py
│   │   │   ├── routing.py
│   │   │   ├── policies.py
│   │   │   └── checkpoints.py
│   │   ├── llm/
│   │   │   ├── base.py
│   │   │   ├── registry.py
│   │   │   ├── lm_studio.py
│   │   │   ├── openai_provider.py
│   │   │   ├── anthropic_provider.py
│   │   │   └── openai_compatible.py
│   │   ├── tools/
│   │   │   ├── schema_parser.py
│   │   │   ├── csv_profiler.py
│   │   │   ├── relationship_inference.py
│   │   │   ├── model_operations.py
│   │   │   ├── validation_tools.py
│   │   │   └── export_tools.py
│   │   ├── domain/
│   │   │   ├── projects.py
│   │   │   ├── sources.py
│   │   │   ├── models.py
│   │   │   ├── mappings.py
│   │   │   ├── dq_rules.py
│   │   │   ├── decisions.py
│   │   │   └── operations.py
│   │   ├── repositories/
│   │   ├── services/
│   │   ├── db/
│   │   ├── schemas/
│   │   └── observability/
│   └── tests/
└── samples/
    ├── sap_sales_metadata.csv
    ├── sap_sales_sample/
    └── sample_project.json
```

---

## 6. Frontend Screens

## 6.1 Screen 1 — Home

### Purpose

Allow the user to start a modelling scenario or reopen a recent project.

### Required components

- Product header
- LM provider connection status
- Minimal left navigation:
  - Home
  - Projects
  - Settings
- Large scenario-input box
- File-attachment action
- Voice icon may be visually included but may remain disabled in MVP
- Example scenarios
- Recent projects
- Quick actions:
  - New Project
  - Import Sources
  - Use Example
  - Documentation

### Behaviour

When the user submits a scenario:

1. Create a project if one does not exist.
2. Save the first user message.
3. Navigate to the project workspace.
4. Start the LangGraph workflow.
5. Stream the assistant response.

---

## 6.2 Screen 2 — Projects

### Purpose

List and manage modelling projects.

### Required components

- Search
- Status filter
- New Project button
- Project list
- Project name
- Short objective
- Status
- Last updated
- Number of sources
- Model summary
- Mapping summary
- Open action
- Duplicate action
- Delete action with confirmation

### Project statuses

- Draft
- In Progress
- Needs Review
- Completed
- Failed

### MVP simplification

Do not build analytics dashboards or complex project-progress widgets.

---

## 6.3 Screen 3 — Chat-first Project Workspace

This is the primary application screen.

### Layout

Use a two-column layout:

- Left: conversation, approximately 38%
- Right: active artefact viewer, approximately 62%

### Header

Include only:

- Project name
- Save state
- Undo
- Redo
- History
- Export
- More menu

Do not include:

- Workflow progress bar
- Traditional application tabs
- Permanent validation sidebar
- Separate decisions panel

### Conversation panel

Required:

- User messages
- Assistant messages
- Streaming tokens
- Compact tool and progress events
- Clarification buttons
- Decision cards
- Generated-artefact summary cards
- Chat input
- File attachment
- Stop-run button
- Retry button

Example generated-artefact card:

```text
Initial model is ready

5 entities
27 mappings
8 DQ rules
3 items need review

[Open model] [Review mappings] [Review DQ rules]
```

### Active artefact viewer

Only one artefact view is open at a time.

Supported views:

- Logical-model canvas
- Source preview
- Mapping table
- DQ-rule table
- Validation findings
- Model diff

The artefact selected in chat determines what appears here.

### Bottom status strip

Show only:

- Entity count
- Mapping count
- DQ-rule count
- Items needing review
- Last activity

---

## 6.4 Screen 4 — Settings

### Required settings

- Active LLM provider
- Provider base URL
- Model name
- API key
- Temperature
- Request timeout
- Structured-output mode
- Tool-calling enabled
- Test connection button
- Local data directory
- Maximum upload size
- Logging level

### Provider presets

- LM Studio
- OpenAI
- Anthropic Claude
- Custom OpenAI-compatible

Secrets must not be returned to the browser after saving.

---

## 7. Frontend Reusable Components

### 7.1 Chat components

- `ConversationPanel`
- `MessageBubble`
- `AssistantMessage`
- `ProgressEvent`
- `ClarificationCard`
- `DecisionCard`
- `ArtifactSummaryCard`
- `ChatComposer`
- `FileAttachment`
- `StreamingIndicator`

### 7.2 Model components

- `ModelCanvas`
- `EntityNode`
- `FactEntityNode`
- `DimensionEntityNode`
- `RelationshipEdge`
- `AttributeList`
- `EntityPropertiesDrawer`
- `CanvasToolbar`

### 7.3 Table components

- `MappingGrid`
- `DQRuleGrid`
- `SourceSchemaGrid`
- `ValidationGrid`
- `ModelDiffGrid`

### 7.4 Common components

- `ProviderStatus`
- `ProjectStatus`
- `ConfidenceBadge`
- `SeverityBadge`
- `EmptyState`
- `LoadingState`
- `ErrorState`
- `ConfirmDialog`

---

## 8. Backend Modules

## 8.1 API layer

FastAPI must expose APIs for:

- Projects
- Conversations
- Source uploads
- Profiling
- Agent runs
- Structured artefacts
- Decisions
- Operations
- Versions
- Exports
- Provider configuration
- Health and readiness

## 8.2 Application services

Create explicit services:

- `ProjectService`
- `ConversationService`
- `SourceService`
- `WorkflowService`
- `ArtifactService`
- `ModelOperationService`
- `DecisionService`
- `ValidationService`
- `ExportService`
- `ProviderConfigurationService`

API routes should remain thin.

## 8.3 Repository layer

Repositories must isolate persistence:

- `ProjectRepository`
- `MessageRepository`
- `SourceRepository`
- `WorkflowRunRepository`
- `ArtifactRepository`
- `ModelVersionRepository`
- `DecisionRepository`
- `ValidationRepository`

---

## 9. LLM Provider Abstraction

## 9.1 Provider interface

Implement a common interface similar to:

```python
from collections.abc import AsyncIterator
from typing import Any, Protocol, TypeVar
from pydantic import BaseModel

T = TypeVar("T", bound=BaseModel)

class LLMProvider(Protocol):
    async def health_check(self) -> dict[str, Any]:
        ...

    async def list_models(self) -> list[str]:
        ...

    async def generate_text(
        self,
        messages: list[dict[str, Any]],
        *,
        temperature: float | None = None,
    ) -> str:
        ...

    async def generate_structured(
        self,
        messages: list[dict[str, Any]],
        response_model: type[T],
        *,
        temperature: float | None = None,
    ) -> T:
        ...

    async def stream_text(
        self,
        messages: list[dict[str, Any]],
        *,
        temperature: float | None = None,
    ) -> AsyncIterator[str]:
        ...

    async def invoke_tools(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict[str, Any]],
    ) -> dict[str, Any]:
        ...
```

## 9.2 LM Studio adapter

LM Studio must be the default local provider.

Configuration example:

```env
LLM_PROVIDER=lm_studio
LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio
LM_STUDIO_MODEL=
```

Required behaviour:

- Check server health
- List local models
- Allow user-selected model
- Use OpenAI-compatible responses or chat-completions endpoints
- Support streaming
- Support JSON-schema structured outputs when the selected model supports them
- Support tool calls when the model supports tool use
- Fall back to validated JSON prompting when native structured output fails
- Return clear errors when no model is loaded

## 9.3 OpenAI adapter

Configuration:

```env
OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_BASE_URL=https://api.openai.com/v1
```

Use the official OpenAI SDK or direct Responses API through the provider abstraction.

Do not expose the API key to the frontend.

## 9.4 Anthropic adapter

Configuration:

```env
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
```

Implement Claude Messages API through the same internal provider contract.

Map provider-specific tool calls and structured outputs into internal normalized types.

## 9.5 Custom OpenAI-compatible adapter

Configuration:

```env
CUSTOM_LLM_BASE_URL=
CUSTOM_LLM_API_KEY=
CUSTOM_LLM_MODEL=
```

This adapter should support other OpenAI-compatible gateways without adding provider-specific code throughout the application.

## 9.6 Provider registry

```python
class ProviderRegistry:
    def get(self, provider_name: str) -> LLMProvider:
        ...
```

Agents receive an `LLMProvider`; they must not construct provider SDK clients.

---

## 10. Agent Architecture

Build five MVP agents.

Each agent must have:

- Identifier
- Version
- Purpose
- Input Pydantic schema
- Output Pydantic schema
- Allowed tools
- Prompt/instruction file
- Confidence fields
- Evidence fields
- Assumptions
- Escalation conditions
- Unit tests

---

## 10.1 Requirement and Clarification Agent

### Purpose

Convert the user’s scenario into a structured modelling brief and identify only blocking questions.

### Inputs

- User message
- Recent conversation
- Existing modelling brief
- Uploaded file names and summaries

### Responsibilities

- Detect domain
- Detect business process
- Detect analytical objective
- Detect target users or consumption
- Extract KPIs and measures
- Extract source systems
- Identify requested outputs
- Recommend a candidate fact grain
- Classify questions as blocking or non-blocking
- Produce explicit assumptions

### Output schema

```python
class ModellingBrief(BaseModel):
    domain: str
    objective: str
    business_process: str
    consumption: list[str]
    kpis: list[str]
    source_systems: list[str]
    requested_outputs: list[str]
    candidate_grain: str | None
    blocking_questions: list["ClarificationQuestion"]
    assumptions: list[str]
```

### Escalate when

- Analytical objective is unclear
- Grain cannot be safely inferred
- No source context exists and generation would be speculative
- User intent is outside supported dimensional modelling

---

## 10.2 Source Analysis Agent

### Purpose

Interpret source metadata and deterministic profiling results.

### Inputs

- Modelling brief
- Parsed source metadata
- Profiling results
- Existing source-analysis findings

### Responsibilities

- Classify source tables
- Identify candidate business entities
- Detect header/detail patterns
- Identify candidate keys
- Identify possible foreign keys
- Infer source relationships
- Translate technical names into business terms
- Rank source objects by relevance
- Provide evidence for all recommendations

### Allowed deterministic tools

- CSV metadata parser
- JSON schema parser
- DDL parser
- Data profiler
- Candidate-key calculator
- Column-overlap calculator
- Relationship-inference tool

### Rule

The agent interprets tool outputs. It must not invent profiling statistics.

---

## 10.3 Model Design Agent

### Purpose

Generate the initial dimensional logical model.

### Inputs

- Approved modelling brief
- Source-analysis report
- Existing model state
- Modelling constraints

### Responsibilities

- Confirm or propose fact grain
- Create one fact entity
- Create supporting dimensions
- Propose attributes
- Propose primary and foreign keys
- Create relationships
- Define cardinalities
- Identify measures
- Record assumptions
- Assign evidence and confidence

### Output

- `LogicalModelProposal`
- Proposed model operations
- Open decisions
- Assumptions
- Evidence

### MVP constraints

- Dimensional model only
- Prefer one fact table
- Keep initial model compact
- Do not create entities unsupported by requirements or source evidence without marking them as assumptions

---

## 10.4 Mapping and DQ Agent

### Purpose

Generate source-to-target mappings and basic DQ rules.

### Inputs

- Logical model
- Source metadata
- Source-analysis report
- Modelling brief

### Mapping types

- Direct
- Rename
- Data-type conversion
- Concatenate
- Lookup placeholder
- Calculated
- Default
- Manual
- Unsupported

### DQ rule types

- Not null
- Unique
- Referential integrity
- Accepted values
- Valid range
- Positive value
- Date validity
- Freshness placeholder

### Required mapping fields

- Source table
- Source column
- Target entity
- Target attribute
- Transformation type
- Transformation expression
- Confidence
- Evidence
- Status
- Review reason

### Required DQ fields

- Entity
- Attribute
- Rule type
- Expression
- Severity
- Rationale
- Confidence
- Status

---

## 10.5 Critic and Validation Agent

### Purpose

Independently review generated artefacts.

### Inputs

- Logical model
- Mappings
- DQ rules
- Source evidence
- Modelling brief

### Responsibilities

- Validate fact grain
- Validate fact/dimension classification
- Detect missing keys
- Detect invalid foreign keys
- Detect disconnected entities
- Detect duplicated attributes
- Detect ambiguous mappings
- Check naming consistency
- Detect unsupported assumptions
- Check whether measures align to grain
- Produce structured findings
- Recommend rework or human review

### Finding schema

```python
class ValidationFinding(BaseModel):
    severity: str
    category: str
    message: str
    affected_artifact_type: str
    affected_artifact_id: str | None
    evidence: list[str]
    recommended_action: str
    requires_human: bool
```

### A2A demonstration

This is the preferred agent to expose through a remote A2A-style interface in the MVP.

---

## 11. LangGraph Orchestration

## 11.1 Graph stages

```text
START
  ↓
Load Project State
  ↓
Understand Scenario
  ↓
Check Blocking Questions
  ├── Yes → Interrupt for User Input → Resume
  └── No
  ↓
Parse and Analyse Sources
  ↓
Select/Confirm Modelling Pattern
  ↓
Generate Logical Model
  ↓
Generate Mappings and DQ Rules
  ↓
Validate
  ├── Rework Required → Route to Relevant Agent
  ├── Human Decision → Interrupt → Resume
  └── Passed
  ↓
Persist Version
  ↓
Present Results
  ↓
Wait for Refinement or Export
```

## 11.2 Graph state

```python
class ModellingGraphState(TypedDict):
    project_id: str
    thread_id: str
    user_message: str | None
    conversation_messages: list[dict]
    modelling_brief: dict | None
    sources: list[dict]
    source_analysis: dict | None
    logical_model: dict | None
    mappings: list[dict]
    dq_rules: list[dict]
    validation_findings: list[dict]
    open_decisions: list[dict]
    pending_operations: list[dict]
    workflow_stage: str
    run_status: str
    error: dict | None
```

## 11.3 Routing rules

Use deterministic routing where possible.

Examples:

- No modelling brief → Requirement Agent
- Blocking question exists → Human interrupt
- No parsed source metadata → Ask user to upload or explicitly allow assumption-based generation
- Model absent → Model Design Agent
- Mappings absent → Mapping and DQ Agent
- Model or mappings changed → Validation Agent
- Validation error tied to mappings → Mapping and DQ Agent
- Material business decision → Human interrupt
- User asks for a view only → Do not invoke full graph

## 11.4 ReAct behaviour

Implement bounded observe-act-reflect behaviour.

Persist only a concise action record:

- Selected action
- Reason summary
- Input artefact references
- Tool or agent invoked
- Result status
- Confidence
- Duration
- Error

Do not persist or expose hidden chain-of-thought.

## 11.5 Checkpointing

Use LangGraph persistence.

Requirements:

- One thread ID per project conversation
- Checkpoint after every graph node
- Resume after clarification or decision
- Recover interrupted runs
- Allow cancellation
- Prevent two concurrent modifying runs for the same project

---

## 12. Deterministic Tools

## 12.1 Schema parser

Parse:

- CSV metadata
- JSON schema
- SQL DDL
- Optional Excel metadata

Normalize into:

```python
class SourceColumn(BaseModel):
    source_id: str
    table_name: str
    column_name: str
    data_type: str
    nullable: bool | None
    description: str | None
    ordinal_position: int | None
```

## 12.2 Data profiler

For uploaded sample CSV data calculate:

- Row count
- Null count and percentage
- Distinct count and percentage
- Minimum
- Maximum
- Mean for numeric values
- Example values
- Candidate-key score

## 12.3 Relationship inference

Use deterministic signals:

- Exact column-name match
- Normalized-name match
- Value overlap
- Uniqueness
- Data-type compatibility
- Table-name and column-description similarity

Return scored candidates. The agent interprets candidates.

## 12.4 Model operation engine

The operation engine, not the LLM, mutates structured artefacts.

Required capabilities:

- Validate operation schema
- Validate target existence
- Calculate affected artefacts
- Apply operation to a draft copy
- Revalidate references
- Persist operation log
- Create model version
- Support undo and redo
- Reject invalid operations

## 12.5 Export tools

Generate:

- JSON
- Mapping CSV
- DQ CSV
- Mermaid
- Markdown summary
- Optional DDL

---

## 13. Domain Data Models

Implement at minimum the following.

## 13.1 Project

```python
class Project(BaseModel):
    id: str
    name: str
    description: str | None
    status: str
    active_version_id: str | None
    provider_configuration_id: str | None
    created_at: datetime
    updated_at: datetime
```

## 13.2 Message

```python
class Message(BaseModel):
    id: str
    project_id: str
    role: str
    content: str
    message_type: str
    structured_payload: dict | None
    created_at: datetime
```

## 13.3 Logical model

```python
class LogicalModel(BaseModel):
    id: str
    project_id: str
    version: int
    name: str
    pattern: str
    grain: str
    entities: list["Entity"]
    relationships: list["Relationship"]
    assumptions: list[str]
```

## 13.4 Entity

```python
class Entity(BaseModel):
    id: str
    name: str
    entity_type: str
    description: str
    attributes: list["Attribute"]
    position: dict | None
```

## 13.5 Attribute

```python
class Attribute(BaseModel):
    id: str
    name: str
    data_type: str
    key_type: str | None
    nullable: bool
    business_definition: str
    confidence: float | None
    evidence: list[str]
```

## 13.6 Relationship

```python
class Relationship(BaseModel):
    id: str
    from_entity_id: str
    to_entity_id: str
    relationship_type: str
    from_cardinality: str
    to_cardinality: str
    foreign_key_attribute_id: str | None
```

## 13.7 Mapping

```python
class Mapping(BaseModel):
    id: str
    source_table: str
    source_column: str
    target_entity_id: str
    target_attribute_id: str
    transformation_type: str
    transformation_expression: str | None
    confidence: float
    evidence: list[str]
    status: str
    review_reason: str | None
```

## 13.8 DQ rule

```python
class DQRule(BaseModel):
    id: str
    entity_id: str
    attribute_id: str | None
    rule_type: str
    expression: str
    severity: str
    rationale: str
    confidence: float
    status: str
```

## 13.9 Decision

```python
class Decision(BaseModel):
    id: str
    project_id: str
    question: str
    description: str
    options: list[dict]
    recommendation: str | None
    evidence: list[str]
    severity: str
    status: str
    selected_option: str | None
```

## 13.10 Model operation

```python
class ModelOperation(BaseModel):
    id: str
    project_id: str
    base_version_id: str
    operation_type: str
    target_type: str
    target_id: str | None
    payload: dict
    affected_artifacts: list[str]
    status: str
    created_at: datetime
```

---

## 14. Natural-Language Refinement

## 14.1 Required examples

The MVP must support:

- Rename an entity
- Add an attribute
- Remove an attribute
- Change a data type
- Change a primary key
- Add or remove a relationship
- Change cardinality
- Add a DQ rule
- Remove a DQ rule
- Accept or reject a mapping
- Update a mapping
- Filter and display low-confidence mappings

## 14.2 Refinement flow

```text
User instruction
  ↓
Intent and operation extraction
  ↓
Operation schema validation
  ↓
Impact calculation
  ↓
Approval if material
  ↓
Apply to draft version
  ↓
Run deterministic validation
  ↓
Run critic agent if needed
  ↓
Persist new version
  ↓
Refresh viewer
```

## 14.3 Material operations requiring confirmation

- Change fact grain
- Delete fact entity
- Delete multiple entities
- Replace primary key
- Break an existing relationship
- Bulk reject mappings
- Remove mandatory DQ rules

---

## 15. API Specification

## 15.1 Health and providers

```text
GET  /api/health
GET  /api/providers
POST /api/providers/test
GET  /api/providers/{provider}/models
GET  /api/settings/provider
PUT  /api/settings/provider
```

## 15.2 Projects

```text
POST   /api/projects
GET    /api/projects
GET    /api/projects/{project_id}
PATCH  /api/projects/{project_id}
DELETE /api/projects/{project_id}
POST   /api/projects/{project_id}/duplicate
```

## 15.3 Conversations

```text
GET  /api/projects/{project_id}/messages
POST /api/projects/{project_id}/messages
GET  /api/projects/{project_id}/events
POST /api/projects/{project_id}/runs/{run_id}/cancel
POST /api/projects/{project_id}/runs/{run_id}/resume
```

Use SSE for `/events`.

Suggested SSE event types:

- `message.delta`
- `message.completed`
- `run.started`
- `run.progress`
- `agent.started`
- `agent.completed`
- `tool.started`
- `tool.completed`
- `decision.required`
- `artifact.updated`
- `validation.updated`
- `run.completed`
- `run.failed`

## 15.4 Sources

```text
POST   /api/projects/{project_id}/sources
GET    /api/projects/{project_id}/sources
GET    /api/projects/{project_id}/sources/{source_id}
DELETE /api/projects/{project_id}/sources/{source_id}
POST   /api/projects/{project_id}/sources/{source_id}/profile
```

## 15.5 Artefacts

```text
GET /api/projects/{project_id}/model
GET /api/projects/{project_id}/mappings
GET /api/projects/{project_id}/dq-rules
GET /api/projects/{project_id}/validation-findings
GET /api/projects/{project_id}/versions
GET /api/projects/{project_id}/versions/{version_id}
GET /api/projects/{project_id}/diff?from={a}&to={b}
```

## 15.6 Operations

```text
POST /api/projects/{project_id}/operations/preview
POST /api/projects/{project_id}/operations/apply
POST /api/projects/{project_id}/undo
POST /api/projects/{project_id}/redo
```

## 15.7 Decisions

```text
GET  /api/projects/{project_id}/decisions
POST /api/projects/{project_id}/decisions/{decision_id}/resolve
```

## 15.8 Export

```text
GET /api/projects/{project_id}/export/model.json
GET /api/projects/{project_id}/export/mappings.csv
GET /api/projects/{project_id}/export/dq-rules.csv
GET /api/projects/{project_id}/export/model.mmd
GET /api/projects/{project_id}/export/summary.md
GET /api/projects/{project_id}/export/model.sql
```

---

## 16. Prompt and Agent Instruction Management

Store prompts as versioned files.

```text
backend/app/agents/prompts/
├── requirement_agent_v1.md
├── source_analysis_agent_v1.md
├── model_design_agent_v1.md
├── mapping_dq_agent_v1.md
├── validation_agent_v1.md
└── operation_extractor_v1.md
```

Every agent output must:

- Use a Pydantic schema
- Include evidence
- Include assumptions
- Include confidence where relevant
- Avoid unsupported claims
- Identify when human input is required
- Never mutate the database directly
- Never execute arbitrary SQL or shell commands

---

## 17. A2A-Ready Agent Contract

Even when agents run internally, define a normalized task envelope.

```python
class AgentTask(BaseModel):
    task_id: str
    capability: str
    project_id: str
    context_refs: list[str]
    input_payload: dict
    success_criteria: list[str]
    callback_url: str | None = None
```

```python
class AgentTaskResult(BaseModel):
    task_id: str
    status: str
    output_payload: dict | None
    artifact_refs: list[str]
    evidence: list[str]
    confidence: float | None
    open_decisions: list[dict]
    errors: list[dict]
```

Supported statuses:

- Submitted
- Working
- Input Required
- Completed
- Failed
- Cancelled

For the MVP, expose the validation agent through:

```text
GET  /.well-known/agent-card.json
POST /a2a/tasks
GET  /a2a/tasks/{task_id}
```

Keep this isolated behind an adapter so the contract can later be aligned to a formal A2A SDK.

---

## 18. Security Requirements

Local MVP requirements:

- Backend binds to localhost by default
- LM Studio base URL defaults to localhost
- API keys stored only in backend environment or encrypted local configuration
- Never return saved secrets to frontend
- Validate uploaded file type and size
- Sanitize filenames
- Store uploads outside the source tree
- Prevent path traversal
- No arbitrary shell execution
- No arbitrary SQL execution
- Use allow-listed transformation operations
- Use CORS restricted to the frontend origin
- Add request-size limits
- Add structured audit logs for model-changing operations

---

## 19. Reliability and Error Handling

Required:

- Pydantic validation for all agent output
- Retry malformed structured responses
- JSON-repair retry with a strict maximum
- Provider timeouts
- Provider health checks
- User-readable provider errors
- Checkpoint every graph step
- Idempotent run nodes where possible
- Prevent duplicate operation application
- Transactional version creation
- Rollback failed operation batches
- Cancel active runs
- Resume interrupted runs
- Detect stale version updates

---

## 20. Observability

Capture:

- Project ID
- Thread ID
- Run ID
- Agent ID and version
- Provider
- Model
- Prompt version
- Node started/completed
- Tool started/completed
- Latency
- Token usage when available
- Retry count
- Schema-validation failure
- Decision created/resolved
- Operation previewed/applied
- Model version created
- Export generated
- Error category

Do not log:

- API keys
- Hidden chain-of-thought
- Full uploaded datasets by default

Provide a local developer run-inspector endpoint or page where useful.

---

## 21. Testing Strategy

## 21.1 Backend unit tests

Test:

- Parsers
- Profilers
- Operation engine
- Validation tools
- Provider adapters
- Agent-output validation
- Routing rules
- Export functions

## 21.2 Agent contract tests

Use fixed fixtures and mocked LLM responses.

Verify:

- Valid Pydantic output
- Required evidence
- Required escalation
- No unsupported entity creation
- Consistent IDs
- Correct operation types

## 21.3 Workflow tests

Test:

- New project
- Clarification interrupt and resume
- Source upload
- Model generation
- Validation rework
- Human decision and resume
- Refinement operation
- Export
- Provider failure
- Cancel and resume

## 21.4 Frontend tests

Test:

- Home submission
- Project open
- SSE rendering
- Clarification card
- Decision card
- Model canvas
- Mapping review
- DQ review
- Provider settings
- Error and retry states

## 21.5 End-to-end scenario

Use SAP-like sample metadata:

- VBAK
- VBAP
- KNA1
- MARA

Expected result:

- `FactSalesOrderLine`
- `DimCustomer`
- `DimProduct`
- `DimDate`
- Optional `DimSalesTerritory`
- Mapping proposals
- DQ proposals
- At least one human decision
- Successful natural-language rename
- Successful export

---

## 22. Development Phases

## Phase 1 — Foundation

Build:

- Monorepo
- React shell
- FastAPI shell
- SQLite and Alembic
- Provider abstraction
- LM Studio connection
- OpenAI and Anthropic adapters
- Health and provider settings
- Project CRUD

Acceptance:

- User can select a provider
- Test connection succeeds
- Project can be created and reopened

## Phase 2 — Chat and workflow

Build:

- Conversation UI
- SSE
- Message persistence
- LangGraph state and checkpoints
- Requirement Agent
- Clarification interrupt/resume

Acceptance:

- User submits a scenario
- Assistant asks a blocking question
- Workflow resumes after answer

## Phase 3 — Source analysis

Build:

- File upload
- Metadata parsers
- Source preview
- Basic profiler
- Relationship inference
- Source Analysis Agent

Acceptance:

- User uploads metadata
- Parsed tables and columns are visible
- Source-analysis report is generated

## Phase 4 — Model generation

Build:

- Model Design Agent
- Logical-model schemas
- Model versioning
- React Flow canvas
- Artefact summary card

Acceptance:

- A valid dimensional model is generated and rendered

## Phase 5 — Mapping, DQ and validation

Build:

- Mapping and DQ Agent
- Mapping grid
- DQ grid
- Validation Agent
- Decision cards
- A2A validation demonstration

Acceptance:

- Mappings and DQ rules are generated
- Low-confidence items are visible
- Human decision can be resolved

## Phase 6 — Refinement and export

Build:

- Operation extractor
- Operation engine
- Undo/redo
- Version history
- Diff
- Export formats

Acceptance:

- Natural-language changes update the model without full regeneration
- Exports download correctly

## Phase 7 — Hardening

Build:

- Error handling
- Logging
- Automated tests
- Seed data
- Setup documentation
- Packaging scripts

Acceptance:

- A developer can clone, configure and run the complete MVP locally

---

## 23. MVP Acceptance Criteria

The MVP is complete when a user can:

1. Configure LM Studio or another provider.
2. Create a project.
3. Describe a sales-analytics scenario.
4. Upload SAP-like source metadata.
5. Answer no more than a few blocking questions.
6. Receive a dimensional logical model.
7. View facts, dimensions, attributes and relationships.
8. Review mappings.
9. Review DQ rules.
10. Resolve low-confidence or material decisions.
11. Change the model using natural language.
12. See the update applied as structured operations.
13. Undo and redo a change.
14. Reopen the project with state preserved.
15. Export JSON, CSV, Mermaid and Markdown assets.
16. Complete the same workflow using LM Studio, OpenAI or Anthropic configuration without changing agent code.

---

## 24. Coding Standards

- Use strict TypeScript.
- Use typed Python throughout.
- Use Pydantic at every API and agent boundary.
- Keep route handlers thin.
- Keep prompts out of source-code strings.
- Keep provider-specific code inside provider adapters.
- Keep LLMs away from direct persistence mutations.
- Use dependency injection.
- Use UUIDs for persistent IDs.
- Use UTC timestamps.
- Include database migrations.
- Add comments only where intent is not obvious.
- Do not introduce frameworks or services not required by this file.
- Prefer simple, testable modules over premature abstraction.

---

## 25. Local Development Commands

Provide Makefile targets similar to:

```text
make install
make dev
make frontend
make backend
make test
make lint
make format
make migrate
make seed
```

Expected local ports:

```text
Frontend:  http://localhost:5173
Backend:   http://localhost:8000
LM Studio: http://localhost:1234
```

---

## 26. Environment Template

Create `.env.example`.

```env
APP_ENV=development
APP_HOST=127.0.0.1
APP_PORT=8000
FRONTEND_ORIGIN=http://localhost:5173

DATABASE_URL=sqlite:///./data/app.db
APP_DATA_DIR=./data
MAX_UPLOAD_MB=25

LLM_PROVIDER=lm_studio
LLM_REQUEST_TIMEOUT_SECONDS=120
LLM_TEMPERATURE=0.1

LM_STUDIO_BASE_URL=http://localhost:1234/v1
LM_STUDIO_API_KEY=lm-studio
LM_STUDIO_MODEL=

OPENAI_API_KEY=
OPENAI_MODEL=
OPENAI_BASE_URL=https://api.openai.com/v1

ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=

CUSTOM_LLM_BASE_URL=
CUSTOM_LLM_API_KEY=
CUSTOM_LLM_MODEL=

LOG_LEVEL=INFO
```

---

## 27. Seed Scenario

Include a sample project:

### User scenario

> Build a sales analytics dimensional model using SAP order, customer and product data. The model should support revenue, order quantity, customer-segment and product-category reporting.

### Source tables

- VBAK — sales-order header
- VBAP — sales-order item
- KNA1 — customer master
- MARA — material master

### Expected clarification

> Should each fact row represent an order or an order line?

### Expected answer

> Order line.

### Expected model

- FactSalesOrderLine
- DimCustomer
- DimProduct
- DimDate
- Optional DimSalesTerritory

### Expected generated assets

- Logical model
- 20+ mappings
- Basic DQ rules
- At least one low-confidence mapping
- At least one decision card

---

## 28. Implementation Guidance for Codex

When implementing:

1. Start with the data contracts and database schema.
2. Add provider adapters and verify LM Studio connectivity.
3. Build deterministic tools before agent prompts.
4. Build the LangGraph workflow with mocked agents.
5. Add one real agent at a time.
6. Build the chat workspace against mocked SSE events.
7. Connect real workflow events.
8. Add model canvas and grids after structured artefacts are stable.
9. Add refinement operations only after versioning works.
10. Keep every phase runnable and tested.

Do not build every feature simultaneously.

The most important architectural rule is:

> LLMs decide and propose. Deterministic services calculate, validate and mutate. Structured artefacts and versions remain authoritative.
