#!/usr/bin/env python3
import hashlib, importlib.util, json, re, unittest, xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
spec=importlib.util.spec_from_file_location('curated',ROOT/'tools/import_curated_pack.py')
assert spec is not None and spec.loader is not None
mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
class CuratedData(unittest.TestCase):
 def setUp(self):
  self.styles=json.loads((ROOT/'data/styles.json').read_text()); self.assets=json.loads((ROOT/'data/assets.json').read_text()); self.ledger=json.loads((ROOT/'data/source-ledger.json').read_text())['repositories']
 def test_styles(self):
  ids=[s['id'] for s in self.styles]; self.assertEqual(len(ids),len(set(ids)))
  styles=[s for s in self.styles if s.get('source')=='daisyui']; self.assertEqual([s['id'] for s in styles],[f'DAISY-{i:02}' for i in range(1,9)])
  self.assertEqual(mod.convert('oklch(100% 0 0)'),'#FFFFFF'); self.assertEqual(mod.convert('oklch(0% 0 0)'),'#000000'); self.assertEqual(mod.convert('oklch(62.7955% 0.257683 29.2339)'),'#FF0000')
  for s,name in zip(styles,mod.THEMES):
   css=(ROOT/f'assets/vendor/daisyui/themes/{name}.css').read_text(); vals=dict(re.findall(r'--([\w-]+):\s*([^;]+);',css))
   for dest,src in [('bg','base-100'),('surface','base-200'),('text','base-content'),('border','base-300'),('primary','primary'),('primary-contrast','primary-content'),('accent','accent'),('accent-contrast','accent-content'),('success','success'),('warning','warning'),('error','error')]: self.assertEqual(s['colors'][dest],mod.convert(vals['color-'+src]))
   self.assertEqual(s['radius']['lg'],vals['radius-box']); self.assertIn('not specified',s['fontsSource'])
 def test_files_and_licenses(self):
  for key,(repo,rev) in mod.SOURCES.items():
   entries=[x for x in self.ledger if x['repo']=='https://github.com/'+repo]; self.assertEqual(len(entries),1); e=entries[0]; self.assertEqual(e['revision'],rev); self.assertEqual(e['license_spdx'],'MIT')
   self.assertEqual(hashlib.sha256((ROOT/e['local_license']).read_bytes()).hexdigest(),e['license_sha256']); self.assertEqual(len(e['files']),e['file_count']); self.assertEqual(e['file_count'],{'daisyui':8,'svg-spinners':8,'boring-avatars':12}[key])
   for item in e['files']: self.assertEqual(hashlib.sha256((ROOT/item['local']).read_bytes()).hexdigest(),item['sha256'])
  for lib in ('daisyUI','SVG Spinners','Boring Avatars'): self.assertEqual(len([x for x in self.assets['licenses'] if x[0]==lib and x[1]=='MIT']),1)
 def test_icons(self):
  seen=set(); allids=set()
  for lib,count in [('svg-spinners',8),('boring-avatars',12)]:
   entries=[x for x in self.assets['icons'] if x['lib']==lib]; self.assertEqual(len(entries),count)
   for x in entries:
    self.assertEqual(set(x),{'lib','name','cat','src'}); self.assertNotIn((lib,x['name']),seen); seen.add((lib,x['name']))
    self.assertEqual(x['src'],f"assets/icons/curated/{lib}/{x['name']}.svg")
    root=ET.parse(ROOT/x['src']).getroot(); self.assertTrue(root.tag.endswith('svg')); animated=False
    for node in root.iter():
     self.assertFalse(node.tag.lower().endswith('script')); animated |= node.tag.split('}')[-1].startswith('animate')
     for k,v in node.attrib.items():
      if k.split('}')[-1]=='href': self.assertTrue(v.startswith('#'))
      if k=='id': self.assertNotIn(v,allids); allids.add(v)
    if lib=='svg-spinners': self.assertTrue(animated)
if __name__=='__main__': unittest.main(verbosity=2)
