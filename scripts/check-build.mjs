import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const target = process.argv[2] || 'dist';
if (!['dist', 'dist-static'].includes(target)) throw new Error('Expected dist or dist-static');
const output = resolve(root, target);
const entry = readFileSync(join(root, 'src/main.tsx'), 'utf8');
if (!entry.includes("import GlassStudio from './GlassStudio'") || entry.includes('ReactExample')) throw new Error('Default entry must be the full GlassStudio.');
function walk(dir) { return readdirSync(dir).flatMap(n => { const f = join(dir, n); return statSync(f).isDirectory() ? walk(f) : [f]; }); }
const files = walk(output);
const combined = files.filter(f => /\.(html|js|css)$/.test(f)).map(f => readFileSync(f, 'utf8')).join('\n');
const text = combined.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
for (const marker of ['full-workbench', 'inspector', '材质参数', 'setPointerCapture', 'refraction', 'dispersion']) {
  if (!text.includes(marker)) throw new Error(`Incomplete workbench output: missing ${marker}`);
}
const media = JSON.parse(readFileSync(join(output, 'assets/media.json'), 'utf8'));
for (const item of media) for (const key of ['src', 'thumb', 'poster']) {
  const name = item[key];
  if (name && (!name.startsWith('./assets/') || !existsSync(resolve(output, name)))) throw new Error(`Missing relative resource: ${name}`);
}
if (!existsSync(join(output, 'index.html'))) throw new Error('No index.html');
console.log(`Verified ${target}: full workbench entry, inspector, drag handling, parameters and all media.`);
