/* Brand Boards — każdy styl jako tablica brandingowa na nieskończonym płótnie.
   Dane: data/styles.json (agent-design-taste + design-trends-2027), data/designer-os.json (Designer OS v3). */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const BW = 3400, BH = 5240, GX = 420, GY = 560, COLS = 8;
let world, vp, boards = [], groups = [], cam = { x: 0, y: 0, s: 0.1 }, MIN = 0.01, MAX = 2.5;
let ICONS = {}, INAMES = [];
let favs = window.DesignFavourites.read();
let filter = 'all', stops = [], pres = false, pi = 0;

/* ---------- colour helpers ---------- */
const hex2rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h.slice(0, 6), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; };
const lum = h => { const [r, g, b] = hex2rgb(h).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }); return .2126 * r + .7152 * g + .0722 * b; };
const cr = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
const sat = h => { const [r, g, b] = hex2rgb(h).map(v => v / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b); return mx === 0 ? 0 : (mx - mn) / mx * (1 - Math.abs(mx + mn - 1) * .35); };
const onC = bg => cr(bg, '#111111') >= cr(bg, '#FFFFFF') ? '#111111' : '#FFFFFF';
const uniq = a => [...new Set(a.filter(Boolean).map(x => x.toUpperCase()))];
const hash = s => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };

/* ---------- normalise every source into one board theme ---------- */
function fromADT(st) {
  const c = st.colors;
  const acc = c.accent || c.primary, acc2 = (c.primary && c.primary.toUpperCase() !== (c.text || '').toUpperCase()) ? c.primary : (c.success || c.warning);
  return { id: st.id, grp: 'adt', name: st.name, tag: st.tagline || '', desc: st.description, when: st.whenToUse, src: 'agent-design-taste', cat: st.category,
    bg: c.bg, surf: c.surface || c.bg, paper: lum(c.bg) > .5 ? c.bg : (c.surface || c.bg), ink: c.text, acc, acc2,
    pal: uniq([c.bg, c.surface, c.text, c['text-secondary'], c.primary, c.accent, c.success, c.warning, c.error]).map(h => ({ h, n: Object.keys(c).find(k => (c[k] || '').toUpperCase() === h) || '' })),
    disp: st.fonts.display || st.fonts.sans, body: st.fonts.sans || st.fonts.display, mono: st.fonts.mono || 'JetBrains Mono',
    img: st.image, imgSm: st.image && st.image.replace('.webp', '-sm.webp'), url: st.sourceUrl, extra: st.signature };
}
function fromDT(st) {
  const p = uniq(st.palette || []); const byL = [...p].sort((a, b) => lum(b) - lum(a));
  let bg = byL[0], ink = byL[byL.length - 1];
  if (lum(bg) < .35) bg = '#F4F1EA';
  if (cr(bg, ink) < 4.5) ink = onC(bg);
  const rest = p.filter(h => h !== byL[0] && h !== byL[byL.length - 1]).sort((a, b) => sat(b) - sat(a));
  const acc = rest.find(h => cr(h, bg) >= 1.8) || rest[0] || ink, acc2 = rest.find(h => h !== acc) || byL[1] || acc;
  return { id: st.id, grp: st.source === 'aie-original' ? 'aie' : st.source === 'daisyui' ? 'daisy' : 'dt', name: st.name, tag: st.tagline || '', desc: st.description, when: st.whenToUse, src: st.source === 'aie-original' ? 'AI Evolution Polska · autorska kompozycja' : st.source === 'daisyui' ? 'daisyUI · kuracja inspirowana motywami' : st.source, cat: st.category,
    bg, surf: `color-mix(in srgb, ${bg} 82%, ${ink})`, paper: bg, ink, acc, acc2,
    pal: p.map(h => ({ h, n: st.paletteSource === 'sampled' ? 'próbka' : 'kolor' })), disp: st.fonts.display || 'Inter', body: st.fonts.sans || 'Inter', mono: 'JetBrains Mono',
    img: st.image, imgSm: st.image && st.image.replace('.webp', '-sm.webp'), url: st.sourceUrl, extra: [st.composition, st.typographyText].filter(Boolean).join(' · ') };
}
function fromLG(st) {
  return { id: st.id, grp: 'lg', name: st.name, tag: st.tagline || '', desc: st.description, when: st.whenToUse,
    src: 'quickLiquid (MIT) → liquid.js', cat: st.category,
    bg: '#EAF2FF', surf: '#F4F8FF', paper: '#FFFFFF', ink: '#0B1220', acc: '#2457D6', acc2: '#7AA2FF',
    pal: st.palette.map(h => ({ h, n: 'próbka' })), disp: st.fonts.display, body: st.fonts.sans, mono: st.fonts.mono,
    img: null, url: st.sourceUrl, extra: st.composition };
}
function fromDOS(p) {
  const pr = p.primary, se = p.secondary;
  return { id: 'DOS-' + p.id, grp: 'dos', name: p.name, tag: p.mood, desc: `${p.mood}. Zastosowanie: ${p.use}.`, when: p.use, src: 'Designer OS v3 · palettes.json', cat: 'Designer OS · ' + p.category,
    bg: pr, surf: `color-mix(in srgb, ${pr} 72%, #ffffff)`, paper: lum(pr) > .55 ? pr : `color-mix(in srgb, ${pr} 18%, #ffffff)`, ink: p.recommended_text_on_primary, acc: se, acc2: p.recommended_text_on_secondary,
    pal: [{ h: pr, n: 'primary 60%' }, { h: se, n: 'secondary 30%' }, { h: p.recommended_text_on_primary, n: 'tekst na primary' }, { h: p.recommended_text_on_secondary, n: 'tekst na secondary' }],
    disp: p.display, body: p.body, mono: 'IBM Plex Mono', img: null, contrast: p.contrast, extra: 'Proporcja 60 / 30 / 10' };
}

