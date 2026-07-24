# Knowledge Builder — Codex Development Specification

## 1. Purpose

Build an enterprise-grade web application named **Knowledge Builder** that helps organizations define, construct, validate, govern, publish and operate enterprise knowledge products and knowledge graphs.

The application must convert assets produced across enterprise data-engineering processes into governed knowledge assets. It should support structured data, unstructured content, metadata, lineage, semantic models, business glossaries, quality rules, master data, policies, APIs and operational events.

The product must feel like a mature enterprise SaaS platform rather than a graph visualizer or chatbot. The primary UX model is:

> Project-centric workspace + structured review workflows + contextual AI assistance.

The AI assistant may recommend, explain, diagnose and ask questions, but approved decisions must always be persisted as structured project assets, mappings, rules, tests, policies or governance records.

---

## 2. Product principles

1. **Use-case first** — every knowledge project starts with a business scenario, expected questions, target consumers and success criteria.
2. **Knowledge graph is one output** — also manage ontologies, taxonomies, entity models, mappings, evidence, provenance, embeddings, policies and context APIs.
3. **Human-governed AI** — agent-generated recommendations require clear confidence, evidence and approval status.
4. **Explain every inference** — users must see why a mapping, entity match or relationship was proposed.
5. **Closed-loop improvement** — build, test, diagnose, recalibrate, rebuild and regression-test.
6. **Polyglot backend** — allow adapters for Neo4j, Cognee, graph stores, vector stores, relational stores and search indexes.
7. **Incremental processing** — rebuild only impacted assets whenever possible.
8. **Enterprise readiness** — RBAC, audit, provenance, versioning, monitoring, policy enforcement and deployment environments are first-class.
9. **Workspace over chatbot** — AI assistance is contextual and secondary to the structured application UI.
10. **Consistency over novelty** — use the same design system, spacing, buttons, cards, tables, status chips and side panels across all screens.

---

## 3. Primary personas

### Business / domain user
- Defines use case, expected questions, outcomes and acceptance criteria.
- Reviews recommendations and scenario results.

### Data architect
- Reviews sources, schemas, lineage, identity strategy and source-to-knowledge mappings.

### Knowledge engineer
- Manages ontology, entity classes, relationship types, graph schemas and constraints.

### AI engineer
- Configures retrieval, context assembly, embeddings, agent tools and evaluation.

### Governance steward
- Reviews definitions, classifications, provenance, policies, exceptions and approvals.

### Platform operator
- Monitors pipelines, freshness, quality, incidents, latency, costs and drift.

---

## 4. Recommended technology stack

### Frontend
- Next.js 15+ with App Router
- React 19+
- TypeScript with strict mode
- Tailwind CSS
- shadcn/ui or Radix UI primitives
- Lucide icons
- TanStack Table
- TanStack Query
- React Hook Form + Zod
- Zustand for local workflow state
- React Flow for ontology and graph-schema canvases
- Recharts or ECharts for dashboards

### Backend
- Python 3.12+
- FastAPI
- Pydantic v2
- SQLAlchemy 2.x
- PostgreSQL for platform metadata and transactional state
- Redis for caching, queues and short-lived workflow state
- Celery, Dramatiq or Temporal for long-running jobs
- Object storage: S3-compatible storage or Azure Blob
- OpenTelemetry for tracing

### Agentic orchestration
Use a deterministic workflow orchestrator with specialist agents. Suitable implementation choices include:
- LangGraph
- Temporal workflows with model/tool activities
- OpenAI Agents SDK or equivalent provider abstraction

Do not implement one large autonomous agent. Each agent must have bounded responsibilities, explicit tool permissions, typed inputs and outputs, confidence scores and traceable decisions.

### Knowledge and retrieval adapters
Implement a provider-neutral adapter layer for:
- Neo4j
- Cognee
- RDF/SPARQL stores
- PostgreSQL or lakehouse knowledge tables
- Vector stores
- Full-text search engines

### Model provider abstraction
Support environment-configurable providers:
- OpenAI API
- Azure OpenAI
- Anthropic
- Google models
- Local OpenAI-compatible endpoints such as LM Studio

Never hard-code a single provider into domain logic.

---

## 5. Repository structure

