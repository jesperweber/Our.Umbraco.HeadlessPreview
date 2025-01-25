export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Headless Preview Settings",
    alias: "Our.Umbraco.HeadlessPreviewSettings",
    type: 'dashboard',
    js: () => import("./headless-preview-settings.element"),
    meta: {
      label: "Headless Preview Settings",
      pathname: "headless-preview-settings-dashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Settings"
      }
    ],
  }
];