/* ---------- generative tiles (patterns, logo marks) ---------- */
function pattern(kind, T, seed) {
  const a = T.acc, b = T.bg, i = T.ink, c = T.acc2; let g = '';
  const r = n => { seed = (seed * 1103515245 + 12345) >>> 0; return (seed % 1000) / 1000 * n; };
  if (kind === 0) { for (let x = 0; x < 6; x++) for (let y = 0; y < 6; y++) g += `<rect x="${x * 20}" y="${y * 20}" width="20" height="20" fill="${[a, b, i, c][(x + y * 3 + (seed >> (x + y)) ) % 4]}"/>`; }
  else if (kind === 1) { g = `<rect width="120" height="120" fill="${b}"/>`; for (let k = 0; k < 9; k++) g += `<circle cx="${20 + (k % 3) * 40}" cy="${20 + Math.floor(k / 3) * 40}" r="${8 + r(10)}" fill="${k % 2 ? a : i}"/>`; }
  else if (kind === 2) { g = `<rect width="120" height="120" fill="${a}"/>`; for (let k = 0; k < 7; k++) g += `<path d="M0 ${k * 20 + 6} Q30 ${k * 20 - 8} 60 ${k * 20 + 6} T120 ${k * 20 + 6}" stroke="${k % 2 ? b : i}" stroke-width="5" fill="none"/>`; }
  else { g = `<rect width="120" height="120" fill="${i}"/><circle cx="84" cy="40" r="30" fill="${a}"/><rect x="0" y="78" width="120" height="42" fill="${c}"/><path d="M0 78 L50 30 L90 78Z" fill="${b}"/>`; }
  return `<svg viewBox="0 0 120 120" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">${g}</svg>`;
}
function mark(k, T, letter) {
  const a = T.acc, i = T.ink, b = T.paper.startsWith('color-mix') ? '#fff' : T.paper, c = T.acc2;
  const M = [
    `<circle cx="42" cy="50" r="32" fill="${a}"/><rect x="48" y="28" width="40" height="44" fill="${i}" style="mix-blend-mode:multiply"/>`,
    `<path d="M10 50A40 40 0 0 1 50 10V50Z" fill="${a}"/><path d="M50 10A40 40 0 0 1 90 50H50Z" fill="${i}"/><path d="M90 50A40 40 0 0 1 50 90V50Z" fill="${c}"/><path d="M50 90A40 40 0 0 1 10 50H50Z" fill="${a}" opacity=".55"/>`,
    Array.from({ length: 12 }, (_, n) => `<rect x="47" y="8" width="6" height="34" rx="3" fill="${n % 2 ? a : i}" transform="rotate(${n * 30} 50 50)"/>`).join('') + `<circle cx="50" cy="50" r="9" fill="${i}"/>`,
    `<rect x="12" y="16" width="76" height="16" rx="8" fill="${i}"/><rect x="12" y="42" width="56" height="16" rx="8" fill="${a}"/><rect x="12" y="68" width="36" height="16" rx="8" fill="${c}"/>`,
    `<rect x="10" y="10" width="80" height="80" rx="22" fill="${a}"/><text x="50" y="68" text-anchor="middle" font-family="${T.disp}" font-weight="700" font-size="52" fill="${onC(a)}">${esc(letter)}</text>`,
    `<circle cx="50" cy="50" r="36" fill="none" stroke="${i}" stroke-width="12"/><circle cx="72" cy="30" r="12" fill="${a}"/>`,
    [0, 1, 2].map(x => [0, 1, 2].map(y => `<rect x="${17 + x * 22}" y="${17 + y * 22}" width="18" height="18" fill="${(x + y) % 2 ? a : i}" transform="rotate(45 ${26 + x * 22} ${26 + y * 22})"/>`).join('')).join('')
  ];
  return `<svg viewBox="0 0 100 100" aria-hidden="true">${M[k % M.length]}</svg>`;
}

