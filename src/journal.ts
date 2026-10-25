export interface Entry {
  id: string;
  foodId: string;
  at: number;
  photo?: string; // data URL, downsized
  note: string;
  stars: number;
  paid?: number;
  source: 'manual' | 'nearby-prompt' | 'receipt';
}

const KEY = 'parkbites.journal.v1';

export function loadJournal(): Entry[] {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function saveJournal(e: Entry[]): boolean {
  try { localStorage.setItem(KEY, JSON.stringify(e)); return true; } catch { return false; }
}

export function resizeImage(file: File, max = 1080): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const s = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * s);
      c.height = Math.round(img.height * s);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => reject(new Error('bad image'));
    img.src = url;
  });
}
