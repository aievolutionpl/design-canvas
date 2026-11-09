/* Design Canvas — vanilla JS infinite canvas. No build step. */
(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const MIN_Z = 0.02, MAX_Z = 3;            // 0.02 lets "Całość" show the whole board on one screen
const PL = 'Zażółć gęślą jaźń';
const PL_ALL = 'ąćęłńóśźż ĄĆĘŁŃÓŚŹŻ';

/* ---------------- colour helpers ---------------- */
function hexRgb(h) { h = (h || '').trim(); const m = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(h); if (!m) return null; let x = m[1]; if (x.length === 3) x = x.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(x.substr(i, 2), 16)); }
function lum(h) { const c = hexRgb(h); if (!c) return 0.5; const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); }
function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
function onColor(h) { return contrast(h, '#111111') >= contrast(h, '#FFFFFF') ? '#111111' : '#FFFFFF'; }
function mix(a, b, t) { const x = hexRgb(a), y = hexRgb(b); if (!x || !y) return a; return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join('').toUpperCase(); }
function sat(h) { const c = hexRgb(h); if (!c) return 0; const mx = Math.max(...c), mn = Math.min(...c); return mx === 0 ? 0 : (mx - mn) / mx * (mx / 255); }
const isHex = v => !!hexRgb(v);

/* ---------------- state ---------------- */
let STY = [], FONTS = [], BGS = [], GAL = [], SPECS = [], DOS = null;
const CK = {};   // copy-text registry for on-canvas copy buttons
const boards = [];          // every artboard on the canvas
const titles = [];          // row / section titles
const sections = [];        // {id,name,x,y,w,h,count}
const cam = { x: 0, y: 0, s: 0.1 };
let world, vp, minimap, mctx, bounds = { x: 0, y: 0, w: 1, h: 1 };
let favs = new Set([...window.DesignFavourites.read()].map(x=>x.includes(':')?x:'style:'+x));
let filterCat = 'all', query = '';
let presenting = false, presIdx = 0, presList = [];
let selected = null;

