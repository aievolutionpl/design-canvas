/* Builds data/assets.json + assets/icons/** from open-source libraries.
   Sources (all permissive): Lucide ISC, Tabler MIT, Heroicons MIT, Simple Icons CC0,
   Hero Patterns MIT, Open Props MIT, Open Color MIT, Radix Colors MIT, Catppuccin MIT, Nord MIT, DiceBear Open Peeps CC0. */
const fs = require('fs'), path = require('path');
const SRC = '/home/aibot/.hermes/cache/scratch/x/pk';
const SRC2 = '/home/aibot/.hermes/cache/scratch/x';
const ROOT = '/home/aibot/.hermes/projects/design-canvas';
const A = path.join(ROOT, 'assets'), D = path.join(ROOT, 'data');
const read = p => fs.readFileSync(p, 'utf8');

/* ---------- 1. icons ---------- */
const CATS = {
  strzałki: ['arrow-right','arrow-left','arrow-up','arrow-down','arrow-up-right','arrow-down-right','chevron-right','chevron-down','chevron-left','chevron-up','chevrons-right','corner-down-right','refresh-cw','refresh-ccw','rotate-ccw','rotate-cw','maximize-2','minimize-2','expand','shrink','external-link','move','move-right','corner-up-right'],
  akcje: ['plus','minus','x','check','check-check','search','filter','sliders-horizontal','settings','settings-2','more-horizontal','more-vertical','pencil','trash-2','copy','clipboard','clipboard-check','download','upload','share-2','save','undo-2','redo-2','lock','unlock','eye','eye-off','star','heart','bookmark','flag','pin','link','link-2','trash','pencil-line','square-pen','mouse-pointer-click'],
  media: ['play','pause','skip-forward','skip-back','volume-2','volume-x','music','image','video','camera','film','mic','headphones','radio','disc','airplay','cast','rewind','fast-forward','library'],
  pliki: ['file','file-text','folder','folder-open','archive','paperclip','file-code','file-json','database','hard-drive','folder-plus','files','file-check','file-x','sheet'],
  handel: ['shopping-cart','shopping-bag','credit-card','wallet','banknote','receipt','tag','tags','percent','gift','package','truck','store','barcode','qr-code','coins','badge-dollar-sign','calculator','shopping-basket','scan-line'],
  komunikacja: ['mail','inbox','send','message-circle','message-square','phone','phone-call','video','bell','bell-ring','at-sign','reply','forward','mail-open','messages-square','voicemail','megaphone'],
  ludzie: ['user','users','user-plus','user-check','contact','smile','frown','meh','baby','accessibility','user-round','users-round','person-standing','hand','thumbs-up','thumbs-down'],
  pogoda: ['sun','moon','cloud','cloud-rain','cloud-snow','wind','droplet','thermometer','sunrise','sunset','snowflake','umbrella','cloud-sun','cloud-lightning','waves','rainbow'],
  czas: ['clock','calendar','calendar-days','timer','alarm-clock','hourglass','history','watch','calendar-check','clock-3','calendar-clock'],
  technologia: ['cpu','server','wifi','bluetooth','battery','battery-charging','plug','monitor','smartphone','laptop','tablet','keyboard','code','code-2','terminal','git-branch','git-merge','github','figma','chrome','database-zap','bot','brain-circuit','circuit-board','memory-stick','usb','router','signal'],
  layout: ['layout-dashboard','layout-grid','layout-list','sidebar','columns-2','columns-3','panel-left','panel-right','menu','grid-3x3','table','list','kanban','square-kanban','layout-template','frame','component','blocks','separator-horizontal','gallery-horizontal'],
  status: ['info','alert-circle','alert-triangle','help-circle','check-circle','x-circle','shield','shield-check','bug','activity','zap','sparkles','flame','trophy','target','rocket','badge-check','circle-check','circle-alert','loader'],
  jedzenie: ['coffee','pizza','apple','utensils','chef-hat','wine','beer','cake','ice-cream-cone','croissant','sandwich','salad','soup','cookie','beef','carrot','egg-fried','cup-soda'],
  dom: ['home','sofa','bed','lamp','bath','door-open','armchair','plant','trees','flower','lightbulb','blinds','fan','washing-machine','refrigerator','tv','cooking-pot','shower-head'],
  transport: ['car','bike','plane','train-front','bus','ship','map','map-pin','navigation','compass','route','fuel','car-front','rocket','anchor','signpost','milestone'],
  edukacja: ['book','book-open','graduation-cap','pen-tool','palette','brush','pencil','ruler','scissors','type','bold','italic','align-left','heading','highlighter','library-big','notebook-pen','shapes','bezier-curve','layers'],
  bezpieczeństwo: ['key','key-round','fingerprint','scan-face','lock-keyhole','shield-alert','shield-off','scan','file-lock','vault','bug-off','siren'],
  zdrowie: ['heart-pulse','stethoscope','pill','syringe','brain','dumbbell','activity','bandage','thermometer-sun','cross','hand-heart','leaf'],
  social: ['share','repeat','hash','rss','thumbs-up','message-circle-heart','at-sign','send-horizontal','heart-handshake','user-round-check']
};
const HERO = { 'arrow-right':'arrow-right','arrow-left':'arrow-left','arrow-up':'arrow-up','arrow-down':'arrow-down','arrow-up-right':'arrow-up-right','chevron-right':'chevron-right','chevron-down':'chevron-down','chevrons-right':'chevron-double-right','plus':'plus','minus':'minus','x':'x-mark','check':'check','magnifying-glass':'search','funnel':'filter','adjustments-horizontal':'sliders-horizontal','cog-6-tooth':'settings','ellipsis-horizontal':'more-horizontal','pencil':'pencil','trash':'trash','document-duplicate':'copy','clipboard':'clipboard','arrow-down-tray':'download','arrow-up-tray':'upload','share':'share','lock-closed':'lock','lock-open':'unlock','eye':'eye','eye-slash':'eye-off','star':'star','heart':'heart','bookmark':'bookmark','flag':'flag','link':'link','play':'play','pause':'pause','forward':'skip-forward','backward':'skip-back','speaker-wave':'volume-2','speaker-x-mark':'volume-x','musical-note':'music','photo':'image','video-camera':'video','camera':'camera','film':'film','microphone':'mic','folder':'folder','folder-open':'folder-open','archive-box':'archive','paperclip':'paperclip','document':'file','document-text':'file-text','shopping-cart':'shopping-cart','shopping-bag':'shopping-bag','credit-card':'credit-card','wallet':'wallet','banknotes':'banknote','receipt-percent':'receipt','tag':'tag','gift':'gift','cube':'package','truck':'truck','building-storefront':'store','envelope':'mail','inbox':'inbox','paper-airplane':'send','chat-bubble-left':'message-circle','phone':'phone','bell':'bell','at-symbol':'at-sign','user':'user','users':'users','user-plus':'user-plus','face-smile':'smile','face-frown':'frown','sun':'sun','moon':'moon','cloud':'cloud','bolt':'zap','clock':'clock','calendar':'calendar','calendar-days':'calendar-days','cpu-chip':'cpu','server':'server','wifi':'wifi','signal':'signal','device-phone-mobile':'smartphone','computer-desktop':'monitor','command-line':'terminal','code-bracket':'code','squares-2x2':'layout-grid','bars-3':'menu','table-cells':'table','list-bullet':'list','information-circle':'info','exclamation-circle':'alert-circle','exclamation-triangle':'alert-triangle','question-mark-circle':'help-circle','check-circle':'check-circle','x-circle':'x-circle','shield-check':'shield-check','sparkles':'sparkles','fire':'flame','trophy':'trophy','rocket-launch':'rocket','book-open':'book-open','academic-cap':'graduation-cap','swatch':'palette','paint-brush':'brush','scissors':'scissors','key':'key','fingerprint':'fingerprint','heart':'heart-pulse','home':'home','map':'map','map-pin':'map-pin','globe-alt':'compass' };
const ICON_DIRS = {
  lucide: path.join(SRC, 'lucide-static-1.70.0/icons'),
  tabler: [path.join(SRC, 'tabler-icons-3.50.0/icons/outline'), path.join(SRC, 'tabler-icons-3.50.0/icons/filled')],
  heroicons: [path.join(SRC, 'heroicons-2.2.0/24/outline'), path.join(SRC, 'heroicons-2.2.0/24/solid')]
};
const icons = [];
for (const [cat, names] of Object.entries(CATS)) {
  for (const n of names) {
    const p = path.join(ICON_DIRS.lucide, n + '.svg');
    if (!fs.existsSync(p)) continue;
    const out = path.join(A, 'icons/lucide', n + '.svg');
    fs.mkdirSync(path.dirname(out), { recursive: true }); fs.copyFileSync(p, out);
    icons.push({ lib: 'lucide', name: n, cat, src: 'assets/icons/lucide/' + n + '.svg' });
  }
}
for (const [cat, names] of Object.entries(CATS)) {
  for (const n of names) {
    for (const dir of ICON_DIRS.tabler) {
      const p = path.join(dir, n + '.svg'); if (!fs.existsSync(p)) continue;
      const filled = dir.endsWith('filled'), out = path.join(A, 'icons/tabler', (filled ? 'filled/' : '') + n + '.svg');
      fs.mkdirSync(path.dirname(out), { recursive: true }); fs.copyFileSync(p, out);
      icons.push({ lib: 'tabler' + (filled ? '-filled' : ''), name: n, cat, src: 'assets/icons/tabler/' + (filled ? 'filled/' : '') + n + '.svg' });
      break;
    }
  }
}
for (const [hero, luc] of Object.entries(HERO)) {
  for (const dir of ICON_DIRS.heroicons) {
    const p = path.join(dir, hero + '.svg'); if (!fs.existsSync(p)) continue;
    const solid = dir.endsWith('solid'), out = path.join(A, 'icons/heroicons', (solid ? 'solid/' : '') + hero + '.svg');
    fs.mkdirSync(path.dirname(out), { recursive: true }); fs.copyFileSync(p, out);
    const cat = (icons.find(i => i.name === luc) || {}).cat || 'akcje';
    icons.push({ lib: 'heroicons' + (solid ? '-solid' : ''), name: hero, cat, src: 'assets/icons/heroicons/' + (solid ? 'solid/' : '') + hero + '.svg' });
    break;
  }
}
/* brand logos: Simple Icons CC0 */
const BRANDS = ['facebook','instagram','youtube','tiktok','linkedin','x','github','figma','notion','spotify','apple','google','whatsapp','telegram','discord','slack','chrome','adobephotoshop','canva','vercel','react','nodedotjs','python','openai','stripe','shopify','wordpress','mailchimp','hubspot','salesforce','cloudflare','netflix','airbnb','uber','bookingdotcom','pinterest','snapchat','threads','behance','dribbble'];
const sdir = path.join(SRC, 'simple-icons-16.37.0/icons');
for (const b of BRANDS) {
  const p = path.join(sdir, b + '.svg'); if (!fs.existsSync(p)) continue;
  const out = path.join(A, 'icons/brands', b + '.svg'); fs.mkdirSync(path.dirname(out), { recursive: true }); fs.copyFileSync(p, out);
  icons.push({ lib: 'brands', name: b, cat: 'marki', src: 'assets/icons/brands/' + b + '.svg' });
}

