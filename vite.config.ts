import { defineConfig } from "vitest/config";
import type { Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";

// The minifier can drop the source @layer statement; it must come first so the
// host app's layer order stays intact when this file is imported before the app's CSS.
function layerOrder(): Plugin {
  return {
    name: "gc-layer-order",
    enforce: "post",
    generateBundle(_, bundle) {
      for (const file of Object.values(bundle)) {
        if (file.type === "asset" && file.fileName === "style.css") {
          file.source = `@layer properties,theme,base,components,utilities;\n${String(file.source)}`;
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ tsconfigPath: "./tsconfig.build.json", bundleTypes: true }),
    layerOrder(),
  ],
  build: {
    lib: {
      entry: "src/index.ts",
      formats: ["es"],
      fileName: "index",
      cssFileName: "style",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime"],
      // Vite strips "use client" from source modules, so add it back to the bundle.
      output: { banner: '"use client";' },
    },
  },
  test: {
    environment: "jsdom",
    include: ["tests/**/*.spec.tsx"],
    setupFiles: ["tests/setup.ts"],
    passWithNoTests: true,
  },
});
