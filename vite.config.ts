import { defineConfig } from "vite";
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/three/"))
            return id.includes("renderers/") ? "three-renderers" : "three-core";
        },
      },
    },
  },
});
