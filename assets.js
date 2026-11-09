/* Asset Library — renderuje bazę assetów z data/assets.json + data/fonts.json.
   Wszystkie ikony/wzory/palety pochodzą z otwartych bibliotek (patrz sekcja Licencje). */
(() => {
'use strict';
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const el = (t, c, h) => { const n = document.createElement(t); if (c) n.className = c; if (h != null) n.innerHTML = h; return n; };
const CAT_PL = { 'strzałki': 'Strzałki', 'akcje': 'Akcje', 'media': 'Media', 'pliki': 'Pliki', 'handel': 'Handel', 'komunikacja': 'Komunikacja', 'ludzie': 'Ludzie', 'pogoda': 'Pogoda', 'czas': 'Czas', 'technologia': 'Technologia', 'layout': 'Layout', 'status': 'Status', 'jedzenie': 'Jedzenie', 'dom': 'Dom', 'transport': 'Transport', 'edukacja': 'Edukacja', 'bezpieczeństwo': 'Bezpieczeństwo', 'zdrowie': 'Zdrowie', 'social': 'Social', 'marki': 'Marki' };
const LIB_PL = { lucide: 'Lucide', tabler: 'Tabler', 'tabler-filled': 'Tabler filled', heroicons: 'Heroicons', 'heroicons-solid': 'Heroicons solid', brands: 'Marki', 'svg-spinners': 'SVG Spinners', 'boring-avatars': 'Boring Avatars' };
let toastT;
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 1800); }
async function copy(text, label) {
  try {
    if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error('clipboard unavailable');
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px'; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch {} finally { ta.remove(); }
    if (!ok) { toast('Nie udało się skopiować. Sprawdź uprawnienia schowka.'); return false; }
  }
  toast(label || 'Skopiowano'); return true;
}
const standalone = value => value.replace(/var\(--gradient-space\)/g, '').replace(/var\(--shadow-color\)/g, '220 15% 30%').replace(/var\(--shadow-strength-(\d+)\)/g, (_, n) => String(Number(n) / 100));
function cssRules(match) {
  const sheet = [...document.styleSheets].find(x => x.href && new URL(x.href).pathname.endsWith('/assets.css'));
  return [...sheet.cssRules].filter(match).map(r => r.cssText).join('\n');
}
function refreshFilters() {
  const query = $('#q').value.trim().toLowerCase();
  document.querySelectorAll('#sections > .sec').forEach(sec => {
    const items = [...sec.querySelectorAll('[data-s]')]; let count = 0;
    items.forEach(c => { const ok = (!query || c.dataset.s.includes(query)) && c.dataset.filtered !== '1'; c.classList.toggle('hide', !ok); if(c.parentElement.classList.contains('kit-item')) { c.parentElement.classList.toggle('hide', !ok); if (!ok) c.parentElement.querySelector('.spinner-toggle')?._stop(); } if (ok) count++; });
    sec.classList.toggle('hide', !!query && count === 0);
    if (items.length && sec.querySelector('.n')) sec.querySelector('.n').textContent = count;
  });
}


