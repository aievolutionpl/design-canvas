"""Acceptance check (no writes): library + Brand Boards, desktop & phone, against a running server."""
import sys
from playwright.sync_api import sync_playwright
U = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8931/"
fail = []
need = lambda label, cond: cond or fail.append(label)
OVF = """()=>{let n=0;for(const b of BB.boards){if(!b.full)continue;for(const t of b.el.querySelectorAll('.t,.spec,.hier')){const R=t.getBoundingClientRect();
 for(const e of t.querySelectorAll('*')){if(![...e.childNodes].some(x=>x.nodeType==3&&x.textContent.trim()))continue;const r=e.getBoundingClientRect();
 if(r.right>R.right+2||r.bottom>R.bottom+2||(e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflow!='visible'))n++;}}}return n}"""
with sync_playwright() as p:
    br = p.chromium.launch()
    for name, vp in [("desktop", {"width": 1440, "height": 900}), ("phone", {"width": 390, "height": 844})]:
        pg = br.new_page(viewport=vp, has_touch=name == "phone"); errs = []
        pg.on("pageerror", lambda e: errs.append(str(e))); pg.on("response", lambda r: r.status >= 400 and errs.append(f"{r.status} {r.url}"))
        pg.goto(U, wait_until="networkidle"); pg.wait_for_selector("body[data-ready='1']")
        c = pg.evaluate("DC.counts()")
        need(f"{name} library counts {c}", c["dosPalettes"] == 14 and c["styles"] == 47 and c["fonts"] == 45 and c["backgrounds"] == 24)
        need(f"{name} library no h-scroll", not pg.evaluate("document.documentElement.scrollWidth>innerWidth"))
        pg.goto(U + "boards.html", wait_until="networkidle"); pg.wait_for_selector("body[data-ready='1']")
        k = pg.evaluate("BB.count()")
        need(f"{name} boards counts {k}", (k["boards"], k["dos"], k["adt"], k["dt"], k["stops"]) == (61, 14, 17, 30, 427))
        need(f"{name} hud hidden", pg.evaluate("getComputedStyle(document.getElementById('hud')).display") == "none")
        if name == "desktop":
            for bid in ["DOS-01", "ADT-03", "DT27-07"]:
                pg.evaluate(f"BB.flyTo(BB.boards.find(b=>b.T.id=='{bid}'),.02,true)"); pg.wait_for_timeout(1200)
                need(f"{bid} rendered 6 sections", pg.evaluate(f"BB.boards.find(b=>b.T.id=='{bid}').el.querySelectorAll('.sec').length") == 6)
            pg.evaluate("document.fonts.ready"); pg.wait_for_timeout(1500)
            need(f"text overflow {pg.evaluate(OVF)}", pg.evaluate(OVF) == 0)
            box = pg.locator('[data-fav="DT27-07"]').bounding_box(); pg.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2); pg.wait_for_timeout(300)
            need("fav click", pg.inner_text("#favN") == "1")
            pg.keyboard.press("p"); pg.wait_for_timeout(300); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(300)
            need("presentation", "/ 427" in pg.inner_text("#hudT"))
        need(f"{name} errors {errs[:3]}", not errs)
    br.close()
print("FAIL", fail) if fail else print("PASS")
sys.exit(1 if fail else 0)
