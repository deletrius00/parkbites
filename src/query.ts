import { Food, EventKey, PARKS, verdict, distM } from './data';
import { inSeason } from './season';

export type Sort = 'top' | 'must' | 'trending' | 'near' | 'price';

export interface Query {
  q: string;
  resort: '' | 'Disneyland' | 'Disney World';
  park: string;
  venue: string;
  event: '' | EventKey;
  /** Only items on the menu on `now`. */
  nowOnly: boolean;
  now: Date;
  sort: Sort;
  pos: { lat: number; lng: number } | null;
}

/** Name of the park the position is inside (within `radiusM`), or null when not in any park. */
export function nearestPark(pos: Query['pos'], radiusM = 3000): string | null {
  if (!pos) return null;
  let best: string | null = null;
  let bd = radiusM;
  for (const [name, p] of Object.entries(PARKS)) {
    const d = distM(pos.lat, pos.lng, p.lat, p.lng);
    if (d < bd) { bd = d; best = name; }
  }
  return best;
}

/**
 * Filter and order foods for the Explore tab.
 * "near" restricts to the park you are standing in (when detected) and sorts by walking-ish distance.
 * "must" keeps only must-eat items, best first.
 */
export function runQuery(foods: Food[], query: Query): Food[] {
  const q = query.q.trim().toLowerCase();
  const dist = (f: Food) => (query.pos ? distM(query.pos.lat, query.pos.lng, f.lat, f.lng) : Infinity);
  let r = foods.filter(f =>
    (!query.resort || f.resort === query.resort) &&
    (!query.park || f.park === query.park) &&
    (!query.venue || f.venue === query.venue) &&
    (!query.event || f.event === query.event) &&
    (!query.nowOnly || inSeason(f, query.now)) &&
    (!q || [f.name, f.venue, f.area, f.park, f.desc, ...f.tags].join(' ').toLowerCase().includes(q)));

  switch (query.sort) {
    case 'near': {
      const park = nearestPark(query.pos);
      if (park) r = r.filter(f => f.park === park);
      return r.sort((a, b) => dist(a) - dist(b));
    }
    case 'must': return r.filter(f => verdict(f) === 'must').sort((a, b) => b.rating - a.rating);
    case 'trending': return r.sort((a, b) => b.trend - a.trend);
    case 'price': return r.sort((a, b) => a.price - b.price);
    default: return r.sort((a, b) => b.rating - a.rating);
  }
}

/**
 * Tracks how long the user has stayed near a food venue.
 * Disney exposes no purchase API, so lingering is the closest honest signal; the UI then asks to confirm.
 */
export class DwellTracker {
  private since = new Map<string, number>();
  private asked = new Set<string>();
  constructor(private radiusM = 40, private minMs = 90_000) {}

  /** Returns venue keys that just crossed the dwell threshold (each at most once). */
  update(foods: Food[], pos: { lat: number; lng: number }, now: number): string[] {
    const hits: string[] = [];
    const seen = new Set<string>();
    for (const f of foods) {
      const key = f.park + '|' + f.venue;
      if (seen.has(key)) continue;
      if (distM(pos.lat, pos.lng, f.lat, f.lng) >= this.radiusM) continue;
      seen.add(key);
      const start = this.since.get(key) ?? now;
      this.since.set(key, start);
      if (now - start >= this.minMs && !this.asked.has(key)) { this.asked.add(key); hits.push(key); }
    }
    for (const k of [...this.since.keys()]) if (!seen.has(k)) this.since.delete(k);
    return hits;
  }
}
