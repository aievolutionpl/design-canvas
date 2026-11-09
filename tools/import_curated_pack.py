#!/usr/bin/env python3
"""Rebuild curated assets from pinned GitHub archives; requires Node, npm, network."""
import hashlib, json, math, os, re, shutil, subprocess, tarfile, tempfile, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCES = {
 'daisyui': ('saadeghi/daisyui','f832adddd5c2b458bda4b0da8816b31a5b17731e'),
 'svg-spinners': ('n3r4zzurr0/svg-spinners','abfa05c49acf005b8b1e0ef8eb25a67a7057eb20'),
 'boring-avatars': ('boringdesigners/boring-avatars','d0ff2582a8921b643a89de4a4912be28938a828b')}
THEMES = ['light','dark','cupcake','cyberpunk','forest','nord','sunset','wireframe']
SPINNERS = ['180-ring','3-dots-bounce','3-dots-fade','3-dots-scale','6-dots-rotate','8-dots-rotate','90-ring','blocks-shuffle-3']
VARIANTS = ['beam','bauhaus','ring','pixel','sunset','marble']
def sha(data): return hashlib.sha256(data).hexdigest()
def save(p, b):
 p=ROOT/p; p.parent.mkdir(parents=True,exist_ok=True); p.write_bytes(b)
def dump(path, obj): save(path,(json.dumps(obj,ensure_ascii=False,indent=2)+'\n').encode())
def convert(value):
 """CSS OKLCH -> OKLab -> linear sRGB -> gamma sRGB, channel clipped."""
 m=re.fullmatch(r'oklch\(([-.\d]+)%\s+([-.\d]+)\s+([-.\d]+)\)',value)
 if not m: raise ValueError(value)
 l,c,h=map(float,m.groups()); l/=100; a=c*math.cos(math.radians(h)); b=c*math.sin(math.radians(h))
 x=(l+0.3963377774*a+0.2158037573*b)**3; y=(l-0.1055613458*a-0.0638541728*b)**3; z=(l-0.0894841775*a-1.291485548*b)**3
 rgb=(4.0767416621*x-3.3077115913*y+0.2309699292*z,-1.2684380046*x+2.6097574011*y-0.3413193965*z,-0.0041960863*x-0.7034186147*y+1.707614701*z)
 def channel(v):
  v=max(0,min(1,v)); return round(255*(12.92*v if v<=0.0031308 else 1.055*v**(1/2.4)-0.055))
 return '#'+''.join(f'{channel(v):02X}' for v in rgb)