const TEXTURES = [
  ['Grain · ziarno filmowe', `background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='.35'/%3E%3C/svg%3E");background-color:#EDEAE3`],
  ['Papier · włókno', `background-color:#F4F0E6;background-image:radial-gradient(#0000000d 1px,transparent 1px),radial-gradient(#00000008 1px,transparent 1px);background-size:7px 7px,11px 11px;background-position:0 0,3px 5px`],
  ['Halftone · kropki', `background-color:#FF5A3C;background-image:radial-gradient(circle at center,#111 33%,transparent 34%);background-size:9px 9px`],
  ['Riso · offset', `background-color:#F3E7D3;background-image:radial-gradient(circle at 30% 30%,#FF3B6B88 0,transparent 45%),radial-gradient(circle at 62% 62%,#2B59FF88 0,transparent 45%);background-blend-mode:multiply`],
  ['Duotone', `background-image:linear-gradient(135deg,#FF3B6B,#3B5BFF)`],
  ['Mesh gradient', `background-color:#FFF6E9;background-image:radial-gradient(at 18% 22%,#FFB199 0,transparent 55%),radial-gradient(at 82% 18%,#B5FFFC 0,transparent 55%),radial-gradient(at 60% 85%,#C3B1FF 0,transparent 55%)`],
  ['Concrete · beton', `background-color:#CFCFC9;background-image:radial-gradient(#00000010 1px,transparent 1.4px),radial-gradient(#00000008 1px,transparent 1.6px);background-size:5px 5px,13px 13px;background-position:0 0,4px 7px`],
  ['Linen · len', `background-color:#E8E2D6;background-image:repeating-linear-gradient(0deg,#00000008 0 1px,transparent 1px 4px),repeating-linear-gradient(90deg,#00000008 0 1px,transparent 1px 4px)`],
  ['Grid techniczny', `background-color:#0B1020;background-image:linear-gradient(#78A0FF33 1px,transparent 1px),linear-gradient(90deg,#78A0FF33 1px,transparent 1px);background-size:28px 28px`],
  ['Kropki · dot grid', `background-color:#F7F6F2;background-image:radial-gradient(#20262133 1.2px,transparent 1.3px);background-size:20px 20px`],
  ['Aurora', `background-color:#0B1020;background-image:radial-gradient(40% 45% at 25% 35%,#5B8CFF 0,transparent 70%),radial-gradient(40% 45% at 72% 62%,#FF5BB0 0,transparent 70%),radial-gradient(45% 45% at 50% 85%,#5BFFC8 0,transparent 70%);filter:saturate(1.1)`],
  ['Paper cut · warstwy', `background-color:#F2E9DA;background-image:linear-gradient(135deg,#0000000a 25%,transparent 25% 50%,#0000000a 50% 75%,transparent 75%);background-size:24px 24px`]
];
const MOTION = [
  ['fade-up', '@keyframes fade-up{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}', 'animation:fade-up .5s cubic-bezier(.16,1,.3,1) both'],
  ['scale-in', '@keyframes scale-in{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:none}}', 'animation:scale-in .35s cubic-bezier(.16,1,.3,1) both'],
  ['blur-in', '@keyframes blur-in{from{opacity:0;filter:blur(10px)}to{opacity:1;filter:blur(0)}}', 'animation:blur-in .6s ease both'],
  ['slide-right', '@keyframes slide-right{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}', 'animation:slide-right .5s cubic-bezier(.16,1,.3,1) both'],
  ['float', '@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}', 'animation:float 4s ease-in-out infinite'],
  ['pulse-soft', '@keyframes pulse-soft{0%,100%{opacity:1}50%{opacity:.55}}', 'animation:pulse-soft 2.4s ease-in-out infinite'],
  ['shimmer', '@keyframes shimmer{to{background-position:-150% 0}}', 'animation:shimmer 2.4s linear infinite'],
  ['bounce-in', '@keyframes bounce-in{0%{transform:scale(.6);opacity:0}60%{transform:scale(1.06);opacity:1}100%{transform:scale(1)}}', 'animation:bounce-in .55s cubic-bezier(.34,1.56,.64,1) both']
];
const COMPONENTS = [
  ['Przyciski', 'button', () => `<button class="u-btn">Główny</button><button class="u-btn sec">Drugi</button><button class="u-btn ghost">Ghost</button><button class="u-btn" aria-label="Dodaj">+</button>`],
  ['Pole tekstowe', 'input', () => `<input class="u-in" placeholder="Imię i nazwisko"><input class="u-in" placeholder="e-mail@firma.pl">`],
  ['Przełącznik', 'switch', () => `<span class="u-sw" role="img" aria-label="Włączone"></span><span class="u-sw" style="background:color-mix(in srgb,var(--c-fg) 22%,transparent)"></span>`],
  ['Checkbox / radio', 'checkbox', () => `<span class="u-chk">✓</span><span class="u-chk" style="background:transparent"></span><span style="display:flex;gap:6px;align-items:center"><span class="u-chk" style="border-radius:50%"></span><span style="font-size:12.5px">Opcja</span></span>`],
  ['Tagi', 'tag', () => `<span class="u-tag">Nowe</span><span class="u-tag">Premium</span><span class="u-tag">-30%</span>`],
  ['Awatary', 'avatar', () => `<div style="display:flex">${['AN', 'MK', 'ZO', 'JW'].map(x => `<span class="u-av">${x}</span>`).join('')}</div>`],
  ['Karta', 'card', () => `<div class="u-card"><b>Plan Studio</b><small>Dla zespołów do 10 osób</small><div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:10px"><span style="font:800 20px Inter">149 zł</span><span class="u-tag">/mies.</span></div></div>`],
  ['Progress', 'progress', () => `<div style="width:100%"><div style="display:flex;justify-content:space-between;font-size:11.5px;color:var(--c-mut);margin-bottom:6px"><span>Postęp</span><span>68%</span></div><div class="u-prog"><i></i></div></div>`],
  ['Skeleton', 'skeleton', () => `<div style="display:grid;gap:8px;width:100%"><div class="u-skel" style="width:70%"></div><div class="u-skel" style="width:100%"></div><div class="u-skel" style="width:45%"></div></div>`],
  ['Zakładki', 'tabs', () => `<div class="u-tabs"><span class="on">Przegląd</span><span>Aktywność</span><span>Ustawienia</span></div>`],
  ['Dropdown', 'dropdown', () => `<div class="u-dd"><div class="on">Edytuj</div><div>Duplikuj</div><div>Udostępnij</div><div>Usuń</div></div>`],
  ['Slider', 'slider', () => `<div class="u-slider" style="width:100%"></div><span style="font:600 12px Inter;color:var(--c-mut)">56</span>`],
  ['Tabela', 'table', () => `<table class="u-table"><thead><tr><th>Projekt</th><th>Status</th><th>Kwota</th></tr></thead><tbody><tr><td>Rebrand</td><td>W toku</td><td>8 400 zł</td></tr><tr><td>Landing</td><td>Gotowe</td><td>3 200 zł</td></tr></tbody></table>`],
  ['Powiadomienie', 'toast', () => `<div class="u-toast"><span style="width:8px;height:8px;border-radius:50%;background:#167044"></span><span>Zapisano zmiany</span><span style="margin-left:auto;color:var(--c-mut)">✕</span></div>`],
  ['Metryka', 'stat', () => `<div><div class="u-stat">+38%</div><small style="color:var(--c-mut);font-size:11.5px">wzrost konwersji · 30 dni</small></div><div><div class="u-stat">4,9</div><small style="color:var(--c-mut);font-size:11.5px">ocena klientów</small></div>`],
  ['Kroki', 'stepper', () => `<div class="u-stepper"><i>1</i><u></u><i>2</i><u></u><i style="background:transparent;border:1px solid var(--c-bd);color:var(--c-mut)">3</i><span style="margin-left:6px">Płatność</span></div>`],
  ['Paginacja', 'pagination', () => `<div style="display:flex;gap:6px">${['‹', '1', '2', '3', '›'].map((x, i) => `<span style="width:30px;height:30px;display:grid;place-items:center;border:1px solid var(--c-bd);border-radius:var(--c-r);font:600 12px Inter;${i === 1 ? 'background:var(--c-a);color:var(--c-at)' : ''}">${x}</span>`).join('')}</div>`],
  ['Okruszki', 'breadcrumbs', () => `<nav style="font:500 12px Inter;color:var(--c-mut)">Start <span style="opacity:.5">/</span> Projekty <span style="opacity:.5">/</span> <b style="color:var(--c-fg)">Rebrand 2027</b></nav>`],
  ['Akordeon', 'accordion', () => `<div style="width:100%;border:1px solid var(--c-bd);border-radius:var(--c-r);overflow:hidden"><div style="padding:10px 12px;display:flex;justify-content:space-between;font:600 12.5px Inter">Jak działa wycena?<span>−</span></div><div style="padding:0 12px 10px;font-size:12px;color:var(--c-mut)">Na podstawie zakresu, liczby ekranów i terminu.</div></div>`],
  ['Modal', 'modal', () => `<div style="width:100%;background:var(--c-bg);border:1px solid var(--c-bd);border-radius:calc(var(--c-r) + 4px);padding:14px;box-shadow:var(--c-sh)"><b style="font-size:13px">Usunąć projekt?</b><p style="font-size:12px;color:var(--c-mut);margin:6px 0 12px">Tej operacji nie można cofnąć.</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="u-btn sec">Anuluj</button><button class="u-btn">Usuń</button></div></div>`],
  ['Tooltip', 'tooltip', () => `<div style="position:relative;display:inline-block"><button class="u-btn sec">Najedź</button><span style="position:absolute;left:50%;top:-34px;transform:translateX(-50%);background:var(--c-fg);color:var(--c-bg);font:500 11px Inter;padding:5px 8px;border-radius:6px;white-space:nowrap">Kopiuj link</span></div>`],
  ['Sidebar nav', 'nav', () => `<div style="width:100%;display:grid;gap:2px">${['Pulpit', 'Projekty', 'Assety', 'Ustawienia'].map((x, i) => `<div style="padding:7px 10px;border-radius:calc(var(--c-r) - 2px);font:${i === 1 ? '600' : '500'} 12.5px Inter;${i === 1 ? 'background:var(--c-a);color:var(--c-at)' : 'color:var(--c-mut)'}">${x}</div>`).join('')}</div>`],
  ['Pricing', 'pricing', () => `<div style="width:100%;display:grid;grid-template-columns:1fr 1fr;gap:8px"><div class="u-card"><small>Start</small><b style="font-size:18px;margin:4px 0">0 zł</b><div class="u-prog" style="margin-top:8px"><i style="width:20%"></i></div></div><div class="u-card" style="outline:2px solid var(--c-a)"><small>Pro</small><b style="font-size:18px;margin:4px 0">99 zł</b><div class="u-prog" style="margin-top:8px"><i></i></div></div></div>`],
  ['Empty state', 'empty', () => `<div style="text-align:center;width:100%"><div style="font-size:26px">◍</div><b style="display:block;font-size:13px;margin:6px 0 2px">Brak assetów</b><small style="color:var(--c-mut);font-size:11.5px">Dodaj pierwszy plik, aby zacząć.</small><div style="margin-top:10px"><button class="u-btn">Dodaj asset</button></div></div>`],
  ['Command palette', 'command', () => `<div style="width:100%;background:var(--c-bg);border:1px solid var(--c-bd);border-radius:var(--c-r);overflow:hidden;box-shadow:var(--c-sh)"><div style="padding:9px 11px;border-bottom:1px solid var(--c-bd);font:500 12px Inter;color:var(--c-mut)">⌘ Szukaj akcji…</div><div style="padding:4px"><div style="padding:7px 9px;border-radius:calc(var(--c-r) - 3px);background:var(--c-a);color:var(--c-at);font:500 12px Inter">Nowy projekt</div><div style="padding:7px 9px;font:500 12px Inter;color:var(--c-mut)">Import assetów</div></div></div>`],
  ['Wykres', 'chart', () => `<div style="width:100%;display:flex;align-items:flex-end;gap:5px;height:70px">${[38, 55, 42, 70, 62, 88, 74, 96].map(h => `<div style="flex:1;height:${h}%;background:var(--c-a);border-radius:3px 3px 0 0;opacity:${.35 + h / 160}"></div>`).join('')}</div>`],
  ['Kalendarz', 'calendar', () => `<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;width:100%">${Array.from({ length: 21 }, (_, i) => `<div style="aspect-ratio:1;display:grid;place-items:center;border-radius:4px;font:600 10px Inter;${i === 14 ? 'background:var(--c-a);color:var(--c-at)' : 'color:var(--c-mut)'}">${i + 1}</div>`).join('')}</div>`],
  ['Timeline', 'timeline', () => `<div style="width:100%;display:grid;gap:10px">${[['Brief', 'pon.'], ['Makiety', 'wt.'], ['Wdrożenie', 'czw.']].map(([a, b]) => `<div style="display:flex;gap:9px;align-items:center"><span style="width:8px;height:8px;border-radius:50%;background:var(--c-a)"></span><b style="font:600 12px Inter">${a}</b><small style="margin-left:auto;color:var(--c-mut);font-size:11px">${b}</small></div>`).join('')}</div>`],
  ['Testimonial', 'quote', () => `<div style="width:100%"><div style="font:600 13px/1.45 Inter">„W dwa tygodnie dostaliśmy spójną markę i stronę, która konwertuje.”</div><div style="display:flex;gap:8px;align-items:center;margin-top:10px"><span class="u-av" style="margin:0">MK</span><small style="color:var(--c-mut);font-size:11.5px">Marta K. · założycielka studia</small></div></div>`],
  ['Kod / snippet', 'code', () => `<pre style="margin:0;width:100%;background:color-mix(in srgb,var(--c-fg) 8%,transparent);border-radius:calc(var(--c-r));padding:10px;font:500 11.5px/1.5 ui-monospace,monospace;color:var(--c-fg);overflow:auto"><code>:root{
  --bg: #F5F6F8;
  --ink: #17191D;
}</code></pre>`]
];
const SKINS = [['min', 'Minimal'], ['glass', 'Glass'], ['brut', 'Neo-brutal']];