/* ---------------- tokens per style ---------------- */
function resolveVars(v, st) {
  if (!v) return v;
  return v.replace(/var\(--color-([a-z0-9-]+)\)/g, (m, k) => st.colors[k] || m)
          .replace(/var\(--shadow-(dark|light)\)/g, (m, k) => (st.shadows || {})[k] || m)
          .replace(/\s+/g, ' ');
}
function pickShadow(st) {
  const order = ['card', 'offset-md', 'hard', 'raised', 'clay', 'panel', 'plane', 'soft', 'paper', 'tile-hover', 'window'];
  const sh = st.shadows || {};
  for (const k of order) { if (sh[k]) { const r = resolveVars(sh[k], st); if (!/var\(/.test(r)) return r; } }
  return 'none';
}
function tokens(st) {
  if (st._t) return st._t;
  let t;
  if (st.source === 'agent-design-taste') {
    const c = st.colors;
    const ac = c.accent || c['accent-1'] || c.primary;
    t = {
      bg: c.bg, sf: c.surface, tx: c.text, mu: c['text-secondary'], bd: isHex(c.border) ? c.border : mix(c.bg, c.text, 0.18),
      pr: c.primary, prt: c['primary-contrast'] || onColor(c.primary), ac, act: c['accent-contrast'] || onColor(ac),
      ok: c.success, wr: c.warning, er: c.error,
      r: st.radius.md || st.radius.sm || '8px', rl: st.radius.lg || st.radius.xl || st.radius.md || '12px',
      sh: pickShadow(st), fd: st.fonts.display || st.fonts.sans, fs: st.fonts.sans || st.fonts['serif-body'], fm: st.fonts.mono || 'JetBrains Mono',
      derived: false,
    };
    if (/^\d/.test(t.r) && parseFloat(t.r) > 40) t.r = '999px';
  } else {
    // design-trends-2027: palette sampled from the AI visualisation; UI roles derived here (labelled in UI).
    const p = st.palette.slice();
    const bg = p[0];
    let tx = p.slice(1).sort((a, b) => contrast(b, bg) - contrast(a, bg))[0];
    if (contrast(tx, bg) < 4.5) tx = onColor(bg);
    const accs = p.slice(1).filter(h => h !== tx).sort((a, b) => sat(b) - sat(a));
    const ac = accs.find(h => contrast(h, bg) >= 2) || accs[0] || tx;
    t = {
      bg, sf: mix(bg, tx, 0.06), tx, mu: mix(tx, bg, 0.32), bd: mix(bg, tx, 0.18),
      pr: ac, prt: onColor(ac), ac, act: onColor(ac), ok: '#16A34A', wr: '#D97706', er: '#DC2626',
      r: '10px', rl: '16px', sh: '0 10px 30px rgba(0,0,0,.12)', fd: st.fonts.display, fs: st.fonts.sans, fm: 'JetBrains Mono',
      derived: true,
    };
  }
  t.vars = `--bg:${t.bg};--sf:${t.sf};--tx:${t.tx};--mu:${t.mu};--bd:${t.bd};--pr:${t.pr};--prt:${t.prt};--ac:${t.ac};--act:${t.act};--ok:${t.ok};--wr:${t.wr};--er:${t.er};--r:${t.r};--rl:${t.rl};--sh:${t.sh};--fd:'${t.fd}',serif;--fs:'${t.fs}',system-ui,sans-serif;--fm:'${t.fm}',ui-monospace,monospace`;
  st._t = t;
  return t;
}
function paletteOf(st) {
  if (st.source === 'agent-design-taste') {
    const seen = new Set(), out = [];
    for (const [k, v] of Object.entries(st.colors)) { if (isHex(v) && !seen.has(v.toUpperCase()) && !/contrast/.test(k)) { seen.add(v.toUpperCase()); out.push({ name: k, hex: v.toUpperCase() }); } }
    return out;
  }
  return st.palette.map((h, i) => ({ name: 'próbka ' + (i + 1), hex: h }));
}

/* ---------------- deterministic SVG marks ---------------- */
function rng(seed) { let s = 0; for (const c of seed) s = (s * 31 + c.charCodeAt(0)) >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function marks(st) {
  const t = tokens(st), R = rng(st.id), round = parseFloat(t.r) >= 12 || t.r === '999px';
  const sw = parseFloat(t.r) <= 2 ? 9 : round ? 6 : 7;
  const A = t.ac, P = t.tx, B = t.bg;
  const rr = round ? 22 : parseFloat(t.r) <= 2 ? 0 : 8;
  const out = [];
  // 1: monogram-like stacked shapes
  out.push(`<svg viewBox="0 0 100 100"><rect x="14" y="14" width="44" height="44" rx="${rr}" fill="${A}"/><rect x="42" y="42" width="44" height="44" rx="${rr}" fill="none" stroke="${P}" stroke-width="${sw}"/></svg>`);
  // 2: radial / sun
  const n = 6 + Math.floor(R() * 6); let rays = '';
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; rays += `<line x1="${50 + Math.cos(a) * 24}" y1="${50 + Math.sin(a) * 24}" x2="${50 + Math.cos(a) * 42}" y2="${50 + Math.sin(a) * 42}" stroke="${P}" stroke-width="${sw * .8}" stroke-linecap="${round ? 'round' : 'butt'}"/>`; }
  out.push(`<svg viewBox="0 0 100 100">${rays}<circle cx="50" cy="50" r="16" fill="${A}"/></svg>`);
  // 3: split circle / letter
  out.push(`<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="38" fill="${P}"/><path d="M50 12 A38 38 0 0 1 50 88 Z" fill="${A}"/><circle cx="50" cy="50" r="${10 + R() * 8}" fill="${B}"/></svg>`);
  return out;
}
const ICONS = [
  '<path d="M4 11l8-7 8 7v9H4z"/><path d="M10 20v-6h4v6"/>',
  '<circle cx="11" cy="11" r="6"/><path d="M20 20l-4.5-4.5"/>',
  '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
  '<path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>',
  '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1L7 17M17 7l2.1-2.1"/>',
];

/* ---------------- artboard renderers ---------------- */
const VAR_TITLE = 'Clarity for Complex Decisions';
const R = {
  concept(st) {
    const t = tokens(st);
    return `<div class="concept"><div class="txt"><div class="eyebrow">${esc(st.id)} · ${esc(st.category)}</div><h1>${esc(st.name)}</h1><div class="tagline">${esc(st.tagline)}</div><div class="desc">${esc(st.description)}${st.principles ? ' — ' + esc(st.principles) : ''}</div><div class="when"><b>Kiedy używać</b>${esc(st.whenToUse)}</div></div><figure class="img" style="margin:0"><img src="${st.image}" alt="${esc(st.name)} — ${esc(st.imageNote)}" loading="lazy" decoding="async" width="${st.imageW}" height="${st.imageH}"><figcaption class="fine">${esc(st.imageNote)}</figcaption></figure></div>`;
  },
  conceptLite(st) { return `<div class="concept"><div class="txt"><h1>${esc(st.name)}</h1></div><div class="img"><img src="${st.image.replace('.webp', '-sm.webp')}" alt="" loading="lazy" decoding="async"></div></div>`; },
  typo(st) {
    const t = tokens(st);
    const src = st.fontsSource === 'tokens' ? 'z tokens.json' : 'dobór sugerowany (repo opisuje typografię słownie: „' + esc(st.typographyText) + '”)';
    return `<div class="typo"><div class="eyebrow">Typografia · ${src}</div><div class="big">Aa</div><div class="abc">AaBbCcDdEeFfGg</div><div class="pl">${PL} · ${PL_ALL}</div><div class="fam"><div>Nagłówki<b style="font-family:var(--fd)">${esc(t.fd)}</b></div><div>Tekst<b style="font-family:var(--fs)">${esc(t.fs)}</b></div><div>Mono<b style="font-family:var(--fm)">${esc(t.fm)}</b></div></div><div class="hier"><div class="h1">Nagłówek H1<span>${esc(st.fontSizes?.h1 || '')}</span></div><div class="h2">Nagłówek drugiego rzędu H2<span>${esc(st.fontSizes?.h2 || '')}</span></div><div class="body">Tekst główny: krótki akapit pokazujący rytm i czytelność kroju w zdaniu po polsku.<span>${esc(st.fontSizes?.body || '')}</span></div><div class="cap">Etykieta · podpis · 2027</div></div></div>`;
  },
  typoLite(st) { return `<div class="typo"><div class="big">Aa</div></div>`; },
  colour(st) {
    const pal = paletteOf(st).slice(0, 9);
    const note = st.paletteSource === 'tokens' ? 'Źródło: tokens.json (light). Kliknij blok, aby skopiować HEX.' : 'Próbkowane z wizualizacji AI (median-cut) · opis koloru w repo: „' + esc(st.colorText) + '”. Kliknij, aby skopiować.';
    return `<div class="colour"><h3>Kolor</h3><div class="blocks">${pal.map(c => `<button class="cblock" data-copy="${c.hex}" style="background:${c.hex};color:${onColor(c.hex)}"><span>${c.hex}<small>${esc(c.name)}</small></span></button>`).join('')}</div><div class="foot">${note}</div></div>`;
  },
  colourLite(st) { const pal = paletteOf(st).slice(0, 9); return `<div class="colour" style="padding:56px"><div class="blocks" style="grid-row:1/-1">${pal.map(c => `<div class="cblock" style="background:${c.hex}"></div>`).join('')}</div></div>`; },
  mock(st) {
    const t = tokens(st), m = marks(st)[0];
    const img = st.image.replace('.webp', '-sm.webp');
    return `<div class="mock">
<div class="mk-card">${m}<div><div class="nm">AI Evolution</div><div class="rl">Studio projektowe · ${esc(st.name)}</div></div><div class="ct">hello@przyklad.pl<br>+48 000 000 000</div></div>
<div class="mk-poster" style="background-image:url('${img}')"><div class="k">Plakat · 2027</div><h4>${esc(st.name)}</h4><div class="d">Wystawa · warsztat · premiera</div></div>
<div class="mk-broch"><div><b>Broszura</b>Okładka z hasłem i krótkim wstępem.</div><div><b>Oferta</b>Trzy korzyści w rytmie kolumn.</div><div><b>Kontakt</b>Mapa i godziny.<i style="background-image:url('${img}')"></i></div></div>
<div class="mk-ui"><nav><span class="lg">${m}Marka</span><span>Produkt</span><span>Cennik</span><span class="btn sm">Zacznij</span></nav><div class="hero"><div class="eyebrow" style="font-size:13px">Landing hero</div><h4>${esc(VAR_TITLE)}</h4><p>Przykładowa sekcja hero, przycisk, karty i nawigacja zbudowane tokenami tego stylu.</p><div class="cta"><span class="btn">Wypróbuj</span><span class="btn sec">Zobacz demo</span></div></div><div class="cards"><div><b>24</b>szablony</div><div><b>3×</b>szybciej</div><div><b>PL</b>polskie znaki</div></div></div>
</div><div class="src-note fine">Mockupy HTML/CSS z tokenów stylu · treść demonstracyjna</div>`;
  },
  mockLite(st) { return `<div class="mock"><div class="mk-card"></div><div class="mk-poster" style="background-image:url('${st.image.replace('.webp', '-sm.webp')}')"></div><div class="mk-broch"></div><div class="mk-ui"></div></div>`; },
  logos(st) {
    const t = tokens(st), sw = parseFloat(t.r) <= 2 ? 2.4 : 1.8;
    return `<div class="logos"><h3>Logo / ikony</h3><div class="marks">${marks(st).map(s => `<div>${s}</div>`).join('')}</div><div class="marks">${marks(st).map(s => `<div style="background:${t.tx}">${s.replaceAll(t.tx, t.bg)}</div>`).join('')}</div><div class="icons">${ICONS.map(p => `<svg viewBox="0 0 24 24" style="stroke-width:${sw}">${p}</svg>`).join('')}</div><div class="foot fine">Znaki koncepcyjne wygenerowane w kodzie z palety stylu — nie są logo z repozytoriów.</div></div>`;
  },
  logosLite(st) { return `<div class="logos"><div class="marks">${marks(st).map(s => `<div>${s}</div>`).join('')}</div></div>`; },
  vars(st) {
    const im = `style="background-image:url('${st.image.replace('.webp', '-sm.webp')}')"`;
    const T = esc(VAR_TITLE), S = 'Jeden ekran, jasna decyzja.';
    return `<div class="vars"><h3>Warianty slajdu · „${T}”</h3><div class="grid">
<div class="vs v1"><div class="k">01 · centrum</div><div class="t">${T}</div><div class="s">${S}</div></div>
<div class="vs v2"><div class="im" ${im}></div><div class="c"><div class="k">02 · split</div><div class="t">${T}</div><div class="s">${S}</div></div></div>
<div class="vs v3"><div class="im" ${im}></div><div class="c"><div class="k">03 · dół</div><div class="t">${T}</div></div></div>
<div class="vs v4"><div class="n">3</div><div><div class="k">04 · liczba</div><div class="t">kroki do ${T}</div></div></div>
<div class="vs v5"><div class="t">„${T}”</div><div class="s">— cytat / manifest</div></div>
<div class="vs v6"><div class="t">${T}</div><div class="cols"><div>Kontekst i dane</div><div>Opcje i ryzyka</div><div>Rekomendacja</div></div></div>
<div class="vs v7"><div class="im" ${im}></div><div class="t">${T}</div></div>
<div class="vs v8"><div class="t">${T}</div><ol><li>Zdefiniuj pytanie</li><li>Porównaj opcje</li><li>Wybierz i zmierz</li></ol></div>
</div></div>`;
  },
  varsLite(st) { return `<div class="vars"><div class="grid">${'<div class="vs"></div>'.repeat(8)}</div></div>`; },
};
const FRAMES = [
  { k: 'concept', name: 'Koncepcja', w: 1920, h: 1080 },
  { k: 'typo', name: 'Typografia', w: 1080, h: 1080 },
  { k: 'colour', name: 'Kolor', w: 1080, h: 1080 },
  { k: 'mock', name: 'Mockupy', w: 1920, h: 1080 },
  { k: 'logos', name: 'Logo / ikony', w: 1080, h: 1080 },
  { k: 'vars', name: 'Warianty', w: 1920, h: 1080 },
];
const GAP = 120, ROW_H = 1080, ROW_GAP = 380;
const ROW_W = FRAMES.reduce((a, f) => a + f.w, 0) + GAP * (FRAMES.length - 1);
const COL_GAP = 2400;

/* ---------------- other cards ---------------- */
function fontCard(f) {
  const ff = `'${f.name}', ${f.category === 'serif' ? 'serif' : f.category === 'mono' ? 'monospace' : f.category === 'handwritten' ? 'cursive' : 'sans-serif'}`;
  return { ff, html: `<div class="card-pad"><div class="cat">${esc(catPL(f.category))}</div><div class="fn" style="font-family:${esc(ff)}">${esc(f.name)}</div><div class="smp" style="font-family:${esc(ff)}">${PL}</div><div class="abc" style="font-family:${esc(ff)}">${PL_ALL} AaBbCc 0123</div><div class="use">${esc(f.use)}</div><div class="pair">Para: ${esc(f.pairing)}</div></div>`,
    lite: `<div class="card-pad"><div class="fn" style="font-family:${esc(ff)}">${esc(f.name)}</div></div>` };
}
function catPL(c) { return { sans: 'Bezszeryfowy', serif: 'Szeryfowy', display: 'Display', mono: 'Monospace', handwritten: 'Odręczny' }[c] || c; }
function palCard(p) {
  return `<div class="card-pad"><h4>${esc(p.name)}</h4><p>${esc(p.note)}</p><div class="strip">${p.colors.map(c => `<button data-copy="${c.hex}" title="${esc(c.name)}" style="background:${c.hex};color:${onColor(c.hex)}">${c.hex}</button>`).join('')}</div></div>`;
}
function compBoard(st) {
  return `<div class="comp"><h3>${esc(st.name)} · komponenty</h3>
<div class="grp"><div class="lbl">Przyciski</div><div class="row"><span class="btn">Główny</span><span class="btn acc">Akcent</span><span class="btn sec">Drugi</span><span class="btn ghost">Link →</span></div></div>
<div class="grp"><div class="lbl">Pola</div><div class="field">E-mail<span>jan@przyklad.pl</span></div><div class="field err">Hasło<span>••••</span><em>Hasło jest za krótkie</em></div></div>
<div class="grp"><div class="lbl">Przełączniki i statusy</div><div class="row"><span class="tgl"><i></i>Włączone</span><span class="tgl off"><i></i>Wyłączone</span></div><div class="row"><span class="badge ok">Aktywny</span><span class="badge wr">Oczekuje</span><span class="badge">Szkic</span></div></div>
<div class="grp"><div class="lbl">Karta i alert</div><div class="ccard"><b>Raport tygodniowy</b><p>Karta z tytułem, opisem i akcją.</p><div class="row"><span class="btn sm">Otwórz</span></div></div><div class="alert">Zmiany zapisane automatycznie.</div></div>
</div>`;
}

/* ---------------- layout ---------------- */
function addBoard(b) { b.idx = boards.length; boards.push(b); return b; }
function layout() {
  // Cover
  addBoard({ id: 'cover', kind: 'cover', x: 0, y: 0, w: 4200, h: 2200, label: 'Design Canvas', sub: 'START', cat: 'all', search: '', vars: '', full: coverHTML, lite: coverHTML, pres: true });
  sections.push({ id: 'cover', name: 'Start', x: 0, y: 0, w: 4200, h: 2200 });
  let dosRes = { bottom: 2200 };
  if (DOS && window.DOS_LAYOUT) dosRes = window.DOS_LAYOUT({ addBoard, titles, sections, esc, onColor, CK, codeBlock }, DOS, 0, 4600);

  // Styles in 3 columns: ADT (17), DT27 01-15, DT27 16-30
  const adt = STY.filter(s => s.source === 'agent-design-taste');
  const dt = STY.filter(s => s.source === 'design-trends-2027');
  const cols = [
    { name: 'Style UI', sub: 'agent-design-taste · ' + adt.length + ' stylów', list: adt, sec: 'adt' },
    { name: 'Trendy 2027', sub: 'design-trends-2027 · 01–15', list: dt.slice(0, 15), sec: 'dt27' },
    { name: 'Trendy 2027', sub: 'design-trends-2027 · 16–30', list: dt.slice(15), sec: 'dt27b' },
  ];
  const y0 = dosRes.bottom + 3200;
  cols.forEach((c, ci) => {
    const x0 = ci * (ROW_W + COL_GAP);
    titles.push({ x: x0, y: y0 - 1500, html: `${esc(c.name)}<small>${esc(c.sub)}</small>`, cls: 'sec-title' });
    c.list.forEach((st, ri) => {
      const y = y0 + ri * (ROW_H + ROW_GAP);
      titles.push({ x: x0, y: y - 60, html: `${esc(st.id)} · ${esc(st.name)}`, cls: 'row-title', row: true, h: ROW_H });
      let x = x0;
      FRAMES.forEach(f => {
        addBoard({ id: st.id + ':' + f.k, kind: 'style', frame: f.k, st, x, y, w: f.w, h: f.h, label: f.name, sub: st.id + ' · ' + st.name,
          favKey: 'style:' + st.id, cat: st.source === 'agent-design-taste' ? 'ui' : 'trend',
          search: [st.name, st.id, st.tagline, st.description, (st.aliases || []).join(' '), st.whenToUse, st.colorText || '', st.typographyText || ''].join(' ').toLowerCase(),
          vars: tokens(st).vars, full: () => R[f.k](st), lite: () => R[f.k + 'Lite'](st), pres: true });
        x += f.w + GAP;
      });
    });
    const h = c.list.length * (ROW_H + ROW_GAP);
    if (ci !== 2) sections.push({ id: c.sec, name: c.name + (ci === 1 ? ' (01–30)' : ''), x: x0, y: y0 - 1600, w: ci === 1 ? ROW_W * 2 + COL_GAP : ROW_W, h: h + 1600, count: ci === 1 ? dt.length : adt.length });
  });
  const stylesBottom = y0 + Math.max(adt.length, 15) * (ROW_H + ROW_GAP);

  // band 1: FONTY / KOLORY / TŁA
  let by = stylesBottom + 2600;
  const grid = (items, x0, y0, cw, ch, cols, gap, mk) => { items.forEach((it, i) => mk(it, x0 + (i % cols) * (cw + gap), y0 + Math.floor(i / cols) * (ch + gap + 80), cw, ch)); return { w: cols * cw + (cols - 1) * gap, h: Math.ceil(items.length / cols) * (ch + gap + 80) }; };

  let fx = 0;
  titles.push({ x: fx, y: by - 1500, html: `Fonty<small>${FONTS.length} krojów Google Fonts · polskie znaki</small>`, cls: 'sec-title' });
  let g = grid(FONTS, fx, by, 1200, 900, 9, 90, (f, x, y, w, h) => {
    const c = fontCard(f);
    addBoard({ id: 'font:' + f.name, kind: 'font', f, x, y, w, h, label: f.name, sub: catPL(f.category), favKey: 'font:' + f.name, cat: 'font', cls: 'fontcard',
      search: (f.name + ' ' + f.category + ' ' + catPL(f.category) + ' ' + f.use).toLowerCase(), vars: '', full: () => c.html, lite: () => c.lite });
  });
  sections.push({ id: 'fonts', name: 'Fonty', x: fx, y: by - 1600, w: g.w, h: g.h + 1600, count: FONTS.length });

  const kx = fx + g.w + 2400;
  const pals = STY.map(st => ({ id: st.id, name: st.id + ' · ' + st.name, note: st.paletteSource === 'tokens' ? 'tokens.json · agent-design-taste' : 'próbkowane z wizualizacji · design-trends-2027', colors: paletteOf(st).slice(0, 9) }));
  pals.push({ id: 'DT27-site', name: 'design-trends-2027 · strona', note: 'DESIGN.md repo design-trends-2027', colors: [['papier', '#F6F5EE'], ['atrament', '#202621'], ['limonka', '#D9F356'], ['niebieski', '#BDD7F4'], ['róż', '#F0A8B9'], ['koral', '#F16B55']].map(([n, h]) => ({ name: n, hex: h })) });
  pals.push({ id: 'apple-clarity', name: 'Apple Clarity · tokeny kandydackie', note: 'skill apple-clarity (propozycja, nie pomiar)', colors: [['canvas', '#F5F6F8'], ['surface', '#FFFFFF'], ['text', '#17191D'], ['secondary', '#525866'], ['border', '#E2E5EA'], ['action', '#2457D6'], ['success', '#167044']].map(([n, h]) => ({ name: n, hex: h })) });
  titles.push({ x: kx, y: by - 1500, html: `Kolory<small>${pals.length} palet</small>`, cls: 'sec-title' });
  g = grid(pals, kx, by, 1300, 620, 6, 90, (p, x, y, w, h) => {
    addBoard({ id: 'pal:' + p.id, kind: 'palette', p, x, y, w, h, label: p.name, sub: 'paleta', favKey: 'pal:' + p.id, cat: 'colour', cls: 'palcard',
      search: (p.name + ' ' + p.note + ' ' + p.colors.map(c => c.hex).join(' ')).toLowerCase(), vars: '', full: () => palCard(p), lite: () => `<div class="card-pad"><div class="strip">${p.colors.map(c => `<button style="background:${c.hex}"></button>`).join('')}</div></div>` });
  });
  sections.push({ id: 'colours', name: 'Kolory', x: kx, y: by - 1600, w: g.w, h: g.h + 1600, count: pals.length });
  window.__PALS = pals;

  const tx = kx + g.w + 2400;
  titles.push({ x: tx, y: by - 1500, html: `Tła<small>${BGS.length} teł CSS / SVG — do skopiowania</small>`, cls: 'sec-title' });
  g = grid(BGS, tx, by, 1000, 1000, 6, 90, (b, x, y, w, h) => {
    const st = Object.entries(b.style).map(([k, v]) => k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ':' + v).join(';');
    const html = `<div class="fill" style="${esc(st)}"></div><div class="meta"><div>${esc(b.name)}<small>${esc(b.category)} · kliknij po CSS</small></div></div>`;
    addBoard({ id: 'bg:' + b.id, kind: 'bg', b, x, y, w, h, label: b.name, sub: b.category, favKey: 'bg:' + b.id, cat: 'bg', cls: 'bgcard',
      search: (b.name + ' ' + b.category + ' tło ' + b.id).toLowerCase(), vars: '', full: () => html, lite: () => `<div class="fill" style="${esc(st)}"></div>` });
  });
  sections.push({ id: 'bgs', name: 'Tła', x: tx, y: by - 1600, w: g.w, h: g.h + 1600, count: BGS.length });
  let band1H = 0; sections.slice(-3).forEach(s => band1H = Math.max(band1H, s.h));

  // band 2: UI KOMPONENTY + GALERIA
  by = by - 1600 + band1H + 3000;
  titles.push({ x: 0, y: by - 1500, html: `UI komponenty<small>${adt.length} systemów × 13 elementów</small>`, cls: 'sec-title' });
  g = grid(adt, 0, by, 1600, 1000, 6, 100, (st, x, y, w, h) => {
    addBoard({ id: 'comp:' + st.id, kind: 'comp', st, x, y, w, h, label: st.name + ' · komponenty', sub: st.id, favKey: 'comp:' + st.id, cat: 'comp',
      search: (st.name + ' komponenty przyciski karty pola ' + st.id).toLowerCase(), vars: tokens(st).vars, full: () => compBoard(st), lite: () => `<div class="comp"><h3>${esc(st.name)}</h3></div>`, pres: true });
  });
  sections.push({ id: 'comps', name: 'UI komponenty', x: 0, y: by - 1600, w: g.w, h: g.h + 1600, count: adt.length });
  const gx = g.w + 2400;
  titles.push({ x: gx, y: by - 1500, html: `Galeria trendów<small>${GAL.length} wizualizacji AI · design-trends-2027</small>`, cls: 'sec-title' });
  g = grid(GAL, gx, by, 1600, 1000, 3, 100, (it, x, y, w, h) => {
    const html = `<img src="${it.image}" alt="${esc(it.name)} — wizualizacja AI" loading="lazy" decoding="async"><figcaption>${esc(it.name)}</figcaption>`;
    addBoard({ id: 'gal:' + it.id, kind: 'gal', it, x, y, w, h, label: it.name, sub: 'wizualizacja AI', favKey: 'gal:' + it.id, cat: 'gal', cls: 'galcard',
      search: (it.name + ' galeria trend').toLowerCase(), vars: '', full: () => html, lite: () => `<img src="${it.image.replace('.webp', '-sm.webp')}" alt="" loading="lazy">`, pres: true });
  });
  sections.push({ id: 'gallery', name: 'Galeria trendów', x: gx, y: by - 1600, w: g.w, h: g.h + 1600, count: GAL.length });

  // bounds
  let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
  for (const b of boards) { x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h); }
  for (const t of titles) { y1 = Math.min(y1, t.y - 200); }
  bounds = { x: x1 - 400, y: y1 - 400, w: x2 - x1 + 800, h: y2 - y1 + 800 };
  sections.sort((a, b) => (b.first ? 1 : 0) - (a.first ? 1 : 0));
  presList = boards.filter(b => b.pres);
  // section slides for grids
  for (const id of ['fonts', 'colours', 'bgs']) { const s = sections.find(q => q.id === id); presList.push({ pseudo: true, label: s.name, sub: 'sekcja', x: s.x, y: s.y + 1600, w: s.w, h: s.h - 1600 }); }
}
function coverHTML() {
  const n = (k) => boards.filter(b => b.kind === k).length;
  return `<div class="cover"><h1>Design Canvas</h1><p>Osobista biblioteka assetów projektowych AI Evolution Polska: brand boardy stylów z repozytoriów <b>agent-design-taste</b> i <b>design-trends-2027</b>, fonty z polskimi znakami, palety, tła CSS i komponenty UI.</p><div class="stats"><div><b>${DOS ? DOS.palettes.length : 0}</b>palet Designer OS</div><div><b>${STY.length}</b>stylów</div><div><b>${FONTS.length}</b>fontów</div><div><b>${(window.__PALS || []).length}</b>palet</div><div><b>${BGS.length}</b>teł</div><div><b>${n('comp')}</b>zestawów UI</div></div><div class="keys"><span><kbd>P</kbd> prezentacja</span><span><kbd>←</kbd> <kbd>→</kbd> następny artboard</span><span><kbd>0</kbd> całość</span><span><kbd>+</kbd> <kbd>−</kbd> zoom</span><span>♥ ulubione → eksport moodboardu</span></div></div>`;
}

