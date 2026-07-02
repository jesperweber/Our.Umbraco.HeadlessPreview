import { LitElement, html, css, nothing } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_AUTH_CONTEXT } from "@umbraco-cms/backoffice/auth";
import { UMB_NOTIFICATION_CONTEXT } from "@umbraco-cms/backoffice/notification";

// [CHANGE: Umbraco 17 upgrade - replaces App_Plugins/.../views/configuration.html (AngularJS)
//  with a Lit element calling the Management API] Related: PreviewApiController.cs, umbraco-package.json
const API_BASE = "/umbraco/management/api/v1/headless-preview";

interface PreviewModeSetting {
  type: string;
  mode: string;
  contentTypes?: string[];
  nodeIds?: string[];
  includeDescendants?: boolean;
}

interface PreviewConfiguration {
  templateUrl: string;
  disabled: boolean;
  previewModeSettings: PreviewModeSetting[];
  configuredFromSettingsFileOrCode: boolean;
}

export default class HeadlessPreviewDashboardElement extends UmbElementMixin(LitElement) {
  static properties = {
    _loading: { state: true },
    _saving: { state: true },
    _showTemplateInfo: { state: true },
    _showModeInfo: { state: true },
    _config: { state: true },
  };

  private _loading = true;
  private _saving = false;
  private _showTemplateInfo = false;
  private _showModeInfo = false;
  private _config?: PreviewConfiguration;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.#loadConfiguration();
  }

  async #request(path: string, init?: RequestInit): Promise<Response> {
    const authContext = await this.getContext(UMB_AUTH_CONTEXT);
    if (!authContext) {
      throw new Error("Could not resolve the backoffice auth context.");
    }

    const config = authContext.getOpenApiConfiguration();
    const token =
      typeof config.token === "function" ? await config.token() : config.token;

    return fetch(`${config.base ?? ""}${path}`, {
      ...init,
      credentials: config.credentials,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(init?.headers ?? {}),
      },
    });
  }

  async #loadConfiguration(): Promise<void> {
    this._loading = true;
    try {
      const response = await this.#request(`${API_BASE}/configuration`);
      if (!response.ok) {
        throw new Error(`Failed to load configuration (${response.status})`);
      }
      this._config = (await response.json()) as PreviewConfiguration;
    } catch (error) {
      await this.#notifyError("Could not load the headless preview configuration");
      // eslint-disable-next-line no-console
      console.error(error);
    } finally {
      this._loading = false;
    }
  }

  async #saveConfiguration(): Promise<void> {
    if (!this._config) return;
    this._saving = true;
    try {
      const response = await this.#request(`${API_BASE}/configuration`, {
        method: "POST",
        body: JSON.stringify(this._config),
      });
      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Save failed (${response.status})`);
      }
      const notification = await this.getContext(UMB_NOTIFICATION_CONTEXT);
      notification?.peek("positive", {
        data: { headline: "Headless Preview", message: "Configuration saved" },
      });
    } catch (error) {
      await this.#notifyError(
        error instanceof Error ? error.message : "Error saving configuration",
      );
    } finally {
      this._saving = false;
    }
  }

  async #notifyError(message: string): Promise<void> {
    const notification = await this.getContext(UMB_NOTIFICATION_CONTEXT);
    notification?.peek("danger", {
      data: { headline: "Headless Preview", message },
    });
  }

  #onTemplateUrlInput(event: Event): void {
    if (!this._config) return;
    this._config = {
      ...this._config,
      templateUrl: (event.target as HTMLInputElement).value,
    };
  }

  #onDisabledChange(event: Event): void {
    if (!this._config) return;
    this._config = {
      ...this._config,
      disabled: (event.target as HTMLInputElement).checked,
    };
  }

  override render() {
    if (this._loading || !this._config) {
      return html`<uui-box><uui-loader></uui-loader></uui-box>`;
    }

    const locked = this._config.configuredFromSettingsFileOrCode;
    const busy = this._saving;

    return html`
      <uui-box headline="Headless Preview Settings">
        ${locked
          ? html`<div class="notice">
              <strong>The settings are loaded from appsettings.json or from code.</strong>
              Because of that the settings can't be configured from the UI.
            </div>`
          : nothing}

        <h4>Template URL</h4>
        <p>
          The template URL defines which URL is opened when you use the headless
          preview option. It can be dynamic by using placeholders.
        </p>
        <uui-button
          look="secondary"
          compact
          label=${this._showTemplateInfo ? "Less info" : "More info"}
          @click=${() => (this._showTemplateInfo = !this._showTemplateInfo)}
        ></uui-button>
        ${this._showTemplateInfo
          ? html`<div class="info">
              <strong>Placeholders</strong>
              <ul>
                <li><code>{hostname}</code> - the assigned domain on the nearest ancestor (or self) matching the culture.</li>
                <li><code>{slug}</code> - the relative path of the page being previewed.</li>
              </ul>
              <strong>Examples</strong>
              <ul>
                <li>https://mysite.com/api/preview?slug={slug}&amp;secret=mySecret</li>
                <li>{hostname}/api/preview?slug={slug}&amp;secret=mySecret</li>
                <li>https://mysite.com/{slug}?preview=true</li>
              </ul>
            </div>`
          : nothing}
        <uui-input
          id="template-url"
          label="Template URL"
          placeholder="https://mysite.com/api/preview?slug={slug}&secret=mySecret"
          .value=${this._config.templateUrl ?? ""}
          ?disabled=${locked || busy}
          @input=${this.#onTemplateUrlInput}
        ></uui-input>

        <h4>Preview Mode Settings</h4>
        <p>
          Preview modes are evaluated in order; the first matching setting wins.
          Configure them in appsettings.json or by code.
        </p>
        <uui-button
          look="secondary"
          compact
          label=${this._showModeInfo ? "Less info" : "More info"}
          @click=${() => (this._showModeInfo = !this._showModeInfo)}
        ></uui-button>
        ${this._showModeInfo
          ? html`<div class="info">
              <ul>
                <li><code>UseHeadlessPreview</code> - uses the headless preview URL (default).</li>
                <li><code>UseStandardPreview</code> - uses the default Umbraco preview.</li>
                <li><code>DisablePreview</code> - no headless preview URL is produced.</li>
              </ul>
            </div>`
          : nothing}
        ${this.#renderModes()}

        <h4>Disable</h4>
        <p>Disables the headless preview entirely and falls back to standard Umbraco preview.</p>
        <uui-toggle
          label="Disable headless preview"
          ?checked=${this._config.disabled}
          ?disabled=${locked || busy}
          @change=${this.#onDisabledChange}
        ></uui-toggle>

        ${locked
          ? nothing
          : html`<div class="actions">
              <uui-button
                look="primary"
                color="positive"
                label="Save configuration"
                state=${busy ? "waiting" : ""}
                ?disabled=${busy}
                @click=${this.#saveConfiguration}
              ></uui-button>
            </div>`}
      </uui-box>
    `;
  }

  #renderModes() {
    const modes = this._config?.previewModeSettings ?? [];
    if (modes.length === 0) {
      return html`<p class="muted"><em>No custom preview mode configured.</em></p>`;
    }
    return html`<uui-table>
      <uui-table-head>
        <uui-table-head-cell>#</uui-table-head-cell>
        <uui-table-head-cell>Type</uui-table-head-cell>
        <uui-table-head-cell>Mode</uui-table-head-cell>
        <uui-table-head-cell>Match</uui-table-head-cell>
      </uui-table-head>
      ${modes.map(
        (m, i) => html`<uui-table-row>
          <uui-table-cell>${i + 1}</uui-table-cell>
          <uui-table-cell>${m.type}</uui-table-cell>
          <uui-table-cell>${m.mode}</uui-table-cell>
          <uui-table-cell>
            ${m.type === "ContentType"
              ? (m.contentTypes ?? []).join(", ")
              : `${(m.nodeIds ?? []).join(", ")}${m.includeDescendants ? " (incl. descendants)" : ""}`}
          </uui-table-cell>
        </uui-table-row>`,
      )}
    </uui-table>`;
  }

  static override styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }
    h4 {
      margin-bottom: var(--uui-size-space-2);
    }
    uui-input {
      width: 100%;
      max-width: 640px;
    }
    .notice {
      background: var(--uui-color-warning);
      color: var(--uui-color-warning-contrast);
      padding: var(--uui-size-space-4);
      border-radius: var(--uui-border-radius);
      margin-bottom: var(--uui-size-space-5);
    }
    .info {
      background: var(--uui-color-surface-alt);
      padding: var(--uui-size-space-3);
      border-radius: var(--uui-border-radius);
      margin: var(--uui-size-space-2) 0;
    }
    .muted {
      color: var(--uui-color-text-alt);
    }
    .actions {
      margin-top: var(--uui-size-space-5);
    }
  `;
}

customElements.define(
  "headless-preview-dashboard",
  HeadlessPreviewDashboardElement,
);