const SECTIONS = [];
function section(id, title, sub, count) {
  const s = el('section', 'sec'); s.id = id;
  s.innerHTML = `<div class="sec-h"><h2>${title}</h2>${count ? `<span class="n">${count}</span>` : ''}<p>${sub}</p></div>`;
  $('#sections').appendChild(s); SECTIONS.push({ id, title, count }); return s;
}
const scroll = () => { };
function kitButton(parent,type,id,palette=false){
 const b=el('button','kit-add');b.type='button';b.textContent='＋ Do zestawu';b.setAttribute('aria-label','Dodaj do zestawu: '+id);
 b.onclick=e=>{e.stopPropagation();if(!window.DesignKit){toast('Zestaw jest niedostępny');return}if(palette) DesignKit.update({paletteId:id});else DesignKit.addAsset({type,id:String(id)});toast('Dodano do zestawu: '+id)};
 if(parent.tagName==='BUTTON'){const wrap=el('div','kit-item');parent.replaceWith(wrap);wrap.append(parent,b)}else parent.appendChild(b);
}

/* ---------- icons ---------- */
function iconsSection(A, S) {
  const s = section('ikony', 'Ikony', 'Ikony i awatary z otwartych bibliotek — szczegóły w sekcji Licencje. Klik kopiuje SVG, Alt pobiera plik. Animacje uruchamiaj osobno.', A.icons.length);
  const libs = ['all', ...new Set(A.icons.map(i => i.lib))];
  const cats = ['all', ...Object.keys(CAT_PL).filter(c => A.icons.some(i => i.cat === c))];
  s.appendChild(el('div', 'chips', libs.map(l => `<button class="chip ${l === 'all' ? 'on' : ''}" data-lib="${l}">${LABP(l)} <i style="opacity:.55;font-style:normal">${l === 'all' ? A.icons.length : A.icons.filter(i => i.lib === l).length}</i></button>`).join('')));
  s.appendChild(el('div', 'chips', cats.map(c => `<button class="chip ${c === 'all' ? 'on' : ''}" data-cat="${c}">${c === 'all' ? 'Wszystkie kategorie' : CAT_PL[c]}</button>`).join('')));
  const grid = el('div', 'grid g-icons');
  for (const i of A.icons) {
    const c = el('button', 'ic'); c.dataset.lib = i.lib; c.dataset.cat = i.cat; c.dataset.s = (i.name + ' ' + i.lib + ' ' + (CAT_PL[i.cat] || '')).toLowerCase();
    c.title = `${i.name} · ${LABP(i.lib)} · klik = kopiuj SVG, Alt = pobierz`;
    c.innerHTML = `${i.lib === 'svg-spinners' ? '<span class="spinner-static" aria-hidden="true">◌</span>' : `<img src="${esc(i.src)}" alt="" loading="lazy" width="24" height="24">`}<span>${esc(i.name)}</span>`;
    c.addEventListener('click', async e => {
      let svg; try { const r = await fetch(i.src); if (!r.ok) throw new Error(r.status); svg = await r.text(); if (!svg.includes('<svg')) throw new Error('invalid SVG'); } catch { toast('Nie udało się pobrać ikony: ' + i.name); return; }
      if (e.altKey) { const a = document.createElement('a'); a.href = i.src; a.download = i.name + '.svg'; a.click(); toast('Pobrano ' + i.name + '.svg'); }
      else copy(svg, 'Skopiowano SVG: ' + i.name);
    });
    grid.appendChild(c); kitButton(c,'icons',i.lib+':'+i.name);
    if (i.lib === 'svg-spinners') {
      const toggle = el('button', 'spinner-toggle'); toggle.type = 'button';
      const stop = () => { const img = c.querySelector('img'); if (img) img.replaceWith(el('span', 'spinner-static', '◌')); toggle.textContent = 'Uruchom animację'; toggle.setAttribute('aria-pressed', 'false'); };
      stop(); toggle.onclick = () => { if (toggle.getAttribute('aria-pressed') === 'true') { stop(); return; }
        const img = document.createElement('img'); img.src = i.src; img.alt = ''; c.querySelector('.spinner-static').replaceWith(img);
        toggle.textContent = 'Zatrzymaj animację'; toggle.setAttribute('aria-pressed', 'true'); };
      c.parentElement.appendChild(toggle);
      document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
      toggle._stop = stop;
      const observer = new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stop(); });
      observer.observe(c);
    }
  }
  s.appendChild(grid);
  let lib = 'all', cat = 'all';
  const apply = () => { let n = 0; grid.querySelectorAll('.ic').forEach(c => { const ok = (lib === 'all' || c.dataset.lib === lib) && (cat === 'all' || c.dataset.cat === cat); c.dataset.filtered = ok ? '0' : '1'; if (!ok) c.parentElement.querySelector('.spinner-toggle')?._stop(); if (ok) n++; }); refreshFilters(); };
  s.querySelectorAll('.chip[data-lib]').forEach(b => b.onclick = () => { lib = b.dataset.lib; s.querySelectorAll('.chip[data-lib]').forEach(x => x.classList.toggle('on', x === b)); apply(); });
  s.querySelectorAll('.chip[data-cat]').forEach(b => b.onclick = () => { cat = b.dataset.cat; s.querySelectorAll('.chip[data-cat]').forEach(x => x.classList.toggle('on', x === b)); apply(); });
  return { s, apply: () => { } };
}
const LABP = l => LIB_PL[l] || l;