/* ---------- extra asset helpers ---------- */
function hueTints(hex, n = 10) {
  const [r0, g0, b0] = hex2rgb(hex);
  const out = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const to = t < .5 ? [255, 255, 255] : [17, 17, 17];
    const k = t < .5 ? (0.5 - t) * 1.75 : (t - 0.5) * 1.9;
    const c = [r0, g0, b0].map((v, j) => Math.round(v + (to[j] - v) * Math.min(k, 1)));
    out.push('#' + c.map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('').toUpperCase());
  }
  return out;
}
const iconSvg = name => ICONS[name] || '';
function meshCss(T) {
  return `background-color:${T.bg};background-image:radial-gradient(at 18% 22%,${T.acc} 0,transparent 55%),radial-gradient(at 82% 18%,${T.acc2} 0,transparent 55%),radial-gradient(at 60% 85%,${T.ink} 0,transparent 55%)`;
}
const dotCss = T => `background-color:${T.bg};background-image:radial-gradient(${T.ink}33 1.2px,transparent 1.3px);background-size:20px 20px`;
const grainCss = T => `background-color:${T.paper.startsWith('color') ? '#EDEAE3' : T.paper};background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E")`;
/* ---------- board markup ---------- */
const tile = (x, y, w, h, inner, cls = '', st = '') => `<div class="t ${cls}" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${st}">${inner}</div>`;
const sec = (x, y, w, h, title, sub, body) => `<section class="sec" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><div class="sh"><b>${title}</b>${sub ? `<span>${esc(sub)}</span>` : ''}</div><div class="sb">${body}</div></section>`;
function img(T, kind, pos = '50% 50%', zoom = 1, seed = 1) {
  if (!T.img && T.grp === 'lg') {
    const g = [['#BBD4FF', '#FFD1E3', '#7AA2FF'], ['#EAF2FF', '#2457D6', '#BBD4FF'], ['#7AA2FF', '#EAF2FF', '#FFD1E3'], ['#0B1220', '#2457D6', '#EAF2FF']][seed % 4];
    return `<div style="position:absolute;inset:0;background:radial-gradient(70% 90% at 25% 20%,${g[0]},transparent 60%),radial-gradient(60% 80% at 80% 70%,${g[1]},transparent 60%),linear-gradient(140deg,${g[2]},${g[0]})"></div>
      <div style="position:absolute;left:12%;top:14%;width:56%;height:52%;border-radius:24px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.55);backdrop-filter:blur(8px)"></div>
      <div style="position:absolute;right:10%;bottom:12%;width:44%;height:40%;border-radius:20px;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.45);backdrop-filter:blur(6px)"></div>`;
  }
  if (!T.img) return pattern(kind, T, hash(T.id) + seed);
  return `<img src="${zoom > 1.2 ? T.img : T.imgSm || T.img}" alt="" loading="lazy" decoding="async" style="object-position:${pos};transform:scale(${zoom});transform-origin:${pos}">`;
}
function boardHTML(T) {
  const s = hash(T.id), L = (T.name.match(/[A-Za-zÀ-ž]/) || ['A'])[0].toUpperCase();
  const accT = onC(T.acc), acc2T = onC(T.acc2.startsWith('color') ? '#888888' : T.acc2);
  const head = `<div class="bh"><span class="pill" style="font-family:${T.disp},var(--ui)">${esc(T.name)}</span><div class="meta"><i>${esc(T.id)} · ${esc(T.cat || '')}</i><span>${esc(T.src)}${T.tag && T.tag !== T.name ? ' · ' + esc(T.tag.slice(0, 90)) : ''}</span></div><button class="fav ${favs.has(T.id) ? 'on' : ''}" data-fav="${esc(T.id)}" aria-pressed="${favs.has(T.id)}" aria-label="Ulubione: ${esc(T.name)}">♥</button></div>`;
  // concept
  const concept = sec(0, 260, 1500, 1000, 'Koncepcja', T.img ? 'wizualizacja z repo' : 'wzory generowane z palety',
    tile(0, 0, 960, 560, img(T, 3, '50% 50%', 1, 1)) +
    tile(980, 0, 520, 270, img(T, 0, '18% 30%', 2.2, 2)) +
    tile(980, 290, 520, 270, img(T, 2, '82% 72%', 2.6, 3)) +
    tile(0, 580, 560, 336, `<q>${esc((T.tag || T.name).replace(/\.$/, '').slice(0, 70))}</q><small>${esc(T.name)} · ${esc(T.id)}</small>`, 'quote') +
    tile(580, 580, 560, 336, `<h4>Kiedy używać</h4><p>${esc((T.when || T.desc || '').slice(0, 170))}</p><h4>Sygnatura</h4><p>${esc((T.extra || '').slice(0, 120))}</p>`, 'txt') +
    tile(1160, 580, 340, 336, img(T, 1, '60% 20%', 3.2, 4)));
  // typography
  const sp = (y, fam, txt, size, tg, label, w = 400) => `<div class="spec" style="top:${y}px;height:124px;--tg:${tg};--tgt:${onC(tg.startsWith('color') ? '#888888' : tg)}"><div class="tag">${esc(label)}<small>${esc(fam)}</small></div><div class="s" style="font:${w} ${size}px/1 '${fam}',var(--ui)">${txt}</div></div>`;
  const typo = sec(1560, 260, 900, 1000, 'Typografia', `${T.disp} · ${T.body}`,
    sp(0, T.disp, 'AaBbCcDdEeFfGgĄęŁż', 74, T.acc, 'Display', 700) + sp(140, T.body, 'AaBbCcDdEeFfGgHhIiJj', 64, T.ink, 'Tekst') + sp(280, T.mono, '0123 {#HEX} → ąćęłńóśźż', 44, T.acc2, 'Mono', 500) +
    `<div class="hier" style="top:424px"><div class="h1">Jasność w decyzjach</div><div class="h2">Nagłówek sekcji w kroju ${esc(T.body)}</div><p>Zażółć gęślą jaźń. Tekst główny pokazuje rytm, szarość kolumny i polskie znaki — ten krój niesie długie akapity bez zmęczenia.</p><div class="mono">H1 64 · H2 32 · body 21 · label 15</div></div>`);
  // colour
  const pal = T.pal.slice(0, 8);
  const color = sec(2520, 260, 880, 1000, 'Kolor', `${pal.length} odcieni + skala 10 stopni · klik = kopiuj HEX`,
    `<div class="stripes" style="bottom:390px">${pal.map(p => `<button data-copy="${p.h}" style="background:${p.h};color:${onC(p.h)}" title="Kopiuj ${p.h}"><small>${esc(p.n)}</small>${p.h}</button>`).join('')}</div>` +
    `<div class="ramp" style="bottom:300px">${hueTints(T.acc, 10).map(h => `<button data-copy="${h}" style="background:${h}" title="${h}"></button>`).join('')}</div>` +
    `<div class="ratio" style="height:256px">${T.contrast ? T.contrast.map(c => `<div style="background:${c.bg};color:${c.fg}">${c.ratio}:1 · ${esc(c.grade)}<small>${esc(c.label)}</small></div>`).join('')
      : [['60%', T.bg, onC(T.bg), 'tło / przestrzeń'], ['30%', T.acc, accT, 'akcent'], ['10%', T.ink, onC(T.ink), 'tekst / detale']].map(([p, b, f, l]) => `<div style="background:${b};color:${f}">${p} · ${cr(b, f).toFixed(1)}:1<small>${l}</small></div>`).join('')}</div>`);
  // mockups
  const card = (x, y, r, bg, fg, front) => `<div class="card" style="left:${x}px;top:${y}px;transform:rotate(${r}deg) scale(.74);transform-origin:0 0;background:${bg};color:${fg}">${front ? `<div style="width:64px;height:64px">${mark(s, T, L)}</div><div><div class="nm">Anna Nowak</div><div class="rl">Dyrektor kreatywna · ${esc(T.name)}</div></div>` : `<div class="nm" style="font-size:44px">${esc(T.name)}</div><div class="ct">anna@studio.pl<br>+48 500 600 700</div>`}</div>`;
  const mock = sec(0, 1320, 2340, 1000, 'Mockupy', 'billboard · strona · plakat · broszury · aplikacja · post · wizytówki',
    tile(0, 0, 980, 500, `<div class="bg">${img(T, 3, '50% 50%', 1, 5)}</div><div class="ov"><h5>Zobacz szerszy obraz.</h5><span class="cta">Sprawdź teraz →</span></div>`, 'bill') +
    tile(0, 520, 980, 396, `<div class="nv"><b style="font-family:${T.disp}">${esc(T.name)}</b><i><span>Oferta</span><span>O nas</span><span>Kontakt</span></i></div><div class="hr"><div><h5>Projekt, który mówi za Ciebie.</h5><p>Spójna marka w każdym punkcie styku.</p><span class="bt">Zacznij</span><span class="bt o">Zobacz</span></div><div class="im">${img(T, 0, '30% 60%', 1.6, 6)}</div></div>`, 'web') +
    tile(1000, 0, 430, 600, `<div class="im">${img(T, 2, '50% 35%', 1.4, 7)}</div><div class="pt"><h5>Podróż zaczyna się tutaj.</h5><p>${esc(T.name)} · edycja 2027</p></div>`, 'poster') +
    tile(1450, 0, 280, 420, `<small>${esc(T.name)}</small><h5>Witaj w domu.</h5>`, 'broch', `background:${T.acc};color:${accT}`) +
    tile(1745, 0, 280, 420, `<small>${esc(T.name)}</small><h5>Mały dom. Duża szansa.</h5>`, 'broch', `background:${T.ink};color:${onC(T.ink)}`) +
    tile(2040, 0, 300, 600, `<div class="sc"><div class="nb"><span>9:41</span><span>●●●</span></div><h6>Dzień dobry, Ania</h6><div class="im">${img(T, 1, '70% 40%', 1.8, 8)}</div><div class="row"><div class="kp">Postęp<b>72%</b></div><div class="kp">Zadania<b>12</b></div></div><div class="btn">Kontynuuj</div></div>`, 'phone') +
    tile(1450, 440, 360, 450, `<div style="position:absolute;inset:0">${img(T, 0, '40% 50%', 1.3, 9)}</div><div style="position:absolute;left:24px;right:24px;bottom:24px;padding:22px;border-radius:14px;background:${T.paper.startsWith('color') ? '#fff' : T.paper};color:${T.ink}"><div style="font:700 36px/1 ${T.disp}">−30% na start</div><div style="font:500 17px/1.3 ${T.body};margin-top:8px;opacity:.8">Post 4:5 · ${esc(T.name)}</div></div>`) +
    `<div style="position:absolute;left:1000px;top:620px;width:430px;height:296px">${tile(0, 0, 430, 296, `<div style="position:absolute;inset:0;padding:28px;display:flex;flex-direction:column;justify-content:space-between;background:${T.acc2.startsWith('color') ? T.acc : T.acc2};color:${acc2T}"><span style="font:600 16px/1 ${T.body};letter-spacing:.14em;text-transform:uppercase;opacity:.8">Bilet · wstęp</span><b style="font:800 54px/1 ${T.disp}">${esc(T.name.slice(0, 18))}</b><span style="font:500 16px/1 ${T.mono}">NR 0${(s % 900) + 100} · 2027</span></div>`)}</div>` +
    `<div style="position:absolute;left:1830px;top:620px;width:510px;height:296px">${card(10, 40, -6, T.ink, onC(T.ink), false)}${card(120, 70, 4, T.paper.startsWith('color') ? '#fff' : T.paper, T.ink, true)}</div>`);
  // logos
  const LT = [0, 1, 2, 3, 4, 5, 6].map(k => (k + s) % 7);
  const lg = (x, y, w, h, k, inv, label) => tile(x, y, w, h, `${mark(k, inv ? { ...T, ink: T.bg.startsWith('color') ? '#fff' : T.bg } : T, L)}<em>${label}</em>`, 'lg' + (inv ? ' inv' : ''));
  const logo = sec(2400, 1320, 1000, 1000, 'Logo / znaki', 'propozycje znaków SVG w palecie',
    lg(0, 0, 320, 292, LT[0], 0, 'znak A') + lg(340, 0, 320, 292, LT[1], 1, 'znak B') + lg(680, 0, 320, 292, LT[2], 0, 'znak C') +
    lg(0, 312, 320, 292, LT[3], 1, 'znak D') + lg(340, 312, 320, 292, LT[4], 0, 'monogram') + lg(680, 312, 320, 292, LT[5], 1, 'znak E') +
    tile(0, 624, 660, 292, `<div class="word">${mark(LT[0], T, L)}<span>${esc(T.name.split(/[\s/&]+/)[0].slice(0, 12))}</span></div><em>logotyp · lockup</em>`, 'lg') + lg(680, 624, 320, 292, LT[6], 0, 'wzór'));
  // slides
  const W = 550, H = 309, gp = 20, sl = [];
  const S = [
    [T.bg, T.ink, `<div class="in" style="justify-content:center;align-items:center;text-align:center"><small>${esc(T.name)}</small><h6 style="margin-top:3cqw">Clarity for Complex Decisions</h6></div>`],
    [T.ink, onC(T.ink), `<div class="in" style="justify-content:flex-end"><h6 style="font-size:11cqw">Clarity for Complex Decisions</h6></div>`],
    [T.bg, T.ink, `<div style="position:absolute;left:0;top:0;bottom:0;width:45%">${img(T, 3, '50% 50%', 1, 11)}</div><div class="in" style="left:45%;justify-content:center"><small>01 · Wstęp</small><h6 style="font-size:7cqw;margin-top:2cqw">Clarity for Complex Decisions</h6></div>`],
    ['#000', '#fff', `<div style="position:absolute;inset:0;opacity:.75">${img(T, 2, '50% 50%', 1.2, 12)}</div><div class="in" style="justify-content:flex-end;background:linear-gradient(0deg,rgba(0,0,0,.65),transparent 70%)"><h6>Clarity for Complex Decisions</h6></div>`],
    [T.acc, accT, `<div class="in" style="justify-content:space-between"><small>${esc(T.id)}</small><h6 style="font-size:10cqw">Complex Decisions</h6></div>`],
    [T.paper.startsWith('color') ? '#fff' : T.paper, T.ink, `<div class="in"><small>Agenda</small><div style="margin-top:4cqw;display:grid;gap:2cqw">${['Kontekst', 'Opcje', 'Decyzja'].map((t, n) => `<div style="display:flex;gap:3cqw;align-items:baseline;border-top:2px solid currentColor;padding-top:1.5cqw"><b style="font:700 6cqw/1 ${T.disp}">0${n + 1}</b><p style="font-size:3.6cqw">${t}</p></div>`).join('')}</div></div>`],
    [T.ink, onC(T.ink), `<div class="in" style="justify-content:center"><h6 style="font-size:6.5cqw;font-weight:400;font-style:italic">„Jasność to przewaga, której nie da się skopiować.”</h6><small style="margin-top:3cqw">— ${esc(T.name)}</small></div>`],
    [T.bg, T.ink, `<div class="in" style="justify-content:space-between"><small>Clarity</small><div style="display:flex;justify-content:space-between;align-items:flex-end"><h6 style="font-size:6cqw;max-width:60%">for Complex Decisions</h6><div style="width:14cqw;height:14cqw">${mark(s, T, L)}</div></div></div>`],
    [T.acc, accT, `<div class="in" style="justify-content:center"><b style="font:800 26cqw/0.9 ${T.disp}">3×</b><p style="font-size:3.6cqw;margin-top:2cqw">szybsze decyzje dzięki jasnym danym</p></div>`],
    [T.paper.startsWith('color') ? '#fff' : T.paper, T.ink, `<div class="in"><h6 style="font-size:6cqw">Clarity for Complex Decisions</h6><div style="display:grid;grid-template-columns:1fr 1fr;gap:4cqw;margin-top:auto"><p>Mniej szumu, więcej sygnału. Każdy slajd ma jedną myśl.</p><p>Kolor akcentu tylko tam, gdzie decyzja.</p></div></div>`],
    [T.bg, T.ink, `<div style="position:absolute;right:4cqw;top:4cqw;bottom:4cqw;width:42%;border-radius:2cqw;overflow:hidden">${img(T, 1, '60% 40%', 1.5, 13)}</div><div class="in" style="right:48%;justify-content:center"><h6 style="font-size:6.5cqw">Clarity for Complex Decisions</h6><span style="margin-top:3cqw;align-self:flex-start;padding:1.5cqw 3cqw;border-radius:99px;background:${T.acc};color:${accT};font:700 2.6cqw/1 ${T.body}">Dowiedz się więcej</span></div>`],
    [T.ink, onC(T.ink), `<div class="in" style="justify-content:center;align-items:center;text-align:center"><div style="width:16cqw;height:16cqw">${mark(s + 3, { ...T, ink: onC(T.ink) }, L)}</div><h6 style="font-size:7cqw;margin-top:3cqw">Dziękuję</h6><small style="margin-top:2cqw">${esc(T.name)}</small></div>`]
  ];
  S.forEach(([bg, fg, inner], n) => sl.push(tile((n % 6) * (W + gp), Math.floor(n / 6) * (H + gp), W, H, `<span class="no">${String(n + 1).padStart(2, '0')}</span>${inner}`, 'sl', `background:${bg};color:${fg}`)));

  /* ---- C: nowe assety ---- */
  const ic = INAMES.length ? INAMES : ['star', 'heart', 'check', 'search'];
  const pickIcons = Array.from({ length: 12 }, (_, n) => ic[(s + n * 7) % ic.length]);
  const icTiles = pickIcons.map((n, k) => {
    const col = k % 4, row = Math.floor(k / 4);
    return tile(col * 280, row * 330, 260, 310,
      `<span class="ii" style="color:${k === 0 ? T.acc : T.ink}">${iconSvg(n)}</span><em>${esc(n)}</em>`, 'lg icb');
  }).join('');
  const iconsSec = sec(0, 3200, 1100, 1000, 'Ikony', 'Lucide · ISC · klik = kopiuj SVG', icTiles);

  const bgTiles = [
    [`background:${meshCss(T)}`, 'Mesh gradient'],
    [`${dotCss(T)}`, 'Siatka punktów'],
    [`${grainCss(T)}`, 'Ziarno / papier'],
    [`background:linear-gradient(135deg,${T.acc} 0%,${T.acc2} 100%)`, 'Gradient liniowy'],
  ].map(([css, lab], k) => {
    const col = k % 2, row = Math.floor(k / 2);
    return tile(col * 560, row * 490, 540, 470, `<span class="bl">${esc(lab)}</span>`, 'bgx', css);
  }).join('');
  const bgSec = sec(1160, 3200, 1100, 1000, 'Tła i tekstury', 'CSS gotowy do skopiowania', bgTiles);

  const det = `
    <div class="dt">
      <div class="dt-row">
        <button class="b-btn" style="background:${T.acc};color:${accT}">Główny</button>
        <button class="b-btn" style="background:transparent;color:${T.ink};border:2px solid ${T.ink}">Drugi</button>
        <span class="b-chip" style="background:${T.ink};color:${onC(T.ink)}">Nowe</span>
      </div>
      <div class="dt-row"><input class="b-in" placeholder="e-mail@firma.pl" style="border-color:${T.ink}55;color:${T.ink};background:${T.paper.startsWith('color') ? '#fff' : T.paper}"></div>
      <div class="dt-row">
        <span class="b-sw" style="background:${T.acc}"><i style="background:${accT}"></i></span>
        <span class="b-sw" style="background:${T.ink}33"><i style="background:${T.ink}"></i></span>
        <span class="b-av" style="background:${T.acc};color:${accT}">AN</span>
        <span class="b-av" style="background:${T.ink};color:${onC(T.ink)}">MK</span>
      </div>
      <div class="dt-card" style="background:${T.paper.startsWith('color') ? '#fff' : T.paper};color:${T.ink};border-color:${T.ink}22">
        <b>Plan Studio</b><small>Dla zespołów do 10 osób</small>
        <div class="dt-pr"><i style="background:${T.acc};width:68%"></i></div>
        <div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:10px"><span style="font:800 34px/1 ${T.disp}">149 zł</span><span class="b-chip" style="background:${T.acc};color:${accT}">/mies.</span></div>
      </div>
      <div class="dt-toast" style="background:${T.ink};color:${onC(T.ink)}"><i style="background:${T.acc}"></i>Zapisano zmiany</div>
      <div class="dt-note" style="color:${T.ink};opacity:.65">Tokeny: radius 10 · spacing 8/16/24 · shadow 0 12px 32px</div>
    </div>`;
  const detSec = sec(2320, 3200, 1080, 1000, 'Detale UI', 'komponenty w palecie marki', det);

  const slides = sec(0, 4480, BW, 740, 'Warianty slajdu', '„Clarity for Complex Decisions” · 12 układów', sl.join(''));
  return head + concept + typo + color + mock + logo + iconsSec + bgSec + detSec + slides;
}
function phHTML(T) {
  return `<div class="ph">${T.img ? `<img src="${T.imgSm || T.img}" alt="" loading="lazy" decoding="async">` : `<div style="position:absolute;inset:0;display:grid;grid-template-columns:3fr 2fr 1fr"><div style="background:${T.bg}"></div><div style="background:${T.acc}"></div><div style="background:${T.ink}"></div></div>`}<b style="font-family:${T.disp},var(--ui)">${esc(T.name)}</b></div>`;
}

