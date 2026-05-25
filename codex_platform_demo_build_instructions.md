# Codex Build Instructions: Enterprise Unstructured Data Platform Demo

## 1. Objective

Build a functional, screen-by-screen clickable demo application for an **Enterprise Unstructured Data Platform**.

The platform converts raw unstructured content into **governed, validated, reusable knowledge assets** for business users, BI teams, applications, and AI agents.

The application must look like a **professional enterprise SaaS platform**, not a consumer app, not an OCR-only tool, and not a chatbot-first UI.

Build the application progressively, starting with the **Home** screen, then move screen by screen.

---

## 2. Core Product Positioning

The platform should feel like:

> A governed enterprise platform where users can design, automate, validate, enrich, link, publish, observe, and consume unstructured data products.

Core lifecycle:

```text
Ingestion → Processing & Extraction → Data Quality & Validation → Knowledge Foundation & Linkage → Consumption → Observability & Governance
```

The main entities in the application are:

- Data Journeys
- Knowledge Assets
- AI Agents
- Human Review Tasks
- Published Consumption Assets
- Governance Policies
- Runs, Alerts, Lineage, and Audit Events
- Admin Configurations

---

## 3. Required Top-Level Navigation

Use this simplified left navigation across all screens:

1. Home
2. Data Journeys
3. Agent Console
4. Human Review Queue
5. Consumption Hub
6. Observability
7. Admin

Do not create separate left-navigation items for:

- Ingestion Studio
- Processing Studio
- Data Quality Studio
- Knowledge Foundation
- APIs & MCP Tools
- Search Playground
- Governance & Lineage
- Runs & Observability

Those capabilities should appear as tabs, subtabs, widgets, or sections inside the relevant screens.

---

## 4. Application Shell Requirements

All screens must reuse the same application shell.

### Left Sidebar

- Fixed width: approximately `232px` on desktop.
- White / very light grey background.
- Icons on the left, labels on the right.
- Active nav item should use a soft orange background and orange text/icon.
- Inactive items should use dark navy / muted slate.
- Include a small **Collapse** control at the bottom.
- Keep nav spacing consistent with the prototype screenshots.

### Top Bar

Use the same top bar on every screen:

- Centered global search input.
- Workspace selector, example: `HealthCorp`.
- Environment selector, example: `Production`.
- Notification bell with orange badge.
- User avatar, example: `PN`.

Recommended height: `56px` to `64px`.

### Main Content Area

- Use a large rounded white container or card-like page surface.
- Maintain consistent page padding.
- Keep the layout breathable but compact.
- Avoid oversized cards, large empty gaps, and zoomed-in scaling.

---

## 5. Responsive Layout and Scaling Requirements

The demo must look good on a **MacBook Pro 14-inch** and similar laptop resolutions.

Target common viewport sizes:

- `1440 x 900`
- `1512 x 982`
- `1536 x 960`
- `1728 x 1117`
- `1920 x 1080`

### Important

The application must **not look zoomed in** on laptop screens.

Use dynamic scaling:

- Use `rem`, `%`, `minmax()`, `clamp()`, and CSS grid/flex layouts.
- Avoid hardcoding large pixel heights that force overflow.
- Avoid text and cards that are too large.
- Use compact enterprise dashboard density.
- Use responsive grids that adapt from 6 cards to 3 or 2 columns when needed.
- Use `min-width: 0` on flex/grid children to prevent overflow.
- Prefer `max-width: 100%` within the content area.

Recommended root sizing:

```css
html {
  font-size: clamp(13px, 0.78vw, 15px);
}
```

Recommended page container:

```css
.app-shell {
  min-height: 100vh;
  background: #f7f8fb;
}

.sidebar {
  width: clamp(210px, 14vw, 240px);
  flex-shrink: 0;
}

.main-content {
  flex: 1;
  min-width: 0;
  padding: clamp(14px, 1.2vw, 22px);
}
```

---

## 6. Design System

Follow the visual language of the prototype screenshots.

### Overall Style

