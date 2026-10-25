// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { loadJournal, saveJournal, Entry } from '../src/journal';

const e: Entry = { id: 'a', foodId: 'f1', at: 1, note: '', stars: 3, source: 'manual' };

describe('journal storage', () => {
  beforeEach(() => localStorage.clear());
  it('round-trips entries', () => {
    expect(saveJournal([e])).toBe(true);
    expect(loadJournal()).toEqual([e]);
  });
  it('returns [] on empty or corrupt storage', () => {
    expect(loadJournal()).toEqual([]);
    localStorage.setItem('parkbites.journal.v1', '{nope');
    expect(loadJournal()).toEqual([]);
  });
});
