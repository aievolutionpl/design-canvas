"""Repeatable responsive composer regression; BASE_URL required."""
import json
from pathlib import Path
import sys
from playwright.sync_api import sync_playwright
base=sys.argv[1].rstrip('/')+'/'
out=Path(__file__).resolve().parents[1]/'evidence/kit'
out.mkdir(parents=True,exist_ok=True)
results=[]
with sync_playwright() as pw:
    browser=pw.chromium.launch()
    for width in [390,768,1440]:
        page=browser.new_page(viewport={'width':width,'height':900})
        errors=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        if width==390:
            page.goto(base+'assets.html',wait_until='domcontentloaded')
            page.wait_for_selector('[aria-label="Kopiuj CSS palety Ocean Teal"]')
            page.evaluate("Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedPalette=text}},configurable:true})")
            page.locator('[aria-label="Kopiuj CSS palety Ocean Teal"]').click()
            assert '--palette-1: #05161A;' in page.evaluate('window.copiedPalette')
            page.locator('[aria-label="Kopiuj HEX palety Ocean Teal"]').click()
            assert len(page.evaluate('window.copiedPalette').split(', '))==6
        page.goto(base+'kit.html',wait_until='domcontentloaded')
        page.wait_for_function("document.querySelector('#style').options.length>1")
        page.locator('#headline').fill('Zażółć gęślą jaźń')
        assert page.locator('.mock h3').first.inner_text()=='Zażółć gęślą jaźń'
        page.locator('#accent').fill('#000000')
        page.locator('#accent').dispatch_event('input')
        assert '21.00' in page.locator('#contrast').inner_text()
        page.locator('#viewport').select_option('mobile')
        assert page.locator('.mock.mobile').count() == 3
        assert page.locator('.preview-wrap').count()>=2
        native=page.locator('.mock').evaluate_all('(nodes)=>nodes.map(n=>({font:getComputedStyle(n).fontFamily,bg:getComputedStyle(n).backgroundColor,radius:getComputedStyle(n).borderRadius}))')
        assert len({json.dumps(x,sort_keys=True) for x in native})>1, 'Previews must differ beyond labels'
        assert not page.evaluate('document.documentElement.scrollWidth>innerWidth+1')
        for name in ['Ocean Teal','Violet Glow','Forest Mint','Berry Rose','Graphite']:
            page.locator('#palette').select_option(name)
            assert page.locator('#palette-swatches button').count()==6
            page.locator('#palette-swatches button').last.click()
            chosen=page.locator('#palette-swatches button').last.inner_text()
            assert page.evaluate('DesignKit.get().accent').upper()==chosen
            values=page.locator('.mock').first.evaluate("n=>[getComputedStyle(n).backgroundColor,getComputedStyle(n).color]")
            def lum(rgb):
                import re
                channels=[int(v)/255 for v in re.findall(r'\d+',rgb)[:3]]
                channels=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in channels]
                return sum(v*w for v,w in zip(channels,[.2126,.7152,.0722]))
            a,b=map(lum,values)
            assert (max(a,b)+.05)/(min(a,b)+.05)>=4.5, (name,values)
        page.locator('#palette').select_option('Berry Rose')
        assert '#243A66' in page.locator('#palette-note').inner_text()
        before=page.evaluate('DesignKit.get()')
        page.reload(wait_until='domcontentloaded')
        page.wait_for_function("document.querySelector('#style').options.length>1")
        assert page.evaluate('DesignKit.get()')==before
        assert not errors,errors
        page.screenshot(path=str(out/f'kit-{width}.png'),full_page=True)
        results.append({'width':width,'status':'PASS','pageErrors':errors})
        page.close()
    browser.close()
(out/'results.json').write_text(json.dumps(results,indent=2))
print(json.dumps(results))
