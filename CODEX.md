# Enterprise Knowledge Assembly Studio — Codex Development Guide

## 1. Product Objective

Build a conference-ready enterprise prototype that demonstrates how organizations can assemble distributed assets generated across data engineering, governance, semantic modelling, MDM, metadata, lineage, graph, and unstructured-data platforms into a governed enterprise knowledge layer.

The application should not look like a generic chatbot, graph database console, or data catalog clone. It should feel like an enterprise knowledge orchestration, assembly, governance, validation, and publishing platform powered by an agentic AI backend.

Primary prototype goals:

- Reproduce the visual language and major workflows shown in the screenshots folder.
- Demonstrate an end-to-end Customer 360 knowledge-layer use case.
- Show agent-driven discovery, semantic alignment, entity resolution, relationship inference, policy attachment, provenance assembly, quality checks, and publication.
- Provide a broad, explorable enterprise graph with pan, zoom, filtering, search, neighborhood expansion, and relationship inspection.
- Use realistic mocked enterprise data and deterministic demo flows.
- Keep the architecture modular so mock services can later be replaced with Atlan, Cognee, Neo4j, Databricks, Snowflake, dbt, or other enterprise integrations.

---

## 2. Screenshot Reference Rules

Create a folder in the repository named:

```text
/app-screenshots
```

Place all generated application screenshots in this folder.

Codex must use these screenshots as the primary visual reference for:

- Page hierarchy
- Navigation placement
- Typography scale
- Card density
- Table styling
- Button placement
- Orange, white, grey palette
- Project workspace tab structure
- Graph and model layout
- Wizard flow
- Dashboard proportions

Do not attempt pixel-perfect OCR reproduction. Match the overall structure, spacing, hierarchy, and enterprise aesthetic consistently.

Recommended screenshot naming convention:

```text
01-home.png
02-knowledge-projects.png
03-enterprise-assets.png
04-knowledge-products.png
05-new-project-scope.png
06-new-project-sources.png
07-new-project-success.png
08-new-project-governance.png
09-new-project-review.png
10-project-created.png
11-project-overview.png
12-assets-and-sources.png
13-graph-and-model.png
14-build-and-govern.png
15-quality-and-monitoring.png
16-publish-and-serve.png
17-usage-and-insights.png
18-activity.png
19-settings.png
```

---

## 3. Recommended Technology Stack

### Frontend

- React 19+
- TypeScript
- Vite
- React Router
- Tailwind CSS
- shadcn/ui or Radix primitives
- Lucide React icons
- TanStack Table
- React Hook Form + Zod
- Zustand for lightweight UI state
- TanStack Query for server state
- Recharts for dashboard charts
- React Flow or Cytoscape.js for graph exploration

Preferred graph library:

- Use Cytoscape.js for the primary enterprise graph if advanced graph interaction is required.
- Use React Flow only if a workflow-like node canvas is more important than large graph exploration.

For this prototype, Cytoscape.js is preferred because the graph must support:

- Hundreds or thousands of nodes
- Multiple edge types
- Dynamic expansion
- Layout switching
- Pan and zoom
- Search and focus
- Neighborhood exploration
- Cluster and community views
- Relationship styling

### Backend

Recommended prototype options:

- Python 3.12
- FastAPI
- Pydantic
- LangGraph for agent orchestration
- NetworkX for mock graph operations and metrics
- Neo4j driver abstraction
- SQLite or PostgreSQL for prototype metadata

Alternative Node backend is acceptable, but Python is preferred because the future solution will likely include AI agents, embeddings, graph processing, and ML workflows.

### AI and Agent Layer

- LangGraph or equivalent stateful agent orchestration
- Pluggable LLM provider interface
- Mock deterministic agent mode for conference reliability
- Optional providers:
  - OpenAI API
  - Azure OpenAI
  - Anthropic
  - Google Gemini
  - LM Studio local OpenAI-compatible endpoint

Use environment variables:

```text
LLM_PROVIDER=mock|openai|azure_openai|anthropic|gemini|lmstudio
LLM_BASE_URL=
LLM_API_KEY=
LLM_MODEL=
EMBEDDING_PROVIDER=mock|openai|lmstudio
EMBEDDING_MODEL=
NEO4J_URI=
NEO4J_USERNAME=
NEO4J_PASSWORD=
```

The default demo must work without external API keys.

---

## 4. Application Resolution and Responsive Behaviour

### Primary design canvas

Design first for:

```text
1600 × 1000 px
```

Also validate at:

```text
1440 × 900 px
1920 × 1080 px
1366 × 768 px
```

The conference demo should be optimized for 16:9 projection.

### Responsive rules

