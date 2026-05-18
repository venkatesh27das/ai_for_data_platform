# DataNexus AI-for-Data Platform

DataNexus is a Vite, React, and TypeScript single-page demo for an enterprise AI-for-data platform. It presents a governed operating layer for building, modernizing, publishing, and consuming trusted structured and unstructured data products across cloud and analytics ecosystems.

The application is currently a front-end demo: it uses local mock data, route-level state, drawer interactions, and demo modals. There is no backend service or persistence layer wired in.

## Platform Capabilities

- Command centre for active journeys, pending actions, AI recommendations, recently published data products, and cloud ecosystem status.
- Journey portfolio for managing end-to-end data initiatives from ingestion through semantic enablement and consumption.
- Specialized studios for ingestion, extraction, quality, productization, semantic modeling, and migration workspaces.
- Governed data product catalog with certification status, contracts, ownership, quality, usage, and recommendations.
- Semantic hub for business terms, metrics, semantic models, domain coverage, and health actions.
- Admin console for platform health, resource usage, cost, audit logs, approvals, and workspace operations.

## Screens

### Command Centre

The home screen is the executive and operator landing surface. It summarizes platform KPIs, cloud/provider coverage, active journeys, pending governance actions, AI recommendations, recent data products, and ecosystem connections.

![Command Centre](docs/screenshots/home-command-centre.png)

Use this screen to start a data journey, create or explore data products, review admin actions, jump into active work, and inspect connected ecosystem services.

### Data Journey

The Data Journey screen provides a portfolio view of active data initiatives and a focused journey detail workspace. It shows portfolio metrics, journey inventory, pipeline stages, execution targets, progress, artifacts, summaries, approvals, and contextual controls.

![Data Journey](docs/screenshots/data-journey.png)

This screen is useful for explaining how the platform moves a data initiative from source onboarding through modeling, semantic context, quality gates, publishing, and consumption.

### Studios

Studios are guided workspaces for specialized platform tasks. The page groups featured studios, capability entry points, active sessions, workspace insights, recommended templates, AI recommendations, and recent activity.

![Studios](docs/screenshots/studios.png)

Use this screen to demonstrate how users launch repeatable workspaces from governed templates instead of starting every ingestion, extraction, product, semantic, or migration effort from scratch.

### Data Products

The Data Products screen is the governed catalog and product management surface. It includes product metrics, featured products, a searchable/filterable catalog table, health and governance panels, recommendations, and recent activity.

![Data Products](docs/screenshots/data-products.png)

Use this screen to explain product ownership, certification, contracts, quality, reuse, and the path from raw assets to consumable data products.

### Semantic Hub

Semantic Hub manages the business meaning layer across metrics, terms, models, and linked products. It includes semantic summary metrics, asset exploration, semantic health, an action queue, domain overview, and recent semantic updates.

![Semantic Hub](docs/screenshots/semantic-hub.png)

Use this screen to explain how the platform connects technical assets to business vocabulary, reusable metrics, semantic models, and domain coverage.

### Admin Home

Admin Home is the operational control surface for platform administrators. It covers users, workspaces, connectors, policies, platform health, resource usage, cost overview, audit logs, approvals, and quick actions.

![Admin Home](docs/screenshots/admin.png)

Use this screen to explain platform operations, governance oversight, cost monitoring, approvals, and auditability.

## Demo Interactions

Most visible controls are wired for demo purposes:

- Primary page actions open contextual demo modals.
- Table rows, cards, recommendations, and pending actions open connected entity drawers.
- Search and filters work locally on catalog-style screens.
- Sidebar navigation switches between the six main routes.
- Top bar controls for workspace, environment, notifications, profile, and search expose demo flows or route navigation.

## Tech Stack

- React 19
- TypeScript 6
- Vite 8
- React Router 7
- Tailwind CSS 3
- Lucide React icons
- Recharts

## Project Structure

```text
src/
  App.tsx
  main.tsx
  pages/
    Home.tsx
    DataJourney.tsx
    Studios.tsx
    DataProducts.tsx
    SemanticHub.tsx
    Admin.tsx
  components/
    common/
    layout/
    charts/
  data/
    mockData.ts
  types/
    index.ts
icons/
docs/
  screenshots/
```

## Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Routes

| Route | Screen |
| --- | --- |
| `/` | Command Centre |
| `/data-journey` | Data Journey |
| `/studios` | Studios |
| `/data-products` | Data Products |
| `/semantic-hub` | Semantic Hub |
| `/admin` | Admin Home |

## Notes For Future Development

- Keep the current enterprise SaaS shell, sidebar, top bar, and compact dashboard language unless the product direction changes.
- Use `DemoFlowModal` for non-backend workflows and `EntityDrawer` for related asset context.
- Promote mock interactions into real API-backed flows only after backend contracts are defined.
- Treat `AI_HANDOFF.md` as the current product/context handoff for accepted design direction and known preferences.
