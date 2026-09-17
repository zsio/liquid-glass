/** Add the React examples page to the standalone workbench deployment. */
import { build } from 'vite';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
await build({
  configFile:false,
  root,
  base:'./',
  publicDir:false,
  resolve:{alias:{'@/components/ui/liquid-glass':resolve(root,'src/components/LiquidGlass.tsx')}},
  build:{
    outDir:resolve(root,'dist-static'),
    emptyOutDir:false,
    assetsDir:'examples/assets',
    rollupOptions:{input:{examples:resolve(root,'examples/index.html')}},
  },
});
