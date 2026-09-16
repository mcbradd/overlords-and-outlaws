import { defineConfig } from "vite";
export default defineConfig({
  base: process.env.PAGES_BASE_PATH || "/",
  build: {
    rollupOptions: {
      input: { game: "index.html", proof: "proof/index.html" },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three/"))
            return id.includes("renderers/") ? "three-renderers" : "three-core";
        },
      },
    },
  },
});