/* ---------- illustrations ---------- */
function illuSection() {
  const files = window.__ILLU || [];
  const s = section('ilustracje', 'Ilustracje', 'Postacie Open Peeps i abstrakcyjne kształty z DiceBear — licencja CC0, bez atrybucji, do dowolnego użytku komercyjnego. Klik kopiuje SVG.', files.length);
  const g = el('div', 'grid g-illu');
  files.forEach(f => {
    const c = el('button', 'il card'); c.dataset.s = ('ilustracja ' + f).toLowerCase();
    c.innerHTML = `<img src="assets/illustrations/${f}" alt="" loading="lazy"><span>${esc(f.replace('.svg', ''))}</span>`;
    c.onclick = async () => { try { const r = await fetch('assets/illustrations/' + f); if (!r.ok) throw new Error(r.status); const svg = await r.text(); if (!svg.includes('<svg')) throw new Error('invalid SVG'); await copy(svg, 'Skopiowano ilustrację SVG'); } catch { toast('Nie udało się pobrać ilustracji.'); } };
    g.appendChild(c);
  });
  s.appendChild(g);
}

/* ---------- patterns / gradients / textures ---------- */
function patternSection(A) {
  const s = section('wzory', 'Wzory tła', 'Hero Patterns (MIT) — 87 gotowych wzorów SVG w formacie CSS. Skopiuj regułę i wklej do projektu; kolor i przezroczystość są w kodzie.', A.patterns.length);
  const g = el('div', 'grid g-pat');
  A.patterns.forEach(p => {
    const c = el('button', 'pat'); c.dataset.s = (p.name + ' wzór pattern').toLowerCase();
    c.style.cssText = `background-image:${p.light};background-color:#F7F7F5`;
    c.innerHTML = `<b>${esc(p.name)}</b>`;
    c.onclick = () => copy(`background-color:#F7F7F5;background-image:${p.light};background-size:32px 32px;`, 'Skopiowano CSS wzoru: ' + p.name);
    g.appendChild(c); kitButton(c,'patterns',p.key || p.id || p.name);
  });
  s.appendChild(g);
}
function gradientSection(A) {
  const s = section('gradienty', 'Gradienty', '30 gradientów z Open Props (MIT) — od subtelnych tła po mocne akcenty. Klik kopiuje gotowe CSS.', A.gradients.length);
  const g = el('div', 'grid g-grad');
  A.gradients.forEach(x => {
    const c = el('button', 'gr'); c.dataset.s = ('gradient ' + x.name).toLowerCase();
    c.style.backgroundImage = standalone(x.value);
    c.innerHTML = `<b>${esc(x.name)}</b>`;
    c.onclick = () => copy('background-image:' + standalone(x.value) + ';', 'Skopiowano ' + x.name);
    g.appendChild(c); kitButton(c,'gradients',x.key || x.id || x.name);
  });
  s.appendChild(g);
}
function textureSection() {
  const s = section('tekstury', 'Tekstury i tła proceduralne', 'Ziarno, papier, halftone, riso, beton, len, mesh i aurora — czysty CSS/SVG, bez plików i bez licencji. Klik kopiuje CSS.', TEXTURES.length);
  const g = el('div', 'grid g-grad');
  TEXTURES.forEach(([n, css]) => {
    const c = el('button', 'gr'); c.dataset.s = (n + ' tekstura').toLowerCase(); c.style.cssText = css;
    c.innerHTML = `<b>${esc(n)}</b>`;
    c.onclick = () => copy(css + ';', 'Skopiowano teksturę: ' + n);
    g.appendChild(c);
  });
  s.appendChild(g);
}

