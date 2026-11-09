import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { runInNewContext } from 'node:vm';
const root = new URL('..', import.meta.url).pathname;
const run = (...args) => spawnSync(process.execPath, [join(root,'tools/design-cli.mjs'), ...args], {encoding:'utf8'});
const data = JSON.parse(readFileSync(join(root,'data/assets.json')));
const fonts = JSON.parse(readFileSync(join(root,'data/fonts.json')));
const kit = {schemaVersion:1,name:'Test project',headline:'Hello',styleId:'ADT-01',paletteId:data.palettes[0].name,fonts:{heading:fonts[0].name,body:fonts[0].name},accent:'#abcdef',assets:[{type:'icons',id:'lucide:arrow-right'},{type:'gradients',id:'Gradient 1'},{type:'shadows',id:'Shadow 1'},{type:'patterns',id:data.patterns[0].key}],updatedAt:'2026-01-01T00:00:00.000Z'};
const tmp = mkdtempSync(join(process.env.TMPDIR || tmpdir(),'design-cli-'));
process.on('exit',()=>rmSync(tmp,{recursive:true,force:true}));
function save(obj,name='kit.json') { const p=join(tmp,name);writeFileSync(p,JSON.stringify(obj));return p; }
test('search and exact style expose actual repository records',()=>{let r=run('search','minimalism','--json');assert.equal(r.status,0,r.stderr);assert.ok(JSON.parse(r.stdout).some(x=>x.id==='ADT-01'));r=run('style','ADT-01','--json');assert.equal(r.status,0,r.stderr);assert.equal(JSON.parse(r.stdout).id,'ADT-01');assert.notEqual(run('style','adt-01').status,0);});
test('valid kit passes and malformed or unknown fields fail',()=>{assert.equal(run('kit','validate',save(kit)).status,0);for(const bad of [{...kit,styleId:'missing'},{...kit,paletteId:'missing'},{...kit,fonts:{...kit.fonts,body:'missing'}},{...kit,schemaVersion:2},{...kit,accent:'red;}'},{...kit,assets:[{type:'icons',id:'../x'}]},{...kit,updatedAt:'garbage'},{...kit,assets:[{type:'licenses',id:'Lucide'}]}]) assert.notEqual(run('kit','validate',save(bad)).status,0,JSON.stringify(bad));writeFileSync(join(tmp,'bad.json'),'{');assert.notEqual(run('kit','validate',join(tmp,'bad.json')).status,0);});
test('export includes actual bytes, standalone snippets and provenance; does not overwrite',()=>{const out=join(tmp,'export');const r=run('kit','export',save(kit),'--out',out);assert.equal(r.status,0,r.stderr);for(const f of ['kit.json','brief.md','tokens.css','provenance.json','assets/icons/lucide/arrow-right.svg'])assert.ok(existsSync(join(out,f)),f);assert.deepEqual(readFileSync(join(out,'assets/icons/lucide/arrow-right.svg')),readFileSync(join(root,'assets/icons/lucide/arrow-right.svg')));const css=readFileSync(join(out,'tokens.css'),'utf8');assert.match(css,/linear-gradient/);assert.doesNotMatch(css,/var\(--(?:gradient-space|shadow-color|shadow-strength)/);const provenance=readFileSync(join(out,'provenance.json'),'utf8');assert.match(provenance,/Lucide/);assert.match(provenance,/Open Props/);assert.notEqual(run('kit','export',save(kit),'--out',out).status,0);});
test('export rejects animation lacking source snippets and unsafe destination',()=>{const k={...kit,assets:[{type:'animations',id:data.animations[0]}]};const p=join(tmp,'anim');assert.notEqual(run('kit','export',save(k),'--out',p).status,0);assert.equal(existsSync(p),false);assert.notEqual(run('kit','export',save(kit),'--out',`${tmp}/x/../y`).status,0);});

test('web project components export matching HTML and standalone web tokens',()=>{
 const k={...kit,accent:'#ffffff',assets:[{type:'components',id:'button'},{type:'components',id:'input'}]};
 const p=save(k,'project.json'), out=join(tmp,'web-project');
 let r=run('kit','validate',p);assert.equal(r.status,0,r.stderr);
 r=run('kit','export',p,'--out',out);assert.equal(r.status,0,r.stderr);
 const css=readFileSync(join(out,'tokens.css'),'utf8');
 for(const v of ['--kit-accent: #ffffff','--kit-accent-contrast: #000000','--kit-font-heading:','--kit-font-body:','--kit-palette-1:','--kit-style-']) assert.ok(css.includes(v),v);
 assert.match(readFileSync(join(out,'assets/1-components-button.html'),'utf8'),/<button class="kit-button"[\s\S]*var\(--kit-accent-contrast\)/);
 assert.match(readFileSync(join(out,'assets/2-components-input.html'),'utf8'),/<input class="kit-input"/);
 const web=readFileSync(join(root,'kit.js'),'utf8');
 const definition=web.match(/const components=(\{.*\});\nconst id=/);
 assert.ok(definition,'web component catalog exists');
 const webComponents=runInNewContext('('+definition[1]+')');
 for(const [index,id] of ['button','input'].entries()) assert.equal(readFileSync(join(out,`assets/${index+1}-components-${id}.html`),'utf8'),webComponents[id].html);
 assert.deepEqual(JSON.parse(readFileSync(join(out,'project.json'))),k);
 assert.deepEqual(JSON.parse(readFileSync(join(out,'kit.json'))),k);
});
test('component IDs are strictly allowlisted and contrast follows web luminance',()=>{
 assert.notEqual(run('kit','validate',save({...kit,assets:[{type:'components',id:'../button'}]})).status,0);
 const k={...kit,accent:'#000000',assets:[{type:'components',id:'button'}]},out=join(tmp,'dark-accent');
 const r=run('kit','export',save(k),'--out',out);assert.equal(r.status,0,r.stderr);
 assert.match(readFileSync(join(out,'tokens.css'),'utf8'),/--kit-accent-contrast: #ffffff;/);
});
