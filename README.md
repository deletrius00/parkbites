# ParkBites 🏰

Search the **special** food at Disneyland and Walt Disney World: Halloween, Christmas, Food & Wine Festival, limited runs, and the few year-round items that are a must every visit. Get a straight answer: **must eat, eat it, or skip it.**

- Rating, approximate price, season window, description and a "how hot is it right now" trend score
- Links straight to Instagram, TikTok and the official Disney listing for that item
- Filter by event and "on the menu now" (season windows are approximate; confirm dates in the official app)
- Browse by park, by food place, top rated, must-eat, trending, cheapest, or **near me**
- A **food journal**: log what you ate, take a photo, rate it
- One tap to turn a journal entry into a 1080×1920 post image plus caption, shared through your phone's share sheet to Instagram or TikTok

> Unofficial fan project. Not affiliated with The Walt Disney Company. Prices and ratings in the seed data are **samples**; confirm in the official app.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run check      # lint + typecheck + tests
npm run build
```

Location needs HTTPS or localhost. Open `/?demo=1` to pretend you are standing next to the Tiki Juice Bar at Disneyland.

## How "did I buy it?" works

No Disney API exposes your purchases, so ParkBites does not pretend to know. Instead, if you stay within 40 m of a food stand for 90 s, it asks "Grab something here?" with that stand's items. You can also tap "I got this" on any item, or log manually. A planned receipt-screenshot reader is in the backlog. See [docs/DATA-SOURCES.md](docs/DATA-SOURCES.md).

## Layout

| Path | Purpose |
| --- | --- |
| `src/data.ts` | Seed food data, verdict logic, distance helpers, social deep links |
| `src/query.ts` | Pure filter/sort logic and the dwell (purchase prompt) tracker |
| `src/journal.ts` | Journal storage (localStorage) and photo downsizing |
| `src/postcard.ts` | Canvas post image and caption generator |
| `src/main.ts` | UI rendering and event wiring |
| `tests/` | Vitest unit tests |
| `docs/` | Architecture and data-source notes |
| `.github/` | CI, PR template, agent backlog |

Deeper reading: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), [CONTRIBUTING.md](CONTRIBUTING.md), [AGENTS.md](AGENTS.md).

## Deploy

Import the repo into Vercel. It detects Vite; every push to `main` deploys and every PR gets a preview URL.

## License

MIT
