import { describe, it, expect } from 'vitest';
import { FOODS, PARKS } from '../src/data';
import { runQuery, nearestPark, DwellTracker, Query } from '../src/query';

const q = (o: Partial<Query> = {}): Query => ({ q: '', resort: '', park: '', venue: '', event: '', nowOnly: false, now: new Date(2026, 9, 25), sort: 'top', pos: null, ...o });

describe('runQuery', () => {
  it('searches names, venues and tags case-insensitively', () => {
    const r = runQuery(FOODS, q({ q: 'DOLE' }));
    expect(r.length).toBeGreaterThan(1);
    expect(r.every(f => f.name.toLowerCase().includes('dole'))).toBe(true);
  });
  it('filters by resort, park and venue', () => {
    expect(runQuery(FOODS, q({ resort: 'Disney World' })).every(f => f.resort === 'Disney World')).toBe(true);
    expect(runQuery(FOODS, q({ park: 'EPCOT' })).every(f => f.park === 'EPCOT')).toBe(true);
    expect(runQuery(FOODS, q({ venue: 'Aloha Isle' })).map(f => f.name)).toEqual(['Dole Whip']);
  });
  it('sorts top rated descending', () => {
    const r = runQuery(FOODS, q());
    for (let i = 1; i < r.length; i++) expect(r[i - 1].rating).toBeGreaterThanOrEqual(r[i].rating);
  });
  it('"must" returns only must-eat items', () => {
    const r = runQuery(FOODS, q({ sort: 'must' }));
    expect(r.length).toBeGreaterThan(0);
    expect(r.every(f => f.rating >= 4.4)).toBe(true);
  });
  it('sorts by trend and by price', () => {
    const t = runQuery(FOODS, q({ sort: 'trending' }));
    expect(t[0].trend).toBe(Math.max(...FOODS.map(f => f.trend)));
    const p = runQuery(FOODS, q({ sort: 'price' }));
    expect(p[0].price).toBe(Math.min(...FOODS.map(f => f.price)));
  });
  it('"near" keeps only the current park and orders by distance', () => {
    const pos = { lat: 28.4180, lng: -81.5826 }; // Aloha Isle, Magic Kingdom
    const r = runQuery(FOODS, q({ sort: 'near', pos }));
    expect(r.every(f => f.park === 'Magic Kingdom')).toBe(true);
    expect(r[0].venue).toBe('Aloha Isle');
  });
  it('"near" outside any park falls back to all parks', () => {
    const r = runQuery(FOODS, q({ sort: 'near', pos: { lat: 0, lng: 0 } }));
    expect(r.length).toBe(FOODS.length);
  });
  it('does not mutate the input array', () => {
    const copy = [...FOODS];
    runQuery(FOODS, q({ sort: 'price' }));
    expect(FOODS).toEqual(copy);
  });
});

describe('nearestPark', () => {
  it('detects each park centre and returns null for null or far positions', () => {
    for (const [n, p] of Object.entries(PARKS)) expect(nearestPark(p)).toBe(n);
    expect(nearestPark(null)).toBeNull();
    expect(nearestPark({ lat: 40, lng: -100 })).toBeNull();
  });
});

describe('DwellTracker', () => {
  const tiki = FOODS.find(f => f.venue === 'Tiki Juice Bar')!;
  const here = { lat: tiki.lat, lng: tiki.lng };
  it('fires once after the dwell time', () => {
    const d = new DwellTracker(40, 90_000);
    expect(d.update(FOODS, here, 0)).toEqual([]);
    expect(d.update(FOODS, here, 60_000)).toEqual([]);
    expect(d.update(FOODS, here, 91_000)).toEqual(['Disneyland Park|Tiki Juice Bar']);
    expect(d.update(FOODS, here, 200_000)).toEqual([]);
  });
  it('resets the timer when you walk away', () => {
    const d = new DwellTracker(40, 90_000);
    d.update(FOODS, here, 0);
    d.update(FOODS, { lat: 0, lng: 0 }, 50_000);
    expect(d.update(FOODS, here, 100_000)).toEqual([]);
    expect(d.update(FOODS, here, 191_000)).toHaveLength(1);
  });
});
