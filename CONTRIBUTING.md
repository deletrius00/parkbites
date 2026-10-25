# Contributing

## Workflow
1. Branch from `main`: `feat/…`, `fix/…`, `docs/…`, `data/…`.
2. Keep PRs small and focused. One idea per PR.
3. Use [Conventional Commits](https://www.conventionalcommits.org): `feat: add price filter`.
4. Run `npm run check` before pushing. CI runs the same lint, typecheck, tests and build.
5. Open a PR using the template. Squash-merge once CI is green. `main` is always deployable.

## Code
- New logic goes in a pure module with tests in `tests/`. UI code stays thin.
- Comment the *why* (a rule, a limitation, a trade-off), not what the line does. Add a doc comment on exported functions.
- Prices and ratings are approximate. Never present them as live Disney data.

## Data changes
Add rows in `src/data.ts`. Coordinates should be within 2 km of the park (a test enforces it). Say in the PR where the info came from.
