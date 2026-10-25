import { FOODS, PARKS, EVENTS, EventKey, Food, verdict, trendLabel, distM, fmtDist, socialLinks } from './data';
import { loadJournal, saveJournal, resizeImage, Entry } from './journal';
import { makePostcard, caption } from './postcard';
import { registerServiceWorker } from './pwa';
import { seasonLabel, inSeason } from './season';
import { runQuery, nearestPark as nearestParkFor, DwellTracker, Sort } from './query';

const demo = new URLSearchParams(location.search).has('demo');

const state = {
  tab: 'explore' as 'explore' | 'journal',
  q: '',
  resort: '' as '' | 'Disneyland' | 'Disney World',
  park: '',
  venue: '',
  event: '' as '' | EventKey,
  nowOnly: true,
  now: new Date(),
  sort: 'top' as Sort,
  pos: null as { lat: number; lng: number } | null,
  journal: loadJournal(),
  detail: null as string | null,
  dwell: new DwellTracker(),
};

const $ = <T extends HTMLElement>(s: string) => document.querySelector<T>(s)!;
const app = $('#app');
const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function toast(msg: string) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

// ---------- location ----------
function startLocation() {
  if (demo) {
    state.pos = { lat: 33.8117, lng: -117.9205 }; // near Tiki Juice Bar
    return;
  }
  if (!('geolocation' in navigator)) return;
  navigator.geolocation.watchPosition(p => {
    state.pos = { lat: p.coords.latitude, lng: p.coords.longitude };
    checkDwell();
    render();
  }, () => toast('Location blocked. "Near me" needs it.'), { enableHighAccuracy: true, maximumAge: 15000 });
}

const nearestPark = () => nearestParkFor(state.pos);

const distTo = (f: Food) => state.pos ? distM(state.pos.lat, state.pos.lng, f.lat, f.lng) : Infinity;

/** Best-effort purchase detection: no Disney API exposes purchases, so we notice you lingering at a food venue and ask. */
function checkDwell() {
  if (!state.pos) return;
  for (const key of state.dwell.update(FOODS, state.pos, Date.now())) {
    const [park, venue] = key.split('|');
    promptPurchase(FOODS.filter(f => f.park === park && f.venue === venue));
  }
}

function promptPurchase(items: Food[]) {
  const d = document.createElement('div');
  d.className = 'modal';
  d.innerHTML = `<div class="sheet"><h3>Grab something at ${esc(items[0].venue)}?</h3>
    <p>Tap what you got and I'll add it to your journal.</p>
    ${items.map(f => `<button class="row" data-log="${f.id}">${f.emoji} ${esc(f.name)} · $${f.price}</button>`).join('')}
    <button class="ghost" data-close>Not now</button></div>`;
  document.body.appendChild(d);
  d.addEventListener('click', e => {
    const t = e.target as HTMLElement;
    const id = t.dataset.log;
    if (id) { addEntry(id, 'nearby-prompt'); d.remove(); }
    if (t.dataset.close !== undefined || t === d) d.remove();
  });
}

// ---------- journal ----------
function addEntry(foodId: string, source: Entry['source'], extra: Partial<Entry> = {}) {
  const f = FOODS.find(x => x.id === foodId)!;
  const e: Entry = { id: crypto.randomUUID(), foodId, at: Date.now(), note: '', stars: 4, paid: f.price, source, ...extra };
  state.journal.unshift(e);
  if (!saveJournal(state.journal)) toast('Storage full. Delete old photos.');
  else toast(`Added ${f.name} to your journal`);
  state.tab = 'journal'; syncTabs(); render();
}

// ---------- filtering ----------
const list = () => runQuery(FOODS, state);

const VERDICT = { must: ['Must eat', 'v-must'], eat: ['Eat it', 'v-eat'], skip: ['Skip it', 'v-skip'] } as const;