/* ---------- layout ---------- */
function layout(list) {
  const G = [['daisy', 'daisyUI', 'kuracja inspirowana motywami · nieoficjalne kompozycje'], ['aie', 'AI Evolution Polska', 'autorskie kompozycje · źródła i tokeny w Design Studio'], ['lg', 'Liquid Glass', 'materiał · refrakcja Snella · rim Fresnela · dyspersja'], ['dos', 'Designer OS v3', '14 palet · palettes.json · fonty display + body · kontrast WCAG'], ['adt', 'Style UI', 'agent-design-taste · 17 stylów z tokenami'], ['dt', 'Trendy 2027', 'design-trends-2027 · 30 kierunków z wizualizacjami']];
  let y = 0;
  for (const [g, title, sub] of G) {
    const items = list.filter(t => t.grp === g); if (!items.length) continue;
    const el = document.createElement('div'); el.className = 'gt'; el.style.cssText = `left:0;top:${y}px`; el.innerHTML = `${esc(title)}<small>${esc(sub)} · ${items.length} tablic</small>`; world.appendChild(el);
    groups.push({ g, title, x: 0, y, w: COLS * BW + (COLS - 1) * GX, h: 0 });
    y += 1900;
    items.forEach((T, n) => {
      const x = (n % COLS) * (BW + GX), by = y + Math.floor(n / COLS) * (BH + GY);
      const el = document.createElement('article'); el.className = 'bd'; el.style.cssText = `left:${x}px;top:${by}px;` + vars(T); el.dataset.id = T.id;
      el.setAttribute('aria-label', 'Tablica ' + T.name); el.innerHTML = phHTML(T); world.appendChild(el);
      boards.push({ T, x, y: by, w: BW, h: BH, el, full: false });
    });
    const rows = Math.ceil(items.length / COLS); y += rows * (BH + GY) + 1600;
    groups[groups.length - 1].h = y - groups[groups.length - 1].y;
  }
}
const vars = T => `--b-bg:${T.bg};--b-surf:${T.surf};--b-paper:${T.paper};--b-ink:${T.ink};--b-acc:${T.acc};--b-acc2:${T.acc2};--b-acc-t:${onC(T.acc)};--b-disp:'${T.disp}',Inter,sans-serif;--b-body:'${T.body}',Inter,sans-serif;--b-mono:'${T.mono}',ui-monospace,monospace;`;

