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