- Enterprise SaaS dashboard
- White and light grey base
- Orange primary accent
- Dark navy / black text
- Subtle borders
- Rounded cards
- Soft shadows
- Compact but readable spacing
- Professional, clean, dashboard-like appearance

Avoid:

- Consumer-app gradients
- Excessive colors
- Oversized typography
- Cartoonish illustrations
- Heavy shadows
- Dark UI
- Chatbot-first layout
- OCR-only positioning

---

## 7. Typography

Use a professional modern sans-serif font.

Recommended font stack:

```css
font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

Recommended sizing:

```css
--font-xs: 0.72rem;
--font-sm: 0.78rem;
--font-base: 0.86rem;
--font-md: 0.95rem;
--font-lg: 1.1rem;
--font-xl: 1.35rem;
--font-2xl: clamp(1.65rem, 1.6vw, 2.05rem);
```

Usage guidance:

- Page title: `1.65rem` to `2.05rem`, bold.
- Section titles: `0.95rem` to `1.1rem`, semibold.
- Card labels: `0.76rem` to `0.82rem`.
- KPI numbers: `1.25rem` to `1.65rem`, bold.
- Table text: `0.76rem` to `0.84rem`.
- Buttons: `0.78rem` to `0.85rem`, semibold.

Do not use large marketing-style text.

---

## 8. Color Tokens

Use consistent color tokens.

```css
:root {
  --bg-app: #f7f8fb;
  --bg-surface: #ffffff;
  --bg-subtle: #f9fafc;

  --text-primary: #0b1020;
  --text-secondary: #34415f;
  --text-muted: #667085;

  --border-subtle: #e5e8f0;
  --border-strong: #d7dce8;

  --orange: #ff5a1f;
  --orange-dark: #e84a12;
  --orange-soft: #fff1eb;

  --green: #12a66a;
  --green-soft: #eaf8f1;

  --blue: #2563eb;
  --blue-soft: #eef4ff;

  --purple: #8a3ffc;
  --purple-soft: #f4edff;

  --red: #ef4444;
  --red-soft: #fff0f0;

  --amber: #f59e0b;
  --amber-soft: #fff7e6;
}
```

Orange should be the primary action/accent color. Other colors should be used only for semantic states and icon badges.

---

## 9. Core Components to Build First

Build reusable components before implementing individual screens.

### Layout Components

- `AppShell`
- `Sidebar`
- `TopBar`
- `PageHeader`
- `PageActions`
- `SectionCard`
- `MetricCard`
- `StatusPill`
- `Tabs`
- `DataTable`
- `RightPanelCard`
- `ServiceHealthStrip`
- `IconBadge`
- `ProgressBar`
- `FilterBar`

### Component Rules

- All cards should have consistent border radius, border, background, and spacing.
- Buttons should have primary and secondary variants.
- Tables should be compact, aligned, and easy to scan.
- Status pills should have consistent sizes and colors.
- KPI cards should align in equal-height grids.
- Right-side cards should use the same visual treatment as the main content cards.

Recommended card style:

```css
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.035);
}
```

---

## 10. Screen Build Order

Build the demo screen by screen in this order:

1. Home
2. Data Journeys Landing
3. Create Journey with AI
4. AI Journey Blueprint
5. Journey Detail View
6. Journey Detail → Ingestion tab
7. Journey Detail → Processing tab
8. Journey Detail → Quality tab
9. Journey Detail → Knowledge & Linkage tab
10. Journey Detail → Consumption tab
11. Agent Console
12. Human Review Queue
13. Human Review Detail
14. Consumption Hub
15. Consumption Asset Detail
16. Observability
17. Admin

The existing prototype screens already cover these landing pages:

- Home
- Data Journeys
- Agent Console
- Human Review Queue
- Consumption Hub
- Observability
- Admin

Use those screenshots as layout references for the corresponding screens.

---

## 11. Screen 1: Home

Purpose:

> Command center for the platform.

The Home screen should show:

- Page title: `Home`
- Short mission statement
- Primary CTA: `Create Journey with AI`
- Secondary CTAs: `Start Data Journey`, `Explore Assets`
- What you can do lifecycle card: `Ingest → Process → Link → Publish`
- Platform snapshot KPI cards
- Start from a business goal cards
- Continue where you left off
- Recent published assets
- Platform service health strip

Example KPI cards:

- Active Journeys
- Documents Processed
- Published Assets
- Pending Reviews
- Platform Health

Example business goal cards:

- Onboard New Source
- Process Policy PDFs
- Build Knowledge Product
- Link to Structured Data
- Publish Search Experience

---

## 12. Screen 2: Data Journeys Landing

Purpose:

> Build and manage governed unstructured data products across the full lifecycle.

Data Journeys is the main build hub.

It should show:

- Header actions: `Create Journey with AI`, `Start New Journey`, `Import Blueprint`, `Explore Templates`
- KPI cards
- Journey lifecycle tabs
- Journey portfolio table
- AI recommendations
- Lifecycle overview
- Popular journey templates
- Pending approvals
- Recent journey activity
- Connected journey services

Example journeys:

- Policy Knowledge Product
- Invoice Processing & Vendor Linkage
- Clinical Notes to Patient Profile
- Provider Contract Intelligence
- Research Paper Knowledge Graph

Journey detail tabs later should include:

- Overview
- Ingestion
- Processing
- Quality
- Knowledge & Linkage
- Consumption
- Runs
- Governance

---

## 13. Screen 3: Agent Console

Purpose:

> Monitor, govern, and orchestrate AI agents that automate governed unstructured data journeys.

Agent Console is automation-centric, not asset-centric.

It should show:

- Header actions: `Create Agent Workflow`, `Register Agent`, `Run Sandbox Test`, `Manage Policies`
- KPI cards
- Agent tabs
- Agent registry table
- Recommended actions
- Agent orchestration overview
- Popular agent templates
- Pending agent approvals
- Recent agent activity
- Connected agent services

Example agents:

- Journey Planner Agent
- Source Profiling Agent
- Extraction Agent
- DQ Rule Agent
- Structured Linkage Agent
- Validation Agent
- Remediation Agent
- Consumption Agent
- Human Review Agent

Important distinction:

```text
Data Journeys shows agents in the context of one journey.
Agent Console shows agents across the platform.
```

---

## 14. Screen 4: Human Review Queue

Purpose:

> Review, validate, correct, and approve AI-generated outputs and platform decisions before they become governed assets.

Human Review Queue is the trust and exception-handling layer.

It should show:

- Header actions: `Bulk Review`, `Assign Reviews`, `Create Review Rule`, `Export Decisions`
- KPI cards
- Review type tabs
- Filter bar
- Review queue table
- AI review recommendations
- Review type breakdown
- SLA and workload panel
- Review services strip

Review types:

- Extraction
- Quality
- Linkage
- Sensitive Data
- Publishing
- Agent Decisions

Example review items:

- Policy Clause Extraction
- Vendor Entity Match
- PHI Detected
- Validation Failure
- Relationship Review
- Publish Approval
- Agent Decision Review

Available actions in detail views:

- Accept AI suggestion
- Modify
- Reject
- Assign to SME
- Add comment
- Save as reusable rule
- Re-run validation

---

## 15. Screen 5: Consumption Hub

Purpose:

> Discover, test, request access to, and consume governed knowledge assets across search, APIs, MCP tools, tables, vectors, and graphs.

Consumption Hub is the marketplace/catalog layer.

It should show:

- Header actions: `Explore Assets`, `Request Access`, `Create Search Experience`, `Publish MCP Tool`
- KPI cards
- Asset type tabs
- Governed asset catalog table
- Recommended assets
- Popular consumption methods
- Access requests
- Recently published assets
- Trust and governance signals
- Consumption services strip

Asset types:

- Search
- APIs & MCP
- Tables
- Vector Stores
- Graphs
- Data Products

Example assets:

- Policy Search Index
- Invoice Entity Table
- Clinical Relationship Graph
- Provider Contract MCP Tool
- Contract Metadata Store
- Claims Document Enrichment API

Consumption actions:

- Request access
- Test search
- Try API
- Preview MCP tool
- Connect to agent
- Add to workspace
- View lineage

---

## 16. Screen 6: Observability

Purpose:

> Monitor platform health, runs, lineage, governance, audit, compliance, alerts, and cost across governed unstructured data workflows.

Observability combines previous Runs/Observability and Governance/Lineage into one area.

It should show:

- Header actions: `Open Dashboard`, `Create Alert Rule`, `Export Logs`, `Open Lineage Explorer`
- KPI cards
- Observability tabs
- Operational overview chart
- Asset risk and coverage chart
- Active alerts panel
- Recent platform activity table
- Recent governance activity
- Recommended actions
- Platform health
- Quality and governance trend
- Top policy violations
- Observability services strip

Subtabs:

- Core Dashboard
- Runs
- Agent Activity
- Lineage
- Governance
- Audit & Compliance
- Cost & Usage

---

## 17. Screen 7: Admin

Purpose:

> Configure platform foundations, access, policies, connectors, models, and environments for governed unstructured data products.

Admin is configuration-centric.

It should show:

- Header actions: `Add Connector`, `Register Model`, `Create Policy`, `Manage Users`
- KPI cards
- Admin subtabs
- Admin area cards
- Admin recommendations
- Pending admin approvals
- Risk and compliance signals
- Recent admin activity
- Platform foundation services strip

Subtabs:

- Overview
- Connectors
- Models & Services
- Access Control
- Policies
- Review Workflows
- Agent Controls
- Environments
- Integrations

Admin areas:

- Connectors
- Models & AI Services
- Access Control
- Governance Policies
- Review Workflows
- Agent Controls
- Environments
- Integrations

---

## 18. Data and Domain Examples

Use healthcare/pharma-style examples throughout the demo.

Examples:

- Policy PDFs
- Invoice documents
- Clinical notes
- Provider contracts
- Claims documents
- Customer 360
- Patient Profile
- Policy Master
- Vendor Master
- Product Master
- Claims Data Product
- Research papers
- Clinical relationship graphs

Do not use random generic examples. Keep the data domain consistent.

---

## 19. AI-Assisted UX Guidance

AI should be present but subtle.

Show AI through:

- Recommendation cards
- Generated plans
- Confidence scores
- Suggested mappings
- Suggested remediations
- Human review triggers
- Blueprint generation
- Agent activity logs
- Next-best actions

Do not make the application look like a chatbot.

Avoid a full-page chat interface unless specifically building a `Create Journey with AI` flow.

---

## 20. Status and Label System

Use consistent statuses.

### Journey Statuses

- Draft
- Running
- In Progress
- Pending Review
- Needs Attention
- Ready to Publish
- Published
- Failed

### Review Statuses

- Pending
- In Review
- Approved
- Modified
- Rejected
- Escalated
- Completed

### Asset Statuses

- Draft
- Active
- Published
- Certified
- Restricted
- Deprecated

### Governance Labels

- PHI Detected
- PII Controlled
- Policy Bound
- Lineage Tracked
- Access Restricted
- Steward Certified
- DQ Monitored

### Confidence Labels

- High Confidence
- Medium Confidence
- Low Confidence
- Requires Review

---

## 21. Interaction Requirements

The app should be a clickable prototype.

Minimum expected interactions:

- Left navigation changes active screen.
- Top tabs change content states or show placeholder content.
- Buttons can navigate to the next logical screen.
- `Create Journey with AI` opens the AI journey creation flow.
- `AI Journey Blueprint` can navigate to Journey Detail.
- Journey table rows can open Journey Detail.
- Human review rows can open Human Review Detail.
- Consumption asset rows can open Asset Detail.
- Observability alerts can open a detail placeholder.
- Admin area cards can open tab-specific placeholder views.

Keep the prototype deterministic and smooth. Do not require backend APIs.

Use local mock data.

---

## 22. Suggested Tech Stack

Use a simple frontend-first stack.

Recommended:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React icons
- Recharts for simple charts
- shadcn/ui patterns if available

Do not over-engineer the backend.

Mock data should live in local files such as:

```text
src/data/journeys.ts
src/data/agents.ts
src/data/reviews.ts
src/data/assets.ts
src/data/observability.ts
src/data/admin.ts
```

Recommended folder structure:

```text
src/
  app/
    App.tsx
    routes.tsx
  components/
    layout/
      AppShell.tsx
      Sidebar.tsx
      TopBar.tsx
    ui/
      Button.tsx
      Card.tsx
      MetricCard.tsx
      StatusPill.tsx
      Tabs.tsx
      DataTable.tsx
      IconBadge.tsx
      ProgressBar.tsx
      ServiceHealthStrip.tsx
  data/
    journeys.ts
    agents.ts
    reviews.ts
    assets.ts
    observability.ts
    admin.ts
  pages/
    Home.tsx
    DataJourneys.tsx
    AgentConsole.tsx
    HumanReviewQueue.tsx
    ConsumptionHub.tsx
    Observability.tsx
    Admin.tsx
    CreateJourneyAI.tsx
    AIJourneyBlueprint.tsx
    JourneyDetail.tsx
    HumanReviewDetail.tsx
    ConsumptionAssetDetail.tsx
  styles/
    globals.css