/* auto-fit wide typefaces so specimens and wordmarks never overflow */
function fit(root) {
  const run = () => root.querySelectorAll('.spec .s, .lg .word span, .pill').forEach(e => {
    const box = e.classList.contains('pill') ? null : e.closest('.spec, .t');
    let fs = parseFloat(getComputedStyle(e).fontSize), n = 0;
    const over = () => box ? (e.scrollWidth > e.clientWidth + 1 || e.getBoundingClientRect().right > box.getBoundingClientRect().right - 8) : e.offsetWidth > 2100;
    while (over() && fs > 14 && n++ < 40) { fs *= .93; e.style.fontSize = fs + 'px'; }
  });
  run(); document.fonts && document.fonts.ready.then(run);
}
/* ---------- camera ---------- */
const vr = () => vp.getBoundingClientRect();
let raf = 0, idle = 0;
function apply() {
  world.style.transform = `translate3d(${cam.x}px,${cam.y}px,0) scale(${cam.s})`;
  world.classList.add('moving'); clearTimeout(idle); idle = setTimeout(() => world.classList.remove('moving'), 180);
  $('#zVal').textContent = (cam.s * 100 < 10 ? (cam.s * 100).toFixed(1) : Math.round(cam.s * 100)) + '%';
  if (!raf) raf = requestAnimationFrame(() => { raf = 0; cull(); });
}
function cull() {
  const r = vr(), s = cam.s, mx = r.width / s * .3, my = r.height / s * .3;
  const x1 = -cam.x / s - mx, y1 = -cam.y / s - my, x2 = (r.width - cam.x) / s + mx, y2 = (r.height - cam.y) / s + my;
  for (const b of boards) {
    if (b.full) continue;
    const vis = b.x < x2 && b.x + b.w > x1 && b.y < y2 && b.y + b.h > y1;
    if (vis && b.w * s >= 420) { b.el.innerHTML = boardHTML(b.T); b.full = true; fit(b.el); }
  }
}
function zoomAt(f, sx, sy) { const s2 = clamp(cam.s * f, MIN, MAX), k = s2 / cam.s; cam.x = sx - (sx - cam.x) * k; cam.y = sy - (sy - cam.y) * k; cam.s = s2; apply(); }
let anim = 0;
function flyTo(R, pad = .06, instant = false) {
  const r = vr();
  // Reserve the actual toolbar height: wrapped controls must not cover board actions.
  const chromeBottom = Math.max(0, ...[...document.querySelectorAll('.bar, .studio-shell')]
    .map(e => e.getBoundingClientRect().bottom - r.top));
  const top = Math.max(70, chromeBottom + 16), H = Math.max(120, r.height - top - 40);
  const s2 = clamp(Math.min(r.width * (1 - 2 * pad) / R.w, H * (1 - 2 * pad) / R.h), MIN, MAX);
  const tx = r.width / 2 - (R.x + R.w / 2) * s2, ty = top + H / 2 - (R.y + R.h / 2) * s2;
  cancelAnimationFrame(anim);
  if (instant || matchMedia('(prefers-reduced-motion: reduce)').matches) { cam = { x: tx, y: ty, s: s2 }; apply(); return; }
  const a = { ...cam }, t0 = performance.now(), D = 700;
  const step = t => { let k = clamp((t - t0) / D, 0, 1); k = k < .5 ? 4 * k ** 3 : 1 - (-2 * k + 2) ** 3 / 2;
    const ls = Math.exp(Math.log(a.s) + (Math.log(s2) - Math.log(a.s)) * k);
    const cx0 = (r.width / 2 - a.x) / a.s, cy0 = (r.height / 2 - a.y) / a.s, cx1 = (r.width / 2 - tx) / s2, cy1 = (r.height / 2 - ty) / s2;
    const cx = cx0 + (cx1 - cx0) * k, cy = cy0 + (cy1 - cy0) * k;
    cam = { s: ls, x: r.width / 2 - cx * ls, y: r.height / 2 - cy * ls }; apply(); if (k < 1) anim = requestAnimationFrame(step); };
  anim = requestAnimationFrame(step);
}
function bounds(list = boards) { const v = list.filter(b => !b.el.classList.contains('dim')); const L = v.length ? v : list; const x1 = Math.min(...L.map(b => b.x)), y1 = Math.min(...L.map(b => b.y)) - (L === boards || filter === 'all' ? 600 : 0); return { x: x1, y: y1, w: Math.max(...L.map(b => b.x + b.w)) - x1, h: Math.max(...L.map(b => b.y + b.h)) - y1 }; }
const fitAll = i => flyTo(bounds(), .03, i);

