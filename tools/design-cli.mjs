#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const load = p => JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const styles=load('data/styles.json'), fonts=load('data/fonts.json'), data=load('data/assets.json');
const types=['icons','patterns','gradients','shadows','radii','easings','animations','sizes','fontStacks','palettes'];
// Keep these authored examples identical to the web kit's component catalog.
const components={button:{id:'button',name:'Przyciski',html:'<button class="kit-button" type="button">Główna akcja</button>\n<style>.kit-button{background:var(--kit-accent);color:var(--kit-accent-contrast);border:0;border-radius:8px;padding:12px 18px;font:inherit;cursor:pointer}</style>'},input:{id:'input',name:'Pole tekstowe',html:'<label>Twoje imię <input class="kit-input" type="text" autocomplete="name"></label>\n<style>.kit-input{display:block;border:1px solid #888;border-radius:8px;padding:12px;font:inherit}</style>'}};
const fail = message => { throw new Error(message); };
const identifier = (type,item) => typeof item === 'string' ? item : type==='icons' ? `${item.lib}:${item.name}` : item.key || item.id || item.name;
const findAsset = ({type,id}) => type==='components' ? (Object.hasOwn(components,id) ? components[id] : undefined) : types.includes(type) && data[type].find(item=>identifier(type,item)===id);
const str = (x,n) => { if(typeof x!=='string'||!x.trim()||x.length>1000||/[\x00-\x1f\x7f]/.test(x)) fail(`Invalid ${n}`); };
function validate(k) {
 if(!k || typeof k!=='object' || Array.isArray(k) || k.schemaVersion!==1) fail('Unsupported or invalid schemaVersion');
 for(const n of ['name','headline','styleId','paletteId','accent','updatedAt']) str(k[n],n);
 if(!styles.some(s=>s.id===k.styleId)) fail(`Unknown style: ${k.styleId}`);
 if(!data.palettes.some(p=>p.name===k.paletteId)) fail(`Unknown palette: ${k.paletteId}`);
 if(!k.fonts||typeof k.fonts!=='object'||Array.isArray(k.fonts)) fail('Invalid fonts');
 for(const n of ['heading','body']) {str(k.fonts[n],`fonts.${n}`);if(!fonts.some(f=>f.name===k.fonts[n])) fail(`Unknown font: ${k.fonts[n]}`);}
 if(!/^#[\da-f]{6}$/i.test(k.accent)) fail('accent must be a six-digit hex color');
 if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(k.updatedAt)||!Number.isFinite(Date.parse(k.updatedAt))) fail('updatedAt must be a UTC ISO timestamp');
 if(!Array.isArray(k.assets)||k.assets.length>1000) fail('Invalid assets');
 const seen=new Set();
 for(const a of k.assets) {if(!a||typeof a!=='object'||Array.isArray(a)) fail('Invalid asset');str(a.type,'asset type');str(a.id,'asset id');if(!findAsset(a)) fail(`Unknown asset: ${a.type}:${a.id}`);const key=JSON.stringify([a.type,a.id]);if(seen.has(key)) fail(`Duplicate asset: ${a.type}:${a.id}`);seen.add(key);}
 return k;
}
const readKit = p => validate(JSON.parse(fs.readFileSync(p,'utf8')));
function standalone(v) {return v.replace(/var\(--gradient-space\)/g,'').replace(/var\(--shadow-color\)/g,'220 15% 30%').replace(/var\(--shadow-strength-(\d+)\)/g,(_,n)=>String(Number(n)/100));}
function accentContrast(hex) {
 const c=hex.match(/[\da-f]{2}/gi).map(v=>parseInt(v,16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);
 const lum=.2126*c[0]+.7152*c[1]+.0722*c[2];
 return (lum+.05)/.05 >= 1.05/(lum+.05) ? '#000000' : '#ffffff';
}
function exportKit(k,out) {
 if(out.split(/[\\/]/).includes('..')) fail('Output path cannot contain ..');
 const dest=path.resolve(out); if(fs.existsSync(dest)) fail('Output already exists; choose a new directory');
 const parent=path.dirname(dest); if(!fs.existsSync(parent)||!fs.statSync(parent).isDirectory()) fail('Output parent directory must exist');
 const style=styles.find(s=>s.id===k.styleId), palette=data.palettes.find(p=>p.name===k.paletteId);
 const safeFont=x=>/^[\p{L}\d -]{1,80}$/u.test(x)?`"${x}"`:'system-ui';
 const lines=[':root {',`  --kit-accent: ${k.accent};`,`  --kit-accent-contrast: ${accentContrast(k.accent)};`,`  --kit-font-heading: ${safeFont(k.fonts.heading)}, system-ui, sans-serif;`,`  --kit-font-body: ${safeFont(k.fonts.body)}, system-ui, sans-serif;`,`  --accent: ${k.accent};`,`  --font-heading: ${JSON.stringify(k.fonts.heading)}, sans-serif;`,`  --font-body: ${JSON.stringify(k.fonts.body)}, sans-serif;`];
 for(const [key,val] of Object.entries(style.colors||{})) if(/^[a-z-]+$/.test(key)&&typeof val==='string'&&/^#[\da-f]{6}$/i.test(val)) lines.push(`  --kit-style-${key}: ${val};`);
 palette.colors.forEach((c,i)=>lines.push(`  --kit-palette-${i+1}: ${/^#[\da-f]{6}$/i.test(c.hex)?c.hex:'transparent'};`,`  --palette-${i+1}: ${c.hex};`));
 const files=[], selected=[];
 for(const [i,a] of k.assets.entries()) {
  const item=findAsset(a);selected.push({type:a.type,id:a.id,record:item});
  if(a.type==='icons') {const src=path.resolve(root,item.src);const allowed=path.join(root,'assets/icons')+path.sep;if(!src.startsWith(allowed)||!fs.realpathSync(src).startsWith(allowed)) fail('Unsafe icon path');files.push([item.src,fs.readFileSync(src)]);}
  else if(a.type==='components') files.push([`assets/${i+1}-components-${a.id}.html`,item.html]);
  else if(a.type==='animations') fail(`Animation ${a.id} has only a name in the catalog; keyframes are not available for export`);
  else if(a.type==='patterns') { lines.push(`  --asset-${i+1}-light: ${item.light};`,`  --asset-${i+1}-dark: ${item.dark};`); }
  else if(a.type==='palettes') item.colors.forEach((c,j)=>lines.push(`  --asset-${i+1}-color-${j+1}: ${c.hex};`));
  else {const v=standalone(item.value);if(/var\(/.test(v)) fail(`Unresolved CSS dependency in ${a.type}:${a.id}`); lines.push(`  --asset-${i+1}: ${v};`);}
 }
 lines.push('}','');
 const brief=`# ${k.name}\n\n${k.headline}\n\n## Style\n\n${style.name} (${style.id})\n\n${style.description || ''}\n\nSource: ${style.sourceUrl || 'Not specified in catalog'}\n\n## Choices\n\nPalette: ${palette.name}\n\nHeading: ${k.fonts.heading}; body: ${k.fonts.body}. Font files are not included; check the individual font license.\n\nAccent: ${k.accent}\n\nSelected assets: ${k.assets.map(a=>`${a.type}:${a.id}`).join(', ') || 'none'}\n\nSee provenance.json and SOURCE-LEDGER.json for sources and license information. Catalog license entries are references, not legal advice; check the original terms.\n`;
 const provenance={note:'Catalog records and license references; verify applicability and original license terms before redistribution. Font files are not included.',style:{id:style.id,source:style.source,sourceUrl:style.sourceUrl},palette,fonts:fonts.filter(f=>[k.fonts.heading,k.fonts.body].includes(f.name)),assets:selected,licenseReferences:data.licenses};
 // Prepare all bytes before creating the output, so validation failures leave no partial export.
 files.push(['brief.md',brief],['tokens.css',lines.join('\n')],['kit.json',JSON.stringify(k,null,2)+'\n'],['project.json',JSON.stringify(k,null,2)+'\n'],['provenance.json',JSON.stringify(provenance,null,2)+'\n'],['SOURCE-LEDGER.json',fs.readFileSync(path.join(root,'data/source-ledger.json'))],['SOURCES.md',fs.readFileSync(path.join(root,'docs/SOURCES.md'))]);
 fs.mkdirSync(dest); try {for(const [name,bytes] of files){const target=path.resolve(dest,name);if(!target.startsWith(dest+path.sep)) fail('Unsafe asset path');fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes,{flag:'wx'});}} catch(e){fs.rmSync(dest,{recursive:true,force:true});throw e;}
 console.log(`Exported ${dest}`);
}
function main(args) {
 const [cmd,...rest]=args;
 if(cmd==='search' && (rest.length===1 || rest.length===2&&rest[1]==='--json')) {str(rest[0],'query');const terms=rest[0].toLowerCase().split(/\s+/);const result=styles.map(s=>{const text=JSON.stringify(s).toLowerCase();return {s,score:terms.filter(t=>text.includes(t)).length};}).filter(x=>x.score===terms.length).sort((a,b)=>b.score-a.score||a.s.id.localeCompare(b.s.id)).map(x=>x.s);console.log(rest[1]==='--json'?JSON.stringify(result,null,2):result.map(s=>`${s.id}\t${s.name}`).join('\n'));return;}
 if(cmd==='style' && (rest.length===1||rest.length===2&&rest[1]==='--json')) {const s=styles.find(x=>x.id===rest[0]);if(!s) fail(`Unknown style: ${rest[0]}`);console.log(rest[1]==='--json'?JSON.stringify(s,null,2):`${s.id} — ${s.name}\n${s.description}\nSource: ${s.sourceUrl || 'not specified'}`);return;}
 if(cmd==='kit'&&rest[0]==='validate'&&rest.length===2) {readKit(rest[1]);console.log('Valid kit');return;}
 if(cmd==='kit'&&rest[0]==='export'&&rest.length===4&&rest[2]==='--out') {exportKit(readKit(rest[1]),rest[3]);return;}
 fail('Usage: search <query> [--json] | style <exact-id> [--json] | kit validate <file> | kit export <file> --out <new-directory>');
}
try {main(process.argv.slice(2));} catch(e) {console.error(`Error: ${e.message}`);process.exitCode=1;}