- Desktop-first enterprise application.
- Minimum supported prototype width: 1280 px.
- Sidebar collapses below 1280 px.
- Right summary panels may collapse into drawers below 1366 px.
- Tables should retain important columns and hide low-priority metadata on smaller widths.
- Graph canvas must always retain at least 65% of available workspace width when opened in full explorer mode.

---

## 5. Global Layout

### Left navigation

Expanded width:

```text
232 px
```

Collapsed width:

```text
72 px
```

Primary navigation:

- Home
- Knowledge Projects
- Enterprise Assets
- Knowledge Products

Bottom navigation:

- Administration
- Collapse

Do not add separate top-level entries for governance, operations, and settings. Place these within project workspaces or Administration.

### Top header

Height:

```text
64 px
```

Contains:

- Global search
- Environment selector
- Notifications
- Help
- User avatar and profile menu

### Project workspace header

Height range:

```text
120–150 px including project metadata and tabs
```

Project tabs:

- Overview
- Assets & Sources
- Graph & Model
- Build & Govern
- Quality & Monitoring
- Publish & Serve
- Usage & Insights
- Activity
- Settings

Tabs should use a horizontal underline state. Avoid large pill-style tabs.

---

## 6. Design Tokens

### Colors

```css
--color-primary: #F4511E;
--color-primary-hover: #D84315;
--color-primary-soft: #FFF1EB;
--color-primary-border: #FFB79F;

--color-background: #F7F8FA;
--color-surface: #FFFFFF;
--color-surface-muted: #FAFAFB;
--color-border: #E5E7EB;
--color-border-strong: #D1D5DB;

--color-text: #111827;
--color-text-secondary: #4B5563;
--color-text-muted: #6B7280;
--color-text-subtle: #9CA3AF;

--color-success: #159447;
--color-success-soft: #EAF7EF;
--color-warning: #D97706;
--color-warning-soft: #FFF7E6;
--color-danger: #DC2626;
--color-danger-soft: #FEF2F2;
--color-info: #2563EB;
--color-info-soft: #EFF6FF;
--color-purple: #7C3AED;
--color-purple-soft: #F3E8FF;
```

Orange is the brand and primary action color. Do not use orange as a dominant background across large sections.

### Typography

Font family:

```text
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Recommended sizes:

| Usage | Size | Weight | Line Height |
|---|---:|---:|---:|
| Product logo text | 18 px | 700 | 24 px |
| Page title | 26 px | 650–700 | 34 px |
| Project title | 26 px | 650–700 | 34 px |
| Section title | 16 px | 600 | 24 px |
| Card title | 14 px | 600 | 20 px |
| Body | 13 px | 400 | 20 px |
| Form label | 12 px | 500–600 | 18 px |
| Table header | 11 px | 600 | 16 px |
| Table body | 12 px | 400 | 18 px |
| Caption and timestamp | 11 px | 400 | 16 px |
| KPI value | 26–32 px | 650–700 | 36 px |
| KPI label | 11–12 px | 500 | 18 px |

Do not use excessively large marketing headings inside the authenticated application.

---

## 7. Spacing and Sizing

Use an 8 px spacing system.

```text
4, 8, 12, 16, 24, 32, 40, 48
```

### Main content

- Page outer horizontal padding: 28–32 px
- Page top padding: 20–24 px
- Card padding: 16 px
- Dense card padding: 12 px
- Grid gap: 12–16 px
- Section gap: 20–24 px

### Cards

```text
Border radius: 8 px
Border: 1 px solid #E5E7EB
Shadow: none or extremely subtle
```

Use borders and spacing instead of heavy shadows.

### Buttons

Primary button:

```text
Height: 38–40 px
Horizontal padding: 18–22 px
Border radius: 6 px
Font size: 12–13 px
Font weight: 600
```

Secondary button:

```text
Height: 38–40 px
Horizontal padding: 16–20 px
Border: 1 px solid #D1D5DB
Background: white
```

Compact table actions:

```text
Height: 28–30 px
Padding: 8–12 px
Font size: 11 px
```

Icon-only button:

```text
32 × 32 px
```

Avoid oversized mobile-style buttons.

### Inputs

```text
Height: 38–40 px
Border radius: 6 px
Font size: 12–13 px
Horizontal padding: 12 px
```

Textarea minimum height:

```text
80–96 px
```

---

## 8. Table Styling

- Header background: `#FAFAFB`
- Header height: 38 px
- Row height: 42–48 px
- Horizontal row borders only
- Checkbox selection support
- Sticky header on large tables
- Column sorting
- Filter toolbar
- Pagination
- Density control optional
- Status badges should be compact and semantic

Status examples:

- Ready
- In Progress
- Review
- Approved
- Published
- Failed
- Queued
- Warning

