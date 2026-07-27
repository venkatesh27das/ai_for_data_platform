# Enterprise Knowledge Assembly Studio

Enterprise Knowledge Assembly Studio is a conference-demo React application for
assembling distributed enterprise assets into governed knowledge products. The
included Customer 360 implementation demonstrates discovery, modelling,
governance, graph construction, quality validation, publishing, and usage.

The application uses deterministic mock data. It does not require a backend,
database, external service, or API key.

## Quick start

### Prerequisite

Install [Node.js 22 LTS](https://nodejs.org/). Node.js 20.19 or newer is also
supported.

### Run the application

From the repository root:

```bash
./start.sh
```

Then open [http://127.0.0.1:4173](http://127.0.0.1:4173).

The script:

1. Checks the installed Node.js and npm versions.
2. Creates a local `.env` file from `.env.example` when needed.
3. Installs locked dependencies with `npm ci` on the first run.
4. Starts the local Vite development server.

The script is idempotent, so the same command can be used on later runs.

To expose the application to other devices on your network or use another port:

```bash
EKAS_HOST=0.0.0.0 EKAS_PORT=5173 ./start.sh
```

## Manual setup

If you prefer to run the commands directly:

```bash
cp .env.example .env
npm ci
npm start
```

The default development server uses `127.0.0.1:4173`.

## Available commands

| Command | Purpose |
| --- | --- |
| `./start.sh` | Install dependencies when needed and start the app |
| `npm start` | Start the Vite development server |
| `npm run dev` | Start the Vite development server |
| `npm run typecheck` | Run strict TypeScript validation |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build |

## Project structure

```text
src/
  components/       Reusable UI and feature components
  data/mock/        Deterministic demo fixtures
  pages/            Route-level screens
  stores/           Lightweight application state
  styles/           Global design system and responsive styles
public/             Local brand and visualization assets
app-screenshots/    Generated application reference screenshots
```

Product requirements and design standards are documented in
[`USECASE.md`](USECASE.md) and [`CODEX.md`](CODEX.md).

## Troubleshooting

- **Unsupported Node.js version:** switch to Node.js 22 with `nvm use` after
  installing `nvm`, or install Node.js 22 LTS directly.
- **Port 4173 is already in use:** run
  `EKAS_PORT=5173 ./start.sh`.
- **Dependency installation fails:** confirm internet access, remove
  `node_modules`, and run `./start.sh` again.

Windows users can run the script through Git Bash or WSL. The manual npm
commands work in PowerShell and Command Prompt.