/* ---------------- DOM build ---------------- */
function build() {
  const frag = document.createDocumentFragment();
  for (const t of titles) {
    const el = document.createElement('div');
    el.className = t.cls; el.innerHTML = t.html;
    el.style.left = t.x + 'px';
    if (t.w) { el.style.width = t.w + 'px'; el.style.height = t.h + 'px'; }
    if (t.row) { el.style.top = t.y + 'px'; el.style.transform = 'translate(calc(-100% - 140px), 0)'; el.style.textAlign = 'right'; }
    else el.style.top = t.y + 'px';
    t.el = el; frag.appendChild(el);
  }
  for (const b of boards) {
    const w = document.createElement('div');
    w.className = 'abw'; w.dataset.idx = b.idx;
    w.style.cssText = `left:${b.x}px;top:${b.y}px;width:${b.w}px;height:${b.h}px`;
    const fav = b.favKey ? `<button class="fav" data-fav="${esc(b.favKey)}" aria-label="Dodaj do ulubionych: ${esc(b.sub + ' ' + b.label)}" aria-pressed="false">♥</button>` : '';
    w.innerHTML = `<div class="ab-label">${fav}<b>${esc(b.label)}</b><span class="id">${esc(b.sub)}</span></div><div class="ab ${b.cls || ''}" style="${b.vars}"></div>`;
    b.el = w; b.inner = w.lastElementChild; b.mode = '';
    frag.appendChild(w);
  }
  world.appendChild(frag);
  syncFavUI();
}

