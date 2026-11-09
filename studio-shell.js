(() => {
  const key='aievolution.design-studio.favourites.v1', old=['dc-favs','bb-favs'];
  const read=k=>{try{const x=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(x)?x.filter(v=>typeof v==='string'):[]}catch(_){return []}};
  const merged=[...new Set([key,...old].flatMap(read).map(x=>x.startsWith('style:')?x.slice(6):x))];
  try {localStorage.setItem(key,JSON.stringify(merged)); old.forEach(k=>localStorage.removeItem(k));}catch(_){}
  window.DesignFavourites={key,read:()=>new Set(read(key)),save:s=>localStorage.setItem(key,JSON.stringify([...s]))};
  const links=[['studio','studio.html','Studio'],['canvas','index.html?canvas=1','Kanwa'],['boards','boards.html','Tablice'],['assets','assets.html','Assety'],['liquid','liquid.html','Glass'],['kit','kit.html','Mój zestaw']];
  document.querySelectorAll('[data-studio-shell]').forEach(root=>{
    root.classList.add('studio-shell'); root.innerHTML='<div class="studio-shell__inner"><a class="studio-shell__brand" href="studio.html">AI Evolution <span>Polska</span></a><nav class="studio-shell__nav" aria-label="Nawigacja Design Studio"></nav><form class="studio-shell__search" action="studio.html"><label><span class="studio-shell__sr">Szukaj stylu</span><input type="search" name="q" placeholder="Szukaj stylu…"></label><button>Szukaj</button></form><a class="studio-shell__style" href="studio.html">Styl: nie wybrano</a></div>';
    const nav=root.querySelector('nav'); links.forEach(([id,url,label])=>{const a=document.createElement('a');a.href=url;a.textContent=label;if(id===root.dataset.active)a.setAttribute('aria-current','page');nav.append(a)});
    const show=state=>{const a=root.querySelector('.studio-shell__style'),id=state?.styleId;a.textContent=id?'Styl: '+id:'Styl: nie wybrano';a.href=id?'studio.html?style='+encodeURIComponent(id):'studio.html';};
    if(window.DesignKit){show(DesignKit.get());DesignKit.subscribe(show)}
    const measure=()=>document.documentElement.style.setProperty('--shell-height',root.getBoundingClientRect().height+'px');new ResizeObserver(measure).observe(root);measure();
  });
})();
