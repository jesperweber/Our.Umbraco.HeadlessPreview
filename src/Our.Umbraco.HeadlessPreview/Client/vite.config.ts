import { defineConfig } from "vite";

// [CHANGE: Umbraco 17 upgrade - Vite build for the new Lit backoffice client]
// Related: src/dashboard.element.ts, ../App_Plugins/Our.Umbraco.HeadlessPreview/umbraco-package.json
export default defineConfig({
  build: {
    lib: {
      entry: {
        dashboard: "src/dashboard.element.ts",
        entrypoint: "src/entrypoint.ts",
      },
      formats: ["es"],
    },
    // Emit straight into the package's App_Plugins folder (served by Umbraco).
    outDir: "../App_Plugins/Our.Umbraco.HeadlessPreview",
    // Do not wipe the folder - the hand-authored umbraco-package.json lives there.
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      // The backoffice package is provided by Umbraco at runtime - never bundle it.
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/Our.Umbraco.HeadlessPreview/",
});