/* ---------------- camera ---------------- */
function vpRect() { return vp.getBoundingClientRect(); }
let raf = 0;
function apply() {
  world.style.transform = `translate3d(${cam.x}px,${cam.y}px,0) scale(${cam.s})`;
  if (!raf) raf = requestAnimationFrame(() => { raf = 0; cull(); drawMinimap(); });
  $('#zVal').textContent = Math.round(cam.s * 100) + '%';
  $('#zVal').setAttribute('aria-label', 'Zoom ' + Math.round(cam.s * 100) + '%');
}
function cull() {
  const r = vpRect(), s = cam.s;
  const inv = clamp(1 / s, 1, 8);
  world.style.setProperty('--inv', inv);
  world.classList.toggle('far', s < 0.09);
  world.classList.toggle('vfar', s < 0.2);
  const rinv = 1 / s;
  for (const t of titles) if (t.row) {
    t.el.style.fontSize = Math.min(12 * rinv, 180) + 'px';
    t.el.style.maxWidth = '1100px';
    t.el.style.overflow = 'hidden';
    t.el.style.textOverflow = 'ellipsis';
  }
  const mx = r.width / s * 0.35, my = r.height / s * 0.35;
  const vx1 = -cam.x / s - mx, vy1 = -cam.y / s - my, vx2 = (r.width - cam.x) / s + mx, vy2 = (r.height - cam.y) / s + my;
  for (const b of boards) {
    const vis = b.x < vx2 && b.x + b.w > vx1 && b.y < vy2 && b.y + b.h > vy1;
    const screenW = b.w * s;
    b.el.style.visibility = vis ? '' : 'hidden';
    if (!vis) continue; // Keep cached contents; do not rebuild boards during every pan.
    const want = screenW >= 230 ? 'full' : (screenW < 70 ? 'overview' : 'lite');
    if (want !== b.mode) {
      b.inner.innerHTML = want === 'full' ? b.full() : want === 'overview' ? '<div style="height:100%;background:var(--bg,#eef0f4);border:2px solid var(--ac,#d5d9e2)"></div>' : b.lite();
      b.mode = want;
    }
  }
}
function zoomAt(f, sx, sy) {
  const s2 = clamp(cam.s * f, MIN_Z, MAX_Z); const k = s2 / cam.s;
  cam.x = sx - (sx - cam.x) * k; cam.y = sy - (sy - cam.y) * k; cam.s = s2; apply();
}
let anim = 0;
function flyTo(rect, pad = 0.08, instant = false) {
  const r = vpRect();
  const s2 = clamp(Math.min(r.width * (1 - pad * 2) / rect.w, (r.height * (1 - pad * 2)) / rect.h), MIN_Z, MAX_Z);
  const tx = r.width / 2 - (rect.x + rect.w / 2) * s2, ty = r.height / 2 - (rect.y + rect.h / 2) * s2;
  cancelAnimationFrame(anim);
  if (instant || REDUCED) { cam.x = tx; cam.y = ty; cam.s = s2; apply(); return; }
  const a = { ...cam }, t0 = performance.now(), D = 650;
  // world-space centre interpolation with log-scale zoom
  const ca = { x: (r.width / 2 - a.x) / a.s, y: (r.height / 2 - a.y) / a.s }, cb = { x: rect.x + rect.w / 2, y: rect.y + rect.h / 2 };
  const step = now => {
    let p = Math.min(1, (now - t0) / D); p = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
    const s = Math.exp(Math.log(a.s) + (Math.log(s2) - Math.log(a.s)) * p);
    const cx = ca.x + (cb.x - ca.x) * p, cy = ca.y + (cb.y - ca.y) * p;
    cam.s = s; cam.x = r.width / 2 - cx * s; cam.y = r.height / 2 - cy * s; apply();
    if (p < 1) anim = requestAnimationFrame(step);
  };
  anim = requestAnimationFrame(step);
}
const fitAll = (instant) => flyTo(bounds, 0.02, instant);

