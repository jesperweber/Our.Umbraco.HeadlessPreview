import { UMB_ENTITY_IS_NOT_TRASHED_CONDITION_ALIAS as e } from "@umbraco-cms/backoffice/recycle-bin";
const a = [
  {
    name: "Our.Umbraco.HeadlessPreview Entrypoint",
    alias: "Our.Umbraco.HeadlessPreview.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-BdL-zlu2.js")
  }
], s = [
  {
    name: "Headless Preview Settings",
    alias: "Our.Umbraco.HeadlessPreviewSettings",
    type: "dashboard",
    js: () => import("./headless-preview-settings.element-CEI8pv3n.js"),
    meta: {
      label: "Headless Preview Settings",
      pathname: "headless-preview-settings-dashboard"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Settings"
      }
    ]
  }
], t = [
  {
    type: "workspaceAction",
    kind: "default",
    overwrites: "Umb.WorkspaceAction.Document.SaveAndPreview2",
    // Alias of thing you want to overwrite
    alias: "HeadlessPreview.WorkspaceAction.Document.SaveAndPublish",
    name: "Headless Preview Save And Publish Document Workspace Action",
    api: () => import("./save-and-preview.action-CqlzGS2a.js"),
    // Our implementation
    weight: 100,
    meta: {
      look: "default",
      color: "default",
      label: "Headless Save and preview"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Umb.Workspace.Document"
        // Only show for Document workspace
      },
      {
        alias: e
        // Ensure the item is not in trash
      }
    ]
  }
], o = [
  ...a,
  ...s,
  ...t
];
export {
  o as manifests
};
//# sourceMappingURL=our-umbraco-headless-preview.js.map