/* ---------- tokens ---------- */
function tokenSection(A) {
  const s = section('tokeny', 'Cienie, promienie, skala', 'Tokeny z Open Props (MIT) gotowe do wklejenia w CSS. Klik kopiuje wartość.', A.shadows.length + A.radii.length + A.sizes.length);
  const h = el('div'); h.innerHTML = '<h3 style="font:600 15px Inter;margin:18px 0 10px">Cienie · 6 poziomów</h3>';
  s.appendChild(h);
  const g1 = el('div', 'grid g-three');
  A.shadows.forEach(x => {
    const c = el('button', 'card tok'); c.dataset.s = ('cien shadow ' + x.name).toLowerCase();
    c.innerHTML = `<span class="sw" style="box-shadow:${standalone(x.value)};background:#fff"></span><div><b>${esc(x.name)}</b><code>${esc(x.value.slice(0, 78))}…</code></div>`;
    c.onclick = () => copy('box-shadow:' + standalone(x.value) + ';', 'Skopiowano ' + x.name);
    g1.appendChild(c);
  });
  s.appendChild(g1);
  s.appendChild(el('h3', null, '<span style="font:600 15px Inter;display:block;margin:22px 0 10px">Promienie · 24 wartości</span>'));
  const g2 = el('div', 'grid g-icons'); g2.style.gridTemplateColumns = 'repeat(auto-fill,minmax(110px,1fr))';
  A.radii.forEach(x => {
    const radius = x.value.replace(/var\(--radius-(\d+)\)/g, (_, n) => A.radii.find(r => r.name === n)?.value || '0px').replace(/calc\(100vw - 100%\) \* 1e5/g, '(100vw - 100%) * 100000');
    const c = el('button', 'ic'); c.dataset.s = ('radius promien ' + x.name).toLowerCase();
    c.innerHTML = `<div style="width:40px;height:34px;background:var(--tx);border-radius:${radius};opacity:.85"></div><span>${esc(x.name)}</span>`;
    c.onclick = () => copy('border-radius:' + radius + ';', 'Skopiowano promień ' + x.name);
    g2.appendChild(c);
  });
  s.appendChild(g2);
  s.appendChild(el('h3', null, '<span style="font:600 15px Inter;display:block;margin:22px 0 10px">Skala rozmiarów · spacing</span>'));
  const g3 = el('div', 'card'); g3.style.padding = '16px'; g3.style.display = 'grid'; g3.style.gap = '7px';
  A.sizes.forEach(x => {
    const r = el('button'); r.dataset.s = ('size ' + x.name).toLowerCase(); r.style.cssText = 'display:flex;align-items:center;gap:12px;border:0;background:none;cursor:copy;padding:2px 0;color:inherit';
    r.innerHTML = `<code style="font:500 11px ui-monospace,monospace;color:var(--tx3);width:52px">${esc(x.name)}</code><span style="height:10px;width:${x.value};background:var(--act);border-radius:3px;min-width:2px"></span><code style="font:500 11px ui-monospace,monospace;color:var(--tx3)">${esc(x.value)}</code>`;
    r.onclick = () => copy(x.value, 'Skopiowano ' + x.value);
    g3.appendChild(r);
  });
  s.appendChild(g3);
}

