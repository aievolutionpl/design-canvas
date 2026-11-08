#!/usr/bin/env python3
"""Parse Designer OS v3 skill files -> data/designer-os.json (no invented content).

Source dir (env DOS_DIR): .../designer-os/skills/designer-os
Everything textual is copied from the files. Computed fields (WCAG ratios) are labelled `computed`.
"""
import json, os, re, urllib.request, urllib.parse
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOS = os.environ.get('DOS_DIR', '/home/aibot/.hermes/projects/design-canvas-src/designer-os/designer-os/skills/designer-os')
ICON = os.path.join(os.path.dirname(os.path.dirname(DOS)), 'assets', 'icon.png')
UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
read = lambda f: open(os.path.join(DOS, f), encoding='utf-8').read()


def lum(h):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def ratio(a, b):
    x, y = lum(a), lum(b)
    return round((max(x, y) + 0.05) / (min(x, y) + 0.05), 2)


def grade(r):
    return 'AAA' if r >= 7 else 'AA' if r >= 4.5 else 'AA duży' if r >= 3 else 'Niezgodny'


def md_table(txt):
    rows = [l for l in txt.splitlines() if l.strip().startswith('|')]
    if len(rows) < 3:
        return []
    head = [c.strip() for c in rows[0].strip('|').split('|')]
    out = []
    for r in rows[2:]:
        cells = [c.strip() for c in r.strip().strip('|').split('|')]
        out.append(dict(zip(head, cells)))
    return out


def strip_md(s):
    return re.sub(r'\*\*|`', '', s).strip()


def bold_names(s):
    return re.findall(r'\*\*([^*]+?)\*\*', s)


def section(md, title, level='##'):
    m = re.search('^' + re.escape(level) + r' ' + title + r'.*?$\n(.*?)(?=^#{1,%d} |\Z)' % len(level), md, re.M | re.S)
    return m.group(1).strip() if m else ''


def bullets(txt):
    return [l.strip()[2:].strip() for l in txt.splitlines() if l.strip().startswith('- ')]


