import { describe, it, expect } from 'vitest';
import { FOODS } from '../src/data';
import { caption } from '../src/postcard';
import type { Entry } from '../src/journal';

const dole = FOODS.find(f => f.venue === 'Tiki Juice Bar')!;
const entry: Entry = { id: '1', foodId: dole.id, at: 0, note: 'So good', stars: 5, paid: 6.5, source: 'manual' };

describe('caption', () => {
  it('includes the food, venue, verdict, price and hashtags', () => {
    const c = caption(dole, entry);
    expect(c).toContain('Dole Whip');
    expect(c).toContain('Tiki Juice Bar');
    expect(c).toContain('MUST EAT');
    expect(c).toContain('$6.50');
    expect(c).toContain('#disneyland');
    expect(c).toContain('⭐⭐⭐⭐⭐');
  });
  it('falls back to the description when there is no note', () => {
    expect(caption(dole, { ...entry, note: '' })).toContain(dole.desc);
  });
});