```text
knowledge-builder/
├── apps/
│   ├── web/                       # Next.js frontend
│   └── api/                       # FastAPI backend
├── packages/
│   ├── ui/                        # Shared design-system components
│   ├── types/                     # Shared schemas and generated types
│   ├── config/                    # ESLint, TypeScript, Tailwind configs
│   └── sdk/                       # Typed frontend API client
├── services/
│   ├── orchestrator/
│   ├── connectors/
│   ├── knowledge-processing/
│   ├── evaluation/
│   └── publishing/
├── workers/
│   ├── ingestion-worker/
│   ├── extraction-worker/
│   ├── graph-worker/
│   └── evaluation-worker/
├── adapters/
│   ├── graph/
│   ├── vector/
│   ├── search/
│   ├── model-providers/
│   └── object-storage/
├── design/
│   ├── screenshots/               # Reference UI screenshots supplied by user
│   ├── tokens.md
│   └── component-inventory.md
├── infra/
│   ├── docker/
│   ├── terraform/
│   └── kubernetes/
├── tests/
│   ├── e2e/
│   ├── integration/
│   └── fixtures/
├── CODEX.md
├── AGENTS.md
├── README.md
└── docker-compose.yml
```

---

# 6. Visual design system

## 6.1 Overall visual character

The application must look like a modern enterprise platform:
- White and very light grey surfaces
- Navy typography and navigation
- Orange as the primary interaction colour
- Green for validated / healthy states
- Red only for errors and severe risks
- Purple used sparingly for AI-generated recommendations
- Flat, clean surfaces with light borders
- Minimal shadows
- Dense but well-grouped information
- Strong alignment and consistent spacing

Avoid:
- Dark dashboards
- Heavy gradients
- Glassmorphism
- Excessive card shadows
- Giant node-link visualizations on landing screens
- Permanently expanded chat windows
- Decorative illustrations that compete with content

## 6.2 Font

Primary font stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", sans-serif;
```

Fallback if Inter is unavailable: use system sans-serif.

### Typography scale

| Usage | Size | Weight | Line height |
|---|---:|---:|---:|
| App page title | 28px | 700 | 36px |
| Section title | 18px | 650 | 26px |
| Card title | 15px | 650 | 22px |
| Navigation label | 14px | 500 | 20px |
| Body text | 14px | 400 | 21px |
| Form label | 12px | 600 | 18px |
| Table header | 11px | 650 | 16px |
| Table/body compact | 12px | 400–500 | 18px |
| Helper text | 11px | 400 | 16px |
| KPI value | 26px | 700 | 32px |
| Status chip | 11px | 600 | 16px |

Rules:
- Do not use font sizes below 11px.
- Page titles use navy and never orange.
- Orange is for emphasis, actions and active states, not long body text.

## 6.3 Colour palette

### Core colours

| Token | Hex | Usage |
|---|---|---|
| `navy-950` | `#071A3A` | Primary headings, active side navigation |
| `navy-900` | `#0B1F44` | Main text and icons |
| `navy-700` | `#29456F` | Secondary text |
| `orange-600` | `#F4510B` | Primary buttons, selected indicators |
| `orange-500` | `#FF641A` | Hover state, highlights |
| `orange-100` | `#FFF0E8` | Soft orange background |
| `green-700` | `#15783E` | Healthy / passed text |
| `green-100` | `#EAF7EF` | Healthy / passed chip background |
| `red-600` | `#D92D20` | Critical errors |
| `red-100` | `#FEECEB` | Error background |
| `amber-600` | `#C77800` | Warning text |
| `amber-100` | `#FFF5D6` | Warning background |
| `purple-700` | `#6C3BC2` | AI recommendation accent |
| `purple-100` | `#F2EBFF` | AI assistant background |
| `blue-600` | `#2457D6` | Informational status |
| `blue-100` | `#EAF0FF` | Informational background |

### Neutral colours

| Token | Hex | Usage |
|---|---|---|
| `white` | `#FFFFFF` | Main surfaces |
| `grey-25` | `#FCFCFD` | Page canvas |
| `grey-50` | `#F8F9FB` | Secondary surface |
| `grey-100` | `#F1F3F6` | Table header / hover |
| `grey-200` | `#E3E7ED` | Borders |
| `grey-300` | `#CDD3DC` | Disabled borders |
| `grey-500` | `#7A8494` | Muted text |
| `grey-700` | `#3F4958` | Secondary body text |