function card(f: Food) {
  const [vt, vc] = VERDICT[verdict(f)];
  const d = distTo(f);
  return `<article class="card" data-open="${f.id}">
    <div class="thumb">${f.emoji}</div>
    <div class="body">
      <div class="top"><b>${esc(f.name)}</b><span class="pill ${vc}">${vt}</span></div>
      <div class="sub">${EVENTS[f.event].emoji} ${EVENTS[f.event].label} · ${esc(f.venue)} · ${esc(f.park)}</div>
      <div class="meta"><span class="${inSeason(f, state.now) ? 'live' : 'off'}">${seasonLabel(f, state.now)}</span><span>★ ${f.rating.toFixed(1)} <i>(${f.votes.toLocaleString()})</i></span><span>~$${f.price}</span><span>${trendLabel(f.trend)}</span>${d < Infinity && d < 20000 ? `<span>📍 ${fmtDist(d)}</span>` : ''}</div>
    </div></article>`;
}

function renderExplore() {
  const parks = Object.entries(PARKS).filter(([, p]) => !state.resort || p.resort === state.resort).map(([n]) => n);
  const venues = [...new Set(FOODS.filter(f => (!state.park || f.park === state.park) && (!state.resort || f.resort === state.resort)).map(f => f.venue))].sort();
  const items = list();
  const np = nearestPark();
  app.innerHTML = `
    <input id="q" type="search" placeholder="Search chimney cake, pumpkin, cheddar soup…" value="${esc(state.q)}">
    <div class="chips" id="sorts">
      ${([['top', '⭐ Top rated'], ['must', '🏆 Must eat'], ['trending', '🔥 Trending'], ['near', '📍 Near me'], ['price', '💲 Cheapest']] as const)
        .map(([k, l]) => `<button data-sort="${k}" class="${state.sort === k ? 'on' : ''}">${l}</button>`).join('')}
    </div>
    <div class="chips" id="events">
      <button data-event="" class="${state.event === '' ? 'on' : ''}">All events</button>
      ${(Object.keys(EVENTS) as EventKey[]).map(k => `<button data-event="${k}" class="${state.event === k ? 'on' : ''}">${EVENTS[k].emoji} ${EVENTS[k].label}</button>`).join('')}
      <button id="now" class="${state.nowOnly ? 'on' : ''}">🟢 On the menu now</button>
    </div>
    <div class="filters">
      <select id="resort"><option value="">Both resorts</option>${['Disneyland', 'Disney World'].map(r => `<option ${state.resort === r ? 'selected' : ''}>${r}</option>`).join('')}</select>
      <select id="park"><option value="">All parks</option>${parks.map(p => `<option ${state.park === p ? 'selected' : ''}>${esc(p)}</option>`).join('')}</select>
      <select id="venue"><option value="">All food places</option>${venues.map(v => `<option ${state.venue === v ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
    </div>
    ${state.sort === 'near' ? `<p class="hint">${state.pos ? (np ? `You're at ${esc(np)}. Closest first.` : 'You don\'t look to be in a park, showing everything by distance.') : 'Waiting for your location… (try <a href="?demo=1">demo mode</a>)'}</p>` : ''}
    <p class="hint">${items.length} item${items.length === 1 ? '' : 's'}. Sample ratings and prices, confirm in the official app.</p>
    <div class="list">${items.map(card).join('') || '<p class="empty">Nothing matches.</p>'}</div>`;
  const q = $<HTMLInputElement>('#q');
  q.oninput = () => { state.q = q.value; renderList(); };
  $('#events').onclick = e => {
    const t = e.target as HTMLElement;
    if (t.id === 'now') { state.nowOnly = !state.nowOnly; renderExplore(); }
    else if (t.dataset.event !== undefined) { state.event = t.dataset.event as typeof state.event; renderExplore(); }
  };
  $('#sorts').onclick = e => { const s = (e.target as HTMLElement).dataset.sort as Sort; if (s) { state.sort = s; renderExplore(); } };
  $<HTMLSelectElement>('#resort').onchange = e => { state.resort = (e.target as HTMLSelectElement).value as typeof state.resort; state.park = ''; state.venue = ''; renderExplore(); };
  $<HTMLSelectElement>('#park').onchange = e => { state.park = (e.target as HTMLSelectElement).value; state.venue = ''; renderExplore(); };
  $<HTMLSelectElement>('#venue').onchange = e => { state.venue = (e.target as HTMLSelectElement).value; renderExplore(); };
  bindOpen();
}

