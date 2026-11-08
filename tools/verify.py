"""Acceptance check (no writes) — library, Brand Boards and Asset Library, desktop + phone."""
import sys
from playwright.sync_api import sync_playwright
U = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8944/"
fail = []

def need(label, cond):
    if not cond:
        fail.append(label)

OVF = """()=>{let n=0;for(const b of BB.boards){if(!b.full)continue;
 for(const t of b.el.querySelectorAll('.t,.spec,.hier,.dt,.stripes,.ratio,.ramp')){const R=t.getBoundingClientRect();
  for(const e of t.querySelectorAll('*')){if(![...e.childNodes].some(x=>x.nodeType==3&&x.textContent.trim()))continue;const r=e.getBoundingClientRect();
   if(r.right>R.right+2||r.bottom>R.bottom+2||r.left<R.left-2||(e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflow!='visible'))n++;}}}return n}"""

with sync_playwright() as p:
    br = p.chromium.launch()
    for name, vp in [("desktop", {"width": 1440, "height": 900}), ("phone", {"width": 390, "height": 844})]:
        pg = br.new_page(viewport=vp, has_touch=name == "phone")
        errs = []
        pg.on("pageerror", lambda e: errs.append(str(e)))
        pg.on("response", lambda r: r.status >= 400 and errs.append(f"{r.status} {r.url}"))

        pg.goto(U, wait_until="load"); pg.wait_for_selector("body[data-ready='1']", timeout=60000)
        c = pg.evaluate("DC.counts()")
        need(f"{name} library counts {c}", c["dosPalettes"] == 14 and c["styles"] == 48 and c["fonts"] == 129 and c["backgrounds"] == 24 and c["palettes"] == 50)
        need(f"{name} library h-scroll", not pg.evaluate("document.documentElement.scrollWidth>innerWidth+2"))
        need(f"{name} library assets link", pg.evaluate("!!document.querySelector('a[href=\"assets.html\"]')"))

        pg.goto(U + "boards.html", wait_until="load"); pg.wait_for_selector("body[data-ready='1']", timeout=60000)
        k = pg.evaluate("BB.count()")
        need(f"{name} boards counts {k}", (k["boards"], k["dos"], k["lg"], k["adt"], k["dt"], k["stops"], k["icons"]) == (62, 14, 1, 17, 30, 620, 50))
        need(f"{name} hud hidden", pg.evaluate("getComputedStyle(document.getElementById('hud')).display") == "none")
        if name == "desktop":
            for bid in ["DOS-01", "ADT-03", "DT27-07"]:
                pg.evaluate(f"BB.flyTo(BB.boards.find(b=>b.T.id=='{bid}'),.02,true)"); pg.wait_for_timeout(900)
                need(f"{bid} 9 sections", pg.evaluate(f"BB.boards.find(b=>b.T.id=='{bid}').el.querySelectorAll('.sec').length") == 9)
                need(f"{bid} icons rendered", pg.evaluate(f"BB.boards.find(b=>b.T.id=='{bid}').el.querySelectorAll('.icb svg').length") >= 12)
            for bid in pg.evaluate("BB.boards.map(b=>b.T.id)"):
                pg.evaluate(f"BB.flyTo(BB.boards.find(b=>b.T.id=='{bid}'),.02,true)"); pg.wait_for_timeout(140)
            pg.wait_for_timeout(2500)
            need(f"boards text overflow {pg.evaluate(OVF)}", pg.evaluate(OVF) == 0)
            pg.evaluate("document.querySelector('.bar').style.display='none'")
            pg.evaluate("BB.flyTo(BB.boards.find(b=>b.T.id=='DT27-07'),.02,true)"); pg.wait_for_timeout(900)
            box = pg.locator('[data-fav="DT27-07"]').bounding_box()
            pg.mouse.click(box["x"] + box["width"] / 2, box["y"] + box["height"] / 2); pg.wait_for_timeout(300)
            need("fav click", pg.inner_text("#favN") == "1")
            pg.keyboard.press("p"); pg.wait_for_timeout(300); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(300)
            need("presentation", "/ 620" in pg.inner_text("#hudT"))

        pg.goto(U + "assets.html", wait_until="load"); pg.wait_for_selector("body[data-ready='1']", timeout=90000)
        pg.wait_for_timeout(800)
        a = pg.evaluate("""({icons:document.querySelectorAll('.ic').length-24,fonts:document.querySelectorAll('.fo').length,
          pals:document.querySelectorAll('.pal').length,comps:document.querySelectorAll('.cmp').length,
          pats:document.querySelectorAll('.pat').length,grads:document.querySelectorAll('#gradienty .gr').length,
          secs:[...document.querySelectorAll('.sec h2')].map(h=>h.textContent)})""")
        need(f"{name} assets icons {a['icons']}", a["icons"] == 698)
        need(f"{name} assets fonts {a['fonts']}", a["fonts"] == 129)
        need(f"{name} assets palettes {a['pals']}", a["pals"] == 77)
        need(f"{name} assets components {a['comps']}", a["comps"] == 90)
        need(f"{name} assets patterns {a['pats']}", a["pats"] == 87)
        need(f"{name} assets gradients {a['grads']}", a["grads"] == 30)
        need(f"{name} assets sections {a['secs']}", len(a["secs"]) == 13)
        need(f"{name} assets h-scroll", not pg.evaluate("document.documentElement.scrollWidth>innerWidth+2"))
        need(f"{name} liquid card glass", pg.evaluate("document.querySelectorAll('#liquid .lq').length") == 6)

        pg.goto(U + "liquid.html", wait_until="load"); pg.wait_for_selector("body[data-ready='1']", timeout=60000)
        pg.wait_for_timeout(900)
        lq = pg.evaluate("({glass:document.querySelectorAll('.lq').length, filters:document.querySelectorAll('svg filter').length, bf:getComputedStyle(document.querySelector('.lq-lens')).backdropFilter||''})")
        need(f"{name} liquid glass {lq['glass']}", lq["glass"] == 8)
        need(f"{name} liquid filters {lq['filters']}", lq["filters"] == 8)
        need(f"{name} liquid backdrop url", "url(" in lq["bf"])
        need(f"{name} liquid h-scroll", not pg.evaluate("document.documentElement.scrollWidth>innerWidth+2"))
        need(f"{name} errors {errs[:3]}", not errs)
    br.close()

print("FAIL", fail) if fail else print("PASS")
sys.exit(1 if fail else 0)