---

## 9. Chart Styling

- Use restrained enterprise colors.
- Avoid gradients and decorative chart effects.
- Use small legends and direct labels.
- Charts should answer operational questions.
- Default line width: 2 px.
- Dashboard chart height: 180–240 px.
- Use donut charts only for compact status composition.
- Use horizontal bars for ranked asset or quality metrics.

---

## 10. Enterprise Graph Experience

The graph must be substantially broader than the graph shown in the screenshots.

### Graph modes

Provide two graph experiences:

1. Embedded graph preview inside `Graph & Model`
2. Full-screen `Graph Explorer`

### Full-screen Graph Explorer layout

- Left filter panel: 260 px
- Center graph canvas: flexible, minimum 900 px on 1600 px screens
- Right inspector panel: 340 px
- Top graph toolbar: 52 px
- Bottom status or legend bar: 36 px

### Required interactions

- Mouse wheel zoom
- Zoom in and zoom out buttons
- Fit to screen
- Reset view
- Pan by drag
- Mini-map
- Search by entity, asset, term, system, or relationship
- Focus selected node
- Expand one hop
- Expand two hops
- Collapse neighborhood
- Pin or unpin nodes
- Multi-select nodes
- Show shortest path
- Hide isolated nodes
- Switch layout:
  - Force directed
  - Concentric
  - Hierarchical
  - Domain clusters
  - Source lineage
- Toggle graph layers:
  - Metadata
  - Lineage
  - Semantic
  - Domain
  - Operational/Event
  - Governance
- Toggle edge labels
- Toggle source provenance
- Filter by confidence threshold
- Filter by source system
- Filter by domain
- Filter by asset type
- Filter by policy classification
- Filter by quality score
- Time filter for operational events

### Graph scale

Seed the prototype with approximately:

```text
300–500 visible nodes
700–1,200 relationships
```

The UI may initially render a curated subgraph of 80–150 nodes and expand on demand.

### Node types

- Business entity
- Data product
- Table
- Column
- Semantic model
- Business term
- Policy
- Document
- Extracted concept
- MDM record
- API
- Event
- Application
- Agent
- Knowledge product
- Source system

### Edge types

- OWNS
- HAS_ACCOUNT
- SUBSCRIBES_TO
- INTERACTED_WITH
- FILED_CASE
- GOVERNED_BY
- CLASSIFIED_AS
- DERIVED_FROM
- MAPPED_TO
- MASTERED_BY
- PRODUCED_BY
- CONSUMED_BY
- REFERENCES
- HAS_LINEAGE_TO
- VALIDATED_BY
- RESTRICTED_BY
- PUBLISHED_AS
- USED_BY_AGENT

### Graph visual style

- Entity nodes: purple family
- Data and metadata assets: blue family
- Policies and governance: orange family
- Source systems: grey or slate
- Operational events: teal
- Knowledge products: green
- Selected node: orange ring and stronger label
- Low-confidence relationships: dashed line
- Lineage edges: thin blue
- Semantic mappings: purple dotted
- Governance edges: orange with lock marker
- Domain relationships: solid neutral or purple

### Node inspector

When a node is selected, show:

- Name
- Type
- Definition
- Domain
- Source system
- Authoritative status
- Trust score
- Quality score
- Sensitivity
- Owners and stewards
- Synonyms
- Related policies
- Provenance
- Incoming relationships
- Outgoing relationships
- Consuming applications
- Last updated
- Agent recommendations

### Graph performance

- Use canvas or WebGL rendering where supported.
- Use graph virtualization and progressive loading.
- Avoid rendering all labels at low zoom.
- Show labels based on zoom threshold and node importance.
- Use clustering when node count exceeds 250.

---

## 11. Core Screens to Implement

### Global screens

- Home
- Knowledge Projects
- Enterprise Assets
- Knowledge Products

### New Knowledge Project wizard

1. Scope & Domains
2. Sources & Assets
3. Success Criteria
4. Governance & Access
5. Review & Create
6. Project Created Successfully

### Project workspace

- Overview
- Assets & Sources
- Graph & Model
- Build & Govern
- Quality & Monitoring
- Publish & Serve
- Usage & Insights
- Activity
- Settings

### Supporting screens and drawers

- Graph Explorer
- Recommendation Review drawer
- Asset detail drawer
- Agent run detail drawer
- Quality issue detail drawer
- Publication release modal
- Consumer registration modal

---

## 12. Home Page Rules

The home page should be operational, not conceptual.

Show:

- Continue Working project cards
- Requires Your Attention queue
- Portfolio Summary
- Recent Activity
- Enterprise Asset Coverage

Do not show a large static architecture diagram in the center of the home page.