/* ---------- input ---------- */
function setupInput() {
  const pts = new Map(); let start = null, moved = false, pinch = null;
  vp.addEventListener('pointerdown', e => { if (e.button > 0) return; vp.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); start = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, target: e.target }; moved = false; cancelAnimationFrame(anim);
    if (pts.size === 2) { const [p, q] = [...pts.values()]; pinch = { d: Math.hypot(p.x - q.x, p.y - q.y), s: cam.s }; } });
  vp.addEventListener('pointermove', e => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 2 && pinch) { const [p, q] = [...pts.values()]; const d = Math.hypot(p.x - q.x, p.y - q.y); zoomAt(clamp(pinch.s * d / pinch.d, MIN, MAX) / cam.s, (p.x + q.x) / 2, (p.y + q.y) / 2); moved = true; return; }
    const dx = e.clientX - start.x, dy = e.clientY - start.y; if (Math.abs(dx) + Math.abs(dy) > 4) { moved = true; vp.classList.add('drag'); }
    if (moved) { cam.x = start.cx + dx; cam.y = start.cy + dy; apply(); } });
  const end = e => { if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId); vp.classList.remove('drag'); if (pts.size < 2) pinch = null;
    if (!moved && e.type === 'pointerup' && start) tap(start.target); if (!pts.size) start = null; };
  vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
  vp.addEventListener('wheel', e => { e.preventDefault(); cancelAnimationFrame(anim);
    if (e.ctrlKey || Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey && e.deltaMode === 0 && Math.abs(e.deltaY) >= 1) zoomAt(Math.exp(-e.deltaY * (e.ctrlKey ? .01 : .0018)), e.clientX, e.clientY);
    else { cam.x -= e.deltaX; cam.y -= e.deltaY; apply(); } }, { passive: false });
  addEventListener('keydown', e => { if (e.target.matches('input')) return; const r = vr();
    if (e.key === '+' || e.key === '=') zoomAt(1.25, r.width / 2, r.height / 2);
    else if (e.key === '-') zoomAt(.8, r.width / 2, r.height / 2);
    else if (e.key === '0') fitAll();
    else if (e.key === 'p' || e.key === 'P') togglePres();
    else if (pres && (e.key === 'ArrowRight' || e.key === ' ')) { e.preventDefault(); go(pi + 1); }
    else if (pres && e.key === 'ArrowLeft') go(pi - 1);
    else if (pres && e.key === 'Escape') togglePres(false);
    else if (e.key.startsWith('Arrow')) { const d = 120; cam.x += e.key === 'ArrowLeft' ? d : e.key === 'ArrowRight' ? -d : 0; cam.y += e.key === 'ArrowUp' ? d : e.key === 'ArrowDown' ? -d : 0; apply(); } });
  addEventListener('resize', apply);
}
function tap(t) {
  const c = t.closest('[data-copy]'); if (c) { copy(c.dataset.copy); return; }
  const f = t.closest('[data-fav]'); if (f) { toggleFav(f.dataset.fav); return; }
  const bd = t.closest('.bd'); if (bd) { const b = boards.find(x => x.el === bd); if (b.w * cam.s < vr().width * .6) flyTo(b, .03); }
}
function copy(v) { (navigator.clipboard ? navigator.clipboard.writeText(v) : Promise.reject()).then(() => toast('Skopiowano ' + v), () => toast(v)); }
let tt; function toast(m) { const el = $('#toast'); el.textContent = m; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 1600); }
function toggleFav(id) { favs.has(id) ? favs.delete(id) : favs.add(id); window.DesignFavourites.save(favs);
  document.querySelectorAll(`[data-fav="${CSS.escape(id)}"]`).forEach(b => { b.classList.toggle('on', favs.has(id)); b.setAttribute('aria-pressed', favs.has(id)); });
  $('#favN').textContent = favs.size; toast(favs.has(id) ? '♥ Dodano do ulubionych' : 'Usunięto z ulubionych'); if (filter === 'fav') applyFilter(); }

