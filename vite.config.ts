import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  resolve: {
    alias: { "@/components/ui/liquid-glass": new URL("./src/components/LiquidGlass.tsx", import.meta.url).pathname },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: { input: { main: "index.html", examples: "examples/index.html" } },
  },
});
