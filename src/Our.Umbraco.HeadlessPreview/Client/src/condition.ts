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

export class HeadlessPreviewAppliesCondition
  extends UmbConditionBase<UmbConditionConfigBase>
  implements UmbExtensionCondition
{
  #unique?: string;

  constructor(
    host: UmbControllerHost,
    args: { config: UmbConditionConfigBase; onChange: (permitted: boolean) => void },
  ) {
    super(host, args);

    // Fail closed until we know the option applies, so a broken option never flashes up.
    this.permitted = false;

    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (workspaceContext) => {
      if (!workspaceContext) return;
      this.observe(workspaceContext.unique, (unique) => {
        this.#unique = unique ?? undefined;
        void this.#evaluate();
      });
    });
  }

  async #evaluate(): Promise<void> {
    const key = this.#unique;
    if (!key) {
      this.permitted = false;
      return;
    }

    try {
      const authContext = await this.getContext(UMB_AUTH_CONTEXT);
      if (!authContext) {
        this.permitted = false;
        return;
      }

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

      if (!response.ok) {
        this.permitted = false;
        return;
      }

      const result = (await response.json()) as { applies: boolean };
      this.permitted = result.applies === true;
    } catch {
      this.permitted = false;
    }
  }
}

export default HeadlessPreviewAppliesCondition;