/* ---------- filter / search / presentation ---------- */
function applyFilter() {
  for (const b of boards) b.el.classList.toggle('dim', !(filter === 'all' || (filter === 'fav' ? favs.has(b.T.id) : b.T.grp === filter)));
  fitAll(); buildStops();
}
function buildStops() {
  stops = [];
  const SEC = [['Koncepcja', 0, 260, 1500, 1000], ['Typografia', 1560, 260, 900, 1000], ['Kolor', 2520, 260, 880, 1000], ['Mockupy', 0, 1320, 2340, 1000], ['Logo', 2400, 1320, 1000, 1000], ['Ikony', 0, 3200, 1100, 1000], ['Tła', 1160, 3200, 1100, 1000], ['Detale UI', 2320, 3200, 1080, 1000], ['Slajdy', 0, 4480, 3400, 740]];
  for (const b of boards) { if (b.el.classList.contains('dim')) continue;
    stops.push({ r: b, t: `${b.T.id} · ${b.T.name}` });
    for (const [n, x, y, w, h] of SEC) stops.push({ r: { x: b.x + x, y: b.y + y, w, h }, t: `${b.T.id} · ${b.T.name} — ${n}` }); }
}
function go(i) { if (!stops.length) return; pi = (i + stops.length) % stops.length; const s = stops[pi]; flyTo(s.r, .03); $('#hudT').textContent = `${pi + 1} / ${stops.length} · ${s.t}`; }
function togglePres(on = !pres) { pres = on; $('#hud').hidden = !pres; $('#pres').classList.toggle('on', pres); if (pres) { const r = vr(), cx = (r.width / 2 - cam.x) / cam.s, cy = (r.height / 2 - cam.y) / cam.s;
  let best = 0, bd = Infinity; stops.forEach((s, n) => { if (s.r.el === undefined && n % 7) return; const d = Math.hypot(s.r.x + s.r.w / 2 - cx, s.r.y + s.r.h / 2 - cy); if (d < bd) { bd = d; best = n; } }); go(best); } }
