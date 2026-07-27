# Knowledge Builder — First Working Version Plan

## Product baseline

- Build a desktop-first enterprise SaaS frontend using Next.js App Router, React, strict TypeScript, Tailwind CSS, Lucide icons, TanStack Table/Query, React Hook Form, Zod, Zustand, Vitest and React Testing Library.
- Match the supplied 1448–1672px desktop references while retaining useful behavior down to 960px. Below 960px, collapse navigation and stack contextual panels below primary content.
- Apply the `CODEX.md` design tokens centrally: 72px header, 220px sidebar, 24–32px page gutters, 40px controls, 10px panel radius, restrained borders/shadows, navy hierarchy, orange actions, green success, red critical, amber warning and purple AI assistance.
- Keep data access behind typed interfaces. This pass uses clearly labelled mock services and browser-local draft persistence.

## Screenshot and screen inventory

| Screenshot | Route | Page | Main components | Shared layout | Required data and interactions |
|---|---|---|---|---|---|
| `Home Screen.png` | `/` | Home / Landing Dashboard | welcome header, six `MetricCard`s, attention table, activity feed, coverage score, scenario performance, domain progress list, feedback banner | `AppShell`, `GlobalHeader`, `SidebarNavigation`, `PageHeader`, `QuickActionsPanel` | portfolio metrics, projects needing attention, events, coverage and performance; navigate to projects and detailed areas |
| `Knowledge Project Screen.png` | `/projects` | Knowledge Projects | KPI row, search/filter toolbar, portfolio `DataTable`, scores, stage/status badges, pagination | global shell and quick actions | typed project rows, search/domain/stage/status/owner filters, sort/view controls, create/import actions, row navigation |
| `Enterprise Assets Screen.png` | `/assets` | Enterprise Assets | asset KPI row, asset-category tabs, filter bar, asset table, selected asset detail/quality/usage drawer | global shell plus `DetailDrawer` | asset catalogue, category/filter state, quality score, project usage; select row, close/reopen detail, retry/empty/loading states |
| `Knowledge Product screen.png` | `/products` | Knowledge Products | product KPI row, filter bar, product table, capabilities and consumer detail drawer | global shell plus `DetailDrawer` | product versions/types/status/quality/consumers; select row, publish/import actions and detail tabs |
| `Governance Screen.png` | `/governance` | Governance | governance KPI row, section tabs, filter bar, policies table, compliance and exception drawer | global shell plus `DetailDrawer` | policies, terms, tasks, alerts, coverage, linked assets; tab/filter/select policy, create/review actions |
| `Operation Screen.png` | `/operations` | Operations | operations KPI row, section tabs, operational watchlist, performance summary, event feed, incident detail/timeline drawer | global shell plus `DetailDrawer` | pipelines/products, health/freshness/usage/incidents/events; filter/select item, health check and incident actions |
| `new knowledge creation screen 1.png` | `/projects/new/use-case` | Use Case & Objectives | six-step `Stepper`, two-column form, questions, entity/relationship tags, AI recommendations | global shell, workflow header, `FormSection`, `AssistantPanel` | name, domain, use case, consumers, problem, outcomes, questions, entities and relationships; validate, add/remove values, save locally, continue |
| `new knowledge creation screen 2.png` | `/projects/new/scope` | Scope & Domains | scope form, system cards, segmented controls, tags, AI recommendations | workflow shell, `Stepper`, `AssistantPanel` | domains, functions, regions, systems, horizon, frequency, sensitivity, boundaries and exclusions; persist/validate/back/continue |
| `new knowledge creation screen 3.png` | `/projects/new/sources` | Sources & Assets | five-stage local rail, source tabs, connector table, recommendation panel | workflow shell, `Stepper`, `DataTable`, `AssistantPanel` | connectors and connection status, selected sources/assets and discovery classifications; connect/configure, filter, local sub-step state |
| `new knowledge creation screen 4.png` | `/projects/new/success` | Success Criteria | four-stage local rail, KPI editor table, success rule and impact cards, AI suggestions | workflow shell, `Stepper`, `FormSection`, `RecommendationCard` | KPI definitions/targets/units/methods/frequency, validation and thresholds; add/edit/remove KPI, validate, persist |
| `new knowledge creation screen 5.png` | `/projects/new/governance` | Governance & Access | five-stage local rail, access tabs, role table, external access controls, classification/compliance summaries | workflow shell, `Stepper`, `Tabs`, `AssistantPanel` | owner/steward, role assignments, permissions, classifications, policies and monitoring; add/remove roles, toggle API/public access, validate |
| `new knowledge creation screen 6.png` | `/projects/new/review` | Review & Create | summary rail, readiness banner/checklist, creation manifest, AI setup summary, post-create options | workflow shell, `Stepper`, `ReviewChecklist`, `AssistantPanel` | derive all summaries/checks from draft; show warnings and estimated counts; navigate back to edit or create project |
| `new knowledge creation screen 7.png` | `/projects/new/created` | Project Created | success panel, initial/estimated metrics, next-action cards, project overview, CTA rail | global shell, `ConfirmationPanel`, `QuickActionsPanel` | created project ID and submitted values; open project dashboard or return to project list |

## Architecture and implementation sequence

1. Scaffold the monorepo-compatible frontend at `apps/web` and add root scripts for local development and verification.
2. Define CSS custom-property design tokens and Tailwind mappings; implement accessible focus, reduced-motion and desktop/tablet shell behavior.
3. Add typed models under `packages/types` and frontend service contracts/mock implementations under `apps/web/src/services`.
4. Build reusable shell, feedback-state, data-display, navigation, drawer and form components under `apps/web/src/components`.
5. Implement the six global routes from shared page/table/detail configurations and realistic Supplier Risk seed data.
6. Implement the six-step Zustand workflow, schema validation, local draft persistence, review derivation and created confirmation.
7. Add a lightweight project overview destination so both confirmation CTAs resolve without broken routes.
8. Add unit tests for status/score/shared primitives and workflow persistence/validation/review derivation.
9. Run lint, strict type checking, unit tests and production build; fix all failures.
10. Run the app and visually inspect the main dashboard plus workflow at desktop and tablet widths, then document material screenshot deviations.

## Service contracts for future backend integration

- `ProjectService`
- `AssetService`
- `ProductService`
- `GovernanceService`
- `OperationsService`
- `RecommendationService` with mock methods for project, KPI and governance recommendations
- `DiscoveryService` with mock asset discovery
- `ReadinessService` with mock knowledge-readiness assessment and project-readiness validation

Each contract returns typed promises and supports loading, empty and failure handling at the page boundary. Mock data stays outside UI components.

## Verification targets

- No unresolved route, TypeScript, lint, test or production-build error.
- Keyboard-operable navigation, tabs, forms, tables and drawers with visible focus.
- Form errors linked to labelled fields; statuses include text/icons rather than colour alone.
- Draft survives route changes and reloads; review is populated from the draft; create reaches confirmation.
- Visual hierarchy and density remain close to the reference at 1440px and 1920px.
