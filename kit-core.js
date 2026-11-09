(function(root,factory){const api=factory(root); if(typeof module==='object'&&module.exports) module.exports=api; root.DesignKit=api;})(typeof window!=='undefined'?window:globalThis,function(root){
'use strict';
const KEY='aie-design-kit-v1', listeners=new Set();
const defaults=()=>({schemaVersion:1,name:'Mój projekt',headline:'Pomysł zaczyna się tutaj',styleId:'ADT-01',paletteId:'Radix amber',fonts:{heading:'Archivo',body:'Inter'},accent:'#5145c8',assets:[],updatedAt:new Date().toISOString()});
const text=(v,max=200)=>typeof v==='string'?v.replace(/[\x00-\x1f\x7f]/g,' ').slice(0,max):'';
function normalize(x){if(!x||typeof x!=='object'||Array.isArray(x)||x.schemaVersion!==1) throw Error('Nieprawidłowy format projektu.');const d=defaults();return {schemaVersion:1,name:text(x.name)||d.name,headline:text(x.headline)||d.headline,styleId:text(x.styleId),paletteId:text(x.paletteId),fonts:{heading:text(x.fonts?.heading),body:text(x.fonts?.body)},accent:/^#[0-9a-f]{6}$/i.test(x.accent)?x.accent:d.accent,assets:Array.isArray(x.assets)?x.assets.filter(a=>a&&typeof a.type==='string'&&typeof a.id==='string'&&a.type.length<80&&a.id.length<200).map(a=>({type:a.type,id:a.id})).filter((a,i,all)=>all.findIndex(b=>b.type===a.type&&b.id===a.id)===i).slice(0,500):[],updatedAt:text(x.updatedAt,50)||d.updatedAt};}
let state;try{const raw=root.localStorage?.getItem(KEY);state=raw?normalize(JSON.parse(raw)):defaults();}catch(e){state=defaults();}
function get(){return JSON.parse(JSON.stringify(state));}
function update(patch){if(!patch||typeof patch!=='object'||Array.isArray(patch))throw Error('Nieprawidłowa zmiana');state=normalize({...state,...patch,fonts:patch.fonts?{...state.fonts,...patch.fonts}:state.fonts,schemaVersion:1,updatedAt:new Date().toISOString()});try{root.localStorage?.setItem(KEY,JSON.stringify(state));}catch(e){console.warn('Nie można zapisać projektu lokalnie.',e);}listeners.forEach(fn=>{try{fn(get());}catch(e){console.error(e);}});return get();}
function addAsset(a){if(!a||typeof a.type!=='string'||typeof a.id!=='string'||!a.type||!a.id)throw Error('Nieprawidłowy asset');return update({assets:[...state.assets,a]});}
function setStyle(id){return update({styleId:id});}
function subscribe(fn){listeners.add(fn);return ()=>listeners.delete(fn);}
return {get,update,addAsset,setStyle,subscribe,normalize,storageKey:KEY};
});
