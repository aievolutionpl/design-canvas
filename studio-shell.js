(() => {
  const links = [['studio','studio.html','Studio'],['canvas','index.html','Kanwa'],['boards','boards.html','Tablice'],['assets','assets.html','Assety'],['liquid','liquid.html','Liquid Glass']];
  document.querySelectorAll('[data-studio-shell]').forEach(root => {
    const current = root.dataset.active;
    root.classList.add('studio-shell');
    const inner = document.createElement('div'); inner.className = 'studio-shell__inner';
    const brand = document.createElement('a'); brand.className = 'studio-shell__brand'; brand.href = 'studio.html'; brand.innerHTML = 'AI Evolution <span>Polska</span>';
    const nav = document.createElement('nav'); nav.className = 'studio-shell__nav'; nav.setAttribute('aria-label','Nawigacja Design Studio');
    links.forEach(([id,url,label]) => { const a = document.createElement('a'); a.href=url; a.textContent=label; if(id===current) a.setAttribute('aria-current','page'); nav.append(a); });
    inner.append(brand,nav); root.replaceChildren(inner);
  });
})();