def main():
 with tempfile.TemporaryDirectory(dir=os.environ.get('TMPDIR')) as tmp:
  t=Path(tmp); dirs={}; ledger=[]
  for key,(repo,rev) in SOURCES.items():
   with urllib.request.urlopen(f'https://codeload.github.com/{repo}/tar.gz/{rev}') as r: archive=r.read()
   archive_path=t/(key+'.tgz'); archive_path.write_bytes(archive)
   with tarfile.open(archive_path) as tf: tf.extractall(t,filter='data')
   d=t/(repo.split('/')[-1]+'-'+rev); dirs[key]=d
   license_data=(d/'LICENSE').read_bytes(); license_path=f'assets/vendor/{key}/LICENSE'; save(license_path,license_data)
   ledger.append(dict(repo='https://github.com/'+repo,revision=rev,license_path='LICENSE',license_url=f'https://raw.githubusercontent.com/{repo}/{rev}/LICENSE',license_spdx='MIT',license_sha256=sha(license_data),local_license=license_path,role='curated source pack',files=[]))
  styles=json.loads((ROOT/'data/styles.json').read_text()); styles=[x for x in styles if x.get('source')!='daisyui']
  for i,name in enumerate(THEMES,1):
   source=f'packages/daisyui/src/themes/{name}.css'; raw=(dirs['daisyui']/source).read_bytes(); local=f'assets/vendor/daisyui/themes/{name}.css'; save(local,raw)
   ledger[0]['files'].append(dict(source=source,local=local,sha256=sha(raw)))
   values=dict(re.findall(r'--([\w-]+):\s*([^;]+);',raw.decode())); color=lambda n:convert(values['color-'+n])
   colors={'bg':color('base-100'),'surface':color('base-200'),'text':color('base-content'),'text-secondary':color('base-content'),'border':color('base-300'),'primary':color('primary'),'primary-contrast':color('primary-content'),'accent':color('accent'),'accent-contrast':color('accent-content'),'success':color('success'),'warning':color('warning'),'error':color('error')}
   number=f'{i:02}'; url=f'https://github.com/{SOURCES["daisyui"][0]}/blob/{SOURCES["daisyui"][1]}/{source}'
   fonts={'sans':'system-ui','display':'system-ui','mono':'monospace'}
   styles.append(dict(id='DAISY-'+number,num=number,source='daisyui',sourceUrl=url,name='daisyUI '+name,tagline='daisyUI theme',category='UI / web',description='Motyw daisyUI '+name+'; paleta pochodzi z tokenów źródłowych.',whenToUse='Interfejsy korzystające z motywu daisyUI.',colors=colors,palette=[colors[k] for k in ('bg','surface','text','primary','accent','border')],paletteSource='derived from daisyUI OKLCH tokens; clipped sRGB conversion',fonts=fonts,fontsSource='generic fallback; not specified by the theme',radius={'sm':values['radius-field'],'md':values['radius-selector'],'lg':values['radius-box']},prompt='Użyj motywu daisyUI '+name+' i zachowaj czytelność oraz kontrast.',image=None))
   styles[-1].update(aliases=[name],principles='Tokeny kolorów i promieni z motywu daisyUI.',signature='Kolory i promienie motywu '+name+'.',recommendedFor=['Interfejsy internetowe'],supporting=[],incompatible=[],do=['Sprawdź kontrast po konwersji do sRGB.'],dont=['Nie traktuj fontów zapasowych jako oficjalnych fontów daisyUI.'],colorsDark={},fontsRecommended='system-ui, monospace (fallback)',fontSizes={},shadows={},tokensCss='\n'.join(f'--{k}: {v};' for k,v in values.items()),imageNote='Brak podglądu.',imageW=0,imageH=0)
  data=json.loads((ROOT/'data/assets.json').read_text()); data['icons']=[x for x in data['icons'] if x['lib'] not in ('svg-spinners','boring-avatars')]
  for name in SPINNERS:
   source=f'svg-smil/{name}.svg'; raw=(dirs['svg-spinners']/source).read_bytes(); local=f'assets/icons/curated/svg-spinners/{name}.svg'; save(local,raw)
   ledger[1]['files'].append(dict(source=source,local=local,sha256=sha(raw))); data['icons'].append(dict(lib='svg-spinners',name=name,cat='animacje',src=local))
  # Install only build tools and peers outside the repository; compile the pinned TSX source.
  subprocess.run(['npm','install','--no-audit','--no-fund','--no-save','--prefix',str(t),'react@19.2.6','react-dom@19.2.6','esbuild@0.25.12'],check=True)
  entry=t/'generate.tsx'; entry.write_text('''import React from "react";\nimport {renderToStaticMarkup} from "react-dom/server";\nimport Avatar from "./boring-avatars-d0ff2582a8921b643a89de4a4912be28938a828b/src/lib/index";\nimport fs from "node:fs";\nfor (const variant of ["beam","bauhaus","ring","pixel","sunset","marble"]) for (const index of [1,2]) { const name=`${variant}-${String(index).padStart(2,"0")}`; const svg=renderToStaticMarkup(React.createElement(Avatar,{variant,name,size:128,title:false}),{identifierPrefix:`avatar-${name}-`}); fs.writeFileSync(`${process.argv[2]}/${name}.svg`,svg+"\\n"); }\n''')
  subprocess.run([str(t/'node_modules/.bin/esbuild'),str(entry),'--bundle','--platform=node','--format=cjs','--jsx=automatic',f'--outfile={t}/generate.cjs'],check=True)
  out=t/'out'; out.mkdir(); subprocess.run(['node',str(t/'generate.cjs'),str(out)],check=True)
  for variant in VARIANTS:
   for i in (1,2):
    name=f'{variant}-{i:02}'; raw=(out/(name+'.svg')).read_bytes(); local=f'assets/icons/curated/boring-avatars/{name}.svg'; save(local,raw)
    ledger[2]['files'].append(dict(source='src/lib/index.tsx',local=local,sha256=sha(raw),recipe=dict(variant=variant,name=name,size=128,colors='library defaults',title=False,react='19.2.6',react_dom='19.2.6',esbuild='0.25.12',render='renderToStaticMarkup with per-file identifierPrefix')))
    data['icons'].append(dict(lib='boring-avatars',name=name,cat='avatary',src=local))
  for e in ledger: e['file_count']=len(e['files'])
  data['licenses']=[x for x in data['licenses'] if x[0] not in ('daisyUI','SVG Spinners','Boring Avatars')]+[['daisyUI','MIT','https://github.com/saadeghi/daisyui'],['SVG Spinners','MIT','https://github.com/n3r4zzurr0/svg-spinners'],['Boring Avatars','MIT','https://github.com/boringdesigners/boring-avatars']]
  old=json.loads((ROOT/'data/source-ledger.json').read_text()); old['repositories']=[x for x in old['repositories'] if x['repo'] not in [e['repo'] for e in ledger]]+ledger
  dump('data/styles.json',styles); save('data/assets.json',(json.dumps(data,ensure_ascii=False,separators=(',',':'))+'\n').encode()); dump('data/source-ledger.json',old)
  print(f'Imported {len(THEMES)} themes, {len(SPINNERS)} animated SVGs, {len(VARIANTS)*2} avatars')
if __name__=='__main__': main()