/* ---------------- input ---------------- */
function setupInput() {
  const pts = new Map(); let dragStart = null, moved = false, pinch = null;
  vp.addEventListener('pointerdown', e => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    vp.setPointerCapture(e.pointerId);
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    cancelAnimationFrame(anim);
    if (pts.size === 1) { dragStart = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, target: e.target }; moved = false; }
    if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), s: cam.s }; moved = true; }
  });
  vp.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const r = vpRect();
    if (pts.size === 2 && pinch) {
      const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      const mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
      zoomAt((pinch.s * d / pinch.d) / cam.s, mx, my); return;
    }
    if (dragStart) {
      const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
      if (!moved && Math.hypot(dx, dy) > 5) { moved = true; vp.classList.add('dragging'); }
      if (moved) { cam.x = dragStart.cx + dx; cam.y = dragStart.cy + dy; apply(); }
    }
  });
  const end = e => {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (pts.size === 0) {
      vp.classList.remove('dragging');
      if (dragStart && !moved && e.type === 'pointerup') clickAt(dragStart.target);
      dragStart = null;
    } else if (pts.size === 1) { const p = [...pts.values()][0]; dragStart = { x: p.x, y: p.y, cx: cam.x, cy: cam.y, target: null }; }
  };
  vp.addEventListener('pointerup', end); vp.addEventListener('pointercancel', end);
  vp.addEventListener('wheel', e => {
    e.preventDefault(); cancelAnimationFrame(anim);
    const r = vpRect();
    let d = e.deltaY * (e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1);
    const f = Math.exp(-d * (e.ctrlKey ? 0.01 : 0.0018));
    zoomAt(f, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });
  window.addEventListener('resize', () => apply());

  document.addEventListener('keydown', e => {
    if (e.target.closest('input,textarea')) { if (e.key === 'Escape') e.target.blur(); return; }
    const r = vpRect(), cx = r.width / 2, cy = r.height / 2;
    const k = e.key;
    if (k === '+' || k === '=') zoomAt(1.25, cx, cy);
    else if (k === '-' || k === '_') zoomAt(0.8, cx, cy);
    else if (k === '0') fitAll();
    else if (k === 'p' || k === 'P') togglePres();
    else if (k === 'Escape') { if (presenting) togglePres(false); closePanels(); }
    else if (presenting && (k === 'ArrowRight' || k === 'ArrowDown' || k === ' ' || k === 'PageDown')) presGo(presIdx + 1);
    else if (presenting && (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp')) presGo(presIdx - 1);
    else if (k.startsWith('Arrow')) { const st = 120; cam.x += k === 'ArrowLeft' ? st : k === 'ArrowRight' ? -st : 0; cam.y += k === 'ArrowUp' ? st : k === 'ArrowDown' ? -st : 0; apply(); }
    else return;
    e.preventDefault();
  });
}
function clickAt(target) {
  if (!target) return;
  const ckb = target.closest('[data-ck]');
  if (ckb) { copyText(CK[ckb.dataset.ck], 'Skopiowano do schowka'); return; }
  const copy = target.closest('[data-copy]');
  if (copy) { copyText(copy.dataset.copy, 'Skopiowano ' + copy.dataset.copy); return; }
  const fav = target.closest('[data-fav]');
  if (fav) { toggleFav(fav.dataset.fav); return; }
  const w = target.closest('.abw');
  if (w) openDetail(boards[+w.dataset.idx]);
}

/* ---------------- minimap ---------------- */
function drawMinimap() {
  if (!minimap || !bounds || !boards || !boards.length) return;
  const W = minimap.width, H = minimap.height, k = Math.min(W / bounds.w, H / bounds.h);
  const ox = (W - bounds.w * k) / 2, oy = (H - bounds.h * k) / 2;
  minimap._t = { k, ox, oy };
  const dark = document.documentElement.dataset.theme === 'dark';
  mctx.fillStyle = dark ? '#24262B' : '#FFFFFF'; mctx.fillRect(0, 0, W, H);
  for (const b of boards) {
    mctx.fillStyle = b.dosPal ? b.dosPal.primary : b.kind === 'dos' ? '#14213D' : b.st ? tokens(b.st).bg : b.kind === 'bg' ? '#9AA3B2' : (dark ? '#3A3D44' : '#D5D9E0');
    if (b.el.classList.contains('dim')) mctx.globalAlpha = .15;
    mctx.fillRect(ox + (b.x - bounds.x) * k, oy + (b.y - bounds.y) * k, Math.max(1, b.w * k), Math.max(1, b.h * k));
    mctx.globalAlpha = 1;
  }
  const r = vpRect();
  mctx.strokeStyle = dark ? '#7AA2FF' : '#2457D6'; mctx.lineWidth = 2;
  mctx.strokeRect(ox + (-cam.x / cam.s - bounds.x) * k, oy + (-cam.y / cam.s - bounds.y) * k, r.width / cam.s * k, r.height / cam.s * k);
}
function setupMinimap() {
  const dpr = Math.min(2, devicePixelRatio || 1); const css = minimap.getBoundingClientRect();
  minimap.width = Math.round(css.width * dpr); minimap.height = Math.round(css.height * dpr);
  let down = false;
  const go = e => {
    const rc = minimap.getBoundingClientRect(), t = minimap._t, sx = minimap.width / rc.width;
    const wx = ((e.clientX - rc.left) * sx - t.ox) / t.k + bounds.x, wy = ((e.clientY - rc.top) * sx - t.oy) / t.k + bounds.y;
    const r = vpRect(); cam.x = r.width / 2 - wx * cam.s; cam.y = r.height / 2 - wy * cam.s; apply();
  };
  minimap.addEventListener('pointerdown', e => { down = true; minimap.setPointerCapture(e.pointerId); cancelAnimationFrame(anim); go(e); });
  minimap.addEventListener('pointermove', e => down && go(e));
  minimap.addEventListener('pointerup', () => down = false);
}

/* ---------------- presentation ---------------- */
function nearestPres() {
  const r = vpRect(), cx = (r.width / 2 - cam.x) / cam.s, cy = (r.height / 2 - cam.y) / cam.s;
  let best = 0, bd = Infinity;
  presList.forEach((b, i) => { const d = Math.hypot(b.x + b.w / 2 - cx, b.y + b.h / 2 - cy); if (d < bd) { bd = d; best = i; } });
  return best;
}
function togglePres(force) {
  presenting = force ?? !presenting;
  document.body.classList.toggle('presenting', presenting);
  $('#presHud').hidden = !presenting;
  $('#presBtn').setAttribute('aria-pressed', presenting);
  if (presenting) { closePanels(); requestAnimationFrame(() => presGo(nearestPres())); }
  else { boards.forEach(b => b.el.classList.remove('active')); apply(); }
}
function presGo(i) {
  presIdx = (i + presList.length) % presList.length;
  const b = presList[presIdx];
  boards.forEach(x => x.el.classList.remove('active'));
  if (!b.pseudo) b.el.classList.add('active');
  $('#presInfo').textContent = `${presIdx + 1} / ${presList.length} · ${b.sub} — ${b.label}`;
  flyTo(b, 0.07);
}

/* ---------------- favourites ---------------- */
function saveFavs() { window.DesignFavourites.save(new Set([...favs].map(x=>x.startsWith('style:')?x.slice(6):x))); }
function toggleFav(key) {
  favs.has(key) ? favs.delete(key) : favs.add(key); saveFavs(); syncFavUI();
  toast(favs.has(key) ? 'Dodano do ulubionych' : 'Usunięto z ulubionych');
}
function syncFavUI() {
  document.querySelectorAll('[data-fav]').forEach(b => { const on = favs.has(b.dataset.fav); b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  $('#favCount').textContent = favs.size;
  renderFavList();
}
function favItem(key) {
  const [type, ...rest] = key.split(':'); const id = rest.join(':');
  if (type === 'style' || type === 'comp') { const st = STY.find(s => s.id === id); if (!st) return null; return { key, type, title: st.name + (type === 'comp' ? ' · komponenty' : ''), sub: st.id + ' · ' + st.category, st, board: boards.find(b => b.id === (type === 'comp' ? 'comp:' + id : id + ':concept')) }; }
  if (type === 'font') { const f = FONTS.find(x => x.name === id); return f && { key, type, title: f.name, sub: 'Font · ' + catPL(f.category), f, board: boards.find(b => b.id === key) }; }
  if (type === 'bg') { const b = BGS.find(x => x.id === id); return b && { key, type, title: b.name, sub: 'Tło · ' + b.category, b, board: boards.find(x => x.id === key) }; }
  if (type === 'pal') { const p = (window.__PALS || []).find(x => x.id === id); return p && { key, type, title: p.name, sub: 'Paleta', p, board: boards.find(x => x.id === key) }; }
  if (type === 'dos') { const b = boards.find(x => x.favKey === key); return b && { key, type, title: b.dosPal ? `Designer OS ${b.dosPal.id} · ${b.dosPal.name}` : b.label, sub: 'Designer OS · ' + b.sub, dos: b, board: b }; }
  if (type === 'gal') { const g = GAL.find(x => x.id === id); return g && { key, type, title: g.name, sub: 'Wizualizacja AI', g, board: boards.find(x => x.id === key) }; }
  return null;
}
function renderFavList() {
  const ul = $('#favList'); const items = [...favs].map(favItem).filter(Boolean);
  ul.innerHTML = items.length ? items.map(it => `<li><button class="go" data-go="${esc(it.key)}">${esc(it.title)}<small>${esc(it.sub)}</small></button><button class="icon-btn" data-unfav="${esc(it.key)}" aria-label="Usuń ${esc(it.title)}">✕</button></li>`).join('')
    : '<li class="empty">Brak ulubionych. Kliknij ♥ przy etykiecie dowolnego artboardu.</li>';
}
function fontLink(names) { const sp = SPECS.filter(s => names.includes(s.split(':')[0])); return sp.length ? 'https://fonts.googleapis.com/css2?' + sp.map(s => 'family=' + encodeURIComponent(s).replace(/%3A/g, ':').replace(/%40/g, '@').replace(/%3B/g, ';')).join('&') + '&display=swap' : ''; }
function exportMD() {
  const items = [...favs].map(favItem).filter(Boolean);
  const L = ['# Moodboard — Design Canvas', '', `Źródło: https://aievolutionpl.github.io/design-canvas/ · ${new Date().toISOString().slice(0, 10)} · ${items.length} pozycji`, ''];
  const grp = (t, title) => { const g = items.filter(i => i.type === t); if (!g.length) return; L.push('## ' + title, ''); g.forEach(fn => fn); return g; };
  const ds = grp('dos', 'Designer OS'); ds && ds.forEach(i => L.push(`### ${i.title}`, '', '```text', i.dos.copyText || i.title, '```', ''));
  const st = grp('style', 'Style'); st && st.forEach(i => { const t = tokens(i.st); L.push(`### ${i.st.id} · ${i.st.name}`, '', i.st.description, '', `- Kiedy: ${i.st.whenToUse}`, `- Fonty: ${t.fd} (nagłówki), ${t.fs} (tekst)${i.st.fontsSource === 'suggested' ? ' — dobór sugerowany' : ''}`, `- Paleta: ${paletteOf(i.st).slice(0, 9).map(c => c.name + ' ' + c.hex).join(', ')}${i.st.paletteSource === 'sampled' ? ' (próbkowana z wizualizacji)' : ''}`, `- Źródło: ${i.st.sourceUrl}`, '', '```text', i.st.prompt, '```', ''); });
  const fo = grp('font', 'Fonty'); fo && (fo.forEach(i => L.push(`- **${i.f.name}** (${catPL(i.f.category)}) — ${i.f.use} Para: ${i.f.pairing}`)), L.push('', '`<link rel="stylesheet" href="' + fontLink(fo.map(i => i.f.name)) + '">`', ''));
  const pa = grp('pal', 'Palety'); pa && pa.forEach(i => L.push(`- **${i.p.name}**: ${i.p.colors.map(c => c.hex).join(' ')}`)); pa && L.push('');
  const bg = grp('bg', 'Tła'); bg && bg.forEach(i => L.push(`### ${i.b.name}`, '```css', i.b.css, '```', ''));
  const co = grp('comp', 'Zestawy komponentów'); co && co.forEach(i => L.push(`- ${i.st.name} (${i.st.id}) — tokeny: ${i.st.sourceUrl}`)); co && L.push('');
  const ga = grp('gal', 'Wizualizacje'); ga && ga.forEach(i => L.push(`- ${i.g.name}: https://aievolutionpl.github.io/design-canvas/${i.g.image}`));
  return L.join('\n');
}
function exportJSON() {
  return JSON.stringify([...favs].map(favItem).filter(Boolean).map(i => {
    if (i.st) { const t = tokens(i.st); return { type: i.type, id: i.st.id, name: i.st.name, source: i.st.sourceUrl, fonts: { display: t.fd, text: t.fs, mono: t.fm, source: i.st.fontsSource }, palette: paletteOf(i.st), paletteSource: i.st.paletteSource, cssVars: t.vars, prompt: i.st.prompt }; }
    if (i.f) return { type: 'font', ...i.f, cssLink: fontLink([i.f.name]) };
    if (i.b) return { type: 'background', id: i.b.id, name: i.b.name, css: i.b.css };
    if (i.p) return { type: 'palette', id: i.p.id, name: i.p.name, colors: i.p.colors };
    if (i.dos) return { type: 'designer-os', id: i.key, title: i.title, palette: i.dos.dosPal ? { id: i.dos.dosPal.id, primary: i.dos.dosPal.primary, secondary: i.dos.dosPal.secondary, textOnPrimary: i.dos.dosPal.recommended_text_on_primary, textOnSecondary: i.dos.dosPal.recommended_text_on_secondary, display: i.dos.dosPal.display, body: i.dos.dosPal.body, contrast: i.dos.dosPal.contrast } : undefined, text: i.dos.copyText };
    if (i.g) return { type: 'image', id: i.g.id, url: 'https://aievolutionpl.github.io/design-canvas/' + i.g.image };
  }), null, 2);
}

/* ---------------- detail panel ---------------- */
function codeBlock(txt, label = 'Kopiuj') { const id = 'c' + Math.random().toString(36).slice(2, 8); CODES[id] = txt; return `<div class="code">${esc(txt)}</div><button class="copy-btn" data-code="${id}">⧉ ${esc(label)}</button>`; }
const CODES = {};
function swatchesHTML(pal) { return `<div class="swatches">${pal.map(c => `<button class="swatch" data-copy="${c.hex}"><i style="background:${c.hex}"></i><span>${c.hex}</span><small>${esc(c.name)}</small></button>`).join('')}</div>`; }
const loadedFonts=new Set();
function loadDetailFonts(names){const fresh=names.filter(x=>x&&!loadedFonts.has(x));if(!fresh.length)return;fresh.forEach(x=>loadedFonts.add(x));const link=document.createElement('link');link.rel='stylesheet';link.href=fontLink(fresh);document.head.appendChild(link)}
function openDetail(b) {
  if (!b) return; selected = b;
  boards.forEach(x => x.el.classList.remove('hit')); b.el.classList.add('hit');
  const body = $('#dBody'); let h = '', title = b.label;
  const favBtn = b.favKey ? `<button class="copy-btn" data-fav="${esc(b.favKey)}" aria-pressed="${favs.has(b.favKey)}">${favs.has(b.favKey) ? '♥ W ulubionych' : '♡ Dodaj do ulubionych'}</button> ` : '';
  if (b.detail) { title = b.detailTitle || b.label; h = favBtn + b.detail(); }
  else if (b.st) {
    const st = b.st, t = tokens(st); title = st.name;
    const fonts = [t.fd, t.fs, t.fm].filter((v, i, a) => a.indexOf(v) === i); loadDetailFonts(fonts);
    const varsCss = st.source === 'agent-design-taste' ? st.tokensCss : `:root{\n  /* paleta próbkowana z wizualizacji, role UI wyprowadzone automatycznie */\n  --color-bg:${t.bg};\n  --color-surface:${t.sf};\n  --color-text:${t.tx};\n  --color-text-secondary:${t.mu};\n  --color-border:${t.bd};\n  --color-accent:${t.ac};\n  --font-display:'${t.fd}', serif;\n  --font-sans:'${t.fs}', system-ui, sans-serif;\n}`;
    h += `${favBtn}<button class="copy-btn" data-kit-style="${esc(st.id)}">Dodaj styl do zestawu</button> <a class="copy-btn" href="${st.sourceUrl}" target="_blank" rel="noopener">Źródło ↗</a>
<p class="muted" style="margin-top:12px">${esc(st.id)} · ${esc(st.category)} · ${esc(st.source)}</p>
<img src="${st.image.replace('.webp', '-sm.webp')}" alt="${esc(st.imageNote)}" loading="lazy"><p class="muted">${esc(st.imageNote)}</p>
<p><b>${esc(st.tagline)}</b></p><p>${esc(st.description)}</p>
${st.signature ? `<h3>Signature move</h3><p>${esc(st.signature)}</p>` : ''}
<h3>Kiedy używać</h3><p>${esc(st.whenToUse)}</p>
${st.composition ? `<h3>Kompozycja</h3><p>${esc(st.composition)}</p><h3>Materiały</h3><p>${esc(st.materials)}</p><h3>Unikać</h3><p>${esc(st.avoid)}</p>` : ''}
${st.do?.length ? `<h3>Do / Don't</h3><p>✓ ${st.do.map(esc).join('<br>✓ ')}</p><p>✕ ${st.dont.map(esc).join('<br>✕ ')}</p>` : ''}
<h3>Paleta ${st.paletteSource === 'sampled' ? '(próbkowana z obrazu)' : '(tokens.json)'}</h3>${swatchesHTML(paletteOf(st))}
<h3>Fonty ${st.fontsSource === 'suggested' ? '(dobór sugerowany)' : '(tokens.json)'}</h3>${codeBlock(`font-family: '${t.fd}', serif;   /* nagłówki */\nfont-family: '${t.fs}', system-ui, sans-serif;   /* tekst */\n\n<link rel="stylesheet" href="${fontLink(fonts)}">`, 'Kopiuj font-family + link')}
${st.fontsRecommended ? `<p class="muted">Rekomendacje repo: ${esc(st.fontsRecommended)}</p>` : ''}
<h3>Zmienne CSS</h3>${codeBlock(varsCss, 'Kopiuj CSS vars')}
<h3>Prompt dla agenta</h3>${codeBlock(st.prompt, 'Kopiuj prompt')}
${st.aliases?.length ? `<h3>Aliasy</h3><div class="tagrow">${st.aliases.map(a => `<span class="tag">${esc(a)}</span>`).join('')}</div>` : ''}`;
  } else if (b.f) {
    const f = b.f, c = fontCard(f); loadDetailFonts([f.name]);
    h += `${favBtn}<a class="copy-btn" href="${f.url}" target="_blank" rel="noopener">Google Fonts ↗</a><p style="font-family:${esc(c.ff)};font-size:34px;line-height:1.2;margin-top:14px">${PL}<br>${PL_ALL}</p><p>${esc(f.use)}</p><p class="muted">Para: ${esc(f.pairing)}</p><h3>CSS</h3>${codeBlock(`<link rel="stylesheet" href="${fontLink([f.name])}">\n\nfont-family: ${c.ff};`, 'Kopiuj link + font-family')}`;
  } else if (b.b) {
    h += `${favBtn}<div style="height:180px;border-radius:12px;border:1px solid var(--c-border);margin:12px 0;${esc(Object.entries(b.b.style).map(([k, v]) => k.replace(/[A-Z]/g, m => '-' + m.toLowerCase()) + ':' + v).join(';'))}"></div><p class="muted">Tło generowane w CSS/SVG (bez plików), licencja: własny kod repo.</p><h3>CSS</h3>${codeBlock(b.b.css, 'Kopiuj CSS')}`;
  } else if (b.p) {
    h += `${favBtn}<p class="muted">${esc(b.p.note)}</p>${swatchesHTML(b.p.colors)}<h3>CSS vars</h3>${codeBlock(':root{\n' + b.p.colors.map(c => `  --${c.name.replace(/[^a-z0-9ąćęłńóśźż-]+/gi, '-').toLowerCase()}: ${c.hex};`).join('\n') + '\n}', 'Kopiuj CSS vars')}`;
  } else if (b.it) {
    h += `${favBtn}<img src="${b.it.image}" alt="${esc(b.it.name)}" loading="lazy"><p class="muted">Wizualizacja AI z repo design-trends-2027 (assets/trends-${esc(b.it.id)}.png → WebP).</p>${codeBlock('https://aievolutionpl.github.io/design-canvas/' + b.it.image, 'Kopiuj URL')}`;
  } else if (b.kind === 'cover') { title = 'Design Canvas'; h = `<p>Przeciągnij płótno, kółkiem przybliżaj. Kliknij dowolny artboard, aby zobaczyć tokeny, fonty i prompt.</p>`; }
  $('#dTitle').textContent = title; body.innerHTML = h; body.scrollTop = 0;
  $('#favs').hidden = true; $('#detail').hidden = false;
}
function closePanels() { $('#detail').hidden = true; $('#favs').hidden = true; boards.forEach(x => x.el.classList.remove('hit')); }

/* ---------------- sidebar: search / filter / sections ---------------- */
const CATS = [['all', 'Wszystko'], ['dos', 'Designer OS'], ['ui', 'Style UI'], ['trend', 'Trendy 2027'], ['font', 'Fonty'], ['colour', 'Kolory'], ['bg', 'Tła'], ['comp', 'Komponenty']];
function setupSidebar() {
  $('#chips').innerHTML = CATS.map(([k, n]) => `<button class="chip" data-cat="${k}" aria-pressed="${k === 'all'}">${n}</button>`).join('');
  $('#sections').innerHTML = sections.map(s => `<li><button data-sec="${s.id}">${esc(s.name)}<span>${s.count ?? ''}</span></button></li>`).join('');
  $('#chips').addEventListener('click', e => { const c = e.target.closest('[data-cat]'); if (!c) return; filterCat = c.dataset.cat; document.querySelectorAll('.chip').forEach(x => x.setAttribute('aria-pressed', x === c)); applyFilter(true); });
  $('#sections').addEventListener('click', e => { const b = e.target.closest('[data-sec]'); if (!b) return; const s = sections.find(x => x.id === b.dataset.sec); flyTo(s, 0.03); closeSbMobile(); });
  let tmr; $('#q').addEventListener('input', e => { clearTimeout(tmr); tmr = setTimeout(() => { query = e.target.value.trim().toLowerCase(); applyFilter(false); }, 120); });
  $('#results').addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (!b) return; goKey(b.dataset.go); closeSbMobile(); });
  applyFilter(false);
}
function matches(b) {
  if (b.kind === 'cover') return filterCat === 'all' && !query;
  if (filterCat !== 'all' && b.cat !== filterCat) return false;
  return !query || query.split(/\s+/).every(w => b.search.includes(w) || b.label.toLowerCase().includes(w));
}
function applyFilter(fly) {
  const active = filterCat !== 'all' || query;
  const hits = [];
  for (const b of boards) { const m = matches(b); b.el.classList.toggle('dim', !!active && !m); if (m) hits.push(b); }
  // result list: one entry per favKey (style rows collapse)
  const seen = new Set(), list = [];
  for (const b of hits) { if (b.kind === 'cover') continue; const k = b.favKey || b.id; if (seen.has(k)) continue; seen.add(k); list.push(b); }
  $('#resTitle').textContent = active ? `Wyniki (${list.length})` : `Wszystkie assety (${list.length})`;
  $('#results').innerHTML = list.slice(0, 300).map(b => {
    const pal = b.st ? paletteOf(b.st).slice(0, 4) : b.p ? b.p.colors.slice(0, 4) : null;
    const name = b.st && b.kind === 'style' ? b.st.name : b.label;
    return `<li><button data-go="${esc(b.id)}">${esc(name)}<span>${pal ? `<span class="sw">${pal.map(c => `<i style="background:${c.hex}"></i>`).join('')}</span>` : esc(b.sub)}</span></button></li>`;
  }).join('');
  drawMinimap();
  if (fly && active && hits.length) {
    let x1 = Infinity, y1 = Infinity, x2 = -Infinity, y2 = -Infinity;
    hits.forEach(b => { x1 = Math.min(x1, b.x); y1 = Math.min(y1, b.y); x2 = Math.max(x2, b.x + b.w); y2 = Math.max(y2, b.y + b.h); });
    flyTo({ x: x1, y: y1, w: x2 - x1, h: y2 - y1 }, 0.04);
  }
}
function goKey(id) {
  const b = boards.find(x => x.id === id) || boards.find(x => x.favKey === id);
  if (!b) return;
  if (b.kind === 'style') { const row = boards.filter(x => x.st === b.st && x.kind === 'style'); const x1 = row[0].x, x2 = row[row.length - 1].x + row[row.length - 1].w; flyTo({ x: x1, y: b.y, w: x2 - x1, h: b.h }, 0.04); }
  else flyTo(b, 0.1);
  b.el.classList.add('hit'); setTimeout(() => b.el.classList.remove('hit'), 1600);
}
const closeSbMobile = () => document.body.classList.remove('sb-on');

/* ---------------- misc UI ---------------- */
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 1600); }
async function copyText(txt, msg = 'Skopiowano') {
  try { await navigator.clipboard.writeText(txt); toast(msg); }
  catch { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); toast(msg); } catch { toast('Nie udało się skopiować'); } ta.remove(); }
}
function setupUI() {
  const r = () => { const q = vpRect(); return [q.width / 2, q.height / 2]; };
  $('#zIn').onclick = () => zoomAt(1.3, ...r());
  $('#zOut').onclick = () => zoomAt(1 / 1.3, ...r());
  $('#zVal').onclick = () => { const [x, y] = r(); zoomAt(1 / cam.s, x, y); };
  $('#fitAll').onclick = () => fitAll();
  $('#presBtn').onclick = () => togglePres();
  $('#presPrev').onclick = () => presGo(presIdx - 1);
  $('#presNext').onclick = () => presGo(presIdx + 1);
  $('#presExit').onclick = () => togglePres(false);
  $('#favBtn').onclick = () => { const f = $('#favs'); const open = f.hidden; closePanels(); f.hidden = !open; renderFavList(); };
  $('#sbOpen').onclick = () => document.body.classList.add('sb-on');
  $('#sbClose').onclick = closeSbMobile;
  $('#themeBtn').onclick = () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  document.querySelectorAll('[data-close]').forEach(b => b.onclick = closePanels);
  $('#expMd').onclick = () => favs.size ? copyText(exportMD(), 'Moodboard (Markdown) skopiowany') : toast('Najpierw dodaj ulubione ♥');
  $('#expJson').onclick = () => favs.size ? copyText(exportJSON(), 'JSON skopiowany') : toast('Najpierw dodaj ulubione ♥');
  $('#favClear').onclick = () => { if (favs.size && confirm('Usunąć wszystkie ulubione?')) { favs.clear(); saveFavs(); syncFavUI(); } };
  document.addEventListener('click', e => {
    const kit=e.target.closest('[data-kit-style]'); if(kit){if(window.DesignKit){DesignKit.setStyle(kit.dataset.kitStyle);toast('Styl dodany do zestawu')}else toast('Zestaw jest niedostępny');return;}
    const c = e.target.closest('[data-code]'); if (c) { copyText(CODES[c.dataset.code], 'Skopiowano'); return; }
    const sw = e.target.closest('.panel [data-copy]'); if (sw) { copyText(sw.dataset.copy, 'Skopiowano ' + sw.dataset.copy); return; }
    const fv = e.target.closest('.panel [data-fav]'); if (fv) { toggleFav(fv.dataset.fav); if (selected) openDetail(selected); return; }
    const go = e.target.closest('#favList [data-go]'); if (go) { const it = favItem(go.dataset.go); it?.board && goKey(it.board.id); return; }
    const un = e.target.closest('[data-unfav]'); if (un) { toggleFav(un.dataset.unfav); }
  });
}
function setTheme(t) { document.documentElement.dataset.theme = t; localStorage.setItem('dc-theme', t); document.querySelector('meta[name=theme-color]').content = t === 'dark' ? '#1B1C1F' : '#F5F6F8'; drawMinimap(); }

/* ---------------- boot ---------------- */
async function boot() {
  setTheme(localStorage.getItem('dc-theme') || 'light');
  world = $('#world'); vp = $('#viewport'); minimap = $('#minimap'); mctx = minimap.getContext('2d');
  const get = u => fetch(u).then(r => { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); });
  [STY, FONTS, BGS, GAL] = await Promise.all(['data/styles.json', 'data/fonts.json', 'data/backgrounds.json', 'data/gallery.json'].map(get));
  SPECS = (await get('data/font-check.json')).specs;
  try { DOS = await get('data/designer-os.json'); } catch (e) { console.warn('Designer OS data missing', e); }
  layout(); build(); setupMinimap(); setupInput(); setupSidebar(); setupUI();
  const hash = decodeURIComponent(location.hash.slice(1));
  if (hash && boards.find(b => b.id === hash || b.favKey === hash)) { fitAll(true); goKey(hash); }
  else { fitAll(true); }
  window.DC = { cam, boards, sections, presList, favs, zoomAt, fitAll, flyTo, toggleFav, exportMD, exportJSON, counts: () => ({ dosPalettes: DOS ? DOS.palettes.length : 0, dosBoards: boards.filter(b => b.kind === 'dos').length, styles: STY.length, styleFrames: boards.filter(b => b.kind === 'style').length, fonts: FONTS.length, palettes: (window.__PALS || []).length, backgrounds: BGS.length, components: boards.filter(b => b.kind === 'comp').length, gallery: GAL.length }) };
  document.body.dataset.ready = '1';
}
boot().catch(err => { console.error(err); document.body.insertAdjacentHTML('beforeend', `<p style="position:fixed;inset:40% 0 auto;text-align:center">Błąd ładowania danych: ${esc(err.message)}</p>`); });
})();
