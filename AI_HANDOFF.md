# AI Handoff

## Project Snapshot

This is a Vite + React + TypeScript single-page enterprise SaaS demo for an AI-for-data platform. The UI uses Tailwind classes, Lucide icons, mock data, and local page state only. There is no backend integration.

Primary routes:
- `/` Home / Command Centre
- `/data-journey`
- `/studios`
- `/studios/ingestion`
- `/studios/ingestion/create`
- `/studios/processing-extraction`
- `/studios/data-quality`
- `/studios/data-quality/create`
- `/studios/semantic`
- `/studios/semantic/create`
- `/data-products`
- `/semantic-hub`
- `/admin`

Main app shell:
- `src/components/layout/AppShell.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/TopBar.tsx`

Shared demo data:
- `src/data/mockData.ts`

## User Intent

The user wants the app to be demo-ready: all visible buttons and flows should feel connected, examples should open related context, and the UI should look like a real enterprise product rather than a static mock.

Important preference learned during iteration:
- Preserve the existing enterprise SaaS look, sidebar, header, palette, and overall layout.
- Do not over-redesign the Home page. A prior attempt to restructure Home into a “Platform Coverage” widget and grouped sections was rejected.
- Keep the Home page close to the earlier/original visual design, but retain accepted small changes.

## Current Accepted Changes

### Global / Shared

- Added `src/components/common/DemoFlowModal.tsx`.
  - Used for demo-only flows where there is no backend.
  - Shows a title, description, steps, and a primary action.

- Updated `src/components/common/SearchFilterBar.tsx`.
  - The Filters button now accepts optional `onFilterClick`.
  - This avoids passive buttons.

- Updated `src/components/layout/TopBar.tsx`.
  - Workspace, Environment, Notifications, and Profile controls open demo flows.
  - Search Enter navigates to `/data-products`.
  - User avatar was changed from a dark illustrated avatar to a light initials badge: `PN`.

### Home

- Home H1 was changed from `AI-for-Data Command Center` to `Command Centre`.
- The cloud/provider strip remains in the original location and style, but now uses real logo assets from the repo-level `icons/` folder:
  - `icons/aws_image.png`
  - `icons/azure_logo.png`
  - `icons/gcp_icon.svg`
  - `icons/Databricks_Logo.png`
  - `icons/snowflake_logo.png`
  - `icons/Power_BI_Logo.png`
- Home buttons/cards are wired:
  - KPIs navigate to relevant pages.
  - Pending actions open related drawers.
  - Recommendations open related drawers.
  - Ecosystem rows open demo flows.
  - Product cards open drawers.

### Data Journey

- Removed redundant page-level profile/persona control. Profile belongs only in the global TopBar.
- Removed redundant page-level Workspace, Environment, and notification controls. Global TopBar is the superset for those.
- Kept only contextual Journey controls, currently Cloud and Help.
- Replaced hardcoded `Priya Shah` with names consistent with mock data:
  - `Priya Nair`
  - `Rohan Mehta`
- Tabs are stateful.
- Top selectors, filters, pagination, metrics, New Journey, Actions, configuration, logs, and approvals all open flows or drawers.

### Studios

- Primary action buttons open flows or drawers.
- Studio cards, capability cards, template cards, sessions, recommendations, activity, and panel links are wired.
- `Processing & Extraction Studio` now opens a real nested route at `/studios/processing-extraction` instead of a demo modal.
- `Semantic Studio` now opens a real nested route at `/studios/semantic` instead of a demo modal.
- `src/pages/ProcessingExtractionStudio.tsx` implements a four-step extraction pipeline wizard:
  - Basics
  - Source & Modality
  - Processing Flow
  - Review & Publish
- The Basics and Source & Modality screens use dedicated named CSS grids in `src/styles.css` so panel placement matches supplied wireframes.
- Processing Flow has:
  - a compact visual canvas with aligned nodes and connectors
  - a generated `pipeline.yml` style Code view
  - a Validate Flow modal with validation checks, score, readiness state, and recommendation
- Review & Publish has:
  - publish readiness metrics and artifact checklist
  - Publish Pipeline / Publish Now confirmation modal
  - publishing progress modal
  - post-publish success prompt with `Stay Here` and `Back to Studios`
- The wizard header has an always-visible back action:
  - step 1: `Back to Studios`
  - steps 2-4: previous wizard step

### Semantic Studio

- New files:
  - `src/pages/SemanticStudio.tsx`
  - `src/pages/CreateSemanticModel.tsx`
- New routes:
  - `/studios/semantic`
  - `/studios/semantic/create`
- `src/pages/Studios.tsx` routes the Semantic Studio card to `/studios/semantic`.
- `src/App.tsx` registers both Semantic Studio routes.
- `src/styles.css` includes dedicated grid classes for the Semantic Studio dashboard and create flow:
  - `semantic-studio-*`
  - `semantic-create-*`
  - `semantic-source-wire-grid`
  - `semantic-entities-wire-grid`
  - `semantic-governance-wire-grid`
  - `semantic-review-wire-grid`
