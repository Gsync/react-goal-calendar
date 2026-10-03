import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ tsconfigPath: "./tsconfig.build.json", bundleTypes: true }),
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
