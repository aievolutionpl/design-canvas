import json,sys
from playwright.sync_api import sync_playwright
URL=sys.argv[1] if len(sys.argv)>1 else "http://localhost:8765/"
out={}
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,vp in [("desktop",{"width":1440,"height":900}),("phone",{"width":390,"height":844})]:
        pg=b.new_page(viewport=vp, has_touch=(name=="phone"))
        errs=[]; pg.on("console",lambda m: m.type=="error" and errs.append(m.text)); pg.on("pageerror",lambda e: errs.append(str(e)))
        pg.goto(URL,wait_until="networkidle"); pg.wait_for_timeout(2500)
        r=pg.evaluate("""()=>({artboards:document.querySelectorAll('[data-board],.artboard,.frame').length,
          sections:[...document.querySelectorAll('#sections li')].map(l=>l.textContent.trim()),
          dos:document.querySelectorAll('[class*=dos]').length, world:document.getElementById('world').children.length,
          zoom:document.getElementById('zVal').textContent, counts: window.DC&&DC.counts(), boards: window.DC&&DC.boards.length, pres: window.DC&&DC.presList.length, hscroll:document.documentElement.scrollWidth>innerWidth})""")
        pg.screenshot(path=f"evidence/{name}-overview.png")
        if name=="desktop":
            pg.click("#zIn"); pg.wait_for_timeout(400); r["zoomAfterIn"]=pg.locator("#zVal").inner_text()
            pg.evaluate("document.querySelector('[data-fav]').click()"); pg.wait_for_timeout(300)
            r["favCount"]=pg.locator("#favCount").inner_text()
            sec=pg.locator("#sections li").first
            if sec.count(): sec.click(); pg.wait_for_timeout(1500); pg.screenshot(path="evidence/desktop-section1.png")
            pg.keyboard.press("p"); pg.wait_for_timeout(1200); r["presHud"]=pg.locator("#presInfo").inner_text(); pg.screenshot(path="evidence/desktop-pres1.png")
            for i in range(3): pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(900)
            r["presAfter3"]=pg.locator("#presInfo").inner_text(); pg.screenshot(path="evidence/desktop-pres4.png")
        r["errors"]=errs[:10]; out[name]=r
    b.close()
print(json.dumps(out,ensure_ascii=False,indent=1))
