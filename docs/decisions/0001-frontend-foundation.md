# 0001 — Frontend foundation

## Status

Accepted for the first working version.

## Decisions

- Use the supplied Sites-compatible Next.js/Vite foundation while retaining the
  App Router, React 19, strict TypeScript and Tailwind stack required by
  `CODEX.md`.
- Keep the application shell in the root layout so every route has identical
  header, navigation and responsive behavior.
- Keep product data behind TypeScript interfaces and replaceable service
  contracts. All current adapters are explicitly mocked.
- Use Zustand persistence for device-local project drafts. No authoritative
  project data is claimed to be persisted to a backend in this phase.
- Use React Hook Form and Zod on the high-input workflow steps, with derived
  readiness validation before creation.
- Use structured contextual recommendation panels; do not provide a
  chatbot-first experience.

## Material screenshot differences

- The source references contain some one-off icons and branded connector marks.
  This version uses a consistent Lucide icon language for accessibility and
  reuse.
- Static chart illustrations use accessible score rings and progress bars
  instead of a charting dependency in the first pass.
- The project-created screen labels entity and relationship counts as
  **estimated**, following `CODEX.md`, although the screenshot presents them as
  final counts.
- At narrower desktop widths, metric labels may wrap; tablet layouts reorganize
  cards and contextual panels rather than shrinking below the 11px minimum.
- The project workspace destination is a functional overview foundation. Its
  deeper post-creation tabs remain a later phase.