- The Semantic Studio landing page follows the supplied wireframe:
  - top feature cards
  - Modeling Workbench
  - Studio Insights
  - Browse by Semantic Capability
  - Validation & Test Runs
- Create Semantic Model is a five-step wizard following supplied wireframes:
  1. Model Basics
  2. Sources & Scope
  3. Entities & Metrics
  4. Governance & Validation
  5. Review & Publish
- The create flow is a local interactive prototype:
  - top Continue advances through steps
  - top Publish Model opens publish confirmation on step 5
  - Save as Draft shows feedback
  - dropdowns open contextual options based on field value
  - tiles, chips, source cards, entity cards, destinations, toggles, and publish-mode controls update local state
  - selected asset pills and scope tokens can be removed
  - action buttons such as Use, Edit, and Review warnings show a toast-style response
- User explicitly requested duplicate bottom Back/Continue buttons be removed. Keep navigation on the top actions and stepper only.
- User flagged 100% zoom layout issues in Review & Publish. Current accepted fix gives Publish Configuration a minimum width and uses compact destination chips.

### Data Products

- Primary actions open flows.
- Search and filters work locally.
- Metrics, governance cards, pagination, rows-per-page, recommendations, activity, and table rows are wired.

### Semantic Hub

- Primary actions open flows.
- Search and filters work locally.
- Summary metrics, pagination, rows-per-page, health cards, domain cards, queue rows, asset table rows, and recent updates are wired.

### Admin

- Stats, system health, resource usage, cost period controls, audit logs, approvals, quick actions, and panel links are wired.

## Current Files With Active Changes

Expected changed files:
- `src/App.tsx`
- `src/pages/Studios.tsx`
- `src/pages/SemanticStudio.tsx`
- `src/pages/CreateSemanticModel.tsx`
- `src/styles.css`
- `README.md`
- `AI_HANDOFF.md`

Note: `dist/` exists from local builds and should usually not be treated as source unless the user specifically asks for built artifacts.

## Verification

Run:

```bash
npm run build
```

The build was passing after the latest accepted changes. Vite may warn that chunks are larger than 500 kB; that warning existed during verification and was not treated as a blocker.

For local demo:

```bash
npm run dev
```

The dev server may use port `5174` if `5173` is occupied. Use the URL printed by Vite.

Browser smoke checks previously passed for:
- Home KPI navigation
- Data Journey New Journey modal
- Studios Browse Templates modal
- Data Products Create Data Product modal
- Semantic Hub Create Metric modal
- Admin System Health modal
- Processing & Extraction Studio wizard navigation
- Processing Flow Canvas / Code toggle
- Validate Flow modal
- Publish confirmation, progress, and success prompts
- Semantic Studio dashboard route
- Create Semantic Model steps 1-5
- Semantic create flow contextual dropdowns
- Semantic create flow Continue / Publish Model behavior
- No browser console errors during smoke pass

## Design Guidance For Future Agents

- Do not rebuild from scratch.
- Do not change the sidebar or top header structure unless explicitly requested.
- Prefer existing visual patterns: rounded cards, slate/orange palette, subtle borders, dense enterprise dashboards.
- Avoid marketing/landing-page patterns.
- Avoid adding new pages or backend behavior.
- Exception: `/studios/processing-extraction` is now an accepted nested demo page for the Processing & Extraction Studio.
- Exception: `/studios/semantic` and `/studios/semantic/create` are accepted nested demo pages for Semantic Studio and Create Semantic Model.
- Use `DemoFlowModal` for non-backend workflows.
- Use `EntityDrawer` for connected examples and related assets.
- Keep changes small and demo-oriented.

## Known User Preferences

- The user does not want duplicate controls across page headers and the global TopBar.
- The user disliked the redesigned Home layout with grouped business goal clusters and the `Platform Coverage` replacement widget.
- The user specifically wanted the cloud strip to use the real logos from `icons/`.
- The Home title should remain `Command Centre`.
- The user wants supplied wireframes followed closely, including tile density, font sizing, and section proportions.
- The user prefers controls that look clickable to provide a visible response, even without backend behavior.
- Avoid duplicated navigation/action controls within the create semantic model flow.

## Useful Commands

```bash
rg "Priya Shah|AI-for-Data Command Center|Platform Coverage" src
npm run build
npm run dev
```

## Quick Orientation

If continuing the work, first inspect:

```bash
git status --short
sed -n '1,240p' src/pages/Home.tsx
sed -n '1,260p' src/pages/ProcessingExtractionStudio.tsx
sed -n '1,260p' src/pages/SemanticStudio.tsx
sed -n '1,320p' src/pages/CreateSemanticModel.tsx
sed -n '1,180p' src/components/layout/TopBar.tsx
sed -n '1,220p' src/components/common/DemoFlowModal.tsx
```

Then make the smallest scoped change that preserves the current accepted UI direction.