/* ---------- motion ---------- */
function motionSection(A) {
  const s = section('ruch', 'Ruch i easing', 'Krzywe easing z Open Props (MIT) narysowane jako wykresy oraz 8 gotowych presetów animacji. Klik kopiuje CSS.', Math.min(A.easings.length, 24) + MOTION.length);
  const g = el('div', 'grid g-three');
  A.easings.slice(0, 24).forEach(x => {
    const m = x.value.match(/cubic-bezier\(([^)]+)\)/); const pts = m ? m[1].split(',').map(Number) : [.25, .1, .25, 1];
    const W = 100, H = 56;
    const c = el('button', 'card ease'); c.dataset.s = ('easing ' + x.name + ' ' + x.value).toLowerCase();
    c.innerHTML = `<b>ease-${esc(x.name)}</b><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true"><path d="M0 ${H} C ${pts[0] * W} ${H - pts[1] * H} ${pts[2] * W} ${H - pts[3] * H} ${W} 0" fill="none" stroke="currentColor" stroke-width="2" vector-effect="non-scaling-stroke"/></svg><code>${esc(x.value)}</code>`;
    c.onclick = () => copy('transition-timing-function:' + x.value + ';', 'Skopiowano easing');
    g.appendChild(c);
  });
  s.appendChild(g);
  s.appendChild(el('h3', null, '<span style="font:600 15px Inter;display:block;margin:24px 0 10px">Presety animacji</span>'));
  const st = el('style'); st.textContent = MOTION.map(m => m[1]).join('\n') + '\n@media(prefers-reduced-motion:reduce){.mv *{animation:none!important}}'; document.head.appendChild(st);
  const g2 = el('div', 'grid g-eff');
  MOTION.forEach(([n, kf, anim]) => {
    const c = el('button', 'card eff mv'); c.style.cssText = 'background:var(--surf);display:grid;place-items:center;height:150px'; c.dataset.s = ('animacja motion ' + n).toLowerCase();
    c.innerHTML = `<span style="width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,#3B5BFF,#8B3BFF);${anim}"></span><b style="position:absolute;left:12px;bottom:10px;color:var(--tx);text-shadow:none">${esc(n)}</b>`;
    c.onclick = () => copy(`/* ${n} */\n${kf}\n.anim-${n}{${anim}}`, 'Skopiowano preset: ' + n);
    g2.appendChild(c);
  });
  s.appendChild(g2);
}

