# Knowledge Builder

Knowledge Builder is a desktop-first enterprise workspace for defining, building,
validating, governing and operating trusted knowledge products.

The first working version includes the six global portfolio screens, the full
six-step New Knowledge Project workflow, local draft persistence, inline
validation, readiness review, confirmation, typed models, replaceable service
contracts and realistic mock data.

## Run locally

Requires Node.js 22.13 or newer.

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verify

From the repository root:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Or run all checks with `npm run verify`.

## Key routes

| Route | Screen |
|---|---|
| `/` | Home |
| `/projects` | Knowledge Projects |
| `/assets` | Enterprise Assets |
| `/products` | Knowledge Products |
| `/governance` | Governance |
| `/operations` | Operations |
| `/projects/new/use-case` | Use Case & Objectives |
| `/projects/new/scope` | Scope & Domains |
| `/projects/new/sources` | Sources & Assets |
| `/projects/new/success` | Success Criteria |
| `/projects/new/governance` | Governance & Access |
| `/projects/new/review` | Review & Create |
| `/projects/new/created` | Project Created |
| `/projects/KPJ-2025-0007` | Project workspace foundation |

## Architecture

- `apps/web/app` — App Router route entries and global styles
- `apps/web/src/components` — shared shell and UI primitives
- `apps/web/src/screens` — route-level screen composition
- `apps/web/src/models` — strict domain models
- `apps/web/src/services` — contracts, seed data and mock adapters
- `apps/web/src/stores` — persisted project draft state
- `apps/web/src/workflow` — schemas and workflow screens
- `apps/web/tests` — shared-component and workflow-state tests
- `docs/decisions` — implementation assumptions and deviations

All phase-one integrations are explicitly mocked. The contracts are shaped for
eventual replacement with `/api/v1` implementations.

