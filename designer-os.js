/* Designer OS region for Design Canvas. All texts/HEX come from data/designer-os.json
   (parsed from the Designer OS v3 skill files by tools/build_designer_os.py). */
(() => {
'use strict';
const PL = 'Zażółć gęślą jaźń · ŁÓDŹ';
window.DOS_LAYOUT = function (api, D, X0, Y0) {
  const { addBoard, titles, sections, esc, onColor, CK, codeBlock } = api;
  const W = D.fontWeights;
  const maxW = (f, want = 800) => { const ws = W[f] || [400]; return ws.filter(w => w <= want).pop() || ws[0]; };
  const ff = f => `'${f}', ${/Serif|Fraunces/.test(f) ? 'serif' : /Mono/.test(f) ? 'monospace' : 'sans-serif'}`;
  const ck = (txt) => { const k = 'k' + Object.keys(CK).length; CK[k] = txt; return k; };
  const copyBtn = (txt, label = 'Kopiuj') => `<button class="dos-copy" data-ck="${ck(txt)}">⧉ ${esc(label)}</button>`;
  const P = Object.fromEntries(D.palettes.map(p => [p.id, p]));
  const badge = c => `<span class="dos-badge g-${c.grade === 'Niezgodny' ? 'fail' : c.grade === 'AA duży' ? 'large' : c.grade.toLowerCase()}" title="${esc(c.fg + ' na ' + c.bg)}"><i style="background:${c.bg};color:${c.fg}">Aa</i>${esc(c.label)} <b>${c.ratio.toFixed(2)}:1</b> ${esc(c.grade)}</span>`;
  const pv = p => `--p:${p.primary};--s:${p.secondary};--tp:${p.recommended_text_on_primary};--ts:${p.recommended_text_on_secondary};--fd:${ff(p.display)};--fb:${ff(p.body)};--dw:${maxW(p.display, 800)};--bw:${maxW(p.body, 600)}`;
  const hdr = esc;

  /* ---------- palette brand-board frames ---------- */
  const DEMO = 'treść demonstracyjna';
  const headlines = { '01': ['Lato w', 'pełnym słońcu'], '02': ['Spokój', 'w danych'], '03': ['Głośniej.', 'Szybciej.'], '04': ['Miękko,', 'ale wyraźnie'], '05': ['Wygrywa', 'tempo'], '06': ['Ciepło', 'na co dzień'], '07': ['Decyzje', 'bez szumu'], '08': ['Smak', 'podróży'], '09': ['Cisza', 'jako forma'], '10': ['Przyszłość', 'bez hałasu'], '11': ['Złoto', 'z rzemiosła'], '12': ['Sygnał', 'w ciemności'], '13': ['Spokojny', 'luksus'], '14': ['Kolekcja', 'limitowana'] };
  const F = {
    palette(p) {
      return `<div class="dp-pal">
<div class="dp-60"><div class="dp-id">${p.id}</div><h2>${hdr(p.name)}</h2><div class="dp-mood">${hdr(p.mood)}</div>
<div class="dp-hex"><button data-copy="${p.primary}"><small>primary · 60%</small>${p.primary}</button><button data-copy="${p.secondary}" style="color:var(--s)"><small>secondary · 30%</small>${p.secondary}</button></div>
<div class="dp-meta"><div><small>Zastosowanie</small>${hdr(p.use)}</div><div><small>Kategoria</small>${hdr(p.category)}</div><div><small>Fonty</small>${hdr(p.display)} + ${hdr(p.body)}</div></div></div>
<div class="dp-30"><small>Tekst na primary</small><button data-copy="${p.recommended_text_on_primary}"><i style="background:${p.recommended_text_on_primary}"></i>${p.recommended_text_on_primary}</button><small>Tekst na secondary</small><button data-copy="${p.recommended_text_on_secondary}"><i style="background:${p.recommended_text_on_secondary}"></i>${p.recommended_text_on_secondary}</button><div class="dp-ratio"><span style="flex:6;background:var(--p)">60</span><span style="flex:3;background:var(--s);color:var(--ts)">30</span><span style="flex:1;background:var(--tp);color:var(--p)">10</span></div></div>
<div class="dp-badges">${p.contrast.map(badge).join('')}</div></div>`;
    },
    type(p) {
      return `<div class="dp-type"><div class="lbl">Display · ${hdr(p.display)} ${maxW(p.display)}</div><div class="aa">Aa</div><div class="abc">AaBbCcDdEeFfGg</div><div class="pl">${PL}</div>
<div class="body-s"><div class="lbl">Body · ${hdr(p.body)}</div><p>${PL}. Tekst główny w rozmiarze do czytania: krótkie zdania, interlinia 1.5 i ok. 60 znaków w wierszu.</p></div>
<div class="hier"><div class="h1">${hdr(headlines[p.id].join(' '))}</div><div class="h2">Podtytuł z konkretną korzyścią</div><div class="meta">Meta · dane · CTA</div></div></div>`;
    },
    poster(p) {
      const [a, b] = headlines[p.id];
      return `<div class="dp-poster"><div class="top"><span>Designer OS ${p.id}</span><span>2027</span></div><h3>${hdr(a)}<br>${hdr(b)}</h3><div class="panel"><p>Jedno hasło, jeden obraz, jedno działanie.</p><span class="cta">Sprawdź →</span></div><div class="demo">${DEMO}</div></div>`;
    },
    ad(p) {
      const [a, b] = headlines[p.id];
      return `<div class="dp-ad"><div class="num">01 / 05</div><div class="shape"></div><h3>${hdr(a)} ${hdr(b)}</h3><p>Karuzela 4:5 · jedna idea na slajd, stały numer i CTA.</p><div class="foot"><span class="cta">Zobacz więcej</span><span class="dots"><i></i><i></i><i></i><i></i><i></i></span></div><div class="demo">${DEMO}</div></div>`;
    },
    hero(p) {
      const [a, b] = headlines[p.id];
      return `<div class="dp-hero"><nav><b>Marka</b><span>Oferta</span><span>Realizacje</span><span>Kontakt</span><span class="cta sm">Umów rozmowę</span></nav>
<div class="cols"><div class="txt"><div class="eyebrow">${hdr(p.use)}</div><h1>${hdr(a)} ${hdr(b)}</h1><p>Hero landingu w palecie ${p.id}: primary jako tło (60%), secondary jako duży panel (30%), tekst-akcent w CTA (10%).</p><div class="btns"><span class="cta">Zacznij teraz</span><span class="ghost">Zobacz przykłady</span></div></div>
<div class="art"><div class="c1"></div><div class="c2"></div><div class="c3">${p.id}</div></div></div><div class="demo">${DEMO}</div></div>`;
    },
    card(p) {
      return `<div class="dp-card"><div class="ui"><div class="hd"><b>Ustawienia projektu</b><span class="pill">Designer OS ${p.id}</span></div>
<label>Nazwa kampanii<span>Kolekcja 2027</span></label><label>Format<span>Instagram 4:5 · 1080×1350</span></label>
<div class="tg"><i class="on"></i>Polskie znaki sprawdzone</div><div class="tg"><i></i>Wersja ciemna</div>
<div class="row"><span class="cta">Zapisz</span><span class="ghost">Anuluj</span></div></div><div class="demo">${DEMO} · karta UI</div></div>`;
    },
  };
  const LITE = {
    palette: p => `<div class="dp-pal"><div class="dp-60"><div class="dp-id">${p.id}</div></div><div class="dp-30"></div></div>`,
    type: p => `<div class="dp-type"><div class="aa">Aa</div></div>`,
    poster: p => `<div class="dp-poster"><h3>${hdr(headlines[p.id][0])}</h3><div class="panel"></div></div>`,
    ad: p => `<div class="dp-ad"><div class="shape"></div></div>`,
    hero: p => `<div class="dp-hero"><div class="cols"><div class="txt"><h1>${hdr(headlines[p.id][0])}</h1></div><div class="art"><div class="c1"></div></div></div></div>`,
    card: p => `<div class="dp-card"><div class="ui"></div></div>`,
  };
  const FR = [['palette', 'Paleta', 1080, 1080], ['type', 'Typografia', 1080, 1080], ['poster', 'Plakat 3:4', 810, 1080], ['ad', 'Reklama 4:5', 864, 1080], ['hero', 'Hero landingu', 1920, 1080], ['card', 'Karta UI', 1080, 1080]];
  const GAP = 120, RH = 1080, RG = 420;
  const RW = FR.reduce((a, f) => a + f[2], 0) + GAP * (FR.length - 1);
  const pdetail = p => `<p class="muted">Designer OS · paleta ${p.id} · ${hdr(p.category)}</p>
<div class="swatches">${[['primary', p.primary], ['secondary', p.secondary], ['tekst na primary', p.recommended_text_on_primary], ['tekst na secondary', p.recommended_text_on_secondary]].map(([n, h]) => `<button class="swatch" data-copy="${h}"><i style="background:${h}"></i><span>${h}</span><small>${n}</small></button>`).join('')}</div>
<h3>Nastrój / zastosowanie</h3><p>${hdr(p.mood)}</p><p class="muted">${hdr(p.use)}</p>
<h3>Kontrast WCAG (obliczony)</h3>${p.contrast.map(c => `<p>${hdr(c.label)}: <b>${c.ratio.toFixed(2)}:1</b> — ${hdr(c.grade)} <span class="muted">(${c.fg} na ${c.bg})</span></p>`).join('')}
<h3>Fonty</h3>${codeBlock(`font-family: ${ff(p.display)};  /* display */\nfont-family: ${ff(p.body)};  /* body */`, 'Kopiuj font-family')}
<h3>Tokeny CSS</h3>${codeBlock(`:root{\n  /* Designer OS ${p.id} · ${p.name} — HEX z palettes.json */\n  --color-primary: ${p.primary};\n  --color-secondary: ${p.secondary};\n  --color-text-on-primary: ${p.recommended_text_on_primary};\n  --color-text-on-secondary: ${p.recommended_text_on_secondary};\n  --font-display: ${ff(p.display)};\n  --font-body: ${ff(p.body)};\n}`, 'Kopiuj CSS vars')}
<h3>Polecenie</h3>${codeBlock(`Designer OS ${p.id}`, 'Kopiuj komendę')}`;
  const ptext = p => `Designer OS ${p.id} · ${p.name}\nprimary ${p.primary} · secondary ${p.secondary}\ntekst na primary ${p.recommended_text_on_primary} · tekst na secondary ${p.recommended_text_on_secondary}\nfonty: ${p.display} / ${p.body}\nnastrój: ${p.mood}\nzastosowanie: ${p.use}\nkontrast: ${p.contrast.map(c => c.label + ' ' + c.ratio.toFixed(2) + ':1 ' + c.grade).join('; ')}`;

  // region header
  const regionTitleY = Y0;
  const py0 = Y0 + 1700;
  D.palettes.forEach((p, i) => {
    const col = i < 7 ? 0 : 1, row = i % 7;
    const x0 = X0 + col * (RW + 2400), y = py0 + row * (RH + RG);
    titles.push({ x: x0, y: y - 60, html: `${p.id} · ${esc(p.name)}`, cls: 'row-title', row: true, h: RH });
    let x = x0;
    FR.forEach(([k, name, w, h]) => {
      addBoard({ id: `DOS-${p.id}:${k}`, kind: 'dos', x, y, w, h, label: name, sub: `DOS ${p.id} · ${p.name}`, favKey: 'dos:pal-' + p.id, cat: 'dos', cls: 'dos-ab', vars: pv(p),
        search: `designer os ${p.id} ${p.name} ${p.mood} ${p.use} ${p.category} ${p.display} ${p.body} ${p.primary} ${p.secondary}`.toLowerCase(),
        full: () => F[k](p), lite: () => LITE[k](p), pres: true, dosPal: p, copyText: ptext(p),
        detailTitle: `Designer OS ${p.id} · ${p.name}`, detail: () => pdetail(p) });
      x += w + GAP;
    });
  });
  const palW = RW * 2 + 2400, palH = 7 * (RH + RG);

  /* ---------- library (right side) ---------- */
  const LX = X0 + palW + 3200, CW = 1500, CH = 1000, CG = 110, COLS = 10;
  const LW = COLS * CW + (COLS - 1) * CG;
  let ly = py0;
  const libCards = [];
  function sub(title, note, cards) {
    titles.push({ x: LX, y: ly - 700, html: `${esc(title)}<small>${esc(note)}</small>`, cls: 'dos-sub' });
    cards.forEach((c, i) => {
      const x = LX + (i % COLS) * (CW + CG), y = ly + Math.floor(i / COLS) * (CH + 240);
      addBoard(Object.assign({ x, y, w: CW, h: CH, kind: 'dos', cat: 'dos', cls: 'dos-ab dos-card', vars: c.vars || '', pres: true,
        favKey: 'dos:' + c.id, search: ('designer os ' + c.label + ' ' + c.sub + ' ' + (c.copyText || '')).toLowerCase() }, c, { id: 'DOS-' + c.id }));
    });
    ly += Math.ceil(cards.length / COLS) * (CH + 240) + 1000;
  }
  const strip = (i) => { const p = D.palettes[i % 14]; return `--p:${p.primary};--s:${p.secondary};--tp:${p.recommended_text_on_primary};--ts:${p.recommended_text_on_secondary}`; };
  const textCard = (o) => ({ id: o.id, label: o.label, sub: o.sub, vars: o.vars, copyText: o.copy,
    full: () => `<div class="dc ${o.cls || ''}"><div class="dc-k">${esc(o.kicker)}</div>${o.big ? `<div class="dc-n">${esc(o.big)}</div>` : ''}<h3>${esc(o.title)}</h3>${o.html}<div class="dc-src">${esc(o.src)}</div>${o.copy ? copyBtn(o.copy) : ''}</div>`,
    lite: () => `<div class="dc ${o.cls || ''}"><div class="dc-k">${esc(o.kicker)}</div>${o.big ? `<div class="dc-n">${esc(o.big)}</div>` : ''}<h3>${esc(o.title)}</h3></div>`,
    detailTitle: o.title, detail: () => `<p class="muted">${esc(o.src)}</p>${o.html.replace(/class="dos-copy"[^>]*>[^<]*<\/button>/g, '')}${o.copy ? codeBlock(o.copy, 'Kopiuj') : ''}` });

  // (b) Typography library
  const parseDir = d => ({ caps: /CAPS|uppercase/i.test(d), track: (d.match(/tracking (-?0?\.\d+em)/) || d.match(/(-0?\.\d+em)/) || [])[1] || '-0.01em', lead: (d.match(/leading (\d\.\d+)/) || d.match(/(\d\.\d+)[–-]\d\.\d+ heading leading/) || [])[1] || '1.05' });
  const wantW = raw => { const m = raw.match(/(\d{3})(?:[\/–](\d{3}))?/); return m ? +(m[2] || m[1]) : 400; };
  const typeCards = [];
  D.typeStyles.forEach((s, i) => {
    const f = s.display[0], dir = parseDir(s.direction), w = maxW(f, wantW(s.displayRaw.split(' or ')[0]));
    const body = s.body.split(' ')[0] === 'pair' ? 'Inter' : s.body.replace(/\s\d.*$/, '');
    typeCards.push({ id: 'type-' + i, label: s.style, sub: 'Typografia · styl', copyText: `${s.style}\nDisplay: ${s.displayRaw}\nBody/UI: ${s.body}\nKierunek: ${s.direction}\nUżycie: ${s.use}`,
      full: () => `<div class="dt"><div class="dc-k">Styl typograficzny · type-system.md</div><div class="dt-spec" style="font-family:${ff(f)};font-weight:${w};letter-spacing:${dir.track};line-height:${dir.lead};${dir.caps ? 'text-transform:uppercase' : ''}">${esc(s.style)}<br>Zażółć jaźń</div>
<div class="dt-pair"><span><small>Display</small>${esc(s.displayRaw)}</span><span><small>Body / UI</small>${esc(s.body)}</span></div><p class="dt-body" style="font-family:${ff(body)}">${PL}. Tekst główny w kroju ${esc(body)} — czytelny, z polskimi znakami.</p>
<div class="dt-dir"><b>Kierunek</b>${esc(s.direction)}</div><div class="dt-dir"><b>Użycie / unikać</b>${esc(s.use)}</div></div>`,
      lite: () => `<div class="dt"><div class="dt-spec" style="font-family:${ff(f)};font-weight:${w}">${esc(s.style)}</div></div>`,
      detailTitle: s.style, detail: () => `<p class="muted">type-system.md</p><p style="font-family:${ff(f)};font-weight:${w};font-size:40px;line-height:1.05;${dir.caps ? 'text-transform:uppercase' : ''}">${PL}</p><h3>Display</h3><p>${esc(s.displayRaw)}</p><h3>Body/UI</h3><p>${esc(s.body)}</p><h3>Kierunek</h3><p>${esc(s.direction)}</p><h3>Użycie / unikać</h3><p>${esc(s.use)}</p>${codeBlock(`font-family: ${ff(f)};\nfont-weight: ${w};\nletter-spacing: ${dir.track};\nline-height: ${dir.lead};${dir.caps ? '\ntext-transform: uppercase;' : ''}`, 'Kopiuj CSS')}` });
  });
  D.layoutMoods.forEach(m => {
    const p = P[m.paletteId];
    typeCards.push({ id: 'mood-' + m.id, label: `Mood ${m.id}: ${m.name}`, sub: 'Layout mood preview', vars: pv(p), copyText: `Layout mood ${m.id}: ${m.name} = ${p.name} (${p.primary} / ${p.secondary}) + ${m.display} / ${m.body}, ${m.desc}`,
      full: () => `<div class="dm dm-${m.id}"><div class="dm-tag">Mood ${m.id} · ${esc(m.name)}</div><h3>${m.id === 'A' ? 'Nowa<br>kolekcja' : m.id === 'C' ? 'GŁOŚNO.' : m.id === 'E' ? 'Wygrywa tempo' : m.id === 'B' ? 'Spokój w danych' : 'Miękko, ale wyraźnie'}</h3><p>${esc(m.desc)}</p><div class="dm-ft"><span class="cta">CTA</span><span>${esc(p.id + ' ' + p.name)} · ${esc(m.display)} / ${esc(m.body)}</span></div>${m.id === 'B' || m.id === 'E' ? '<div class="dm-grid"></div>' : ''}${m.id === 'D' ? '<div class="dm-blob"></div><div class="dm-blob b2"></div>' : ''}</div>`,
      lite: () => `<div class="dm dm-${m.id}"><h3>${esc(m.name)}</h3></div>`,
      detailTitle: `Layout mood ${m.id}: ${m.name}`, detail: () => `<p class="muted">type-system.md · Layout mood previews</p><p>${esc(p.name)} + ${esc(m.display)} / ${esc(m.body)}</p><p>${esc(m.desc)}</p>` });
  });
  D.combos.forEach(c => {
    const p = P[c.paletteId];
    typeCards.push({ id: 'combo-' + c.paletteId, label: `P${c.paletteId} ${c.name}`, sub: 'Combo fontów', vars: pv(p), copyText: `P${c.paletteId} ${c.name}: ${c.display} display ${c.displayW} + ${c.body} body ${c.bodyW}; ${c.use}`,
      full: () => `<div class="dcb"><div class="dc-k">Combo · P${c.paletteId}</div><div class="dcb-d" style="font-family:${ff(c.display)};font-weight:${maxW(c.display, +c.displayW.split('–').pop())}">${esc(c.name)}</div><p style="font-family:${ff(c.body)}">${PL}. ${esc(c.body)} ${esc(c.bodyW)} w tekście.</p><div class="dcb-f"><span>${esc(c.display)} · ${esc(c.displayW)}</span><span>${esc(c.body)} · ${esc(c.bodyW)}</span><span>${esc(c.use)}</span></div></div>`,
      lite: () => `<div class="dcb"><div class="dcb-d" style="font-family:${ff(c.display)}">${esc(c.name)}</div></div>` });
  });
  D.shotRefs.forEach((s, i) => {
    typeCards.push({ id: 'ref-' + i, label: s.label + ' → substytuty', sub: 'Kierunek z referencji', copyText: `${s.label}: ${s.traits}. Substytuty: ${s.substitutesRaw}. Użycie: ${s.use}`,
      full: () => `<div class="dr"><div class="dc-k">Referencja formy · ${esc(s.label)}</div><div class="dr-specs">${s.substitutes.map(x => { const f = x.replace(/\s\d.*$/, ''), w = +(x.match(/\d{3}/) || [400])[0]; return `<div><span style="font-family:${ff(f)};font-weight:${maxW(f, w)}">Zażółć</span><small>${esc(x)}</small></div>`; }).join('')}</div><p><b>Cechy:</b> ${esc(s.traits)}</p><p><b>Najlepiej:</b> ${esc(s.use)}</p><div class="dc-src">Substytut wizualny — nie potwierdzony oryginalny font.</div></div>`,
      lite: () => `<div class="dr"><h3>${esc(s.label)}</h3></div>` });
  });
  typeCards.push(textCard({ id: 'type-rules', label: 'Zasady pracy z fontami', sub: 'Typografia', kicker: 'Rules for making fonts work', title: 'Zasady fontów', cls: 'dc-list', src: 'type-system.md', html: `<ul>${D.typeRules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`, copy: D.typeRules.map(r => '- ' + r).join('\n') }));
  typeCards.push(textCard({ id: 'type-template', label: 'Szablon specyfikacji typografii', sub: 'Typografia', kicker: 'Type design output template', title: 'Szablon typografii', src: 'type-system.md', html: `<pre class="dc-pre">${esc(D.typeTemplate.join('\n'))}</pre>`, copy: D.typeTemplate.join('\n') }));
  sub('Typografia', `${D.typeStyles.length} stylów · ${D.layoutMoods.length} layout moods · ${D.combos.length} combo · ${D.shotRefs.length} referencji · fonty Google`, typeCards);

  // (c) Principles board
  const pc = [];
  D.sevenRules.forEach((r, i) => pc.push(textCard({ id: 'rule7-' + r.n, label: `Zasada ${r.n}`, sub: '7 zasad', vars: strip(i), kicker: '7 zasad każdego projektu', big: String(r.n).padStart(2, '0'), title: r.title.replace(/\.$/, ''), cls: 'dc-rule', src: 'SKILL.md', html: `<p>${esc(r.text)}</p>`, copy: `${r.n}. ${r.title} ${r.text}` })));
  D.designRules.forEach((r, i) => pc.push(textCard({ id: 'drule-' + r.n, label: `Rule ${r.n}: ${r.title}`, sub: 'Design principles', vars: strip(i + 7), kicker: 'Art direction rule ' + r.n, big: r.n, title: r.title, cls: 'dc-rule dc-dense', src: 'design-principles.md', html: r.paras.slice(0, 4).map(x => `<p>${esc(x)}</p>`).join(''), copy: `Rule ${r.n}. ${r.title}\n\n${r.paras.join('\n\n')}` })));
  pc.push(textCard({ id: 'procedure', label: 'Procedura decyzji', sub: 'SKILL.md', kicker: 'Procedura decyzji', title: 'Brief → Refinement', cls: 'dc-steps', src: 'SKILL.md', html: `<ol>${D.procedure.map(s => `<li><b>${esc(s.title)}</b> ${esc(s.text)}</li>`).join('')}</ol>`, copy: D.procedure.map(s => `${s.title}: ${s.text}`).join('\n') }));
  pc.push(textCard({ id: 'polish', label: 'Modern editorial polish', sub: 'Design principles', kicker: 'Modern editorial polish', title: 'Editorial polish', cls: 'dc-list', src: 'design-principles.md', html: `<ul>${D.editorialPolish.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`, copy: D.editorialPolish.map(r => '- ' + r).join('\n') }));
  pc.push(textCard({ id: 'judgment', label: 'Decyzje wymagające osądu', sub: 'Design principles', kicker: 'Design decisions that require judgment', title: 'Decyzje z osądem', cls: 'dc-list', src: 'design-principles.md', html: `<ul>${D.judgment.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`, copy: D.judgment.map(r => '- ' + r).join('\n') }));
  pc.push(textCard({ id: 'colour-rules', label: 'Kolor i dostępność', sub: 'SKILL.md', kicker: 'Kolor i dostępność', title: 'Kolor i dostępność', cls: 'dc-list', src: 'SKILL.md', html: `<ul>${D.colourRules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`, copy: D.colourRules.map(r => '- ' + r).join('\n') }));
  sub('Zasady', `7 zasad · ${D.designRules.length} reguł art direction · procedura · polish`, pc);

  // QA + anti-slop
  const qc = [];
  D.qaGates.forEach((g, i) => qc.push(textCard({ id: 'qa-' + i, label: 'QA: ' + g.title, sub: 'Checklista QA', vars: strip(i + 3), kicker: 'Fast gate ' + String(i + 1).padStart(2, '0'), big: '✓', title: g.title, cls: 'dc-gate', src: 'qa-checklist.md', html: `<p>${esc(g.text)}</p>`, copy: `${g.title}: ${g.text}` })));
  const tot = D.qaScore.reduce((a, s) => a + s.points, 0);
  qc.push(textCard({ id: 'qa-score', label: 'Ocena 100 pkt', sub: 'Checklista QA', kicker: '100-point assessment', title: `Ocena ${tot} pkt`, cls: 'dc-score', src: 'qa-checklist.md', html: `<div class="bars">${D.qaScore.map(s => `<div><span>${esc(s.aspect)}</span><i style="width:${s.points / 20 * 100}%"></i><b>${s.points}</b></div>`).join('')}</div><p class="note">${esc(D.qaScoreNote)}</p>`, copy: D.qaScore.map(s => `${s.aspect}: ${s.points}`).join('\n') }));
  qc.push(textCard({ id: 'qa-repair', label: 'Quality repair playbook', sub: 'Checklista QA', kicker: 'Quality repair playbook', title: 'Naprawy', cls: 'dc-list', src: 'qa-checklist.md', html: `<ul>${D.qaRepair.map(r => `<li><b>${esc(r.title)}</b> — ${esc(r.text)}</li>`).join('')}</ul>`, copy: D.qaRepair.map(r => `${r.title}: ${r.text}`).join('\n') }));
  qc.push(textCard({ id: 'rubric', label: 'Rubryka jakości 0–5', sub: 'implementation.md', kicker: 'Quality rubric (0–5 each)', title: 'Rubryka 25 pkt', cls: 'dc-steps', src: 'implementation.md', html: `<ol>${D.rubric.map(r => `<li>${esc(r)}</li>`).join('')}</ol>`, copy: D.rubric.map((r, i) => `${i + 1}. ${r}`).join('\n') }));
  qc.push(textCard({ id: 'antislop', label: 'Anty-slop', sub: 'Anty-slop', kicker: 'Anty-slop · cytaty ze źródeł', title: 'Bez AI slopu', cls: 'dc-anti', src: 'SKILL.md · qa-checklist.md · prompts.md', html: `<ul>${D.antiSlop.map(a => `<li>${esc(a.text)}<small>${esc(a.src)}</small></li>`).join('')}</ul>`, copy: D.antiSlop.map(a => '- ' + a.text).join('\n') }));
  sub('Checklista QA i anty-slop', `${D.qaGates.length} bramek · ocena ${tot} pkt · ${D.qaRepair.length} napraw · ${D.antiSlop.length} reguł anty-slop`, qc);

  // (d) Workflows + prompts
  const wc = [];
  D.workflows.forEach((w, i) => wc.push(textCard({ id: 'wf-' + w.n, label: `Workflow ${w.n}: ${w.title}`, sub: 'Workflow', vars: strip(i), kicker: 'Workflow ' + w.n, big: w.n, title: w.title, cls: 'dc-wf', src: 'creative-workflows.md', html: w.text.split('\n').filter(Boolean).slice(0, 9).map(l => /^\d\.|^- /.test(l.trim()) ? `<p class="li">${esc(l.trim().replace(/^- /, '• '))}</p>` : `<p>${esc(l)}</p>`).join(''), copy: `${w.n}. ${w.title}\n\n${w.text}` })));
  D.prompts.forEach((p, i) => wc.push(textCard({ id: 'pr-' + i, label: 'Prompt: ' + p.title, sub: 'Prompt', kicker: 'Prompt · prompts.md', title: p.title, cls: 'dc-prompt', src: 'prompts.md', html: `<pre class="dc-pre">${esc(p.text)}</pre>`, copy: p.text })));
  wc.push(textCard({ id: 'formula', label: 'Formuła promptu', sub: 'Prompt', kicker: 'Designer-grade prompt formula', title: 'Formuła promptu', cls: 'dc-formula', src: 'prompts.md · design-principles.md', html: `<div class="formula">${D.promptFormula.split(' + ').map(t => `<span>${esc(t)}</span>`).join('<i>+</i>')}</div>`, copy: D.promptFormula }));
  wc.push(textCard({ id: 'cases', label: 'Mini case’y', sub: 'Prompt', kicker: 'Mini cases', title: 'Mini case’y', cls: 'dc-list', src: 'prompts.md', html: `<ul>${D.miniCases.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`, copy: D.miniCases.map(r => '- ' + r).join('\n') }));
  sub('Workflowy i prompty', `${D.workflows.length} workflowów · ${D.prompts.length} promptów · kliknij „Kopiuj”`, wc);

  // (e) Tokens
  const tc = [];
  D.tokens.forEach((t, i) => tc.push(textCard({ id: 'tok-' + i, label: t.title, sub: 'Tokeny CSS', kicker: 'implementation.md · ' + t.lang, title: t.title, cls: 'dc-code', src: 'implementation.md', html: `<pre class="dc-pre code">${esc(t.code)}</pre>`, copy: t.code })));
  tc.push(textCard({ id: 'contrast', label: 'Praktyka kontrastu', sub: 'Tokeny CSS', kicker: 'Exact color contrast practice', title: 'Kontrast — praktyka', cls: 'dc-list', src: 'implementation.md', html: `<ul>${D.contrastPractice.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`, copy: D.contrastPractice.map(r => '- ' + r).join('\n') }));
  tc.push(textCard({ id: 'impl-rules', label: 'Reguły wdrożenia', sub: 'Tokeny CSS', kicker: 'Refined decision rules', title: 'Reguły wdrożenia', cls: 'dc-list', src: 'implementation.md', html: `<ul>${D.implRules.map(r => `<li>${esc(r)}</li>`).join('')}</ul>`, copy: D.implRules.map(r => '- ' + r).join('\n') }));
  sub('Tokeny CSS', `${D.tokens.length} snippety z implementation.md · gotowe do skopiowania`, tc);

  const regionW = (LX + LW) - X0, regionH = Math.max(palH + 1700, ly - Y0) + 600;
  titles.unshift({ x: X0 - 900, y: Y0 - 1100, w: regionW + 1800, h: regionH + 1300, cls: 'dos-region', html: '' });
  titles.push({ x: X0, y: regionTitleY - 400, cls: 'dos-head', html: `<img src="${D.icon}" alt="" width="360" height="360"><div>Designer OS<small>v3 · 14 palet · typografia · zasady · QA · workflowy · tokeny — dane z plików skilla</small></div>` });
  titles.push({ x: X0, y: py0 - 520, cls: 'dos-sub', html: `Palety 01–14<small>dokładne HEX z palettes.json · kontrast WCAG obliczony · mockupy HTML/CSS 60/30/10</small>` });
  sections.push({ id: 'dos', name: 'Designer OS', x: X0 - 900, y: Y0 - 1100, w: regionW + 1800, h: regionH + 1300, count: D.palettes.length, first: true });
  sections.push({ id: 'dos-pal', name: '↳ Palety 01–14', x: X0, y: py0 - 600, w: palW, h: palH + 600, count: 14, first: true });
  sections.push({ id: 'dos-lib', name: '↳ Typografia · zasady · prompty', x: LX, y: py0 - 800, w: LW, h: ly - py0, first: true });
  return { bottom: Y0 + regionH + 300, right: X0 + regionW };
};
})();
