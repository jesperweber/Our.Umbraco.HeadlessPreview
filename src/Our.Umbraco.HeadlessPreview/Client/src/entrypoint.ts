import type {
  UmbEntryPointOnInit,
  ManifestCondition,
} from "@umbraco-cms/backoffice/extension-api";
import {
  HeadlessPreviewAppliesCondition,
  HEADLESS_PREVIEW_APPLIES_CONDITION_ALIAS,
} from "./condition.js";

// [CHANGE: Umbraco 17 upgrade - registers the custom condition class referenced by the preview option]
// Related: condition.ts, umbraco-package.json
export const onInit: UmbEntryPointOnInit = (_host, extensionRegistry) => {
  const condition: ManifestCondition = {
    type: "condition",
    name: "Headless Preview Applies Condition",
    alias: HEADLESS_PREVIEW_APPLIES_CONDITION_ALIAS,
    api: HeadlessPreviewAppliesCondition,
  };

  extensionRegistry.register(condition);
};