```

---

## 23. Implementation Rules for Codex

When generating code:

1. Start with reusable layout and UI primitives.
2. Build the Home screen first.
3. Match the prototype layout, spacing, typography, and visual hierarchy as closely as possible.
4. Keep cards compact and aligned.
5. Use consistent grid systems.
6. Ensure the UI fits on laptop screens without looking zoomed in.
7. Avoid unnecessary vertical scrolling on landing screens where possible.
8. Use mock data, not backend APIs.
9. Keep code modular and easy to extend.
10. Use the same design tokens across all screens.
11. Do not introduce a different design language on later screens.
12. Use realistic enterprise data from the healthcare/pharma examples.
13. Keep AI features as embedded recommendations, not a full chatbot UI.
14. Use accessible semantic HTML where possible.
15. Make the layout responsive and stable.

---

## 24. First Codex Task

Start by building the application shell and the Home screen.

Prompt to Codex:

```text
Build a React + TypeScript + Tailwind CSS clickable prototype for an Enterprise Unstructured Data Platform.

Start with the shared app shell and Home screen only.

Use the design system defined in this instruction file. The UI must look like a professional enterprise SaaS dashboard with a clean white/light grey background, dark navy text, orange primary accents, rounded cards, subtle borders, and compact dashboard density.

The app must fit well on a MacBook Pro 14-inch and similar laptop resolutions. It should not look zoomed in. Use responsive sizing with clamp(), rem units, CSS grid, flex, and dynamic spacing.

Create these components first:
- AppShell
- Sidebar
- TopBar
- PageHeader
- Button
- Card
- MetricCard
- StatusPill
- IconBadge
- ServiceHealthStrip

Then implement the Home screen with:
- fixed left nav
- top search/workspace/environment/avatar bar
- title and subtitle
- CTA buttons: Create Journey with AI, Start Data Journey, Explore Assets
- lifecycle card: Ingest, Process, Link, Publish
- platform snapshot metrics
- business goal cards
- continue where you left off
- recent published assets
- platform services strip

Use local mock data only. Keep the code modular so the next screens can be added later.
```

---

## 25. Quality Checklist Before Marking a Screen Complete

For each screen, verify:

- Same shell as the screenshots.
- Correct left-nav item highlighted.
- Top bar unchanged.
- Page title and subtitle match the screen purpose.
- CTAs are aligned and consistently styled.
- KPI cards are equal height and aligned.
- Tables are readable and compact.
- Right-side panels align with the main content.
- Status pills use consistent colors.
- No oversized fonts.
- No unnecessary vertical overflow on laptop screens.
- Cards and grids are aligned.
- Screen looks professional and enterprise-grade.
- The screen supports the product story: governed knowledge assets, AI-assisted automation, human review, consumption, and observability.

