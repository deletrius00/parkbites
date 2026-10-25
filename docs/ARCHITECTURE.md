# Architecture

ParkBites is a static single-page app (Vite + TypeScript, no framework). All state lives in the browser, so there is no backend to run yet.

```
data.ts ──► query.ts ──► main.ts (render + events)
               ▲              │
journal.ts ────┘              ├──► postcard.ts (canvas → JPEG + caption)
(localStorage)                └──► navigator.share / download
```

## Rules of the road

1. **Logic is pure and lives outside `main.ts`.** Anything that decides something (filtering, verdicts, dwell detection, captions) is a plain function or class with tests. `main.ts` only renders and wires events.
2. **No network calls in the browser for social content.** We link out to Instagram, TikTok and Disney. See DATA-SOURCES.
3. **User data stays on device.** Journal and photos are in `localStorage` (photos downscaled to 1080 px JPEG). If quota is hit the UI says so rather than failing silently.
4. **Verdict is derived from rating** (`>= 4.4` must eat, `>= 3.6` eat it, otherwise skip). Change thresholds in one place: `verdict()` in `data.ts`.

## Near me

`nearestPark()` picks the park whose centre is within 3 km. `runQuery` with `sort: 'near'` then limits to that park and sorts by great-circle distance. Outside any park it shows everything by distance.

## Purchase prompt

`DwellTracker.update()` is fed every GPS fix. A venue within 40 m for 90 s fires once, and the UI asks which item you got. It is a prompt, never an automatic log.

## Where this goes next

A small serverless layer (`api/*.ts`, as in RoadCam) for cached item data and moderated ratings. See `.github/agent-backlog/`.

## Seasons

Each item has an `event` (halloween, christmas, food-wine, special, icon) and an optional `window` (`MM-DD` to `MM-DD`, may wrap New Year). `src/season.ts` decides if an item is on the menu on a date; the Explore tab defaults to "on the menu now". Year-round items are admitted only as `icon` with rating >= `ICON_MIN_RATING` (tested).

## Offline / PWA

`public/sw.js` is a hand-written service worker (no plugin dependency). On install it precaches the page and the hashed JS/CSS it references; afterwards it serves same-origin GETs cache-first and refreshes in the background. `src/pwa.ts` registers it in production builds only. Cache matching uses `ignoreVary` on purpose: module scripts send an `Origin` header the precache fetch lacks, and a strict match leaves a blank page offline (there is a regression test). Bump `CACHE` in `sw.js` when its logic changes.