## 6.4 Spacing system

Use an 8px base grid.

Allowed spacing values:
- 4px: icon/text micro-gap
- 8px: compact internal gap
- 12px: form-control gap
- 16px: standard component padding
- 20px: compact card padding
- 24px: standard card padding
- 32px: major section separation
- 40px: page-level separation

Do not use arbitrary spacing unless required for responsive layout.

## 6.5 Border radius

| Element | Radius |
|---|---:|
| Buttons | 6px |
| Inputs / selects | 6px |
| Status chips | 6px or pill shape |
| Cards / panels | 10px |
| Modal | 12px |
| Avatar | 999px |

## 6.6 Borders and shadows

Default border:

```css
border: 1px solid #E3E7ED;
```

Default card shadow:

```css
box-shadow: 0 1px 2px rgba(7, 26, 58, 0.04);
```

Do not use pronounced shadows for regular cards. Use a stronger shadow only for modals, dropdowns and floating menus.

---

# 7. Application shell specification

## 7.1 Desktop baseline

Design baseline: `1536 × 1024`.

Responsive breakpoints:
- Desktop wide: `>= 1440px`
- Desktop: `1200–1439px`
- Tablet landscape: `960–1199px`
- Tablet / mobile: `< 960px`

The first implementation should optimize for desktop enterprise use. Tablet support may collapse side panels. Mobile support is read-only / limited workflow unless later expanded.

## 7.2 Top header

- Height: `72px`
- Position: sticky, top 0
- Background: white
- Bottom border: grey-200
- Logo area width aligned to left navigation
- Global search width: `480–560px` on desktop
- Header icons: 20px with 40px hit area
- User avatar: 36px

Header items:
- Product logo and name
- Global search
- Notification icon
- Help icon
- User avatar, name and role
- Workspace/environment dropdown when needed

## 7.3 Left navigation

Expanded width: `220px`
Collapsed width: `72px`
Position: fixed or sticky below header
Background: white
Right border: grey-200

Primary items:
1. Home
2. Knowledge Projects
3. Enterprise Assets
4. Knowledge Products
5. Governance
6. Operations

Secondary items below divider:
- Settings
- Administration

At bottom:
- Quick Actions card
- Collapse button

Navigation item dimensions:
- Height: `44px`
- Horizontal padding: `14px`
- Icon: `20px`
- Gap: `12px`
- Active background: navy-950
- Active text: white
- Active accent icon: orange-500

Do not add additional global navigation items without clear product-level justification.

## 7.4 Main content area

- Page canvas: grey-25
- Horizontal padding: 24px on standard desktop, 32px on wide desktop
- Content maximum width: none for data-heavy screens; use full available width
- Header-to-content gap: 20px

## 7.5 Right contextual panel

Used on asset, product, governance and operations screens.

- Width: `320–360px`
- Fixed within content region where practical
- White background
- Left border grey-200
- Header with title and close icon
- Internal padding: 20px

On screens with AI assistance:
- AI assistant panel width: `300–330px`
- Purple icon and `Beta` badge
- Recommendations presented as structured actions, never free-form chat by default

---

# 8. Component standards

## 8.1 Buttons

### Primary button
- Height: `40px`
- Minimum width: `120px`
- Horizontal padding: `16px`
- Background: orange-600
- Text: white, 13px, 600
- Icon: 16px
- Gap: 8px
- Hover: orange-500
- Active: darken by approximately 6%
- Disabled opacity: 45%

### Secondary button
- Height: `40px`
- Background: white
- Border: grey-200
- Text: navy-900

### Outline-orange button
- Height: `40px`
- Background: white
- Border: orange-500
- Text: orange-600

### Compact table action
- Height: `32px`
- Padding: 10px
- Font: 12px

### Icon button
- Default: `36 × 36px`
- Compact: `32 × 32px`
- Minimum accessible hit area: `40 × 40px` when isolated

Only one dominant primary button per page region.

## 8.2 Form controls

- Standard height: `40px`
- Large textarea minimum height: `92px`
- Border: grey-200
- Focus ring: 2px translucent orange
- Labels above controls
- Required marker: orange-red asterisk
- Helper text below control
- Error text in red-600
- Multi-select values represented as removable chips