---

## 13. Agentic UX Rules

Agents should be represented as governed enterprise workers rather than anthropomorphic chat personas.

Every agent run should expose:

- Objective
- Inputs
- Tools used
- Evidence
- Confidence
- Output
- Status
- Human approval requirement
- Audit record

Primary agents:

- Asset Discovery Agent
- Metadata Interpretation Agent
- Semantic Alignment Agent
- Entity Resolution Agent
- Relationship Discovery Agent
- Ontology Mapping Agent
- Lineage Assembly Agent
- Policy Mapping Agent
- Graph Construction Agent
- Knowledge Quality Agent
- Retrieval Evaluation Agent
- Publication Agent

Use deterministic mocked results for the main conference demo.

---

## 14. Suggested Frontend Structure

```text
src/
  app/
    router.tsx
    providers.tsx
  components/
    layout/
    navigation/
    cards/
    tables/
    charts/
    forms/
    graph/
    agents/
    governance/
  pages/
    home/
    projects/
    assets/
    products/
    project-wizard/
    project-workspace/
  data/
    mock/
  services/
    api/
    graph/
    agents/
  stores/
  types/
  utils/
  styles/
```

---

## 15. Suggested Backend Structure

```text
backend/
  app/
    main.py
    api/
      projects.py
      assets.py
      graph.py
      agents.py
      governance.py
      quality.py
      publishing.py
      usage.py
    agents/
      orchestrator.py
      discovery.py
      semantic_alignment.py
      entity_resolution.py
      relationship_discovery.py
      policy_mapping.py
      quality.py
      publishing.py
    graph/
      repository.py
      mock_repository.py
      neo4j_repository.py
      transformations.py
      metrics.py
    models/
    schemas/
    services/
    data/
      seed/
```

---

## 16. API Contract Guidance

Examples:

```text
GET    /api/projects
POST   /api/projects
GET    /api/projects/{projectId}
PATCH  /api/projects/{projectId}

GET    /api/projects/{projectId}/assets
POST   /api/projects/{projectId}/assets/sync

GET    /api/projects/{projectId}/graph
POST   /api/projects/{projectId}/graph/expand
POST   /api/projects/{projectId}/graph/path
GET    /api/projects/{projectId}/graph/node/{nodeId}

GET    /api/projects/{projectId}/recommendations
POST   /api/projects/{projectId}/recommendations/{id}/accept
POST   /api/projects/{projectId}/recommendations/{id}/reject

GET    /api/projects/{projectId}/quality
POST   /api/projects/{projectId}/quality/run

GET    /api/projects/{projectId}/releases
POST   /api/projects/{projectId}/releases

GET    /api/projects/{projectId}/usage
GET    /api/projects/{projectId}/activity
```

---

## 17. Mock Data and Demo Reliability

The prototype must run fully with seeded mock data.

Seed at least:

- 3 knowledge projects
- 184 enterprise assets
- 6 source systems for Customer 360
- 71 selected project assets
- 300–500 graph nodes
- 700–1,200 graph relationships
- 20 agent recommendations
- 10 quality issues
- 5 serving endpoints
- 8 consuming applications
- 50 activity records

Use fixed identifiers and predictable timestamps where needed for repeatable demos.

Include a `Reset Demo Data` action under Administration.

---

## 18. Accessibility and UX Quality

- Maintain WCAG AA contrast.
- All controls must be keyboard reachable.
- Provide visible focus states.
- Do not rely on color alone for status.
- Graph nodes should have tooltips and accessible inspector content.
- Use semantic headings and table markup.
- Provide empty states, loading states, and error states.

---

## 19. Acceptance Criteria

The prototype is complete when:

- All primary screens match the screenshot design language.
- Navigation and tabs are functional.
- New project wizard persists state.
- Project creation launches the mock assembly process.
- Agent run progress can be viewed.
- Assets can be filtered and inspected.
- Graph can pan, zoom, search, filter, expand, and show node details.
- Recommendations can be accepted or rejected.
- Quality scans display operational outcomes.
- A knowledge release can be published.
- Usage dashboards show consuming applications and endpoints.
- The application runs locally with one documented command.
- No external API key is required for the default demo.

---

## 20. Local Development Commands

Recommended root scripts:

```json
{
  "scripts": {
    "dev": "concurrently \"npm:dev:web\" \"npm:dev:api\"",
    "dev:web": "vite",
    "dev:api": "cd backend && uvicorn app.main:app --reload --port 8000",
    "build": "vite build",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "seed": "cd backend && python -m app.data.seed",
    "reset-demo": "cd backend && python -m app.data.reset"
  }
}
```

Provide a `.env.example` and a concise `README.md`.
