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
  docs:'Import LiquidGlass or GlassButton from your configured ui alias + /liquid-glass. Styles and the rendering engine are included automatically. Usage: https://glass.zs.uy/INSTALL.md. Chromium uses enhanced refraction; other browsers use CSS glass.',
  meta:{version:JSON.parse(read('package.json')).version,engine:'CSS + SVG + Canvas'},
};
mkdirSync(resolve(root,'registry'),{recursive:true});
writeFileSync(resolve(root,'registry/liquid-glass.json'),JSON.stringify(item,null,2)+'\n');
const published=resolve(root,'public/r');
mkdirSync(published,{recursive:true});
writeFileSync(resolve(published,'liquid-glass.json'),JSON.stringify(item,null,2)+'\n');
writeFileSync(resolve(published,'registry.json'),JSON.stringify({
  $schema:'https://ui.shadcn.com/schema/registry.json',name:'liquid-glass',homepage:'https://glass.zs.uy',items:[item],
},null,2)+'\n');
writeFileSync(resolve(root,'public/INSTALL.md'),read('INSTALL.md'));
console.log('Built liquid-glass registry and public installation files.');
