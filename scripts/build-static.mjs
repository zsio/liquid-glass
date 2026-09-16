/** Builds a dependency-free deploy folder. No CDN, base64 media or network needed.
 * The checked-in lib/glass.js is the compiled copy of src/glass.ts.
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const out=resolve(root,'dist-static');
rmSync(out,{recursive:true,force:true});mkdirSync(resolve(out,'assets'),{recursive:true});
cpSync(resolve(root,'public/assets'),resolve(out,'assets'),{recursive:true});
const read=p=>readFileSync(resolve(root,p),'utf8');
const catalog=JSON.parse(read('public/assets/media.json'));
for(const item of catalog){
 for(const key of ['src','poster','thumb']) if(item[key]){
  if(!item[key].startsWith('./assets/')||item[key].includes('..',2))throw new Error(`Expected safe relative path: ${item[key]}`);
  if(!statSync(resolve(out,item[key])).isFile())throw new Error(`Missing media: ${item[key]}`);
 }
}
writeFileSync(resolve(out,'assets/media.js'),`// Edit this catalog to use different local media. Paths are relative to index.html.\nwindow.LIQUID_GLASS_MEDIA = ${JSON.stringify(catalog,null,2)};\n`);
writeFileSync(resolve(out,'assets/glass.css'),read('src/glass.css'));
writeFileSync(resolve(out,'assets/studio.css'),read('src/demo.css'));
const engine=read('lib/glass.js').replace(/^export /gm,'');
writeFileSync(resolve(out,'assets/app.js'),`(()=>{\n${engine}\nconst MEDIA_ASSETS=window.LIQUID_GLASS_MEDIA;\n${read('src/demo.js')}\n})();\n`);
writeFileSync(resolve(out,'index.html'),`<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><meta name="description" content="浅色液态玻璃材质与控件实验。壁纸和动态视频使用本地相对路径。"><title>Liquid Glass · Light Studio</title><link rel="icon" type="image/svg+xml" href="./assets/favicon.svg"><link rel="stylesheet" href="./assets/glass.css"><link rel="stylesheet" href="./assets/studio.css"><script defer src="./assets/media.js"></script><script defer src="./assets/app.js"></script></head><body>${read('src/demo-body.html')}</body></html>\n`);
writeFileSync(resolve(out,'assets/favicon.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="4" y="4" width="24" height="24" rx="8" fill="#e4e9ef" stroke="#738198"/><rect x="8" y="8" width="16" height="16" rx="5" fill="#f5f7fb" stroke="#aab7c9"/></svg>\n');
writeFileSync(resolve(out,'_headers'),`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
/
  Cache-Control: no-cache
/index.html
  Cache-Control: no-cache
/assets/app.js
  Cache-Control: no-cache
/assets/media.js
  Cache-Control: no-cache
/assets/glass.css
  Cache-Control: no-cache
/assets/studio.css
  Cache-Control: no-cache
/assets/wallpapers/*
  Cache-Control: public, max-age=3600, must-revalidate
/assets/thumbnails/*
  Cache-Control: public, max-age=3600, must-revalidate
/assets/posters/*
  Cache-Control: public, max-age=3600, must-revalidate
/assets/videos/*
  Cache-Control: public, max-age=3600, must-revalidate
`);
writeFileSync(resolve(out,'404.html'),'<html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>404</title><body style="font:16px system-ui;padding:3rem"><h1>404</h1><p>未找到文件。请确认 index.html 与 assets 文件夹一同部署，并保留文件名和路径。</p></body></html>');
for(const name of ['DEPLOY.md','ASSETS.md','TESTING.md'])cpSync(resolve(root,name),resolve(out,name));
function walk(dir){return readdirSync(dir).flatMap(n=>{const p=resolve(dir,n);return statSync(p).isDirectory()?walk(p):[p];});}
const files=walk(out),total=files.reduce((s,p)=>s+statSync(p).size,0);
console.log(`dist-static: ${files.length} files, ${(total/1024/1024).toFixed(2)} MiB; largest ${(Math.max(...files.map(p=>statSync(p).size))/1024/1024).toFixed(2)} MiB`);
