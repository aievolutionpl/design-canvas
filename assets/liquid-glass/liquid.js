/* Liquid Glass — real refraction for the web.
   Technique extracted from quickLiquid (MIT, github.com/amarnath3003/quickLiquid):
   Snell-based displacement map → SVG feImage + feDisplacementMap inside backdrop-filter,
   conic light rings (two specular lobes), optional chromatic dispersion.
   Self-contained, no dependencies. */
(() => {
  'use strict';
  let uid = 0;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---- optics: normalized Snell displacement for a convex bezel ---- */
  const SAMPLES = 512;
  function profile(thickness, bezel, ior) {
    const lut = new Float32Array(SAMPLES + 1);
    if (ior <= 1 || thickness <= 0) return lut;
    const ratio = thickness / Math.max(bezel, .001), eta = 1 / Math.max(1, ior);
    let peak = 0;
    for (let i = 1; i < SAMPLES; i++) {
      const s = i / SAMPLES, root = Math.sqrt(s * (2 - s));
      const slope = ratio * (1 - s) / root;
      const cosI = 1 / Math.sqrt(1 + slope * slope), sinI = slope * cosI;
      const k = eta * cosI - Math.sqrt(Math.max(0, 1 - eta * eta * sinI * sinI));
      const d = root * Math.abs(k * sinI / (-eta + k * cosI));
      lut[i] = d; peak = Math.max(peak, d);
    }
    if (peak > 0) for (let i = 1; i < SAMPLES; i++) lut[i] /= peak;
    return lut;
  }

  /* ---- displacement map for a rounded rect ---- */
  function lensMap(w, h, radius, bezel, thickness, ior) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'), img = ctx.createImageData(w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) { d[i] = 128; d[i + 1] = 128; d[i + 2] = 128; d[i + 3] = 255; }
    const lut = profile(thickness, bezel, ior);
    const r = Math.min(radius, w / 2, h / 2), bz = Math.min(bezel, w / 2, h / 2);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // signed distance to rounded-rect edge (inside positive)
        const qx = Math.abs(x + .5 - w / 2) - (w / 2 - r), qy = Math.abs(y + .5 - h / 2) - (h / 2 - r);
        let dist, nx, ny;
        if (qx > 0 && qy > 0) { const L = Math.hypot(qx, qy); dist = L - r; nx = qx / L; ny = qy / L; }
        else if (qx > qy) { dist = qx - r; nx = 1; ny = 0; }
        else { dist = qy - r; nx = 0; ny = 1; }
        const inset = -dist;
        if (inset <= 0 || inset >= bz) continue;
        const f = inset / bz * SAMPLES, i0 = Math.min(SAMPLES - 1, Math.floor(f));
        const amp = lut[i0] + (lut[i0 + 1] - lut[i0]) * (f - i0);
        const k = (y * w + x) * 4;
        d[k] = 128 + Math.round(nx * amp * 127);
        d[k + 1] = 128 + Math.round(ny * amp * 127);
      }
    }
    ctx.putImageData(img, 0, 0);
    return c.toDataURL('image/png');
  }

  /* ---- SVG filter ---- */
  function buildFilter(id, w, h, scale, ca) {
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('width', '0'); svg.setAttribute('height', '0');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
    let inner;
    if (ca > 0) {
      const s = ca;
      inner = `
        <feDisplacementMap in="SourceGraphic" in2="map" scale="${(scale * (1 + s)).toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="dR"/>
        <feDisplacementMap in="SourceGraphic" in2="map" scale="${scale.toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="dG"/>
        <feDisplacementMap in="SourceGraphic" in2="map" scale="${(scale * (1 - s)).toFixed(2)}" xChannelSelector="R" yChannelSelector="G" result="dB"/>
        <feComponentTransfer in="dR" result="cR"><feFuncG type="discrete" tableValues="0"/><feFuncB type="discrete" tableValues="0"/></feComponentTransfer>
        <feComponentTransfer in="dG" result="cG"><feFuncR type="discrete" tableValues="0"/><feFuncB type="discrete" tableValues="0"/></feComponentTransfer>
        <feComponentTransfer in="dB" result="cB"><feFuncR type="discrete" tableValues="0"/><feFuncG type="discrete" tableValues="0"/></feComponentTransfer>
        <feBlend in="cR" in2="cG" mode="screen" result="rg"/><feBlend in="rg" in2="cB" mode="screen"/>`;
    } else {
      inner = `<feDisplacementMap in="SourceGraphic" in2="map" scale="${scale.toFixed(2)}" xChannelSelector="R" yChannelSelector="G"/>`;
    }
    svg.innerHTML = `<defs><filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${w}" height="${h}" color-interpolation-filters="sRGB">
      <feImage href="" result="encoded" preserveAspectRatio="none" x="0" y="0" width="${w}" height="${h}"/>
      <feComponentTransfer in="encoded" result="map">
        <feFuncR type="linear" slope="${255 / 254}" intercept="${-1 / 254}"/>
        <feFuncG type="linear" slope="${255 / 254}" intercept="${-1 / 254}"/>
      </feComponentTransfer>${inner}</filter></defs>`;
    return svg;
  }

  /* ---- public API ---- */
  function liquidGlass(el, opts = {}) {
    const o = Object.assign({
      radius: 28, bezel: 18, thickness: 14, ior: 1.5,
      blur: 6, saturation: 1.35, dispersion: .5, strength: 1,
      tint: '255,255,255', tintOpacity: .13, rim: 1, shadow: true
    }, opts);
    if (el.dataset.lqReady) return el.__lq;
    el.dataset.lqReady = '1';
    if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
    el.classList.add('lq');
    el.style.borderRadius = o.radius + 'px';
    el.style.overflow = 'hidden';

    const w = Math.max(2, Math.round(el.offsetWidth || 200));
    const h = Math.max(2, Math.round(el.offsetHeight || 60));
    const id = 'lq' + (++uid);

    const lens = document.createElement('div');
    lens.className = 'lq-lens';
    Object.assign(lens.style, { position: 'absolute', inset: '0', borderRadius: 'inherit', pointerEvents: 'none', zIndex: '0' });

    const tint = document.createElement('div');
    tint.className = 'lq-tint';
    tint.style.cssText = `position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:1;background:linear-gradient(180deg,rgba(${o.tint},${o.tintOpacity * 1.25}),rgba(${o.tint},${o.tintOpacity * .85}))`;

    const rim = document.createElement('div');
    rim.className = 'lq-rim';
    rim.style.cssText = `position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:2;padding:1.2px;opacity:${o.rim};
      background:conic-gradient(from var(--lq-a,150deg), transparent 0 10%, rgba(255,255,255,.95) 16%, rgba(255,255,255,.25) 24%, transparent 32% 62%, rgba(255,255,255,.8) 74%, rgba(255,255,255,.2) 82%, transparent 90%);
      -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude`;

    const sheen = document.createElement('div');
    sheen.className = 'lq-sheen';
    sheen.style.cssText = `position:absolute;inset:0;border-radius:inherit;pointer-events:none;z-index:2;filter:blur(7px);opacity:.72;
      background:conic-gradient(from calc(var(--lq-a,150deg) + 180deg), transparent 0 18%, rgba(255,255,255,.5) 26%, transparent 34% 66%, rgba(255,255,255,.35) 76%, transparent 84%);
      -webkit-mask:radial-gradient(farthest-side,#0000 calc(100% - ${Math.max(6, o.bezel)}px),#000 calc(100% - ${Math.max(6, o.bezel) - 3}px));
      mask:radial-gradient(farthest-side,#0000 calc(100% - ${Math.max(6, o.bezel)}px),#000 calc(100% - ${Math.max(6, o.bezel) - 3}px))`;

    const content = [...el.childNodes].filter(n => n.nodeType === 1 && !n.classList.contains('lq-lens'));
    content.forEach(n => { n.style.position = 'relative'; n.style.zIndex = '3'; });
    el.prepend(sheen, rim, tint, lens);

    // real backdrop refraction
    try {
      const mapUrl = lensMap(w, h, o.radius, o.bezel, o.thickness, o.ior);
      const svg = buildFilter(id, w, h, o.strength * Math.max(8, o.bezel) * 1.7, o.dispersion);
      svg.querySelector('feImage').setAttribute('href', mapUrl);
      document.body.appendChild(svg);
      // Chromium: url() must be present the moment the layer is first composited
      lens.style.backdropFilter = `url(#${id}) blur(${o.blur}px) saturate(${o.saturation})`;
      lens.style.webkitBackdropFilter = lens.style.backdropFilter;
      el.__lqSvg = svg;
    } catch (e) {
      lens.style.backdropFilter = `blur(${o.blur}px) saturate(${o.saturation})`;
    }

    if (o.shadow) el.style.boxShadow = '0 1px 0 rgba(255,255,255,.65) inset, 0 -1px 0 rgba(0,0,0,.10) inset, 0 12px 32px rgba(12,20,40,.18), 0 2px 6px rgba(12,20,40,.12)';

    // pointer-reactive light angle + press
    const rect = () => el.getBoundingClientRect();
    el.addEventListener('pointermove', e => {
      const r = rect();
      const dx = (e.clientX - (r.left + r.width / 2)) / r.width;
      const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
      el.style.setProperty('--lq-a', (150 + dx * 80 - dy * 40).toFixed(1) + 'deg');
    });
    el.addEventListener('pointerdown', () => { el.style.transition = 'transform .18s cubic-bezier(.34,1.56,.64,1)'; el.style.transform = 'scale(.975)'; });
    const up = () => { el.style.transform = 'scale(1)'; };
    el.addEventListener('pointerup', up); el.addEventListener('pointerleave', up);

    el.__lq = { opts: o, id, svg: el.__lqSvg, lens, el };
    return el.__lq;
  }

  window.liquidGlass = liquidGlass;
  window.liquidGlassAll = (sel = '[data-liquid]', opts = {}) => [...document.querySelectorAll(sel)].map(el => liquidGlass(el, Object.assign({}, opts, JSON.parse(el.dataset.liquid || '{}'))));
})();