def main():
    out = {'source': 'Designer OS v3 (skills/designer-os)', 'files': sorted(os.listdir(os.path.join(DOS, 'references')))}
    # ---------- palettes ----------
    pj = json.loads(read('references/palettes.json'))
    out['paletteNotes'] = pj['notes']
    pals = []
    for p in pj['palettes']:
        c = [
            {'label': 'primary ↔ secondary', 'fg': p['secondary'], 'bg': p['primary']},
            {'label': 'tekst na primary', 'fg': p['recommended_text_on_primary'], 'bg': p['primary']},
            {'label': 'tekst na secondary', 'fg': p['recommended_text_on_secondary'], 'bg': p['secondary']},
        ]
        for x in c:
            x['ratio'] = ratio(x['fg'], x['bg']); x['grade'] = grade(x['ratio'])
        q = dict(p); q['contrast'] = c; q['contrastSource'] = 'computed (WCAG 2.x relative luminance)'
        pals.append(q)
    out['palettes'] = pals

    # ---------- SKILL.md: 7 rules, colour rules, brand safety ----------
    sk = read('SKILL.md')
    sev = section(sk, r'7 zasad')
    out['sevenRules'] = [{'n': int(m.group(1)), 'title': m.group(2).strip(), 'text': m.group(3).strip()}
                         for m in re.finditer(r'^(\d)\. \*\*(.+?)\*\*\s*(.+)$', sev, re.M)]
    out['colourRules'] = [strip_md(b) for b in bullets(section(sk, r'Kolor i dostępność'))]
    out['typeRulesSkill'] = [strip_md(b) for b in bullets(section(sk, r'Typografia'))]
    out['brandSafety'] = [strip_md(b) for b in bullets(section(sk, r'Brand safety'))]
    proc = section(sk, r'Procedura decyzji')
    out['procedure'] = [{'title': m.group(1), 'text': strip_md(m.group(2))} for m in re.finditer(r'^\*\*(.+?)\*\*:?\s*(.+)$', proc, re.M)]

    # ---------- design-principles.md ----------
    dp = read('references/design-principles.md')
    rules = []
    for m in re.finditer(r'^## Rule (\d\d)\. (.+?)\n(.*?)(?=^## |\Z)', dp, re.M | re.S):
        body = m.group(3).strip()
        paras = [strip_md(x) for x in re.split(r'\n\s*\n', body) if x.strip()]
        rules.append({'n': m.group(1), 'title': m.group(2).strip(), 'paras': paras})
    out['designRules'] = rules
    out['editorialPolish'] = [strip_md(b) for b in bullets(section(dp, r'Modern editorial polish'))]
    out['judgment'] = [strip_md(b) for b in bullets(section(dp, r'Design decisions that require judgment'))]
    out['darkEditorial'] = strip_md(section(dp, r'Dark editorial variant'))

    # ---------- qa-checklist.md ----------
    qa = read('references/qa-checklist.md')
    out['qaIntro'] = strip_md(qa.split('\n\n')[1])
    out['qaGates'] = [{'title': m.group(1), 'text': m.group(2).strip()} for m in re.finditer(r'^- \*\*(.+?)\*\*:?\s*(.+)$', section(qa, 'Fast gates'), re.M)]
    out['qaScore'] = [{'aspect': r['Aspect'], 'points': int(r['Points'])} for r in md_table(section(qa, '100-point assessment'))]
    out['qaScoreNote'] = strip_md([p for p in section(qa, '100-point assessment').split('\n\n') if not p.startswith('|')][-1])
    out['qaRepair'] = [{'title': m.group(1), 'text': m.group(2).strip()} for m in re.finditer(r'^- `(.+?)`:\s*(.+)$', section(qa, 'Quality repair playbook'), re.M)]

    # ---------- anti-slop (quoted from the files) ----------
    anti = []
    anti += [{'text': b, 'src': 'SKILL.md · Brand safety i oryginalność'} for b in out['brandSafety']]
    og = next((g for g in out['qaGates'] if g['title'] == 'Originality'), None)
    if og: anti.append({'text': og['text'], 'src': 'qa-checklist.md · Originality'})
    rp = next((r for r in out['qaRepair'] if 'AI' in r['title']), None)
    if rp: anti.append({'text': rp['title'] + ': ' + rp['text'], 'src': 'qa-checklist.md · Quality repair playbook'})
    pr = read('references/prompts.md')
    m = re.search(r'^AVOID: (.+)$', pr, re.M)
    if m: anti.append({'text': 'AVOID: ' + m.group(1), 'src': 'prompts.md · Image / ad generation prompt'})
    m = re.search(r'Do not create generic purple AI gradients[^.]*\.', pr)
    if m: anti.append({'text': m.group(0), 'src': 'prompts.md · UI implementation brief'})
    out['antiSlop'] = anti

    # ---------- type-system.md ----------
    ts = read('references/type-system.md')
    out['typeIntro'] = strip_md(ts.split('\n\n')[1])
    styles = []
    for r in md_table(ts.split('## Rules for making fonts work')[0]):
        styles.append({'style': r['Style'], 'displayRaw': strip_md(r['Display / style']), 'display': bold_names(r['Display / style']),
                       'body': strip_md(r['Body/UI']), 'direction': strip_md(r['Direction']), 'use': strip_md(r['Use and avoid'])})
    out['typeStyles'] = styles
    out['typeRules'] = [strip_md(b) for b in bullets(section(ts, r'Rules for making fonts work'))]
    out['typeTemplate'] = [strip_md(l).rstrip() for l in section(ts, r'Type design output template').splitlines() if l.strip()]
    moods = []
    for m in re.finditer(r'^- \*\*([A-E]): (.+?)\*\* = (.+?)/(.+?) \+ (.+?) / (.+?), (.+)$', ts, re.M):
        moods.append({'id': m.group(1), 'name': m.group(2), 'paletteA': m.group(3).strip(), 'paletteB': m.group(4).strip(),
                      'display': m.group(5).strip(), 'body': m.group(6).strip(), 'desc': m.group(7).strip()})
    for mo in moods:
        key = mo['paletteA'].split()[0].lower()
        mo['paletteId'] = next(p['id'] for p in pals if p['name'].lower().startswith(key))
    out['layoutMoods'] = moods
    shot = section(ts, r'Screenshot-inspired font directions')
    out['shotIntro'] = strip_md(shot.split('\n\n')[0])
    out['shotRefs'] = [{'label': strip_md(r['Visual reference label']), 'traits': r['Visual traits to keep'],
                        'substitutes': bold_names(r['Practical installable substitute candidates']),
                        'substitutesRaw': strip_md(r['Practical installable substitute candidates']), 'use': r['Best use']}
                       for r in md_table(shot)]
    out['combos'] = []
    for b in bullets(section(ts, r'Type combos for new reference palettes')):
        m = re.match(r'P(\d\d) (.+?): \*\*(.+?)\*\* display ([\d–]+) \+ \*\*(.+?)\*\* body ([\d–]+); (.+)', b)
        if m:
            out['combos'].append({'paletteId': m.group(1), 'name': m.group(2), 'display': m.group(3), 'displayW': m.group(4),
                                  'body': m.group(5), 'bodyW': m.group(6), 'use': m.group(7).rstrip('.')})
    out['hierarchyTest'] = [strip_md(p) for p in re.split(r'\n\s*\n', section(ts, r'Hierarchy test')) if p.strip()]

    # ---------- workflows ----------
    cw = read('references/creative-workflows.md')
    out['workflows'] = []
    for m in re.finditer(r'^## (\d)\. (.+?)\n(.*?)(?=^## |\Z)', cw, re.M | re.S):
        out['workflows'].append({'n': m.group(1), 'title': m.group(2).strip(), 'text': m.group(3).strip()})

    # ---------- prompts ----------
    prompts = []
    for m in re.finditer(r'^(?:## |\*\*)([^\n*]+)(?:\*\*)?\n```\n(.*?)```', pr, re.M | re.S):
        prompts.append({'title': m.group(1).strip(), 'text': m.group(2).strip()})
    out['prompts'] = prompts
    out['promptFormula'] = strip_md(re.search(r'Replace adjectives with decisions: (.+)', pr).group(1))
    out['miniCases'] = [strip_md(b) for b in bullets(section(pr, r'Mini cases'))]

    # ---------- implementation tokens ----------
    im = read('references/implementation.md')
    blocks = []
    titles = ['Designer OS 02 · Cloud White / Teal — tokeny CSS', 'Architektura ról (semantic roles)', 'P13 Cyprus & Sand — dostępny CSS']
    for i, m in enumerate(re.finditer(r'```(\w*)\n(.*?)```', im, re.S)):
        blocks.append({'title': titles[i] if i < len(titles) else f'Snippet {i + 1}', 'lang': m.group(1) or 'text', 'code': m.group(2).rstrip()})
    out['tokens'] = blocks
    out['contrastPractice'] = [strip_md(b) for b in bullets(section(im, r'Exact color contrast practice'))]
    out['implRules'] = [strip_md(b) for b in bullets(section(im, r'Refined decision rules', '###'))]
    out['rubric'] = [re.sub(r'^\d\. ', '', l.strip()) for l in section(im, r'Quality rubric').splitlines() if re.match(r'\d\.', l.strip())]

    # ---------- fonts with weights ----------
    fams = set()
    for p in pals: fams.update([p['display'], p['body']])
    for s in styles: fams.update(s['display'])
    for s in out['shotRefs']: fams.update(s['substitutes'])
    for c in out['combos']: fams.update([c['display'], c['body']])
    fams.update(['DM Sans', 'Inter', 'Manrope', 'JetBrains Mono'])
    norm = lambda f: re.sub(r'\s+\d{3}.*$', '', f).strip()
    fams = sorted({norm(f) for f in fams})
    specs, weights = [], {}
    for fam in fams:
        for ws in ('400;500;600;700;800;900', '400;500;600;700;800', '400;500;600;700', '400;700', '400', None):
            spec = fam + (':wght@' + ws if ws else '')
            url = 'https://fonts.googleapis.com/css2?family=' + urllib.parse.quote(spec, safe=':@;') + '&display=swap'
            try:
                css = urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=20).read().decode()
                specs.append(spec); weights[fam] = sorted({int(w) for w in re.findall(r'font-weight: (\d+)', css)})
                weights[fam + '_latinExt'] = '/* latin-ext */' in css
                break
            except Exception:
                continue
    out['fontSpecs'] = specs
    out['fontWeights'] = weights
    # icon
    if os.path.exists(ICON):
        im_ = Image.open(ICON).convert('RGBA'); im_.thumbnail((256, 256))
        im_.save(os.path.join(ROOT, 'assets', 'designer-os-icon.webp'), 'WEBP', quality=85)
        out['icon'] = 'assets/designer-os-icon.webp'
    json.dump(out, open(os.path.join(ROOT, 'data', 'designer-os.json'), 'w'), ensure_ascii=False, indent=1)
    print({k: (len(v) if isinstance(v, list) else '') for k, v in out.items()})
    print('fonts', len(specs), 'missing', set(fams) - {s.split(':')[0] for s in specs})
    print('no latin-ext', [k[:-9] for k, v in weights.items() if k.endswith('_latinExt') and not v])


if __name__ == '__main__':
    main()
