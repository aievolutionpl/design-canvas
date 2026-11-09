"""Integration acceptance: real browser ZIP -> CLI -> real exported files."""
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import zipfile
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = sys.argv[1].rstrip('/') + '/'
EVIDENCE = ROOT / 'evidence/workspace-integration'
EVIDENCE.mkdir(parents=True, exist_ok=True)


def cli(*args):
    result = subprocess.run(['node', str(ROOT/'tools/design-cli.mjs'), *map(str,args)], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    return result.stdout


with sync_playwright() as p, tempfile.TemporaryDirectory(prefix='design-integration-') as tmp:
    tmp = Path(tmp)
    browser = p.chromium.launch()
    errors = []
    page = browser.new_page(viewport={'width':1440, 'height':1000}, accept_downloads=True)
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.goto(BASE+'kit.html',wait_until='domcontentloaded')
    page.wait_for_function("document.querySelector('#style').options.length > 1")
    page.locator('#name').fill('Zestaw integracyjny')
    page.locator('#headline').fill('Zażółć gęślą jaźń — projekt testowy')
    for kind in ['icons','patterns','gradients','components']:
        page.locator('#asset-type').select_option(kind)
        page.locator('#add-asset').click()
    before = page.evaluate('DesignKit.get()')
    assert len(before['assets']) == 4
    with page.expect_download() as info:
        page.locator('#export').click()
    download = info.value
    zipped = tmp/'kit.zip'
    download.save_as(zipped)
    with zipfile.ZipFile(zipped) as z:
        assert z.testzip() is None
        names = z.namelist()
        assert all(not n.startswith('/') and '..' not in Path(n).parts for n in names)
        assert {'brief.md','tokens.css','provenance.json'}.issubset(names)
        project = 'project.json' if 'project.json' in names else 'kit.json'
        kit = json.loads(z.read(project))
        assert kit == before
        assert any(n.endswith('.svg') for n in names)
        assert any(n.endswith('.html') for n in names)
        assert '[object Object]' not in '\n'.join(z.read(n).decode() for n in names if n.endswith('.css'))
        (tmp/'project.json').write_bytes(z.read(project))
    cli('kit','validate',tmp/'project.json')
    cli('kit','export',tmp/'project.json','--out',tmp/'cli-export')
    assert (tmp/'cli-export/tokens.css').is_file()
    assert list((tmp/'cli-export').rglob('*.svg'))
    assert list((tmp/'cli-export').rglob('*.html'))
    page.reload(wait_until='domcontentloaded')
    page.wait_for_function("document.querySelector('#style').options.length > 1")
    assert page.evaluate('DesignKit.get()') == before
    page.locator('#name').fill('<img src=x onerror=window.__xss=1>')
    assert page.evaluate('window.__xss || null') is None
    assert page.locator('.mock-brand img').count() == 0
    page.locator('#name').fill(before['name'])
    # Shared navigation must retain selected state into the actual composer.
    page.goto(BASE+'studio.html',wait_until='domcontentloaded')
    page.wait_for_selector('[data-open]')
    selected = page.locator('[data-open]').nth(1).get_attribute('data-open')
    page.locator('[data-open]').nth(1).click()
    page.locator('#select-style').click()
    page.goto(BASE+'kit.html',wait_until='domcontentloaded')
    page.wait_for_function("document.querySelector('#style').options.length > 1")
    assert page.locator('#style').input_value() == selected
    page.screenshot(path=str(EVIDENCE/'kit-desktop.png'),full_page=True)
    assert not errors, errors
    browser.close()
    report={'status':'PASS','scope':'Browser ZIP integrity, selected actual SVG/pattern/gradient/component, JSON-to-CLI validation/export, persistence, inert user text, shared style selection','assets':before['assets'],'zipEntries':names,'pageErrors':errors}
    (EVIDENCE/'result.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(json.dumps(report,ensure_ascii=False))
