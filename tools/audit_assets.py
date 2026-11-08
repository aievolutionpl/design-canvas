#!/usr/bin/env python3
"""Browser regression audit; serve the repository and set ASSET_URL if needed.
Run: PYTHONPATH= /usr/bin/python3.12 tools/audit_assets.py
"""
import json, os, pathlib
from playwright.sync_api import sync_playwright

BASE = os.environ.get('ASSET_URL', 'http://127.0.0.1:8974/assets.html')
OUT = pathlib.Path(__file__).resolve().parents[1] / 'evidence' / 'audit-assets'
OUT.mkdir(parents=True, exist_ok=True)
results, failures = [], []
def check(name, condition, detail=None):
    results.append({'test': name, 'pass': bool(condition), 'detail': detail})
    if not condition: failures.append(name)

with sync_playwright() as pw:
    browser = pw.chromium.launch(headless=True)
    for width in (390, 768, 1440):
        context = browser.new_context(viewport={'width': width, 'height': 900})
        page = context.new_page(); errors=[]; missing=[]
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.on('response', lambda r: missing.append(f'{r.status} {r.url}') if r.status >= 400 else None)
        page.goto(BASE, wait_until='domcontentloaded'); page.wait_for_selector('body[data-ready="1"]', timeout=30000)
        page.evaluate("Object.defineProperty(navigator, 'clipboard', {value:{writeText:async text => window.__clip=text}, configurable:true})")
        page.screenshot(path=str(OUT / f'viewport-{width}.png'))
        data=page.evaluate('''() => ({overflow:document.documentElement.scrollWidth-innerWidth,
            gradients:[...document.querySelectorAll('#gradienty .gr')].map(e=>getComputedStyle(e).backgroundImage),
            shadow:getComputedStyle(document.querySelector('.tok .sw')).boxShadow,
            links:[...document.querySelectorAll('#nav a')].map(a=>({href:a.getAttribute('href'),exists:!!document.querySelector(a.getAttribute('href'))})),
            icons:[...document.querySelectorAll('#ikony img')].filter(e=>e.complete&&!e.naturalWidth).length})''')
        check(f'{width}: no horizontal overflow', data['overflow']==0, data['overflow'])
        check(f'{width}: all gradient images visible', len(data['gradients'])>0 and all(x!='none' for x in data['gradients']),len(data['gradients']))
        check(f'{width}: shadow resolves',data['shadow']!='none',data['shadow'])
        check(f'{width}: section targets',len(data['links'])>0 and all(x['exists'] for x in data['links']),data['links'])
        check(f'{width}: loaded images',data['icons']==0,data['icons'])
        # Every section link must be clickable and navigate to the right fragment.
        for link in data['links']:
            page.locator('#nav a').filter(has=page.locator('i')).count() # keep real sidebar in flow
            a=page.locator('#nav a[href="'+link['href']+'"]'); a.scroll_into_view_if_needed(); a.click(); page.wait_for_timeout(80)
            check(f"{width}: link {link['href']}",page.evaluate('location.hash')==link['href'])
        page.locator('#q').fill('arrow'); n=page.locator('#ikony .ic:visible').count()
        page.locator('#ikony .chip[data-lib="lucide"]').click(); filtered=page.locator('#ikony .ic:visible').count()
        page.locator('#q').fill(''); after=page.locator('#ikony .ic:visible').count()
        check(f'{width}: search intersects filter and clears',n>0 and 0<filtered<=n and after>=filtered,{'search':n,'intersection':filtered,'cleared':after})
        check(f'{width}: all sections restored',page.locator('#sections > .sec:visible').count()==len(data['links']))
        page.locator('#ikony .chip[data-lib="all"]').click()
        page.locator('#gradienty .gr').first.click(); gradient=page.evaluate('window.__clip')
        page.locator('#wzory .pat').first.click(); pattern=page.evaluate('window.__clip')
        page.locator('#ikony .ic').first.click(); page.wait_for_function("window.__clip.includes('<svg')"); svg=page.evaluate('window.__clip')
        page.locator('#tokeny .tok').first.click(); shadow=page.evaluate('window.__clip')
        page.locator('#fonty .fo').first.click(); font=page.evaluate('window.__clip')
        page.locator('#ui .copy-component').first.click(); component=page.evaluate('window.__clip')
        page.locator('#efekty .eff').nth(1).click(); effect=page.evaluate('window.__clip')
        frame=page.frame_locator('iframe#audit') if False else None
        isolated=context.new_page(); isolated.set_content('<div id="g" style="width:100px;height:100px"></div><div id="p" style="width:100px;height:100px"></div><div id="s" style="width:100px;height:100px"></div><div id="i"></div>')
        isolation=isolated.evaluate('''({gradient,pattern,svg,shadow}) => {let g=document.querySelector('#g'),p=document.querySelector('#p'),s=document.querySelector('#s');g.style.cssText+=gradient;p.style.cssText+=pattern;s.style.cssText+=shadow;document.querySelector('#i').innerHTML=svg;return {gradient:getComputedStyle(g).backgroundImage,pattern:getComputedStyle(p).backgroundImage,shadow:getComputedStyle(s).boxShadow,svg:!!document.querySelector('#i svg'),color:getComputedStyle(document.querySelector('#i svg')).color}}''',{'gradient':gradient,'pattern':pattern,'svg':svg,'shadow':shadow})
        check(f'{width}: isolated copied gradient',isolation['gradient']!='none',isolation['gradient'])
        check(f'{width}: isolated copied pattern',isolation['pattern']!='none',isolation['pattern'][:100])
        check(f'{width}: isolated copied shadow',isolation['shadow']!='none',isolation['shadow'])
        check(f'{width}: isolated copied SVG',isolation['svg'] and isolation['color']!='rgba(0, 0, 0, 0)',isolation['color'])
        check(f'{width}: font import and family', '@import' in font and 'font-family:' in font,font)
        isolated.set_content(component); check(f'{width}: component has applied CSS',isolated.locator('.u-btn').count()>0 and isolated.locator('.u-btn').first.evaluate("e=>getComputedStyle(e).backgroundColor")!='rgba(0, 0, 0, 0)')
        isolated.set_content(effect); check(f'{width}: effect has applied CSS',isolated.locator('.eff-spot').evaluate("e=>getComputedStyle(e).backgroundImage")!='none')
        effect_checks=[]
        for idx in range(page.locator('#efekty .eff').count()):
            page.locator('#efekty .eff').nth(idx).click(); payload=page.evaluate('window.__clip'); isolated.set_content(payload)
            visual=isolated.locator('div').last
            effect_checks.append(visual.evaluate("e=>{let s=getComputedStyle(e),p=getComputedStyle(e,':before');return s.backgroundImage!=='none'||s.backgroundColor!=='rgba(0, 0, 0, 0)'||p.backgroundImage!=='none'||p.backgroundColor!=='rgba(0, 0, 0, 0)'}"))
        check(f'{width}: each copied effect renders',all(effect_checks),effect_checks)
        page.locator('#gradienty .gr').first.focus(); page.keyboard.press('Enter')
        check(f'{width}: keyboard Enter copies',page.evaluate("window.__clip.startsWith('background-image:')"))
        page.locator('#theme').click(); check(f'{width}: dark icons visible',page.locator('#ikony img').first.evaluate("e=>getComputedStyle(e).filter")!='none')
        page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:async()=>{throw Error('denied')}},configurable:true});document.execCommand=()=>false")
        page.locator('#gradienty .gr').first.click(); check(f'{width}: clipboard denial reported', 'Nie udało się' in page.locator('#toast').inner_text())
        check(f'{width}: no JS errors',not errors,errors)
        check(f'{width}: no HTTP failures',not missing,missing[:20]); context.close()
    browser.close()
(OUT/'results.json').write_text(json.dumps({'results':results,'failures':failures},ensure_ascii=False,indent=2))
print(json.dumps({'checks':len(results),'failures':failures},ensure_ascii=False,indent=2))
raise SystemExit(bool(failures))
