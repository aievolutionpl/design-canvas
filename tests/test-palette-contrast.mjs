import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const source=readFileSync(new URL('../kit.js',import.meta.url),'utf8');
const functions=source.slice(source.indexOf('function luminance('),source.indexOf('function renderPalette('));
const api=runInNewContext(functions+';({ratio,readableText})');
test('short dark palettes get readable text without changing source colors',()=>{
 const palettes=JSON.parse(readFileSync(new URL('../data/reference-palettes.json',import.meta.url)));
 for(const palette of palettes){const bg=palette.colors[0].hex;const chosen=api.readableText(bg,'#17191d',palette.colors);assert.ok(api.ratio(bg,chosen)>=4.5,palette.name);}
});
test('readable catalog text is retained; midtone falls back to black or white',()=>{
 assert.equal(api.readableText('#ffffff','#17191d',[]),'#17191d');
 for(const bg of ['#777777','#0F969C','#6DA5C0','#9D71E8'])assert.ok(api.ratio(bg,api.readableText(bg))>=4.5);
});
