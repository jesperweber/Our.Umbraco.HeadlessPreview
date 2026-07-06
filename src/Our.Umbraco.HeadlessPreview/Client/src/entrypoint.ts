import type {
  UmbEntryPointOnInit,
  ManifestCondition,
} from "@umbraco-cms/backoffice/extension-api";
import {
  HeadlessPreviewAppliesCondition,
  HeadlessPreviewNotDisabledCondition,
  HEADLESS_PREVIEW_APPLIES_CONDITION_ALIAS,
  HEADLESS_PREVIEW_NOT_DISABLED_CONDITION_ALIAS,
} from "./condition.js";

// [CHANGE: Umbraco 17 upgrade - registers the custom condition class referenced by the preview option]
// Related: condition.ts, umbraco-package.json
export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {
  const appliesCondition: ManifestCondition = {
    type: "condition",
    name: "Headless Preview Applies Condition",
    alias: HEADLESS_PREVIEW_APPLIES_CONDITION_ALIAS,
    api: HeadlessPreviewAppliesCondition,
  };

  // Gates the core Umbraco "Save and preview" button: when the resolved preview mode is
  // DisablePreview, the whole preview split-button is removed (not just our headless option).
  const notDisabledCondition: ManifestCondition = {
    type: "condition",
    name: "Headless Preview Not Disabled Condition",
    alias: HEADLESS_PREVIEW_NOT_DISABLED_CONDITION_ALIAS,
    api: HeadlessPreviewNotDisabledCondition,
  };

  extensionRegistry.register(appliesCondition);
  extensionRegistry.register(notDisabledCondition);

  // Append the condition to the core Save-and-preview workspace action so it is hidden entirely
  // for DisablePreview documents. Conditions are AND-ed with the action's existing conditions.
  extensionRegistry.appendCondition("Umb.WorkspaceAction.Document.SaveAndPreview", {
    alias: HEADLESS_PREVIEW_NOT_DISABLED_CONDITION_ALIAS,
  });
};