function setupUI() {
  $('#zIn').onclick = () => { const r = vr(); zoomAt(1.3, r.width / 2, r.height / 2); };
  $('#zOut').onclick = () => { const r = vr(); zoomAt(1 / 1.3, r.width / 2, r.height / 2); };
  $('#zVal').onclick = () => { const r = vr(); zoomAt(1 / cam.s, r.width / 2, r.height / 2); };
  $('#fit').onclick = () => fitAll();
  $('#pres').onclick = () => togglePres(); $('#presX').onclick = () => togglePres(false); $('#prev').onclick = () => go(pi - 1); $('#next').onclick = () => go(pi + 1);
  $('#theme').onclick = () => { const t = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = t; localStorage.setItem('bb-theme', t); };
  document.querySelectorAll('.chip').forEach(c => c.onclick = () => { document.querySelectorAll('.chip').forEach(x => x.classList.toggle('on', x === c)); filter = c.dataset.f; applyFilter(); });
  $('#names').innerHTML = boards.map(b => `<option value="${esc(b.T.name)}">${esc(b.T.id)}</option>`).join('');
  const find = () => { const q = $('#q').value.trim().toLowerCase(); if (!q) return; const b = boards.find(b => b.T.name.toLowerCase() === q) || boards.find(b => (b.T.name + ' ' + b.T.id + ' ' + b.T.tag).toLowerCase().includes(q)); if (b) { flyTo(b, .03); history.replaceState(null, '', '#' + b.T.id); } else toast('Brak wyników: ' + q); };
  $('#q').addEventListener('change', find); $('#q').addEventListener('keydown', e => { if (e.key === 'Enter') find(); });
  $('#favN').textContent = favs.size;
}

/* ---------- boot ---------- */
async function boot() {
  const t = localStorage.getItem('bb-theme'); if (t) document.documentElement.dataset.theme = t;
  world = $('#world'); vp = $('#vp');
  const get = u => fetch(u).then(r => { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); });
  const [STY, DOS, FC, ICO] = await Promise.all([get('data/styles.json'), get('data/designer-os.json'), get('data/font-check.json'), get('data/icon-inline.json').catch(() => ({}))]);
  ICONS = ICO; INAMES = Object.keys(ICO);
  const list = [...DOS.palettes.map(fromDOS), ...STY.filter(s => s.source === 'agent-design-taste').map(fromADT), ...STY.filter(s => s.source !== 'agent-design-taste' && s.source !== 'liquid-glass').map(fromDT), ...STY.filter(s => s.source === 'liquid-glass').map(fromLG)];
  const fams = [...new Set(list.flatMap(T => [T.disp, T.body, T.mono]))];
  layout(list); setupInput(); setupUI(); buildStops();
  const h = decodeURIComponent(location.hash.slice(1)); const hb = boards.find(b => b.T.id === h);
  if (hb) flyTo(hb, .03, true); else fitAll(true);
  window.BB = { cam, boards, stops, flyTo, fitAll, toggleFav, count: () => ({ boards: boards.length, full: boards.filter(b => b.full).length, dos: boards.filter(b => b.T.grp === 'dos').length, lg: boards.filter(b => b.T.grp === 'lg').length, adt: boards.filter(b => b.T.grp === 'adt').length, dt: boards.filter(b => b.T.grp === 'dt').length, stops: stops.length, fonts: fams.length, icons: INAMES.length }) };
  document.body.dataset.ready = '1';
}
boot().catch(e => { console.error(e); document.body.insertAdjacentHTML('beforeend', `<p style="position:fixed;inset:45% 0 auto;text-align:center">Błąd ładowania: ${esc(e.message)}</p>`); });
})();