/* ---------- fonts ---------- */
function fontSection(FONTS) {
  const s = section('fonty', 'Fonty', `${FONTS.length} krojów Google Fonts z potwierdzonym podzbiorem latin-ext, czyli pełnymi polskimi znakami ąćęłńóśźż. Klik kopiuje regułę CSS.`, FONTS.length);
  const cats = [['all', 'Wszystkie'], ['sans', 'Bezszeryfowe'], ['serif', 'Szeryfowe'], ['display', 'Display'], ['mono', 'Monospace'], ['hand', 'Odręczne']];
  s.appendChild(el('div', 'chips', cats.map(([k, n], i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-fc="${k}">${n} <i style="opacity:.55;font-style:normal">${k === 'all' ? FONTS.length : FONTS.filter(f => f.category === k).length}</i></button>`).join('')));
  const g = el('div', 'grid g-font');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; const n = e.target.dataset.f; io.unobserve(e.target);
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = 'https://fonts.googleapis.com/css2?family=' + n.replace(/ /g, '+') + ':wght@400;700&display=swap'; document.head.appendChild(l);
  }), { rootMargin: '300px' });
  FONTS.forEach(f => {
    const c = el('button', 'card fo'); c.dataset.f = f.name; c.dataset.cat = f.category; c.dataset.s = (f.name + ' ' + f.category + ' ' + f.use).toLowerCase();
    c.innerHTML = `<div class="m"><b>${esc(f.name)}</b><span>${esc(f.category)}</span></div><div class="sp" style="font-family:'${f.name}',sans-serif">Aa Bb Ćć Ęę Łł Ńń Óó Śś Źź Żż</div><div class="use">${esc(f.use)}</div><div class="pair">${esc(f.pairing || '')}</div>`;
    c.onclick = () => copy(`@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(f.name).replace(/%20/g, '+')}&display=swap');\n.element { font-family:'${f.name}',${f.category === 'serif' ? 'serif' : f.category === 'mono' ? 'monospace' : 'sans-serif'}; }`, 'Skopiowano ' + f.name);
    io.observe(c);
    g.appendChild(c);
  });
  s.appendChild(g);
  const fit = () => g.querySelectorAll('.sp').forEach(x => { x.style.fontSize = '34px'; while (x.scrollWidth > x.clientWidth && parseFloat(x.style.fontSize) > 12) x.style.fontSize = (parseFloat(x.style.fontSize) - 1) + 'px'; });
  document.fonts.ready.then(fit); addEventListener('resize', fit);
  s.querySelectorAll('[data-fc]').forEach(b => b.onclick = () => {
    const k = b.dataset.fc; s.querySelectorAll('[data-fc]').forEach(x => x.classList.toggle('on', x === b));
    let n = 0; g.querySelectorAll('.fo').forEach(c => { const ok = k === 'all' || c.dataset.cat === k; c.dataset.filtered = ok ? '0' : '1'; if (!ok) c.parentElement.querySelector('.spinner-toggle')?._stop(); if (ok) n++; });
    refreshFilters();
  });
}

/* ---------- palettes ---------- */
function paletteSection(A) {
  const total = A.palettes.reduce((n, p) => n + p.colors.length, 0);
  const s = section('palety', 'Palety kolorów', `Radix, Tailwind, Open Color, Catppuccin i tokeny AI Evolution — ${A.palettes.length} palet i ${total.toLocaleString('pl-PL')} kolorów z kodami HEX. Klik w próbkę kopiuje kod.`, A.palettes.length);
  const groups = ['all', ...new Set(A.palettes.map(p => p.group))];
  s.appendChild(el('div', 'chips', groups.map((g, i) => `<button class="chip ${i === 0 ? 'on' : ''}" data-pg="${g}">${g === 'all' ? 'Wszystkie' : g} <i style="opacity:.55;font-style:normal">${g === 'all' ? A.palettes.length : A.palettes.filter(p => p.group === g).length}</i></button>`).join('')));
  const g = el('div', 'grid g-pal');
  A.palettes.forEach(p => {
    const c = el('div', 'card pal'); c.dataset.g = p.group; c.dataset.s = (p.name + ' ' + p.group + ' paleta kolory').toLowerCase();
    c.innerHTML = `<div class="m"><b>${esc(p.name)}</b><span>${p.colors.length} kolorów</span></div><div class="st">${p.colors.map(x => `<button data-hex="${esc(x.hex)}" style="background:${x.hex}" aria-label="${esc(x.name + ' ' + x.hex)}"></button>`).join('')}</div><div class="nm">${p.colors.map(x => `<span>${esc(x.name)} · ${esc(x.hex)}</span>`).join('')}</div>`;
    kitButton(c,'palettes',p.name,true);
    c.querySelectorAll('[data-hex]').forEach(b => b.onclick = () => copy(b.dataset.hex, 'Skopiowano ' + b.dataset.hex));
    g.appendChild(c);
  });
  s.appendChild(g);
  s.querySelectorAll('[data-pg]').forEach(b => b.onclick = () => {
    const k = b.dataset.pg; s.querySelectorAll('[data-pg]').forEach(x => x.classList.toggle('on', x === b));
    let n = 0; g.querySelectorAll('.pal').forEach(c => { const ok = k === 'all' || c.dataset.g === k; c.dataset.filtered = ok ? '0' : '1'; if (!ok) c.parentElement.querySelector('.spinner-toggle')?._stop(); if (ok) n++; });
    refreshFilters();
  });
}

/* ---------- UI kit ---------- */
function kitSection() {
  const s = section('ui', 'UI kit', `${COMPONENTS.length} komponentów w trzech stylach: minimal, glass i neo-brutalizm. Klik kopiuje HTML komponentu.`, COMPONENTS.length);
  const g = el('div', 'grid g-comp'), more = el('div', 'grid g-comp');
  more.classList.add('hide'); more.style.marginTop = '12px';
  const btn = el('button', 'chip'); btn.style.marginTop = '14px';
  const label = () => more.classList.contains('hide') ? `+ pokaż wszystkie warianty (${COMPONENTS.length * 3})` : `− ukryj dodatkowe warianty (${COMPONENTS.length * 3 - 3})`;
  COMPONENTS.forEach(([name, key, html], i) => {
    SKINS.forEach(([sk, lab]) => {
      const c = el('div', 'card cmp sk-' + sk); c.dataset.s = (name + ' komponent ui ' + sk).toLowerCase();
      c.innerHTML = `<div class="hd"><b>${esc(name)}</b><span>${esc(lab)}</span></div><div class="box">${html()}</div>`;
      const button = el('button', 'chip copy-component', 'Kopiuj HTML + CSS');
      button.onclick = () => {
        const rules = cssRules(r => r.selectorText && (/\.u-|\.sk-|\.cmp \.box/.test(r.selectorText) || r.selectorText === ':root'));
        copy(`<style>\n${rules}\n</style>\n<div class="cmp sk-${sk}"><div class="box">${html()}</div></div>`, 'Skopiowano ' + name);
      };
      c.appendChild(button);
      (i < 3 ? g : more).appendChild(c);
    });
  });
  btn.textContent = label();
  btn.onclick = () => { more.classList.toggle('hide'); btn.textContent = label(); };
  s.appendChild(g); s.appendChild(btn); s.appendChild(more);
}

/* ---------- effects ---------- */
function effectSection() {
  const E = [['Aurora', 'eff-aurora'], ['Spotlight', 'eff-spot'], ['Grid beam', 'eff-grid'], ['Shimmer', 'eff-shimmer'], ['Glassmorphism', 'eff-glass'], ['Grain / noise', 'eff-noise light'], ['Halftone', 'eff-halftone'], ['Mesh gradient', 'eff-mesh light'], ['Gradient border', 'eff-gradborder light'], ['Duotone', 'eff-duotone']];
  const s = section('efekty', 'Efekty premium', 'Efekty CSS z podglądem. Klik kopiuje HTML i reguły CSS do samodzielnego użycia.', E.length);
  const g = el('div', 'grid g-eff');
  E.forEach(([n, cls]) => {
    const c = el('button', 'eff ' + cls); c.type = 'button'; c.dataset.s = (n + ' efekt effect').toLowerCase();
    c.innerHTML = `<b>${esc(n)}</b>`;
    c.onclick = () => {
      const selector = '.' + cls.split(' ')[0];
      const rules = cssRules(r => (r.selectorText && (r.selectorText.includes(selector) || r.selectorText === ':root')) || (r.type === CSSRule.KEYFRAMES_RULE && /^(drift|shim)$/.test(r.name)));
      copy(`<style>\n${rules}\n</style>\n<div class="${cls}" style="width:240px;height:160px;position:relative"></div>`, 'Skopiowano: ' + n);
    };
    g.appendChild(c);
  });
  s.appendChild(g);
}

/* ---------- licenses ---------- */
function licenseSection(A) {
  const s = section('licencje', 'Licencje i źródła', 'Wszystkie assety pochodzą z otwartych bibliotek i można ich używać komercyjnie. Zestawienie źródeł poniżej.', A.licenses.length);
  const c = el('div', 'card'); c.style.padding = '18px';
  c.innerHTML = `<div style="display:grid;gap:10px">${A.licenses.map(([n, l, u]) => `<div style="display:flex;gap:12px;align-items:baseline;flex-wrap:wrap;border-bottom:1px solid var(--bd);padding-bottom:9px"><b style="min-width:190px;font-size:13.5px">${esc(n)}</b><span class="u-tag" style="background:var(--surf);color:var(--tx2)">${esc(l)}</span><a href="${u}" target="_blank" rel="noopener" style="font-size:12px;color:var(--tx3);margin-left:auto">${esc(u.replace('https://github.com/', 'github.com/'))} ↗</a></div>`).join('')}</div><p style="margin:14px 0 0;font-size:12.5px;color:var(--tx3)">Logo marek należą do ich właścicieli — używaj ich tylko do oznaczania integracji. Ilustracje postaci pochodzą z DiceBear (Open Peeps, CC0). Wzory: Hero Patterns (MIT). Tokeny: Open Props (MIT).</p>`;
  s.appendChild(c);
}


/* ---------- liquid glass ---------- */
function liquidSection() {
  const s = section('liquid', 'Liquid Glass', 'Prawdziwa refrakcja tła: mapa przemieszczeń z prawa Snella wstrzyknięta w backdrop-filter, pierścienie światła Fresnela i dyspersja chromatyczna. Technika z quickLiquid (MIT), przepisana na vanilla JS — jeden plik, zero zależności.', 8);
  const stage = el('div', 'lqstage');
  stage.innerHTML = `
    <div class="lqbg" aria-hidden="true"><span>LIQUID</span><span>GLASS</span></div>
    <div class="lqrow">
      <div class="lqitem lqnav" data-liquid='{"radius":999,"bezel":12,"thickness":9,"blur":4}'><a class="on" href="#">Przegląd</a><a href="#">Projekty</a><a href="#">Assety</a></div>
      <div class="lqitem lqpill" data-liquid='{"radius":999,"bezel":10,"thickness":8,"blur":3}'>✦ Prominent</div>
      <div class="lqitem lqpill" data-liquid='{"radius":999,"bezel":8,"thickness":6,"blur":2}'>Zwykły</div>
    </div>
    <div class="lqrow">
      <div class="lqitem lqcard" style="flex:1 1 300px" data-liquid='{"radius":22,"bezel":20,"thickness":18,"blur":8}'><b>Karta z refrakcją</b><p>Tekst za szkłem ugina się na krawędzi — mapa przemieszczeń 1:1, nie rozmycie.</p></div>
      <div class="lqitem lqcard" style="flex:0 1 220px" data-liquid='{"radius":22,"bezel":22,"thickness":20,"blur":6,"dispersion":0.6}'><b style="font-size:34px">72%</b><p>dyspersja 0.6</p></div>
      <div class="lqitem lqcard" style="flex:0 1 240px" data-liquid='{"radius":22,"bezel":16,"thickness":14,"blur":5}'><b>Pole tekstowe</b><input placeholder="e-mail@firma.pl" aria-label="E-mail"></div>
    </div>`;
  s.appendChild(stage);
  s.appendChild(el('div', 'chips', `<button class="chip" id="lqAll">Skopiuj implementację (JS)</button><a class="chip" href="liquid.html" style="text-decoration:none">Otwórz laboratorium z suwakami →</a>`));
  s.querySelector('#lqAll').onclick = () => copy(`<script src="assets/liquid-glass/liquid.js"></script>\n\n<div class="glass" data-liquid='{"radius":22,"bezel":20,"thickness":18,"blur":8,"dispersion":0.5}'>Treść</div>\n\n<script>liquidGlassAll('[data-liquid]')</script>`, 'Skopiowano implementację');
  requestAnimationFrame(() => window.liquidGlassAll && window.liquidGlassAll('[data-liquid]'));
}

/* ---------- filter + boot ---------- */
function setupSearch() {
  const q = $('#q');
  q.addEventListener('input', refreshFilters);
}
function setupNav() {
  const nav = $('#nav');
  nav.innerHTML = SECTIONS.map(s => `<li><a href="#${s.id}">${esc(s.title)}${s.count ? `<i>${s.count}</i>` : ''}</a></li>`).join('');
  const links = [...nav.querySelectorAll('a')];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id));
  }), { rootMargin: '-30% 0px -60% 0px' });
  SECTIONS.forEach(s => { const n = document.getElementById(s.id); n && io.observe(n); });
  $('#total').textContent = SECTIONS.length;
  const tops = links.map((a, i) => () => document.getElementById(SECTIONS[i].id).scrollIntoView({ behavior: 'smooth' }));
}
async function boot() {
  const t = localStorage.getItem('al-theme'); if (t) document.documentElement.dataset.theme = t;
  $('#theme').onclick = () => { const d = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = d; localStorage.setItem('al-theme', d); };
  const [A, FONTS, ILL] = await Promise.all([
    fetch('data/assets.json').then(r => r.json()),
    fetch('data/fonts.json').then(r => r.json()),
    fetch('data/illustrations.json').then(r => r.json()).catch(() => [])
  ]);
  window.__ILLU = ILL;
  $('.hero h1').textContent = 'Biblioteka assetów do projektowania';
  $('.hero .lead').textContent = `Ikony, ilustracje, wzory, gradienty, ${FONTS.length} fontów, palety i komponenty. Wybierz element, aby skopiować kod; źródła znajdziesz w sekcji Licencje.`;
  $('#q').placeholder = 'Szukaj assetu…';
  const totalColors = A.palettes.reduce((n, p) => n + p.colors.length, 0);
  $('#stats').innerHTML = [['Ikony', A.icons.length], ['Fonty', FONTS.length], ['Palety', A.palettes.length], ['Kolory', totalColors], ['Wzory', A.patterns.length], ['Ilustracje', ILL.length], ['Komponenty', COMPONENTS.length], ['Efekty', 10]]
    .map(([k, v]) => `<div class="stat"><b>${v.toLocaleString('pl-PL')}</b><span>${k}</span></div>`).join('');
  iconsSection(A); liquidSection(); illuSection(); patternSection(A); gradientSection(A); textureSection(); tokenSection(A); motionSection(A); fontSection(FONTS); paletteSection(A); kitSection(); effectSection(); licenseSection(A);
  setupSearch(); setupNav();
  document.body.dataset.ready = '1';
}
boot().catch(e => { console.error(e); document.body.insertAdjacentHTML('beforeend', `<p style="padding:40px;text-align:center">Błąd ładowania bazy: ${esc(e.message)}</p>`); });
})();
