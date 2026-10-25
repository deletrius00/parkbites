# Instructions for coding agents

ParkBites: static Vite + TypeScript app for Disney park food search, a food journal and post generator. Read `README.md` and `docs/ARCHITECTURE.md` first.

## Commands
- `npm run dev` start the app. Add `?demo=1` for fake in-park location.
- `npm run check` lint + typecheck + tests. **Must pass before you finish.**
- `npm run build` production build.

## Rules
1. Work from a ticket in `.github/agent-backlog/`. Do one ticket per branch and PR. Do not touch unrelated files.
2. Branch `feat/<ticket-slug>`, Conventional Commit messages, open a PR using the template. Never push to `main`.
3. Put logic in pure functions with unit tests. `src/main.ts` is rendering and wiring only.
4. Add or update tests for every behaviour change. Do not delete or weaken a test to make it pass.
5. Do not scrape Instagram, TikTok or Disney. Do not add API keys to the repo. Read `docs/DATA-SOURCES.md`.
6. Catalogue policy: only seasonal/festival items, limited runs, and year-round items rated >= 4.6 (`icon`). Do not add ordinary year-round food. Season windows are approximate.
7. Prices and ratings are approximate sample data; keep that wording in the UI.
8. No new dependency without saying why in the PR. Prefer the platform (Canvas, Geolocation, Web Share).
9. Update docs in the same PR when behaviour changes.

## Done means
`npm run check` and `npm run build` pass, the PR describes what you tested, and the ticket's acceptance criteria are each met.
