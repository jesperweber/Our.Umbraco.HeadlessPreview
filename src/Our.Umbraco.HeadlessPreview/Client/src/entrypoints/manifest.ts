export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Our.Umbraco.HeadlessPreview Entrypoint",
    alias: "Our.Umbraco.HeadlessPreview.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint"),
  }
];
