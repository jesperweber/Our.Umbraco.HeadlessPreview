import { defineConfig, type Plugin } from "vite";
import { copyFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const OUT_DIR = "../App_Plugins/Our.Umbraco.HeadlessPreview";
const PACKAGE_MANIFEST = "umbraco-package.json";

// Copy the hand-authored umbraco-package.json into the build output so the
// whole package (JS bundles + manifest) ships from a single source of truth.
function copyPackageManifest(): Plugin {
  const src = fileURLToPath(new URL(PACKAGE_MANIFEST, import.meta.url));
  const dest = fileURLToPath(
    new URL(`${OUT_DIR}/${PACKAGE_MANIFEST}`, import.meta.url),
  );
  return {
    name: "copy-umbraco-package-manifest",
    writeBundle() {
      copyFileSync(src, dest);
    },
  };
}

export default defineConfig({
  plugins: [copyPackageManifest()],
  build: {
    lib: {
      entry: {
        dashboard: "src/dashboard.element.ts",
        entrypoint: "src/entrypoint.ts",
      },
      formats: ["es"],
    },
    // Emit straight into the package's App_Plugins folder (served by Umbraco).
    outDir: OUT_DIR,
    // Do not wipe the folder - the manifest is copied in, not generated.
    emptyOutDir: false,
    sourcemap: true,
    rollupOptions: {
      // The backoffice package is provided by Umbraco at runtime - never bundle it.
      external: [/^@umbraco/],
    },
  },
  base: "/App_Plugins/Our.Umbraco.HeadlessPreview/",
});
