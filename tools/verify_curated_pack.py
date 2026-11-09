"""Curated pack acceptance: python3 tools/verify_curated_pack.py BASE_URL."""
import json
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
BASE = sys.argv[1].rstrip('/') + '/'
styles = json.loads((ROOT / 'data/styles.json').read_text())
data = json.loads((ROOT / 'data/assets.json').read_text())
curated = [x for x in styles if x['source'] == 'daisyui']
icons = {lib: [x for x in data['icons'] if x['lib'] == lib] for lib in ('svg-spinners', 'boring-avatars')}
assert curated and all(icons.values()), 'Curated data not present; run after data worker finishes'
assert all(x['id'].startswith('DAISY-') for x in curated)

with sync_playwright() as pw, tempfile.TemporaryDirectory(prefix='curated-') as td:
    tmp = Path(td)
    browser = pw.chromium.launch()
    for width in (390, 768, 1440):
        page = browser.new_page(viewport={'width': width, 'height': 900}, accept_downloads=True, reduced_motion='reduce')
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        def check():
            assert not page.evaluate('document.documentElement.scrollWidth > innerWidth + 1'), (width, page.url, 'overflow')
            assert not errors, errors
        page.goto(BASE + 'studio.html', wait_until='domcontentloaded')
        page.wait_for_selector('[data-open]')
        page.locator('#source').select_option('daisyui')
        assert page.locator('[data-open]').count() == len(curated)
        for style in curated:
            page.locator('#search').fill(style['id'])
            assert page.locator('[data-open]').count() == 1
            assert page.locator('[data-open]').get_attribute('data-open') == style['id']
        page.locator('[data-open]').click()
        page.locator('#select-style').click()
        check()
        page.goto(BASE + 'boards.html', wait_until='domcontentloaded')
        page.wait_for_function('window.BB && BB.boards.length')
        for style in curated:
            assert page.evaluate('(id) => BB.boards.some(b => b.T.id === id && b.T.grp === "daisy")', style['id'])
        check()
        page.goto(BASE + 'index.html?canvas=1', wait_until='domcontentloaded')
        page.wait_for_function('window.DC && DC.boards.length')
        for style in curated:
            assert page.evaluate('(id) => DC.boards.some(b => b.st && b.st.id === id)', style['id'])
        check()
        page.goto(BASE + 'assets.html', wait_until='domcontentloaded')
        page.wait_for_selector('.ic')
        for lib, entries in icons.items():
            page.locator(f'[data-lib="{lib}"].chip').click()
            assert page.locator(f'.ic[data-lib="{lib}"]:visible').count() == len(entries)
            card = page.locator(f'.ic[data-lib="{lib}"]').first
            if lib == 'svg-spinners':
                assert card.locator('img').count() == 0
                toggle = card.locator('..').locator('.spinner-toggle')
                toggle.click()
                assert toggle.get_attribute('aria-pressed') == 'true'
                assert card.locator('img').count() == 1
                first = card.locator('img').screenshot()
                page.wait_for_timeout(250)
                second = card.locator('img').screenshot()
                assert first != second, 'Spinner SVG did not animate'
                toggle.click()
                assert card.locator('img').count() == 0
            else:
                assert card.locator('img').evaluate('(e) => e.getBoundingClientRect().width') >= 48
                card.locator('img').scroll_into_view_if_needed()
                page.wait_for_function('(s) => {const e=document.querySelector(s); return e && e.complete && e.naturalWidth>0}', arg=f'.ic[data-lib="{lib}"] img')
            card.locator('..').locator('.kit-add').click()
        check()
        page.goto(BASE + 'kit.html', wait_until='domcontentloaded')
        page.wait_for_function("document.querySelector('#style').options.length > 1")
        chosen = page.evaluate('DesignKit.get()')
        with page.expect_download() as info:
            page.locator('#export').click()
        archive = tmp / f'kit-{width}.zip'
        info.value.save_as(archive)
        with zipfile.ZipFile(archive) as z:
            assert z.testzip() is None
            project = json.loads(z.read('project.json'))
            assert project == chosen
            prov = json.loads(z.read('provenance.json'))
            assert prov['style']['source'] == 'daisyui'
            for lib, entries in icons.items():
                item = entries[0]
                asset_id = lib + ':' + item['name']
                idx = next(i for i, a in enumerate(project['assets']) if a['id'] == asset_id)
                name = f"assets/{idx + 1}-icons-{asset_id.replace(':', '-')}.svg"
                assert z.read(name) == (ROOT / item['src']).read_bytes()
                record = next(a for a in prov['assets'] if a['id'] == asset_id)
                assert record['record']['src'] == item['src']
                assert any(lib.replace('-', ' ') in json.dumps(x).lower().replace('-', ' ') for x in prov['licenseReferences'])
            (tmp / 'project.json').write_bytes(z.read('project.json'))
        for args in (['kit', 'validate', str(tmp / 'project.json')], ['kit', 'export', str(tmp / 'project.json'), '--out', str(tmp / f'cli-{width}')]):
            result = subprocess.run(['node', str(ROOT / 'tools/design-cli.mjs'), *args], capture_output=True, text=True)
            assert result.returncode == 0, result.stderr
        for lib, entries in icons.items():
            item = entries[0]
            assert (tmp / f'cli-{width}' / item['src']).read_bytes() == (ROOT / item['src']).read_bytes()
        cli_prov = json.loads((tmp / f'cli-{width}' / 'provenance.json').read_text())
        assert cli_prov['style']['source'] == 'daisyui'
        for lib, entries in icons.items():
            assert lib + ':' + entries[0]['name'] in json.dumps(cli_prov)
        check()
        print(json.dumps({'width': width, 'styles': len(curated), 'icons': {k: len(v) for k, v in icons.items()}, 'pageErrors': errors, 'status': 'PASS'}))
        page.close()
    browser.close()
