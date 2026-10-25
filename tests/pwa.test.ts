import { describe, it, expect, vi } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { registerServiceWorker } from '../src/pwa';

describe('registerServiceWorker', () => {
  it('registers /sw.js in production', async () => {
    const register = vi.fn().mockResolvedValue({});
    expect(await registerServiceWorker({ serviceWorker: { register } } as never, true)).toBe(true);
    expect(register).toHaveBeenCalledWith('/sw.js');
  });
  it('does nothing in dev', async () => {
    const register = vi.fn();
    expect(await registerServiceWorker({ serviceWorker: { register } } as never, false)).toBe(false);
    expect(register).not.toHaveBeenCalled();
  });
  it('does nothing when the browser has no service workers', async () => {
    expect(await registerServiceWorker({}, true)).toBe(false);
  });
  it('reports failure instead of throwing', async () => {
    const register = vi.fn().mockRejectedValue(new Error('nope'));
    expect(await registerServiceWorker({ serviceWorker: { register } } as never, true)).toBe(false);
  });
});

describe('web manifest', () => {
  const m = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8'));
  it('has the fields needed to be installable', () => {
    expect(m.name).toBeTruthy();
    expect(m.start_url).toBe('/');
    expect(m.display).toBe('standalone');
    const sizes = m.icons.map((i: { sizes: string }) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
  });
  it('points at icon files that exist', () => {
    for (const i of m.icons) expect(existsSync('public' + i.src)).toBe(true);
  });
});

describe('service worker source', () => {
  it('ignores Vary when matching the cache (blank-page-offline regression)', () => {
    expect(readFileSync('public/sw.js', 'utf8')).toContain('ignoreVary: true');
  });
});
