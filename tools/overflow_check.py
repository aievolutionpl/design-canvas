import json,sys
from playwright.sync_api import sync_playwright
URL=(sys.argv[1] if len(sys.argv)>1 else "http://127.0.0.1:8931/")+"boards.html"
JS="""()=>{const out=[];for(const b of BB.boards){if(!b.full)continue;
 for(const t of b.el.querySelectorAll('.t,.spec,.hier,.pill,.stripes button,.ratio div')){const R=t.getBoundingClientRect();
  for(const e of t.querySelectorAll('*')){if(!e.childNodes.length||![...e.childNodes].some(n=>n.nodeType==3&&n.textContent.trim()))continue;
   const r=e.getBoundingClientRect(); const tol=2;
   const over=r.right>R.right+tol||r.bottom>R.bottom+tol||r.left<R.left-tol||e.scrollWidth>e.clientWidth+2&&getComputedStyle(e).overflow!='visible';
   if(over) out.push(b.T.id+' | '+(t.className||t.tagName)+' | '+e.tagName+'.'+e.className+' | '+e.textContent.trim().slice(0,40)+' | dx='+Math.round((r.right-R.right)/BB_s())+' dy='+Math.round((r.bottom-R.bottom)/BB_s()));}}}
 return out}"""
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={"width":1600,"height":1000})
    pg.goto(URL,wait_until="networkidle"); pg.wait_for_selector("body[data-ready='1']")
    pg.evaluate("window.BB_s=()=>{const m=getComputedStyle(document.getElementById('world')).transform.match(/matrix\\(([^,]+)/);return m?+m[1]:1}")
    pg.evaluate("BB.boards.forEach(b=>{b.el.innerHTML='';})")
    # force render all boards full
    pg.evaluate("(()=>{const bs=BB.boards;for(const b of bs){BB.flyTo(b,.02,true);}})()")
    pg.wait_for_timeout(500)
    ids=pg.evaluate("BB.boards.map(b=>b.T.id)")
    issues=[]
    for i in ids:
        pg.evaluate(f"(()=>{{const b=BB.boards.find(b=>b.T.id=='{i}');BB.flyTo(b,.02,true)}})()"); pg.wait_for_timeout(250)
    pg.wait_for_timeout(3000)  # fonts
    res=pg.evaluate(JS)
    print(len(res)); 
    from collections import Counter
    c=Counter(r.split(' | ')[1]+' | '+r.split(' | ')[2] for r in res); print(c.most_common(30))
    for r in res[:40]: print(r)
    b.close()
