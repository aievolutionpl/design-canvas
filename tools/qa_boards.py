import json,sys
from playwright.sync_api import sync_playwright
URL=(sys.argv[1] if len(sys.argv)>1 else "http://127.0.0.1:8931/")+"boards.html"
out={}
with sync_playwright() as p:
    b=p.chromium.launch()
    for name,vp in [("desktop",{"width":1600,"height":1000}),("phone",{"width":390,"height":844})]:
        pg=b.new_page(viewport=vp,has_touch=(name=="phone"))
        errs=[]; pg.on("console",lambda m: m.type=="error" and errs.append(m.text)); pg.on("pageerror",lambda e: errs.append(str(e)))
        pg.on("response",lambda r: r.status>=400 and errs.append(f"{r.status} {r.url}"))
        pg.goto(URL,wait_until="networkidle"); pg.wait_for_selector("body[data-ready='1']"); pg.wait_for_timeout(2500)
        pg.screenshot(path=f"evidence/boards-{name}-overview.png")
        r={"count":pg.evaluate("BB.count()"),"hscroll":pg.evaluate("document.documentElement.scrollWidth>innerWidth")}
        if name=="desktop":
            for i,bid in enumerate(["DOS-01","ADT-05","DT27-07"]):
                pg.evaluate(f"(()=>{{const b=BB.boards.find(b=>b.T.id=='{bid}');BB.flyTo(b,.02,true)}})()"); pg.wait_for_timeout(3500)
                pg.screenshot(path=f"evidence/boards-{bid}.png")
            # zoom into mockups of DT27-07
            pg.evaluate("(()=>{const b=BB.boards.find(b=>b.T.id=='DT27-07');BB.flyTo({x:b.x,y:b.y+1320,w:2340,h:1000},.02,true)})()"); pg.wait_for_timeout(2500); pg.screenshot(path="evidence/boards-mockups.png")
            pg.evaluate("(()=>{const b=BB.boards.find(b=>b.T.id=='ADT-05');BB.flyTo({x:b.x,y:b.y+2380,w:3400,h:740},.02,true)})()"); pg.wait_for_timeout(2500); pg.screenshot(path="evidence/boards-slides.png")
            # real fav click on visible board header
            pg.evaluate("(()=>{const b=BB.boards.find(b=>b.T.id=='DOS-03');BB.flyTo(b,.02,true)})()"); pg.wait_for_timeout(2500)
            box=pg.locator('[data-fav="DOS-03"]').bounding_box(); pg.mouse.click(box["x"]+box["width"]/2,box["y"]+box["height"]/2); pg.wait_for_timeout(400)
            r["fav"]=pg.inner_text("#favN")
            pg.keyboard.press("p"); pg.wait_for_timeout(900); pg.keyboard.press("ArrowRight"); pg.wait_for_timeout(900); r["pres"]=pg.inner_text("#hudT")
            pg.screenshot(path="evidence/boards-pres.png")
            r["fullAfter"]=pg.evaluate("BB.count().full")
        r["errors"]=errs[:8]; out[name]=r
    b.close()
print(json.dumps(out,ensure_ascii=False,indent=1))