## 8.3 Cards

### KPI card
- Height: `116px`
- Padding: `18–20px`
- Icon badge: `44px`
- KPI value: 26px bold
- Secondary caption: 12px

### Standard content card
- Padding: 20px or 24px
- Header height based on content, not fixed
- Border grey-200
- Radius 10px

### Attention / recommendation card
- Orange, amber, red or purple soft background depending on category
- Never use full saturated background for large cards

## 8.4 Tables

- Header height: `42px`
- Row height: `52–60px`
- Header background: grey-50
- Row separator: grey-200
- Hover: grey-50
- Selected row: orange-100 with 3px orange left border
- Sticky table header for long lists
- Column text truncation with tooltip
- Rightmost kebab menu for actions
- Pagination height: 48px

Always support:
- Search
- Filters
- Sort
- Saved views where relevant
- Export where relevant
- Empty state
- Loading skeleton
- Error state

## 8.5 Status chips

Use standard statuses:
- Draft: grey
- In Progress / Build / Design: blue
- Testing / Review: purple
- Published / Healthy / Passed / Active: green
- Warning / Needs Attention: amber or orange
- Failed / Degraded / Critical: red
- Deprecated: grey with warning icon

Chip height: `24px`
Horizontal padding: `8px`

## 8.6 Progress stepper

Used for new-project creation.

- Six top-level steps
- Completed: green circle with check
- Current: orange filled circle
- Future: white circle with grey border
- Step title: 12px, 600
- Step subtitle: 11px, muted
- Connector: 1px grey line

Top-level steps:
1. Use Case & Objectives
2. Scope & Domains
3. Sources & Assets
4. Success Criteria
5. Governance & Access
6. Review & Create

## 8.7 Charts

- Use orange for primary metric series
- Green for healthy / pass series
- Navy and teal for supporting series
- Red only for failures
- Keep axes and grids subtle
- Always provide labels or legends
- Do not rely on colour alone; use icons, labels or patterns

---

# 9. Global screens

## 9.1 Home

Purpose: operational landing page.

Must contain:
- Welcome title
- Portfolio KPI cards
- Projects requiring attention
- System activity
- Knowledge coverage overview
- Scenario performance
- Top knowledge domains
- Feedback prompt

## 9.2 Knowledge Projects

Must contain:
- KPI cards
- New Knowledge Project button
- Import Project action
- Search and filters
- Project portfolio table
- Stage, health, test performance, owner and status

## 9.3 Enterprise Assets

Must contain:
- Asset-type KPI cards
- Category tabs
- Search and filters
- Asset table
- Selected asset detail panel
- Quality summary
- Usage in projects

## 9.4 Knowledge Products

Must contain:
- Published / development / review / deprecated KPIs
- Product table
- Product details side panel
- Capabilities such as graph query, semantic search, RAG retrieval, context API, analytics and agent tool
- Consumer usage

## 9.5 Governance

Must contain:
- Active policies
- Pending approvals
- Business terms
- Stewardship tasks
- Compliance coverage
- Sensitive asset alerts
- Tabs for policies, glossary, classifications, stewardship and audit
- Policy details panel

## 9.6 Operations

Must contain:
- Active pipelines
- Failed runs
- Freshness SLA
- Query volume
- P95 latency
- Open incidents
- Operational watchlist
- Pipeline runs, incidents, usage, drift and audit tabs
- Selected product operational details panel

---

# 10. New Knowledge Project workflow

## 10.1 Use Case & Objectives

Fields:
- Project name
- Business domain
- Primary use case
- Intended consumers
- Business problem / opportunity
- Expected outcomes
- Example questions / tasks
- Critical business entities
- Key relationships

AI panel:
- Recommend sources
- Suggest entities
- Suggest relationships
- Suggest use-case questions
- Generate draft from use case

## 10.2 Scope & Domains

Fields:
- Primary domain
- Sub-domains
- Business functions
- Regions
- Expected systems
- Time horizon
- Update frequency
- Sensitivity
- Scope boundary
- Out-of-scope exclusions
- Critical entity classes
- Priority relationship types

## 10.3 Sources & Assets

Use nested internal steps:
1. Select Sources
2. Discovered Assets
3. Select Relevant Assets
4. Asset Classification
5. Refresh & Ingestion

