'use strict';
const assert=require('node:assert/strict');
let store={};global.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v};
const kit=require('../kit-core.js');let calls=0;const stop=kit.subscribe(()=>calls++);
kit.update({name:'Próba',fonts:{heading:'Inter'}});kit.addAsset({type:'icons',id:'lucide:arrow-right'});kit.addAsset({type:'icons',id:'lucide:arrow-right'});kit.setStyle('ADT-01');
assert.equal(kit.get().assets.length,1);assert.equal(kit.get().styleId,'ADT-01');assert.equal(JSON.parse(store['aie-design-kit-v1']).name,'Próba');assert.equal(calls,4);stop();kit.update({accent:'not-css'});assert.equal(kit.get().accent,'#5145c8');assert.throws(()=>kit.normalize({schemaVersion:2}));let copy=kit.get();copy.assets.length=0;assert.equal(kit.get().assets.length,1);console.log('kit core: PASS');
