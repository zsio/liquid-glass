import { defineConfig } from "vite";

// Full workbench by default. Static export uses dist-static and never overwrites this.
export default defineConfig({ base: "./", build: { outDir: "dist", emptyOutDir: true } });
