/** Syntax and packaging checks only; intentionally does not call this a React typecheck. */
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
let ts;try{ts=require('typescript');}catch{const {execSync}=await import('node:child_process');ts=require(path.join(execSync('npm root -g',{encoding:'utf8'}).trim(),'typescript'));}
const root=path.resolve(import.meta.dirname,'..');
const result={tsxSyntax:[],registry:[],scope:'Syntax and registry checks only; runtime results are in workbench-results.json',fullReactTypecheck:false,cliInstalled:false};
for(const name of ['src/components/LiquidGlass.tsx','src/GlassStudio.tsx','src/Icons.tsx','src/hooks/useDraggableGlass.ts','src/hooks/useStudioMedia.ts','src/glass.ts','src/main.tsx']){
 const r=ts.transpileModule(fs.readFileSync(path.join(root,name),'utf8'),{fileName:name,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ESNext},reportDiagnostics:true});
 const diagnostics=(r.diagnostics||[]).map(d=>ts.flattenDiagnosticMessageText(d.messageText,' '));result.tsxSyntax.push({file:name,diagnostics,passed:!diagnostics.length});
}
const item=JSON.parse(fs.readFileSync(path.join(root,'registry/liquid-glass.json'),'utf8'));
const assert=(test,passed)=>{result.registry.push({test,passed});if(!passed)throw new Error(test);};
assert('3 self-contained files',item.files.length===3&&item.files.every(f=>typeof f.content==='string'&&f.content.length>0));
assert('No additional runtime library',item.dependencies.length===0&&item.registryDependencies.length===0);
assert('Engine source identical',item.files[1].content===fs.readFileSync(path.join(root,'src/glass.ts'),'utf8'));
assert('CSS source identical',item.files[2].content===fs.readFileSync(path.join(root,'src/glass.css'),'utf8'));
assert('Component imports local engine and CSS',item.files[0].content.includes("'./glass-engine'")&&item.files[0].content.includes("'./liquid-glass.css'"));
assert('No demonstration media installed by registry',!item.files.some(f=>f.path.includes('/media/')||f.content.includes('data:video')));
fs.writeFileSync(path.join(root,'tests/source-results.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
