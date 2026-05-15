# AI for Data Platform

Local React + TypeScript prototype for an enterprise AI for Data Platform.

## What is included

- Eight routed prototype pages: Home, Capability Hub, Data Journey, Studios, Data Products, Migrate to Modernize, Demo Workbench, and Admin
- Shared SaaS layout with consistent sidebar, topbar, logo, cards, badges, charts, and actions
- Local mock data under `src/data`
- Reusable UI components under `src/components`
- No backend, authentication, paid APIs, or remote data dependencies

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## Available scripts

```bash
npm run dev      # Start local dev server
npm run build    # Type-check and build production assets
npm run preview  # Preview the production build locally
```

## Stack

- React + TypeScript
- Tailwind CSS
- React Router
- lucide-react icons
- Recharts
- Local mock data only

## Repository notes

Generated folders such as `node_modules/` and `dist/` are intentionally ignored. Commit `package-lock.json` so installs are reproducible.