function renderList() {
  const el = document.querySelector('.list');
  if (!el) return;
  el.innerHTML = list().map(card).join('') || '<p class="empty">Nothing matches.</p>';
  bindOpen();
}

function bindOpen() {
  document.querySelectorAll<HTMLElement>('[data-open]').forEach(el => el.onclick = () => { state.detail = el.dataset.open!; render(); });
}

function renderDetail(f: Food) {
  const [vt, vc] = VERDICT[verdict(f)];
  const l = socialLinks(f);
  const d = distTo(f);
  app.innerHTML = `<button class="back" id="back">← Back</button>
    <div class="hero">${f.emoji}</div>
    <h2>${esc(f.name)} <span class="pill ${vc}">${vt}</span></h2>
    <p class="sub">${esc(f.venue)} · ${esc(f.area)} · ${esc(f.park)}</p>
    <p>${esc(f.desc)}</p>
    <div class="stats">
      <div><b>★ ${f.rating.toFixed(1)}</b><small>${f.votes.toLocaleString()} ratings</small></div>
      <div><b>~$${f.price}</b><small>approx price</small></div>
      <div><b>${f.trend}</b><small>${trendLabel(f.trend)}</small></div>
      <div><b>${EVENTS[f.event].emoji}</b><small>${seasonLabel(f, state.now)}</small></div>
      ${d < 20000 ? `<div><b>${fmtDist(d)}</b><small>from you</small></div>` : ''}
    </div>
    <h3>What people are posting</h3>
    <div class="links">
      <a target="_blank" rel="noopener" href="${l.instagram}">📸 Instagram posts</a>
      <a target="_blank" rel="noopener" href="${l.tiktok}">🎵 TikTok videos</a>
      <a target="_blank" rel="noopener" href="${l.official}">🏰 Official ${f.resort} listing</a>
      <a target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination=${f.lat},${f.lng}&travelmode=walking">🧭 Walk there</a>
    </div>
    <div class="tags">${f.tags.map(t => `<span>#${esc(t)}</span>`).join('')}</div>
    <button class="primary" id="ate">I got this ✔ Add to journal</button>`;
  $('#back').onclick = () => { state.detail = null; render(); };
  $('#ate').onclick = () => { state.detail = null; addEntry(f.id, 'manual'); };
}

function renderJournal() {
  const spent = state.journal.reduce((s, e) => s + (e.paid || 0), 0);
  app.innerHTML = `
    <div class="stats"><div><b>${state.journal.length}</b><small>items eaten</small></div><div><b>$${spent.toFixed(0)}</b><small>spent</small></div>
    <div><b>${state.journal.filter(e => e.stars >= 4).length}</b><small>4★+</small></div></div>
    <button class="primary" id="add">+ Log something I ate</button>
    ${state.journal.length ? '' : '<p class="empty">Nothing yet. Tap "I got this" on any item, or enable location and I will ask when you linger at a food stand.</p>'}
    ${state.journal.map(e => {
      const f = FOODS.find(x => x.id === e.foodId)!;
      return `<article class="entry" data-id="${e.id}">
        ${e.photo ? `<img src="${e.photo}" alt="">` : `<div class="thumb big">${f.emoji}</div>`}
        <div class="body"><b>${esc(f.name)}</b><div class="sub">${esc(f.venue)} · ${new Date(e.at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</div>
        <div class="stars">${[1, 2, 3, 4, 5].map(n => `<button data-star="${n}" class="${n <= e.stars ? 'on' : ''}">★</button>`).join('')}</div>
        <textarea placeholder="Notes…" rows="2">${esc(e.note)}</textarea>
        <div class="actions">
          <label class="btn">📷 ${e.photo ? 'Retake' : 'Photo'}<input type="file" accept="image/*" capture="environment" hidden></label>
          <button data-post>📤 Make post</button><button data-del class="ghost">Delete</button></div></div></article>`;
    }).join('')}`;
  $('#add').onclick = () => {
    const d = document.createElement('div'); d.className = 'modal';
    d.innerHTML = `<div class="sheet"><h3>What did you eat?</h3><input id="mq" type="search" placeholder="Search…"><div id="ml"></div><button class="ghost" data-close>Cancel</button></div>`;
    document.body.appendChild(d);
    const fill = () => {
      const q = $<HTMLInputElement>('#mq').value.toLowerCase();
      $('#ml').innerHTML = FOODS.filter(f => (f.name + f.venue + f.park).toLowerCase().includes(q)).slice(0, 12).map(f => `<button class="row" data-log="${f.id}">${f.emoji} ${esc(f.name)} <small>${esc(f.park)}</small></button>`).join('');
    };
    fill(); $('#mq').oninput = fill;
    d.onclick = ev => { const t = ev.target as HTMLElement; if (t.dataset.log) { d.remove(); addEntry(t.dataset.log, 'manual'); } else if (t.dataset.close !== undefined || t === d) d.remove(); };
  };
  document.querySelectorAll<HTMLElement>('.entry').forEach(el => {
    const e = state.journal.find(x => x.id === el.dataset.id)!;
    const f = FOODS.find(x => x.id === e.foodId)!;
    const save = () => saveJournal(state.journal);
    el.querySelectorAll<HTMLElement>('[data-star]').forEach(b => b.onclick = () => { e.stars = +b.dataset.star!; save(); render(); });
    el.querySelector('textarea')!.onchange = ev => { e.note = (ev.target as HTMLTextAreaElement).value; save(); };
    el.querySelector<HTMLInputElement>('input[type=file]')!.onchange = async ev => {
      const file = (ev.target as HTMLInputElement).files?.[0]; if (!file) return;
      e.photo = await resizeImage(file); if (!save()) toast('Storage full'); render();
    };
    el.querySelector<HTMLElement>('[data-del]')!.onclick = () => { if (confirm('Delete this entry?')) { state.journal = state.journal.filter(x => x !== e); save(); render(); } };
    el.querySelector<HTMLElement>('[data-post]')!.onclick = () => openPost(f, e);
  });
}

async function openPost(f: Food, e: Entry) {
  const blob = await makePostcard(f, e);
  const url = URL.createObjectURL(blob);
  const cap = caption(f, e);
  const d = document.createElement('div'); d.className = 'modal';
  d.innerHTML = `<div class="sheet"><h3>Your post</h3><img class="preview" src="${url}" alt="post preview">
    <textarea id="cap" rows="5">${esc(cap)}</textarea>
    <button class="primary" id="share">Share to Instagram / TikTok</button>
    <button id="dl">Save image</button><button id="cp">Copy caption</button><button class="ghost" data-close>Close</button></div>`;
  document.body.appendChild(d);
  const capText = () => $<HTMLTextAreaElement>('#cap').value;
  $('#cp').onclick = async () => { await navigator.clipboard?.writeText(capText()); toast('Caption copied'); };
  $('#dl').onclick = () => { const a = document.createElement('a'); a.href = url; a.download = `${f.name.replace(/\W+/g, '-')}.jpg`; a.click(); };
  $('#share').onclick = async () => {
    const file = new File([blob], 'parkbites.jpg', { type: 'image/jpeg' });
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file], text: capText() }); } catch { /* cancelled */ }
    } else { toast('Sharing not supported here. Save the image and copy the caption.'); }
  };
  d.onclick = ev => { const t = ev.target as HTMLElement; if (t.dataset.close !== undefined || t === d) { d.remove(); URL.revokeObjectURL(url); } };
}

function render() {
  const open = document.activeElement;
  if (open instanceof HTMLInputElement && open.id === 'q') return; // don't clobber typing on GPS updates
  if (state.detail) return renderDetail(FOODS.find(f => f.id === state.detail)!);
  if (state.tab === 'explore') renderExplore();
  else renderJournal();
}

function syncTabs() {
  document.querySelectorAll<HTMLElement>('nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === state.tab));
}
document.querySelectorAll<HTMLElement>('nav button').forEach(b => b.onclick = () => { state.tab = b.dataset.tab as typeof state.tab; state.detail = null; syncTabs(); render(); });

startLocation();
render();
void registerServiceWorker(navigator, import.meta.env.PROD);
