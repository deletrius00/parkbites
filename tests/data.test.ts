import { describe, it, expect } from 'vitest';
import { FOODS, PARKS, EVENTS, ICON_MIN_RATING, verdict, trendLabel, distM, fmtDist, socialLinks } from '../src/data';

describe('seed data', () => {
  it('has unique ids and a known park for every item', () => {
    expect(new Set(FOODS.map(f => f.id)).size).toBe(FOODS.length);
    for (const f of FOODS) expect(PARKS[f.park]).toBeDefined();
  });
  it('keeps ratings, trend and price in range', () => {
    for (const f of FOODS) {
      expect(f.rating).toBeGreaterThanOrEqual(0);
      expect(f.rating).toBeLessThanOrEqual(5);
      expect(f.trend).toBeLessThanOrEqual(100);
      expect(f.price).toBeGreaterThanOrEqual(0); // 0 = included with a party ticket
    }
  });
  it('places each item within 2 km of its park', () => {
    for (const f of FOODS) expect(distM(f.lat, f.lng, PARKS[f.park].lat, PARKS[f.park].lng)).toBeLessThan(2000);
  });
});

describe('verdict', () => {
  const base = FOODS[0];
  it('maps rating to must / eat / skip at the boundaries', () => {
    expect(verdict({ ...base, rating: 4.4 })).toBe('must');
    expect(verdict({ ...base, rating: 4.39 })).toBe('eat');
    expect(verdict({ ...base, rating: 3.6 })).toBe('eat');
    expect(verdict({ ...base, rating: 3.59 })).toBe('skip');
  });
});

describe('trendLabel', () => {
  it('buckets scores', () => {
    expect(trendLabel(90)).toContain('Exploding');
    expect(trendLabel(70)).toContain('Trending');
    expect(trendLabel(50)).toContain('Steady');
    expect(trendLabel(10)).toContain('Quiet');
  });
});

describe('distance', () => {
  it('is zero for identical points and symmetric', () => {
    expect(distM(1, 1, 1, 1)).toBe(0);
    expect(distM(33.8, -117.9, 28.4, -81.5)).toBeCloseTo(distM(28.4, -81.5, 33.8, -117.9), 3);
  });
  it('measures Disneyland to Magic Kingdom at roughly 3,500 km', () => {
    const km = distM(PARKS['Disneyland Park'].lat, PARKS['Disneyland Park'].lng, PARKS['Magic Kingdom'].lat, PARKS['Magic Kingdom'].lng) / 1000;
    expect(km).toBeGreaterThan(3400);
    expect(km).toBeLessThan(3700);
  });
  it('formats feet under ~0.2 mi and miles beyond', () => {
    expect(fmtDist(30)).toBe('100 ft');
    expect(fmtDist(1609)).toBe('1.0 mi');
  });
});

describe('socialLinks', () => {
  it('encodes the query and targets the right resort site', () => {
    const l = socialLinks({ ...FOODS[0], name: 'Dole Whip & Float', resort: 'Disney World' });
    expect(l.tiktok).toContain(encodeURIComponent('Dole Whip & Float'));
    expect(l.official).toContain('disneyworld.disney.go.com');
    expect(socialLinks({ ...FOODS[0], resort: 'Disneyland' }).official).toContain('disneyland.disney.go.com');
  });
});

describe('catalogue policy', () => {
  it('only keeps year-round items that are reliably must-eat', () => {
    for (const f of FOODS.filter(x => x.event === 'icon')) {
      expect(f.window).toBeNull();
      expect(f.rating).toBeGreaterThanOrEqual(ICON_MIN_RATING);
    }
  });
  it('gives every seasonal item a window and a matching event', () => {
    for (const f of FOODS.filter(x => ['halloween', 'christmas', 'food-wine'].includes(x.event))) expect(f.window).not.toBeNull();
  });
  it('covers each event', () => {
    for (const k of Object.keys(EVENTS)) expect(FOODS.some(f => f.event === k)).toBe(true);
  });
});