Source categories:
- Databases
- Data platforms
- Documents & content
- APIs & applications
- Catalogs & governance

After source connection, show relevance ranking:
- Highly relevant
- Potentially relevant
- Out of scope

Never ingest every discovered asset automatically.

## 10.4 Success Criteria

Internal sections:
1. KPI Framework
2. Quality Criteria
3. Validation Approach
4. Acceptance Thresholds

Default KPI suggestions:
- Coverage
- Precision
- Recall
- Freshness
- Completeness
- Evidence completeness
- Entity resolution accuracy
- Query success rate
- Policy compliance
- User satisfaction
- Latency
- Cost efficiency

## 10.5 Governance & Access

Internal sections:
1. Ownership
2. Access Control
3. Data Classification
4. Policies & Compliance
5. Audit & Monitoring

Access tabs:
- Roles & Groups
- Permissions
- Row & Column Level Security
- Consumption Access

## 10.6 Review & Create

Must show:
- Project summary
- Readiness score
- Validation checks
- Warnings
- What will be created
- AI-generated setup summary
- Post-create actions
- Create Project button

## 10.7 Project-created confirmation

Must show:
- Success state
- Project name and ID
- Initial metrics
- Recommended next actions
- Open Project Dashboard CTA
- View All Projects

Do not display unrealistic final entity or relationship counts immediately unless they are labelled as estimated or discovered counts.

---

# 11. Project workspace after creation

Project-level tabs:
1. Overview
2. Sources
3. Knowledge Design
4. Build & Review
5. Test & Improve
6. Publish & Serve
7. Operations

## 11.1 Overview
- Lifecycle status
- Readiness scores
- Recommended next actions
- Architecture snapshot
- Recent decisions
- Risks and blockers

## 11.2 Sources
- Connected source health
- Asset scope
- Discovery status
- Refresh configuration
- Source authority
- Sensitivity and policies

## 11.3 Knowledge Design
Three-pane layout:
- Left: knowledge asset explorer
- Centre: ontology / mapping / graph portfolio canvas
- Right: inspector and AI recommendations

Views:
- Ontology view
- Entity model view
- Relationship model view
- Source mapping view
- Identity model view
- Evidence model view
- Graph portfolio view

## 11.4 Build & Review
- Build stages and progress
- Review queues
- Entity matches
- Relationship suggestions
- Ontology changes
- Conflicting claims
- Missing mappings
- Policy classifications
- Extraction exceptions

## 11.5 Test & Improve
- Scenario library
- Test runs
- Failure analysis
- Feedback history
- Regression results
- Improvement plan drawer
- Before/after quality comparison

## 11.6 Publish & Serve
- Publication readiness
- Version
- Interfaces
- Quality score
- SLA
- Access policy
- Consumer catalogue metadata

## 11.7 Operations
- Freshness
- Source health
- Build health
- Query success
- Retrieval quality
- Agent task success
- Latency
- Cost
- Drift
- Incidents

---

# 12. Closed-loop improvement UX

Implement the lifecycle:

```text
Build → Test → Diagnose → Ask / Recommend → Recalibrate → Rebuild → Re-test → Publish
```

Failure categories:
- Missing source information
- Missing connector
- Extraction failure
- Entity-resolution failure
- Ontology gap
- Mapping failure
- Data-quality failure
- Retrieval failure
- Policy/access failure
- Ambiguous scenario definition

For every failed scenario display:
- Score and threshold
- Failure breakdown
- Root cause
- Affected source / mapping / graph asset
- Recommended remediation
- Whether the fix is automatic, requires user input or requires steward approval
- Estimated impact
- Rollback point

Autonomy levels:
1. Suggest only
2. Auto-fix reversible configuration
3. Auto-apply within approved policy
4. Human approval required

Persist decisions in a Knowledge Decision Ledger.

---

# 13. Agent architecture

Implement specialist agents:

1. Knowledge Project Planner Agent
2. Asset Discovery Agent
3. Ontology Design Agent
4. Semantic Mapping Agent
5. Entity Resolution Agent
6. Knowledge Extraction Agent
7. Provenance & Evidence Agent
8. Knowledge Quality Agent
9. Stewardship Agent
10. Graph Construction Agent
11. Scenario Evaluation Agent
12. Knowledge Optimization & Feedback Agent
13. Publication Agent

