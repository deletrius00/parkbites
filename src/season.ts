import type { Food } from './data';

const md = (d: Date) => `${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** True when the item is on the menu on `date`. Items with no window ('special') count as available. */
export function inSeason(f: Food, date: Date): boolean {
  if (!f.window) return true;
  const t = md(date);
  const { from, to } = f.window;
  // A window that wraps New Year (from > to) is "after from OR before to".
  return from <= to ? t >= from && t <= to : t >= from || t <= to;
}

const fmt = (s: string) => new Date(2000, +s.slice(0, 2) - 1, +s.slice(3)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/** Short status for cards: "Until Oct 31", "Starts Nov 10", "Limited run", "Year-round". */
export function seasonLabel(f: Food, date: Date): string {
  if (!f.window) return f.event === 'icon' ? 'Year-round' : 'Limited run';
  return inSeason(f, date) ? `Until ${fmt(f.window.to)}` : `Starts ${fmt(f.window.from)}`;
}