/* ---------- 2. hero patterns ---------- */
(async () => {
  const hp = await import(path.join(SRC, 'hero-patterns-2.1.0/dist/hero-patterns.es.js'));
  const pretty = s => s.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();
  const patterns = [];
  for (const [k, fn] of Object.entries(hp)) {
    if (typeof fn !== 'function') continue;
    try {
      const light = fn('#0F1115', 0.09), dark = fn('#FFFFFF', 0.1);
      patterns.push({ name: pretty(k), key: k, light, dark });
    } catch (e) { }
  }
  /* ---------- 3. open props tokens ---------- */
  const op = path.join(SRC, 'open-props-1.7.23/src');
  const grab = (file, re) => { const t = read(path.join(op, file)); return [...t.matchAll(re)].map(m => m.slice(1)); };
  const gradients = grab('props.gradients.css', /--gradient-([\w-]+)\s*:\s*([^;]+);/g).filter(([n]) => /^\d+$/.test(n)).map(([n, v]) => ({ name: 'Gradient ' + n, value: v.trim(), css: `background-image:${v.trim()}` }));
  const shadows = grab('props.shadows.css', /--shadow-(\d)\s*:\s*([^;]+);/g).map(([n, v]) => ({ name: 'Shadow ' + n, value: v.trim().replace(/hsl\(var\(--shadow-color\)\/var\(--shadow-strength-(\d+)\)\)/g, (m, k) => `rgb(15 23 42 / ${(+k) / 100})`), raw: v.trim() }));
  const radii = grab('props.borders.css', /--radius-([\w-]+)\s*:\s*([^;]+);/g).map(([n, v]) => ({ name: n, value: v.trim() }));
  const fontStacks = grab('props.fonts.css', /--font-([\w-]+)\s*:\s*([^;]+);/g).map(([n, v]) => ({ name: n.replace(/-/g,' '), value: v.trim() }));
  const easings = grab('props.easing.css', /--ease-([\w-]+)\s*:\s*([^;]+);/g).map(([n, v]) => ({ name: n, value: v.trim() }));
  const anims = [...new Set(grab('props.animations.css', /@keyframes\s+([\w-]+)/g).map(x => x[0]))];
  const sizes = grab('props.sizes.css', /--size-(\d+)\s*:\s*([^;]+);/g).map(([n, v]) => ({ name: n, value: v.trim() })).filter(x => +x.name <= 15);

  /* ---------- 4. palettes ---------- */
  const palettes = [];
  // Radix Colors 30 scales
  const rdir = path.join(SRC, 'radix-ui-colors-3.0.0');
  const scales = fs.readdirSync(rdir).filter(f => /^[a-z]+\.css$/.test(f) && !f.includes('alpha'));
  for (const f of scales) {
    const name = f.replace('.css', ''); const t = read(path.join(rdir, f));
    const cols = [...t.matchAll(/--([a-z]+)-(\d+):\s*(#[0-9a-f]{6})/gi)].filter(m => m[1] === name).map(m => ({ step: +m[2], hex: m[3].toUpperCase() }));
    const darkT = read(path.join(rdir, name + '-dark.css')); const dark = [...darkT.matchAll(new RegExp(`--${name}-(\\d+):\\s*(#[0-9a-f]{6})`, 'gi'))].map(m => ({ step: +m[1], hex: m[2].toUpperCase() }));
    if (cols.length) palettes.push({ name: 'Radix ' + name, group: 'Radix Colors', colors: cols.map(c => ({ name: c.step + '', hex: c.hex })), dark: dark.map(c => ({ name: c.step + '', hex: c.hex })) });
  }
  // Open Color
  const oc = JSON.parse(read(path.join(SRC, 'open-color-1.9.1/open-color.json')));
  for (const [hue, vals] of Object.entries(oc)) { if (!Array.isArray(vals)) { palettes.push({ name: 'Open Color · ' + hue, group: 'Open Color', colors: [{ name: hue, hex: vals.toUpperCase() }] }); continue; } palettes.push({ name: 'Open Color · ' + hue, group: 'Open Color', colors: vals.map((hex, i) => ({ name: (i + 1) * 10 + '', hex: hex.toUpperCase() })) }); }
  // Tailwind v4 (oklch → hex)
  function oklch2hex(s) {
    const m = s.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/); if (!m) return null;
    let L = m[1].endsWith('%') || +m[1] > 1 ? +m[1] / 100 : +m[1]; const C = +m[2], H = +m[3] * Math.PI / 180;
    const a = C * Math.cos(H), b = C * Math.sin(H);
    const l_ = L + 0.3963377774 * a + 0.2158037573 * b, m_ = L - 0.1055613458 * a - 0.0638541728 * b, s_ = L - 0.0894841775 * a - 1.291485548 * b;
    const l = l_ ** 3, mm = m_ ** 3, s2 = s_ ** 3;
    let r = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s2, g = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s2, bl = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s2;
    const f = x => { x = x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(Math.max(x, 0), 1 / 2.4) - 0.055; return Math.round(Math.min(1, Math.max(0, x)) * 255); };
    return '#' + [f(r), f(g), f(bl)].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
  }
  const tw = read(path.join(SRC, 'tailwindcss-4.3.5/theme.css'));
  const twCols = [...tw.matchAll(/--color-([a-z]+)-(\d+):\s*([^;]+);/g)].map(m => ({ hue: m[1], step: +m[2], v: m[3].trim() }));
  for (const hue of [...new Set(twCols.map(c => c.hue))]) {
    const cols = twCols.filter(c => c.hue === hue).sort((a, b) => a.step - b.step).map(c => ({ name: c.step + '', hex: oklch2hex(c.v) || c.v }));
    palettes.push({ name: 'Tailwind · ' + hue, group: 'Tailwind', colors: cols });
  }
  // Catppuccin
  const cap = read(path.join(SRC, 'catppuccin-palette-1.8.0/css/catppuccin.css'));
  for (const flavor of ['latte', 'frappe', 'macchiato', 'mocha']) {
    const cols = [...cap.matchAll(new RegExp(`--ctp-${flavor}-([a-z0-9]+):\\s*(#[0-9a-f]{6})`, 'gi'))].map(m => ({ name: m[1], hex: m[2].toUpperCase() }));
    if (cols.length) palettes.push({ name: 'Catppuccin · ' + flavor, group: 'Catppuccin', colors: cols });
  }
  // Nord
  const nordFiles = fs.readdirSync(path.join(SRC, 'nord-0.2.1/src/native')); const nf = nordFiles.find(f => f.endsWith('.css') || f.endsWith('.json'));
  if (nf) {
    const t = read(path.join(SRC, 'nord-0.2.1/src/native', nf));
    const cols = [...t.matchAll(/--nord(\d+)\s*:\s*(#[0-9a-f]{6})/gi)].map(m => ({ name: 'nord' + m[1], hex: m[2].toUpperCase() }));
    if (cols.length) palettes.push({ name: 'Nord', group: 'Nord', colors: cols });
  }
  // Apple Clarity + AI Evolution brand tokens (our own system)
  palettes.push({ name: 'Apple Clarity · AIEP UI', group: 'AI Evolution', colors: [['canvas', '#F5F6F8'], ['surface', '#FFFFFF'], ['text', '#17191D'], ['secondary', '#525866'], ['border', '#E2E5EA'], ['action', '#2457D6'], ['success', '#167044'], ['warning', '#B45309'], ['error', '#B42318']].map(([name, hex]) => ({ name, hex })) });

  const out = { generated: new Date().toISOString().slice(0, 10), icons, patterns, gradients, shadows, radii, easings, animations: anims, sizes, fontStacks, palettes,
    licenses: [
      ['Lucide', 'ISC', 'https://github.com/lucide-icons/lucide'], ['Tabler Icons', 'MIT', 'https://github.com/tabler/tabler-icons'],
      ['Heroicons', 'MIT', 'https://github.com/tailwindlabs/heroicons'], ['Simple Icons', 'CC0', 'https://github.com/simple-icons/simple-icons'],
      ['Hero Patterns', 'MIT', 'https://github.com/lukehaas/hero-patterns'], ['Open Props', 'MIT', 'https://github.com/argyleink/open-props'],
      ['Open Color', 'MIT', 'https://github.com/yeun/open-color'], ['Radix Colors', 'MIT', 'https://github.com/radix-ui/colors'],
      ['Catppuccin', 'MIT', 'https://github.com/catppuccin/palette'], ['Nord', 'MIT', 'https://github.com/arcticicestudio/nord'],
      ['DiceBear Open Peeps', 'CC0', 'https://www.dicebear.com/styles/open-peeps/']] };
  fs.writeFileSync(path.join(D, 'assets.json'), JSON.stringify(out));
  console.log('icons', icons.length, 'patterns', patterns.length, 'gradients', gradients.length, 'shadows', shadows.length, 'radii', radii.length, 'easings', easings.length, 'palettes', palettes.length);
  console.log('bytes', (fs.statSync(path.join(D, 'assets.json')).size / 1024).toFixed(0) + 'KB');
})();