Every agent must return typed output containing:

```json
{
  "status": "success | needs_input | needs_review | failed",
  "summary": "string",
  "confidence": 0.0,
  "evidence": [],
  "proposed_changes": [],
  "questions": [],
  "warnings": [],
  "trace_id": "string"
}
```

Agents must never directly alter authoritative ontology, identity, policy or source authority without the applicable approval workflow.

---

# 14. Core domain model

Minimum entities:
- Workspace
- User
- Role
- KnowledgeProject
- UseCase
- Scenario
- SourceConnection
- SourceAsset
- AssetSelection
- Domain
- Ontology
- OntologyClass
- RelationshipType
- KnowledgeMapping
- EntityCandidate
- EntityResolutionDecision
- KnowledgeClaim
- Evidence
- ProvenanceRecord
- Policy
- Classification
- StewardshipTask
- BuildRun
- ValidationRun
- TestRun
- FailureDiagnosis
- ImprovementPlan
- KnowledgeProduct
- PublicationVersion
- Consumer
- OperationalIncident
- AuditEvent

All mutable domain objects require:
- ID
- Version
- Status
- Created by
- Created timestamp
- Updated by
- Updated timestamp
- Source / provenance where applicable
- Audit trail

---

# 15. API conventions

- REST APIs under `/api/v1`
- OpenAPI generated from FastAPI
- Cursor pagination for large collections
- Idempotency keys for create and publish actions
- Optimistic concurrency using version fields or ETags
- Async job endpoints for discovery, build, validation and publication
- Server-sent events or WebSocket for job progress

Example endpoints:

```text
POST   /api/v1/projects
GET    /api/v1/projects
GET    /api/v1/projects/{project_id}
PATCH  /api/v1/projects/{project_id}
POST   /api/v1/projects/{project_id}/sources
POST   /api/v1/projects/{project_id}/discover
POST   /api/v1/projects/{project_id}/blueprint/generate
POST   /api/v1/projects/{project_id}/build
POST   /api/v1/projects/{project_id}/tests/run
POST   /api/v1/projects/{project_id}/improvements/apply
POST   /api/v1/projects/{project_id}/publish
GET    /api/v1/jobs/{job_id}
```

---

# 16. Security and governance

- OIDC / OAuth 2.0 authentication
- Enterprise SSO readiness
- RBAC and optional ABAC
- Workspace and project isolation
- Row-level permissions
- Secrets stored in a secrets manager
- Encryption in transit and at rest
- Immutable audit events for sensitive actions
- PII and sensitive-data masking
- Approval workflows for ontology, policy and identity changes
- Agent tool allowlists
- Prompt and tool-call logging with sensitive-value redaction
- Rate limits and budget controls for model calls

---

# 17. Accessibility

Target WCAG 2.1 AA.

Requirements:
- Keyboard navigation for all actions
- Visible focus state
- Semantic HTML
- ARIA labels for icons
- Minimum 4.5:1 contrast for body text
- Do not use colour as the only status indicator
- Form errors linked to fields
- Table headers and row labels accessible to screen readers
- Respect reduced-motion preferences

---

# 18. Loading, empty and error states

Every data-dependent screen must implement:

### Loading
- Skeletons matching final layout
- No full-screen spinner for table refresh

### Empty
- Clear explanation
- Primary next action
- Optional sample data action

### Error
- Human-readable summary
- Technical correlation ID
- Retry action
- Link to logs when authorized

### Long-running workflow
- Progress stage
- Percentage only where meaningful
- Latest activity
- Cancel action where safe
- Background continuation

---

# 19. Testing strategy

### Frontend
- Vitest
- React Testing Library
- Playwright
- Visual regression tests for key screens
- Axe accessibility checks

### Backend
- Pytest
- Contract tests for adapters
- Integration tests with PostgreSQL and Redis
- Testcontainers for Neo4j where used
- Golden datasets for ontology mapping and entity resolution

### Required E2E journeys
1. Create a new project through all six steps
2. Connect a source and discover assets
3. Approve asset scope
4. Generate and review a knowledge blueprint
5. Run a build
6. Resolve an entity match
7. Execute scenario tests
8. Apply an improvement plan
9. Re-run regression tests
10. Publish a knowledge product
11. Observe operational health

