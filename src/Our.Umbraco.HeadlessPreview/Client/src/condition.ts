import { UmbConditionBase } from "@umbraco-cms/backoffice/extension-registry";
import type {
  UmbConditionConfigBase,
  UmbExtensionCondition,
} from "@umbraco-cms/backoffice/extension-api";
import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";

// [CHANGE: Umbraco 17 upgrade - hides the "Headless preview" option for documents where the configured
//  preview mode is not UseHeadlessPreview, instead of letting the option error on click]
// Related: PreviewApiController.cs (preview-mode endpoint), umbraco-package.json
export const HEADLESS_PREVIEW_APPLIES_CONDITION_ALIAS =
  "Our.Umbraco.HeadlessPreview.Condition.Applies";

// Removes the entire preview button (our headless option AND the core Umbraco "Save and preview"
// button) for documents whose resolved preview mode is DisablePreview. Attached to the core
// Umb.WorkspaceAction.Document.SaveAndPreview action in entrypoint.ts via appendCondition.
export const HEADLESS_PREVIEW_NOT_DISABLED_CONDITION_ALIAS =
  "Our.Umbraco.HeadlessPreview.Condition.NotDisabled";

type PreviewModeResult = { applies: boolean; mode: string };

// Shared plumbing for the preview-mode conditions: tracks the open document's unique, fetches the
// preview-mode endpoint, and re-evaluates whenever the document changes. Subclasses translate the
// result into a permitted flag via #permit().
abstract class PreviewModeConditionBase
  extends UmbConditionBase<UmbConditionConfigBase>
  implements UmbExtensionCondition
{
  #unique?: string;
  // Permitted value used before/without a resolved result (fail-open vs fail-closed).
  #defaultPermitted: boolean;

  constructor(
    host: UmbControllerHost,
    args: { config: UmbConditionConfigBase; onChange: (permitted: boolean) => void },
    defaultPermitted: boolean,
  ) {
    super(host, args);

    this.#defaultPermitted = defaultPermitted;
    this.permitted = defaultPermitted;

    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
      if (!workspaceContext) return;
      this.observe(workspaceContext.unique, (unique) => {
        this.#unique = unique ?? undefined;
        void this.#evaluate();
      });
    });
  }

  // Maps a successfully resolved preview mode to the permitted flag.
  protected abstract permit(result: PreviewModeResult): boolean;

  async #evaluate(): Promise<void> {
    const key = this.#unique;
    if (!key) {
      this.permitted = this.#defaultPermitted;
      return;
    }

    const result = await this.#resolvePreviewMode(key);
    this.permitted = result ? this.permit(result) : this.#defaultPermitted;
  }

  async #resolvePreviewMode(key: string): Promise<PreviewModeResult | null> {
    try {
      const authContext = await this.getContext(UMB_AUTH_CONTEXT);
      if (!authContext) return null;

      const config = authContext.getOpenApiConfiguration();
      const token =
        typeof config.token === "function" ? await config.token() : config.token;

      const response = await fetch(
        `${config.base ?? ""}/umbraco/management/api/v1/headless-preview/preview-mode?key=${encodeURIComponent(key)}`,
        {
          credentials: config.credentials,
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) return null;

      return (await response.json()) as PreviewModeResult;
    } catch {
      return null;
    }
  }
}

export class HeadlessPreviewAppliesCondition extends PreviewModeConditionBase {
  constructor(
    host: UmbControllerHost,
    args: { config: UmbConditionConfigBase; onChange: (permitted: boolean) => void },
  ) {
    // Fail closed until we know the option applies, so a broken option never flashes up.
    super(host, args, false);
  }

  protected permit(result: PreviewModeResult): boolean {
    return result.applies === true;
  }
}

export class HeadlessPreviewNotDisabledCondition extends PreviewModeConditionBase {
  constructor(
    host: UmbControllerHost,
    args: { config: UmbConditionConfigBase; onChange: (permitted: boolean) => void },
  ) {
    // Fail open: this gates the core "Save and preview" button, so a network glitch or an unknown
    // document must never strip it. We only remove it when the server explicitly says DisablePreview.
    super(host, args, true);
  }

  protected permit(result: PreviewModeResult): boolean {
    return result.mode !== "DisablePreview";
  }
}

export default HeadlessPreviewAppliesCondition;
