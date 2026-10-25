import { Food, verdict } from './data';
import type { Entry } from './journal';

const VERDICT_TEXT = { must: 'MUST EAT', eat: 'EAT IT', skip: 'SKIP IT' } as const;
const VERDICT_COLOR = { must: '#22c55e', eat: '#f59e0b', skip: '#ef4444' } as const;

function loadImg(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
}

export function caption(f: Food, e: Entry): string {
  const stars = '⭐'.repeat(e.stars);
  const tags = ['disney', f.resort === 'Disneyland' ? 'disneyland' : 'disneyworld', f.park.replace(/\W/g, '').toLowerCase(), 'disneyfood', 'disneysnacks', 'foodjournal'];
  return `${f.emoji} ${f.name} at ${f.venue} (${f.park})\n${stars} ${VERDICT_TEXT[verdict(f)]}\n${e.paid ? `$${e.paid.toFixed(2)} · ` : ''}${e.note || f.desc}\n\n${tags.map(t => '#' + t).join(' ')}`;
}

/** 1080x1920 story/reel cover, works for Instagram and TikTok. */
export async function makePostcard(f: Food, e: Entry): Promise<Blob> {
  const W = 1080, H = 1920;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#1b1464'); bg.addColorStop(1, '#6d28d9');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);

  if (e.photo) {
    const img = await loadImg(e.photo);
    const bw = W - 120, bh = 1100, x = 60, y = 220;
    const s = Math.max(bw / img.width, bh / img.height);
    g.save();
    g.beginPath(); g.roundRect(x, y, bw, bh, 48); g.clip();
    g.drawImage(img, x + (bw - img.width * s) / 2, y + (bh - img.height * s) / 2, img.width * s, img.height * s);
    g.restore();
  } else {
    g.font = '420px serif'; g.textAlign = 'center';
    g.fillText(f.emoji, W / 2, 800);
  }

  g.textAlign = 'center';
  g.fillStyle = '#fff'; g.font = '700 44px system-ui, sans-serif';
  g.fillText(`${f.park.toUpperCase()}`, W / 2, 140);

  const v = verdict(f);
  g.fillStyle = VERDICT_COLOR[v];
  g.beginPath(); g.roundRect(W / 2 - 230, 1360, 460, 110, 55); g.fill();
  g.fillStyle = '#fff'; g.font = '800 62px system-ui, sans-serif';
  g.fillText(VERDICT_TEXT[v], W / 2, 1437);

  g.font = '800 76px system-ui, sans-serif';
  wrap(g, f.name, W / 2, 1570, W - 160, 84);
  g.font = '500 42px system-ui, sans-serif'; g.fillStyle = '#e9d5ff';
  g.fillText(`${f.venue}${e.paid ? ' · $' + e.paid.toFixed(2) : ''}`, W / 2, 1740);
  g.font = '56px system-ui, sans-serif';
  g.fillText('★'.repeat(e.stars) + '☆'.repeat(5 - e.stars), W / 2, 1810);
  g.font = '500 30px system-ui, sans-serif'; g.fillStyle = '#c4b5fd';
  g.fillText('made with ParkBites', W / 2, 1880);

  return new Promise((res, rej) => c.toBlob(b => b ? res(b) : rej(new Error('toBlob')), 'image/jpeg', 0.9));
}

function wrap(g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ');
  let line = '';
  const lines: string[] = [];
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (g.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t;
  }
  lines.push(line);
  lines.slice(0, 2).forEach((l, i) => g.fillText(l, x, y + i * lh));
}
