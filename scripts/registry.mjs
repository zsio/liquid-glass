/** Create a self-contained shadcn registry payload from this project's own source. */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const read=p=>readFileSync(resolve(root,p),'utf8');
const files=[
  {path:'registry/liquid-glass/index.tsx',type:'registry:ui',target:'@ui/liquid-glass/index.tsx',content:read('src/components/LiquidGlass.tsx').replaceAll("'../glass'","'./glass-engine'").replaceAll("'../glass.css'","'./liquid-glass.css'")},
  {path:'registry/liquid-glass/glass-engine.ts',type:'registry:file',target:'@ui/liquid-glass/glass-engine.ts',content:read('src/glass.ts')},
  {path:'registry/liquid-glass/liquid-glass.css',type:'registry:file',target:'@ui/liquid-glass/liquid-glass.css',content:read('src/glass.css')},
];
const item={
  $schema:'https://ui.shadcn.com/schema/registry-item.json',
  name:'liquid-glass',type:'registry:block',title:'Liquid Glass',
  description:'Original DOM backdrop material and compact React controls: button, icon button, switch, slider, segmented choice, chips and toolbar. CSS fallback; no third-party optical engine.',
  dependencies:[],registryDependencies:[],files,
  docs:'Import from your configured ui alias plus /liquid-glass. CSS is imported by the component. This is a local registry item, not a published shadcn built-in. Enhanced rendering tested in Chromium only. Set focusRing="none" to suppress the wrapper outline.',
  meta:{version:'3.2.0',engine:'CSS + SVG + Canvas',cliTested:false},
};
mkdirSync(resolve(root,'registry'),{recursive:true});
writeFileSync(resolve(root,'registry/liquid-glass.json'),JSON.stringify(item,null,2)+'\n');
console.log('Created registry/liquid-glass.json (3 self-contained source files).');