---

# 20. Seed data and demo scenario

Implement a realistic **Supplier Risk Knowledge Graph** demo.

Suggested sources:
- SAP Vendor Master
- Contracts repository
- Product hierarchy
- Shipment events
- Supplier performance dataset
- Incident management system
- Procurement glossary
- Supplier policies and DQ rules

Entities:
- Supplier
- Contract
- Product
- Material
- Shipment
- Purchase Order
- Invoice
- Facility
- Incident
- Risk Factor

Relationships:
- Supplier supplies Material
- Material supports Product
- Supplier has Contract
- Contract covers Product
- Supplier has Incident
- Shipment relates to Purchase Order
- Invoice belongs to Supplier
- Supplier operates at Facility

Sample scenarios:
- Identify suppliers supporting critical products with expiring contracts.
- Find suppliers with recent severe incidents and poor delivery performance.
- Show evidence supporting a supplier risk score.
- Explain which policies restrict a supplier-risk agent from taking action.

---

# 21. Codex execution instructions

Codex should work incrementally and keep the application runnable after every task.

## Phase 1 — Foundation
1. Create monorepo structure.
2. Configure frontend, backend, linting, formatting and tests.
3. Implement design tokens and shared UI components.
4. Build application shell.
5. Add mock API and seed data.

## Phase 2 — Global screens
1. Home
2. Knowledge Projects
3. Enterprise Assets
4. Knowledge Products
5. Governance
6. Operations

Match the reference screenshots in `design/screenshots/` while using reusable components rather than copying page-specific CSS.

## Phase 3 — Project creation
Implement all six project-creation steps with:
- Form persistence
- Validation
- Save draft
- Back and continue
- AI recommendation mock service
- Review and create
- Project-created confirmation

## Phase 4 — Project workspace
Implement tabs and mock workflows for:
- Overview
- Sources
- Knowledge Design
- Build & Review
- Test & Improve
- Publish & Serve
- Operations

## Phase 5 — Backend workflows
- Projects CRUD
- Connectors catalogue
- Source discovery jobs
- Knowledge blueprint generation
- Build runs
- Test runs
- Improvement plans
- Publication versions

## Phase 6 — Agent and provider integration
- Provider abstraction
- Typed agent outputs
- Tool registry
- Trace persistence
- Approval gates

## Phase 7 — Real adapters
Start with:
- PostgreSQL
- Neo4j
- Local file uploads
- OpenAI-compatible model provider

Then add connectors and providers incrementally.

---

# 22. Definition of done

A feature is complete only when:
- UI matches the design system
- Loading, empty and error states exist
- Types and validation are implemented
- API contract is documented
- Unit tests pass
- E2E happy path exists for major workflows
- Accessibility checks pass
- Audit events are generated for sensitive actions
- No secrets or provider credentials are hard-coded
- Responsive behaviour is acceptable down to 960px
- Reusable components are used instead of duplicated page markup

---

# 23. Initial Codex prompt

Use the following as the first development task:

```text
Read CODEX.md completely before making changes. Inspect all reference screenshots in design/screenshots. Create the monorepo foundation for Knowledge Builder using Next.js, TypeScript, Tailwind, shadcn/ui, FastAPI and PostgreSQL. Implement the shared design tokens, application header, collapsible left navigation, page container, KPI card, standard card, table shell, status chip, buttons, form controls and right detail panel. Then build the Home screen using mock data so that it closely matches the supplied landing-page screenshot. Add unit tests, a Playwright smoke test and clear local-run instructions. Do not implement backend AI logic yet. Keep the code modular and production-oriented.
```

---

# 24. Codex working rules

- Read existing files before editing.
- Explain the implementation plan before large changes.
- Prefer small, testable commits or logical change groups.
- Do not silently change the approved design tokens.
- Do not introduce a new library when an existing library already solves the requirement.
- Do not create page-specific copies of shared controls.
- Run lint, type-check and tests after material changes.
- Document assumptions in `docs/decisions/`.
- Ask for clarification only when a decision materially affects architecture, security or product behaviour.
- Use mock implementations behind interfaces when external systems are unavailable.
- Never fabricate successful integrations; label mock adapters clearly.

