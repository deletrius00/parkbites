import { describe, it, expect } from 'vitest';
import { FOODS, Food } from '../src/data';
import { inSeason, seasonLabel } from '../src/season';
import { runQuery, Query } from '../src/query';

const base = FOODS[0];
const win = (from: string, to: string): Food => ({ ...base, window: { from, to } });
const d = (m: number, day: number) => new Date(2026, m - 1, day);

describe('inSeason', () => {
  it('handles a normal window inclusively', () => {
    const f = win('09-01', '10-31');
    expect(inSeason(f, d(9, 1))).toBe(true);
    expect(inSeason(f, d(10, 31))).toBe(true);
    expect(inSeason(f, d(11, 1))).toBe(false);
    expect(inSeason(f, d(8, 31))).toBe(false);
  });
  it('handles a window that wraps New Year', () => {
    const f = win('11-10', '01-06');
    expect(inSeason(f, d(12, 25))).toBe(true);
    expect(inSeason(f, d(1, 6))).toBe(true);
    expect(inSeason(f, d(1, 7))).toBe(false);
    expect(inSeason(f, d(7, 4))).toBe(false);
  });
  it('treats items with no window as available', () => {
    expect(inSeason({ ...base, window: null }, d(7, 4))).toBe(true);
  });
});

describe('seasonLabel', () => {
  it('says when it ends, starts, or that it is a limited run', () => {
    expect(seasonLabel(win('09-01', '10-31'), d(10, 5))).toBe('Until Oct 31');
    expect(seasonLabel(win('11-10', '01-06'), d(10, 5))).toBe('Starts Nov 10');
    expect(seasonLabel({ ...base, event: 'special', window: null }, d(10, 5))).toBe('Limited run');
    expect(seasonLabel({ ...base, event: 'icon', window: null }, d(10, 5))).toBe('Year-round');
  });
});

describe('event and "on the menu now" filters', () => {
  const q = (o: Partial<Query>): Query => ({ q: '', resort: '', park: '', venue: '', event: '', nowOnly: false, now: d(10, 25), sort: 'top', pos: null, ...o });
  it('filters by event', () => {
    const r = runQuery(FOODS, q({ event: 'christmas' }));
    expect(r.length).toBeGreaterThan(0);
    expect(r.every(f => f.event === 'christmas')).toBe(true);
  });
  it('on Oct 25 shows Halloween and Food & Wine but no Christmas', () => {
    const r = runQuery(FOODS, q({ nowOnly: true }));
    const ev = new Set(r.map(f => f.event));
    expect(ev.has('halloween')).toBe(true);
    expect(ev.has('food-wine')).toBe(true);
    expect(ev.has('christmas')).toBe(false);
  });
  it('on Dec 15 shows Christmas and no Halloween', () => {
    const ev = new Set(runQuery(FOODS, q({ nowOnly: true, now: d(12, 15) })).map(f => f.event));
    expect(ev.has('christmas')).toBe(true);
    expect(ev.has('halloween')).toBe(false);
  });
});
